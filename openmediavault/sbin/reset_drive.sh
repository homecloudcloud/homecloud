#!/bin/bash
set -euo pipefail

###########################################
# CONFIG
###########################################

LOGFILE="/var/log/homecloud_cleanup.log"
ERRORS=false
DRYRUN=false

###########################################
# ARGUMENT HANDLING
###########################################
if [[ "${1:-}" == "--dry-run" ]]; then
    DRYRUN=true
fi

###########################################
# LOGGING FUNCTIONS
###########################################

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOGFILE"
}

run_cmd() {
    local CMD="$1"
    if $DRYRUN; then
        log "[DRY-RUN] $CMD"
    else
        eval "$CMD" 2>>"$LOGFILE" || {
            log "ERROR executing: $CMD"
            ERRORS=true
        }
    fi
}

###########################################
# START
###########################################

log "=================================================="
log " Homecloud Cleanup Script Started (dry-run=$DRYRUN) "
log "=================================================="


###############################################
# STEP 1 — DELETE USERS USING OMV-RPC
###############################################
log "=== STEP 1: Fetching user list from OMV ==="

USER_JSON=$(omv-rpc -u admin 'Homecloud' 'getUserList' \
    '{"start":0,"limit":-1,"sortdir":"asc"}' 2>/dev/null)

if [ -z "$USER_JSON" ]; then
    log "ERROR: Could not retrieve user list from OMV."
    ERRORS=true
else
    log "User list successfully retrieved."
fi

USERS=$(echo "$USER_JSON" | jq -r '.data[] | select(.name != "admin") | .name')

log "Users queued for deletion:"
echo "$USERS"

log "Starting OMV-RPC user deletions..."
for USER in $USERS; do
    log "Deleting user via OMV: $USER"
    run_cmd "omv-rpc -u admin 'Homecloud' 'deleteUser' '{\"name\":\"$USER\"}'"
    echo
done


###############################################
# STEP 2 — DELETE ONLY INTERNAL-STORAGE SHARES
###############################################

log "=== STEP 2: Fetching shared folders list ==="

SHARE_JSON=$(omv-rpc -u admin 'Homecloud' 'getSharedFoldersListFilterHomedirs' \
    '{"start":0,"limit":-1,"sortdir":"asc"}' 2>/dev/null)

if [ -z "$SHARE_JSON" ]; then
    log "ERROR: Could not retrieve shared folders list."
    ERRORS=true
fi

# Filter only shares where:
#   device == "Internal-Storage"
#   OR description CONTAINS "Internal-Storage"
SHARE_UUIDS=$(echo "$SHARE_JSON" | jq -r '
    .data[]
    | select(.device == "Internal-Storage" or (.description | contains("Internal-Storage")))
    | .uuid
')

log "Shares queued for deletion (Internal-Storage only):"
echo "$SHARE_UUIDS"
echo

log "Starting OMV-RPC share deletions..."
for UUID in $SHARE_UUIDS; do
    log "Deleting shared folder via OMV: $UUID"
    run_cmd "omv-rpc -u admin 'Homecloud' 'deleteShareandSMB' '{\"uuid\":\"$UUID\",\"recursive\":true}'"
    echo
done




###############################################
# STEP 3 — DELETE PHYSICAL DIRECTORIES
###############################################

log "=== STEP 3: Directory cleanup on DATA_VOL-home_dirs ==="

MOUNT_PATH=$(findmnt -n -o TARGET /dev/mapper/DATA_VOL-home_dirs || true)

if [ -z "$MOUNT_PATH" ]; then
    log "ERROR: Could not find mount point for /dev/mapper/DATA_VOL-home_dirs"
    ERRORS=true
else
    log "Mount point detected: $MOUNT_PATH"
fi

# Directories to keep
KEEP_DIRS=(
    "."
    ".."
    "aquota.group"
    "aquota.user"
    "duplicati"
    "homes"
    "immich"
    "jellyfin"
    "joplin"
    "lost+found"
    "paperless"
    "vwdata"
)

cd "$MOUNT_PATH"

for DIR in *; do
    SHOULD_KEEP=false

    for K in "${KEEP_DIRS[@]}"; do
        if [[ "$DIR" == "$K" ]]; then
            SHOULD_KEEP=true
            break
        fi
    done

    if ! $SHOULD_KEEP; then
        if [ -d "$DIR" ] || [ -f "$DIR" ]; then
            log "Deleting directory: $DIR"
            run_cmd "rm -rf \"$DIR\""
        fi
    fi
done



###############################################
# STEP 4 — Run OMV deployment tasks
###############################################

log "=== STEP 4: Deploying OMV services (avahi, systemd, samba) ==="

run_cmd "omv-salt deploy run avahi systemd samba"

###############################################
# FINAL STATUS (SINGLE-LINE JSON)
###############################################

echo
log "=================================================="

if $ERRORS; then
    echo '{"status":"Some data not deleted"}'
    exit 0
else
    echo '{"status":"All Drive users and data deleted"}'
    exit 0
fi


