#!/usr/bin/env python3

import requests
import yaml
import json
import sys
from typing import Dict, Optional, Tuple
import subprocess


def get_current_version() -> Optional[str]:
    """Get current version from docker-compose file"""
    try:
        with open('/etc/vault-warden/docker-compose-vaultwarden.yml', 'r') as file:
            compose_data = yaml.safe_load(file)
            
        # Extract version from image tag
        image = compose_data['services']['vaultwarden']['image']
        version = image.split(':')[-1]
        
        return version
            
    except FileNotFoundError:
        print("Docker compose file not found", file=sys.stderr)
        return None
    except (yaml.YAMLError, KeyError) as e:
        print(f"Error parsing docker compose file: {str(e)}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"Unexpected error getting version: {str(e)}", file=sys.stderr)
        return None

def get_latest_tag() -> Tuple[Optional[str], str]:
    """Get latest version using omv-rpc command"""
    try:
        # Run omv-rpc command
        cmd = ["omv-rpc", "-u", "admin", "Homecloud", "vaultwarden_get_latest_version"]
        result = subprocess.run(cmd, 
                              capture_output=True, 
                              text=True, 
                              check=True)
        
        # Parse JSON response
        response = json.loads(result.stdout)
        
        # Extract version from response
        if "version" in response:
            return response["version"], "success"
        else:
            return None, "No version found in response"
            
    except subprocess.CalledProcessError as e:
        return None, f"Command execution failed: {str(e)}"
    except json.JSONDecodeError as e:
        return None, f"Failed to parse JSON response: {str(e)}"
    except Exception as e:
        return None, f"Error checking version: {str(e)}"

def compare_versions(current: str, latest: str) -> bool:
    """
    Compare version numbers
    Returns True if update is available, False otherwise
    """
    try:
        def parse_version(version: str) -> tuple:
            # Remove 'v' prefix if present
            version = version.lstrip('v')
            # Convert version string to tuple of integers
            return tuple(map(int, version.split('.')))
            
        current_parts = parse_version(current)
        latest_parts = parse_version(latest)
        
        return latest_parts > current_parts
    except Exception:
        return False

def check_updates() -> Dict[str, str]:
    """Main function to check for updates"""
    try:
        deployed_version = get_current_version()
        if not deployed_version:
            return {
                "status": "Error",
                "available_version": "Unable to get current version from docker-compose",
                "deployed_version": "Unknown"
            }
            
        latest_version, error_message = get_latest_tag()
        if not latest_version:
            return {
                "status": "Error",
                "available_version": error_message,
                "deployed_version": deployed_version
            }
            
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
        
    except Exception as e:
        return {
            "status": "Error",
            "available_version": f"Error checking updates: {str(e)}",
            "deployed_version": "Unknown"
        }

if __name__ == "__main__":
    result = check_updates()
    print(json.dumps(result))
