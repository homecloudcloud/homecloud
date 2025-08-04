#!/usr/bin/env python3

import os
import json
import subprocess
import re
import sys
from datetime import datetime

# Define the list of valid apps
valid_apps = ["immich", "paperless-ngx", "vaultwarden", "jellyfin", "joplin", "drive"]

# Function to execute the RPC command and return the JSON output
def get_external_disks():
    try:
        result = subprocess.run(
            ['omv-rpc', '-u', 'admin', 'Homecloud', 'get_external_disks'],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True
        )
        return json.loads(result.stdout)
    except subprocess.CalledProcessError:
        print("Error executing omv-rpc command.")
        return None

# Function to check if a directory name is a valid version (numerical format with optional suffixes)
def is_valid_version(name):
    # Match versions like: 1.2.3, 10.11.0, 10.11.0-rc2, v1.2.3, etc.
    #return bool(re.match(r"^v?\d+(\.\d+)+(-\w+\d*)?$", name))
    return bool(re.match(r"^(v?|\w+-)\d+(\.\d+)+(-\w+\d*)?$", name))



# Function to calculate the size of a directory in GB
def get_directory_size(directory):
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(directory):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            total_size += os.path.getsize(fp)
    return total_size / (1024 ** 3)  # Convert to GB

# Function to search for valid backup directories and collect data
def collect_backup_data(app_name):
    # Get external disks data
    disks_data = get_external_disks()
    if not disks_data or disks_data.get("total", 0) == 0:
        return {"total": 0, "data": []}

    result_data = []

    for disk in disks_data["data"]:
        mount_path = disk["mount_path"]
        backup_dir = os.path.join(mount_path, "homecloud-backups", f"{app_name}_backups")
        
        # Check if the {app_name}_backups directory exists
        if os.path.isdir(backup_dir):
            for version in os.listdir(backup_dir):
                version_path = os.path.join(backup_dir, version)

                # Check if directory is a valid version
                if os.path.isdir(version_path) and is_valid_version(version):
                    for timestamp_dir in os.listdir(version_path):
                        timestamp_path = os.path.join(version_path, timestamp_dir)

                        # Check if directory name matches the timestamp format (YYYY-MM-DD_HH-MM)
                        if os.path.isdir(timestamp_path) and bool(re.match(r"\d{4}-\d{2}-\d{2}_\d{2}-\d{2}", timestamp_dir)):
                            timestamp = datetime.strptime(timestamp_dir, "%Y-%m-%d_%H-%M")
                            size = get_directory_size(timestamp_path)

                            # Include time (HH:MM) in timestamp
                            result_data.append({
                                "disk": disk["name"],
                                "mount_path": timestamp_path,
                                "version": version,  # Add version info
                                "timestamp": timestamp.strftime("%d-%b-%Y %H:%M"),
                                "size": round(size, 3)
                            })

    return {"total": len(result_data), "data": result_data}

# Main execution flow
if __name__ == "__main__":
    # Check if app name is passed as a command-line argument
    if len(sys.argv) != 2:
        print("Usage: backup_script <app_name>")
        sys.exit(1)

    app_name = sys.argv[1].strip().lower()

    # Validate app name
    if app_name not in valid_apps:
        # Return empty array if the app name is not valid
        print(json.dumps({"total": 0, "data": []}))
    else:
        # Collect backup data for the valid app name
        backup_data = collect_backup_data(app_name)
        print(json.dumps(backup_data, indent=4))

