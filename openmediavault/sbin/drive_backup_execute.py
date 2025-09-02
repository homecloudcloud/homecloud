#!/usr/bin/python3

import os
import sys
import json
import subprocess
import time
import logging
from pathlib import Path
from datetime import datetime
import shutil
import atexit
import signal

class DriveBackup:
    def __init__(self, backup_path):
        self.backup_path = Path(backup_path)
        # Will be set dynamically in validate_paths
        self.source_dir = None
        self.timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M")
        self.backup_directory = None
        self.lock_file = "/tmp/drive_backup.lock"
        self.lock_pid_file = "/tmp/drive_backup.pid"
        
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
        """Acquire lock to prevent concurrent backups"""
        if os.path.exists(self.lock_file):
            if os.path.exists(self.lock_pid_file):
                try:
                    with open(self.lock_pid_file, 'r') as f:
                        old_pid = int(f.read().strip())
                    if self.is_process_running(old_pid):
                        print(json.dumps({
                            "status": "success",
                            "message": "Another Drive backup process is already running. Please wait for it to complete."
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
            open(self.lock_file, 'w').close()
        except IOError as e:
            self.logger.error(f"Failed to create lock files: {str(e)}")
            sys.exit(1)
    
    def cleanup_lock_files(self):
        """Clean up lock files"""
        try:
            if os.path.exists(self.lock_file):
                os.remove(self.lock_file)
            if os.path.exists(self.lock_pid_file):
                os.remove(self.lock_pid_file)
        except OSError:
            pass

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

    def validate_paths(self):
        """Validate backup path and source directory"""
        self.logger.info("Validating paths...")
        
        # Find mount point for DATA_VOL-home_dirs
        mount_cmd = "df -P /dev/mapper/DATA_VOL-home_dirs | tail -1 | awk '{print $NF}'"
        mount_point = self.run_command(mount_cmd, shell=True)
        
        if not mount_point:
            self.logger.error("Could not find mount point for DATA_VOL-home_dirs")
            return False
            
        self.source_dir = Path(mount_point)
        self.logger.info(f"Found source directory: {self.source_dir}")
        
        # Check backup path exists and is writable
        if not self.backup_path.exists():
            self.logger.error(f"Backup path {self.backup_path} does not exist")
            return False
        if not os.access(self.backup_path, os.W_OK):
            self.logger.error(f"Backup path {self.backup_path} is not writable")
            return False
            
        # Check source directory exists and is readable
        if not self.source_dir.exists():
            self.logger.error(f"Source directory {self.source_dir} does not exist")
            return False
        if not os.access(self.source_dir, os.R_OK):
            self.logger.error(f"Source directory {self.source_dir} is not readable")
            return False
        
        # Check filesystem type
        fs_type_cmd = f"df -T {self.backup_path} | tail -1 | awk '{{print $2}}'"
        fs_type = self.run_command(fs_type_cmd, shell=True).lower()
        
        # List of filesystems that don't support Unix permissions
        unsupported_fs = ['vfat', 'ntfs', 'exfat', 'msdos', 'fat', 'fuseblk']
        
        if fs_type in unsupported_fs:
            self.logger.error(f"Backup path filesystem ({fs_type}) does not support Unix permissions")
            self.logger.error("Please use a filesystem that supports Unix permissions (ext4, xfs, btrfs, etc.)")
            return False
            
        self.logger.info(f"Filesystem check passed: {fs_type}")
        self.logger.info("Path validation successful")
        return True

    def prepare_backup_directory(self):
        """Prepare backup directory"""
        self.logger.info("Preparing backup directory...")
        
        # Create backup directory structure
        backup_base = self.backup_path / "homecloud-backups" / "drive_backups" / "1.0.0"
        backup_base.mkdir(parents=True, exist_ok=True)
        
        # Check if drive_backups directory already exists with timestamp directories
        existing_timestamp_dirs = [d for d in backup_base.iterdir() 
                                  if d.is_dir() and not d.name.startswith('.')]
        
        if existing_timestamp_dirs:
            # Use the most recent timestamp directory
            self.logger.info(f"Found existing timestamp directories: {[d.name for d in existing_timestamp_dirs]}")
            
            # Check if current timestamp directory already exists
            current_timestamp_dir = backup_base / self.timestamp
            if current_timestamp_dir.exists():
                self.logger.info(f"Directory with current timestamp {self.timestamp} already exists, using it")
                self.backup_directory = current_timestamp_dir
            else:
                # Rename the existing directory to the current timestamp
                existing_dir = existing_timestamp_dirs[0]  # Just use the first one if multiple exist
                self.logger.info(f"Renaming {existing_dir.name} to {self.timestamp}")
                existing_dir.rename(backup_base / self.timestamp)
                self.backup_directory = backup_base / self.timestamp
        else:
            # Create new timestamp directory if none exists
            self.logger.info("No existing timestamp directories found, creating new one")
            self.backup_directory = backup_base / self.timestamp
            self.backup_directory.mkdir(parents=True, exist_ok=True)
        
        self.logger.info(f"Using backup directory: {self.backup_directory}")
        return True

    def perform_backup(self):
        """Perform rsync backup"""
        self.logger.info("Starting backup process...")
        
        # Build rsync command with full permissions preservation
        # Add exclude options for specified directories and files
        rsync_cmd = [
            'rsync', 
            '-a',  # Archive mode (preserves permissions, timestamps, etc.)
            '--progress',
            '--exclude=homes/admin',
            '--exclude=vwdata',
            '--exclude=immich',
            '--exclude=paperless',
            '--exclude=joplin',
            '--exclude=jellyfin',
            '--exclude=lost+found',
            '--exclude=aquota.*',
            str(self.source_dir) + '/', 
            str(self.backup_directory)
        ]
        
        # Execute rsync with real-time progress
        self.logger.info("Running rsync with full permission preservation")
        self.logger.info(f"Excluding directories: home/admin, vwdata, immich, paperless, joplin, jellyfin, lost+found, aquota.*")
        
        try:
            # Use Popen to capture output in real-time
            process = subprocess.Popen(
                rsync_cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                bufsize=1
            )
            
            # Process and display output
            for line in process.stdout:
                line = line.strip()
                if line:
                    # Only log lines that contain progress information
                    if '%' in line or 'sending incremental file list' in line:
                        self.logger.info(line)
            
            # Wait for process to complete
            process.wait()
            
            if process.returncode != 0:
                self.logger.error(f"Rsync failed with return code {process.returncode}")
                return False
                
            self.logger.info("Backup completed successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Backup failed: {str(e)}")
            return False

    def backup_user_list(self):
        """Backup list of non-system users with UID, GID, group memberships and password hashes"""
        self.logger.info("Backing up list of non-system users with UID, GID, group memberships and password hashes...")
        
        try:
            # Get list of non-system users (UID >= 1000) excluding admin and nobody
            cmd = "awk -F: '$3 >= 1000 && $1 != \"admin\" && $1 != \"nobody\" {print $1}' /etc/passwd"
            users_output = self.run_command(cmd, shell=True)
            
            if not users_output:
                self.logger.info("No non-system users found")
                return True
            
            users = users_output.strip().split('\n')
            user_data = []
            
            # For each user, get their UID, GID, group memberships and password hash
            for user in users:
                # Get user ID
                uid_cmd = f"id -u {user}"
                uid = self.run_command(uid_cmd, shell=True)
                
                # Get primary group ID
                gid_cmd = f"id -g {user}"
                gid = self.run_command(gid_cmd, shell=True)
                
                # Get all groups with GIDs
                groups_cmd = f"id -G {user}"
                group_ids = self.run_command(groups_cmd, shell=True)
                
                # Store user data
                user_data.append({
                    'username': user,
                    'uid': uid,
                    'gid': gid,
                    'group_ids': group_ids
                })
            
            # Write user data to backup file
            user_backup_file = self.backup_directory / 'users_backup.json'
            with open(user_backup_file, 'w') as f:
                json.dump(user_data, f, indent=2)
            
            self.logger.info(f"User backup completed: {len(users)} users backed up")
            return True
            
        except Exception as e:
            self.logger.error(f"User backup failed: {str(e)}")
            return False
    
    def run_backup(self):
        """Main backup execution method"""
        try:
            # Acquire lock first
            self.acquire_lock()
            
            # Set up cleanup on exit
            atexit.register(self.cleanup_lock_files)
            
            self.logger.info("Starting Drive backup...")
            
            if not self.validate_paths():
                print(json.dumps({"status": "error", "message": "Path validation failed"}))
                sys.exit(1)
            
            if not self.prepare_backup_directory():
                print(json.dumps({"status": "error", "message": "Failed to prepare backup directory"}))
                sys.exit(1)
            
            if not self.perform_backup():
                print(json.dumps({"status": "error", "message": "Backup failed"}))
                sys.exit(1)
            
            if not self.backup_user_list():
                print(json.dumps({"status": "error", "message": "User backup failed"}))
                sys.exit(1)
            
            print(json.dumps({
                "status": "success",
                "message": f"Drive backup completed successfully at {self.backup_directory}"
            }))
            
        except Exception as e:
            self.logger.error(f"Unexpected error: {str(e)}")
            print(json.dumps({"status": "error", "message": f"Unexpected error: {str(e)}"}))
            sys.exit(1)
        finally:
            self.cleanup_lock_files()

def main():
    if len(sys.argv) != 2:
        print(json.dumps({
            "status": "error",
            "message": "Usage: drive_backup_execute.py <backup_path>"
        }))
        sys.exit(1)
    
    backup_path = sys.argv[1]
    backup = DriveBackup(backup_path)
    backup.run_backup()

if __name__ == "__main__":
    main()