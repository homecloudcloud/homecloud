#!/usr/bin/env bash
/sbin/toggle_display.py
current_datetime=$(date +'%Y-%m-%d %H:%M:%S')
chown root:root /tmp/reset_wifi.tmp
chmod 644 /tmp/reset_wifi.tmp
chmod a+w /tmp/reset_wifi.tmp
echo "Power button pressed at $current_datetime" >> /tmp/reset_wifi.tmp
set -e
export PYTHONPATH='/usr/lib/python3/dist-packages/'
source "/lib/homecloud/bin/activate"
python3 /sbin/power_button.py