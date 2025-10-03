#!/bin/bash
cd /sbin
export PYTHONPATH='/usr/lib/python3/dist-packages/'
source /lib/homecloud/bin/activate

if systemctl list-jobs | grep -q reboot.target; then
    echo "[OLED STOP] Detected: Reboot"
    /lib/homecloud/bin/python3 reboot-message.py reboot
elif systemctl list-jobs | grep -q poweroff.target; then
    echo "[OLED STOP] Detected: Shutdown"
    /lib/homecloud/bin/python3 reboot-message.py poweroff
else
    echo "[OLED STOP] Unknown or manual stop"
    /lib/homecloud/bin/python3 reboot-message.py poweroff
fi

exit 0
