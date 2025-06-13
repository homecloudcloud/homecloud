#!/bin/bash

# Function to check if a service exists and is enabled
service_is_enabled() {
    systemctl is-enabled "$1" >/dev/null 2>&1
}

# Function to get service status
get_service_status() {
    systemctl is-active "$1" >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "running"
    else
        echo "stopped"
    fi
}

# Function to check if service is fully started
check_startup_complete() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        # Check if service is active
        if systemctl is-active "$service" >/dev/null 2>&1; then
            # Additional check for container readiness using docker-compose
            if [ -f "/etc/vault-warden/docker-compose-vaultwarden.yml" ]; then
                if docker compose -f /etc/vault-warden/docker-compose-vaultwarden.yml ps | grep -q "Up"; then
                    return 0
                fi
            else
                return 0
            fi
        fi
        
        sleep 1
        ((attempt++))
    done
    
    return 1
}

# Function to output JSON
output_json() {
    local status=$1
    local startup_complete=$2
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    cat << EOF
{
    "service": "vaultwarden",
    "status": "$status",
    "startup_complete": $startup_complete,
    "timestamp": "$timestamp"
}
EOF
}

# Main execution
SERVICE_NAME="vaultwarden"

# Check if service is enabled
if ! service_is_enabled "$SERVICE_NAME"; then
    output_json "disabled" false
    exit 0
fi

# Stop the service
systemctl stop "$SERVICE_NAME" >/dev/null 2>&1

# Start the service
systemctl start "$SERVICE_NAME" >/dev/null 2>&1
if [ $? -ne 0 ]; then
    output_json "failed" false
    exit 1
fi

# Check if service started successfully
if check_startup_complete "$SERVICE_NAME"; then
    status=$(get_service_status "$SERVICE_NAME")
    output_json "$status" true
else
    status=$(get_service_status "$SERVICE_NAME")
    output_json "$status" false
fi

exit 0

