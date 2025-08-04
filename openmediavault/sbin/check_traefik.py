#!/usr/bin/env python3

import json
import subprocess
import os
import yaml

def check_service_status(service_name):
    """Check if a systemd service is running"""
    try:
        result = subprocess.run(['systemctl', 'is-active', service_name], 
                              capture_output=True, text=True)
        return result.stdout.strip() == 'active'
    except Exception:
        return False

def get_container_name():
    """Get container name from docker-compose file"""
    compose_file = '/etc/traefik/docker-compose-traefik.yaml'
    try:
        if not os.path.exists(compose_file):
            return None

        with open(compose_file, 'r') as f:
            config = yaml.safe_load(f)
            
        if (config and 'services' in config and 
            'traefik' in config['services'] and 
            'image' in config['services']['traefik']):
            return config['services']['traefik']['image']
    except Exception as e:
        return None
    return None

def check_docker_status():
    """Check Docker container status"""
    try:
        # Find traefik container by name pattern
        cmd = ["docker", "ps", "--filter", "name=traefik", "--format", "{{.Names}},{{.Status}}"]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        if not result.stdout.strip():
            return "Error"
        
        # Parse the output
        for line in result.stdout.strip().split('\n'):
            if 'traefik' in line.lower():
                parts = line.split(',')
                if len(parts) >= 2:
                    status = parts[1].lower()
                    if 'up' in status:
                        return "Running"
                    elif 'restarting' in status:
                        return "Starting"
        
        return "Error"
            
    except subprocess.CalledProcessError:
        return "Error"

def check_directories():
    """Check if required directories exist"""
    required_dirs = ['/etc/traefik']
    return all(os.path.isdir(dir) for dir in required_dirs)



def get_status():
    """Get overall status checking both service and docker"""
    # First check if directories exist
    if not check_directories():
        return "Not deployed"
    
    # Check if service is running
    if not check_service_status('traefik.service'):
        return "Down"
    
    # If service is running, check docker status
    return check_docker_status()

def main():
    # Get status using the new combined check
    status = get_status()
    


    # Prepare result
    result = {
        "status": status
    }

    # Output JSON
    print(json.dumps(result))

if __name__ == "__main__":
    main()

