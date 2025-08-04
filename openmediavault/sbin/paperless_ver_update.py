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
    Wait for paperless service to be ready
    timeout: maximum time to wait in seconds
    interval: time between checks in seconds
    """
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        try:
            cmd = ['omv-rpc', '-u', 'admin', 'Homecloud', 'getPaperlessServiceStatus']
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
    """Get Paperless service status"""
    default_status = {"status": "Not deployed"}
    
    try:
        cmd = ['omv-rpc', '-u', 'admin', 'Homecloud', 'getPaperlessServiceStatus']
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


def check_internet_connectivity():
    """Check internet connectivity using OMV RPC"""
    try:
        result = subprocess.run(['omv-rpc', '-u', 'admin', 'Homecloud', 'enumeratePhysicalNetworkDevices'],
                              capture_output=True, text=True, check=True)
        devices = json.loads(result.stdout)
        
        for device in devices:
            if device.get('devicename') == 'internet0':
                return device.get('state', False)
        return False
    except Exception:
        return False

def validate_version(version: str) -> bool:
    """Validate version against GitHub tags"""
    try:
        # Add 'v' prefix for GitHub API
        github_version = f"v{version}"
        
        url = "https://api.github.com/repos/paperless-ngx/paperless-ngx/tags"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        tags = response.json()
        
        return any(tag['name'] == github_version for tag in tags)
    except Exception:
        return False

def create_systemd_service() -> bool:
    """Create and enable systemd service"""
    service_content = """[Unit]
Description=Paperless
Requires=docker.service
After=docker.service

[Service]
Type=simple
Restart=always
RestartSec=10
ExecStart=/usr/bin/docker compose -f /etc/paperless/docker-compose.yml up 
ExecStop=/usr/bin/docker compose -f /etc/paperless/docker-compose.yml down

[Install]
WantedBy=multi-user.target
"""
    try:
        with open('/etc/systemd/system/paperless.service', 'w') as f:
            f.write(service_content)
        
        subprocess.run(['systemctl', 'daemon-reload'], check=True)
        subprocess.run(['systemctl', 'enable', 'paperless.service'], check=True)
        return True
    except Exception:
        return False

def download_compose_files(version: str) -> bool:
    """Download compose files from GitHub"""
    try:
        # Add 'v' prefix for GitHub URL
        github_version = f"v{version}"
        
        base_url = f"https://raw.githubusercontent.com/paperless-ngx/paperless-ngx/refs/tags/{github_version}/docker/compose/"
        
        files = [
            ('docker-compose.postgres-tika.yml', 'docker-compose.yml'),
            ('docker-compose.env', 'docker-compose.env')
        ]
        
        success = False
        for src, dst in files:
            response = requests.get(f"{base_url}{src}", timeout=10)
            if response.status_code == 200:
                with open(f"/etc/paperless/{dst}", 'w') as f:
                    f.write(response.text)
                success = True
        
        return success
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
            
        webserver = services.get('webserver', {})
        if not webserver or not isinstance(webserver, dict):
            return False
            
        current_image = webserver.get('image', '')
        if not current_image:
            return False
            
        # Set the base image name and update with version
        image_name = "ghcr.io/paperless-ngx/paperless-ngx"
        compose_data['services']['webserver']['image'] = f"{image_name}:{version}"
        
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
            ['docker', 'compose', '-f', '/etc/paperless/docker-compose.yml', 'pull'],
            check=True
        )
        return True
    except Exception:
        return False

def get_current_version() -> str:
    """Get currently deployed version"""
    try:
        cmd = ['omv-rpc', '-u', 'admin', 'Homecloud', 'paperless_check_version']
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

def update_env_file(user: str = None, password: str = None) -> bool:
    """Update docker-compose.env file with admin credentials if provided"""
    try:
        env_file = '/etc/paperless/docker-compose.env'
        
        # Read existing content
        if os.path.exists(env_file):
            with open(env_file, 'r') as f:
                lines = f.readlines()
        else:
            lines = []

        # Remove existing user/password settings if any
        lines = [line for line in lines if not line.startswith(('PAPERLESS_ADMIN_USER=', 'PAPERLESS_ADMIN_PASSWORD='))]

        # Add new credentials if provided
        if user:
            lines.append(f'PAPERLESS_ADMIN_USER={user}\n')
            lines.append(f'PAPERLESS_ADMIN_PASSWORD={password}\n')

        # Write back to file
        with open(env_file, 'w') as f:
            f.writelines(lines)
        
        return True
    except Exception:
        return False


    
def deploy_paperless(version: str, user: str = None, password: str = None) -> str:
    """Main deployment function"""
    try:
        # Check internet connectivity
        if not check_internet_connectivity():
            return "error: Not connected to Internet. Check your network connectivity"
            
        if version.startswith('v'):
            return "error: Version should not start with 'v'"
            
        # Get current status
        status_info = get_service_status()
        if not isinstance(status_info, dict):
            return "error: Invalid service status response"
            
        status = status_info.get('status', 'Not deployed')
        is_new_deployment = status == "Not deployed"

        

        # Validate version
        if not validate_version(version):
            return "error: Invalid version"

        if is_new_deployment:
            # New deployment
            os.makedirs('/etc/paperless', exist_ok=True)
            os.makedirs('/var/lib/paperless', exist_ok=True)
            subprocess.run([
            'chown',
            '-R',
            'paperless:',
            '/var/lib/paperless'
        ], check=True)

        # Common steps for both paths
            if not create_systemd_service():
                return "error: Failed to create service"

            if not download_compose_files(version):
                return "error: Failed to download compose files"

            if not update_compose_image('/etc/paperless/docker-compose.yml', version):
                return "error: Failed to update compose file"

            if user or password:
                password =  datetime.now().strftime('%b-%d-%Y') 
                if not update_env_file(user, password):
                   print("Warning: Failed to update credentials in env file")

        else:
            # Version update
            current_version = get_current_version()
            #if current_version and current_version >= version:
            #    return "error: Target version must be greater than current version"

            # Stop service
            subprocess.run(['systemctl', 'stop', 'paperless.service'], check=False)

            # Backup current compose file
            if os.path.exists('/etc/paperless/docker-compose.yml'):
                backup_path = f'/etc/paperless/docker-compose.yml.v{current_version or "backup"}'
                shutil.copy2('/etc/paperless/docker-compose.yml', backup_path)

            if not update_compose_image('/etc/paperless/docker-compose.yml', version):
                return "error: Failed to update compose file"

        # Common steps for both paths
        if not update_yaml_config():
            return "error: Failed to update YAML config"

        if not pull_docker_images():
            return "error: Failed to pull Docker images"

        # Setup firewall rules before starting service
        try:
            response = requests.post(
                "https://localhost:5000/setup_paperless_firewall",
                verify=False,
                timeout=30
            )
            if response.status_code != 200:
                print("Warning: Failed to update firewall rules")
        except Exception as e:
            print(f"Warning: Failed to setup firewall: {str(e)}")

        # Start service
        subprocess.run(['systemctl', 'start', 'paperless.service'], check=True)
         
        # For new deployment, wait for service to be ready and reset password
        if is_new_deployment:
            print(f"Deployed successfully. Go to Access page to login") 
            print(f"Login with User: {user}, Password: {password}")
            print(f"If previous installation exist i.e. App not reset then use previous login details. You may also reset admin password from Password page")
        else:
            print ("Deployed successfully. Go to Access page to login") 
            

        return "success"

    except Exception as e:
        return f"error: {str(e)}"

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Deploy or update Paperless-ngx')
    parser.add_argument('version', help='Version number (without v prefix)')
    parser.add_argument('--user', help='Admin username (optional)', default=None)
    parser.add_argument('--password', help='Admin password (optional)', default=None)
    
    args = parser.parse_args()
    
    print(deploy_paperless(args.version, args.user, args.password))

if __name__ == "__main__":
    main()
