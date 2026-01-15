#!/usr/bin/env python3

import json
import subprocess
import sys
import uuid

def run_omv_command(cmd):
    try:
        result = subprocess.check_output(cmd, shell=True, text=True)
        return json.loads(result)
    except subprocess.CalledProcessError as e:
        error_msg = {
            "error": "Command execution failed",
            "message": str(e)
        }
        print(json.dumps(error_msg))
        sys.exit(1)
    except json.JSONDecodeError as e:
        error_msg = {
            "error": "JSON parsing error",
            "message": str(e)
        }
        print(json.dumps(error_msg))
        sys.exit(1)

def deploy_cron():
    try:
        subprocess.run("omv-salt deploy run cron", shell=True, check=True)
    except subprocess.CalledProcessError as e:
        error_msg = {
            "error": "Failed to deploy cron configuration",
            "message": str(e)
        }
        print(json.dumps(error_msg))
        sys.exit(1)

def get_new_uuid():
    cmd = "/usr/sbin/omv-env get OMV_CONFIGOBJECT_NEW_UUID"
    try:
        result = subprocess.check_output(cmd, shell=True, text=True)
        # Extract UUID from the output
        uuid_value = result.strip().split('=')[1]
        return uuid_value
    except Exception as e:
        error_msg = {
            "error": "Failed to generate UUID",
            "message": str(e)
        }
        print(json.dumps(error_msg))
        sys.exit(1)

def find_existing_cron(app_name):
    cmd = "omv-rpc -u admin 'Cron' 'getList' '{\"start\": 0, \"limit\":-1,\"type\":[\"userdefined\"]}'"
    cron_list = run_omv_command(cmd)
    
    update_cmd = f"/sbin/update-app.py {app_name}"
    for job in cron_list.get('data', []):
        if job['command'] == update_cmd:
            return job
    return None

def validate_app_name(app_name):
    valid_apps = ['immich', 'paperless', 'joplin', 'jellyfin', 'vaultwarden', 'tailscale', 'traefik', 'duplicati', 'urbackup']
    if app_name not in valid_apps:
        error_msg = {
            "error": "Invalid app name",
            "message": f"App must be one of: {', '.join(valid_apps)}",
            "provided": app_name
        }
        print(json.dumps(error_msg))
        sys.exit(1)

def validate_action(action):
    valid_actions = ['status', 'enable', 'disable']
    if action not in valid_actions:
        error_msg = {
            "error": "Invalid action",
            "message": f"Action must be one of: {', '.join(valid_actions)}",
            "provided": action
        }
        print(json.dumps(error_msg))
        sys.exit(1)

def manage_auto_update(app_name, action):
    try:
        existing_job = find_existing_cron(app_name)

        if action == 'status':
            status = {
                "status": "enabled" if existing_job and existing_job.get('enable') else "disabled"
            }
            print(json.dumps(status))
            return

        elif action == 'enable':
            if existing_job and existing_job.get('enable'):
                status = {
                    "message": f"Auto-update for {app_name} is already enabled",
                    "status": "enabled"
                }
            else:
                new_uuid = get_new_uuid()
                cron_config = {
                    "uuid": new_uuid,
                    "enable": True,
                    "execution": "daily",
                    "sendemail": False,
                    "comment": f"Auto update for {app_name}",
                    "type": "userdefined",
                    "minute": ["0"],
                    "everynminute": False,
                    "hour": ["0"],
                    "everynhour": False,
                    "month": ["*"],
                    "dayofmonth": ["*"],
                    "everyndayofmonth": False,
                    "dayofweek": ["*"],
                    "username": "root",
                    "command": f"/sbin/update-app.py {app_name}"
                }
                
                # Create the command by separating JSON creation from f-string
                json_data = json.dumps(cron_config)
                cmd = f"omv-rpc -u admin 'Cron' 'set' '{json_data}'"
                run_omv_command(cmd)
                
                # Deploy cron changes
                deploy_cron()
                
                status = {
                    "message": f"Auto-update for {app_name} has been enabled",
                    "status": "enabled"
                }
            print(json.dumps(status))

        elif action == 'disable':
            if existing_job:
                # Create delete payload separately from f-string
                delete_payload = json.dumps({"uuid": existing_job["uuid"]})
                cmd = f"omv-rpc -u admin 'Cron' 'delete' '{delete_payload}'"
                run_omv_command(cmd)
                
                # Deploy cron changes
                deploy_cron()
                
                status = {
                    "message": f"Auto-update for {app_name} has been disabled",
                    "status": "disabled"
                }
            else:
                status = {
                    "message": f"Auto-update for {app_name} is already disabled",
                    "status": "disabled"
                }
            print(json.dumps(status))

    except Exception as e:
        error_msg = {
            "error": "Unexpected error",
            "message": str(e)
        }
        print(json.dumps(error_msg))
        sys.exit(1)

def main():
    if len(sys.argv) != 3:
        error_msg = {
            "error": "Invalid arguments",
            "message": "Usage: script.py <app-name> <action>",
            "valid_actions": "status, enable, disable"
        }
        print(json.dumps(error_msg))
        sys.exit(1)

    app_name = sys.argv[1].lower()
    action = sys.argv[2].lower()

    # Validate inputs
    validate_app_name(app_name)
    validate_action(action)

    # Process the request
    manage_auto_update(app_name, action)

if __name__ == "__main__":
    main()
