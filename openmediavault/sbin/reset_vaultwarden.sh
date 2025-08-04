#!/bin/bash

# Function to output JSON messages
output_json() {
    local message=$1
    echo "{\"message\": \"$message\"}"
}

# Function to check if a service exists
service_exists() {
    systemctl list-unit-files | grep -q "^$1"
}

# Array to store volume paths
declare -a volumes

# Check if docker-compose file exists
if [ ! -f "/etc/vault-warden/docker-compose-vaultwarden.yml" ]; then
    output_json "Vaultwarden not deployed."
    exit 0
fi

# Try to parse volumes from docker-compose file
while IFS= read -r line; do
    # Look for volume mappings (lines containing :)
    if [[ $line =~ ^[[:space:]]*-[[:space:]]*(.*):.*$ ]]; then
        # Extract the host path (part before :)
        host_path="${BASH_REMATCH[1]}"
        # Remove leading/trailing whitespace
        host_path=$(echo "$host_path" | xargs)
        # Add to volumes array if path exists
        if [ -d "$host_path" ]; then
            volumes+=("$host_path")
        fi
    fi
done < <(sed -n '/volumes:/,/^[^ ]/p' "/etc/vault-warden/docker-compose-vaultwarden.yml")

# Check if we found any volumes
if [ ${#volumes[@]} -eq 0 ]; then
    output_json "No valid volumes found in docker-compose file"
    exit 1
fi

# Stop service if it exists
if service_exists "vaultwarden.service"; then
    systemctl stop vaultwarden.service 2>/dev/null || true
fi

# Remove volume directories completely
for volume in "${volumes[@]}"; do
    if [ -d "$volume" ]; then
        rm -rf "${volume:?}" 2>/dev/null
        if [ $? -ne 0 ]; then
            output_json "Failed to remove volume directory $volume"
            exit 1
        fi
    fi
done

# Disable and remove service if it exists
if service_exists "vaultwarden.service"; then
    systemctl disable vaultwarden.service 2>/dev/null
    rm -f /etc/systemd/system/vaultwarden.service 2>/dev/null
    systemctl daemon-reload 2>/dev/null
    
    if [ $? -ne 0 ]; then
        output_json "Failed to remove vaultwarden service"
        exit 1
    fi
fi

# Remove /etc/vault-warden directory
if [ -d "/etc/vault-warden" ]; then
    rm -rf "/etc/vault-warden" 2>/dev/null
    if [ $? -ne 0 ]; then
        output_json "Failed to remove /etc/vault-warden directory"
        exit 1
    fi
fi

# Success
output_json "Successfully reset Vaultwarden"
exit 0

