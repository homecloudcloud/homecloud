#!/usr/bin/env python3

import sys
import os
import json
import subprocess
import shutil
import yaml
import requests
from packaging import version
from typing import Dict, Tuple, Optional

def run_command(cmd: list) -> Tuple[int, str, str]:
    """Run command and return returncode, stdout, stderr"""
    try:
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        stdout, stderr = process.communicate()
        return process.returncode, stdout.strip(), stderr.strip()
    except Exception as e:
        return 1, "", str(e)

def get_service_status() -> Dict:
    """Get Joplin service status"""
    try:
        cmd = ["omv-rpc", "-u", "admin", "Homecloud", "getJoplinServiceStatus"]
        returncode, stdout, stderr = run_command(cmd)
        if returncode == 0:
            return json.loads(stdout)
        raise Exception(f"Failed to get service status: {stderr}")
    except Exception as e:
        print(f"Error getting service status: {e}")
        sys.exit(1)

def validate_version(target_version: str) -> bool:
    """Validate version against GitHub tags"""
    try:
        url = "https://api.github.com/repos/etechonomy/joplin-server/tags"
        response = requests.get(url)
        response.raise_for_status()
        tags = response.json()
        available_versions = [tag['name'] for tag in tags]
        return target_version in available_versions
    except Exception as e:
        print(f"Error validating version: {e}")
        return False

def create_directories() -> None:
    """Create required directories"""
    directories = [
        "/etc/joplin",
        "/var/lib/joplin",
        "/var/lib/joplin/postgres"
    ]
    try:
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
        
        # Change ownership
        subprocess.run(["chown", "-R", "joplin:joplin", "/var/lib/joplin"])
    except Exception as e:
        print(f"Error creating directories: {e}")
        sys.exit(1)

def check_and_create_systemd_service() -> None:
    """Check and create systemd service if needed"""
    service_content = """[Unit]
Description=Joplin
Requires=docker.service
After=docker.service

[Service]
Type=simple
Restart=always
RestartSec=10
ExecStart=/usr/bin/docker compose -f /etc/joplin/docker-compose.yml up 
ExecStop=/usr/bin/docker compose -f /etc/joplin/docker-compose.yml down

[Install]
WantedBy=multi-user.target
"""
    try:
        # Check if service exists and is enabled
        cmd = ["systemctl", "is-enabled", "joplin.service"]
        returncode, _, _ = run_command(cmd)
        
        if returncode != 0:
            # Create service file
            with open("/etc/systemd/system/joplin.service", "w") as f:
                f.write(service_content)
            
            # Reload systemd and enable service
            subprocess.run(["systemctl", "daemon-reload"])
            subprocess.run(["systemctl", "enable", "joplin.service"])
    except Exception as e:
        print(f"Error managing systemd service: {e}")
        sys.exit(1)

def update_yaml_configuration(target_version: str) -> None:
    """Update YAML configuration"""
    try:
        # Update YAML via API
        response = requests.post(
            "https://127.0.0.1:5000/update_YAML",
            verify=False
        )
        response.raise_for_status()
        
        # Update image version in docker-compose.yml
        with open("/etc/joplin/docker-compose.yml", "r") as f:
            config = yaml.safe_load(f)
        
        image_name = config['services']['app']['image'].split(':')[0]
        # Remove 'v' prefix for Docker image tag
        docker_version = target_version.lstrip('v')
        config['services']['app']['image'] = f"{image_name}:{docker_version}"
        
        with open("/etc/joplin/docker-compose.yml", "w") as f:
            yaml.dump(config, f)
    except Exception as e:
        print(f"Error updating YAML configuration: {e}")
        sys.exit(1)

def get_deployed_version() -> str:
    """Get currently deployed version"""
    try:
        cmd = ["omv-rpc", "-u", "admin", "Homecloud", "joplin_check_version"]
        returncode, stdout, stderr = run_command(cmd)
        if returncode == 0:
            return json.loads(stdout)['deployed_version']
        raise Exception(f"Failed to get deployed version: {stderr}")
    except Exception as e:
        print(f"Error getting deployed version: {e}")
        sys.exit(1)

def main():
    if len(sys.argv) != 2:
        print("Usage: joplin_version_update.py <version>")
        print("Example: joplin_version_update.py 2.11.2")
        sys.exit(1)

    # Add 'v' prefix to version if not present
    target_version = sys.argv[1]
    if not target_version.startswith('v'):
        target_version = f"v{target_version}"
    
    # Get current service status
    status = get_service_status()
    is_new_deployment = status['status'] == "Not deployed"

    # Validate target version
    #if not validate_version(target_version):
    #    print(f"Error: Version {target_version} not found in GitHub tags")
    #    sys.exit(1)

    if is_new_deployment:
        # New deployment
        create_directories()
        check_and_create_systemd_service()
        
        # Copy configuration files
        shutil.copy("/etc/homecloud/docker-compose-joplin.yml", "/etc/joplin/docker-compose.yml")
        shutil.copy("/etc/homecloud/joplin.env", "/etc/joplin/.env")
        
        update_yaml_configuration(target_version)
        
        # Pull and start service
        # Remove 'v' prefix for Docker image tag
        docker_version = target_version.lstrip('v')
        #subprocess.run(["docker", "pull", f"joplin/server:{docker_version}"])
        try:
            response = requests.post(
                "https://localhost:5000/setup_firewall?service=joplin",
                verify=False,
                timeout=30
            )
            if response.status_code != 200:
                print("Warning: Failed to update firewall rules")
        except Exception as e:
            print(f"Warning: Failed to setup firewall: {str(e)}")


        subprocess.run(["docker", "compose", "-f" , "/etc/joplin/docker-compose.yml", "pull"])
        subprocess.run(["systemctl", "start", "joplin.service"])
    else:
        # Version update
        deployed_version = get_deployed_version()
        
        # Add 'v' prefix to deployed version if not present
        if not deployed_version.startswith('v'):
            deployed_version = f"v{deployed_version}"
        
        # Compare versions
        if version.parse(target_version.lstrip('v')) <= version.parse(deployed_version.lstrip('v')):
            print(f"Error: Target version {target_version} is not greater than deployed version {deployed_version}")
            sys.exit(1)
        
        # Stop service
        subprocess.run(["systemctl", "stop", "joplin.service"])
        
        # Backup current configuration
        shutil.copy("/etc/joplin/docker-compose.yml", f"/etc/joplin/docker-compose.yml.{deployed_version}")
        
        update_yaml_configuration(target_version)
        
        # Pull and start service
        # Remove 'v' prefix for Docker image tag
        docker_version = target_version.lstrip('v')
        #subprocess.run(["docker", "pull", f"joplin/server:{docker_version}"])
        try:
            response = requests.post(
                "https://localhost:5000/setup_firewall?service=joplin",
                verify=False,
                timeout=30
            )
            if response.status_code != 200:
                print("Warning: Failed to update firewall rules")
        except Exception as e:
            print(f"Warning: Failed to setup firewall: {str(e)}")

        subprocess.run(["docker", "compose", "-f" , "/etc/joplin/docker-compose.yml", "pull"])
        subprocess.run(["systemctl", "start", "joplin.service"])

if __name__ == "__main__":
    main()

