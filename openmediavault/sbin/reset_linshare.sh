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
if service_exists "linshare.service"; then
    systemctl stop linshare.service 2>/dev/null || true
fi

# Empty /var/lib/urbackup/ directory contents
if [ -d "/var/lib/linshare" ]; then
    rm -rf /var/lib/linshare/* 2>/dev/null
    rm -rf /var/lib/linshare/.* 2>/dev/null || true
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
if service_exists "linshare.service"; then
    systemctl disable linshare.service 2>/dev/null || true
    rm -f /etc/systemd/system/linshare.service 2>/dev/null || true
    systemctl daemon-reload 2>/dev/null || true
fi

if [ -d "/etc/linshare" ]; then
    rm -rf "/etc/linshare" 2>/dev/null
    if [ $? -ne 0 ]; then
        output_json "Failed to remove /etc/linshare directory"
        exit 1
    fi
fi

# Success
output_json "Successfully reset Linshare"
exit 0

