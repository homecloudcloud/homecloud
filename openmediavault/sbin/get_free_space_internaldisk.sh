#!/bin/bash

VG_NAME="DATA_VOL"

get_fs_free_space() {
    # First find the mount point for the volume group
    mount_point=$(lvs --noheadings -o vg_name,lv_path "$VG_NAME" 2>/dev/null | \
                 while read vg lv_path; do
                     findmnt -n -o TARGET "$lv_path" 2>/dev/null
                 done | head -n1)

    if [ -z "$mount_point" ]; then
        # Return JSON with error status
        printf '{"status": "error", "message": "Mount point not found for volume group %s", "free_space": 0}\n' "$VG_NAME"
        exit 1
    fi

    # Get free space in bytes and convert to GB with 3 decimal places
    free_space=$(df -B1 "$mount_point" 2>/dev/null | awk 'NR==2 {printf "%.3f", $4/1024/1024/1024}')

    if [ $? -ne 0 ]; then
        # Return JSON with error status
        printf '{"status": "error", "message": "Failed to get free space for %s", "free_space": 0}\n' "$mount_point"
        exit 1
    fi

    # Return JSON with success status
    printf '{"status": "success", "mount_point": "%s", "free_space": %s}\n' "$mount_point" "$free_space"
}

# Call the function
get_fs_free_space

