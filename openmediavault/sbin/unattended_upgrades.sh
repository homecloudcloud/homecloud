#!/bin/bash
# manage-unattended-upgrades.sh
# Usage: manage-unattended-upgrades.sh enable|disable|status

set -euo pipefail

ACTION="${1:-}"
APT_CONF_FILE="/etc/apt/apt.conf.d/20auto-upgrades"

enable_unattended() {
    if ! cat <<EOF | sudo tee "$APT_CONF_FILE" >/dev/null
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF
    then
        echo "{\"status\":\"error\",\"message\":\"failed to update $APT_CONF_FILE\"}" >&2
        exit 1
    fi

    if ! sudo systemctl enable --now unattended-upgrades.service >/dev/null 2>&1; then
        echo "{\"status\":\"error\",\"message\":\"failed to enable unattended-upgrades.service\"}" >&2
        exit 1
    fi

    echo "{\"status\":\"enabled\"}"
    exit 0
}

disable_unattended() {
    if ! cat <<EOF | sudo tee "$APT_CONF_FILE" >/dev/null
APT::Periodic::Update-Package-Lists "0";
APT::Periodic::Unattended-Upgrade "0";
EOF
    then
        echo "{\"status\":\"error\",\"message\":\"failed to update $APT_CONF_FILE\"}" >&2
        exit 1
    fi

    # Stop/disable service but don't fail hard
    sudo systemctl stop unattended-upgrades.service >/dev/null 2>&1 || true
    sudo systemctl disable unattended-upgrades.service >/dev/null 2>&1 || true

    echo "{\"status\":\"disabled\"}"
    exit 0
}

status_unattended() {
    STATUS="disabled"

    if [[ -f "$APT_CONF_FILE" ]]; then
        if grep -q 'APT::Periodic::Unattended-Upgrade "1";' "$APT_CONF_FILE"; then
            STATUS="enabled"
        fi
    fi

    echo "{\"status\":\"$STATUS\"}"
    exit 0
}

case "$ACTION" in
    enable) enable_unattended ;;
    disable) disable_unattended ;;
    status) status_unattended ;;
    *) echo "Usage: $0 enable|disable|status" >&2 && exit 1 ;;
esac
