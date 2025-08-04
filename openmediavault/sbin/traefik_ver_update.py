#!/usr/bin/env python3

import sys
import os
import json
import subprocess
import shutil
import requests
import yaml
import string
import time
from typing import Dict, Optional
from datetime import datetime
import urllib3


# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def wait_for_service_ready(timeout=300, interval=10) -> bool:
    """
    Wait for traefik service to be ready
    timeout: maximum time to wait in seconds
    interval: time between checks in seconds
    """
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        try:
            cmd = ['omv-rpc', '-u', 'admin', 'Homecloud', 'getTraefikServiceStatus']
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0 and result.stdout.strip():
                status_info = json.loads(result.stdout.strip())
                if isinstance(status_info, dict) and status_info.get('status') == 'Running':
                    return True
            
            time.sleep(interval)
            
        except Exception:
            time.sleep(interval)
    
    return False



def get_service_status() -> Dict[str, str]:
    """Get traefik service status"""
    default_status = {"status": "Not deployed"}
    
    try:
        cmd = ['omv-rpc', '-u', 'admin', 'Homecloud', 'getTraefikServiceStatus']
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0 and result.stdout.strip():
            try:
                status = json.loads(result.stdout.strip())
                if isinstance(status, dict):
                    return status
            except json.JSONDecodeError:
                pass
    except Exception:
        pass
    
    return default_status

def validate_version(version: str) -> bool:
    """Validate version against GitHub tags"""
    try:
        # Add 'v' prefix for GitHub API
        github_version = f"v{version}"
        
        url = "https://api.github.com/repos/traefik/traefik/tags"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        tags = response.json()
        
        return any(tag['name'] == github_version for tag in tags)
    except Exception:
        return False


def update_yaml_config() -> bool:
    """Update YAML configuration"""
    try:
        response = requests.post(
            "https://127.0.0.1:5000/update_YAML",
            verify=False
        )
        return response.status_code == 200
    except Exception:
        return False

def update_compose_image(file_path: str, version: str) -> bool:
    """Update image version in compose file"""
    try:
        with open(file_path, 'r') as f:
            compose_data = yaml.safe_load(f)
        
        if not compose_data or not isinstance(compose_data, dict):
            return False
            
        services = compose_data.get('services', {})
        if not services or not isinstance(services, dict):
            return False
            
        webserver = services.get('traefik', {})
        if not webserver or not isinstance(webserver, dict):
            return False
            
        current_image = webserver.get('image', '')
        if not current_image:
            return False
            
        # Set the base image name and update with version
        image_name = "traefik"
        compose_data['services']['traefik']['image'] = f"{image_name}:v{version}"
        
        with open(file_path, 'w') as f:
            yaml.dump(compose_data, f)
        return True
    except Exception as e:
        print(f"Debug - Update compose error: {str(e)}")  # For debugging
        return False

def pull_docker_images() -> bool:
    """Pull latest Docker images"""
    try:
        subprocess.run(
            ['docker', 'compose', '-f', '/etc/traefik/docker-compose-traefik.yaml', 'pull'],
            check=True
        )
        return True
    except Exception:
        return False

def get_current_version() -> str:
    """Get currently deployed version"""
    try:
        cmd = ['omv-rpc', '-u', 'admin', 'Homecloud', 'traefik_check_version']
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0 and result.stdout.strip():
            try:
                version_info = json.loads(result.stdout.strip())
                if isinstance(version_info, dict):
                    return version_info.get('deployed_version', '').lstrip('v')
            except json.JSONDecodeError:
                pass
    except Exception:
        pass
    
    return ''

    
def deploy_traefik(version: str, user: str = None, password: str = None) -> str:
    """Main deployment function"""
    try:
        if version.startswith('v'):
            return "error: Version should not start with 'v'"
            
        # Get current status
        status_info = get_service_status()
        if not isinstance(status_info, dict):
            return "error: Invalid service status response"
            
        status = status_info.get('status', 'Not deployed')
        is_new_deployment = status == "Not deployed"
        
        # Version update
        current_version = get_current_version()
        if current_version and current_version == version:
            return "error: Same version"

        # Stop service
        subprocess.run(['systemctl', 'stop', 'traefik.service'], check=False)

        # Backup current compose file
        if os.path.exists('/etc/traefik/docker-compose-traefik.yaml'):
            backup_path = f'/etc/traefik/docker-compose-traefik.yaml.v{current_version or "backup"}'
            shutil.copy2('/etc/traefik/docker-compose-traefik.yaml', backup_path)

        if not update_compose_image('/etc/traefik/docker-compose-traefik.yaml', version):
            return "error: Failed to update compose file"

        # Common steps for both paths
        #if not update_yaml_config():
        #    return "error: Failed to update YAML config"

        if not pull_docker_images():
            return "error: Failed to pull Docker images"

        

        # Start service
        subprocess.run(['systemctl', 'start', 'traefik.service'], check=True)
         
        
        print ("Deployed successfully. Go to Access page to login") 
            

        return "success"

    except Exception as e:
        return f"error: {str(e)}"

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Deploy or update Traefik')
    parser.add_argument('version', help='Version number (without v prefix)')
    parser.add_argument('--user', help='Admin username (optional)', default=None)
    parser.add_argument('--password', help='Admin password (optional)', default=None)
    
    args = parser.parse_args()
    
    print(deploy_traefik(args.version, args.user, args.password))

if __name__ == "__main__":
    main()
