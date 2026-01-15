#!/usr/bin/env python3

import os
import yaml
import subprocess
import requests
import urllib3
from typing import List


# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def run_command(cmd: List[str], ignore_errors: bool = True) -> None:
    """Run command and optionally ignore errors"""
    try:
        subprocess.run(cmd, check=not ignore_errors)
    except subprocess.CalledProcessError:
        if not ignore_errors:
            raise
    except Exception as e:
        if not ignore_errors:
            raise Exception(f"Error running command {' '.join(cmd)}: {str(e)}")

def stop_and_disable_service() -> None:
    """Stop and disable Joplin service"""
    # Stop service
    run_command(["systemctl", "stop", "jellyfin.service"])
    
    # Disable service
    run_command(["systemctl", "disable", "jellyfin.service"])
    
    # Remove service file
    run_command(["rm", "-f", "/etc/systemd/system/jellyfin.service"])
    
    # Reload systemd
    run_command(["systemctl", "daemon-reload"])

def get_docker_images() -> List[str]:
    """Get list of Docker images from docker-compose.yml"""
    images = []
    compose_file = "/etc/jellyfin/docker-compose.yml"
    
    if not os.path.exists(compose_file):
        return images
    
    try:
        with open(compose_file, 'r') as f:
            config = yaml.safe_load(f)
            
        if config and 'services' in config:
            for service in config['services'].values():
                if 'image' in service:
                    images.append(service['image'])
    except Exception as e:
        print(f"Warning: Error reading docker-compose.yml: {e}")
    
    return images

def remove_docker_images(images: List[str]) -> None:
    """Remove Docker images"""
    for image in images:
        run_command(["docker", "image", "rm", image])

def remove_jellyfin_directory() -> None:
    """Remove Jellyfin directory"""
    run_command(["rm", "-rf", "/etc/jellyfin"])

def main():
    try:
        # Stop and disable service
        stop_and_disable_service()
        
        # Get and remove Docker images
        images = get_docker_images()
        if images:
            remove_docker_images(images)
        
        response = requests.post(
            "https://localhost:5000/setup_firewall?service=jellyfin",
            verify=False,
            timeout=30
        )
        if response.status_code == 200:
            print("Firewall rules updated successfully")
        else:
            print(f"Warning: Failed to update firewall rules - HTTP {response.status_code}")
        # Remove Jellyfin directory
        remove_jellyfin_directory()
        
        print("Jellyfin removal completed successfully")
        
    except Exception as e:
        print(f"Error during Jellyfin removal: {e}")
        exit(1)

if __name__ == "__main__":
    main()

