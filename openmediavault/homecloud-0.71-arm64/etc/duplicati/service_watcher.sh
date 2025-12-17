#!/bin/sh
# /shared/service_watcher.sh
# Watches for command files like service_command_<ID>.txt
# Executes the corresponding pre/post script and writes status

WATCH_DIR="/shared"

PRE_SCRIPT="/shared/duplicati-pre-backup.sh"
POST_SCRIPT="/shared/duplicati-post-backup.sh"

while true; do
    for cmdfile in $WATCH_DIR/service_command_*.txt; do
        [ -e "$cmdfile" ] || continue

        # Extract ID from filename
        ID=$(basename "$cmdfile" | cut -d'_' -f3 | cut -d'.' -f1)
        RESPONSE_FILE="$WATCH_DIR/service_response_$ID.txt"

        # Read command line
        line=$(head -n1 "$cmdfile")
        ACTION=$(echo $line | cut -d' ' -f1)
        SERVICE=$(echo $line | cut -d' ' -f2)

        case "$ACTION" in
            pre)
                echo "Running pre-backup for $SERVICE (ID=$ID)..."
                sh "$PRE_SCRIPT" "$SERVICE"
                STATUS=$?
                ;;
            post)
                echo "Running post-backup for $SERVICE (ID=$ID)..."
                sh "$POST_SCRIPT" "$SERVICE"
                STATUS=$?
                ;;
            *)
                echo "Unknown action: $ACTION"
                STATUS=1
                ;;
        esac

        # Write acknowledgment
        echo "$STATUS" > "$RESPONSE_FILE"
        # Remove processed command file
        rm -f "$cmdfile"
    done
    sleep 10
done