#!/bin/bash
set -e

SECURITY_LIST="/etc/homecloud/sources.list.securityupdates"
DEFAULT_LIST="/etc/homecloud/sources.list"
BACKUP_LIST="/etc/apt/sources.list.backup.homecloud"

# Function to disable the service safely
disable_service() {
    echo ">>> Disabling security-updates.service..."
    systemctl disable --now security-updates.service || true
}

# Ensure the service is always disabled at exit
trap disable_service EXIT

echo ">>> Starting Homecloud security updates script..."

# Run all commands in a subshell to isolate failures
(
    set +e  # Disable exit on error for this block

    if [ -f "$SECURITY_LIST" ]; then
        echo ">>> Backing up current sources.list..."
        cp /etc/apt/sources.list "$BACKUP_LIST" || true

        echo ">>> Applying temporary security sources list..."
        cp "$SECURITY_LIST" /etc/apt/sources.list || true

        echo ">>> Updating package lists..."
        apt-get update -qq || true

        echo ">>> Installing all available security updates..."
        apt-get -y upgrade || true

        echo ">>> Restoring original sources.list..."
        cp "$DEFAULT_LIST" /etc/apt/sources.list || true
    else
        echo ">>> Security sources file not found: $SECURITY_LIST. Skipping updates."
    fi
)

echo ">>> Homecloud security updates script finished."
