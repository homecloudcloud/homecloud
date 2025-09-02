#!/usr/bin/env python3

import os
import sys
import pwd
import grp
import shutil
import json
from datetime import datetime
import subprocess
import glob
import atexit
import time
import fcntl
import signal

class BackupError(Exception):
    """Custom exception for backup errors"""
    pass

class VaultwardenBackup:
    def __init__(self, backup_path, username, groupname):
        self.backup_path = backup_path
        self.username = username
        self.groupname = groupname
        self.backup_directory = None
        self.timestamp = None
        self.cleanup_needed = False
        self.service_was_running = False
        self.lock_file = "/tmp/vaultwarden_backup.lock"
        self.lock_pid_file = "/tmp/vaultwarden_backup.pid"
        
    def is_process_running(self, pid):
        """Check if process is still running"""
        try:
            os.kill(pid, 0)
            return True
        except OSError:
            return False
    
    def acquire_lock(self):
        """Acquire lock to prevent concurrent backups"""
        if os.path.exists(self.lock_file):
            if os.path.exists(self.lock_pid_file):
                try:
                    with open(self.lock_pid_file, 'r') as f:
                        old_pid = int(f.read().strip())
                    if self.is_process_running(old_pid):
                        print(json.dumps({
                            "status": "success",
                            "message": "Another Vaultwarden backup process is already running. Please wait for it to complete."
                        }))
                        sys.exit(0)
                    else:
                        self.cleanup_lock_files()
                except (ValueError, IOError):
                    self.cleanup_lock_files()
            else:
                self.cleanup_lock_files()
        
        try:
            with open(self.lock_pid_file, 'w') as f:
                f.write(str(os.getpid()))
            
            with open(self.lock_file, 'w') as f:
                f.write("locked")
            
        except IOError as e:
            raise BackupError(f"Failed to create lock files: {str(e)}")
        except Exception as e:
            raise BackupError(f"Unexpected error creating lock files: {str(e)}")
    
    def cleanup_lock_files(self):
        """Clean up lock files"""
        try:
            if os.path.exists(self.lock_file):
                os.remove(self.lock_file)
            if os.path.exists(self.lock_pid_file):
                os.remove(self.lock_pid_file)
        except OSError:
            pass

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
            raise BackupError(f"Command failed: {e.stderr}")

    def cleanup(self):
        """Clean up backup directory on error and restart service if it was running"""
        try:
            if self.cleanup_needed and self.backup_directory and os.path.exists(self.backup_directory):
                try:
                    shutil.rmtree(self.backup_directory)
                    print(json.dumps({
                        "status": "cleanup",
                        "message": f"Cleaned up incomplete backup: {self.backup_directory}"
                    }))
                except Exception as e:
                    print(json.dumps({
                        "status": "error",
                        "message": f"Failed to cleanup directory {self.backup_directory}: {str(e)}"
                    }))

            # Restart service if it was running before
            if self.service_was_running:
                try:
                    self.start_service()
                except Exception as e:
                    print(json.dumps({
                        "status": "error",
                        "message": f"Failed to restart service after cleanup: {str(e)}"
                    }))
            
            # Clean up lock files
            self.cleanup_lock_files()
        except Exception as e:
            print(json.dumps({
                "status": "error",
                "message": f"Cleanup failed: {str(e)}"
            }))
    
    def run_backup(self):
        """Main backup execution method"""
        try:
            # Acquire lock first
            self.acquire_lock()
            
            # Set up cleanup on exit (but not lock cleanup)
            atexit.register(self.cleanup_backup_only)
            
            print(json.dumps({"status": "info", "message": "Starting Vaultwarden backup..."}))
            
            self.validate_inputs()
            self.create_backup_directory()
            self.stop_service()
            self.backup_database()
            self.copy_files()
            self.change_ownership()
            self.start_service()
            
            self.cleanup_needed = False  # Successful backup, don't clean up
            
            print(json.dumps({
                "status": "success",
                "message": f"Vaultwarden backup completed successfully at {self.backup_directory}"
            }))
            
        except BackupError as e:
            print(json.dumps({"status": "error", "message": str(e)}))
            sys.exit(1)
        except Exception as e:
            print(json.dumps({"status": "error", "message": f"Unexpected error: {str(e)}"}))
            sys.exit(1)
        finally:
            self.cleanup_lock_files()
    
    def cleanup_backup_only(self):
        """Clean up backup directory and restart service but not lock files"""
        try:
            if self.cleanup_needed and self.backup_directory and os.path.exists(self.backup_directory):
                try:
                    shutil.rmtree(self.backup_directory)
                    print(json.dumps({
                        "status": "cleanup",
                        "message": f"Cleaned up incomplete backup: {self.backup_directory}"
                    }))
                except Exception as e:
                    print(json.dumps({
                        "status": "error",
                        "message": f"Failed to cleanup directory {self.backup_directory}: {str(e)}"
                    }))

            # Restart service if it was running before
            if self.service_was_running:
                try:
                    self.start_service()
                except Exception as e:
                    print(json.dumps({
                        "status": "error",
                        "message": f"Failed to restart service after cleanup: {str(e)}"
                    }))
        except Exception as e:
            print(json.dumps({
                "status": "error",
                "message": f"Cleanup failed: {str(e)}"
            }))

    def validate_inputs(self):
        """Validate input parameters"""
        try:
            if not os.path.exists(self.backup_path):
                raise BackupError(f"Backup path {self.backup_path} does not exist")
            if not os.access(self.backup_path, os.W_OK):
                raise BackupError(f"Backup path {self.backup_path} is not writable")
            pwd.getpwnam(self.username)
            grp.getgrnam(self.groupname)
            return True
        except (KeyError, BackupError) as e:
            raise BackupError(f"Validation error: {str(e)}")

    def check_service_status(self):
        """Check if vaultwarden service is running"""
        try:
            result = subprocess.run(
                ['systemctl', 'is-active', 'vaultwarden.service'],
                capture_output=True,
                text=True
            )
            return result.stdout.strip() == 'active'
        except Exception:
            return False

    def stop_service(self):
        """Stop vaultwarden service and containers"""
        try:
            # Check if service is running
            self.service_was_running = self.check_service_status()
            
            if self.service_was_running:
                # Stop systemd service
                self.run_command(['systemctl', 'stop', 'vaultwarden.service'])
                
                # Wait for service to stop
                max_wait = 30
                while max_wait > 0 and self.check_service_status():
                    time.sleep(1)
                    max_wait -= 1
                
                if max_wait == 0:
                    raise BackupError("Timeout waiting for service to stop")
            
            # Double check for any running containers
            containers = self.run_command(['docker', 'ps', '-q', '-f', 'name=vaultwarden'])
            if containers:
                self.run_command(['docker', 'stop', containers.split()])
            
            return True
        except Exception as e:
            raise BackupError(f"Failed to stop service: {str(e)}")

    def start_service(self):
        """Start vaultwarden service"""
        try:
            self.run_command(['systemctl', 'start', 'vaultwarden.service'])
            
            # Wait for service to be fully up
            max_wait = 300 
            while max_wait > 0:
                if self.check_service_status():
                    # Check container health
                    status = self.run_command(
                        "docker ps --format '{{.Status}}' --filter name=vaultwarden",
                        shell=True
                    )
                    if status and 'healthy' in status.lower():
                        return True
                time.sleep(1)
                max_wait -= 1
            
            raise BackupError("Timeout waiting for service to become healthy")
        except Exception as e:
            raise BackupError(f"Failed to start service: {str(e)}")

    def get_current_version(self):
        """Get current Vaultwarden version from docker-compose file"""
        compose_file = "/etc/vault-warden/docker-compose-vaultwarden.yml"
        try:
            with open(compose_file, 'r') as f:
                for line in f:
                    if 'image: vaultwarden/server:' in line:
                        return line.split(':')[-1].strip()
        except Exception:
            return "unknown"

    def create_backup_directory(self):
        """Create backup directory with timestamp"""
        try:
            self.timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M")
            current_version = self.get_current_version()
            self.backup_directory = os.path.join(
                self.backup_path, 
                "homecloud-backups", 
                "vaultwarden_backups",
                current_version, 
                self.timestamp
            )
            os.makedirs(self.backup_directory, exist_ok=True)
            self.cleanup_needed = True  # Enable cleanup for this directory
            return True
        except Exception as e:
            raise BackupError(f"Failed to create backup directory: {str(e)}")

    def backup_database(self):
        """Backup SQLite database"""
        try:
            db_backup_command = [
                "sqlite3",
                "/var/lib/vwdata/db.sqlite3",
                f".backup '{os.path.join(self.backup_directory, f'db-{self.timestamp}.sqlite3')}'"
            ]
            self.run_command(db_backup_command)
            return True
        except Exception as e:
            raise BackupError(f"Database backup failed: {str(e)}")

    def copy_files(self):
        """Copy required files and directories with VFAT filesystem support"""
        try:
            sources = [
                "/var/lib/vwdata/attachments",
                "/var/lib/vwdata/icon_cache",
                "/var/lib/vwdata/sends",
                "/var/lib/vwdata/config.json",
                "/var/lib/vwdata/db.sqlite3-shm",
                "/var/lib/vwdata/db.sqlite3",
                "/var/lib/vwdata/db.sqlite3-wal",
                "/etc/vault-warden/docker-compose-vaultwarden.yml"
            ]
            sources.extend(glob.glob("/var/lib/vwdata/rsa_key*"))

            for source in sources:
                if os.path.exists(source):
                    destination = os.path.join(self.backup_directory, source.lstrip('/'))
                    os.makedirs(os.path.dirname(destination), exist_ok=True)
                    
                    try:
                        if os.path.isdir(source):
                            # Use cp command for directories with --no-preserve=mode,ownership
                            cmd = ["cp", "-r", "--no-preserve=mode,ownership", source, os.path.dirname(destination)]
                            self.run_command(cmd)
                        else:
                            # Use cp command for files with --no-preserve=mode,ownership
                            cmd = ["cp", "--no-preserve=mode,ownership", source, destination]
                            self.run_command(cmd)
                    except Exception as e:
                        raise BackupError(f"Failed to copy {source}: {str(e)}")
                        
            return True
        except Exception as e:
            raise BackupError(f"File copy failed: {str(e)}")

    def change_ownership(self):
        """Change ownership of backup directory, ignoring filesystem limitations"""
        try:
            uid = pwd.getpwnam(self.username).pw_uid
            gid = grp.getgrnam(self.groupname).gr_gid
            
            # Try to change ownership but ignore errors on VFAT
            for root, dirs, files in os.walk(self.backup_directory):
                try:
                    os.chown(root, uid, gid, follow_symlinks=False)
                    for item in dirs + files:
                        try:
                            os.chown(os.path.join(root, item), uid, gid, follow_symlinks=False)
                        except OSError as e:
                            if e.errno not in (1, 30):  # Ignore EPERM and EROFS
                                raise
                except OSError as e:
                    if e.errno not in (1, 30):  # Ignore EPERM and EROFS
                        raise
            return True
        except Exception as e:
            if isinstance(e, OSError) and e.errno in (1, 30):
                # If we got permission errors but files were copied, consider it a success
                return True
            raise BackupError(f"Ownership change failed: {str(e)}")

    def run(self):
        """Execute backup process"""
        try:
            steps = [
                (self.validate_inputs, "Input validation"),
                (self.stop_service, "Service stoppage"),
                (self.create_backup_directory, "Backup directory creation"),
               # (self.backup_database, "Database backup"),
                (self.copy_files, "File copying"),
                (self.change_ownership, "Ownership change")
            ]

            for step_func, step_name in steps:
                try:
                    step_func()
                except BackupError as e:
                    print(json.dumps({
                        "status": "error",
                        "message": f"Failed during {step_name}: {str(e)}"
                    }))
                    return False

            # If we get here, backup was successful
            self.cleanup_needed = False  # Disable cleanup for successful backup
            
            # Start service if it was running before
            if self.service_was_running:
                self.start_service()
            
            print(json.dumps({"status": "success"}))
            return True

        except Exception as e:
            print(json.dumps({
                "status": "error",
                "message": f"Unexpected error: {str(e)}"
            }))
            return False

def main():
    if len(sys.argv) != 4:
        print(json.dumps({
            "status": "error",
            "message": "Usage: vaultwarden_backup_execute.py <backup_path> <username> <groupname>"
        }))
        sys.exit(1)

    backup = VaultwardenBackup(sys.argv[1], sys.argv[2], sys.argv[3])
    backup.run_backup()

if __name__ == "__main__":
    main()

