#!/bin/bash

function handle_signal()
{
    exit 0
}

trap handle_signal SIGTERM

while true
do
    sleep 1
done
