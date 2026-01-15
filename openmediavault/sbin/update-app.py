#!/usr/bin/env python3

import json
import subprocess
import sys
import logging
import logging.handlers

from datetime import datetime
import time

# Configure logging
logger = logging.getLogger('App-updates')
logger.setLevel(logging.INFO)

# File handler for /var/log/app_updates.log
file_handler = logging.FileHandler('/var/log/app_updates.log', mode='a')
file_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
file_handler.setFormatter(file_formatter)
logger.addHandler(file_handler)

# Syslog handler
syslog_handler = logging.handlers.SysLogHandler(address='/dev/log')
syslog_formatter = logging.Formatter('App-updates: %(levelname)s - %(message)s')
syslog_handler.setFormatter(syslog_formatter)
logger.addHandler(syslog_handler)

def check_docker_status(app_name, previous_version):
    """Check Docker container status and revert if unhealthy"""
    logger.info(f"Checking Docker status for {app_name}")
    
    # Wait up to 5 minutes for container to be ready
    max_wait_time = 300  # 5 minutes
    check_interval = 10  # Check every 10 seconds
    elapsed_time = 0
    
    while elapsed_time < max_wait_time:
        try:
            # Check container status
            result = subprocess.run(
                ["docker", "ps", "-a", "--filter", f"name={app_name}", "--format", "{{.Status}}"],
                capture_output=True, text=True, check=True
            )
            
            status = result.stdout.strip()
            logger.info(f"{app_name} Docker status: {status}")
            
            if "Up" in status and ("healthy" in status.lower() or "starting" not in status.lower()):
                logger.info(f"{app_name} is running and healthy")
                return True
            elif any(state in status.lower() for state in ["unhealthy", "exited", "dead", "oomkilled", "restarting"]):
                logger.error(f"{app_name} container is in error state: {status}")
                break
                
        except subprocess.CalledProcessError as e:
            logger.error(f"Error checking Docker status: {e}")
            break
            
        time.sleep(check_interval)
        elapsed_time += check_interval
    
    # If we reach here, the container is not healthy - revert
    logger.error(f"{app_name} failed to start properly after update, reverting to {previous_version}")
    
    try:
        # Stop the service
        stop_cmd = f"systemctl stop {app_name}.service"
        subprocess.run(stop_cmd, shell=True, check=True)
        
        # Revert to previous version
        revert_cmd = f"/sbin/{app_name}_ver_update.py {previous_version}"
        subprocess.run(revert_cmd, shell=True, check=True)
        
        logger.info(f"Successfully reverted {app_name} to {previous_version}")
        
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to revert {app_name}: {e}")
    
    return False

def check_and_update_app(app_name):
    # Validate app name
    valid_apps = ['immich', 'paperless', 'joplin', 'jellyfin', 'vaultwarden', 'tailscale', 'traefik', 'duplicati','urbackup']
    
    if app_name not in valid_apps:
        error_msg = {
            "error": "Invalid app name",
            "message": f"App must be one of: {', '.join(valid_apps)}",
            "provided": app_name
        }
        logger.error(f"Invalid app request: {app_name}")
        print(json.dumps(error_msg, indent=2))
        sys.exit(1)

    try:
        # Check version command
    
        check_cmd = f"omv-rpc -u admin 'Homecloud' '{app_name}_check_version'"
        logger.info(f"Executing version check for {app_name}")
        
        # Execute check version command
        result = subprocess.check_output(check_cmd, shell=True, text=True)
        version_info = json.loads(result)
        
        logger.info(f"Version check result for {app_name}: {version_info}")

        # Check status
        if version_info['status'] in ['No-Updates', 'Error']:
            logger.info(f"No updates required for {app_name}. Status: {version_info['status']}")
            print(json.dumps(version_info, indent=2))
            return

        if version_info['status'] == 'Update-Available':
            logger.info(f"Update available for {app_name}. Current: {version_info['deployed_version']}, "
                        f"Available: {version_info['available_version']}")
            
            # Create update payload
            update_payload = json.dumps({"version": version_info["available_version"]})
            
            # Use /sbin/{app_name}_ver_update.py for all apps
            update_cmd = f"/sbin/{app_name}_ver_update.py {version_info['available_version']}"
            if app_name == 'tailscale':
                update_cmd = f"/sbin/{app_name}_ver_update.py --update"
            
            logger.info(f"Starting update for {app_name}")
            print(f"Executing: {update_cmd}")
            
            # Execute update command
            update_process = subprocess.Popen(
                update_cmd,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )

            # Monitor the update process and print progress
            stdout_lines = []
            while True:
                output = update_process.stdout.readline()
                if output:
                    print(output.strip())
                    stdout_lines.append(output)
                
                return_code = update_process.poll()
                if return_code is not None:
                    break

            # Get any remaining output
            remaining_output = update_process.stdout.read()
            if remaining_output:
                print(remaining_output.strip())
                stdout_lines.append(remaining_output)
            
            stdout = ''.join(stdout_lines)
            stderr = ""

            if return_code == 0:
                # For non-tailscale apps, check Docker status after update
                if app_name != 'tailscale':
                    logger.info(f"Checking Docker status for {app_name} after update")
                    if not check_docker_status(app_name, version_info['deployed_version']):
                        return
                
                success_msg = f"Successfully updated {app_name} to version {version_info['available_version']}"
                logger.info(success_msg)
                print(success_msg)
                if stdout:
                    logger.info(f"Update output: {stdout}")
            else:
                error_msg = f"Error updating {app_name}: {stderr}"
                logger.error(error_msg)
                print(error_msg)

    except subprocess.CalledProcessError as e:
        error_msg = f"Command execution failed: {str(e)}"
        logger.error(error_msg)
        print(json.dumps({"error": error_msg}, indent=2))
        sys.exit(1)
    except json.JSONDecodeError as e:
        error_msg = f"JSON parsing error: {str(e)}"
        logger.error(error_msg)
        print(json.dumps({"error": error_msg}, indent=2))
        sys.exit(1)
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        logger.error(error_msg)
        print(json.dumps({"error": error_msg}, indent=2))
        sys.exit(1)

def main():
    if len(sys.argv) != 2:
        error_msg = "Usage: script.py <app-name>"
        logger.error("Script called without proper arguments")
        print(json.dumps({"error": error_msg}, indent=2))
        sys.exit(1)

    app_name = sys.argv[1].lower()
    check_and_update_app(app_name)

if __name__ == "__main__":
    main()
