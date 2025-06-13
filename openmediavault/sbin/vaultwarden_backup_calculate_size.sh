#!/usr/bin/env python3

import os
import json
from pathlib import Path

def get_directory_size(directory):
    total_size = 0
    try:
        for dirpath, dirnames, filenames in os.walk(directory):
            # Skip the backup subdirectory
            if 'backup' in dirnames:
                dirnames.remove('backup')
            
            # Calculate size for all files in current directory
            for filename in filenames:
                file_path = os.path.join(dirpath, filename)
                # Skip if it's a symbolic link
                if not os.path.islink(file_path):
                    total_size += os.path.getsize(file_path)
    except (OSError, PermissionError):
        return 0
    
    return total_size

def calculate_total_gb():
    directory = "/var/lib/vwdata"
    
    # Check if directory exists
    if not os.path.exists(directory):
        return {"total_gb": 0}
    
    # Get total size in bytes
    total_bytes = get_directory_size(directory)
    
    # Convert to GB (using 1GB = 1024^3 bytes)
    total_gb = round(total_bytes / (1024 ** 3), 2)
    
    return {"total_gb": total_gb}

# Execute and print result
if __name__ == "__main__":
    result = calculate_total_gb()
    print(json.dumps(result))

