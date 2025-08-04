#!/bin/bash

# Function to return result in JSON format
output_result() {
    local message="$1"
    echo "{\"result\": \"$message\"}"
    exit ${2:-0}
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    output_result "Error: Please run as root" 1
fi

# Stop jellyfin service
if ! systemctl stop jellyfin.service; then
    output_result "Error: Failed to stop Jellyfin service" 1
    exit 1
fi

# Read DB_DATA_LOCATION and UPLOAD_LOCATION from .env file
DB_DATA_LOCATION="/var/lib/jellyfin"


# Check if DB_DATA_LOCATION was found and not empty
if [ -z "$DB_DATA_LOCATION" ]; then
    # Start jellyfin service again before exiting
    output_result "Error: DB_DATA_LOCATION not found" 1
    exit 1
fi


# Remove quotes if present in the paths
DB_DATA_LOCATION=$(echo "$DB_DATA_LOCATION" | tr -d '"'"'")


# Check if the DB directory exists
if [ ! -e "$DB_DATA_LOCATION" ]; then
    # Start jellyfin service again before exiting
    output_result "Error: Directory $DB_DATA_LOCATION does not exist" 1
    exit 1
fi


# Clean the UPLOAD directory (delete contents but keep the directory)
if ! rm -rf "$DB_DATA_LOCATION"/*; then
    # Start jellyfin service again before exiting
    output_result "Error: Failed to clean contents of $DB_DATA_LOCATION" 1
    exit 1
fi

# Start jellyfin service
systemctl restart jellyfin.service
sleep 5
systemctl restart jellyfin.service

# If we got here, everything succeeded
output_result "Successfully reset Jellyfin"
exit 0
