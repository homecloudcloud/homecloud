#!/usr/bin/env python3
import subprocess
import json
import yaml
import xml.etree.ElementTree as ET
import time
import sys

def run_command(command):
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        return None

def check_jellyfin_status():
    status = run_command("omv-rpc -u admin 'Homecloud' 'getJellyfinServiceStatus'")
    if status:
        try:
            status_json = json.loads(status)
            return status_json.get('status') == 'Running'
        except json.JSONDecodeError:
            return False
    return False

def get_config_paths():
    try:
        with open('/etc/jellyfin/docker-compose.yml', 'r') as file:
            compose_data = yaml.safe_load(file)
            
        if not compose_data or 'services' not in compose_data:
            return None, None

        jellyfin_service = compose_data['services'].get('jellyfin', {})
        if not jellyfin_service:
            return None, None

        # Get container config directory
        container_config_dir = None
        environment = jellyfin_service.get('environment', {})
        
        # Handle environment as both dictionary and list
        if isinstance(environment, dict):
            container_config_dir = environment.get('JELLYFIN_DATA_DIR')
        elif isinstance(environment, list):
            for env in environment:
                if isinstance(env, str) and 'JELLYFIN_DATA_DIR=' in env:
                    container_config_dir = env.split('=')[1]
                    break

        if not container_config_dir:
            return None, None

        # Find matching host path in volumes
        volumes = jellyfin_service.get('volumes', [])
        
        # Handle volumes as list
        if isinstance(volumes, list):
            for volume in volumes:
                if isinstance(volume, str) and ':' in volume:
                    host_path, container_path = volume.split(':')[0:2]
                    # Remove any trailing flags like :ro
                    container_path = container_path.split(':')[0]
                    if container_path == container_config_dir:
                        return host_path, container_config_dir
        
        # Handle volumes as dictionary
        elif isinstance(volumes, dict):
            for host_path, container_path in volumes.items():
                if container_path == container_config_dir:
                    return host_path, container_config_dir

        return None, None
    except Exception as e:
        print(f"Error reading docker-compose.yml: {str(e)}")
        return None, None

def modify_system_xml(host_path):
    try:
        xml_path = f"{host_path}/config/system.xml"
        tree = ET.parse(xml_path)
        root = tree.getroot()
        
        # Find and modify IsStartupWizardCompleted
        for elem in root.iter('IsStartupWizardCompleted'):
            if elem.text == 'true':
                elem.text = 'false'
                tree.write(xml_path)
                return True
        return False
    except Exception as e:
        print(f"Error modifying system.xml: {str(e)}")
        return False

def restart_jellyfin():
    return run_command("systemctl restart jellyfin.service") is not None

def wait_for_jellyfin_running(timeout=60):
    start_time = time.time()
    while time.time() - start_time < timeout:
        if check_jellyfin_status():
            return True
        time.sleep(5)
    return False

def main():
    # Step 1: Check if Jellyfin is running
    if not check_jellyfin_status():
        return {"status": "error", "message": "Error: Jellyfin not Running or not yet started"}

    # Step 2: Get configuration paths
    host_path, container_config_dir = get_config_paths()
    if not host_path or not container_config_dir:
        return {"status": "error", "message": "Error: Unable to reset password. Go to Reset page to reset app"}

    # Step 3 & 4: Modify system.xml
    if not modify_system_xml(host_path):
        return {"status": "error", "message": "Error: Failed to modify system configuration"}

    # Step 5: Restart Jellyfin
    if not restart_jellyfin():
        return {"status": "error", "message": "Error: Failed to restart Jellyfin service"}

    # Step 6: Wait for Jellyfin to be running
    if not wait_for_jellyfin_running():
        return {"status": "error", "message": "Error: Jellyfin failed to start after restart"}

    # Step 7: Return success
    return {"status": "success", "message": "Password reset successful"}

if __name__ == "__main__":
    result = main()
    print(json.dumps(result))
    sys.exit(0 if result["status"] == "success" else 1)

