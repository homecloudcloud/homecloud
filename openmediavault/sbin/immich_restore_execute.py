#!/usr/bin/python3

import os
import sys
import json
import re
import shutil
import subprocess
from pathlib import Path
import logging
import yaml
import stat
import errno
from pathlib import Path
from datetime import datetime
import atexit
import time

class ImmichRestore:
    def __init__(self, backup_path):
        self.backup_path = Path(backup_path)
        self.db_file = None
        self.db_user = None
        self.db_name = None
        self.is_new_backup_type = None
        self.lock_file = "/tmp/immich_restore.lock"
        self.lock_pid_file = "/tmp/immich_restore.pid"
        
        # Setup logging
        logging.basicConfig(
            format='%(asctime)s - %(levelname)s - %(message)s',
            level=logging.INFO
        )
        self.logger = logging.getLogger(__name__)
        
    def is_process_running(self, pid):
        """Check if process is still running"""
        try:
            os.kill(pid, 0)
            return True
        except OSError:
            return False
    
    def acquire_lock(self):
        """Acquire lock to prevent concurrent restores"""
        if os.path.exists(self.lock_file):
            if os.path.exists(self.lock_pid_file):
                try:
                    with open(self.lock_pid_file, 'r') as f:
                        old_pid = int(f.read().strip())
                    if self.is_process_running(old_pid):
                        self.return_json("success", "Another Immich restore process is already running. Please wait for it to complete.")
                    else:
                        self.cleanup_lock_files()
                except (ValueError, IOError):
                    self.cleanup_lock_files()
            else:
                self.cleanup_lock_files()
        
        try:
            with open(self.lock_pid_file, 'w') as f:
                f.write(str(os.getpid()))
            open(self.lock_file, 'w').close()
        except IOError as e:
            self.return_json("error", f"Failed to create lock files: {str(e)}")
    
    def cleanup_lock_files(self):
        """Clean up lock files"""
        try:
            if os.path.exists(self.lock_file):
                os.remove(self.lock_file)
            if os.path.exists(self.lock_pid_file):
                os.remove(self.lock_pid_file)
        except OSError:
            pass

    def return_json(self, status, message):
        """Return formatted JSON response"""
        print(json.dumps({
            "status": status,
            "message": message
        }))
        sys.exit(0 if status == "success" else 1)

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

    def validate_backup(self):
        """Validate backup contents and structure"""
        try:
            # Check read permissions
            if not os.access(self.backup_path, os.R_OK):
                self.logger.error("Insufficient permissions on backup path")
                return False

            # Determine backup type
            upload_in_backup = (self.backup_path / "upload").is_dir()
            self.is_new_backup_type = not upload_in_backup
            
            # For new backup type, check backup status
            if self.is_new_backup_type:
                status_file = self.backup_path / "backup.status"
                if status_file.is_file():
                    status = status_file.read_text().strip()
                    if status != "COMPLETED":
                        self.logger.error(f"Backup data is incomplete. Status: {status}")
                        return False
                else:
                    self.logger.error("Backup status file not found. Backup data may be incomplete.")
                    return False

            # Find DB backup file
            db_files = list(self.backup_path.glob("*.sql.*"))
            if not db_files or not db_files[0].stat().st_size > 0:
                self.logger.error("Valid database backup file not found")
                return False
            self.db_file = db_files[0]

            # Check config directory and files
            config_path = self.backup_path / "config"
            if not (config_path / "docker-compose.yml").is_file() or not (config_path / ".env").is_file():
                self.logger.error("Missing required configuration files")
                return False

            # Check upload directory based on backup type
            if self.is_new_backup_type:
                # New backup type - upload at version level
                upload_path = self.backup_path.parent.parent / "upload"
            else:
                # Old backup type - upload in backup directory
                upload_path = self.backup_path / "upload"
                
            if not upload_path.is_dir() or not any(upload_path.iterdir()):
                self.logger.error("Upload directory is missing or empty")
                return False

            # Read environment variables
            env_file = config_path / ".env"
            with env_file.open() as f:
                env_content = f.read()
                db_user_match = re.search(r'^DB_USERNAME=(.+)$', env_content, re.MULTILINE)
                db_name_match = re.search(r'^DB_DATABASE_NAME=(.+)$', env_content, re.MULTILINE)

                if not db_user_match or not db_name_match:
                    self.logger.error("Required database configuration not found")
                    return False

                self.db_user = db_user_match.group(1)
                self.db_name = db_name_match.group(1)

            self.logger.info("Backup validation passed")
            return True

        except Exception as e:
            self.logger.error(f"Backup validation failed: {str(e)}")
            return False

    def stop_services(self):
        """Stop Immich services"""
        try:
            # Stop systemd service
            self.run_command(['systemctl', 'stop', 'immich.service'])
            
            # Stop any running containers
            #containers = self.run_command(['docker', 'ps', '-q', '-f', 'name=immich'])
            #if containers:
            #    self.run_command(['docker', 'stop', containers.split()])
            
            self.logger.info("Services stopped successfully")
            return True
        except Exception as e:
            self.logger.error(f"Failed to stop services: {str(e)}")
            return False

    def print_status(message, error=False):
        """Print formatted status messages"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        if error:
            print(f"\033[91m[{timestamp}] ERROR: {message}\033[0m", flush=True)
        else:
            print(f"\033[92m[{timestamp}] {message}\033[0m", flush=True)

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
            #self.logger.info(f"Found mount point: {mount_point}")
            immich_data_path = Path(mount_point) / 'immich'

            # Handle /etc/immich - just clear contents
            etc_immich = Path('/etc/immich')
            if etc_immich.exists():
                # Remove contents but keep the directory
                for item in etc_immich.iterdir():
                    if item.is_file():
                        item.unlink()
                    elif item.is_dir():
                        shutil.rmtree(item)
            else:
                etc_immich.mkdir(parents=True)

            # Handle /var/lib/immich
            var_lib_immich = Path('/var/lib/immich/')
            
            if immich_data_path.exists():
                # Remove contents but keep the directory
                for item in immich_data_path.iterdir():
                    if item.is_file():
                        item.unlink()
                    elif item.is_dir():
                        shutil.rmtree(item)
            else:
                immich_data_path.mkdir(parents=True, exist_ok=True)
            
           
            # Remove old symlink if exists
            if var_lib_immich.is_symlink():
                var_lib_immich.unlink()
            # If it's a directory, remove it
            elif var_lib_immich.exists():
                shutil.rmtree(var_lib_immich)
                
            # Create new symlink
            os.symlink(immich_data_path, var_lib_immich)

            # Copy config files
            config_source = self.backup_path / "config"
            for item in config_source.iterdir():
                if item.is_file():
                    shutil.copy2(item, "/etc/immich/")
                elif item.is_dir():
                    shutil.copytree(item, Path("/etc/immich") / item.name, dirs_exist_ok=True)
            
            # Update YAML
            try:
                self.run_command(['curl', '--insecure', '--request', 'POST', 'https://127.0.0.1:5000/update_YAML'])
            except Exception as e:
                self.logger.warning(f"YAML update warning: {str(e)}")
            
            # Update .env file
            #with open('/etc/immich/.env', 'a') as f:
            #    f.write("\nDB_SKIP_MIGRATIONS=true\n")

            # Copy upload directory contents with progress
            if self.is_new_backup_type:
                upload_source = self.backup_path.parent.parent / "upload"
            else:
                upload_source = self.backup_path / "upload"
            
            self.logger.info("Copying media files...")
            self.copy_with_progress(upload_source, immich_data_path)
            
            self.logger.info("Directories prepared successfully")
            return True
        except Exception as e:
            self.logger.error(f"Failed to prepare directories: {str(e)}")
            return False

    def create_service(self):
        """Create and start Immich service"""
        service_content = """[Unit]
Description=Immich
Requires=docker.service
After=docker.service

[Service]
Type=simple
Restart=always
RestartSec=10
ExecStart=/usr/bin/docker compose -f /etc/immich/docker-compose.yml up 
ExecStop=/usr/bin/docker compose -f /etc/immich/docker-compose.yml down

[Install]
WantedBy=multi-user.target
"""
        try:
            with open('/etc/systemd/system/immich.service', 'w') as f:
                f.write(service_content)

            self.run_command(['systemctl', 'daemon-reload'])
            self.run_command(['systemctl', 'start', 'immich.service'])
            
            self.logger.info("Service created and started")
            return True
        except Exception as e:
            self.logger.error(f"Failed to create service: {str(e)}")
            return False

    def restore_database(self):
       """Restore database from backup"""
       try:
        # Read docker-compose.yml to get database container name
        import yaml
        
        docker_compose_path = Path('/etc/immich/docker-compose.yml')
        with docker_compose_path.open('r') as f:
            compose_config = yaml.safe_load(f)
            
        db_container_name = compose_config.get('services', {}).get('database', {}).get('container_name', 'database')
        self.logger.info(f"Found database container name: {db_container_name}")

        # Stop immich service first
        self.run_command(['systemctl', 'stop', 'immich.service'])
        
        # Bring down all containers first to handle existing containers
        self.run_command(['docker', 'compose', '-f', '/etc/immich/docker-compose.yml', 'down', '--remove-orphans', '--volumes'])
        
        # Force stop and remove any existing container with the same name
        self.run_command(['docker', 'stop', db_container_name])
        self.run_command(['docker', 'rm', '-f', db_container_name])
        
        # Start the database container specifically
        self.run_command(['docker', 'compose', '-f', '/etc/immich/docker-compose.yml', 'up', '-d', 'database'])
        
        # Wait for container to be healthy
        import time
        max_wait = 300  # Maximum wait time in seconds (5 minutes)
        wait_interval = 5  # Check every 5 seconds
        elapsed_time = 0
        
        self.logger.info(f"Waiting for database container {db_container_name} to be healthy...")
        while elapsed_time < max_wait:
            # Check container health status
            health_cmd = f"docker ps --format '{{{{.Status}}}}' --filter name={db_container_name}"
            status = self.run_command(health_cmd, shell=True)
            
            if status and 'healthy' in status.lower():
                self.logger.info(f"Database container is healthy after {elapsed_time} seconds")
                break
            
            self.logger.info(f"Waiting for database to be healthy... (Current status: {status})")
            time.sleep(wait_interval)
            elapsed_time += wait_interval
            
        if elapsed_time >= max_wait:
            self.logger.error("Timeout waiting for database container to become healthy")
            return False

        # Proceed with database restoration
        restore_cmd = f"""gunzip < "{self.db_file}" | \
            sed "s/SELECT pg_catalog.set_config('search_path', '', false);/SELECT pg_catalog.set_config('search_path', 'public, pg_catalog', true);/g" | \
            docker compose -f /etc/immich/docker-compose.yml exec -T database psql --dbname={self.db_name} --username={self.db_user}"""
        
        if self.run_command(restore_cmd, shell=True) is None:
            return False

        self.logger.info("Database restored successfully")
        return True
       except Exception as e:
        self.logger.error(f"Database restoration failed: {str(e)}")
        return False

    def pull_docker_images(self):
        try:
            self.logger.info("Pulling Docker images...")
            
            # First get the list of services from docker-compose.yml
            with open('/etc/immich/docker-compose.yml', 'r') as f:
                compose_data = yaml.safe_load(f)
                services = compose_data.get('services', {}).keys()

            # Pull each service's image
            for service in services:
                self.logger.info(f"Pulling image for {service}...")
                
                pull_cmd = [
                    'docker', 'compose',
                    '-f', '/etc/immich/docker-compose.yml',
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

            # Create containers
            #self.logger.info("Creating containers...")
            #create_cmd = [
            #    'docker', 'compose',
            #    '-f', '/etc/immich/docker-compose.yml',
            #    'create'
            #]
            
            #result = subprocess.run(
            #    create_cmd,
            #    capture_output=True,
            #    text=True,
            #    check=True
            #)

            #if result.stdout:
            #    self.logger.info(result.stdout)
            
            self.logger.info("Docker images pulled and containers created successfully")
            return True

        except Exception as e:
            self.logger.error(f"Failed to pull Docker images: {str(e)}")
            return False

    def finalize_restore(self):
        """Finalize restoration process"""
        try:
            # Stop service
            self.run_command(['systemctl', 'stop', 'immich.service'])
            
            # Remove DB_SKIP_MIGRATIONS
            #env_file = Path('/etc/immich/.env')
            #content = env_file.read_text()
            #content = content.replace('\nDB_SKIP_MIGRATIONS=true', '')
            #env_file.write_text(content)
           

            # Start service
            self.run_command(['systemctl', 'start', 'immich.service'])
            
            self.logger.info("Restoration finalized successfully")
            return True
        except Exception as e:
            self.logger.error(f"Finalization failed: {str(e)}")
            return False

    def copy_with_progress(self, source, destination):
        """Copy files with periodic progress updates"""
        try:
            total_files = sum(1 for _ in source.rglob('*') if _.is_file())
            copied_files = 0
            last_progress_time = time.time()
            
            for item in source.iterdir():
                dest_path = destination / item.name
                if item.is_file():
                    shutil.copy2(item, dest_path)
                    copied_files += 1
                elif item.is_dir():
                    shutil.copytree(item, dest_path, dirs_exist_ok=True)
                    copied_files += sum(1 for _ in item.rglob('*') if _.is_file())
                
                # Show progress every 30 seconds
                current_time = time.time()
                if current_time - last_progress_time > 30:
                    progress = (copied_files / total_files) * 100 if total_files > 0 else 0
                    self.logger.info(f"Progress: {progress:.1f}% ({copied_files}/{total_files} files)")
                    last_progress_time = current_time
                    
        except Exception as e:
            raise Exception(f"File copy failed: {str(e)}")
    
    def run(self):
        """Main restoration process"""
        try:
            # Acquire lock first
            self.acquire_lock()
            
            # Set up cleanup on exit
            atexit.register(self.cleanup_lock_files)
            
            steps = [
                (self.check_space, "Space validation"),
                (self.validate_backup, "Backup validation"),
                (self.stop_services, "Service stoppage"),
                (self.prepare_directories, "Copying files - it may take a while. You can move away from this window. To see the status, go to notifications and attach to background process."),
                (self.create_service, "Service creation"),
                (self.restore_database, "Database restoration"),
                (self.pull_docker_images, "Pulling Docker images"),
                (self.finalize_restore, "Finalization")
            ]

            for step_func, step_name in steps:
                self.logger.info(f"Starting {step_name}...")
                if not step_func():
                    self.return_json("error", f"Failed during {step_name}")

            self.return_json("success", "Immich restoration completed successfully. Pls wait for few minutes for app to deploy and start.")
            
        except Exception as e:
            self.logger.error(f"Unexpected error: {str(e)}")
            self.return_json("error", f"Unexpected error: {str(e)}")
        finally:
            self.cleanup_lock_files()

def main():
    if len(sys.argv) != 2:
        print(json.dumps({
            "status": "error",
            "message": "Usage: immich_restore_execute.py <backup_path>"
        }))
        sys.exit(1)

    restore = ImmichRestore(sys.argv[1])
    restore.run()

if __name__ == "__main__":
    main()

