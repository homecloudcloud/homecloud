#!/bin/sh
# Usage: ./duplicati_backup_hook.sh pre|post <service>

WATCH_DIR="/shared"
SERVICE="urbackup"

if [ -z "$SERVICE" ]; then
    echo "Usage: $0 <service>"
    exit 1
fi

# Remove previous action state file
rm -f "$WATCH_DIR/urbackup_actionused"

# Function to send action and wait for response
send_action() {
    local action=$1
    local mountpoint=$2
    local path=$3
    # unique ID (use PID + timestamp)
    ID=$$
    CMD_FILE="$WATCH_DIR/service_command_${ID}.txt"
    RESP_FILE="$WATCH_DIR/service_response_${ID}.txt"

    if [ -n "$mountpoint" ] && [ -n "$path" ]; then
        echo "$action $SERVICE $mountpoint $path" > "$CMD_FILE"
    elif [ -n "$mountpoint" ]; then
        echo "$action $SERVICE $mountpoint" > "$CMD_FILE"
    else
        echo "$action $SERVICE" > "$CMD_FILE"
    fi
    echo "[$(date)] Sent $action request for $SERVICE (ID=$ID)"

    timeout=60
    elapsed=0

    while [ $elapsed -lt $timeout ]; do
        if [ -f "$RESP_FILE" ]; then
            result=$(cat "$RESP_FILE")
            echo "[$(date)] Helper responded with code=$result"
            rm -f "$RESP_FILE"
            return $result
        fi
        sleep 2
        elapsed=$((elapsed + 2))
    done

    echo "[$(date)] Timeout waiting for helper response"
    return 1
}

# Try snapshot, we can't try pre as that dir is not part of backup path.
send_action "snapshot" "/var/lib/duplicati/shared/snapshot" "/var/lib/urbackup"
snapshot_result=$?

if [ $snapshot_result -eq 0 ]; then
    echo "snapshot" > "$WATCH_DIR/urbackup_actionused"
    echo "[$(date)] Snapshot successful, skipping pre action"
    exit 0
else
    exit $snapshot_result
fi