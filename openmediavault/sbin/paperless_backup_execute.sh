#!/bin/bash

# Function to check if directory exists and is writable
check_directory() {
    local dir="$1"
    if [ ! -d "$dir" ]; then
        echo "Error: Directory $dir does not exist"
        exit 1
    fi
    if [ ! -w "$dir" ]; then
        echo "Error: Directory $dir is not writable"
        exit 1
    fi
}

# Function to check if user exists
check_user() {
    local username="$1"
    if ! id "$username" >/dev/null 2>&1; then
        echo "Error: User $username does not exist"
        exit 1
    fi
}

# Function to check if group exists
check_group() {
    local groupname="$1"
    if ! getent group "$groupname" >/dev/null 2>&1; then
        echo "Error: Group $groupname does not exist"
        exit 1
    fi
}

# Function to wait for service status
wait_for_service() {
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        local status
        status=$(omv-rpc -u admin 'Homecloud' 'getPaperlessServiceStatus')
        
        if echo "$status" | grep -q '"status":"Running"'; then
            return 0
        fi
        
        echo "Waiting for service to start (attempt $attempt/$max_attempts)..."
        sleep 10
        ((attempt++))
    done
    
    echo "Error: Service did not start within expected time"
    return 1
}

# Function to get current version from docker-compose.yml
get_current_version() {
    local compose_file="/etc/paperless/docker-compose.yml"
    local version
    
    version=$(grep -E "^\s*image:\s*ghcr.io/paperless-ngx/paperless-ngx:" "$compose_file" | sed -E 's/.*paperless-ngx:([^"'\'' ]*).*/\1/')
    
    if [ -z "$version" ]; then
        echo "Error: Could not determine version from $compose_file"
        return 1
    fi
    
    echo "$version"
}

# Parse command line arguments
if [ $# -ne 3 ]; then
    echo "Usage: $0 backup_path username groupname"
    exit 1
fi

backup_path="$1"
username="$2"
groupname="$3"

# Validate inputs
check_directory "$backup_path"
check_user "$username"
check_group "$groupname"

# Get current version
echo "Detecting Paperless-ngx version..."
current_version=$(get_current_version)
if [ $? -ne 0 ]; then
    exit 1
fi

echo "Detected Paperless-ngx version: $current_version"

# Create timestamp and backup directory
timestamp=$(date +"%Y-%m-%d_%H-%M")
backup_directory="${backup_path}/homecloud-backups/paperless-ngx_backups/${current_version}/${timestamp}"

echo "Creating backup directory: $backup_directory"
mkdir -p "$backup_directory"

if [ ! -d "$backup_directory" ]; then
    echo "Error: Failed to create backup directory"
    exit 1
fi

# Backup docker-compose.yml
docker_compose_file_path="/etc/paperless/docker-compose.yml.backup.${timestamp}"
cp /etc/paperless/docker-compose.yml "$docker_compose_file_path"
cp /etc/paperless/* "$backup_directory/"


# Update docker-compose.yml
echo "Updating docker-compose.yml with backup directory..."
sed -i "s|/var/lib/paperless/export:/usr/src/paperless/export|${backup_directory}:/usr/src/paperless/export|g" /etc/paperless/docker-compose.yml

# Restart service
echo "Restarting paperless service..."
systemctl restart paperless.service

# Wait for service to be running
if ! wait_for_service; then
    echo "Error: Service failed to start"
    # Restore original docker-compose.yml
    mv "$docker_compose_file_path" /etc/paperless/docker-compose.yml
    systemctl restart paperless.service
    exit 1
fi

# Start backup
echo "Starting backup process...it may take a while depending on data size."
if ! docker compose -f /etc/paperless/docker-compose.yml exec -T webserver document_exporter "/usr/src/paperless/export" -z ; then
    echo "Error: Backup failed"
    # Restore original docker-compose.yml
    mv "$docker_compose_file_path" /etc/paperless/docker-compose.yml
    systemctl restart paperless.service
    exit 1
fi

# Change ownership
echo "Setting ownership of backup files..."
if ! chown -R "$username:$groupname" "$backup_directory" 2>/dev/null; then
    echo "Warning: Failed to change ownership. This might be normal for certain filesystems (e.g., vfat)"
fi

# Restore original docker-compose.yml
echo "Restoring original configuration..."
mv "$docker_compose_file_path" /etc/paperless/docker-compose.yml

# Restart service
echo "Restarting paperless service..."
systemctl restart paperless.service

# Wait for service to be running again
if ! wait_for_service; then
    echo "Error: Service failed to start after restore"
    exit 1
fi

echo "Paperless backup completed successfully!"
echo "Backup location: $backup_directory"

