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

# Stop service if it exists
if service_exists "juicefs.service"; then
    systemctl stop juicefs.service 2>/dev/null || true
fi

# Empty /var/lib/urbackup/ directory contents
if [ -d "/var/lib/juicefs" ]; then
    rm -rf /var/lib/juicefs/* 2>/dev/null
    rm -rf /var/lib/juicefs/.* 2>/dev/null || true
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
if service_exists "juicefs.service"; then
    systemctl disable juicefs.service 2>/dev/null || true
    rm -f /etc/systemd/system/juicefs.service 2>/dev/null || true
    systemctl daemon-reload 2>/dev/null || true
fi

if [ -d "/etc/juicefs" ]; then
    rm -rf "/etc/juicefs" 2>/dev/null
    if [ $? -ne 0 ]; then
        output_json "Failed to remove /etc/juicefs directory"
        exit 1
    fi
fi

# Success
output_json "Successfully reset JuiceFS"
exit 0

