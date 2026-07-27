#!/bin/bash

# Check if an argument was provided
if [ $# -eq 0 ]; then
    echo "No argument provided. Usage: $0 username password add|delete"
    exit 1
fi

cd /sbin
source /lib/homecloud/bin/activate
python3 setup_new_user.py $1 $2 $3