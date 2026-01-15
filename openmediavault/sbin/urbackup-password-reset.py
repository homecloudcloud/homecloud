#!/usr/bin/env python3

import argparse
import json
import sqlite3
import subprocess
import sys
from datetime import datetime

def check_service_status():
    """Check if urbackup service is running and deployed"""
    try:
        # Check if service is running
        result = subprocess.run(['systemctl', 'is-active', 'urbackup.service'], 
                              capture_output=True, text=True, check=False)
        if result.stdout.strip() == 'active':
            return True, "Running"
        
        # Check deployment status via RPC
        result = subprocess.run(['omv-rpc', '-u', 'admin', 'Homecloud', 'getUrbackupServiceStatus'],
                              capture_output=True, text=True, check=True)
        status_data = json.loads(result.stdout)
        return status_data.get('status') == 'Running', status_data.get('status', 'Unknown')
    except:
        return False, "Not deployed"

def validate_user(username):
    """Check if user exists in urbackup database"""
    try:
        conn = sqlite3.connect('/var/lib/urbackup/urbackup/backup_server_settings.db')
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM si_users WHERE name = ?", (username,))
        result = cursor.fetchone()
        conn.close()
        return result is not None
    except:
        return False

def get_container_name():
    """Get urbackup container name"""
    try:
        result = subprocess.run(['docker', 'ps', '--format', '{{.Names}}', '--filter', 'name=urbackup'], 
                              capture_output=True, text=True, check=True)
        return result.stdout.strip() or 'urbackup'
    except:
        return 'urbackup'

def generate_password():
    """Generate password with format Urbackup@{day}{month}"""
    now = datetime.now()
    day = now.strftime('%a').lower()  # First 3 letters of day
    month = now.strftime('%b').lower()  # First 3 letters of month
    return f"Urbackup@{day}{month}"

def change_password(username, password, container_name):
    """Change urbackup user password"""
    try:
        result = subprocess.run(['docker', 'exec', container_name, 'urbackupsrv', 'reset-admin-pw', 
                               '-a', username, '-p', password],
                              capture_output=True, text=True, check=False)
        
        # Check if password change was successful
        success = "Changed admin password" in result.stdout and "Updated admin rights" in result.stdout
        return success, result.stdout
    except:
        return False, "Command execution failed"

def main():
    parser = argparse.ArgumentParser(description='Change UrBackup server password')
    parser.add_argument('-u', '--username', required=True, help='Username to change password for')
    args = parser.parse_args()
    
    # Check service status
    is_running, status = check_service_status()
    if not is_running:
        print(json.dumps({"success": True, "error": f"UrBackup service not running. Status: {status}"}))
        return
    
    # Validate user exists
    if not validate_user(args.username):
        print(json.dumps({"success": True, "error": "User not valid"}))
        return
    
    # Generate password and change it
    password = generate_password()
    container_name = get_container_name()
    success, output = change_password(args.username, password, container_name)
    
    if success:
        print(json.dumps({"success": True, "username": args.username, "password": password}))
    else:
        print(json.dumps({"success": True, "error": "Password change failed", "output": output}))

if __name__ == "__main__":
    main()