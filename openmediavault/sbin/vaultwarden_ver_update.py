#!/usr/bin/env python3

import os
import sys
import json
import subprocess
import requests
import argparse
import yaml
from datetime import datetime
import urllib3


# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def print_status(message, error=False):
    """Print formatted status messages"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    if error:
        print(f"\033[91m[{timestamp}] ERROR: {message}\033[0m", flush=True)
    else:
        print(f"\033[92m[{timestamp}] {message}\033[0m", flush=True)

def validate_version(version):
    """Validate if version exists in GitHub tags"""
    try:
        url = f"https://api.github.com/repos/dani-garcia/vaultwarden/tags"
        response = requests.get(url)
        if response.status_code == 200:
            tags = response.json()
            for tag in tags:
                if tag['name'] == version or tag['name'] == f'v{version}':
                    return True
        return False
    except Exception as e:
        print_status(f"Error validating version: {str(e)}", error=True)
        return False

def check_and_create_systemd_service():
    """Check if vaultwarden service exists and create if it doesn't"""
    service_file = "/etc/systemd/system/vaultwarden.service"
    
    try:
        if not os.path.exists(service_file):
            service_content = """[Unit]
Description=Vaultwarden
Requires=docker.service
After=docker.service

[Service]
Type=simple
Restart=always
RestartSec=10
ExecStart=/usr/bin/docker compose -f /etc/vault-warden/docker-compose-vaultwarden.yml up 
ExecStop=/usr/bin/docker compose -f /etc/vault-warden/docker-compose-vaultwarden.yml down

[Install]
WantedBy=multi-user.target
"""
            with open(service_file, 'w') as f:
                f.write(service_content)
            
            # Enable the service
            subprocess.run(['systemctl', 'enable', 'vaultwarden.service'], check=True)
            subprocess.run(['systemctl', 'daemon-reload'], check=True)
            return True
        else:   
            return True
    except Exception as e:
        print_status(f"Error creating systemd service: {str(e)}", error=True)
        return False

def update_docker_compose(file_path, target_version):
    """Update image version in docker-compose file"""
    try:
        with open(file_path, 'r') as f:
            config = yaml.safe_load(f)
        
        # Update image version
        if 'services' in config and 'vaultwarden' in config['services']:
            config['services']['vaultwarden']['image'] = f'vaultwarden/server:{target_version}'
            
            with open(file_path, 'w') as f:
                yaml.dump(config, f)
            return True
    except Exception as e:
        print_status(f"Error updating docker-compose file: {str(e)}", error=True)
        return False


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

def run_docker_pull():
    """Run docker compose pull with live output"""
    try:
        process = subprocess.Popen(
            "cd /etc/vault-warden && docker compose -f docker-compose-vaultwarden.yml pull",
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True
        )
        
        for line in process.stdout:
            print(line.rstrip(), flush=True)
            
        process.wait()
        return process.returncode == 0
    except Exception as e:
        print_status(f"Docker pull failed: {str(e)}", error=True)
        return False

def create_required_directories():
    """Create required directories if they don't exist and set proper ownership"""
    directories = ['/etc/vault-warden', '/var/lib/vwdata']
    try:
        for directory in directories:
            if not os.path.exists(directory):
                os.makedirs(directory, exist_ok=True)
                print_status(f"Created directory: {directory}")
                
                # Set ownership for /var/lib/vwdata to vault:vault
                if directory == '/var/lib/vwdata':
                    try:
                        subprocess.run(['chown', '-R', 'vault:vault', directory], check=True)
                        print_status(f"Set ownership of {directory} to vault:vault")
                    except subprocess.CalledProcessError as e:
                        raise Exception(f"Failed to set ownership of {directory}: {str(e)}")
        return True
    except Exception as e:
        #print_status(f"Error creating directories: {str(e)}", error=True)
        return False

def main():
    parser = argparse.ArgumentParser(description='Deploy or update Vaultwarden')
    parser.add_argument('version', help='Version to deploy/update')
    args = parser.parse_args()
    target_version = args.version

    try:
        # Check if running as root
        if os.geteuid() != 0:
            raise Exception("This script must be run as root")

        # Check internet connectivity
        print_status("Checking internet connectivity...")
        if not check_internet_connectivity():
            print_status("Not connected to Internet. Check your network connectivity", error=True)
            sys.exit(0)

            
        # Check deployment status
        print_status("Checking deployment status...")
        result = subprocess.run(['omv-rpc', '-u', 'admin', 'Homecloud', 'getVaultwardenServiceStatus'],
                              capture_output=True, text=True, check=True)
        status_data = json.loads(result.stdout)
        is_fresh = status_data.get('status') == "Not deployed"

        # Validate version
        print_status(f"Validating version {target_version}...")
        if not validate_version(target_version):
            raise Exception(f"Invalid version: {target_version}")

        if is_fresh:
            print_status("Starting fresh deployment...")
            
            # Create required directories
            print_status("Creating required directories...")
            if not create_required_directories():
                raise Exception("Failed to create required directories")

            # Setup systemd service
            print_status("Setting up systemd service...")
            if not check_and_create_systemd_service():
                raise Exception("Failed to create systemd service")

            # Copy docker-compose file
            print_status("Copying docker-compose file...")
            subprocess.run(['cp', '/etc/homecloud/docker-compose-vaultwarden.yml', 
                          '/etc/vault-warden/'], check=True)

        else:
            print_status("Starting version update...")
            # Get current version
            print_status("Checking current version...")
            result = subprocess.run(['omv-rpc', '-u', 'admin', 'Homecloud', 'vaultwarden_check_version'],
                                  capture_output=True, text=True, check=True)
            deployed_version = json.loads(result.stdout).get('deployed_version', '')

            if not deployed_version:
                raise Exception("Failed to get current version")

            print_status(f"Current version: {deployed_version}")
            print_status(f"Target version: {target_version}")

            # Compare versions
            #if deployed_version >= target_version:
            #    raise Exception(f"Target version {target_version} is not greater than current version {deployed_version}")

            # Stop service
            print_status("Stopping vaultwarden service...")
            subprocess.run(['systemctl', 'stop', 'vaultwarden.service'], check=True)

            # Backup current docker-compose file
            print_status("Backing up docker-compose file...")
            subprocess.run(['cp', '/etc/vault-warden/docker-compose-vaultwarden.yml',
                          f'/etc/vault-warden/docker-compose-vaultwarden.yml.{deployed_version}'], check=True)

        # Update docker-compose file
        print_status("Updating docker-compose file...")
        if not update_docker_compose('/etc/vault-warden/docker-compose-vaultwarden.yml', target_version):
            raise Exception("Failed to update docker-compose file")

        # Update YAML configuration
        print_status("Updating YAML configuration...")
        result = subprocess.run(
            ["curl", "--insecure", "--request", "POST", "https://127.0.0.1:5000/update_YAML"],
            capture_output=True, text=True
        )
        if result.returncode != 0:
            raise Exception("Failed to update YAML configuration")

        # Pull latest images
        print_status("Pulling latest Docker images...")
        if not run_docker_pull():
            raise Exception("Failed to pull Docker images")
        
        # Setup firewall rules before starting service
        try:
            response = requests.post(
                "https://localhost:5000/setup_firewall?service=vaultwarden",
                verify=False,
                timeout=30
            )
            if response.status_code != 200:
                print("Warning: Failed to update firewall rules")
        except Exception as e:
            print(f"Warning: Failed to setup firewall: {str(e)}")


        # Start service
        print_status("Starting vaultwarden service...")
        subprocess.run(['systemctl', 'start', 'vaultwarden.service'], check=True)

        # Return success JSON
        result = {
            "status": "success",
            "message": "Vaultwarden deployment/update completed successfully",
            "version": target_version
        }
        print(json.dumps(result))
        return 0

    except Exception as e:
        # Return error JSON
        error_result = {
            "status": "error",
            "message": str(e)
        }
        print(json.dumps(error_result))
        return 1

if __name__ == "__main__":
    sys.exit(main())

