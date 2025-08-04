#!/usr/bin/env python3

import json
import subprocess
import requests
import urllib3
from typing import Dict, Optional

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def get_api_endpoint() -> Optional[str]:
    """Get Paperless API endpoint using omv-rpc"""
    try:
        cmd = ['omv-rpc', '-u', 'admin', 'Homecloud', 'getPaperlessServiceStatus']
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            status_data = json.loads(result.stdout)
            return status_data.get('api_endpoint')
    except Exception:
        return None
    return None

def get_remote_version(api_endpoint: str) -> Optional[Dict]:
    """Get remote version info from Paperless API"""
    try:
        version_url = f"{api_endpoint}api/remote_version/"
        response = requests.get(version_url, timeout=10, verify=False)
        response.raise_for_status()
        result = response.json()
        
        # If version is 0.0.0, try to get version from docker-compose.yml
        if result.get('version') == '0.0.0':
            try:
                import yaml
                with open('/etc/paperless/docker-compose.yml', 'r') as f:
                    compose_data = yaml.safe_load(f)
                    image = compose_data['services']['webserver']['image']
                    if ':' in image:
                        version = image.split(':')[-1]
                        result['version'] = f'v{version}'
            except Exception:
                pass
        
        return result
    except Exception:
        return None

def get_latest_github_tag() -> Optional[str]:
    """Get latest tag from OpenMediaVault RPC"""
    try:
        # Run omv-rpc command
        cmd = ["omv-rpc", "-u", "admin", "Homecloud", "paperless_get_latest_version"]
        result = subprocess.run(cmd, 
                              capture_output=True, 
                              text=True, 
                              check=True)
        
        # Parse JSON response
        response = json.loads(result.stdout)
        
        # Extract version from response
        if "version" in response:
            return response["version"]
        return None
            
    except subprocess.CalledProcessError:
        return None
    except json.JSONDecodeError:
        return None
    except Exception:
        return None

def compare_versions(current: str, latest: str) -> bool:
    """
    Compare version numbers
    Returns True if update is available, False otherwise
    """
    try:
        def parse_version(version: str) -> tuple:
            # Convert version string to tuple of integers
            return tuple(map(int, version.split('.')))

        current_parts = parse_version(current)
        latest_parts = parse_version(latest)

        return latest_parts > current_parts
    except Exception:
        return False

def remove_port_from_url(url):
    """Remove port from URL if present"""
    from urllib.parse import urlparse, urlunparse
    
    parsed = urlparse(url)
    # Create new URL without port
    new_parsed = parsed._replace(netloc=parsed.netloc.split(':')[0])
    return urlunparse(new_parsed)


def check_paperless_version() -> Dict:
    """Main function to check Paperless version"""
    result = {
        "status": "",
        "available_version": "",
        "deployed_version": ""
    }

    # Get API endpoint
    api_endpoint = get_api_endpoint()
    if not api_endpoint:
        result["status"] = "Error - Check if Paperless-ngx is deployed"
        return result

    # Get remote version info
    version_info = get_remote_version(api_endpoint)
    if not version_info:
        api_endpoint_without_port = remove_port_from_url(api_endpoint)
        # Only retry if the URL actually changed (had a port)
        if api_endpoint_without_port != api_endpoint:
            version_info = get_remote_version(api_endpoint_without_port)
        if not version_info:
            result["status"] = "Error - Check if Paperless-ngx is deployed"
            return result

    # Set deployed version
    deployed_version = version_info.get('version', '').lstrip('v')
    result["deployed_version"] = deployed_version

    # Check update status
#    update_available = version_info.get('update_available', False)
    
    latest_version = get_latest_github_tag()
    # Compare versions
    if compare_versions(deployed_version, latest_version):
       status = "Update-Available"
    else:
       status = "No-Updates"
    return {
        "status": status,
        "available_version": latest_version,
        "deployed_version": deployed_version
    }


def main():
    """Main entry point"""
    try:
        version_info = check_paperless_version()
        print(json.dumps(version_info))
    except Exception:
        error_result = {
            "status": "Error - Check if Paperless-ngx is deployed",
            "available_version": "",
            "deployed_version": ""
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    main()

