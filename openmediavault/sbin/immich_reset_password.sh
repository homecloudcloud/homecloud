#!/bin/bash

# Function to create Python script for JSON processing
create_python_processor() {
    cat << 'EOF' > /tmp/process_password.py
import sys
import json
import re

try:
    # Read input from stdin
    input_str = sys.stdin.read()
    
    # Find the password using regex
    match = re.search(r'has been updated to:\s*(\S+)\s*$', input_str)
    if match:
        password = match.group(1)
        # Create output with the password
        output = {"password": password}
    else:
        output = {"password": ""}
    
    # Print the result
    print(json.dumps(output))

except Exception as e:
    # Return empty result on any error
    print('{"password": ""}')
EOF
}

# Create the Python processor
create_python_processor

# Run the command with expect-like behavior using heredoc
# The 'expect' approach sends an empty line when prompted for password
(
echo
) | docker compose -f /etc/immich/docker-compose.yml exec -T immich-server immich-admin reset-admin-password 2>/dev/null | \
    python3 /tmp/process_password.py

# Clean up
rm -f /tmp/process_password.py

