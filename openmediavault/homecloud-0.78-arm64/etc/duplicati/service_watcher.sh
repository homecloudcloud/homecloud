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
        MOUNTPOINT=$(echo $line | cut -d' ' -f3)
        TARGET_PATH=$(echo $line | cut -d' ' -f4)
        

        case "$ACTION" in
            snapshot)
                echo "Running snapshot for $SERVICE (ID=$ID)..."
                # Check snapshot capabilities
                response=$(curl -s -X GET "https://172.17.0.1:5000/check_snapshot_capabilities?path=$TARGET_PATH" --insecure -H "Content-Type: application/json")
                snapshot_capable=$(echo "$response" | grep -o '"snapshot_capable":[^,}]*' | cut -d':' -f2)
                
                if [ "$snapshot_capable" = "true" ]; then
                    # Take snapshot
                    snapshot_response=$(curl -s -X POST "https://172.17.0.1:5000/take_snapshot?path=$TARGET_PATH&mountpoint=$MOUNTPOINT" --insecure)
                    success=$(echo "$snapshot_response" | grep -o '"success":[^,}]*' | cut -d':' -f2)
                    
                    if [ "$success" = "true" ]; then
                        STATUS=0
                    else
                        STATUS=1
                    fi
                else
                    STATUS=1
                fi
                ;;
            remove_snapshot)
                echo "Running remove_snapshot for $SERVICE (ID=$ID)..."
                # Remove snapshot
                response=$(curl -s -X POST "https://172.17.0.1:5000/remove_snapshot?mountpoint=$MOUNTPOINT" --insecure)
                success=$(echo "$response" | grep -o '"success":[^,}]*' | cut -d':' -f2)
                
                if [ "$success" = "true" ]; then
                    STATUS=0
                else
                    STATUS=1
                fi
                ;;
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