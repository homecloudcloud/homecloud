#!/usr/bin/python3

import os
import sys
import json
import shutil
import subprocess
import time
import logging
from pathlib import Path
import re
import atexit
import yaml
import stat
import errno
from datetime import datetime

class JoplinRestore:
    def __init__(self, backup_path):
        self.backup_path = Path(backup_path)
        self.db_file = None
        self.db_user = None
        self.db_name = None
        self.cleanup_needed = False
        self.created_dirs = []
        self.created_files = []
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

        # Stop services if they were started during restore
        try:
            self.run_command(['systemctl', 'stop', 'joplin.service'], check=False)
            containers = self.run_command(['docker', 'ps', '-q', '-f', 'name=joplin'])
            if containers:
                self.run_command(['docker', 'stop', containers.split()])
        except Exception as e:
            self.logger.error(f"Error stopping services during cleanup: {str(e)}")

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

            self.logger.info(f"Space check passed. Required: {backup_size_gb:.3f}GB, Available: {free_space:.3f}GB")
            return True
        except Exception as e:
            self.logger.error(f"Space check failed: {str(e)}")
            return False

    def validate_backup_contents(self):
        """Validate backup contents"""
        self.logger.info("Validating backup contents...")
        try:
            # Check for SQL backup file
            db_files = list(self.backup_path.glob("*.sql.gz"))
            if not db_files or not db_files[0].stat().st_size > 0:
                self.logger.error("Valid database backup file not found")
                return False
            self.db_file = db_files[0]

            # Check docker-compose file and .env file
            config_path = self.backup_path / "config"
            if not (config_path / "docker-compose.yml").is_file():
                self.logger.error("docker-compose.yml not found in config directory")
                return False
            if not (config_path / ".env").is_file():
                self.logger.error(".env file not found in config directory")
                return False

            self.logger.info("Backup contents validation passed")
            return True
        except Exception as e:
            self.logger.error(f"Backup validation failed: {str(e)}")
            return False

    def stop_services(self):
        """Stop Joplin services"""
        self.logger.info("Stopping Joplin services...")
        try:
            # Check if service is running
            status = self.run_command(['systemctl', 'is-active', 'joplin.service'], check=False)
            self.service_was_running = (status == 'active')

            # Stop systemd service
            self.run_command(['systemctl', 'stop', 'joplin.service'], check=False)
            
            # Stop any running containers
            containers = self.run_command(['docker', 'ps', '-q', '-f', 'name=joplin'])
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
            joplin_data_path = Path(mount_point) / 'joplin'
            var_lib_joplin = Path('/var/lib/joplin')
            etc_joplin = Path('/etc/joplin')

            # Track directories for cleanup
            self.created_dirs.extend([str(joplin_data_path), str(var_lib_joplin), str(etc_joplin)])

            # Handle /etc/joplin
            if etc_joplin.exists():
                for item in etc_joplin.iterdir():
                    if item.is_file():
                        item.unlink()
                    elif item.is_dir():
                        shutil.rmtree(item)
            else:
                etc_joplin.mkdir(parents=True)

            # Create joplin directory on DATA_VOL mount point
            joplin_data_path.mkdir(parents=True, exist_ok=True)
            
            # Handle /var/lib/joplin symlink
            if var_lib_joplin.is_symlink():
                var_lib_joplin.unlink()
            elif var_lib_joplin.exists():
                shutil.rmtree(var_lib_joplin)
            
            # Create the symlink
            os.symlink(str(joplin_data_path), str(var_lib_joplin))
            
            self.logger.info(f"Created symlink: {var_lib_joplin} -> {joplin_data_path}")
            return True
        except Exception as e:
            self.logger.error(f"Failed to prepare directories: {str(e)}")
            return False

    def restore_config(self):
        """Restore configuration files"""
        self.logger.info("Restoring configuration files...")
        try:
            # Copy config files
            config_source = self.backup_path / "config"
            for item in config_source.iterdir():
                dest_path = Path("/etc/joplin") / item.name
                if item.is_file():
                    shutil.copy2(item, dest_path)
                    self.created_files.append(str(dest_path))
                elif item.is_dir():
                    shutil.copytree(item, dest_path, dirs_exist_ok=True)
                    self.created_dirs.append(str(dest_path))
            
            # Update YAML
            self.run_command(['curl', '--insecure', '--request', 'POST', 'https://127.0.0.1:5000/update_YAML'])
            
            # Read environment variables from correct path
            env_file = Path("/etc/joplin/.env")
            with env_file.open() as f:
                env_content = f.read()
                db_match = re.search(r'^POSTGRES_DATABASE=(.+)$', env_content, re.MULTILINE)
                user_match = re.search(r'^POSTGRES_USER=(.+)$', env_content, re.MULTILINE)

                if not db_match or not user_match:
                    self.logger.error("Required database configuration not found")
                    return False

                self.db_name = db_match.group(1)
                self.db_user = user_match.group(1)

            self.logger.info("Configuration restored successfully")
            return True
        except Exception as e:
            self.logger.error(f"Configuration restoration failed: {str(e)}")
            return False


    def pull_docker_images(self):
        try:
            self.logger.info("Pulling Docker images...")
            
            # First get the list of services from docker-compose.yml
            with open('etc/joplin/docker-compose.yml', 'r') as f:
                compose_data = yaml.safe_load(f)
                services = compose_data.get('services', {}).keys()

            # Pull each service's image
            for service in services:
                self.logger.info(f"Pulling image for {service}...")
                
                pull_cmd = [
                    'docker', 'compose',
                    '-f', 'etc/joplin/docker-compose.yml',
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


    def restore_database(self):
        """Restore database"""
        self.logger.info("Restoring database...")
        try:
            # Copy and extract database backup
            db_backup_gz = Path("/var/lib/joplin/database_backup.sql.gz")
            db_backup_sql = Path("/var/lib/joplin/database_backup.sql")
            
            # Remove any existing files first
            if db_backup_gz.exists():
                db_backup_gz.unlink()
            if db_backup_sql.exists():
                db_backup_sql.unlink()
                
            # Copy and extract database backup
            shutil.copy2(self.db_file, db_backup_gz)
            self.created_files.append(str(db_backup_gz))
            
            # Use gunzip with force option
            self.run_command(['gunzip', '-f', str(db_backup_gz)])
            self.created_files.append(str(db_backup_sql))

            
            # Create service file
            service_file = '/etc/systemd/system/joplin.service'
            service_content = """[Unit]
Description=Joplin
Requires=docker.service
After=docker.service

[Service]
Type=simple
Restart=always
RestartSec=10
ExecStart=/usr/bin/docker compose -f /etc/joplin/docker-compose.yml up 
ExecStop=/usr/bin/docker compose -f /etc/joplin/docker-compose.yml down

[Install]
WantedBy=multi-user.target
"""
            with open(service_file, 'w') as f:
                f.write(service_content)
            self.created_files.append(service_file)

            self.run_command(['systemctl', 'daemon-reload'])
            self.run_command(['systemctl', 'enable', 'joplin.service'])

            # Start database container
            self.logger.info("Starting database container...")
            self.run_command(['docker', 'compose', '-f', '/etc/joplin/docker-compose.yml', 'up', 'db', '-d'])
            
            # Wait for container to be ready
            max_wait = 60
            while max_wait > 0:
                try:
                    check_cmd = f'docker compose -f /etc/joplin/docker-compose.yml exec -T db pg_isready -U {self.db_user}'
                    result = self.run_command(check_cmd, shell=True, check=False)
                    if result and "accepting connections" in result:
                        self.logger.info("Database is ready")
                        break
                except Exception:
                    pass
                time.sleep(1)
                max_wait -= 1
                self.logger.info(f"Waiting for database to be ready... ({max_wait} seconds remaining)")

            if max_wait == 0:
                self.logger.error("Timeout waiting for database container")
                return False

            # Drop existing database
            self.logger.info("Dropping existing database...")
            self.run_command(
                f'docker compose -f /etc/joplin/docker-compose.yml exec -T db psql -U {self.db_user} -d template1 -c "DROP DATABASE IF EXISTS {self.db_name}"',
                shell=True,
                check=False
            )

            # Create new database
            self.logger.info("Creating new database...")
            self.run_command(
                f'docker compose -f /etc/joplin/docker-compose.yml exec -T db psql -U {self.db_user} -d template1 -c "CREATE DATABASE {self.db_name}"',
                shell=True
            )

            # Restore database
            self.logger.info("Restoring database content...")
            self.run_command(
                f'docker compose -f /etc/joplin/docker-compose.yml exec -T db psql -U {self.db_user} {self.db_name} < /var/lib/joplin/database_backup.sql',
                shell=True
            )

            self.logger.info("Database restoration completed successfully")
            return True
        except Exception as e:
            self.logger.error(f"Database restoration failed: {str(e)}")
            return False

    def finalize_restore(self):
        """Finalize restoration process"""
        try:
            # Stop service
            self.run_command(['systemctl', 'stop', 'joplin.service'])
            
            # Remove DB_SKIP_MIGRATIONS
            #env_file = Path('/etc/immich/.env')
            #content = env_file.read_text()
            #content = content.replace('\nDB_SKIP_MIGRATIONS=true', '')
            #env_file.write_text(content)
           

            # Start service
            self.run_command(['systemctl', 'start', 'joplin.service'])
            
            self.logger.info("Restoration finalized successfully")
            return True
        except Exception as e:
            self.logger.error(f"Finalization failed: {str(e)}")
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
                (self.restore_config, "Configuration restoration"),
                (self.restore_database, "Database restoration"),
                (self.pull_docker_images, "Pulling Docker images"),  # Add this step
                (self.finalize_restore, "Finalization")
            ]

            for step_func, step_name in steps:
                self.logger.info(f"Starting {step_name}...")
                if not step_func():
                    print(json.dumps({
                        "status": "error",
                        "message": f"Failed during {step_name}"
                    }))
                    return False

            # If we get here, backup was successful
            self.cleanup_needed = False
            print(json.dumps({
                "status": "success",
                "message": "Joplin restoration completed successfully"
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
            "message": "Usage: joplin_restore.py <backup_path>"
        }))
        sys.exit(1)

    restore = JoplinRestore(sys.argv[1])
    atexit.register(restore.cleanup)  # Register cleanup handler
    success = restore.run()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()

