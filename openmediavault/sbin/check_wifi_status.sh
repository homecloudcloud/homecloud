#!/bin/bash

# Function to check wifi status and return JSON
check_wifi_status() {
    # Try to get SSID using iwgetid
    WIFI_INFO=$(iwgetid -r 2>/dev/null)
    
    # Check if we got an SSID
    if [ -n "$WIFI_INFO" ]; then
        # Connected - return SSID and status
        echo "{\"status\":\"Connected\",\"SSID\":\"$WIFI_INFO\"}"
    else
        # Not connected - return empty SSID
        echo "{\"status\":\"Not Connected\",\"SSID\":\"\"}"
    fi
}

# Call the function
check_wifi_status
