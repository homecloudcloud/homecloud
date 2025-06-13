#!/usr/bin/python3

import os
import sys
import json
import shutil
import subprocess
import time
import logging
from pathlib import Path
import pwd

class VaultwardenRestore:
    def __init__(self, backup_path):
        self.backup_path = Path(backup_path)
        self.db_file = None
        
        # Setup logging
        logging.basicConfig(
            format='%(asctime)s - %(levelname)s - %(message)s',
            level=logging.INFO
        )
        self.logger = logging.getLogger(__name__)

    def run_command(self, command, shell=False):
        """Execute system command and return output"""
        try:
            result = subprocess.run(
                command,
                shell=shell,
                check=True,
                capture_output=True,
                text=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            self.logger.error(f"Command failed: {e.cmd}")
            self.logger.error(f"Error output: {e.stderr}")
            return None

    def validate_permissions(self):
        """Check backup path and permissions"""
        try:
            if not self.backup_path.exists():
                self.logger.error(f"Backup path {self.backup_path} does not exist")
                return False
            
            if not os.access(self.backup_path, os.R_OK):
                self.logger.error(f"Insufficient read permissions on {self.backup_path}")
                return False
                
            self.logger.info("Backup path and permissions validated")
            return True
        except Exception as e:
            self.logger.error(f"Permission validation failed: {str(e)}")
            return False

    def check_space(self):
        """Validate free space against backup size"""
        try:
            # Get backup size in GB
            backup_size = sum(f.stat().st_size for f in self.backup_path.rglob('*') if f.is_file())
            backup_size_gb = backup_size / (1024 ** 3)

            # Get free space using omv-rpc
            free_space_cmd = ['omv-rpc', '-u', 'admin', 'Homecloud', 'get_free_space_internaldisk']
            result = self.run_command(free_space_cmd)
            if not result:
                return False

            try:
                free_space = json.loads(result).get('free_space', 0)
            except json.JSONDecodeError:
                self.logger.error("Failed to parse free space JSON response")
                return False
            
            if free_space < backup_size_gb:
                self.logger.error(f"Insufficient space. Required: {backup_size_gb:.3f}GB, Available: {free_space:.3f}GB")
                return False

            self.logger.info(f"Space validation passed. Required: {backup_size_gb:.3f}GB, Available: {free_space:.3f}GB")
            return True
        except Exception as e:
            self.logger.error(f"Space check failed: {str(e)}")
            return False

    def validate_backup_contents(self):
        """Validate backup contents and structure"""
        try:
            # Check for SQLite database file
            data_path = self.backup_path / "var/lib/vwdata"
            #db_files = list(self.backup_path.glob("db.sqlite3"))
            db_files = list(data_path.glob("db.sqlite3"))
            print (db_files)
            if not db_files or not db_files[0].stat().st_size > 0:
                self.logger.error("Valid database backup file not found")
                return False
            self.db_file = db_files[0]

            # Check vault-warden configuration
            config_path = self.backup_path / "etc/vault-warden"
            if not (config_path / "docker-compose-vaultwarden.yml").is_file():
                self.logger.error("Missing docker-compose-vaultwarden.yml")
                return False

            # Check vwdata directory
            data_path = self.backup_path / "var/lib/vwdata"
            if not data_path.is_dir() or not any(data_path.iterdir()) or data_path.stat().st_size == 0:
                self.logger.error("vwdata directory is missing or empty")
                return False

            self.logger.info("Backup contents validation passed")
            return True
        except Exception as e:
            self.logger.error(f"Backup validation failed: {str(e)}")
            return False

    def stop_services(self):
        """Stop Vaultwarden services"""
        try:
            # Stop systemd service if exists
            self.run_command(['systemctl', 'stop', 'vaultwarden.service'])
            
            # Stop any running containers
            containers = self.run_command(['docker', 'ps', '-q', '-f', 'name=vaultwarden'])
            if containers:
                self.run_command(['docker', 'stop', containers.split()])
            
            self.logger.info("Services stopped successfully")
            return True
        except Exception as e:
            self.logger.warning(f"Service stop warning (may be already stopped): {str(e)}")
            return True  # Continue even if service wasn't running

    def prepare_directories(self):
        """Prepare system directories"""
        try:
            # Get DATA_VOL-home_dirs mount point using df command
            mount_point_cmd = "df -P | grep 'DATA_VOL-home_dirs' | awk '{print $NF}'"
            mount_point = self.run_command(mount_point_cmd, shell=True)
            
            if not mount_point:
                self.logger.error("Could not find mount point for DATA_VOL-home_dirs")
                return False
                
            mount_point = mount_point.strip()
            vwdata_path = Path(mount_point) / 'vwdata'

            # Handle /etc/vault-warden
            etc_vw = Path('/etc/vault-warden')
            if etc_vw.exists():
                for item in etc_vw.iterdir():
                    if item.is_file():
                        item.unlink()
                    elif item.is_dir():
                        shutil.rmtree(item)
            else:
                etc_vw.mkdir(parents=True)

            # Handle /var/lib/vwdata
            var_lib_vw = Path('/var/lib/vwdata')
            
            # Create directory on DATA_VOL mount point
            vwdata_path.mkdir(parents=True, exist_ok=True)
            
            # Remove old symlink if exists
            if var_lib_vw.is_symlink():
                var_lib_vw.unlink()
            # If it's a directory, remove contents
            elif var_lib_vw.exists():
                for item in var_lib_vw.iterdir():
                    if item.is_file():
                        item.unlink()
                    elif item.is_dir():
                        shutil.rmtree(item)
            else:
                # Create symlink
                os.symlink(vwdata_path, var_lib_vw)

            self.logger.info("Directories prepared successfully")
            return True
        except Exception as e:
            self.logger.error(f"Failed to prepare directories: {str(e)}")
            return False

    def restore_files(self):
        """Restore configuration and data files"""
        try:
            # Copy configuration files
            config_source = self.backup_path / "etc/vault-warden"
            for item in config_source.iterdir():
                if item.is_file():
                    shutil.copy2(item, "/etc/vault-warden/")
                elif item.is_dir():
                    shutil.copytree(item, Path("/etc/vault-warden") / item.name, dirs_exist_ok=True)
            
            # Update YAML
            self.run_command(['curl', '--insecure', '--request', 'POST', 'https://127.0.0.1:5000/update_YAML'])
            
            # Copy data files
            data_source = self.backup_path / "var/lib/vwdata"
            for item in data_source.iterdir():
                dest_path = Path("/var/lib/vwdata") / item.name
                if item.is_file():
                    shutil.copy2(item, dest_path)
                elif item.is_dir():
                    shutil.copytree(item, dest_path, dirs_exist_ok=True)
            
            # Set ownership
            self.run_command(['chown', '-R', 'vault:vault', '/var/lib/vwdata'])
            
            self.logger.info("Files restored successfully")
            return True
        except Exception as e:
            self.logger.error(f"File restoration failed: {str(e)}")
            return False

    def create_service(self):
        """Create and start Vaultwarden service"""
        service_content = """[Unit]
Description=Vaultwarden
Requires=docker.service
After=docker.service

[Service]
Type=simple
Restart=always
RestartSec=10
ExecStart=/usr/bin/docker compose -f /etc/vault-warden/docker-compose-vaultwarden.yml up 
ExecStop=/usr/bin/docker compose -f /etc/vault-warden/docker-compose-vaultwarden.yml down

[Install]
WantedBy=multi-user.target
"""
        try:
            with open('/etc/systemd/system/vaultwarden.service', 'w') as f:
                f.write(service_content)

            self.run_command(['systemctl', 'daemon-reload'])
            self.run_command(['systemctl', 'start', 'vaultwarden.service'])
            
            # Wait for container to be healthy
            max_wait = 300  # 5 minutes
            wait_interval = 5
            elapsed_time = 0
            
            self.logger.info("Waiting for container to be healthy...")
            while elapsed_time < max_wait:
                status = self.run_command("docker ps --format '{{.Status}}' --filter name=vaultwarden", shell=True)
                if status and 'healthy' in status.lower():
                    self.logger.info(f"Container is healthy after {elapsed_time} seconds")
                    return True
                
                self.logger.info(f"Waiting for container to be healthy... (Current status: {status})")
                time.sleep(wait_interval)
                elapsed_time += wait_interval
            
            self.logger.error("Timeout waiting for container to become healthy")
            return False
            
        except Exception as e:
            self.logger.error(f"Failed to create service: {str(e)}")
            return False

    def run(self):
        """Main restoration process"""
        steps = [
            (self.validate_permissions, "Permission validation"),
            (self.check_space, "Space validation"),
            (self.validate_backup_contents, "Backup validation"),
            (self.stop_services, "Service stoppage"),
            (self.prepare_directories, "Directory preparation"),
            (self.restore_files, "File restoration"),
            (self.create_service, "Service creation")
        ]

        for step_func, step_name in steps:
            self.logger.info(f"Starting {step_name}...")
            if not step_func():
                print(json.dumps({
                    "status": "error",
                    "message": f"Failed during {step_name}"
                }))
                return False

        print(json.dumps({
            "status": "success",
            "message": "Vaultwarden restoration completed successfully"
        }))
        return True

def main():
    if len(sys.argv) != 2:
        print(json.dumps({
            "status": "error",
            "message": "Usage: vaultwarden_restore.py <backup_path>"
        }))
        sys.exit(1)

    restore = VaultwardenRestore(sys.argv[1])
    restore.run()

if __name__ == "__main__":
    main()

