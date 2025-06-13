#!/usr/bin/env python3

import json
import subprocess
import sys
import logging
from datetime import datetime
import time

# Configure logging
logging.basicConfig(
    filename='/var/log/app_updates.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def check_and_update_app(app_name):
    # Validate app name
    valid_apps = ['immich', 'paperless', 'joplin', 'jellyfin', 'vaultwarden', 'tailscale']
    
    if app_name not in valid_apps:
        error_msg = {
            "error": "Invalid app name",
            "message": f"App must be one of: {', '.join(valid_apps)}",
            "provided": app_name
        }
        logging.error(f"Invalid app request: {app_name}")
        print(json.dumps(error_msg, indent=2))
        sys.exit(1)

    try:
        # Check version command
    
        check_cmd = f"omv-rpc -u admin 'Homecloud' '{app_name}_check_version'"
        logging.info(f"Executing version check for {app_name}")
        
        # Execute check version command
        result = subprocess.check_output(check_cmd, shell=True, text=True)
        version_info = json.loads(result)
        
        logging.info(f"Version check result for {app_name}: {version_info}")

        # Check status
        if version_info['status'] in ['No-Updates', 'Error']:
            logging.info(f"No updates required for {app_name}. Status: {version_info['status']}")
            print(json.dumps(version_info, indent=2))
            return

        if version_info['status'] == 'Update-Available':
            logging.info(f"Update available for {app_name}. Current: {version_info['deployed_version']}, "
                        f"Available: {version_info['available_version']}")
            
            # Create update payload
            update_payload = json.dumps({"version": version_info["available_version"]})
            
            # if app is tailscale then update_cmd is f"omv-rpc -u admin 'Homecloud' '{app_name}_update_version'"
            if app_name == 'tailscale':
                update_cmd = f"omv-rpc -u admin 'Homecloud' '{app_name}_update_version'"
            else:
                # Prepare update command
                update_cmd = f"omv-rpc -u admin 'Homecloud' '{app_name}_update_version' '{update_payload}'"
            
            logging.info(f"Starting update for {app_name}")
            
            # Execute update command
            update_process = subprocess.Popen(
                update_cmd,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )

            # Monitor the update process
            while True:
                return_code = update_process.poll()
                if return_code is not None:
                    break
                time.sleep(1)  # Check every second

            # Get output and error messages
            stdout, stderr = update_process.communicate()

            if return_code == 0:
                success_msg = f"Successfully updated {app_name} to version {version_info['available_version']}"
                logging.info(success_msg)
                print(success_msg)
                if stdout:
                    logging.info(f"Update output: {stdout}")
            else:
                error_msg = f"Error updating {app_name}: {stderr}"
                logging.error(error_msg)
                print(error_msg)

    except subprocess.CalledProcessError as e:
        error_msg = f"Command execution failed: {str(e)}"
        logging.error(error_msg)
        print(json.dumps({"error": error_msg}, indent=2))
        sys.exit(1)
    except json.JSONDecodeError as e:
        error_msg = f"JSON parsing error: {str(e)}"
        logging.error(error_msg)
        print(json.dumps({"error": error_msg}, indent=2))
        sys.exit(1)
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        logging.error(error_msg)
        print(json.dumps({"error": error_msg}, indent=2))
        sys.exit(1)

def main():
    if len(sys.argv) != 2:
        error_msg = "Usage: script.py <app-name>"
        logging.error("Script called without proper arguments")
        print(json.dumps({"error": error_msg}, indent=2))
        sys.exit(1)

    app_name = sys.argv[1].lower()
    check_and_update_app(app_name)

if __name__ == "__main__":
    main()
