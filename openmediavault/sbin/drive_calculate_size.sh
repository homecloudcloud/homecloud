#!/bin/bash

# Function to convert bytes to GB with 2 decimal places using awk
bytes_to_gb() {
    local bytes=$1
    # Convert bytes to GB with 2 decimal places using awk
    awk "BEGIN {printf \"%.2f\", $bytes/1024/1024/1024}"
}

# Function to get directory size in bytes
get_directory_size() {
    local dir="$1"
    if [ ! -d "$dir" ]; then
        echo "0"
        return 1
    fi
    
    # Use du to get total size in bytes
    # -b for bytes
    # -s for summary (don't show subdirectories)
    local size=$(du -sb "$dir" 2>/dev/null | cut -f1)
    
    # If du failed, return 0
    if [ $? -ne 0 ]; then
        echo "0"
        return 1
    fi
    
    echo "$size"
}

# Main execution
drive_dir="/home/"

# Get size in bytes
total_bytes=$(get_directory_size "$drive_dir")

if [ "$total_bytes" = "0" ]; then
    # If directory doesn't exist or can't be read
    echo "{\"total_gb\": 0.00}"
    exit 1
fi

# Convert to GB
total_gb=$(bytes_to_gb "$total_bytes")

# Output JSON format
echo "{\"total_gb\": $total_gb}"

