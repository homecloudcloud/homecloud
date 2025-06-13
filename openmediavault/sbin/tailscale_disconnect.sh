#!/bin/bash

disconnect_tailscale() {
    # First check if tailscaled service is running
    if ! systemctl is-active --quiet tailscaled; then
        #echo "{\"status\": \"Down\", \"message\": \"Tailscale service is not running\"}"
        exit 1
    fi

    # Get tailscale status in JSON format
    STATUS_JSON=$(tailscale status --json 2>/dev/null)
    if [ $? -ne 0 ]; then
        #echo "{\"status\": \"Error\", \"message\": \"Failed to get Tailscale status\"}"
        exit 1
    fi

    # Get BackendState
    BACKEND_STATE=$(echo "$STATUS_JSON" | jq -r '.BackendState')

    if [ "$BACKEND_STATE" = "Running" ]; then
        # Tailscale is up, try to disconnect
        if tailscale down >/dev/null 2>&1; then
            #echo "{\"status\": \"Down\", \"message\": \"Successfully disconnected\"}"
            exit 0
        else
            #echo "{\"status\": \"Error\", \"message\": \"Failed to disconnect Tailscale\"}"
            exit 1
        fi
    elif [ "$BACKEND_STATE" = "Stopped" ]; then
        #echo "{\"status\": \"Down\", \"message\": \"Tailscale is already disconnected\"}"
        exit 0
    else
        #echo "{\"status\": \"Error\", \"message\": \"Unknown BackendState: $BACKEND_STATE\"}"
        exit 1
    fi
}

# Call the function
disconnect_tailscale

