#!/bin/sh
# Usage: ./duplicati_backup_hook.sh 

WATCH_DIR="/shared"
ACTION="post"
SERVICE="immich"

if [ -z "$ACTION" ] || [ -z "$SERVICE" ]; then
    echo "Usage: $0 pre|post <service>"
    exit 1
fi

# unique ID (use PID + timestamp)
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