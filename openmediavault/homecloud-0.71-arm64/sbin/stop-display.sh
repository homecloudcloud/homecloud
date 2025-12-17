#!/bin/bash

LOGFILE="/var/log/oled-stop.log"
exec >> "$LOGFILE" 2>&1
echo "[OLED STOP] $(date): Running oled-stop.sh"

# Kill display.py (safe, clean way)
echo "[OLED STOP] Stopping display.py..."
pkill -f "/lib/homecloud/bin/python3 display.py"

# Optional: Wait a moment for it to exit
sleep 1

echo "[OLED STOP] Done."