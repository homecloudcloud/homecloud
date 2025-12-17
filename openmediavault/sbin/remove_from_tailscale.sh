#!/bin/bash

# Get tailnet from tailscale status
tailnet=$(tailscale status --json | jq -r '.MagicDNSSuffix' | sed 's/\.//')

# Get API key from file
apikey=$(cat "/root/.tsinfo" 2>/dev/null || echo "")

# Get current machine hostname
currentname=$(hostname)

if [ -z "$apikey" ] || [ -z "$tailnet" ]; then
    echo "Missing API key or tailnet information"
    exit 1
fi

# Find and delete current machine from Tailscale network
curl -s "https://api.tailscale.com/api/v2/tailnet/$tailnet/devices" -u "$apikey:" | jq -r '.devices[] | "\(.id) \(.name)"' |
while read id name; do
    if [[ $name = *"$currentname"* ]]; then
        echo "Removing $name ($id) from Tailscale network"
        curl -s -X DELETE "https://api.tailscale.com/device/$id" -u "$apikey:"
    fi
done