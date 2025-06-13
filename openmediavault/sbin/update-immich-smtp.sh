#!/bin/bash

# Function to return result in JSON format
output_result() {
    local message="$1"
    echo "{\"result\": \"$message\"}"
    exit ${2:-0}
}

# Function to show usage
usage() {
    echo "Usage: $0 [-s state] -f from -r replyTo -h host -p port -u username -w password"
    echo "  -s state     Optional: Use 'disabled' to disable SMTP notifications"
    echo "  -f from      From email address"
    echo "  -r replyTo   Reply-to email address"
    echo "  -h host      SMTP host"
    echo "  -p port      SMTP port"
    echo "  -u username  SMTP username"
    echo "  -w password  SMTP password"
    echo "Example: $0 -f user@example.com -r user@example.com -h smtp.gmail.com -p 587 -u user@gmail.com -w mypassword"
    echo "         $0 -s disabled"
    exit 1
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    output_result "Error: Please run as root" 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    output_result "Error: jq is not installed" 1
fi

# Parse command line arguments
while getopts "s:f:r:h:p:u:w:" opt; do
    case $opt in
        s) STATE="$OPTARG";;
        f) FROM="$OPTARG";;
        r) REPLY_TO="$OPTARG";;
        h) HOST="$OPTARG";;
        p) PORT="$OPTARG";;
        u) USERNAME="$OPTARG";;
        w) PASSWORD="$OPTARG";;
        ?) usage;;
    esac
done

# Check if immich.json exists
if [ ! -f "/etc/immich/immich.json" ]; then
    output_result "Error: /etc/immich/immich.json file not found" 1
fi

# Create temporary file
TEMP_FILE=$(mktemp)

# Handle disabled state
if [ "$STATE" = "disabled" ]; then
    # Update JSON to disable notifications
    jq '.notifications.smtp.enabled = false' "/etc/immich/immich.json" > "$TEMP_FILE"
else
    # Check if all required parameters are provided
    if [ -z "$FROM" ] || [ -z "$REPLY_TO" ] || [ -z "$HOST" ] || [ -z "$PORT" ] || [ -z "$USERNAME" ] || [ -z "$PASSWORD" ]; then
        rm -f "$TEMP_FILE"
        usage
    fi

    # Validate port number
    if ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
        rm -f "$TEMP_FILE"
        output_result "Error: Port must be a number" 1
    fi

    # Update the JSON file using jq
    jq --arg from "$FROM" \
       --arg replyTo "$REPLY_TO" \
       --arg host "$HOST" \
       --arg port "$PORT" \
       --arg username "$USERNAME" \
       --arg password "$PASSWORD" \
       '.notifications.smtp = {
            enabled: true,
            from: $from,
            replyTo: $replyTo,
            transport: {
                ignoreCert: false,
                host: $host,
                port: ($port | tonumber),
                username: $username,
                password: $password
            }
        }' "/etc/immich/immich.json" > "$TEMP_FILE"
fi

# Check if jq command was successful
if [ $? -ne 0 ]; then
    rm -f "$TEMP_FILE"
    output_result "Error: Failed to update JSON configuration" 1
fi

# Validate the new JSON
if ! jq empty "$TEMP_FILE" 2>/dev/null; then
    rm -f "$TEMP_FILE"
    output_result "Error: Generated invalid JSON" 1
fi

# Backup original file
cp "/etc/immich/immich.json" "/etc/immich/immich.json.bak"

# Move temporary file to destination
if ! mv "$TEMP_FILE" "/etc/immich/immich.json"; then
    output_result "Error: Failed to save new configuration" 1
fi

# Set proper permissions
chmod 644 "/etc/immich/immich.json"

if [ "$STATE" = "disabled" ]; then
    output_result "Successfully disabled SMTP notifications"
else
    output_result "Successfully updated SMTP configuration"
fi

