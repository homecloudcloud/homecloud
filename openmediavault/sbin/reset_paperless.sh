#!/bin/bash

# Function to check if service exists and stop it
stop_service() {
    if systemctl list-unit-files paperless.service &>/dev/null; then
        echo "Stopping paperless service..."
        systemctl stop paperless.service
        if [ $? -ne 0 ]; then
            echo "{\"message\": \"Error stopping paperless service\"}"
            exit 1
        fi
    fi
}

# Function to extract volume paths from docker-compose.yml
get_volume_paths() {
    local compose_file="/etc/paperless/docker-compose.yml"
    local volumes=()
    
    # Check if docker-compose file exists
    if [ ! -f "$compose_file" ]; then
        echo "{\"message\": \"App not deployed - docker-compose.yml not found\"}"
        exit 1
    fi

    # Extract volume paths for db service
    while IFS= read -r line; do
        # Extract path before the colon, trim whitespace and leading dash
        local path=$(echo "$line" | sed -n 's/.*- \([^:]*\):.*/\1/p' | sed 's/^[ \t]*//;s/[ \t]*$//')
        if [ ! -z "$path" ]; then
            volumes+=("$path")
        fi
    done < <(grep -A 10 "volumes:" "$compose_file" | grep "^[[:space:]]*-")

    echo "${volumes[@]}"
}

# Main execution
echo "Starting Paperless reset process..."

# Stop the service
stop_service

# Get volume paths
VOLUMES=($(get_volume_paths))

if [ ${#VOLUMES[@]} -eq 0 ]; then
    echo "{\"message\": \"No volumes found to remove\"}"
    exit 1
fi

# Remove volumes
for volume in "${VOLUMES[@]}"; do
    if [ -d "$volume" ]; then
        echo "Removing volume: $volume"
        rm -rf "$volume"/*
        if [ $? -ne 0 ]; then
            echo "{\"message\": \"Error removing volume: $volume\"}"
            exit 1
        fi
    fi
done

# Start the service
echo "Starting paperless service..."
systemctl start paperless.service
if [ $? -ne 0 ]; then
    echo "{\"message\": \"Error starting paperless service\"}"
    exit 1
fi

# Success message
echo "{\"message\": \"Paperless reset completed successfully\"}"
exit 0
