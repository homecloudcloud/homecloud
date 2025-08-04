#!/usr/bin/python3
import sys
import os
import json
import subprocess
import shutil
from pathlib import Path
import pwd

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
    """Copy directory recursively preserving metadata and fix ownership"""
    try:
        # Create destination directory if it doesn't exist
        os.makedirs(dst, exist_ok=True)
        
        # Use rsync to copy files, preserving metadata and overwriting existing files
        cmd = [
            "rsync", 
            "-a",  # Archive mode (preserves permissions, timestamps, etc.)
            "--ignore-errors",  # Ignore errors
            src + "/",  # Source with trailing slash to copy contents
            dst  # Destination
        ]
        
        subprocess.run(cmd, check=True)
        
        # Fix ownership after copy by getting the directory name (username)
        username = os.path.basename(dst)
        try:
            # Check if user exists
            pwd.getpwnam(username)
            
            # Fix ownership recursively
            chown_cmd = ["chown", "-R", f"{username}:users", dst]
            subprocess.run(chown_cmd, check=True)
            print(f"Fixed ownership for {dst} to {username}:users")
        except KeyError:
            # User doesn't exist, skip ownership fix
            print(f"Warning: User {username} not found, skipping ownership fix")
        except subprocess.CalledProcessError as e:
            print(f"Warning: Failed to fix ownership: {e}")
    except subprocess.CalledProcessError as e:
        print(f"Warning: rsync encountered errors: {e}")

def get_data_vol_mount_point():
    """Find mount point for DATA_VOL-home_dirs"""
    try:
        cmd = "df -P /dev/mapper/DATA_VOL-home_dirs | tail -1 | awk '{print $NF}'"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=True)
        mount_point = result.stdout.strip()
        
        if not mount_point:
            raise ValueError("Could not find mount point for DATA_VOL-home_dirs")
            
        return mount_point
    except subprocess.CalledProcessError as e:
        raise ValueError(f"Failed to find mount point: {e}")

def create_users_from_file(backup_path):
    """Create users from .users file with specific UIDs and update 'users' group GID"""
    users_file = os.path.join(backup_path, ".users")
    
    if not os.path.exists(users_file):
        print("No .users file found, skipping user creation")
        return
        
    # Create a mapping file to help with ownership translation between systems
    uid_map = {}
    gid_map = {}
    try:
        # Get list of files in backup path to check ownership
        find_cmd = f"find {backup_path} -type f -o -type d | head -n 10"
        files = subprocess.run(find_cmd, shell=True, capture_output=True, text=True, check=False).stdout.strip().split('\n')
        
        for file_path in files:
            if os.path.exists(file_path):
                # Get numeric UID/GID of files
                stat_info = os.stat(file_path)
                file_uid = stat_info.st_uid
                file_gid = stat_info.st_gid
                
                # Only track UIDs >= 1000 (user accounts)
                if file_uid >= 1000:
                    uid_map[file_uid] = None
                if file_gid >= 100:  # Most user groups start at 100
                    gid_map[file_gid] = None
    except Exception as e:
        print(f"Warning: Error analyzing file ownership: {e}")
        
    print(f"Found UIDs in backup: {list(uid_map.keys())}")
    print(f"Found GIDs in backup: {list(gid_map.keys())}")
    
    try:
        with open(users_file, 'r') as f:
            user_entries = f.read().splitlines()
        
        # First, check if we need to update the 'users' group GID
        users_group_gid = None
        
        # Find the GID for the 'users' group from the entries
        for entry in user_entries:
            if not entry.strip():
                continue
                
            parts = entry.split(':')
            if len(parts) < 6:  # Now expecting 6 parts with password
                continue
                
            _, _, gid, _, group_names, _ = parts
            group_names_list = group_names.split()
            
            if 'users' in group_names_list:
                # Get the index of 'users' in the group names
                users_index = group_names_list.index('users')
                group_ids_list = parts[3].split()
                
                if users_index < len(group_ids_list):
                    users_group_gid = group_ids_list[users_index]
                    break
        
        # Update 'users' group GID if needed
        if users_group_gid:
            try:
                # Check current GID of 'users' group
                current_gid_cmd = "getent group users | cut -d: -f3"
                current_gid = subprocess.run(current_gid_cmd, shell=True, capture_output=True, text=True, check=False).stdout.strip()
                
                if current_gid and current_gid != users_group_gid:
                    # Update the GID
                    subprocess.run(["groupmod", "-g", users_group_gid, "users"], check=False)
                    print(f"Updated 'users' group GID to {users_group_gid}")
            except Exception as e:
                print(f"Warning: Failed to update 'users' group GID: {e}")
        
        # Then, create or update users
        for entry in user_entries:
            if not entry.strip():
                continue
                
            parts = entry.split(':')
            if len(parts) < 6:  # Now expecting 6 parts with password
                print(f"Warning: Invalid user entry format: {entry}")
                continue
                
            username, uid, gid, group_ids, group_names, password = parts
            
            # Check if user already exists
            try:
                existing_user = pwd.getpwnam(username)
                existing_uid = existing_user.pw_uid
                
                # If user exists with different UID and is not admin or system user
                if int(existing_uid) != int(uid) and username != "admin" and existing_uid >= 1000:
                    # Delete user using omv-rpc
                    try:
                        delete_json = json.dumps({"name": username})
                        delete_cmd = ["omv-rpc", "-u", "admin", "Homecloud", "deleteUser", delete_json]
                        subprocess.run(delete_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                        print(f"Deleted existing user {username} with UID {existing_uid}")
                    except subprocess.CalledProcessError as e:
                        print(f"Warning: Failed to delete user {username}: {e}")
                else:
                    print(f"User {username} already exists with correct UID, skipping")
                    continue
            except KeyError:
                # User doesn't exist, proceed with creation
                pass
            
            # Check if another user has the same UID
            try:
                # Get username for the UID if it exists
                uid_check_cmd = f"getent passwd {uid} | cut -d: -f1"
                existing_username = subprocess.run(uid_check_cmd, shell=True, capture_output=True, text=True, check=False).stdout.strip()
                
                if existing_username and existing_username != username:
                    # Another user has this UID, delete that user using omv-rpc
                    try:
                        print(f"UID {uid} is already used by user {existing_username}, removing that user")
                        delete_json = json.dumps({"name": existing_username})
                        delete_cmd = ["omv-rpc", "-u", "admin", "Homecloud", "deleteUser", delete_json]
                        subprocess.run(delete_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                    except subprocess.CalledProcessError as e:
                        print(f"Warning: Failed to delete user {existing_username}: {e}")
            except Exception as e:
                print(f"Warning: Error checking existing UID: {e}")
                
            # Create user with omv-rpc command
            try:
                # Get group names list and ensure 'users' is included
                group_names_list = group_names.split()
                if 'users' not in group_names_list:
                    group_names_list.append('users')
                
                # Create JSON for omv-rpc command
                rpc_json = json.dumps({
                    "name": username,
                    "uid": int(uid),
                    "groups": group_names_list,
                    "password": password,
                    "email": "",
                    "disallowusermod": False,
                    "sshpubkeys": []
                })
                
                # Execute omv-rpc command
                cmd = ["omv-rpc", "-u", "admin", "Homecloud", "setUserAll", rpc_json]
                result = subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                print(f"Created user {username} with UID {uid} and groups {group_names_list}")
                
            except subprocess.CalledProcessError as e:
                print(f"Warning: Failed to create user {username}: {e.stderr}")
            except Exception as e:
                print(f"Warning: Error creating user {username}: {e}")
    
    except Exception as e:
        print(f"Warning: Error processing users file: {e}")


def fix_ownership_after_restore(backup_path, destination_path):
    """Fix ownership of restored files based on specific requirements"""
    print("Fixing ownership of restored files...")
    
    try:
        # 1. Fix jellyfin_media_share directory if it exists
        jellyfin_dir = os.path.join(destination_path, "jellyfin_media_share")
        if os.path.exists(jellyfin_dir):
            print(f"Fixing ownership of {jellyfin_dir} to admin:users")
            subprocess.run(["chown", "-R", "admin:users", jellyfin_dir], check=False)
        
        # 2. Fix user directories under homes/
        homes_dir = os.path.join(destination_path, "homes")
        if os.path.exists(homes_dir):
            # Get all directories under homes/
            for username in os.listdir(homes_dir):
                user_dir = os.path.join(homes_dir, username)
                if not os.path.isdir(user_dir):
                    continue
                    
                # Skip admin user
                if username == "admin":
                    continue
                    
                # Check if user exists in the system
                try:
                    pwd.getpwnam(username)  # Just check if user exists
                    print(f"Fixing ownership of {user_dir} to {username}:users")
                    subprocess.run(["chown", "-R", f"{username}:users", user_dir], check=False)
                except KeyError:
                    print(f"User {username} not found in system, skipping ownership fix")
    except Exception as e:
        print(f"Warning: Error fixing ownership: {e}")

def main():
    if len(sys.argv) != 2:
        print(json.dumps({
            "status": "error",
            "message": "Usage: script.py <backup_path>"
        }))
        sys.exit(1)

    backup_path = sys.argv[1]

    try:
        # 1. Validate path and permissions
        check_path_and_permissions(backup_path)
        
        # 2. Find destination path (DATA_VOL-home_dirs mount point)
        try:
            destination_path = get_data_vol_mount_point()
            print(f"Found destination path: {destination_path}")
        except ValueError as e:
            print(json.dumps({
                "status": "error",
                "message": str(e)
            }))
            sys.exit(1)

        # 3. Create users and groups from .users file
        create_users_from_file(backup_path)

        # 4. Check space requirements
        backup_size = get_directory_size(backup_path)
        free_space = get_free_space()
        
        if backup_size > free_space:
            print(json.dumps({
                "status": "error",
                "message": f"Insufficient space. Required: {backup_size/1024**3:.2f}GB, Available: {free_space/1024**3:.2f}GB"
            }))
            sys.exit(1)

        # 5. Validate directory contents
        if not validate_directory_contents(backup_path):
            print(json.dumps({
                "status": "error",
                "message": f"Backup path {backup_path} must contain at least one directory"
            }))
            sys.exit(1)

        # 6. Stop SMB service
        print("Stopping SMB service...")
        manage_smb_service("stop")

        try:
            # 7. Copy files
            print("Copying files...")
            for item in os.listdir(backup_path):
                # Skip .users file
                if item == ".users":
                    continue
                    
                src = os.path.join(backup_path, item)
                dst = os.path.join(destination_path, item)
                
                if os.path.isdir(src):
                    copy_with_metadata(src, dst)
                elif os.path.isfile(src):
                    try:
                        shutil.copy2(src, dst)
                        # Fix ownership for individual files
                        dirname = os.path.basename(os.path.dirname(dst))
                        try:
                            # Check if user exists
                            pwd.getpwnam(dirname)
                            # Fix ownership
                            subprocess.run(["chown", f"{dirname}:users", dst], check=True)
                        except (KeyError, subprocess.CalledProcessError):
                            pass
                    except Exception as e:
                        print(f"Warning: Failed to copy file {src}: {e}")

        finally:
            # 8. Start SMB service
            print("Starting SMB service...")
            manage_smb_service("start")
            
        # 9. Fix ownership after restore
        fix_ownership_after_restore(backup_path, destination_path)

        print(json.dumps({
            "status": "success",
            "message": "Restore completed successfully"
        }))

    except Exception as e:
        print(json.dumps({
            "status": "error",
            "message": f"Error: {str(e)}"
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
