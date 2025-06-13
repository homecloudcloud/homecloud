#!/bin/bash

check_tailscale_status() {
    # Check if tailscale service is running
    if ! systemctl is-active --quiet tailscaled; then
        echo "{\"status\": \"Down\", \"user\": \"\", \"hostname\": \"\"}"
        exit 0
    fi

    # Get tailscale status in JSON format
    STATUS_JSON=$(tailscale status --json 2>/dev/null)

    if [ $? -ne 0 ]; then
        echo "{\"status\": \"Down\", \"user\": \"\", \"hostname\": \"\"}"
        exit 0
    fi

    # Get BackendState
    BACKEND_STATE=$(echo "$STATUS_JSON" | jq -r '.BackendState')

    if [ "$BACKEND_STATE" = "Running" ]; then
        # Get the current Tailscale IPv4 address
        IPADDR=$(echo "$STATUS_JSON" | jq -r '.Self.TailscaleIPs[0]')

        if [ -n "$IPADDR" ] && [ "$IPADDR" != "null" ]; then
            # Get only the primary user (CurrentTailnet.Name)
            USER=$(echo "$STATUS_JSON" | jq -r '.CurrentTailnet.Name')
            HOSTNAME=$(echo "$STATUS_JSON" | jq -r '.Self.DNSName' | sed 's/\.$//')

            if [ -n "$USER" ] && [ "$USER" != "null" ]; then
                echo "{\"status\": \"Up\", \"user\": \"$USER\", \"hostname\": \"$HOSTNAME\"}"
            else
                echo "{\"status\": \"Up\", \"user\": \"\", \"hostname\": \"$HOSTNAME\"}"
            fi
            exit 0
        fi
    elif [ "$BACKEND_STATE" = "Stopped" ] || [ -z "$BACKEND_STATE" ]; then
        echo "{\"status\": \"Down\", \"user\": \"\", \"hostname\": \"\"}"
        exit 0
    else
        # Unknown state
        echo "{\"status\": \"Down\", \"user\": \"\", \"hostname\": \"\", \"message\": \"Unknown BackendState: $BACKEND_STATE\"}"
        exit 0
    fi

    # If we get here, something went wrong
    echo "{\"status\": \"Down\", \"user\": \"\", \"hostname\": \"\"}"
    exit 0
}

# Call the function
check_tailscale_status

