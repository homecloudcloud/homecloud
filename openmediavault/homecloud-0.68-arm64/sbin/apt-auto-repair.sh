#!/bin/bash
# /usr/local/sbin/apt-auto-repair.sh
# Safe-first script to auto-fix broken apt state on boot.

LOGFILE="/var/log/apt-auto-repair.log"
REPO_URL="https://repo.homecloud.cloud/"
LOCK_FILE="/var/lib/dpkg/lock-frontend"

echo "===== $(date) =====" >> "$LOGFILE"

# Function to check if APT is busy
apt_is_locked() {
    if fuser "$LOCK_FILE" >/dev/null 2>&1; then
        echo "APT lock detected. Exiting." >> "$LOGFILE"
        return 0
    fi
    return 1
}

# Function to check repo availability via HTTPS
repo_is_available() {
    if curl -s --head --max-time 5 "$REPO_URL" | grep -q "200\|301\|302"; then
        return 0
    else
        echo "Repo not reachable: $REPO_URL" >> "$LOGFILE"
        return 1
    fi
}

# Main check
if apt_is_locked; then
    exit 0
fi

# Check dpkg state
if [ -f /var/lib/dpkg/updates/* ] || [ -f /var/lib/dpkg/lock ]; then
    echo "dpkg pending updates or lock file found." >> "$LOGFILE"
fi

# Check for failed installs
if dpkg --audit | grep -q "packages have been unpacked"; then
    echo "Broken packages detected." >> "$LOGFILE"
    
    if repo_is_available; then
        echo "Attempting safe repair..." >> "$LOGFILE"
        DEBIAN_FRONTEND=noninteractive apt-get install -f -y >> "$LOGFILE" 2>&1
        DEBIAN_FRONTEND=noninteractive dpkg --configure -a >> "$LOGFILE" 2>&1
        DEBIAN_FRONTEND=noninteractive apt-get update >> "$LOGFILE" 2>&1
    else
        echo "Repo unavailable, skipping repair." >> "$LOGFILE"
    fi
else
    echo "No broken packages detected." >> "$LOGFILE"
fi
