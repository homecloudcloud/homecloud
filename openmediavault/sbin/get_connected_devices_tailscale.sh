#!/bin/bash

# If no argument provided, set OS_TYPE to "all"
if [ $# -eq 0 ]; then
    OS_TYPE="all"
else
    OS_TYPE=$(echo "$1" | tr '[:upper:]' '[:lower:]')  # Convert input to lowercase
fi

# Function to output empty result
output_empty_result() {
    echo '{"total": 0, "data": []}'
    exit 0
}

# Check if tailscale is running and logged in
if ! tailscale status > /dev/null 2>&1; then
    output_empty_result
fi

# Check if tailscale is in stopped state
if tailscale status | grep -q "Stopped"; then
    output_empty_result
fi

# Get tailscale status and filter based on OS type
if [ "$OS_TYPE" = "all" ]; then
    # Show all devices without filtering, excluding empty names
    tailscale status --json | jq '
    {
        data: [
            .Peer[] |
            # Create the name first
            (. + {computed_name: (if .DNSName then (.DNSName | rtrimstr(".")) else (.HostName | rtrimstr(".")) end)}) |
            # Only select entries where computed_name is not empty
            select(.computed_name != "") |
            {
                name: .computed_name,
                os: .OS,
                ip_address: .TailscaleIPs[0],
                status: (if .Online then "online" else "offline" end)
            }
        ]
    } | . + {total: (.data | length)}'
else
    # Filter devices based on OS type, excluding empty names
    tailscale status --json | jq --arg os "$OS_TYPE" '
    {
        data: [
            .Peer[] | 
            select(.OS | ascii_downcase | contains($os)) |
            # Create the name first
            (. + {computed_name: (if .DNSName then (.DNSName | rtrimstr(".")) else (.HostName | rtrimstr(".")) end)}) |
            # Only select entries where computed_name is not empty
            select(.computed_name != "") |
            {
                name: .computed_name,
                os: .OS,
                ip_address: .TailscaleIPs[0],
                status: (if .Online then "online" else "offline" end)
            }
        ]
    } | . + {total: (.data | length)}'
fi
