#!/bin/bash
logout_tailscale() {
    # First check if tailscaled service is running
    if ! systemctl is-active --quiet tailscaled; then
        echo "failure"
        return 1
    fi

    # Try to logout from Tailscale
    if tailscale logout >/dev/null 2>&1; then
        echo "success"
        return 0
    else
        echo "failure"
        return 1
    fi
}

# Call the function
logout_tailscale

