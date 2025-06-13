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
    compose_file = '/etc/vault-warden/docker-compose-vaultwarden.yml'
    try:
        if not os.path.exists(compose_file):
            return None

        with open(compose_file, 'r') as f:
            config = yaml.safe_load(f)
            
        if ('services' in config and 
            'vaultwarden' in config['services'] and 
            'container_name' in config['services']['vaultwarden']):
            return config['services']['vaultwarden']['container_name']
    except Exception:
        return None
    return None

def check_docker_status():
    """Check Docker container status"""
    container_name = get_container_name()
    if not container_name:
        return "Error"

    try:
        # Get container health status
        cmd = ["docker", "inspect", "--format", 
               "{{.State.Status}},{{.State.Health.Status}}", container_name]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        status, health = result.stdout.strip().split(',')
        
        # Check container state
        if status == "running":
            if health == "healthy":
                return "Running"
            elif health == "starting":
                return "Starting"
            elif health in ["unhealthy", "none"]:
                return "Error"
        elif status == "restarting":
            return "Error"
        else:
            return "Error"
            
    except subprocess.CalledProcessError:
        return "Error"

def check_directories():
    """Check if required directories exist"""
    required_dirs = ['/etc/vault-warden', '/var/lib/vwdata']
    return all(os.path.isdir(dir) for dir in required_dirs)

def get_config_from_compose():
    """Read hostname and api_endpoint from docker-compose file"""
    compose_file = '/etc/vault-warden/docker-compose-vaultwarden.yml'
    try:
        if not os.path.exists(compose_file):
            return "", ""

        with open(compose_file, 'r') as f:
            config = yaml.safe_load(f)

        # Get DOMAIN from environment
        if ('services' in config and 
            'vaultwarden' in config['services'] and 
            'environment' in config['services']['vaultwarden']):
            
            env_list = config['services']['vaultwarden']['environment']
            
            # Look for DOMAIN in the environment list
            for env_var in env_list:
                if isinstance(env_var, str) and env_var.startswith('DOMAIN='):
                    domain = env_var.split('=', 1)[1]  # Split only on first '='
                    # Remove 'https://' and '/passwords/' if present
                    #domain = domain.replace('https://', '').replace('/passwords/', '')
                    return domain, domain

    except Exception as e:
        print(f"Error reading config: {e}")
        pass
    
    return "", ""


def get_status():
    """Get overall status checking both service and docker"""
    # First check if directories exist
    if not check_directories():
        return "Not deployed"
    
    # Check if service is running
    if not check_service_status('vaultwarden.service'):
        return "Down"
    
    # If service is running, check docker status
    return check_docker_status()

def main():
    # Get status using the new combined check
    status = get_status()
    
    # Get hostname and api_endpoint from docker-compose
    hostname, api_endpoint = get_config_from_compose()

    # Prepare result
    result = {
        "status": status,
        "hostname": hostname,
        "api_endpoint": api_endpoint
    }

    # Output JSON
    print(json.dumps(result))

if __name__ == "__main__":
    main()

