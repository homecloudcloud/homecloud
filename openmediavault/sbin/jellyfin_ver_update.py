#!/usr/bin/env python3
import sys
import os
import json
import yaml
import pwd
import grp
import stat
import subprocess
import requests
from packaging import version
import shutil
import openmediavault.firstaid
import openmediavault.net
import openmediavault.rpc
import openmediavault.stringutils
import openmediavault
import urllib3


# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


internal_storage_disk_name = "dm"

def get_eligible_disk_candidates_for_shares():
    try:
        share_candidates = openmediavault.rpc.call("ShareMgmt", "getCandidates")
        return share_candidates
    except:
        return False

def get_existing_shared_folders():
    try:
        existing_shares = openmediavault.rpc.call("ShareMgmt", "enumerateSharedFolders")
        return existing_shares
    except:
        return False

def get_environment_variable_uuid():
    try:
        command = ['/usr/sbin/omv-env get OMV_CONFIGOBJECT_NEW_UUID']
        process = subprocess.run(command, text=True, check=True, shell=True, capture_output=True)
        if process.returncode != 0:
            return None
        else:
            a = process.stdout.split("=")
            uuid = a[1]
            uuid = uuid.replace("\n", "")
            return uuid
    except:
        return False

def create_shared_folder(uuid, name, reldirpath, comment, mntentref):
    try:
        rpc_params = {
            "uuid": uuid,
            "name": name,
            "reldirpath": reldirpath,
            "comment": comment,
            "mntentref": mntentref
        }
        result = openmediavault.rpc.call("Homecloud", "setShareandSMB", rpc_params)
        return result
    except:
        return False

def set_shared_folder_permissions(uuid, permissions):
    try:
        rpc_params = {
            "uuid": uuid,
            "privileges": permissions
        }
        result = openmediavault.rpc.call("ShareMgmt", "setPrivileges", rpc_params)
        return result
    except:
        return False

def create_directory(path):
    try:
        os.makedirs(path, exist_ok=True)
        return True
    except:
        return False

def get_disk_uuid():
    try:
        candidates = get_eligible_disk_candidates_for_shares()
        if not candidates:
            raise Exception("No eligible disks found")
            
        disk = next((disk for disk in candidates 
                    if internal_storage_disk_name in disk['description'].lower()), None)
        
        if not disk:
            raise Exception(f"No disk found with description containing '{internal_storage_disk_name}'")
            
        return disk['uuid']
    except Exception as e:
        print(f"Error getting disk UUID: {str(e)}")
        return None
        
def check_and_create_share():
    try:
        # Get disk UUID for internal storage
        disk_uuid = get_disk_uuid()
        if not disk_uuid:
            raise Exception("Failed to get disk UUID")

        # Check if jellyfin_media_share exists
        jellyfin_share = None
        existing_shares = get_existing_shared_folders()
        if existing_shares:
            jellyfin_share = next((share for share in existing_shares 
                                if share['name'] == 'jellyfin_media_share'), None)
        
        if not jellyfin_share:
            # Get new UUID for share
            share_uuid = get_environment_variable_uuid()
            if not share_uuid:
                raise Exception("Failed to get new UUID")

            # Create new share
            result = create_shared_folder(
                uuid=share_uuid,
                name='jellyfin_media_share',
                reldirpath='/jellyfin_media_share',
                comment='Store media files for jellyfin here',
                mntentref=disk_uuid
            )
            
            if not result:
                raise Exception("Failed to create shared folder")

            # Deploy changes using omv-salt
            subprocess.run(["/usr/sbin/omv-salt", "deploy", "run", "samba"], 
                         check=True, stdout=subprocess.PIPE, universal_newlines=True)


            # Get updated share list after creation
            existing_shares = get_existing_shared_folders()
            if not existing_shares:
                raise Exception("Failed to get updated share list")
            
            # Find the newly created share
            jellyfin_share = next((share for share in existing_shares 
                                 if share['name'] == 'jellyfin_media_share'), None)
            
            if not jellyfin_share:
                raise Exception("Failed to find newly created share")

            # Set permissions for group 'users'
            permissions = [
                {
                    "type": "group",
                    "name": "users",
                    "perms": 7
                }
            ]
            
            if not set_shared_folder_permissions(jellyfin_share['uuid'], permissions):
                raise Exception("Failed to set share permissions")

        # Get the base directory and construct share path
        share_path = os.path.join(jellyfin_share['mntent']['dir'], 'jellyfin_media_share')
        
        return jellyfin_share
    except Exception as e:
        print(f"Error managing share: {str(e)}")
        return None

def create_media_directories(share_path):
    directories = [
        f'{share_path}/video_library',
        f'{share_path}/music_library',
        f'{share_path}/mixed_library'
    ]
    
    try:
        # Get GID for 'users' group
        try:
            users_group = grp.getgrnam('users')
            users_gid = users_group.gr_gid
        except KeyError:
            print("Warning: 'users' group not found")
            return False

        # Get UID for 'admin' user
        try:
            admin_user = pwd.getpwnam('admin')
            admin_uid = admin_user.pw_uid
        except KeyError:
            print("Warning: 'admin' user not found")
            return False

        # Disable ACLs recursively on share_path
        try:
            print(f"Disabling ACLs recursively for: {share_path}")
            subprocess.run(['setfacl', '-R', '-b', share_path], check=True)
            print("Successfully disabled ACLs")
        except subprocess.CalledProcessError as e:
            print(f"Failed to disable ACLs: {str(e)}")
            return False

        # Create directories with proper permissions
        for directory in directories:
            try:
                # Create directory if it doesn't exist
                if not os.path.exists(directory):
                    os.makedirs(directory, mode=0o775, exist_ok=True)
                    print(f"Created directory: {directory}")
                
                # Set ownership and permissions
                os.chown(directory, admin_uid, users_gid)  # Set owner to admin:users
                # Set rwxrwsr-x permissions with SGID bit
                os.chmod(directory, 0o2775)
                print(f"Set permissions for: {directory}")

            except OSError as e:
                print(f"Failed to set permissions for {directory}: {str(e)}")
                return False

        # Change ownership and permissions recursively on share_path
        try:
            print(f"Changing ownership and permissions recursively for: {share_path}")
            
            # First, set ownership and permissions on share_path itself
            os.chown(share_path, admin_uid, users_gid)
            # Set rwxrwsr-x with SGID bit for the share_path
            os.chmod(share_path, 0o2775)
            
            for root, dirs, files in os.walk(share_path):
                # Change ownership and permissions of directories
                for d in dirs:
                    dir_path = os.path.join(root, d)
                    try:
                        os.chown(dir_path, admin_uid, users_gid)
                        # Set rwxrwsr-x with SGID bit for directories
                        os.chmod(dir_path, 0o2775)
                    except OSError as e:
                        print(f"Warning: Failed to change directory permissions for {dir_path}: {str(e)}")
                        continue
                
                # Change ownership and permissions of files
                for f in files:
                    file_path = os.path.join(root, f)
                    try:
                        os.chown(file_path, admin_uid, users_gid)
                        # Set rw-rw-r-- for files
                        os.chmod(file_path, 0o664)
                    except OSError as e:
                        print(f"Warning: Failed to change file permissions for {file_path}: {str(e)}")
                        continue
            
            print(f"Successfully changed ownership and permissions recursively for: {share_path}")
            
        except OSError as e:
            print(f"Failed to change ownership and permissions recursively for {share_path}: {str(e)}")
            return False

        # Verify permissions on main directories
        for directory in directories:
            stat_info = os.stat(directory)
            if (
                stat_info.st_mode & 0o777 != 0o775 or  # Check basic permissions
                stat_info.st_gid != users_gid or       # Check group ownership
                stat_info.st_uid != admin_uid or       # Check owner
                not stat_info.st_mode & stat.S_ISGID   # Check SGID bit
            ):
                print(f"Warning: Permissions verification failed for {directory}")
                return False

        print("All directories created and permissions set successfully")
        return directories

    except Exception as e:
        print(f"Error creating directories: {str(e)}")
        return False


def validate_version(target_version):
    try:
        api_url = "https://api.github.com/repos/jellyfin/jellyfin/tags"
        response = requests.get(api_url)
        response.raise_for_status()
        
        available_versions = [tag['name'] for tag in response.json()]
        if f'v{target_version}' not in available_versions:
            return False
        return True
    except Exception as e:
        print(f"Error validating version: {str(e)}")
        return False

def check_internet_connectivity():
    """Check internet connectivity using OMV RPC"""
    try:
        result = subprocess.run(['omv-rpc', '-u', 'admin', 'Homecloud', 'enumeratePhysicalNetworkDevices'],
                              capture_output=True, text=True, check=True)
        devices = json.loads(result.stdout)
        
        for device in devices:
            if device.get('devicename') == 'internet0':
                return device.get('state', False)
        return False
    except Exception:
        return False


def create_systemd_service():
    service_content = """[Unit]
Description=Jellyfin
Requires=docker.service
After=docker.service

[Service]
Type=simple
Restart=always
RestartSec=10
ExecStartPre=/bin/chown -R admin:users /var/lib/jellyfin/
ExecStart=/usr/bin/docker compose -f /etc/jellyfin/docker-compose.yml up 
ExecStop=/usr/bin/docker compose -f /etc/jellyfin/docker-compose.yml down

[Install]
WantedBy=multi-user.target
"""
    
    with open('/etc/systemd/system/jellyfin.service', 'w') as f:
        f.write(service_content)
    
    subprocess.run(['systemctl', 'daemon-reload'])
    subprocess.run(['systemctl', 'enable', 'jellyfin.service'])

def update_yaml_config(share_path, target_version):
    """Update YAML configuration for Jellyfin"""
    try:
        # Create jellyfin config directory if it doesn't exist
        jellyfin_config_dir = '/etc/jellyfin'
        if not os.path.exists(jellyfin_config_dir):
            os.makedirs(jellyfin_config_dir, mode=0o755)
            print(f"Created directory: {jellyfin_config_dir}")

        # Copy template
        template_path = '/etc/homecloud/docker-compose-jellyfin.yml'
        if not os.path.exists(template_path):
            raise FileNotFoundError(f"Template file not found: {template_path}")

        dest_path = f'{jellyfin_config_dir}/docker-compose.yml'
        shutil.copy(template_path, dest_path)
        print(f"Copied template to: {dest_path}")
    
        # Update YAML via API
        try:
            requests.post('https://127.0.0.1:5000/update_YAML', verify=False)
        except Exception as e:
            print(f"Warning: Failed to update YAML via API: {str(e)}")
    
        # Update YAML file
        with open(dest_path, 'r') as f:
            config = yaml.safe_load(f)
    
        if not config:
            raise ValueError("Empty or invalid YAML configuration")
    
        # Update image version
        if 'services' not in config:
            config['services'] = {}
        if 'jellyfin' not in config['services']:
            config['services']['jellyfin'] = {}
        
        config['services']['jellyfin']['image'] = f'jellyfin/jellyfin:{target_version}'
    
        # Update volumes
        if 'volumes' not in config['services']['jellyfin']:
            config['services']['jellyfin']['volumes'] = []
        
        media_volume = f'{share_path}:/media'
        if media_volume not in config['services']['jellyfin']['volumes']:
            config['services']['jellyfin']['volumes'].append(media_volume)
    
        # Add environment variables
        if 'environment' not in config['services']['jellyfin']:
            config['services']['jellyfin']['environment'] = []
        
        media_env = 'JELLYFIN_MEDIA_DIRS:/media'
        if media_env not in config['services']['jellyfin']['environment']:
            config['services']['jellyfin']['environment'].append(media_env)
    
        # Write updated configuration
        with open(dest_path, 'w') as f:
            yaml.dump(config, f, default_flow_style=False)
        
        print(f"Updated configuration at: {dest_path}")
        return True

    except Exception as e:
        print(f"Error updating YAML config: {str(e)}")
        return False


def main():
    if len(sys.argv) != 2:
        print("Usage: script.py <target_version>")
        sys.exit(1)
    
    target_version = sys.argv[1]
    
    # Get current deployment status
    try:
        status_cmd = subprocess.run(['omv-rpc', '-u', 'admin', 'Homecloud', 'getJellyfinServiceStatus'],
                                  capture_output=True, text=True)
        status = json.loads(status_cmd.stdout)['status']
    except Exception as e:
        print(f"Error getting service status: {str(e)}")
        sys.exit(1)
    
    # Check internet connectivity
    print("Checking internet connectivity...")
    if not check_internet_connectivity():
        print("Not connected to Internet. Check your network connectivity")
        sys.exit(0)

    # Check/create share and get share path
    jellyfin_share = check_and_create_share()
    if not jellyfin_share:
        print("Failed to setup jellyfin share")
        sys.exit(1)

    #share_path = f"/shared/jellyfin_media_share"
    share_path = os.path.join(jellyfin_share['mntent']['dir'], 'jellyfin_media_share')
    
    if status == "Not deployed":
        # New deployment
        print("Performing new deployment...")
        
        # Create media directories
        directories = create_media_directories(share_path)
        
        # Validate version
        #if not validate_version(target_version):
        #    print(f"Error: Version {target_version} not found")
        #    sys.exit(1)
        
        # Create systemd service
        create_systemd_service()
        
        # Update YAML configuration
        update_yaml_config(share_path, target_version)
        
        

        
    else:
        # Version update
        print("Performing version update...")
        
        # Get current version
        version_cmd = subprocess.run(['omv-rpc', '-u', 'admin', 'Homecloud', 'jellyfin_check_version'],
                                   capture_output=True, text=True)
        deployed_version = json.loads(version_cmd.stdout)['deployed_version']
        
        # Compare versions
        #if version.parse(target_version) <= version.parse(deployed_version):
        #    print(f"Error: Target version {target_version} is not greater than deployed version {deployed_version}")
        #    sys.exit(1)
        
        # Validate version
        if not validate_version(target_version):
            print(f"Error: Version {target_version} not found")
            sys.exit(1)
        
        update_yaml_config(share_path, target_version)
    
    # Common steps for both paths
    # check /var/lib/jellyfin exists
    if os.path.exists('/var/lib/jellyfin'):
        if not os.path.exists('/var/lib/jellyfin/config'):
            os.makedirs('/var/lib/jellyfin/config', mode=0o755)
            print(f"creating config directory")
        if not os.path.exists('/var/lib/jellyfin/cache'):
            os.makedirs('/var/lib/jellyfin/cache', mode=0o755)
            print(f"creating cache directory")
        # change ownership of all sub-directories and files to user admin and group admin
        subprocess.run(['chown', '-R', 'admin:users', '/var/lib/jellyfin'])
    # Pull new image
    subprocess.run(['docker', 'pull', f'jellyfin/jellyfin:{target_version}'])
    
    # Stop service if running
    subprocess.run(['systemctl', 'stop', 'jellyfin.service'])
    
    # Start service
    subprocess.run(['systemctl', 'start', 'jellyfin.service'])
    
    try:
        response = requests.post(
            "https://localhost:5000/setup_firewall?service=jellyfin",
            verify=False,
            timeout=30
        )
        if response.status_code != 200:
            print("Warning: Failed to update firewall rules")
    except Exception as e:
        print(f"Warning: Failed to setup firewall: {str(e)}")

    print("Deployment/update completed successfully")

if __name__ == "__main__":
    main()
