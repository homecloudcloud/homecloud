#!/usr/bin/env python3

import os
import sys
import subprocess
import yaml
from pathlib import Path
import shutil

def print_status(message, error=False):
    """Print formatted status messages"""
    if error:
        print(f"\033[91mERROR: {message}\033[0m")
    else:
        print(f"\033[92m{message}\033[0m")

def stop_and_remove_service():
    """Stop and remove the vaultwarden service"""
    try:
        # Stop service
        print_status("Stopping vaultwarden service...")
        subprocess.run(['systemctl', 'stop', 'vaultwarden.service'], 
                      stderr=subprocess.DEVNULL)

        # Disable service
        print_status("Disabling vaultwarden service...")
        subprocess.run(['systemctl', 'disable', 'vaultwarden.service'],
                      stderr=subprocess.DEVNULL)

        # Remove service file
        service_file = "/etc/systemd/system/vaultwarden.service"
        if os.path.exists(service_file):
            print_status("Removing service file...")
            os.remove(service_file)
            subprocess.run(['systemctl', 'daemon-reload'])

        return True
    except Exception as e:
        print_status(f"Error handling service: {str(e)}", error=True)
        return False

def get_docker_images():
    """Get list of downloaded images from docker-compose file"""
    images = set()
    try:
        compose_file = "/etc/vault-warden/docker-compose-vaultwarden.yml"
        if not os.path.exists(compose_file):
            return images

        with open(compose_file, 'r') as f:
            config = yaml.safe_load(f)
            
        if 'services' in config:
            for service in config['services'].values():
                if 'image' in service:
                    images.add(service['image'])

        return images

    except Exception as e:
        print_status(f"Error getting docker images: {str(e)}", error=True)
        return set()

def remove_docker_images(images):
    """Remove docker images"""
    success = True
    for image in images:
        try:
            print_status(f"Removing docker image: {image}")
            subprocess.run(['docker', 'image', 'rm', image], 
                         stderr=subprocess.DEVNULL,
                         check=True)
        except subprocess.CalledProcessError:
            # Ignore if image doesn't exist or can't be removed
            pass
        except Exception as e:
            print_status(f"Error removing image {image}: {str(e)}", error=True)
            success = False
    return success

def remove_directories():
    """Remove vaultwarden directories"""
    try:
        if os.path.exists('/etc/vault-warden'):
            print_status("Removing directory: /etc/vault-warden")
            shutil.rmtree('/etc/vault-warden')
        return True
    except Exception as e:
        print_status(f"Error removing directory: {str(e)}", error=True)
        return False

def main():
    try:
        # Check if running as root
        if os.geteuid() != 0:
            raise Exception("This script must be run as root")

        result = {
            "status": "success",
            "message": "Vaultwarden removal completed successfully"
        }

        # Stop and remove service
        if not stop_and_remove_service():
            result["status"] = "error"
            result["message"] = "Failed to handle service removal"
            print(yaml.dump(result))
            return 1

        # Get docker images before removing compose file
        images = get_docker_images()

        # Remove directories
        if not remove_directories():
            result["status"] = "error"
            result["message"] = "Failed to remove directories"
            print(yaml.dump(result))
            return 1
        
        try:
            response = requests.post(
                "https://localhost:5000/setup_firewall?service=vaultwarden",
                verify=False,
                timeout=30
            )
            if response.status_code != 200:
                print("Warning: Failed to update firewall rules")
        except Exception as e:
            print(f"Warning: Failed to update firewall rules: {str(e)}")

        # Remove docker images
        if images and not remove_docker_images(images):
            result["status"] = "error"
            result["message"] = "Failed to remove some docker images"
            print(yaml.dump(result))
            return 1

        print(yaml.dump(result))
        return 0

    except Exception as e:
        result = {
            "status": "error",
            "message": str(e)
        }
        print(yaml.dump(result))
        return 1

if __name__ == "__main__":
    sys.exit(main())

