#!/usr/bin/python3

import os
import sys
import json
import shutil
import subprocess
import time
import logging
from pathlib import Path
import tarfile
import atexit
import urllib3
import requests
import yaml
import openmediavault.firstaid
import openmediavault.net
import openmediavault.rpc
import openmediavault.stringutils
import openmediavault

# Constants
internal_storage_disk_name = "dm"
import urllib3


# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


class JellyfinRestore:
    def __init__(self, backup_path):
        self.backup_path = Path(backup_path)
        self.cleanup_needed = False
        self.created_dirs = []
        self.service_was_running = False
        
        # Setup logging
        logging.basicConfig(
            format='%(asctime)s - %(levelname)s - %(message)s',
            level=logging.INFO
        )
        self.logger = logging.getLogger(__name__)

    def cleanup(self):
        """Clean up on failure"""
        if not self.cleanup_needed:
            return

        self.logger.info("Performing cleanup...")
        try:
            self.run_command(['systemctl', 'stop', 'jellyfin.service'], check=False)
            containers = self.run_command(['docker', 'ps', '-q', '-f', 'name=jellyfin'])
            if containers:
                self.run_command(['docker', 'stop', containers.split()])
        except Exception as e:
            self.logger.error(f"Error stopping services during cleanup: {str(e)}")

    def run_command(self, command, shell=False, check=True):
        """Execute system command and return output"""
        try:
            result = subprocess.run(
                command,
                shell=shell,
                check=check,
                capture_output=True,
                text=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            self.logger.error(f"Command failed: {e.cmd}")
            self.logger.error(f"Error output: {e.stderr}")
            return None

    def validate_backup_path(self):
        """Validate backup path and permissions"""
        self.logger.info("Validating backup path and permissions...")
        if not self.backup_path.exists():
            self.logger.error(f"Backup path {self.backup_path} does not exist")
            return False
        if not os.access(self.backup_path, os.R_OK):
            self.logger.error(f"Insufficient read permissions on {self.backup_path}")
            return False
        return True

    def validate_backup_contents(self):
        """Validate backup contents"""
        self.logger.info("Validating backup contents...")
        try:
            # Check for jellyfin.tar.gz file
            tar_file = self.backup_path / "jellyfin.tar.gz"
            if not tar_file.is_file() or tar_file.stat().st_size == 0:
                self.logger.error("jellyfin.tar.gz not found or empty")
                return False

            # Check config directory and docker-compose.yml
            config_path = self.backup_path / "config"
            if not config_path.is_dir():
                self.logger.error("config directory not found")
                return False
            if not (config_path / "docker-compose.yml").is_file():
                self.logger.error("docker-compose.yml not found in config directory")
                return False

            self.logger.info("Backup contents validation passed")
            return True
        except Exception as e:
            self.logger.error(f"Backup validation failed: {str(e)}")
            return False

    def stop_services(self):
        """Stop Jellyfin services"""
        self.logger.info("Stopping Jellyfin services...")
        try:
            # Check if service is running
            status = self.run_command(['systemctl', 'is-active', 'jellyfin.service'], check=False)
            self.service_was_running = (status == 'active')

            # Stop systemd service
            self.run_command(['systemctl', 'stop', 'jellyfin.service'], check=False)
            
            # Stop any running containers
            containers = self.run_command(['docker', 'ps', '-q', '-f', 'name=jellyfin'])
            if containers:
                self.run_command(['docker', 'stop', containers.split()])
            
            self.logger.info("Services stopped successfully")
            return True
        except Exception as e:
            self.logger.warning(f"Service stop warning (may be already stopped): {str(e)}")
            return True

    def get_eligible_disk_candidates_for_shares(self):
        try:
            share_candidates = openmediavault.rpc.call("ShareMgmt", "getCandidates")
            return share_candidates
        except Exception as e:
            self.logger.error(f"Failed to get share candidates: {str(e)}")
            return False

    def get_existing_shared_folders(self):
        try:
            existing_shares = openmediavault.rpc.call("ShareMgmt", "enumerateSharedFolders")
            return existing_shares
        except Exception as e:
            self.logger.error(f"Failed to get existing shared folders: {str(e)}")
            return False

    def get_environment_variable_uuid(self):
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
        except Exception as e:
            self.logger.error(f"Failed to get environment variable UUID: {str(e)}")
            return False

    def create_shared_folder(self, uuid, name, reldirpath, comment, mntentref):
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
        except Exception as e:
            self.logger.error(f"Failed to create shared folder: {str(e)}")
            return False

    def set_shared_folder_permissions(self, uuid, permissions):
        try:
            rpc_params = {
                "uuid": uuid,
                "privileges": permissions
            }
            result = openmediavault.rpc.call("ShareMgmt", "setPrivileges", rpc_params)
            return result
        except Exception as e:
            self.logger.error(f"Failed to set shared folder permissions: {str(e)}")
            return False

    def get_disk_uuid(self):
        try:
            candidates = self.get_eligible_disk_candidates_for_shares()
            if not candidates:
                raise Exception("No eligible disks found")
                
            disk = next((disk for disk in candidates 
                        if internal_storage_disk_name in disk['description'].lower()), None)
            
            if not disk:
                raise Exception(f"No disk found with description containing '{internal_storage_disk_name}'")
                
            return disk['uuid']
        except Exception as e:
            self.logger.error(f"Error getting disk UUID: {str(e)}")
            return None

    def check_and_create_share(self):
        try:
            # Get disk UUID for internal storage
            disk_uuid = self.get_disk_uuid()
            if not disk_uuid:
                raise Exception("Failed to get disk UUID")

            # Check if jellyfin_media_share exists
            jellyfin_share = None
            existing_shares = self.get_existing_shared_folders()
            if existing_shares:
                jellyfin_share = next((share for share in existing_shares 
                                    if share['name'] == 'jellyfin_media_share'), None)
            
            if not jellyfin_share:
                # Get new UUID for share
                share_uuid = self.get_environment_variable_uuid()
                if not share_uuid:
                    raise Exception("Failed to get new UUID")

                # Create new share
                result = self.create_shared_folder(
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
                existing_shares = self.get_existing_shared_folders()
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
                
                if not self.set_shared_folder_permissions(jellyfin_share['uuid'], permissions):
                    raise Exception("Failed to set share permissions")

            # Get the base directory and construct share path
            share_path = os.path.join(jellyfin_share['mntent']['dir'], 'jellyfin_media_share')
            
            return jellyfin_share
        except Exception as e:
            self.logger.error(f"Error managing share: {str(e)}")
            return None

    def update_docker_compose_with_media_share(self, compose_path, jellyfin_share):
        """Update docker-compose.yml with jellyfin_media_share path"""
        try:
            # Get the share path
            share_path = os.path.join(jellyfin_share['mntent']['dir'], 'jellyfin_media_share')
            
            # Read the docker-compose.yml file
            with open(compose_path, 'r') as f:
                compose_data = yaml.safe_load(f)
            
            # Check if the file has the expected structure
            if not compose_data or 'services' not in compose_data or 'jellyfin' not in compose_data['services']:
                self.logger.error("Invalid docker-compose.yml structure")
                return False
            
            # Get the volumes list
            volumes = compose_data['services']['jellyfin'].get('volumes', [])
            
            # Find and replace any volume mapping to /media
            new_volumes = []
            media_volume_found = False
            
            for volume in volumes:
                if ':' in volume and volume.endswith(':/media'):
                    # Replace with the new media share path
                    new_volumes.append(f"{share_path}:/media")
                    media_volume_found = True
                    self.logger.info(f"Updated media volume mapping to {share_path}:/media")
                else:
                    new_volumes.append(volume)
            
            # If no media volume was found, add it
            if not media_volume_found:
                new_volumes.append(f"{share_path}:/media")
                self.logger.info(f"Added new media volume mapping: {share_path}:/media")
            
            # Update the volumes in the compose data
            compose_data['services']['jellyfin']['volumes'] = new_volumes
            
            # Write the updated docker-compose.yml file
            with open(compose_path, 'w') as f:
                yaml.dump(compose_data, f, default_flow_style=False)
            
            self.logger.info(f"Updated docker-compose.yml with jellyfin_media_share path")
            return True
        except Exception as e:
            self.logger.error(f"Failed to update docker-compose.yml: {str(e)}")
            return False

    def restore_config(self):
        """Restore configuration files"""
        self.logger.info("Restoring configuration files...")
        try:
            # Create /etc/jellyfin directory if it doesn't exist
            etc_jellyfin = Path('/etc/jellyfin')
            etc_jellyfin.mkdir(parents=True, exist_ok=True)
            
            # Copy docker-compose.yml from config directory
            config_source = self.backup_path / "config" / "docker-compose.yml"
            dest_path = etc_jellyfin / "docker-compose.yml"
            
            # Replace existing file if it exists
            if dest_path.exists():
                dest_path.unlink()
            
            shutil.copy2(config_source, dest_path)
            self.logger.info(f"Copied docker-compose.yml to {dest_path}")
            
            # Check and create jellyfin_media_share if it doesn't exist
            self.logger.info("Checking for jellyfin_media_share...")
            jellyfin_share = self.check_and_create_share()
            
            if jellyfin_share:
                # Update docker-compose.yml with the correct media share path
                self.update_docker_compose_with_media_share(dest_path, jellyfin_share)
            else:
                self.logger.warning("Failed to create or find jellyfin_media_share")
            
            # Update YAML via API
            response = requests.post(
                "https://127.0.0.1:5000/update_YAML",
                verify=False
            )
            
            return True
        except Exception as e:
            self.logger.error(f"Failed to restore config: {str(e)}")
            return False

    def restore_data(self):
        """Restore Jellyfin data from tar.gz"""
        self.logger.info("Restoring Jellyfin data...")
        try:
            var_lib_jellyfin = Path('/var/lib/jellyfin')
            tar_file = self.backup_path / "jellyfin.tar.gz"
            
            # Create directory if it doesn't exist, or clean its contents if it does
            if var_lib_jellyfin.exists():
                self.logger.info("Cleaning up existing /var/lib/jellyfin directory contents")
                # Delete all contents but keep the directory
                for item in var_lib_jellyfin.iterdir():
                    if item.is_file():
                        item.unlink()
                    elif item.is_dir():
                        shutil.rmtree(item)
            else:
                var_lib_jellyfin.mkdir(parents=True, exist_ok=True)
                self.created_dirs.append(str(var_lib_jellyfin))
            
            # Extract tar.gz to /var/lib/jellyfin
            self.logger.info(f"Extracting {tar_file} to {var_lib_jellyfin}")
            with tarfile.open(tar_file, 'r:gz') as tar:
                # Extract all contents to /var/lib/jellyfin
                tar.extractall(path=var_lib_jellyfin)
            
            
            if var_lib_jellyfin.exists():
                # change ownership of all sub-directories and files to user admin and group admin
                subprocess.run(['chown', '-R', 'admin:admin', '/var/lib/jellyfin'])

            self.logger.info("Data restoration completed")
            return True
        except Exception as e:
            self.logger.error(f"Failed to restore data: {str(e)}")
            return False


    def create_jellyfin_service(self):
        """Create jellyfin.service if it doesn't exist"""
        service_file = Path('/etc/systemd/system/jellyfin.service')
        if service_file.exists():
            return True
            
        self.logger.info("Creating jellyfin.service...")
        try:
            service_content = """[Unit]
Description=Jellyfin
Requires=docker.service
After=docker.service

[Service]
Type=simple
Restart=always
RestartSec=10
ExecStartPre=/bin/chown -R admin:admin /var/lib/jellyfin/
ExecStart=/usr/bin/docker compose -f /etc/jellyfin/docker-compose.yml up
ExecStop=/usr/bin/docker compose -f /etc/jellyfin/docker-compose.yml down

[Install]
WantedBy=multi-user.target
"""
            
            with open(service_file, 'w') as f:
                f.write(service_content)
            
            # Reload systemd and enable service
            self.run_command(['systemctl', 'daemon-reload'])
            self.run_command(['systemctl', 'enable', 'jellyfin.service'])
            
            self.logger.info("Jellyfin service created successfully")
            return True
        except Exception as e:
            self.logger.error(f"Failed to create jellyfin service: {str(e)}")
            return False

    def start_services(self):
        """Start Jellyfin services"""
        self.logger.info("Starting Jellyfin services...")
        try:
            # Create service if it doesn't exist
            if not self.create_jellyfin_service():
                return False
                
            # Start systemd service
            self.run_command(['systemctl', 'start', 'jellyfin.service'])
            
            # Wait a moment for service to start
            time.sleep(3)
            
            # Check if service started successfully
            status = self.run_command(['systemctl', 'is-active', 'jellyfin.service'], check=False)
            if status == 'active':
                self.logger.info("Jellyfin service started successfully")
                return True
            else:
                self.logger.warning(f"Service status: {status}")
                return False
        except Exception as e:
            self.logger.error(f"Failed to start services: {str(e)}")
            return False

    def restore(self):
        """Main restore process"""
        atexit.register(self.cleanup)
        self.cleanup_needed = True
        
        try:
            # Validation steps
            if not self.validate_backup_path():
                return False
            if not self.validate_backup_contents():
                return False
            
            # Restore process
            if not self.stop_services():
                return False
            if not self.restore_config():
                return False
            if not self.restore_data():
                return False
            if not self.start_services():
                return False
            
            self.cleanup_needed = False
            self.logger.info("Jellyfin restore completed successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Restore failed: {str(e)}")
            return False

def main():
    if len(sys.argv) != 2:
        print(json.dumps({"success": False, "message": "Usage: jellyfin_restore_execute.py <backup_path>"}))
        sys.exit(1)
    
    backup_path = sys.argv[1]
    restore = JellyfinRestore(backup_path)
    
    success = restore.restore()
    result = {
        "success": success,
        "message": "Restore completed successfully" if success else "Restore failed"
    }
    
    print(json.dumps(result))
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()