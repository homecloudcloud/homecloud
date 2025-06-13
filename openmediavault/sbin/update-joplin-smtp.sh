#!/bin/bash

# Function to print usage
usage() {
    echo "Usage: $0 [-s disabled] -f FROM_EMAIL -r ADMIN_EMAIL -h SMTP_HOST -p SMTP_PORT -u SMTP_USER -w SMTP_PASSWORD"
    echo "Examples:"
    echo "  $0 -f user@example.com -r admin@example.com -h smtp.gmail.com -p 587 -u user@gmail.com -w mypassword"
    echo "  $0 -s disabled"
    exit 1
}

# Function to update or add environment variable
update_env_var() {
    local key="$1"
    local value="$2"
    local file="$3"
    
    # Escape special characters in the value
    value=$(echo "$value" | sed 's/[\/&]/\\&/g')
    
    if grep -q "^${key}=" "$file"; then
        # Update existing value
        sed -i "s/^${key}=.*/${key}=${value}/" "$file"
    else
        # Add new value
        echo "${key}=${value}" >> "$file"
    fi
}

# Function to remove environment variable
remove_env_var() {
    local key="$1"
    local file="$2"
    sed -i "/^${key}=/d" "$file"
}

# Parse command line arguments
while getopts "s:f:r:h:p:u:w:" opt; do
    case $opt in
        s) state="$OPTARG" ;;
        f) from_email="$OPTARG" ;;
        r) admin_email="$OPTARG" ;;
        h) smtp_host="$OPTARG" ;;
        p) smtp_port="$OPTARG" ;;
        u) smtp_user="$OPTARG" ;;
        w) smtp_password="$OPTARG" ;;
        *) usage ;;
    esac
done

# Check if docker-compose.env exists
env_file="/etc/joplin/.env"
if [ ! -f "$env_file" ]; then
    echo "Error: $env_file does not exist"
    exit 0 
fi


if [ "$state" = "disabled" ]; then
    # Remove all SMTP-related variables
    update_env_var "MAILER_ENABLED" "0" "$env_file"
else
    # Check if all required parameters are provided
    if [ -z "$from_email" ] || [ -z "$admin_email" ] || [ -z "$smtp_host" ] || 
       [ -z "$smtp_port" ] || [ -z "$smtp_user" ] || [ -z "$smtp_password" ]; then
        echo "Error: Missing required parameters"
        usage
    fi

    # Update or add environment variables
    update_env_var "MAILER_ENABLED" "1" "$env_file"
    update_env_var "MAILER_HOST" "$smtp_host" "$env_file"
    update_env_var "MAILER_NOREPLY_EMAIL" "$from_email" "$env_file"
    update_env_var "MAILER_NOREPLY_NAME" "$from_email" "$env_file"
    update_env_var "MAILER_AUTH_USER" "$smtp_user" "$env_file"
    update_env_var "MAILER_PORT" "$smtp_port" "$env_file"
    update_env_var "MAILER_SECURITY" "starttls" "$env_file"
    update_env_var "MAILER_AUTH_PASSWORD" "$smtp_password" "$env_file"
fi

# Verify the changes
if [ "$state" = "disabled" ]; then
   echo "Successfully removed email configuration from $env_file"
else
   echo "Successfully updated email configuration in $env_file"
fi
exit 0

