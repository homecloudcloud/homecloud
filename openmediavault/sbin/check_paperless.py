#!/usr/bin/env python3

import json
import os
import subprocess
import yaml

def get_service_status(service_name):
    """Check if a systemd service is active"""
    try:
        result = subprocess.run(['systemctl', 'is-active', service_name], 
                              capture_output=True, text=True)
        return result.stdout.strip() == "active"
    except Exception:
        return False

def get_container_status(image_name):
    """Get docker container status for given image"""
    try:
        cmd = ['docker', 'ps', '--filter', f'ancestor={image_name}', '--format', '{{.Status}}']
        result = subprocess.run(cmd, capture_output=True, text=True)
        status = result.stdout.strip().lower()
        
        if 'healthy' in status:
            return "Running"
        elif 'starting' in status:
            return "Starting"
        return "Down"
    except Exception:
        return "Down"

def read_env_vars():
    """Read environment variables from files"""
    env_vars = {}
    env_files = [
        "/etc/paperless/docker-compose.env"
    ]
    
    for env_file in env_files:
        try:
            if os.path.exists(env_file):
                with open(env_file, 'r') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#'):
                            key_value = line.split('=', 1)
                            if len(key_value) == 2:
                                key, value = key_value
                                if key == "PAPERLESS_URL" and not env_vars.get("PAPERLESS_URL"):
                                    env_vars["PAPERLESS_URL"] = value.strip('"\'')
                                elif key == "PAPERLESS_FORCE_SCRIPT_NAME" and not env_vars.get("PAPERLESS_FORCE_SCRIPT_NAME"):
                                    env_vars["PAPERLESS_FORCE_SCRIPT_NAME"] = value.strip('"\'')
        except Exception:
            continue
            
    return env_vars

def get_paperless_status():
    """Get paperless status and return as JSON"""
    status_info = {
        "status": "Not deployed",
        "hostname": "",
        "api_endpoint": ""
    }

    # Check if docker-compose file exists
    compose_file = "/etc/paperless/docker-compose.yml"
    if not os.path.exists(compose_file):
        return status_info

    # Read docker-compose file
    try:
        with open(compose_file, 'r') as f:
            compose_data = yaml.safe_load(f)
        
        image_name = compose_data.get('services', {}).get('webserver', {}).get('image')
        if not image_name:
            return status_info
    except Exception:
        return status_info

    # Check service status
    if not get_service_status('paperless'):
        status_info["status"] = "Down"
        return status_info

    # Check container status
    status_info["status"] = get_container_status(image_name)

    # Get hostname and path from env files
    env_vars = read_env_vars()
    
    if "PAPERLESS_URL" in env_vars:
        hostname = env_vars["PAPERLESS_URL"].rstrip('/')
        path = env_vars.get("PAPERLESS_FORCE_SCRIPT_NAME", "").rstrip('/')
        
        full_hostname = f"{hostname}{path}"
        status_info["hostname"] = f"{full_hostname}/"
        status_info["api_endpoint"] = f"{full_hostname}/"

    return status_info

def main():
    """Main function"""
    try:
        status = get_paperless_status()
        #print(json.dumps(status, indent=2))
        print(json.dumps(status))
    except Exception:
        error_status = {
            "status": "Error",
            "hostname": "",
            "api_endpoint": ""
        }
        print(json.dumps(error_status, indent=2))

if __name__ == "__main__":
    main()

