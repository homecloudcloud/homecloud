#!/bin/bash

if ! docker ps --format "table {{.Names}}" | grep -q "^urbackup$"; then
    echo '{"status": "error", "message": "Urbackup service is not up"}'
    exit 1
fi

docker exec urbackup urbackupsrv cleanup -a 0%
if [ $? -eq 0 ]; then
    echo '{"status": "success", "message": "Cleanup completed"}'
else
    echo '{"status": "error", "message": "Cleanup failed"}'
fi