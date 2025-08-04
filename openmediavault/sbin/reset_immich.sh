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

# Check if .env file exists
if [ ! -f "/etc/immich/.env" ]; then
    output_result "Error: /etc/immich/.env file not found" 1
fi

# Stop immich service
if ! systemctl stop immich.service; then
    output_result "Error: Failed to stop immich service" 1
    exit 1
fi

# Read DB_DATA_LOCATION and UPLOAD_LOCATION from .env file
DB_DATA_LOCATION=$(grep "^DB_DATA_LOCATION=" /etc/immich/.env | cut -d '=' -f2)
UPLOAD_LOCATION=$(grep "^UPLOAD_LOCATION=" /etc/immich/.env | cut -d '=' -f2)

# Check if DB_DATA_LOCATION was found and not empty
if [ -z "$DB_DATA_LOCATION" ]; then
    # Start immich service again before exiting
    systemctl start immich.service
    output_result "Error: DB_DATA_LOCATION not found in .env file" 1
    exit 1
fi

# Check if UPLOAD_LOCATION was found and not empty
if [ -z "$UPLOAD_LOCATION" ]; then
    # Start immich service again before exiting
    systemctl start immich.service
    output_result "Error: UPLOAD_LOCATION not found in .env file" 1
    exit 1
fi

# Remove quotes if present in the paths
DB_DATA_LOCATION=$(echo "$DB_DATA_LOCATION" | tr -d '"'"'")
UPLOAD_LOCATION=$(echo "$UPLOAD_LOCATION" | tr -d '"'"'")

# Check if the DB directory exists
if [ ! -e "$DB_DATA_LOCATION" ]; then
    # Start immich service again before exiting
    systemctl start immich.service
    output_result "Error: Directory $DB_DATA_LOCATION does not exist" 1
    exit 1
fi

# Check if the UPLOAD directory exists
if [ ! -e "$UPLOAD_LOCATION" ]; then
    # Start immich service again before exiting
    systemctl start immich.service
    output_result "Error: Directory $UPLOAD_LOCATION does not exist" 1
    exit 1
fi


# Clean the UPLOAD directory (delete contents but keep the directory)
if ! rm -rf "$UPLOAD_LOCATION"/*; then
    # Start immich service again before exiting
    systemctl start immich.service
    output_result "Error: Failed to clean contents of $UPLOAD_LOCATION" 1
    exit 1
fi

# Start immich service
if ! systemctl start immich.service; then
    output_result "Error: Failed to start immich service" 1
    exit 1
fi

# If we got here, everything succeeded
output_result "Successfully deleted database and cleaned upload directory"
exit 0
