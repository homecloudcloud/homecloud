#!/bin/bash
PASS="$1"
/usr/sbin/chpasswd <<< "admin:$PASS"
