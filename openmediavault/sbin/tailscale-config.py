#!/usr/bin/env python3
import requests
import json
import sys
import os
import argparse
import shutil

def error_exit(message):
    print(f"ERROR: {message}")
    sys.exit(0)

def validate_input(param_name, param_value):
    if any(char in param_value for char in ['\'', '"', '`']):
        error_exit(f"Error: {param_name} cannot contain the characters ' (single quote), \" (double quote), or ` (backtick).")
    return param_value.strip()

def save_client_info(client_id, client_secret, tailnet_name):
    """Store client info in /root/.tsinfo with 600 permissions"""
    try:
        with open('/root/.tsinfo', 'w') as f:
            f.write(f'CLIENT_ID="{client_id}"\n')
            f.write(f'CLIENT_SECRET="{client_secret}"\n')
            f.write(f'CLIENT_NAME="{tailnet_name}"\n')
        os.chmod('/root/.tsinfo', 0o600)
    except Exception as e:
        error_exit(f"Failed to save client info: {str(e)}")

def save_token_info(client_id, client_secret, tailnet_name):
    """Save token information to /var/lib/tailscale/.token"""
    try:
        with open('/var/lib/tailscale/.token', 'w') as f:
            f.write(f"{client_id}\n")
            f.write(f"{client_secret}\n")
            f.write(f"{tailnet_name}\n")
    except Exception as e:
        error_exit(f"Failed to save token info: {str(e)}")

def configure_tailscale(client_id, client_secret, tailnet_name):
    print("Starting tailscale configuration")
    
    # Validate inputs
    client_id = validate_input("Client ID", client_id)
    client_secret = validate_input("Client Secret", client_secret)
    tailnet_name = validate_input("Tailnet Name", tailnet_name)
    
    # Save client info
    save_client_info(client_id, client_secret, tailnet_name)
    save_token_info(client_id, client_secret, tailnet_name)
    
    print("Generating API access token")
    try:
        # Generate API token
        token_response = requests.post(
            'https://api.tailscale.com/api/v2/oauth/token',
            data={
                'client_id': client_id,
                'client_secret': client_secret
            }
        )
        
        if token_response.status_code != 200:
            if "API token invalid" in token_response.text:
                error_exit("Error: The Client ID and Client Secret you entered are invalid. Please verify your credentials and try again.")
            error_exit(f"Failed to generate API token. Status: {token_response.status_code}, Response: {token_response.text}")
        
        token_data = token_response.json()
        if 'access_token' not in token_data:
            error_exit("Invalid API token response")
        
        access_token = token_data['access_token']
        print("API access token generated successfully")
        
        # Update ACL configuration
        print("Updating tailscale access control file")
        acl_data = {
            "acls": [
                {
                    "action": "accept",
                    "ports": ["*:*"],
                    "users": ["*"]
                }
            ],
            "groups": {
                "group:example": [
                    "user1@example.com",
                    "user5@example.com"
                ]
            },
            "hosts": {
                "example-host-1": "100.100.100.100"
            },
            "tagOwners": {
                "tag:homecloud": ["autogroup:admin"]
            }
        }
        
        acl_response = requests.post(
            f'https://api.tailscale.com/api/v2/tailnet/{tailnet_name}/acl',
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            },
            json=acl_data
        )
        
        if acl_response.status_code != 200:
            error_exit(f"Failed to update ACL configuration: {acl_response.text}")
        
        print("Tailscale access control file updated successfully")
        
        # Bring tailscale up
        print("Bringing tailscale up")
        import subprocess
        cmd = [
            'tailscale', 'up',
            '--advertise-exit-node',
            '--advertise-tags=tag:homecloud',
            '--accept-routes',
            f'--auth-key={client_secret}?ephemeral=false'
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            error_exit(f"Failed to bring up tailscale: {result.stderr}")
        
        # Check Tailscale status
        status_result = subprocess.run(['/sbin/check_tailscale_status.sh'], 
                                     capture_output=True, text=True)
        if status_result.returncode == 0:
            try:
                status_data = json.loads(status_result.stdout)
                if status_data.get('status') == 'Up':
                    print("Tailscale has been configured successfully")
                    
                    # Generate certificates if tailscale is up
                    domain_cmd = "tailscale status --json | jq -r .Self.DNSName | sed 's/\\.$//'"
                    domain_name = subprocess.check_output(domain_cmd, shell=True, text=True).strip()
                    
                    if domain_name:
                        print(f"Generating certificates for {domain_name}")
                        cert_result = subprocess.run(['tailscale', 'cert', domain_name], 
                                                   capture_output=True, text=True)
                        if cert_result.returncode == 0:
                            try:
                                # Move certificates using shutil.move
                                print("Moving certificates to system directories...")
                                shutil.move(f"{domain_name}.key", f"/etc/ssl/private/{domain_name}.key")
                                shutil.move(f"{domain_name}.crt", f"/etc/ssl/certs/{domain_name}.crt")
                                
                                # Set proper permissions
                                os.chmod(f"/etc/ssl/private/{domain_name}.key", 0o600)
                                os.chmod(f"/etc/ssl/certs/{domain_name}.crt", 0o644)
                                
                                print("Certificate setup completed successfully")
                                
                                # Update Traefik configuration
                                traefik_url = f"https://127.0.0.1:5000/update_traefik_config"
                                traefik_params = {
                                    "cert_file": f"/etc/ssl/certs/{domain_name}.crt",
                                    "key_file": f"/etc/ssl/private/{domain_name}.key"
                                }
                                traefik_response = requests.post(traefik_url, 
                                                            params=traefik_params, 
                                                            verify=False)
                                
                                if traefik_response.ok and traefik_response.json().get('success'):
                                    print("Traefik configuration updated successfully")
                                else:
                                    print(f"Failed to update Traefik configuration: {traefik_response.text}") 
                            except Exception as e:
                                error_exit(f"Failed to move certificates: {str(e)}")
                        else:
                            print("Failed to generate certificates")
                    else:
                        print("Failed to get domain name from Tailscale status")
                else:
                    print(f"Tailscale configuration failed. Current status: {status_data.get('status')}")
            except json.JSONDecodeError:
                error_exit("Failed to parse Tailscale status")
        else:
            error_exit("Error checking Tailscale status")
            
    except requests.exceptions.RequestException as e:
        error_exit(f"Network error occurred: {str(e)}")
    except Exception as e:
        error_exit(f"An unexpected error occurred: {str(e)}")

def main():
    parser = argparse.ArgumentParser(description='Configure Tailscale with provided credentials')
    parser.add_argument('--client-id', required=True, help='Tailscale Client ID')
    parser.add_argument('--client-secret', required=True, help='Tailscale Client Secret')
    parser.add_argument('--tailnet-name', required=True, help='Tailscale Tailnet Name')
    
    args = parser.parse_args()
    
    configure_tailscale(args.client_id, args.client_secret, args.tailnet_name)

if __name__ == "__main__":
    main()
