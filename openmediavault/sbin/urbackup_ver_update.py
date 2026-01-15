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
import platform


# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def get_compose_version():
    """Get version from docker-compose.yml"""
    try:
        with open('/etc/urbackup/docker-compose.yaml ', 'r') as f:
            compose_data = yaml.safe_load(f)
            image = compose_data['services']['urbackup']['image']
            if ':' in image:
                return image.split(':')[-1].split('_')[0]
    except Exception:
        return None


def get_images_from_compose():
    """Get all image names and versions from docker-compose.yml"""
    try:
        with open('/etc/urbackup/docker-compose.yaml', 'r') as f:
            compose_data = yaml.safe_load(f)
        
        images = {}
        for service in compose_data.get('services', {}).values():
            if 'image' in service:
                image = service['image']
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



def check_and_create_systemd_service():
    """Check if urbackup service exists and create if it doesn't"""
    service_file = "/etc/systemd/system/urbackup.service"
    
    try:
        if not os.path.exists(service_file):
            service_content = """[Unit]
Description=Urbackup
Requires=docker.service
After=docker.service

[Service]
Type=simple
Restart=always
RestartSec=10
ExecStart=/usr/bin/docker compose -f /etc/urbackup/docker-compose.yaml up 
ExecStop=/usr/bin/docker compose -f /etc/urbackup/docker-compose.yaml down

[Install]
WantedBy=multi-user.target
"""
            with open(service_file, 'w') as f:
                f.write(service_content)
            return True
        else:
            return True
    except Exception:
        return False

def update_compose_version(version):
    """Update version in docker-compose.yml"""
    try:
        with open('/etc/urbackup/docker-compose.yaml', 'r') as f:
            compose_data = yaml.safe_load(f)
        
        
        compose_data['services']['urbackup']['image'] = f'uroni/urbackup-server:{version}'

        with open('/etc/urbackup/docker-compose.yaml', 'w') as f:
            yaml.dump(compose_data, f, default_flow_style=False)
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

def get_platform_compose_file():
    """Get the appropriate docker-compose file based on platform architecture"""
    arch = platform.machine().lower()
    if arch in ['x86_64', 'amd64']:
        return '/etc/homecloud/docker-compose-urbackup-x86.yml'
    else:
        return '/etc/homecloud/docker-compose-urbackup.yml'

def run_docker_pull():
    """Run docker compose pull with live output"""
    try:
        process = subprocess.Popen(
            "cd /etc/urbackup && docker compose -f /etc/urbackup/docker-compose.yaml pull",
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
    parser = argparse.ArgumentParser(description='Deploy or update Urbackup')
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
        result = subprocess.run(['omv-rpc', '-u', 'admin', 'Homecloud', 'getUrbackupServiceStatus'],
                              capture_output=True, text=True, check=True)
        status_data = json.loads(result.stdout)
        is_fresh = status_data.get('status') == "Not deployed"

       

        if is_fresh:
            print_status("Starting fresh deployment...")
            # New deployment
            print_status("Creating /etc/urbackup directory...")
            os.makedirs('/etc/urbackup', exist_ok=True)
            # find the mount point of SSD filesystem /dev/mapper/DATA_VOL-home_dirs and create a directory duplicati and duplicati/shared. 
            with open('/proc/mounts', 'r') as f:
                for line in f:
                    parts = line.split()
                    if parts[0] == '/dev/mapper/DATA_VOL-home_dirs':
                        mount_point = parts[1]
                        break

            # Create duplicati directory in mount_point
            os.makedirs(f'{mount_point}/urbackup', exist_ok=True)
            os.makedirs(f'{mount_point}/urbackup/urbackup', exist_ok=True)
            os.makedirs(f'{mount_point}/urbackup/backups', exist_ok=True)
            #os.chmod(f'{mount_point}/urbackup/backups', 0o777)
            subprocess.run(['chown', '-R', 'admin:users', f'{mount_point}/urbackup'], check=True)
            
            # Remove existing /var/lib/duplicati if it exists
            if os.path.exists('/var/lib/urbackup'):
                if os.path.islink('/var/lib/urbackup'):
                    os.unlink('/var/lib/urbackup')
                else:
                    shutil.rmtree('/var/lib/urbackup')
            
            # Create symlink
            os.symlink(f'{mount_point}/urbackup', '/var/lib/urbackup')
            

            print_status("Setting up systemd service...")
            if not check_and_create_systemd_service():
                print_status("Failed to create systemd service", error=True)
                sys.exit(1)

            print_status("Copying files...")
            source_file = get_platform_compose_file()
            shutil.copy2(source_file, '/etc/urbackup/docker-compose.yaml')
            print_status(f"Copied {source_file} to /etc/urbackup/docker-compose.yaml")
                        

            update_compose_version(target_version)

        else:
            print_status("Starting version update...")
            print_status("Checking currently deployed version...")
            version_cmd = "omv-rpc -u admin 'Homecloud' 'urbackup_check_version'"
            version_output = subprocess.check_output(version_cmd, shell=True)
            version_info = json.loads(version_output)
            current_version = version_info["deployed_version"]
            current_version_tbr = current_version
            print_status(f"Current deployed version: {current_version}")

            

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
            print_status("Stopping Urbackup service...")
            subprocess.run(['systemctl', 'stop', 'urbackup.service'], check=True)

            # Backup current files
            

            # Rename current files
            print_status("Backing up current configuration files...")
            for file in ['docker-compose.yaml']:
                if os.path.exists(f'/etc/urbackup/{file}'):
                    shutil.copy2(f'/etc/urbackup/{file}', f'/etc/urbackup/{file}.{current_version}')
                    print_status(f"Backed up {file} to {file}.{current_version}")
                    update_compose_version(target_version)


            
            
            
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

        
        # Pull latest images
        print_status("Pulling latest Docker images...")
        if not run_docker_pull():
            print_status("Failed to pull Docker images", error=True)
            sys.exit(1)
        

        try:
            response = requests.post(
                "https://localhost:5000/setup_urbackup_firewall",
                verify=False,
                timeout=30
            )
            if response.status_code != 200:
                print("Warning: Failed to update firewall rules")
        except Exception as e:
            print(f"Warning: Failed to setup firewall: {str(e)}")

        # Enable, unmask and start service
        print_status("Enabling and starting Urbackup service...")
        try:
            # Enable the service
            subprocess.run(['systemctl', 'enable', 'urbackup.service'], check=False)
            # Unmask the service
            subprocess.run(['systemctl', 'unmask', 'urbackup.service'], check=False)
            # Start the service
            subprocess.run(['systemctl', 'start', 'urbackup.service'], check=True)
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

