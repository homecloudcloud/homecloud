#!/usr/bin/python3
import json
import subprocess
import os
import requests
from typing import Dict, Any
from datetime import datetime, timedelta

class TailscaleAuth:
    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.token = None
        self.token_expiry = None

    def get_access_token(self) -> str:
        if self.token and self.token_expiry and datetime.now() < self.token_expiry:
            return self.token
    
        auth_url = 'https://api.tailscale.com/api/v2/oauth/token'
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'grant_type': 'client_credentials'
        }
    
        try:
            #print("Requesting OAuth token...")
            response = requests.post(auth_url, data=data)
            #print(f"OAuth Response Status: {response.status_code}")
            
            response.raise_for_status()
            token_data = response.json()
            
            self.token = token_data['access_token']
            expires_in = int(token_data.get('expires_in', 3600))
            self.token_expiry = datetime.now() + timedelta(seconds=expires_in - 60)
            
            #print("Successfully obtained OAuth token")
            return self.token
        except requests.RequestException as e:
            #print(f"OAuth Error: {str(e)}")
            if hasattr(e.response, 'text'):
                print(f"OAuth Error Response: {e.response.text}")
            raise Exception(f"Failed to get OAuth token: {str(e)}")
    

def check_tailscale_status() -> Dict[str, str]:
    try:
        result = subprocess.run(
            ['omv-rpc', '-u', 'admin', 'Homecloud', 'getTailscaleStatus'],
            capture_output=True,
            text=True,
            check=True
        )
        
        status_data = json.loads(result.stdout)
        if status_data.get('status') != 'Up':
            return {'status': 'VPN down'}
        return {'status': 'Up'}
    except subprocess.CalledProcessError as e:
        return {'status': 'Error', 'message': f'Failed to check Tailscale status: {str(e)}'}
    except json.JSONDecodeError:
        return {'status': 'Error', 'message': 'Invalid JSON response from Tailscale status check'}

def remove_comments(json_str: str) -> str:
    """Remove comments from JSON string."""
    import re
    # Remove single-line comments
    json_str = re.sub(r'//.*$', '', json_str, flags=re.MULTILINE)
    # Remove trailing commas
    json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
    # Remove empty lines
    json_str = '\n'.join(line for line in json_str.splitlines() if line.strip())
    return json_str

def check_and_enable_funnel(auth: TailscaleAuth, device_id: str) -> Dict[str, Any]:
    try:
        token = auth.get_access_token()
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
        }
        
        # Get current ACL
        acl_url = 'https://api.tailscale.com/api/v2/tailnet/-/acl'
        response = requests.get(acl_url, headers=headers)
        response.raise_for_status()
        
        # Debug print
        #print(f"ACL Response Status: {response.status_code}")
        
        try:
            # Clean the response text by removing comments
            clean_json = remove_comments(response.text)
           # print("Cleaned JSON:", clean_json)  # Debug print
            acl_data = json.loads(clean_json)
        except json.JSONDecodeError as e:
           # print(f"Failed to parse ACL response: {str(e)}")
            print(f"Full response content: {response.text}")
            return {
                'status': 'Error',
                'message': f'Invalid JSON in ACL response: {str(e)}'
            }
        
        # Initialize nodeAttrs if it doesn't exist
        if 'nodeAttrs' not in acl_data:
            acl_data['nodeAttrs'] = []
        elif not isinstance(acl_data['nodeAttrs'], list):
            acl_data['nodeAttrs'] = []
        
        # Clean device_id - take only the first IP if multiple are returned
        device_id = device_id.split('\n')[0].strip()
        
        # Check existing policies
        member_funnel_exists = False
        device_funnel_exists = False
        
        for attr in acl_data['nodeAttrs']:
            if isinstance(attr, dict):
                if (attr.get('target') == ['autogroup:member'] and 
                    attr.get('attr') == ['funnel']):
                    member_funnel_exists = True
                
                if (attr.get('target') == [device_id] and 
                    attr.get('attr') == ['funnel']):
                    device_funnel_exists = True
        
        # Add required policies
        modified = False
        
        if not member_funnel_exists:
            acl_data['nodeAttrs'].append({
                'target': ['autogroup:member'],
                'attr': ['funnel']
            })
            modified = True
        
        if not device_funnel_exists:
            acl_data['nodeAttrs'].append({
                'target': [device_id],
                'attr': ['funnel']
            })
            modified = True
        
        if modified:
            # Debug print
           # print("Updating ACL with:", json.dumps(acl_data, indent=2))
            
            # Update ACL
            response = requests.post(acl_url, headers=headers, json=acl_data)
            response.raise_for_status()
            
            # Debug print
            #print(f"Update Response Status: {response.status_code}")
            #print(f"Update Response Content: {response.text[:200]}...")
            
            return {
                'status': 'Success',
                'message': 'Funnel policies added to ACL'
            }
        
        return {
            'status': 'Success',
            'message': 'Funnel policies already exist'
        }
    
    except requests.RequestException as e:
        #print(f"Request Exception: {str(e)}")
        if hasattr(e.response, 'text'):
            print(f"Error Response: {e.response.text}")
        return {
            'status': 'Error',
            'message': f'Failed to configure Tailscale ACL: {str(e)}'
        }
    except Exception as e:
       #print(f"Unexpected Exception: {str(e)}")
        return {
            'status': 'Error',
            'message': str(e)
        }

def create_funnel(source_port: int, destination_port: int) -> Dict[str, str]:
    try:
        # Create the funnel
        if destination_port == 8000:
            # For paperless-ngx, use tls-terminated-tcp
            subprocess.run(
                ['tailscale', 'funnel', '--bg', '--tls-terminated-tcp', str(source_port),
                 f'tcp://localhost:{destination_port}'],
                check=True
            )
        else:
            # For other services, use regular tcp
            subprocess.run(
                ['tailscale', 'funnel', '--bg', '--tcp', str(source_port),
                 f'tcp://localhost:{destination_port}'],
                check=True
            )

        # Only update immich.json and restart service if destination_port is 2284
        if destination_port == 2284:
            # Update immich.json file
            try:
                update_response = subprocess.run(
                    ['curl', '--insecure', '--request', 'POST', 
                     'https://127.0.0.1:5000/update_immich_JSON'],
                    check=True,
                    capture_output=True,
                    text=True
                )
                #print(f"Update immich.json response: {update_response.stdout}")
            except subprocess.CalledProcessError as e:
                return {
                    'status': 'Error',
                    'message': f'Funnel created but failed to update immich.json: {str(e)}'
                }

            # Restart immich.service
            try:
                subprocess.run(
                    ['systemctl', 'restart', 'immich.service'],
                    check=True
                )
            except subprocess.CalledProcessError as e:
                return {
                    'status': 'Error',
                    'message': f'Funnel created and immich.json updated, but failed to restart service: {str(e)}'
                }

            return {
                'status': 'Success',
                'message': f'Funnel created.'
                          f'When enabled first time: It can take up-to 30 minutes for app to be accessible on Internet. Restart your Immich app installed on Phone. '
            }
        else:
            # For non-immich ports, just return success for funnel creation
            # Update env file for paperless
            try:
                if destination_port == 8000:
                    update_response = subprocess.run(
                        ['curl', '--insecure', '--request', 'POST', 
                        'https://127.0.0.1:5000/update_paperless-ngx_env'],
                        check=True,
                        capture_output=True,
                        text=True
                    )
                    #print(f"Update paperless env response: {update_response.stdout}")
                    subprocess.run(
                        ['systemctl', 'restart', 'paperless.service'],
                        check=True
                    )
            except subprocess.CalledProcessError as e:
                return {
                    'status': 'Error',
                    'message': f'Funnel created but failed to update config file: {str(e)}'
                }
            return {
                'status': 'Success',
                'message': f'Funnel created.'
                           f'When enabled first time: It can take up-to 30 minutes for app to be accessible on Internet. Restart your paperless app installed on Phone. '
            }

    except subprocess.CalledProcessError as e:
        return {'status': 'Error', 'message': f'Failed to create funnel: {str(e)}'}


def get_tailscale_device_id() -> str:
    try:
        result = subprocess.run(
            ['tailscale', 'ip'],
            capture_output=True,
            text=True,
            check=True
        )
        # Strip any whitespace and newlines from the output
        device_id = result.stdout.strip()
        if not device_id:
            raise Exception("No Tailscale IP found")
        return device_id
    except subprocess.CalledProcessError as e:
        raise Exception(f"Failed to get Tailscale IP: {str(e)}")

def get_oauth_credentials() -> tuple[str, str]:
    """Read OAuth credentials from /root/.tsinfo file"""
    try:
        with open('/root/.tsinfo', 'r') as f:
            credentials = {}
            for line in f:
                line = line.strip()
                if '=' in line:
                    key, value = line.split('=', 1)
                    # Remove quotes and extra whitespace
                    value = value.strip().strip('"\'')
                    credentials[key] = value
        
        client_id = credentials.get('CLIENT_ID')
        client_secret = credentials.get('CLIENT_SECRET')
        
        if not client_id or not client_secret:
            raise Exception("Missing CLIENT_ID or CLIENT_SECRET ")
            
        return client_id, client_secret
    except FileNotFoundError:
        raise Exception("Credentials not found")
    except Exception as e:
        raise Exception(f"Failed to read credentials: {str(e)}")


def main(source_port: int, destination_port: int) -> Dict[str, Any]:
    # Check Tailscale status
    status = check_tailscale_status()
    if status['status'] != 'Up':
        return status
    
    try:
        # Get OAuth credentials from file
        client_id, client_secret = get_oauth_credentials()
        
        # Get the device ID automatically
        device_id = get_tailscale_device_id()
        
        # Initialize OAuth client
        auth = TailscaleAuth(client_id, client_secret)
        
        # Check and enable funnel if needed
        funnel_status = check_and_enable_funnel(auth, device_id)
        if funnel_status['status'] != 'Success':
            return funnel_status
        
        # Create the funnel
        return create_funnel(source_port, destination_port)
    except Exception as e:
        return {
            'status': 'Error',
            'message': str(e)
        }


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 3:
        print("Usage: script.py source_port destination_port")
        sys.exit(1)
    
    try:
        source_port = int(sys.argv[1])
        destination_port = int(sys.argv[2])
        print(f"Configuring Internet connectivity for this app for non VPN users")
        
        result = main(source_port, destination_port)
        print("Result:", json.dumps(result, indent=2))
        
        if result['status'] == 'Error':
            sys.exit(1)
        sys.exit(0)
        
    except ValueError:
        print("Error: Ports must be integers")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        sys.exit(1)
