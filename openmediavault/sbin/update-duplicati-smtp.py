#!/usr/bin/env python3

import argparse
import os
import sys
import yaml
import shutil
from pathlib import Path

def update_env_var(compose_data, key, value):
    """Update or add environment variable in docker-compose data"""
    env_list = compose_data['services']['urbackup']['environment']
    
    # Find and update existing key
    for i, env_var in enumerate(env_list):
        if env_var.startswith(f'{key}='):
            env_list[i] = f'{key}={value}'
            return
    
    # Add new key if not found
    env_list.append(f'{key}={value}')

def remove_env_var(compose_data, key):
    """Remove environment variable from docker-compose data"""
    env_list = compose_data['services']['urbackup']['environment']
    compose_data['services']['urbackup']['environment'] = [
        env for env in env_list if not env.startswith(f'{key}=')
    ]

def safe_write_yaml(file_path, data):
    """Safely write YAML data to file with backup"""
    backup_path = f"{file_path}.bak"
    
    # Create backup
    shutil.copy2(file_path, backup_path)
    
    try:
        with open(file_path, 'w') as f:
            yaml.dump(data, f, default_flow_style=False)
        # Remove backup on success
        os.remove(backup_path)
    except Exception as e:
        # Restore backup on failure
        shutil.move(backup_path, file_path)
        raise e

def main():
    parser = argparse.ArgumentParser(description='Update Urbackup SMTP configuration', add_help=False)
    parser.add_argument('-s', '--state', help='Set to "disabled" to remove SMTP config')
    parser.add_argument('-f', '--from-email', help='From email address')
    parser.add_argument('-r', '--admin-email', help='Admin email address')
    parser.add_argument('-h', '--smtp-host', help='SMTP host')
    parser.add_argument('--help', action='help', help='Show this help message and exit')
    parser.add_argument('-p', '--smtp-port', help='SMTP port')
    parser.add_argument('-u', '--smtp-user', help='SMTP username')
    parser.add_argument('-w', '--smtp-password', help='SMTP password')

            
    args = parser.parse_args()
    
    env_file = "/etc/urbackup/docker-compose.yaml"
    
    if not os.path.exists(env_file):
        print(f"Error: {env_file} does not exist")
        sys.exit(0)
    
    # Load YAML
    with open(env_file, 'r') as f:
        compose_data = yaml.safe_load(f)
    
    if args.state == "disabled":
        # Remove SMTP variables
        remove_env_var(compose_data, "MAIL_SERVER")
        remove_env_var(compose_data, "MAIL_FROM")
        remove_env_var(compose_data, "MAIL_TO")
        remove_env_var(compose_data, "MAIL_USERNAME")
        remove_env_var(compose_data, "MAIL_PASSWORD")
        remove_env_var(compose_data, "MAIL_PORT")

        print("Successfully removed email configuration")
    else:
        # Validate required parameters
        required = [args.from_email, args.admin_email, args.smtp_host, 
                   args.smtp_port, args.smtp_user, args.smtp_password]
        if not all(required):
            print("Error: Missing required parameters")
            parser.print_help()
            sys.exit(1)
        
        # Update SMTP variables
        update_env_var(compose_data, "MAIL_FROM", args.from_email)
        update_env_var(compose_data, "MAIL_TO", args.admin_email)
        update_env_var(compose_data, "MAIL_USERNAME", args.smtp_user)
        update_env_var(compose_data, "MAIL_PASSWORD", args.smtp_password)
        update_env_var(compose_data, "MAIL_SERVER", args.smtp_host)
        update_env_var(compose_data, "MAIL_PORT", args.smtp_port)
        print("Successfully updated email configuration")
    
    # Save changes
    safe_write_yaml(env_file, compose_data)

if __name__ == "__main__":
    main()