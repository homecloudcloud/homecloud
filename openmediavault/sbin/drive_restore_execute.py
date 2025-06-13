#!/usr/bin/python3
import sys
import os
import json
import subprocess
import shutil
from pathlib import Path

def check_path_and_permissions(backup_path):
    """Validate path exists and has read permissions"""
    if not os.path.exists(backup_path):
        raise ValueError(f"Backup path {backup_path} does not exist")
    if not os.access(backup_path, os.R_OK):
        raise ValueError(f"No read permissions for {backup_path}")
    return True

def get_directory_size(path):
    """Calculate total size of directory in bytes"""
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(path):
        for filename in filenames:
            file_path = os.path.join(dirpath, filename)
            total_size += os.path.getsize(file_path)
    return total_size

def get_free_space():
    """Get free space using omv-rpc command"""
    try:
        cmd = ["omv-rpc", "-u", "admin", "Homecloud", "get_free_space_internaldisk"]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        free_space = json.loads(result.stdout)
        
        if isinstance(free_space, dict):
            if 'response' in free_space:
                free_space_gb = float(free_space['response'])
            else:
                free_space_gb = float(next(value for value in free_space.values() 
                                        if isinstance(value, (int, float, str)) 
                                        and str(value).replace('.','').isdigit()))
        else:
            free_space_gb = float(free_space)

        return free_space_gb * (1024 ** 3)
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Failed to get free space: {e}")
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Failed to parse free space JSON: {e}")
    except (ValueError, AttributeError) as e:
        raise RuntimeError(f"Failed to process free space value: {e}")

def validate_directory_contents(backup_path):
    """Verify backup path contains at least one directory"""
    for item in os.listdir(backup_path):
        if os.path.isdir(os.path.join(backup_path, item)):
            return True
    return False

def manage_smb_service(action):
    """Start or stop SMB service"""
    try:
        # Redirect stdout and stderr to /dev/null to suppress output
        with open(os.devnull, 'w') as devnull:
            subprocess.run(["systemctl", action, "smb.service"], 
                         check=True,
                         stdout=devnull,
                         stderr=devnull)
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Failed to {action} SMB service: {e}")

def copy_with_metadata(src, dst):
    """Copy directory recursively preserving metadata"""
    try:
        # If destination exists, remove it first
        if os.path.exists(dst):
            if os.path.isdir(dst):
                shutil.rmtree(dst)
            else:
                os.remove(dst)
                
        # Copy with ignore function to handle problematic files
        def ignore_special_files(dir, files):
            return [f for f in files if os.path.islink(os.path.join(dir, f))]
            
        shutil.copytree(src, dst, 
                       symlinks=True,  # Preserve symlinks
                       ignore=ignore_special_files,
                       dirs_exist_ok=True,
                       copy_function=shutil.copy2)
    except shutil.Error as e:
        # Convert the error list to a more readable format
        if isinstance(e.args[0], list):
            error_msg = "\n".join(str(err) for err in e.args[0])
        else:
            error_msg = str(e)
        raise RuntimeError(f"Copy failed: {error_msg}")

def main():
    if len(sys.argv) != 2:
        print("Usage: script.py <backup_path>")
        sys.exit(1)

    backup_path = sys.argv[1]

    try:
        # 1 & 2. Validate path and permissions
        check_path_and_permissions(backup_path)

        # 3. Check space requirements
        backup_size = get_directory_size(backup_path)
        free_space = get_free_space()
        
        if backup_size > free_space:
            raise ValueError(
                f"Insufficient space. Required: {backup_size/1024**3:.2f}GB, "
                f"Available: {free_space/1024**3:.2f}GB"
            )

        # 4. Validate directory contents
        if not validate_directory_contents(backup_path):
            raise ValueError(f"Backup path {backup_path} must contain at least one directory")

        # 5. Stop SMB service
        print("Stopping SMB service...")
        manage_smb_service("stop")

        try:
            # 6. Copy files
            print("Copying files...")
            for item in os.listdir(backup_path):
                src = os.path.join(backup_path, item)
                dst = os.path.join("/home", item)
                if os.path.isdir(src):
                    if os.path.exists(dst):
                        print(f"Removing existing directory: {dst}")
                        shutil.rmtree(dst)
                    copy_with_metadata(src, dst)
                else:
                    if os.path.exists(dst):
                        print(f"Removing existing file: {dst}")
                        os.remove(dst)
                    shutil.copy2(src, dst)

        finally:
            # 7. Start SMB service
            print("Starting SMB service...")
            manage_smb_service("start")

        print("Backup completed successfully")

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()