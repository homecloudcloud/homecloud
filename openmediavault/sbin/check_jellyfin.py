#!/usr/bin/env python3
import os
import json
import yaml
import subprocess

def check_jellyfin_status():
    result = {
        "status": "Not deployed",
        "hostname": "",
        "api_endpoint": ""
    }
    
    # Check if docker-compose file exists
    compose_file = "/etc/jellyfin/docker-compose.yml"
    if not os.path.exists(compose_file):
        return result

    # Read docker-compose file
    try:
        with open(compose_file, 'r') as file:
            compose_data = yaml.safe_load(file)
            
        # Get image name
        image_name = compose_data['services']['jellyfin']['image']
        
        # Get hostname from environment variables
        env_vars = compose_data['services']['jellyfin'].get('environment', {})
        if isinstance(env_vars, list):
            # Handle list format of environment variables
            env_dict = {}
            for item in env_vars:
                if isinstance(item, str) and '=' in item:
                    key, value = item.split('=', 1)
                    env_dict[key] = value
            env_vars = env_dict
            
        # Check for hostname in different possible environment variables
        hostname_vars = ['JELLYFIN_PublishedServerUrl', 'JELLYFIN_BaseUrl', 'JELLYFIN_BASEURL']
        for var in hostname_vars:
            if var in env_vars:
                result['hostname'] = env_vars[var]
                result['api_endpoint'] = env_vars[var]
                break

        # Check jellyfin.service status
        service_cmd = ['systemctl', 'is-active', 'jellyfin.service']
        service_status = subprocess.run(service_cmd, capture_output=True, text=True)
        
        if service_status.stdout.strip() != 'active':
            result['status'] = "Down"
            return result

        # Check docker container status
        docker_cmd = ['docker', 'ps', '--filter', f'ancestor={image_name}', '--format', '{{.Status}}']
        docker_status = subprocess.run(docker_cmd, capture_output=True, text=True)
        
        container_status = docker_status.stdout.strip().lower()
        
        if 'healthy' in container_status:
            result['status'] = "Running"
        elif 'starting' in container_status:
            result['status'] = "Starting"
        else:
            result['status'] = "Down"

    except Exception as e:
        result['status'] = "Error"
        
    return result

def main():
    status = check_jellyfin_status()
    print(json.dumps(status))

if __name__ == "__main__":
    main()

