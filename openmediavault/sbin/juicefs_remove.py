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

def stop_urbackup_service():
    """Stop UrBackup service"""
    try:
        print_status("Stopping UrBackup service...")
        subprocess.run(['systemctl', 'stop', 'urbackup.service'], stderr=subprocess.DEVNULL)
    except Exception as e:
        print_status(f"Error stopping UrBackup service: {str(e)}", error=True)

def start_urbackup_service():
    """Start UrBackup service"""
    try:
        print_status("Starting UrBackup service...")
        subprocess.run(['systemctl', 'start', 'urbackup.service'], stderr=subprocess.DEVNULL)
    except Exception as e:
        print_status(f"Error starting UrBackup service: {str(e)}", error=True)

def stop_and_remove_service():
    """Stop and remove the juicefs service"""
    try:
        # Stop service
        print_status("Stopping juicefs service...")
        subprocess.run(['systemctl', 'stop', 'juicefs.service'], 
                      stderr=subprocess.DEVNULL)

        # Disable service
        print_status("Disabling juicefs service...")
        subprocess.run(['systemctl', 'disable', 'juicefs.service'],
                      stderr=subprocess.DEVNULL)

        # Remove service file
        service_file = "/etc/systemd/system/juicefs.service"
        if os.path.exists(service_file):
            print_status("Removing service file...")
            os.remove(service_file)
            subprocess.run(['systemctl', 'daemon-reload'])

    except Exception as e:
        print_status(f"Error handling service: {str(e)}", error=True)

def get_env_variables():
    """Read environment variables from .env file"""
    env_vars = {}
    try:
        return env_vars  # juicefs doesn't use .env file
    except Exception as e:
        print_status(f"Error reading .env file: {str(e)}", error=True)
    return env_vars

def expand_image_name(image_name, env_vars):
    """Expand environment variables in image name"""
    try:
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
        compose_file = "/etc/juicefs/docker-compose.yaml"
        if not os.path.exists(compose_file):
            return images

        env_vars = get_env_variables()
        
        with open(compose_file, 'r') as f:
            config = yaml.safe_load(f)
            
        if 'services' in config:
            for service in config['services'].values():
                if 'image' in service:
                    images.add(service['image'])

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
    # Handle /var/lib/juicefs symlink and its target
    juicefs_symlink = '/var/lib/juicefs'
    juicefs_target = None
    
    if os.path.islink(juicefs_symlink):
        try:
            juicefs_target = os.readlink(juicefs_symlink)
            if not os.path.isabs(juicefs_target):
                juicefs_target = os.path.join(os.path.dirname(juicefs_symlink), juicefs_target)
            print_status(f"Unlinking symlink: {juicefs_symlink}")
            os.unlink(juicefs_symlink)
        except Exception as e:
            print_status(f"Error unlinking symlink {juicefs_symlink}: {str(e)}", error=True)
    
    # Handle /var/lib/jfsdata symlink and its target
    jfsdata_symlink = '/var/lib/jfsdata'
    jfsdata_target = None
    
    if os.path.islink(jfsdata_symlink):
        try:
            jfsdata_target = os.readlink(jfsdata_symlink)
            if not os.path.isabs(jfsdata_target):
                jfsdata_target = os.path.join(os.path.dirname(jfsdata_symlink), jfsdata_target)
            print_status(f"Unlinking symlink: {jfsdata_symlink}")
            os.unlink(jfsdata_symlink)
        except Exception as e:
            print_status(f"Error unlinking symlink {jfsdata_symlink}: {str(e)}", error=True)
    
    directories = ['/var/lib/jfsdata', '/var/lib/juicefs']
    
    if jfsdata_target and os.path.exists(jfsdata_target):
        directories.append(jfsdata_target)
    if juicefs_target and os.path.exists(juicefs_target):
        directories.append(juicefs_target)
    
    try:
        file = Path('/etc/juicefs/docker-compose.yaml')
        if file.exists():
            print_status(f"Removing file: {file}")
            file.unlink()
    except Exception as e:
        print_status(f"Error removing file {file}: {str(e)}", error=True)

    # Remove directories
    for directory in directories:
        if os.path.exists(directory):
            try:
                # Force unmount all FUSE mounts for this directory
                print_status(f"Force unmounting any FUSE mounts for: {directory}")
                subprocess.run(['umount', '-f', '-l', directory], stderr=subprocess.DEVNULL, check=False)
                subprocess.run(['fusermount', '-u', directory], stderr=subprocess.DEVNULL, check=False)
                subprocess.run(['fusermount', '-uz', directory], stderr=subprocess.DEVNULL, check=False)
                
                # Wait a moment for unmount to complete
                import time
                time.sleep(1)

                print_status(f"Removing directory: {directory}")
                shutil.rmtree(directory)
            except OSError as e:
                if e.errno == 107:  # Transport endpoint is not connected
                    print_status(f"FUSE mount issue detected, forcing cleanup: {directory}")
                    try:
                        # Try to remove the directory anyway
                        subprocess.run(['rm', '-rf', directory], check=False)
                    except Exception:
                        pass
                else:
                    print_status(f"Error removing directory {directory}: {str(e)}", error=True)
            except Exception as e:
                print_status(f"Error removing directory {directory}: {str(e)}", error=True)

def remove_urbackup_volume():
    """Remove JuiceFS volume from UrBackup docker-compose.yaml"""
    urbackup_file = '/etc/urbackup/docker-compose.yaml'
    
    if not os.path.exists(urbackup_file):
        return True
    
    try:
        with open(urbackup_file, 'r') as f:
            urbackup_data = yaml.safe_load(f)
        
        volumes = urbackup_data['services']['urbackup']['volumes']
        volume_entry = '/var/lib/jfsdata:/backups-cloud'
        
        if volume_entry in volumes:
            volumes.remove(volume_entry)
            with open(urbackup_file, 'w') as f:
                yaml.dump(urbackup_data, f, default_flow_style=False)
            
            print_status(f"Removed JuiceFS volume from UrBackup configuration")
        
        
        return True
    except Exception as e:
        print_status(f"Error updating UrBackup config: {str(e)}", error=True)
        return False

def main():
    try:
        if os.geteuid() != 0:
            print_status("This script must be run as root", error=True)
            return 1

        stop_urbackup_service()
        stop_and_remove_service()
        images = get_docker_images()
        remove_directories()
        remove_urbackup_volume()
        start_urbackup_service()
        if images:
            print_status("Removing docker images...")
            remove_docker_images(images)
    
        print_status("juicefs removal completed successfully")
        return 0

    except Exception as e:
        print_status(str(e), error=True)
        return 1

if __name__ == "__main__":
    sys.exit(main())