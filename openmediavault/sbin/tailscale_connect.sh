#!/bin/bash

# Function to get tailscale status and create JSON
get_tailscale_status() {
    # Get status from tailscale status --json
    if STATUS_JSON=$(tailscale status --json 2>/dev/null); then
        # Get BackendState
        BACKEND_STATE=$(echo "$STATUS_JSON" | jq -r '.BackendState')
        
        if [ "$BACKEND_STATE" = "Running" ]; then
            # Get IP and hostname
            IP=$(echo "$STATUS_JSON" | jq -r '.Self.TailscaleIPs[0]')
            HOSTNAME=$(echo "$STATUS_JSON" | jq -r '.Self.DNSName' | sed 's/\.$//')
            # Create JSON output
            #echo "VPN connected successfully."
            #echo "{\"status\": \"Up\", \"ip\": \"$IP\", \"hostname\": \"$HOSTNAME\"}"
            return 0
        elif [ "$BACKEND_STATE" = "Stopped" ]; then
            #echo "BACKEND STOPPED"
            return 1
        else
            # Unknown state
            #echo "Error: $BACKEND_STATE"
            #echo "{\"status\": \"Error\", \"ip\": \"\", \"hostname\": \"\", \"message\": \"Unknown BackendState: $BACKEND_STATE\"}"
            exit 1
        fi
    fi
    # If status command failed
    #echo "{\"status\": \"Error\", \"ip\": \"\", \"hostname\": \"\", \"message\": \"Failed to get Tailscale status\"}"
    #echo "Error: Failed to get VPN status"
    exit 1
}

# Main script
main() {
    # First check if tailscale is already up
    if STATUS_JSON=$(tailscale status --json 2>/dev/null); then
        BACKEND_STATE=$(echo "$STATUS_JSON" | jq -r '.BackendState')
        
        if [ "$BACKEND_STATE" = "Running" ]; then
            # Already running, get status
            get_tailscale_status
            exit 0
        elif [ "$BACKEND_STATE" = "Stopped" ]; then
            # Tailscale is stopped, try to start it
             #echo "Starting Tailscale..." >&2
            if ! tailscale up --advertise-exit-node --accept-routes --advertise-tags=tag:homecloud >/dev/null 2>&1; then
                #echo "Error: Failed to start VPN"
                #echo "{\"status\": \"Error\", \"ip\": \"\", \"hostname\": \"\", \"message\": \"Failed to start Tailscale\"}"
                exit 1
            fi

            # Wait for connection to establish
            sleep 2

            # Recheck status
            if output=$(get_tailscale_status); then
                #echo "$output"
                exit 0
            else
                #echo "Error: Failed to get status of VPN"
                #echo "{\"status\": \"Error\", \"ip\": \"\", \"hostname\": \"\", \"message\": \"Failed to get status after starting Tailscale\"}"
                exit 1
            fi
        else
            # Unknown state
            #echo "Error: $BACKEND_STATE"
            #echo "{\"status\": \"Error\", \"ip\": \"\", \"hostname\": \"\", \"message\": \"Unknown BackendState: $BACKEND_STATE\"}"
            exit 1
        fi
    else
        # Status command failed
        #echo "{\"status\": \"Error\", \"ip\": \"\", \"hostname\": \"\", \"message\": \"Failed to get Tailscale status\"}"
        #echo "Error: Failed to get VPN status"
        exit 1
    fi
}

# Run main function
main

