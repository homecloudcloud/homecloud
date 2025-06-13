#!/usr/bin/env python3

import os
import subprocess
import yaml
import shutil
from typing import List

def stop_service(service_name: str) -> None:
    """Stop a systemd service if running"""
    try:
        # Check if service exists and is active
        check_cmd = ['systemctl', 'is-active', service_name]
        result = subprocess.run(check_cmd, capture_output=True, text=True)
        
        if result.stdout.strip() == 'active':
            # Stop the service
            subprocess.run(['systemctl', 'stop', service_name], 
                         check=False, capture_output=True)
    except Exception:
        pass

def disable_service(service_name: str) -> None:
    """Disable a systemd service"""
    try:
        subprocess.run(['systemctl', 'disable', service_name], 
                      check=False, capture_output=True)
    except Exception:
        pass

def remove_service(service_name: str) -> None:
    """Remove a systemd service file"""
    try:
        service_path = f"/etc/systemd/system/{service_name}.service"
        if os.path.exists(service_path):
            os.remove(service_path)
            # Reload systemd daemon
            subprocess.run(['systemctl', 'daemon-reload'], 
                         check=False, capture_output=True)
    except Exception:
        pass

def get_docker_images() -> List[str]:
    """Get list of docker images from docker-compose file"""
    images = []
    compose_file = "/etc/paperless/docker-compose.yml"
    
    try:
        if os.path.exists(compose_file):
            with open(compose_file, 'r') as f:
                compose_data = yaml.safe_load(f)
                
            if compose_data and 'services' in compose_data:
                for service in compose_data['services'].values():
                    if 'image' in service:
                        images.append(service['image'])
    except Exception:
        pass
    
    return images

def remove_docker_images(images: List[str]) -> None:
    """Remove docker images"""
    for image in images:
        try:
            subprocess.run(['docker', 'image', 'rm', image], 
                         check=False, capture_output=True)
        except Exception:
            pass

def remove_paperless_directory() -> None:
    """Remove Paperless directory"""
    try:
        if os.path.exists('/etc/paperless'):
            shutil.rmtree('/etc/paperless')
    except Exception:
        pass

def remove_paperless() -> None:
    """Main function to remove Paperless"""
    try:
        # 1. Stop service
        stop_service('paperless')
        
        # 2. Disable service
        disable_service('paperless')
        
        # 3. Remove service
        remove_service('paperless')
        
        # 4. Get docker images
        images = get_docker_images()
        
        # 5. Remove docker images
        remove_docker_images(images)
        
        # 6. Remove Paperless directory
        remove_paperless_directory()

        # 7. Update firewall rules via API
        try:
            response = requests.post(
                "https://localhost:5000/setup_paperless_firewall",
                verify=False,
                timeout=30
            )
            if response.status_code != 200:
                print("Warning: Failed to update firewall rules")
        except Exception as e:
            print(f"Warning: Failed to update firewall rules: {str(e)}")
        
    except Exception:
        pass

def main():
    """Main entry point"""
    remove_paperless()

if __name__ == "__main__":
    main()

