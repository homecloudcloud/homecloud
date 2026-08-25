#!/bin/bash

# Check if an argument was provided
if [ $# -eq 0 ]; then
    echo "No argument provided. Usage: $0 devicename to be unmounted"
    exit 1
fi

cd /sbin
source /lib/homecloud/bin/activate
python3 unmount_fs.py $1
