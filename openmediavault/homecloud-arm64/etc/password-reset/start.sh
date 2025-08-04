#!/bin/bash

echo "Getting OpenMediaVault email settings..."
EMAIL_CONFIG=$(omv-rpc -u admin 'EmailNotification' 'get')

ENABLED=$(echo "$EMAIL_CONFIG" | jq -r '.enable')
if [ "$ENABLED" = "true" ]; then
    SMTP_FROM=$(echo "$EMAIL_CONFIG" | jq -r '.sender')
    SMTP_TO=$(echo "$EMAIL_CONFIG" | jq -r '.primaryemail')
    SMTP_HOST=$(echo "$EMAIL_CONFIG" | jq -r '.server')
    SMTP_USER=$(echo "$EMAIL_CONFIG" | jq -r '.username')
    SMTP_PASS=$(echo "$EMAIL_CONFIG" | jq -r '.password')

    # Generate a secure random token (32 hex characters)
    RESET_TOKEN=$(openssl rand -hex 16)
    
    # Get hostname from API
    echo "Getting hostname from API..."
    HOSTNAME_RESPONSE=$(curl -s --insecure https://localhost:5000/get_hostname)
    
    # Check if the API call was successful
    SUCCESS=$(echo "$HOSTNAME_RESPONSE" | jq -r '.success')
    
    if [ "$SUCCESS" = "true" ]; then
        # Extract hostname from the response
        HOSTNAME=$(echo "$HOSTNAME_RESPONSE" | jq -r '.hostname')
        echo "Retrieved hostname: $HOSTNAME"
        
        cat <<EOF > /var/lib/password-reset/config.env
SMTP_FROM=${SMTP_FROM}
SMTP_TO=${SMTP_TO}
SMTP_HOST=${SMTP_HOST}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
ADMIN_EMAIL=${SMTP_TO}
RESET_TOKEN=${RESET_TOKEN}
HOSTNAME=${HOSTNAME}
EOF

        echo "Generated RESET_TOKEN: ${RESET_TOKEN}"
        echo "Configuration file created with hostname: ${HOSTNAME}"
    else
        echo "Failed to get hostname from API. Using default configuration without hostname."
        
        cat <<EOF > /var/lib/password-reset/config.env
SMTP_FROM=${SMTP_FROM}
SMTP_TO=${SMTP_TO}
SMTP_HOST=${SMTP_HOST}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
ADMIN_EMAIL=${SMTP_TO}
RESET_TOKEN=${RESET_TOKEN}
EOF

        echo "Generated RESET_TOKEN: ${RESET_TOKEN}"
    fi
else
    echo "Email notification is disabled in OMV settings."

    if [ -f /var/lib/password-reset/config.env ]; then
        exit 0
    fi
    mkdir -p /var/lib/password-reset
    touch /var/lib/password-reset/config.env
    exit 0

fi