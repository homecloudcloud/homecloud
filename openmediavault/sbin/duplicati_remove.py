#!/usr/bin/env python3

import os
import sys
import subprocess
import yaml
import re
import requests
import urllib3
from pathlib import Path
import shutil

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def print_status(message, error=False):
    """Print formatted status messages"""
    if error:
        print(f"\033[91mERROR: {message}\033[0m")
    else:
        print(f"\033[92m{message}\033[0m")

def stop_and_remove_service():
    """Stop and remove the immich service"""
    try:
        # Stop service
        print_status("Stopping duplicati service...")
        subprocess.run(['systemctl', 'stop', 'duplicati.service'], 
                      stderr=subprocess.DEVNULL)

        # Disable service
        print_status("Disabling duplicati service...")
        subprocess.run(['systemctl', 'disable', 'duplicati.service'],
                      stderr=subprocess.DEVNULL)

        # Remove service file
        service_file = "/etc/systemd/system/duplicati.service"
        if os.path.exists(service_file):
            print_status("Removing service file...")
            os.remove(service_file)
            subprocess.run(['systemctl', 'daemon-reload'])

        # check and remove /etc/duplicat/preload.json
        preload_file = "/etc/duplicati/preload.json"
        if os.path.exists(preload_file):
            print_status("Removing preload file...")
            os.remove(preload_file)

    except Exception as e:
        print_status(f"Error handling service: {str(e)}", error=True)

def get_env_variables():
    """Read environment variables from .env file"""
    env_vars = {}
    try:
        return env_vars  # Duplicati doesn't use .env file
        if os.path.exists(env_file):
            with open(env_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        key, value = line.split('=', 1)
                        env_vars[key] = value
    except Exception as e:
        print_status(f"Error reading .env file: {str(e)}", error=True)
    return env_vars

def expand_image_name(image_name, env_vars):
    """Expand environment variables in image name"""
    try:
        # Find all ${VAR:-default} or ${VAR} patterns
        pattern = r'\${([^}]+)}'
        matches = re.findall(pattern, image_name)
        
        for match in matches:
            if ':-' in match:
                var_name, default = match.split(':-')
                value = env_vars.get(var_name, default)
            else:
                value = env_vars.get(match, '')
            
            image_name = image_name.replace(f'${{{match}}}', value)
        
        return image_name
    except Exception:
        return image_name

def get_docker_images():
    """Get list of downloaded images from docker-compose file"""
    images = set()
    try:
        compose_file = "/etc/duplicati/docker-compose-duplicati.yaml"
        if not os.path.exists(compose_file):
            return images

        env_vars = get_env_variables()
        
        with open(compose_file, 'r') as f:
            config = yaml.safe_load(f)
            
        if 'services' in config:
            for service in config['services'].values():
                if 'image' in service:
                    images.add(service['image'])

        # Get actual docker images that match the patterns
        docker_images = set()
        result = subprocess.run(['docker', 'images', '--format', '{{.Repository}}:{{.Tag}}'],
                              capture_output=True, text=True)
        if result.returncode == 0:
            all_images = result.stdout.splitlines()
            for pattern in images:
                for image in all_images:
                    if pattern in image:
                        docker_images.add(image)

        return docker_images

    except Exception as e:
        print_status(f"Error getting docker images: {str(e)}", error=True)
        return set()

def remove_docker_images(images):
    """Remove docker images"""
    for image in images:
        try:
            print_status(f"Removing docker image: {image}")
            subprocess.run(['docker', 'image', 'rm', image], 
                         stderr=subprocess.DEVNULL)
        except Exception as e:
            print_status(f"Error removing image {image}: {str(e)}", error=True)

def remove_directories():
    """Remove duplicati directories"""
    #directories = [
    #    '/etc/duplicati'
    #]
    
    # just remove a file /etc/duplicati/docker-compose-duplicati.yaml
    try:
        file = Path('/etc/duplicati/docker-compose-duplicati.yaml')
        if file.exists():
            print_status(f"Removing file: {file}")
            file.unlink()

    #for directory in directories:
    #    try:
    #        if os.path.exists(directory):
    #            print_status(f"Removing directory: {directory}")
    #            shutil.rmtree(directory)
    except Exception as e:
        print_status(f"Error removing directory {directory}: {str(e)}", error=True)

def main():
    try:
        # Check if running as root
        if os.geteuid() != 0:
            print_status("This script must be run as root", error=True)
            return 1

        # Stop and remove service
        stop_and_remove_service()

        # Get docker images before removing compose file
        images = get_docker_images()

        # Remove directories. Let's not remove as .env file needed to reset.
        remove_directories()

        # Remove docker images
        if images:
            print_status("Removing docker images...")
            remove_docker_images(images)
        
        try:
            response = requests.post(
                "https://localhost:5000/setup_firewall?service=duplicati",
                verify=False,
                timeout=30
            )
            if response.status_code != 200:
                print("Warning: Failed to update firewall rules")
        except Exception as e:
            print(f"Warning: Failed to setup firewall: {str(e)}")

        print_status("Duplicati removal completed successfully")
        return 0

    except Exception as e:
        print_status(str(e), error=True)
        return 1

if __name__ == "__main__":
    sys.exit(main())

