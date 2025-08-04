#!/usr/bin/env python3

import os
import json
import subprocess
import requests
import sys
import argparse
from pathlib import Path
import shutil
from datetime import datetime
import yaml
import urllib3


# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def get_env_version():
    """Get IMMICH_VERSION from .env file"""
    try:
        with open('/etc/immich/.env', 'r') as f:
            for line in f:
                if line.startswith('IMMICH_VERSION='):
                    return line.split('=')[1].strip()
    except Exception:
        return None


def get_images_from_compose():
    """Get all image names and versions from docker-compose.yml"""
    try:
        with open('/etc/immich/docker-compose.yml', 'r') as f:
            compose_data = yaml.safe_load(f)
        
        # Get IMMICH_VERSION from .env
        immich_version = get_env_version()
        
        images = {}
        for service in compose_data.get('services', {}).values():
            if 'image' in service:
                image = service['image']
                
                # Handle SHA-tagged images
                if '@sha256:' in image:
                    name, sha = image.split('@sha256:')
                    # Store just the name and sha separately
                    images[name] = {'type': 'sha256', 'value': sha}
                # Handle variable-based versions
                elif '${IMMICH_VERSION:-release}' in image:
                    if immich_version:
                        name = image.split(':')[0]
                        images[name] = {'type': 'tag', 'value': immich_version}
                # Handle regular tagged images
                else:
                    name, version = image.rsplit(':', 1)
                    images[name] = {'type': 'tag', 'value': version}
        return images
    except Exception as e:
        print_status(f"Failed to read docker-compose.yml: {str(e)}", error=True)
        return {}

def get_image_id(image_name, image_info):
    """Get image ID for specific image and version"""
    try:
        if image_info['type'] == 'sha256':
            cmd = ["docker", "images", "--format", "{{.ID}}", 
                  f"{image_name}@sha256:{image_info['value']}"]
        else:
            cmd = ["docker", "images", "--format", "{{.ID}}", 
                  f"{image_name}:{image_info['value']}"]
        
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        return None

def remove_docker_images(old_images):
    """Remove multiple Docker images"""
    removed = []
    failed = []
    for image_name, image_info in old_images.items():
        # Create image reference string first
        if image_info['type'] == 'sha256':
            image_ref = f"{image_name}@sha256:{image_info['value']}"
        else:
            image_ref = f"{image_name}:{image_info['value']}"

        try:
            # Skip if version contains variable
            if '${' in image_info['value']:
                continue
                
            image_id = get_image_id(image_name, image_info)
            if image_id:
                subprocess.run(["docker", "rmi", image_ref], check=True, capture_output=True)
                removed.append(image_ref)
                print_status(f"Removed image: {image_ref}")
            else:
                failed.append(image_ref)
        except subprocess.CalledProcessError as e:
            failed.append(image_ref)
    
    # Print summary
    if removed:
        print_status("Successfully removed images:")
        for image in removed:
            print_status(f"  - {image}")
    
    return removed, failed

def print_status(message, error=False):
    """Print formatted status messages"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    if error:
        print(f"\033[91m[{timestamp}] ERROR: {message}\033[0m", flush=True)
    else:
        print(f"\033[92m[{timestamp}] {message}\033[0m", flush=True)

def validate_version(version):
    """Validate if the target version exists on GitHub"""
    url = f"https://github.com/immich-app/immich/releases/download/v{version}/docker-compose.yml"
    try:
        response = requests.get(url, allow_redirects=True)
        return response.status_code == 200
    except Exception:
        return False

def check_and_create_systemd_service():
    """Check if immich service exists and create if it doesn't"""
    service_file = "/etc/systemd/system/immich.service"
    start_script = "/sbin/start-immich.sh"
    stop_script = "/sbin/stop-immich.sh"
    
    try:
        if not os.path.exists(service_file):
            print(f"create service file")
            service_content = """[Unit]
Description=Starts docker container for immich service 
After=network.target

[Service]
Type=idle
Restart=on-failure
User=root
StandardOutput=journal
ExecStart=/bin/bash /sbin/start-immich.sh
ExecStop=/bin/bash /sbin/stop-immich.sh

[Install]
WantedBy=multi-user.target
"""
            with open(service_file, 'w') as f:
                f.write(service_content)
            
            start_script_content = """#!/bin/bash
cd /etc/immich
docker compose -f /etc/immich/docker-compose.yml up
"""
            with open(start_script, 'w') as f:
                f.write(start_script_content)
            os.chmod(start_script, 0o755)
            
            stop_script_content = """#!/bin/bash
cd /etc/immich
docker compose -f /etc/immich/docker-compose.yml down
"""
            with open(stop_script, 'w') as f:
                f.write(stop_script_content)
            os.chmod(stop_script, 0o755)
            
            return True
        else:
            return True
    except Exception:
        return False

def update_env_version(env_path, version):
    """Update IMMICH_VERSION in .env file"""
    try:
        with open(env_path, 'r') as f:
            lines = f.readlines()

        version_found = False
        for i, line in enumerate(lines):
            if line.startswith('IMMICH_VERSION='):
                lines[i] = f'IMMICH_VERSION=v{version}\n'
                version_found = True
                break

        if not version_found:
            lines.append(f'\nIMMICH_VERSION=v{version}\n')

        with open(env_path, 'w') as f:
            f.writelines(lines)
        return True
    except Exception:
        return False

def get_db_password(env_file):
    """Extract DB_PASSWORD from .env file"""
    try:
        with open(env_file, 'r') as f:
            for line in f:
                if line.startswith('DB_PASSWORD='):
                    return line.split('=', 1)[1].strip()
    except Exception:
        return None

def update_db_password(env_file, password):
    """Update DB_PASSWORD in .env file"""
    try:
        with open(env_file, 'r') as f:
            lines = f.readlines()

        for i, line in enumerate(lines):
            if line.startswith('DB_PASSWORD='):
                lines[i] = f'DB_PASSWORD={password}\n'
                break

        with open(env_file, 'w') as f:
            f.writelines(lines)
        return True
    except Exception:
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
            "cd /etc/immich && docker compose pull",
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True
        )
        
        # Print output in real-time
        for line in process.stdout:
            print(line.rstrip(), flush=True)
            
        process.wait()
        return process.returncode == 0
    except Exception as e:
        print_status(f"Docker pull failed: {str(e)}", error=True)
        return False

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Deploy or update Immich')
    parser.add_argument('version', help='Version to deploy/update')
    args = parser.parse_args()
    target_version = args.version
    current_version_tbr = 0
    old_images = {}

    # Check if running as root
    if os.geteuid() != 0:
        print_status("This script must be run as root", error=True)
        sys.exit(1)

    try:
        # Check internet connectivity
        print_status("Checking internet connectivity...")
        if not check_internet_connectivity():
            print_status("Not connected to Internet. Check your network connectivity", error=True)
            sys.exit(0)
        
        # Check deployment status
        print_status("Checking deployment status...")
        result = subprocess.run(['omv-rpc', '-u', 'admin', 'Homecloud', 'getImmichServiceStatus'],
                              capture_output=True, text=True, check=True)
        status_data = json.loads(result.stdout)
        is_fresh = status_data.get('status') == "Not deployed"

        # Validate version
        print_status(f"Validating version {target_version}...")
        if not validate_version(target_version):
            print_status(f"Invalid version: {target_version}", error=True)
            sys.exit(1)

        if is_fresh:
            print_status("Starting fresh deployment...")
            # New deployment
            print_status("Creating /etc/immich directory...")
            os.makedirs('/etc/immich', exist_ok=True)

            print_status("Setting up systemd service...")
            if not check_and_create_systemd_service():
                print_status("Failed to create systemd service", error=True)
                sys.exit(1)

            # Download docker-compose.yml and example.env
            for file_info in [
                ('docker-compose.yml', 'docker-compose.yml'),
                ('example.env', '.env')
            ]:
                print_status(f"Downloading {file_info[0]}...")
                url = f"https://github.com/immich-app/immich/releases/download/v{target_version}/{file_info[0]}"
                response = requests.get(url)
                if response.status_code != 200:
                    print_status(f"Failed to download {file_info[0]}", error=True)
                    sys.exit(1)
                
                with open(f'/etc/immich/{file_info[1]}', 'w') as f:
                    f.write(response.text)
                print_status(f"Saved as {file_info[1]}")

            print_status("Copying immich.json...")
            shutil.copy2('/etc/homecloud/immich.json', '/etc/immich/immich.json')

        else:
            print_status("Starting version update...")
            print_status("Checking currently deployed version...")
            version_cmd = "omv-rpc -u admin 'Homecloud' 'immich_check_version'"
            version_output = subprocess.check_output(version_cmd, shell=True)
            version_info = json.loads(version_output)
            current_version = version_info["deployed_version"]
            current_version_tbr = current_version
            print_status(f"Current deployed version: {current_version}")

            # Get current version
            #print_status("Checking current version...")
            #result = subprocess.run(['omv-rpc', '-u', 'admin', 'Homecloud', 'immich_check_version'],
            #                      capture_output=True, text=True, check=True)
            #current_version = json.loads(result.stdout).get('version', '')

            print_status(f"Current version: {current_version}")
            print_status(f"Target version: {target_version}")

            # Compare versions (removing 'v' prefix if present)
            current_ver = current_version.lstrip('v')
            
            target_ver = target_version.lstrip('v')
            #if current_ver >= target_ver:
            #    print_status(f"Target version {target_version} is not greater than current version {current_version}", error=True)
            #    sys.exit(1)



            # Store current images for later cleanup
            print_status("Getting current image information...")
            old_images = get_images_from_compose()
            if not old_images:
                print_status("Warning: Could not get current image information", error=True)



            # Stop service
            print_status("Stopping immich service...")
            subprocess.run(['systemctl', 'stop', 'immich.service'], check=True)

            # Backup current files
            print_status("Reading current DB password...")
            db_password = get_db_password('/etc/immich/.env')
            if not db_password:
                print_status("Failed to get DB password", error=True)
                sys.exit(1)

            # Rename current files
            print_status("Backing up current configuration files...")
            for file in ['.env', 'docker-compose.yml']:
                if os.path.exists(f'/etc/immich/{file}'):
                    os.rename(f'/etc/immich/{file}', f'/etc/immich/{file}.{current_version}')
                    print_status(f"Backed up {file} to {file}.{current_version}")

            # Download new files
            for file_info in [
                ('docker-compose.yml', 'docker-compose.yml'),
                ('example.env', '.env')
            ]:
                print_status(f"Downloading {file_info[0]}...")
                url = f"https://github.com/immich-app/immich/releases/download/v{target_version}/{file_info[0]}"
                response = requests.get(url)
                if response.status_code != 200:
                    print_status(f"Failed to download {file_info[0]}", error=True)
                    sys.exit(1)
                
                with open(f'/etc/immich/{file_info[1]}', 'w') as f:
                    f.write(response.text)
                print_status(f"Saved as {file_info[1]}")

            # Update DB password
            print_status("Updating DB password in new .env file...")
            if not update_db_password('/etc/immich/.env', db_password):
                print_status("Failed to update DB password", error=True)
                sys.exit(1)

        # Common steps for both paths
        # Update YAML configuration
        print_status("Updating YAML configuration...")
        result = subprocess.run(
            ["curl", "--insecure", "--request", "POST", "https://127.0.0.1:5000/update_YAML"],
            capture_output=True, text=True
        )
        if result.returncode != 0:
            print_status("Failed to update YAML configuration", error=True)
            sys.exit(1)

        # Update version in .env
        print_status("Updating version in .env file...")
        if not update_env_version('/etc/immich/.env', target_version):
            print_status("Failed to update version in .env", error=True)
            sys.exit(1)

        # Pull latest images
        print_status("Pulling latest Docker images...")
        if not run_docker_pull():
            print_status("Failed to pull Docker images", error=True)
            sys.exit(1)
        

        try:
            response = requests.post(
                "https://localhost:5000/setup_firewall?service=immich",
                verify=False,
                timeout=30
            )
            if response.status_code != 200:
                print("Warning: Failed to update firewall rules")
        except Exception as e:
            print(f"Warning: Failed to setup firewall: {str(e)}")

        # Enable, unmask and start service
        print_status("Enabling and starting immich service...")
        try:
            # Enable the service
            subprocess.run(['systemctl', 'enable', 'immich.service'], check=False)
            # Unmask the service
            subprocess.run(['systemctl', 'unmask', 'immich.service'], check=False)
            # Start the service
            subprocess.run(['systemctl', 'start', 'immich.service'], check=True)
        except Exception as e:
            print_status(f"Warning: Issue with service operations: {str(e)}", error=True)
            # Continue execution despite errors

         # Remove old images if this was an update
        if old_images:
            print_status("Removing old Docker images...")
            removed, failed = remove_docker_images(old_images)
            
            if removed:
                print_status("Successfully removed images:")
                for image in removed:
                    print_status(f"  - {image}")
            
        print_status("Deployment/update completed successfully")


    except Exception as e:
        print_status(str(e), error=True)
        sys.exit(1)

if __name__ == "__main__":
    main()

