#!/bin/bash

# Lock file for preventing concurrent backups
LOCK_FILE="/tmp/joplin_backup.lock"
LOCK_PID_FILE="/tmp/joplin_backup.pid"

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
                echo "{\"Status\": \"Success\", \"Message\": \"Another Joplin backup process is already running. Please wait for it to complete.\"}"
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

# Function to read UPLOAD_LOCATION from .env file

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

# Function to get Joplin version from docker-compose.yml file
get_joplin_version() {
    local compose_file="/etc/joplin/docker-compose.yml"
    
    if [ ! -f "$compose_file" ]; then
        echo "{\"Status\": \"Error: Environment file not found at $compose_file\"}"
        exit 1
    fi
    
    # Extract version from the image tag in docker-compose.yml
    # Looking specifically for joplin/server and capturing the version after it
    local version=$(grep -A1 "image: joplin/server:" "$compose_file" | head -n1 | sed 's/.*joplin\/server:\([^"]*\).*/\1/')
    
    if [ -z "$version" ]; then
        echo "{\"Status\": \"Error: Could not find Joplin version in $compose_file\"}"
        exit 1
    fi
    
    echo "$version"
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

# Get current timestamp in format: YYYY-MM-DD_HH-MM-SS
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M")
VERSION=$(get_joplin_version)
# Create backup directory with timestamp
BACKUP_DIR="${BACKUP_PATH}/homecloud-backups/joplin_backups/${VERSION}/${TIMESTAMP}"
mkdir -p "$BACKUP_DIR"

# Create config backup directory
CONFIG_BACKUP_DIR="${BACKUP_DIR}/config"
mkdir -p "$CONFIG_BACKUP_DIR"

# Copy configuration files
echo "Copying configuration files..."
if [ -d "/etc/joplin" ]; then
    # Copy .yml files
    find "/etc/joplin" -name "*.yml" -type f -exec cp {} "$CONFIG_BACKUP_DIR/" \; 2>/dev/null
    
    # Copy .env file
    if [ -f "/etc/joplin/.env" ]; then
        cp "/etc/joplin/.env" "$CONFIG_BACKUP_DIR/"
    fi
    
    # Check if any files were copied
    if [ ! "$(ls -A "$CONFIG_BACKUP_DIR")" ]; then
        echo "Warning: No configuration files found to backup"
        rmdir "$CONFIG_BACKUP_DIR"
    fi
else
    echo "Warning: Configuration directory /etc/joplin not found"
    rmdir "$CONFIG_BACKUP_DIR"
fi

# Create database backup
DB_BACKUP_FILE="${BACKUP_DIR}/database_backup.sql.gz"
echo "Taking DB backup..." 
if ! docker compose -f /etc/joplin/docker-compose.yml exec -T db pg_dumpall --clean --if-exists --username=joplin | gzip > "$DB_BACKUP_FILE"; then
    echo "{\"Status\": \"Error: Database backup failed\"}"
    rm -rf "$BACKUP_DIR"
    exit 1
fi


# Set basic read permissions on the backup directory
chmod -R +r "$BACKUP_DIR"

# Change ownership if filesystem supports it
FS_TYPE=$(get_fs_type "$BACKUP_PATH")
if supports_ownership "$FS_TYPE"; then
    if ! chown -R "$USERNAME:$GROUPNAME" "$BACKUP_DIR"; then
        echo "{\"Status\": \"Error: Failed to change ownership to $USERNAME:$GROUPNAME\"}"
        exit 1
    fi
fi

echo "{\"Status\": \"Success\"}"
exit 0
