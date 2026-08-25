#!/bin/sh
# Usage: ./duplicati_backup_hook.sh 

WATCH_DIR="/shared"
SERVICE="urbackup"
ACTION_FILE="$WATCH_DIR/urbackup_actionused"

# Check what action was used in pre-backup
if [ -f "$ACTION_FILE" ]; then
    action_used=$(cat "$ACTION_FILE")
    echo "[$(date)] Previous action used: $action_used"
    
    if [ "$action_used" = "snapshot" ]; then
        # Send remove_snapshot action
        echo "[$(date)] Sending remove_snapshot action..."
        ID=$$
        CMD_FILE="$WATCH_DIR/service_command_${ID}.txt"
        RESP_FILE="$WATCH_DIR/service_response_${ID}.txt"
        
        echo "remove_snapshot $SERVICE /var/lib/duplicati/shared/snapshot" > "$CMD_FILE"
        echo "[$(date)] Sent remove_snapshot request for $SERVICE (ID=$ID)"
        
        timeout=60
        elapsed=0
        
        while [ $elapsed -lt $timeout ]; do
            if [ -f "$RESP_FILE" ]; then
                result=$(cat "$RESP_FILE")
                echo "[$(date)] Helper responded with code=$result"
                rm -f "$RESP_FILE"
                exit $result
            fi
            sleep 2
            elapsed=$((elapsed + 2))
        done
        
        echo "[$(date)] Timeout waiting for helper response"
        exit 1
    elif [ "$action_used" = "pre" ]; then
        # Use post action
        ACTION="post"
    fi
else
    # No action file, use post action
    ACTION="post"
fi

# Send post action
ID=$$
CMD_FILE="$WATCH_DIR/service_command_${ID}.txt"
RESP_FILE="$WATCH_DIR/service_response_${ID}.txt"

echo "$ACTION $SERVICE" > "$CMD_FILE"
echo "[$(date)] Sent $ACTION request for $SERVICE (ID=$ID)"

timeout=60
elapsed=0

while [ $elapsed -lt $timeout ]; do
    if [ -f "$RESP_FILE" ]; then
        result=$(cat "$RESP_FILE")
        echo "[$(date)] Helper responded with code=$result"
        rm -f "$RESP_FILE"
        exit $result
    fi
    sleep 2
    elapsed=$((elapsed + 2))
done

echo "[$(date)] Timeout waiting for helper response"
exit 1