#!/bin/bash

# Function to get device model
get_model() {
    local device="$1"
    fdisk -l "$device" 2>/dev/null | grep "Disk model:" | sed 's/Disk model: //'
}

# Function to get parent device
get_parent() {
    local device="$1"
    lsblk -no pkname "/dev/$device" 2>/dev/null
}

# Function to get UUID
get_uuid() {
    local device="$1"
    lsblk -no UUID "/dev/$device" 2>/dev/null
}

# Function to get size in GB as integer
get_size() {
    local device="$1"
    # Get size in bytes
    local size_bytes=$(lsblk -b -no SIZE "/dev/$device" 2>/dev/null)
    # Convert to GB and round to integer
    if [ -n "$size_bytes" ]; then
        echo $((size_bytes / 1024 / 1024 / 1024))
    else
        echo "0"
    fi
}

# Function to get available space in GB as integer
get_avail() {
    local device="$1"
    # Get available space in bytes
    local avail_bytes=$(df -B1 "/dev/$device" 2>/dev/null | awk 'NR==2 {print $4}')
    # Convert to GB and round to integer
    if [ -n "$avail_bytes" ]; then
        echo $((avail_bytes / 1024 / 1024 / 1024))
    else
        echo "0"
    fi
}


# Function to get mount point
get_mount_point() {
    local device="$1"
    lsblk -no MOUNTPOINT "/dev/$device" 2>/dev/null
}

# Function to get filesystem type
get_fs_type() {
    local device="$1"
    lsblk -no FSTYPE "/dev/$device" 2>/dev/null
}

# Function to check if device is mounted
is_mounted() {
    local device="$1"
    mount | grep -q "^/dev/$device "
    return $?
}

# Initialize arrays for storing results
declare -a json_entries

# Get all sd* devices
devices=$(ls -1 /dev/sd* 2>/dev/null | grep -v "[0-9]$" || true)

# Counter for valid entries
count=0

# Process each device
for device in $devices; do
    base_device=$(basename "$device")
    
    # Get model number
    model=$(get_model "$device" | tr -d ' ')
    
    # Process partitions for this device
    partitions=$(ls -1 "${device}"[0-9]* 2>/dev/null || true)
    
    for partition in $partitions; do
        part_name=$(basename "$partition")
        
        # Check if partition is mounted
        if is_mounted "$part_name"; then
            # Get UUID
            uuid=$(get_uuid "$part_name")
            
            if [ -n "$uuid" ]; then
                # Get size, available space, mount point, and filesystem type
                size=$(get_size "$part_name")
                avail=$(get_avail "$part_name")
                mount_point=$(get_mount_point "$part_name")
                fs_type=$(get_fs_type "$part_name")
                
                if [ -n "$size" ] && [ -n "$avail" ] && [ -n "$mount_point" ]; then
                    # Create JSON entry
                    json_entry="    {
      \"name\": \"${model}-dev-disk-by-uuid-${uuid}\",
      \"capacity\": ${size},
      \"available\": ${avail},
      \"mount_path\": \"${mount_point}\",
      \"filesystem\": \"${fs_type}\"
    }"
                    
                    # Add to array
                    json_entries+=("$json_entry")
                    ((count++))
                fi
            fi
        fi
    done
done

# Output JSON
echo "{"
echo "  \"total\": $count,"
echo "  \"data\": ["

# Join array elements with commas
for ((i=0; i<${#json_entries[@]}; i++)); do
    echo "${json_entries[i]}"
    if [ $i -lt $((${#json_entries[@]}-1)) ]; then
        echo "    ,"
    fi
done

echo "  ]"
echo "}"
