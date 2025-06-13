#!/usr/bin/python3

import os
import sys
import json
import shutil
import subprocess
import time
import logging
from pathlib import Path
import yaml
import atexit
import re
import atexit
import stat
import errno
from datetime import datetime

class PaperlessRestore:
    def __init__(self, backup_path):
        self.backup_path = Path(backup_path)
        self.db_file = None
        self.cleanup_needed = False
        self.created_dirs = []
        self.created_files = []
        self.service_was_running = False
        self.yaml_backup = None
        
        # Setup logging
        logging.basicConfig(
            format='%(asctime)s - %(levelname)s - %(message)s',
            level=logging.INFO
        )
        self.logger = logging.getLogger(__name__)


    def ensure_user_and_group(self):
        """Ensure paperless user and group exist"""
        self.logger.info("Ensuring paperless user and group exist...")
        try:
            # Check if group exists, create if it doesn't
            try:
                self.run_command(['getent', 'group', 'paperless'])
            except:
                self.logger.info("Creating paperless group")
                self.run_command(['groupadd', 'paperless'])
    
            # Check if user exists, create if it doesn't
            try:
                self.run_command(['id', 'paperless'])
            except:
                self.logger.info("Creating paperless user")
                self.run_command(['useradd', '-r', '-g', 'paperless', 'paperless'])
    
            return True
        except Exception as e:
            self.logger.error(f"Failed to create user/group: {str(e)}")
            return False
    

    def cleanup(self):
        """Clean up on failure"""
        if not self.cleanup_needed:
            return

        self.logger.info("Performing cleanup...")

        # Stop services if they were started during restore
        try:
            self.run_command(['systemctl', 'stop', 'paperless.service'], check=False)
            containers = self.run_command(['docker', 'ps', '-q', '-f', 'name=paperless'])
            if containers:
                self.run_command(['docker', 'stop', containers.split()])
        except Exception as e:
            self.logger.error(f"Error stopping services during cleanup: {str(e)}")

        # Restore original docker-compose if backup exists
        if self.yaml_backup:
            try:
                with open('/etc/paperless/docker-compose.yml', 'w') as f:
                    yaml.safe_dump(self.yaml_backup, f)
            except Exception as e:
                self.logger.error(f"Error restoring docker-compose.yml: {str(e)}")

        # Clean up created directories
        for dir_path in self.created_dirs:
            try:
                if os.path.islink(dir_path):
                    os.unlink(dir_path)
                elif os.path.isdir(dir_path):
                    shutil.rmtree(dir_path)
                self.logger.info(f"Cleaned up directory: {dir_path}")
            except Exception as e:
                self.logger.error(f"Error cleaning up directory {dir_path}: {str(e)}")

        # Clean up created files
        for file_path in self.created_files:
            try:
                if os.path.exists(file_path):
                    os.unlink(file_path)
                self.logger.info(f"Cleaned up file: {file_path}")
            except Exception as e:
                self.logger.error(f"Error cleaning up file {file_path}: {str(e)}")

        # Clean up user and group if they were created
        try:
            self.run_command(['userdel', 'paperless'], check=False)
            self.run_command(['groupdel', 'paperless'], check=False)
        except Exception as e:
            self.logger.error(f"Error removing user/group: {str(e)}")

        self.logger.info("Cleanup completed")


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

    def check_space(self):
        """Validate free space against backup size"""
        self.logger.info("Checking available space...")
        try:
            backup_size = sum(f.stat().st_size for f in self.backup_path.rglob('*') if f.is_file())
            backup_size_gb = backup_size / (1024 ** 3)

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

            self.logger.info(f"Space check passed. Required: {backup_size_gb:.3f}GB, Available: {free_space:.3f}GB")
            return True
        except Exception as e:
            self.logger.error(f"Space check failed: {str(e)}")
            return False

    def validate_backup_contents(self):
        """Validate backup contents"""
        self.logger.info("Validating backup contents...")
        try:
            # Check for ZIP backup file
            zip_files = list(self.backup_path.glob("*.zip"))
            if not zip_files or not zip_files[0].stat().st_size > 0:
                self.logger.error("Valid ZIP backup file not found")
                return False
            self.db_file = zip_files[0]

            # Check docker-compose file
            if not (self.backup_path / "docker-compose.yml").is_file():
                self.logger.error("docker-compose.yml not found in backup directory")
                return False

            self.logger.info("Backup contents validation passed")
            return True
        except Exception as e:
            self.logger.error(f"Backup validation failed: {str(e)}")
            return False

    def stop_services(self):
        """Stop Paperless services"""
        self.logger.info("Stopping Paperless services...")
        try:
            # Check if service is running
            status = self.run_command(['systemctl', 'is-active', 'paperless.service'], check=False)
            self.service_was_running = (status == 'active')

            # Stop systemd service
            self.run_command(['systemctl', 'stop', 'paperless.service'], check=False)
            
            # Stop any running containers
            containers = self.run_command(['docker', 'ps', '-q', '-f', 'name=paperless'])
            if containers:
                self.run_command(['docker', 'stop', containers.split()])
            
            self.logger.info("Services stopped successfully")
            return True
        except Exception as e:
            self.logger.warning(f"Service stop warning (may be already stopped): {str(e)}")
            return True

    def prepare_directories(self):
        """Prepare system directories"""
        self.logger.info("Preparing directories...")
        try:
            # Get DATA_VOL-home_dirs mount point
            mount_point_cmd = "df -P | grep 'DATA_VOL-home_dirs' | awk '{print $NF}'"
            mount_point = self.run_command(mount_point_cmd, shell=True)
            
            if not mount_point:
                self.logger.error("Could not find mount point for DATA_VOL-home_dirs")
                return False
                
            mount_point = mount_point.strip()
            paperless_data_path = Path(mount_point) / 'paperless'
            var_lib_paperless = Path('/var/lib/paperless')
            etc_paperless = Path('/etc/paperless')

            # Track directories for cleanup
            self.created_dirs.extend([str(paperless_data_path), str(var_lib_paperless), str(etc_paperless)])

            # Handle /etc/paperless
            if etc_paperless.exists():
                for item in etc_paperless.iterdir():
                    if item.is_file():
                        item.unlink()
                    elif item.is_dir():
                        shutil.rmtree(item)
            else:
                etc_paperless.mkdir(parents=True)

            # Handle /var/lib/paperless and its target
            if var_lib_paperless.is_symlink():
                target_path = Path(os.path.realpath(var_lib_paperless))
                var_lib_paperless.unlink()
                if target_path.exists():
                    for item in target_path.iterdir():
                        if item.is_file():
                            item.unlink()
                        elif item.is_dir():
                            shutil.rmtree(item)
            elif var_lib_paperless.exists():
                shutil.rmtree(var_lib_paperless)

            # Create paperless directory on DATA_VOL mount point
            paperless_data_path.mkdir(parents=True, exist_ok=True)
            if paperless_data_path.exists():
                for item in paperless_data_path.iterdir():
                    if item.is_file():
                        item.unlink()
                    elif item.is_dir():
                        shutil.rmtree(item)
            
            # Create the symlink
            os.symlink(str(paperless_data_path), str(var_lib_paperless))
            
            # Create import directory
            import_dir = var_lib_paperless / 'import'
            import_dir.mkdir(parents=True, exist_ok=True)
            
            self.logger.info(f"Created symlink: {var_lib_paperless} -> {paperless_data_path}")
            return True
        except Exception as e:
            self.logger.error(f"Failed to prepare directories: {str(e)}")
            return False

    def pull_docker_images(self):
        try:
            self.logger.info("Pulling Docker images...")
            
            # First get the list of services from docker-compose.yml
            with open('etc/paperless/docker-compose.yml', 'r') as f:
                compose_data = yaml.safe_load(f)
                services = compose_data.get('services', {}).keys()

            # Pull each service's image
            for service in services:
                self.logger.info(f"Pulling image for {service}...")
                
                pull_cmd = [
                    'docker', 'compose',
                    '-f', 'etc/paperless/docker-compose.yml',
                    'pull',
                    service
                ]
                
                process = subprocess.Popen(
                    pull_cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    universal_newlines=True
                )

                # Show real-time output
                while True:
                    output = process.stdout.readline()
                    if output == '' and process.poll() is not None:
                        break
                    if output:
                        # Remove ANSI color codes and clean up output
                        clean_output = re.sub(r'\x1b\[[0-9;]*[a-zA-Z]', '', output.strip())
                        if clean_output:  # Only log non-empty lines
                            self.logger.info(clean_output)

                if process.returncode != 0:
                    raise Exception(f"Failed to pull image for {service}")

            
            self.logger.info("Docker images pulled and containers created successfully")
            return True

        except Exception as e:
            self.logger.error(f"Failed to pull Docker images: {str(e)}")
            return False

    def restore_files(self):
        """Restore configuration and data files"""
        self.logger.info("Restoring files...")
        try:
            # Copy ZIP file
            shutil.copy2(self.db_file, "/var/lib/paperless/")
            self.created_files.append(str(Path("/var/lib/paperless") / self.db_file.name))
            
            # Extract ZIP file
            self.run_command(['unzip', str(Path("/var/lib/paperless") / self.db_file.name), 
                            '-d', '/var/lib/paperless/import/'])

            # Copy configuration files
            for file in self.backup_path.glob("*.yml"):
                shutil.copy2(file, "/etc/paperless/")
                self.created_files.append(str(Path("/etc/paperless") / file.name))
            
            for file in self.backup_path.glob("*.env"):
                shutil.copy2(file, "/etc/paperless/")
                self.created_files.append(str(Path("/etc/paperless") / file.name))

            # Update YAML
            self.run_command(['curl', '--insecure', '--request', 'POST', 'https://127.0.0.1:5000/update_YAML'])

            # Backup current docker-compose.yml
            compose_file = '/etc/paperless/docker-compose.yml'
            with open(compose_file) as f:
                self.yaml_backup = yaml.safe_load(f)

            # Update docker-compose.yml
            with open(compose_file) as f:
                compose_data = yaml.safe_load(f)

            if 'services' in compose_data and 'webserver' in compose_data['services']:
                if 'volumes' not in compose_data['services']['webserver']:
                    compose_data['services']['webserver']['volumes'] = []
                compose_data['services']['webserver']['volumes'].append(
                    '/var/lib/paperless/import:/usr/src/paperless/import'
                )

            with open(compose_file, 'w') as f:
                yaml.safe_dump(compose_data, f)

            # Ensure paperless user and group exist
            if not self.ensure_user_and_group():
                raise Exception("Failed to create paperless user/group")

            # Set ownership
            self.run_command(['chown', '-R', 'paperless:paperless', '/var/lib/paperless/import'])

            return True
        except Exception as e:
            self.logger.error(f"File restoration failed: {str(e)}")
            return False


    def create_service(self):
        """Create and start Paperless service"""
        self.logger.info("Creating service...")
        try:
            service_content = """[Unit]
Description=Paperless
Requires=docker.service
After=docker.service

[Service]
Type=simple
Restart=always
RestartSec=10
ExecStart=/usr/bin/docker compose -f /etc/paperless/docker-compose.yml up 
ExecStop=/usr/bin/docker compose -f /etc/paperless/docker-compose.yml down

[Install]
WantedBy=multi-user.target
"""
            with open('/etc/systemd/system/paperless.service', 'w') as f:
                f.write(service_content)
            self.created_files.append('/etc/systemd/system/paperless.service')

            self.run_command(['systemctl', 'daemon-reload'])
            #self.run_command(['systemctl', 'enable', 'paperless.service'])
            #self.run_command(['systemctl', 'start', 'paperless.service'])

            return True
        except Exception as e:
            self.logger.error(f"Service creation failed: {str(e)}")
            return False

    def wait_for_healthy(self):
        self.run_command(['systemctl', 'enable', 'paperless.service'])
        self.run_command(['systemctl', 'start', 'paperless.service'])

        """Wait for container to be healthy"""
        self.logger.info("Waiting for service to be healthy...")
        max_wait = 300  # 5 minutes
        while max_wait > 0:
            status = self.run_command(
                "docker ps --format '{{.Status}}' --filter name=paperless",
                shell=True
            )
            if status and 'healthy' in status.lower():
                return True
            time.sleep(1)
            max_wait -= 1
            if max_wait % 10 == 0:  # Log every 10 seconds
                self.logger.info(f"Waiting for service... ({max_wait} seconds remaining)")

        self.logger.error("Timeout waiting for service to become healthy")
        return False

    def import_documents(self):
        """Import documents"""
        self.logger.info("Importing documents...")
        try:
            self.run_command([
                'docker', 'compose', '-f', '/etc/paperless/docker-compose.yml',
                'exec', '-T', 'webserver', 'document_importer', '/usr/src/paperless/import'
            ])
            return True
        except Exception as e:
            self.logger.error(f"Document import failed: {str(e)}")
            return False

    def cleanup_import(self):
        """Clean up after import"""
        self.logger.info("Cleaning up import files...")
        try:
            # Restore original docker-compose.yml
            with open('/etc/paperless/docker-compose.yml', 'w') as f:
                yaml.safe_dump(self.yaml_backup, f)

            # Remove import directory and ZIP file
            shutil.rmtree('/var/lib/paperless/import')
            os.unlink(str(Path("/var/lib/paperless") / self.db_file.name))

            # Restart service
            self.run_command(['systemctl', 'restart', 'paperless.service'])
            
            return self.wait_for_healthy()
        except Exception as e:
            self.logger.error(f"Cleanup failed: {str(e)}")
            return False

    def run(self):
        """Main restoration process"""
        self.cleanup_needed = True
        try:
            steps = [
                (self.validate_backup_path, "Backup path validation"),
                (self.check_space, "Space validation"),
                (self.validate_backup_contents, "Backup validation"),
                (self.stop_services, "Service stoppage"),
                (self.prepare_directories, "Directory preparation"),
                (self.restore_files, "File restoration"),
                (self.create_service, "Service creation"),
                (self.pull_docker_images, "Pulling Docker images"),  # Add this step
                (self.wait_for_healthy, "Service health check"),
                (self.import_documents, "Document import"),
                (self.cleanup_import, "Import cleanup")
            ]

            for step_func, step_name in steps:
                self.logger.info(f"Starting {step_name}...")
                if not step_func():
                    print(json.dumps({
                        "status": "error",
                        "message": f"Failed during {step_name}"
                    }))
                    return False

            self.cleanup_needed = False
            print(json.dumps({
                "status": "success",
                "message": "Paperless restoration completed successfully"
            }))
            return True

        except Exception as e:
            print(json.dumps({
                "status": "error",
                "message": f"Unexpected error: {str(e)}"
            }))
            return False

def main():
    if len(sys.argv) != 2:
        print(json.dumps({
            "status": "error",
            "message": "Usage: paperless_restore.py <backup_path>"
        }))
        sys.exit(1)

    restore = PaperlessRestore(sys.argv[1])
    atexit.register(restore.cleanup)
    success = restore.run()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
