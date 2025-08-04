#!/bin/bash

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
get_jellyfin_version() {
    local compose_file="/etc/jellyfin/docker-compose.yml"
    
    if [ ! -f "$compose_file" ]; then
        echo "{\"Status\": \"Error: Environment file not found at $compose_file\"}"
        exit 1
    fi
    
    # Extract version from the image tag in docker-compose.yml
    local version=$(grep -A1 "image: jellyfin/jellyfin:" "$compose_file" | head -n1 | sed 's/.*jellyfin\/jellyfin:\([^"]*\).*/\1/')
    
    if [ -z "$version" ]; then
        echo "{\"Status\": \"Error: Could not find Jellyfin version in $compose_file\"}"
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
VERSION=$(get_jellyfin_version)
# Create backup directory with timestamp
BACKUP_DIR="${BACKUP_PATH}/homecloud-backups/jellyfin_backups/${VERSION}/${TIMESTAMP}"
mkdir -p "$BACKUP_DIR"

# Create config backup directory
CONFIG_BACKUP_DIR="${BACKUP_DIR}/config"
mkdir -p "$CONFIG_BACKUP_DIR"

# Copy configuration files
echo "Copying configuration files..."
if [ -d "/etc/jellyfin" ]; then
    # Copy .yml files
    find "/etc/jellyfin" -name "*.yml" -type f -exec cp {} "$CONFIG_BACKUP_DIR/" \; 2>/dev/null
    
    # Copy .env file
    if [ -f "/etc/jellyfin/.env" ]; then
        cp "/etc/jellyfin/.env" "$CONFIG_BACKUP_DIR/"
    fi
    
    # Check if any files were copied
    if [ ! "$(ls -A "$CONFIG_BACKUP_DIR")" ]; then
        echo "Warning: No configuration files found to backup"
        rmdir "$CONFIG_BACKUP_DIR"
    fi
else
    echo "Warning: Configuration directory /etc/jellyfin not found"
    rmdir "$CONFIG_BACKUP_DIR"
fi

# Create database backup
#DB_BACKUP_FILE="${BACKUP_DIR}/database_backup.sql.gz"
echo "Stopping Jellyfin and copying files" 
# use systemctl stop jellyfin.service to stop jellyfin. check if service is active then stop. ignore errors
if systemctl is-active --quiet jellyfin.service; then
    systemctl stop jellyfin.service
fi

# use tar to copy, compress all files and subdirectories at /var/lib/jellyfin folder to $BACKUP_DIR
# first check if /var/lib/jellyfin exists. exit if it does not with error printed
if [ ! -d "/var/lib/jellyfin" ]; then
    echo "{\"Status\": \"Error: Jellyfin data does not exist\"}"
    exit 1
fi

if ! tar -czf "${BACKUP_DIR}/jellyfin.tar.gz" -C /var/lib/jellyfin .; then
    echo "{\"Status\": \"Error: Failed to copy files\"}"
    exit 1
fi



# Set basic read permissions on the backup directory
chmod -R +r "$BACKUP_DIR"

# Change ownership if filesystem supports it
FS_TYPE=$(get_fs_type "$BACKUP_PATH")
if supports_ownership "$FS_TYPE"; then
    if ! chown -R "$USERNAME:$GROUPNAME" "$BACKUP_DIR"; then
        echo "{\"Status\": \"Error: Failed to change ownership to $USERNAME:$GROUPNAME\"}"
        systemctl start jellyfin.service
        exit 1
    fi
fi


echo "{\"Configuration backed up succesfully."}"
echo "{\"Jellyfin service restarted - it should be up in few minutes"}"

systemctl restart jellyfin.service
exit 0
