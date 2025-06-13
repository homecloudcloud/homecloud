#!/bin/sh
/usr/bin/date >> /tmp/udev.log
echo $1 >> /tmp/udev.log 
echo "calling curl"
api_endpoint="https://127.0.0.1:5000/invokesalt_unmount"
min=3
max=15
random_number=$((RANDOM % ($max - $min +1) + $min))
echo $random_number >> /tmp/udev.log
sleep $random_number 
curl --insecure --request POST "${api_endpoint}" >> /tmp/udev.log 2>>/tmp/udev.log
