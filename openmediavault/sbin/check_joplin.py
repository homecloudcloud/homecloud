#!/usr/bin/env python3

import json
import os
import subprocess
import yaml
from typing import Dict, Tuple

def read_docker_compose() -> Tuple[bool, str]:
    """
    Read docker-compose.yaml and extract image name
    Returns: (exists, image_name)
    """
    compose_file = "/etc/joplin/docker-compose.yml"
    
    if not os.path.exists(compose_file):
        return False, ""
    
    try:
        with open(compose_file, 'r') as f:
            compose_data = yaml.safe_load(f)
            image_name = compose_data.get('services', {}).get('app', {}).get('image', '')
            return True, image_name
    except Exception as e:
        print(f"Error reading docker-compose file: {e}")
        return False, ""

def check_service_status() -> str:
    """
    Check systemd service status
    Returns: "active" or "inactive"
    """
    try:
        cmd = ["systemctl", "is-active", "joplin.service"]
        result = subprocess.run(cmd, capture_output=True, text=True)
        return result.stdout.strip()
    except Exception as e:
        print(f"Error checking service status: {e}")
        return "inactive"


def check_docker_status(image_name):
    """Get docker container status for given image"""
    try:
        cmd = ['docker', 'ps', '--filter', f'ancestor={image_name}', '--format', '{{.Status}}']
        result = subprocess.run(cmd, capture_output=True, text=True)
        status = result.stdout.strip().lower()
        
        if 'healthy' in status:
            return "Running"
        elif 'starting' in status:
            return "Starting"
        elif 'up' in status:
            return "Running"
        return "Down"
    except Exception:
        return "Down"

def read_env_file() -> Tuple[str, str]:
    """
    Read .env file and extract hostname and api_endpoint
    Returns: (hostname, api_endpoint)
    """
    env_file = "/etc/joplin/.env"
    hostname = ""
    api_endpoint = ""
    
    if not os.path.exists(env_file):
        return hostname, api_endpoint
    
    try:
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line.startswith('APP_BASE_URL='):
                    hostname = line.split('=', 1)[1].strip()
                    hostname = hostname.strip('"').strip("'")
                    api_endpoint = hostname
    except Exception as e:
        print(f"Error reading .env file: {e}")
    
    return hostname, api_endpoint

def get_joplin_status() -> Dict[str, str]:
    """
    Get Joplin status and return as dictionary
    """
    status_data = {
        "status": "Not deployed",
        "hostname": "",
        "api_endpoint": ""
    }
    
    # Check if docker-compose exists and get image name
    compose_exists, image_name = read_docker_compose()
    if not compose_exists:
        return status_data
    
    # Check service status
    service_status = check_service_status()
    if service_status != "active":
        status_data["status"] = "Down"
        return status_data
    
    # Check docker status
    docker_status = check_docker_status(image_name)
    status_data["status"] = docker_status
    
    # Only get hostname and api_endpoint if status is Running
    if docker_status == "Running":
        hostname, api_endpoint = read_env_file()
        status_data["hostname"] = hostname
        status_data["api_endpoint"] = api_endpoint
    
    return status_data

def main():
    """
    Main function to get and print status
    """
    try:
        status = get_joplin_status()
        print(json.dumps(status))
    except Exception as e:
        error_status = {
            "status": "Error",
            "hostname": "",
            "api_endpoint": "",
            "error": str(e)
        }
        print(json.dumps(error_status))

if __name__ == "__main__":
    main()

