#!/bin/bash

# Static default paths
DEFAULT_UPLOAD_DIR="/var/lib/immich/upload"
DEFAULT_DB_DATA_DIR="/var/lib/immich/postgres"

# Function to read variable from .env file
get_env_var() {
    var_name=$1
    env_file="/etc/immich/.env"
    
    if [ ! -f "$env_file" ]; then
        # Return empty string to trigger use of default values
        echo ""
        return 0
    fi
    
    # Read the variable value, remove quotes if present
    value=$(grep "^${var_name}=" "$env_file" | cut -d '=' -f2- | sed 's/^"\(.*\)"$/\1/')
    echo "$value"
}

# Function to get directory size in bytes
get_dir_size() {
    dir=$1
    if [ -d "$dir" ]; then
        # Use du with dereference option to follow symlinks
        du -sLb "$dir" 2>/dev/null | awk '{print $1}'
    else
        echo "0"
    fi
}

# Function to check if path2 is subdirectory of path1
is_subdirectory() {
    path1=$(realpath -e "$1" 2>/dev/null)
    path2=$(realpath -e "$2" 2>/dev/null)
    
    if [ -z "$path1" ] || [ -z "$path2" ]; then
        return 1
    fi
    
    case "$path2" in
        "$path1"/*) return 0 ;;
        *) return 1 ;;
    esac
}

# Function to convert bytes to GB with 2 decimal places
bytes_to_gb() {
    bytes=$1
    if [ $bytes -eq 0 ]; then
        echo "0.00"
        return 0
    fi
    
    # Convert to GB (integer division)
    gb_whole=$((bytes / 1073741824))
    # Get decimal part (2 places)
    remainder=$((bytes % 1073741824))
    decimal=$(((remainder * 100) / 1073741824))
    
    # Format with leading zero if needed
    if [ $decimal -lt 10 ]; then
        echo "$gb_whole.0$decimal"
    else
        echo "$gb_whole.$decimal"
    fi
}

# Read directory paths from environment file or use defaults
upload_dir=$(get_env_var "UPLOAD_LOCATION")
db_data_dir=$(get_env_var "DB_DATA_LOCATION")

# Use default values if env vars are empty
if [ -z "$upload_dir" ]; then
    upload_dir="$DEFAULT_UPLOAD_DIR"
fi

if [ -z "$db_data_dir" ]; then
    db_data_dir="$DEFAULT_DB_DATA_DIR"
fi

# Get sizes
upload_size=$(get_dir_size "$upload_dir")
db_data_size=$(get_dir_size "$db_data_dir")

# Calculate total size
if is_subdirectory "$upload_dir" "$db_data_dir"; then
    total_size=$upload_size
else
    total_size=$((upload_size + db_data_size))
fi

# Convert to GB with 2 decimal places
total_gb=$(bytes_to_gb $total_size)

# Output JSON
echo "{\"total_gb\": $total_gb}"

