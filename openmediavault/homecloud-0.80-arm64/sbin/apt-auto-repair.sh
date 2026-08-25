#!/bin/bash
#
# /sbin/apt-auto-repair.sh
#
# HomeCloud automatic package repair.
# Safe to execute on every boot.

set -u

LOGFILE="/var/log/apt-auto-repair.log"
REPO_URL="https://repo.homecloud.cloud/"
SCRIPT_LOCK="/run/apt-auto-repair.lock"

###############################################################################
# Prevent multiple copies of this script
###############################################################################

exec 9>"$SCRIPT_LOCK"
flock -n 9 || exit 0

###############################################################################
# Logging
###############################################################################

log() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $*"
    echo "$msg" >> "$LOGFILE"
    logger -t apt-auto-repair "$*"
}

log "========== Starting package health check =========="

###############################################################################
# Detect whether apt/dpkg is currently busy
###############################################################################

apt_is_busy() {

    local locks=(
        /var/lib/dpkg/lock
        /var/lib/dpkg/lock-frontend
        /var/lib/apt/lists/lock
        /var/cache/apt/archives/lock
    )

    local lock

    for lock in "${locks[@]}"; do
        if fuser "$lock" >/dev/null 2>&1; then
            return 0
        fi
    done

    return 1
}

###############################################################################
# Check repository availability
###############################################################################

repo_is_available() {

    curl -fsI --max-time 5 "$REPO_URL" >/dev/null 2>&1
}

###############################################################################
# Don't interfere with another package operation
###############################################################################

if apt_is_busy; then
    log "APT/DPKG currently busy. Skipping repair."
    exit 0
fi

###############################################################################
# Determine whether repair is required
###############################################################################

NEEDS_REPAIR=0

if compgen -G "/var/lib/dpkg/updates/*" >/dev/null; then
    log "Pending dpkg updates detected."
    NEEDS_REPAIR=1
fi

if dpkg --audit | grep -q .; then
    log "dpkg reports unfinished package operations."
    NEEDS_REPAIR=1
fi

if [ "$NEEDS_REPAIR" -eq 0 ]; then
    log "Package database is healthy."
    exit 0
fi

###############################################################################
# Finish interrupted package configuration
###############################################################################

log "Running: dpkg --configure -a"

if DEBIAN_FRONTEND=noninteractive dpkg --configure -a >>"$LOGFILE" 2>&1; then
    log "dpkg configuration completed."
else
    log "dpkg configuration returned errors."
fi

###############################################################################
# If repository is available, repair dependencies
###############################################################################

if repo_is_available; then

    log "Repository reachable."

    log "Running: apt-get install -f"

    DEBIAN_FRONTEND=noninteractive \
    apt-get install -f -y >>"$LOGFILE" 2>&1 || \
    log "apt-get install -f failed."

    log "Running: apt-get update"

    DEBIAN_FRONTEND=noninteractive \
    apt-get update >>"$LOGFILE" 2>&1 || \
    log "apt-get update failed."

else

    log "Repository unavailable. Skipping apt operations."

fi

###############################################################################
# Final verification
###############################################################################

if dpkg --audit | grep -q .; then
    log "Repair incomplete. Manual investigation may be required."
else
    log "Package system successfully repaired."
fi

log "========== Finished package health check =========="

exit 0