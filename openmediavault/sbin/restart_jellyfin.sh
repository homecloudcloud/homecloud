#!/bin/bash

# Function to get service status using omv-rpc
get_service_status() {
    local omv_response
    omv_response=$(omv-rpc -u admin 'Homecloud' 'getJellyfinServiceStatus')
    
    # Convert status to lowercase for consistency
    echo "$omv_response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4 | tr '[:upper:]' '[:lower:]'
}

# Function to get current timestamp in ISO 8601 format
get_timestamp() {
    date -u +"%Y-%m-%dT%H:%M:%SZ"
}

# Function to output JSON status
output_status() {
    local service_status="$1"
    local timestamp="$2"
    local startup_complete

    # Set startup_complete based on status
    if [ "$service_status" = "running" ]; then
        startup_complete="true"
    else
        startup_complete="false"
    fi
    
    echo "{"
    echo "    \"service\": \"jellyfin\","
    echo "    \"status\": \"$service_status\","
    echo "    \"startup_complete\": $startup_complete,"
    echo "    \"timestamp\": \"$timestamp\""
    echo "}"
}

# Main execution

# Get initial timestamp
timestamp=$(get_timestamp)

# Restart the service
systemctl restart jellyfin.service
sleep 5  # Brief pause to allow service to begin startup

# Get service status using omv-rpc
service_status=$(get_service_status)

# Output the status
output_status "$service_status" "$timestamp"

# Exit with appropriate status code
if [ "$service_status" = "Running" ] || [ "$service_status" = "starting" ]; then
    exit 0
else
    exit 1
fi

