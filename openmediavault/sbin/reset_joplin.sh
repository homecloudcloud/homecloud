#!/bin/bash

# Set default DB_DATA_LOCATION
DB_DATA_LOCATION="/var/lib/joplin/postgres"

# Check if docker-compose.yml exists
if [ -f "/etc/joplin/docker-compose.yml" ]; then
    # Extract DB_DATA_LOCATION from docker-compose.yml
    VOLUME_LINE=$(grep -A 1 "volumes:" /etc/joplin/docker-compose.yml | tail -1)
    if [ -n "$VOLUME_LINE" ]; then
        DB_DATA_LOCATION=$(echo "$VOLUME_LINE" | awk -F':' '{print $1}' | tr -d ' -')
    fi
fi

# Stop joplin service
systemctl stop joplin.service 2>/dev/null || true

# Check if DB_DATA_LOCATION exists and remove contents
if [ -d "$DB_DATA_LOCATION" ]; then
    # Remove contents but keep directory
    rm -rf "$DB_DATA_LOCATION"/* "$DB_DATA_LOCATION"/.[!.]* 2>/dev/null || true
    echo "Removed contents of $DB_DATA_LOCATION"
fi

systemctl restart joplin.service 2>/dev/null || true

echo "Joplin reset completed. All users and their dataa removed."
exit 0