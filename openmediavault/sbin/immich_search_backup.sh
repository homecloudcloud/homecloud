#!/bin/bash

# Function to convert timestamp from directory name to desired format
format_timestamp() {
    local timestamp="$1"
    # Input format: YYYY-MM-DD_HH-MM-SS
    # Output format: HH:MM DD-MM-YYYY
    
    # Extract components
    local year=$(echo "$timestamp" | cut -d'_' -f1 | cut -d'-' -f1)
    local month=$(echo "$timestamp" | cut -d'_' -f1 | cut -d'-' -f2)
    local day=$(echo "$timestamp" | cut -d'_' -f1 | cut -d'-' -f3)
    local hour=$(echo "$timestamp" | cut -d'_' -f2 | cut -d'-' -f1)
    local minute=$(echo "$timestamp" | cut -d'_' -f2 | cut -d'-' -f2)
    
    # Format output
    printf "%s:%s %s-%s-%s" "$hour" "$minute" "$day" "$month" "$year"
}

# Function to validate and process directory path
process_directory() {
    local dir="$1"
    local first_entry="$2"
    
    # Check if directory exists
    if [ ! -d "$dir" ]; then
        return
    fi
    
    # Search for immich_backup_* directories in the top level
    while IFS= read -r backup_dir; do
        # Extract timestamp from directory name
        raw_timestamp="${backup_dir##*/immich_backup_}"
        
        # Format the timestamp
        formatted_timestamp=$(format_timestamp "$raw_timestamp")
        
        # Format the JSON entry
        if [ "$first_entry" = "true" ]; then
            printf '  "%s": "%s"' "$backup_dir" "$formatted_timestamp"
            first_entry="false"
        else
            printf ',\n  "%s": "%s"' "$backup_dir" "$formatted_timestamp"
        fi
    done < <(find "$dir" -maxdepth 1 -type d -name "immich_backup_*" | sort)
}

# Check if arguments are provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <directory1> [directory2] ... [directory16]"
    echo "Searches for immich_backup_* directories in the specified paths"
    exit 1
fi

# Check if number of arguments exceeds 16
if [ $# -gt 16 ]; then
    echo "Error: Maximum 16 directories allowed. Provided: $#"
    exit 1
fi

# Start JSON output
echo "{"

first_entry=true
found_backups=false

# Process each directory
for dir in "$@"; do
    output=$(process_directory "$dir" "$first_entry")
    if [ -n "$output" ]; then
        echo "$output"
        first_entry=false
        found_backups=true
    fi
done

# Close JSON structure
echo
echo "}"

