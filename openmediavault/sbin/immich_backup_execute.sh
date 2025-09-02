#!/bin/bash

# Lock file for preventing concurrent backups
LOCK_FILE="/tmp/immich_backup.lock"
LOCK_PID_FILE="/tmp/immich_backup.pid"

# Function to cleanup lock files
cleanup_lock() {
    rm -f "$LOCK_FILE" "$LOCK_PID_FILE"
}

# Function to check if process is still running
is_process_running() {
    local pid=$1
    kill -0 "$pid" 2>/dev/null
}

# Function to acquire lock
acquire_lock() {
    # Check if lock file exists
    if [ -f "$LOCK_FILE" ]; then
        # Check if PID file exists and process is still running
        if [ -f "$LOCK_PID_FILE" ]; then
            local old_pid=$(cat "$LOCK_PID_FILE")
            if is_process_running "$old_pid"; then
                echo "{\"Status\": \"Success\", \"Message\": \"Another Immich backup process is already running. Please wait for it to complete.\"}"
                exit 0
            else
                # Stale lock, remove it
                cleanup_lock
            fi
        else
            # Lock file exists but no PID file, assume stale
            cleanup_lock
        fi
    fi
    
    # Create lock file and PID file
    echo $$ > "$LOCK_PID_FILE"
    touch "$LOCK_FILE"
}

# Function to print progress message
print_progress() {
    echo "Progress: $1"
}

# Function to read UPLOAD_LOCATION from .env file
get_upload_location() {
    local env_file="/etc/immich/.env"
    
    if [ ! -f "$env_file" ]; then
        echo "{\"Status\": \"Error: Environment file not found at $env_file\"}"
        exit 1
    fi
    
    local value=$(grep "^UPLOAD_LOCATION=" "$env_file" | cut -d '=' -f2- | sed 's/^"\(.*\)"$/\1/')
    echo "$value"
}

# Function to get Immich version from .env file
get_immich_version() {
    local env_file="/etc/immich/.env"
    
    if [ ! -f "$env_file" ]; then
        echo "{\"Status\": \"Error: Environment file not found at $env_file\"}"
        exit 1
    fi
    
    # Extract version number from IMMICH_VERSION line, removing 'v' prefix if present
    local version=$(grep "^IMMICH_VERSION=" "$env_file" | cut -d '=' -f2- | sed 's/^v//' | sed 's/^"\(.*\)"$/\1/')
    
    if [ -z "$version" ]; then
        echo "{\"Status\": \"Error: Could not find IMMICH_VERSION in $env_file\"}"
        exit 1
    fi
    
    echo "$version"
}

# Function to validate backup path
validate_path() {
    local path=$1
    
    if [ ! -d "$path" ]; then
        echo "{\"Status\": \"Error: Directory '$path' does not exist\"}"
        exit 1
    fi
    
    if [ ! -w "$path" ]; then
        echo "{\"Status\": \"Error: Directory '$path' is not writable\"}"
        exit 1
    fi
}

# Function to get filesystem type
get_fs_type() {
    df -T "$1" | awk 'NR==2 {print $2}'
}

# Function to validate user exists
validate_user() {
    local username=$1
    if ! id "$username" >/dev/null 2>&1; then
        echo "{\"Status\": \"Error: User '$username' does not exist\"}"
        exit 1
    fi
}

# Function to validate group exists
validate_group() {
    local groupname=$1
    if ! getent group "$groupname" >/dev/null 2>&1; then
        echo "{\"Status\": \"Error: Group '$groupname' does not exist\"}"
        exit 1
    fi
}

# Function to check if filesystem supports ownership
supports_ownership() {
    local fs_type=$1
    case "$fs_type" in
        ext4|ext3|ext2|xfs|btrfs|zfs|jfs|reiserfs)
            return 0  # true
            ;;
        vfat|ntfs|exfat|msdos|fat32)
            return 1  # false
            ;;
        *)
            return 1  # false for unknown filesystems
            ;;
    esac
}

# Check if required arguments are provided
if [ $# -ne 3 ]; then
    echo "{\"Status\": \"Error: Usage: $0 <backup_path> <username> <groupname>\"}"
    exit 1
fi

# Acquire lock to prevent concurrent backups
acquire_lock

# Set up cleanup on exit
trap cleanup_lock EXIT INT TERM

# Print initial warning message
echo "Starting Immich backup process..."
echo "Warning: Backup may take a long time (many hours) depending on the amount of data."
echo "You can close this window. To see the status, go to notifications and attach to background process."

BACKUP_PATH="$1"
USERNAME="$2"
GROUPNAME="$3"

# Validate backup path
validate_path "$BACKUP_PATH"

# Validate username
validate_user "$USERNAME"

# Validate group
validate_group "$GROUPNAME"

# Get UPLOAD_LOCATION
UPLOAD_LOCATION=$(get_upload_location)
if [ -z "$UPLOAD_LOCATION" ]; then
    echo "{\"Status\": \"Error: Could not read UPLOAD_LOCATION from /etc/immich/.env\"}"
    exit 1
fi

# Get current timestamp in format: YYYY-MM-DD_HH-MM
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M")

VERSION=$(get_immich_version)

# Handle existing version directory
VERSION_DIR="${BACKUP_PATH}/homecloud-backups/immich_backups/${VERSION}"
BACKUP_DIR="${BACKUP_PATH}/homecloud-backups/immich_backups/${VERSION}/${TIMESTAMP}"
MOVED_EXISTING=false

if [ -d "$VERSION_DIR" ]; then
    # Find existing subdirectory and rename it
    for existing_dir in "$VERSION_DIR"/*; do
        if [ -d "$existing_dir" ] && [ "$(basename "$existing_dir")" != "upload" ]; then
            # Check if upload subdir exists (indicates older backup type)
            if [ ! -d "$existing_dir/upload" ]; then
                # Only move if it's not the same directory
                if [ "$existing_dir" != "$BACKUP_DIR" ]; then
                    mv "$existing_dir" "$BACKUP_DIR"
                    MOVED_EXISTING=true
                    break
                fi
            fi
            #break
        fi
    done
fi

# Create backup directory with timestamp only if we didn't move an existing one
if [ "$MOVED_EXISTING" = false ]; then
    mkdir -p "$BACKUP_DIR"
fi

# Create status file in backup directory
STATUS_FILE="${BACKUP_DIR}/backup.status"
echo "STARTED" > "$STATUS_FILE"

CONFIG_BACKUP_DIR="${BACKUP_DIR}/config"
# Create config backup directory
if [ "$MOVED_EXISTING" = false ]; then
    mkdir -p "$CONFIG_BACKUP_DIR"
fi



# Copy configuration files
print_progress "Copying configuration files..."
if [ -d "/etc/immich" ]; then
    # Copy .yml files
    find "/etc/immich" -name "*.yml" -type f -exec cp {} "$CONFIG_BACKUP_DIR/" \; 2>/dev/null
    
    # Copy .env file
    if [ -f "/etc/immich/.env" ]; then
        cp "/etc/immich/.env" "$CONFIG_BACKUP_DIR/"
    fi
    
    # Copy immich.json
    if [ -f "/etc/immich/immich.json" ]; then
        cp "/etc/immich/immich.json" "$CONFIG_BACKUP_DIR/"
    fi
    
    # Check if any files were copied
    if [ ! "$(ls -A "$CONFIG_BACKUP_DIR")" ]; then
        echo "Warning: No configuration files found to backup"
        rmdir "$CONFIG_BACKUP_DIR"
    fi
else
    echo "Warning: Configuration directory /etc/immich not found"
    rmdir "$CONFIG_BACKUP_DIR"
fi

# Create database backup
DB_BACKUP_FILE="${BACKUP_DIR}/database_backup.sql.gz"
print_progress "Taking database backup..." 
if ! docker compose -f /etc/immich/docker-compose.yml exec -T database pg_dumpall --clean --if-exists --username=postgres | gzip > "$DB_BACKUP_FILE"; then
    echo "FAILED" > "$STATUS_FILE"
    echo "{\"Status\": \"Error: Database backup failed\"}"
    exit 1
fi

# Copy UPLOAD_LOCATION contents excluding postgres directory
if [ -d "$UPLOAD_LOCATION" ]; then
    RSYNC_EXCLUDE=""
    if [ -d "${UPLOAD_LOCATION}/postgres" ]; then
        RSYNC_EXCLUDE="--exclude=postgres"
    fi
    
    UPLOADS_BACKUP_DIR="${BACKUP_PATH}/homecloud-backups/immich_backups/upload"
    mkdir -p "$UPLOADS_BACKUP_DIR"
    
    # Check space requirements before starting backup
    print_progress "Checking space requirements..."
    SPACE_NEEDED=$(rsync -rlt --dry-run --stats $RSYNC_EXCLUDE "$UPLOAD_LOCATION/" "$UPLOADS_BACKUP_DIR/" 2>/dev/null | grep "Total transferred file size:" | awk '{print $5}' | sed 's/,//g')
    
    if [ -z "$SPACE_NEEDED" ]; then
        # Fallback: get approximate size using du if rsync stats fail
        SPACE_NEEDED=$(du -sb "$UPLOAD_LOCATION" | awk '{print $1}')
    fi
    
    # Get available space on destination
    AVAILABLE_SPACE=$(df -B1 "$BACKUP_PATH" | tail -1 | awk '{print $4}')
    
    # Add 10% buffer to space needed
    SPACE_WITH_BUFFER=$((SPACE_NEEDED + SPACE_NEEDED / 10))
    
    if [ "$SPACE_WITH_BUFFER" -gt "$AVAILABLE_SPACE" ]; then
        echo "SKIPPED" > "$STATUS_FILE"
        SPACE_NEEDED_GB=$((SPACE_WITH_BUFFER / 1024 / 1024 / 1024))
        AVAILABLE_GB=$((AVAILABLE_SPACE / 1024 / 1024 / 1024))
        echo "{\"Status\": \"Error\", \"Message\": \"Backup skipped due to insufficient disk space. Need ${SPACE_NEEDED_GB}GB but only ${AVAILABLE_GB}GB available\"}"
        exit 0
    fi
    
    FS_TYPE=$(get_fs_type "$BACKUP_PATH")

    print_progress "Copying media files (this may take several hours)..."
    if ! rsync -rlt --progress $RSYNC_EXCLUDE "$UPLOAD_LOCATION/" "$UPLOADS_BACKUP_DIR/" | while read line; do
        if [[ "$line" =~ [0-9]+% ]]; then
            print_progress "Media files: $line"
        fi
    done; then
        echo "FAILED" > "$STATUS_FILE"
        echo "{\"Status\": \"Error: Directory backup failed\"}"
        exit 1
    fi
else
    echo "{\"Status\": \"Error: UPLOAD_LOCATION directory does not exist\"}"
    rm -rf "$BACKUP_DIR"
    exit 1
fi

print_progress "Setting permissions..."
# Set basic read permissions on the backup directory
chmod -R +r "$BACKUP_DIR"

# Change ownership if filesystem supports it
FS_TYPE=$(get_fs_type "$BACKUP_PATH")
if supports_ownership "$FS_TYPE"; then
    print_progress "Changing ownership..."
    if ! chown -R "$USERNAME:$GROUPNAME" "$BACKUP_DIR"; then
        echo "{\"Status\": \"Error: Failed to change ownership to $USERNAME:$GROUPNAME\"}"
        exit 1
    fi
fi

print_progress "Backup completed successfully!"
echo "COMPLETED" > "$STATUS_FILE"

# Clean up old version directories with new backup type
BASE_BACKUP_DIR="${BACKUP_PATH}/homecloud-backups/immich_backups"
for other_version_dir in "$BASE_BACKUP_DIR"/*; do
    if [ -d "$other_version_dir" ] && [ "$other_version_dir" != "$VERSION_DIR" ] && [ "$(basename "$other_version_dir")" != "upload" ]; then
        for backup_dir in "$other_version_dir"/*; do
            if [ -d "$backup_dir" ] && [ "$(basename "$backup_dir")" != "upload" ]; then
                # Check if it's new backup type (no upload subdirectory)
                if [ ! -d "$backup_dir/upload" ]; then
                    print_progress "Removing old backup: $backup_dir"
                    rm -rf "$backup_dir"
                fi
            fi
        done
    fi
done

echo "{\"Status\": \"Success\", \"Message\": \"Backup completed successfully at $BACKUP_DIR\"}"
exit 0


