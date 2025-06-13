#!/usr/bin/env python3

import json
import argparse
import os
import yaml
import tempfile
import shutil

def output_json(message, exit_code=0):
    """Function to output JSON messages"""
    print(json.dumps({"message": message}))
    if exit_code == 1:
        exit(1)

def usage():
    """Function to show usage"""
    print("Usage: script.py [-s disabled] -f from_email -r reply_to_email -h smtp_host -p smtp_port -u smtp_username -w smtp_password")
    print("       script.py -s disabled    # To remove SMTP configuration")
    output_json("Invalid arguments provided", 1)

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Update Vaultwarden SMTP configuration', add_help=False)
    parser.add_argument('-s', '--state', help='State (disabled)')
    parser.add_argument('-f', '--from_email', help='From email address')
    parser.add_argument('-r', '--reply_to', help='Reply to email address')
    parser.add_argument('-h', '--smtp_host', dest='smtp_host', help='SMTP host')  # Changed to -h with dest=smtp_host
    parser.add_argument('-p', '--smtp_port', help='SMTP port')
    parser.add_argument('-u', '--smtp_user', help='SMTP username')
    parser.add_argument('-w', '--smtp_pass', help='SMTP password')
    parser.add_argument('--help', action='help', help='Show this help message and exit')
    
    args = parser.parse_args()

    # Check if docker-compose file exists
    compose_file = "/etc/vault-warden/docker-compose-vaultwarden.yml"
    if not os.path.exists(compose_file):
        output_json(f"docker-compose file not found at {compose_file}", 1)

    # Create temporary file
    try:
        temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False)
    except Exception as e:
        output_json(f"Failed to create temporary file: {str(e)}", 1)

    try:
        # Read the existing YAML
        with open(compose_file, 'r') as f:
            data = yaml.safe_load(f)

        # Check if state is disabled or validate required parameters
        if args.state != "disabled":
            if not all([args.from_email, args.reply_to, args.smtp_host, 
                       args.smtp_port, args.smtp_user, args.smtp_pass]):
                temp_file.close()
                os.unlink(temp_file.name)
                usage()

        # Process the docker-compose file
        if 'services' not in data:
            data['services'] = {}
        if 'vaultwarden' not in data['services']:
            data['services']['vaultwarden'] = {}
        if 'environment' not in data['services']['vaultwarden']:
            data['services']['vaultwarden']['environment'] = []

        # Get current environment
        env_vars = data['services']['vaultwarden']['environment']

        # Update or remove SMTP settings
        new_env = []
        
        # Define SMTP variables directly in the format we want
        smtp_settings = [
            f"SMTP_HOST={args.smtp_host}",  # Changed from args.host to args.smtp_host
            f"SMTP_FROM={args.from_email}",
            f"SMTP_PORT={args.smtp_port}",
            f"SMTP_SECURITY=starttls",
            f"SMTP_USERNAME={args.smtp_user}",
            f"SMTP_PASSWORD={args.smtp_pass}"
        ]

        # Keep non-SMTP environment variables
        for env in env_vars:
            if not any(env.startswith(smtp_key) for smtp_key in ['SMTP_HOST', 'SMTP_FROM', 'SMTP_PORT', 
                                                               'SMTP_SECURITY', 'SMTP_USERNAME', 'SMTP_PASSWORD']):
                new_env.append(env)

        # Add SMTP settings if not disabled
        if args.state != "disabled":
            new_env.extend(smtp_settings)

        # Update the environment in the data structure
        data['services']['vaultwarden']['environment'] = new_env

        # Write to temporary file
        with open(temp_file.name, 'w') as f:
            yaml.dump(data, f, default_flow_style=False)

        # Create backup of original file
        shutil.copy2(compose_file, f"{compose_file}.bak")

        # Move temporary file to original location
        shutil.move(temp_file.name, compose_file)

        if args.state == "disabled":
            output_json("Successfully removed SMTP configuration")
        else:
            output_json("Successfully updated SMTP configuration")

    except Exception as e:
        # Cleanup temporary file in case of error
        if os.path.exists(temp_file.name):
            os.unlink(temp_file.name)
        output_json(f"Error: {str(e)}", 1)

if __name__ == "__main__":
    main()
