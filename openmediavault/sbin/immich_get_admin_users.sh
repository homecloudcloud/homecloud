#!/bin/bash

# Function to create Python script for JSON processing
create_python_processor() {
    cat << 'EOF' > /tmp/process_users.py
import sys
import json
import re

try:
    # Read input from stdin
    input_str = sys.stdin.read().strip()
    
    # Fix date format - add quotes around date values
    input_str = re.sub(r': (\d{4}-\d{2}-\d{2}T[0-9:.]+Z)', r': "\1"', input_str)
    
    # Parse the JSON
    data = json.loads(input_str)
    
    # Find the first admin user's email
    admin_email = ""
    for user in data:
        if user.get("isAdmin") is True:
            admin_email = user["email"]
            break
    
    # Create simple output with just the email
    output = {"email": admin_email}
    
    # Print the result
    print(json.dumps(output))

except Exception as e:
    # Return empty result on any error
    print('{"email": ""}')
EOF
}

# Create the Python processor
create_python_processor

# Run the command and process output
docker compose -f /etc/immich/docker-compose.yml exec -T immich-server immich-admin list-users 2>/dev/null | \
    grep -A 1000 '^\[' | \
    sed 's/\([a-zA-Z][a-zA-Z]*\):/"\1":/' | \
    sed "s/'/\"/g" | \
    python3 /tmp/process_users.py

# Clean up
rm -f /tmp/process_users.py

