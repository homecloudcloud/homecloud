#!/bin/bash

# Function to get service status
get_status() {
    local status
    if systemctl is-active --quiet immich.service; then
        status="running"
    else
        status="stopped"
    fi
    echo $status
}

# Function to output JSON
output_json() {
    local status=$1
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    echo "{"
    echo "    \"service\": \"immich\","
    echo "    \"status\": \"$status\","
    echo "    \"startup_complete\": true,"
    echo "    \"timestamp\": \"$timestamp\""
    echo "}"
}

# Function to wait for startup message
wait_for_startup() {
    local timeout=120  # timeout in seconds
    local start_time=$(date +%s)

    
    while true; do
        if journalctl -u immich.service -n 50 --no-pager | grep -q "Application startup complete"; then
            return 0
        fi

        current_time=$(date +%s)
        elapsed=$((current_time - start_time))
        
        if [ $elapsed -ge $timeout ]; then
            echo "Timeout waiting for startup completion"
            return 1
        fi
        
        sleep 2
    done
}

# Main execution

# Restart the service
systemctl restart immich.service

# Wait for service to be active
sleep 5

# Get initial status
current_status=$(get_status)

if [ "$current_status" != "running" ]; then
    output_json "failed"
    exit 1
fi

# Wait for startup completion message
if wait_for_startup; then
    output_json "running"
    exit 0
else
    output_json "incomplete_startup"
    exit 1
fi

