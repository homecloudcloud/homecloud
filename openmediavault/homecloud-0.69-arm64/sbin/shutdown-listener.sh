#!/bin/bash
cd /sbin
export PYTHONPATH='/usr/lib/python3/dist-packages/'
source /lib/homecloud/bin/activate
/lib/homecloud/bin/python3 reboot-message.py poweroff
exit 0