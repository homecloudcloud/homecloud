#!/bin/bash

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
# Create backup directory with timestamp
BACKUP_DIR="${BACKUP_PATH}/homecloud-backups/immich_backups/${VERSION}/${TIMESTAMP}"
mkdir -p "$BACKUP_DIR"

# Create config backup directory
CONFIG_BACKUP_DIR="${BACKUP_DIR}/config"
mkdir -p "$CONFIG_BACKUP_DIR"

# Copy configuration files
echo "Copying configuration files..."
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
echo "Taking DB backup..." 
if ! docker compose -f /etc/immich/docker-compose.yml exec -T database pg_dumpall --clean --if-exists --username=postgres | gzip > "$DB_BACKUP_FILE"; then
    echo "{\"Status\": \"Error: Database backup failed\"}"
    rm -rf "$BACKUP_DIR"
    exit 1
fi

# Copy UPLOAD_LOCATION contents excluding postgres directory
if [ -d "$UPLOAD_LOCATION" ]; then
    RSYNC_EXCLUDE=""
    if [ -d "${UPLOAD_LOCATION}/postgres" ]; then
        RSYNC_EXCLUDE="--exclude=postgres"
    fi
    
    UPLOADS_BACKUP_DIR="${BACKUP_DIR}/upload"
    mkdir -p "$UPLOADS_BACKUP_DIR"
    
    FS_TYPE=$(get_fs_type "$BACKUP_PATH")

    echo "Copying media files..." 
    if ! rsync -rlt $RSYNC_EXCLUDE "$UPLOAD_LOCATION/" "$UPLOADS_BACKUP_DIR/"; then
        echo "{\"Status\": \"Error: Directory backup failed\"}"
        rm -rf "$BACKUP_DIR"
        exit 1
    fi
else
    echo "{\"Status\": \"Error: UPLOAD_LOCATION directory does not exist\"}"
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


