#!/usr/bin/env python3

import sys
import yaml
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
import argparse
import os
import subprocess

def validate_s3_credentials(access_key, secret_key, s3_url):
    """Validate S3 credentials by attempting to list buckets"""
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            endpoint_url=s3_url,
            verify=False
        )
        
        # Try to list buckets to validate credentials
        s3_client.list_buckets()
        return True
    except (ClientError, NoCredentialsError):
        return False
    except Exception:
        return False

def update_juicefs_config(access_key, secret_key, s3_url):
    """Update JuiceFS docker-compose.yaml with S3 credentials"""
    compose_file = '/etc/juicefs/docker-compose.yaml'
    
    try:
        with open(compose_file, 'r') as f:
            compose_data = yaml.safe_load(f)
        
        # Extract bucket name from S3 URL
        bucket_name = s3_url
        
        # Update environment variables
        env = compose_data['services']['juicefs']['environment']
        
        # Update or add environment variables
        env_dict = {}
        for item in env:
            if '=' in item:
                key, value = item.split('=', 1)
                env_dict[key] = value
        
        env_dict['ACCESS_KEY'] = access_key
        env_dict['SECRET_KEY'] = secret_key
        env_dict['JFS_BUCKET'] = bucket_name
        
        # Convert back to list format
        compose_data['services']['juicefs']['environment'] = [f'{k}={v}' for k, v in env_dict.items()]
        
        # Write updated config
        with open(compose_file, 'w') as f:
            yaml.dump(compose_data, f, default_flow_style=False)
        
        return True
    except FileNotFoundError:
        print("Configuration error")
        return False
    except Exception:
        return False

def update_urbackup_config():
    """Update UrBackup docker-compose.yaml with JuiceFS volume"""
    urbackup_file = '/etc/urbackup/docker-compose.yaml'
    
    if not os.path.exists(urbackup_file):
        return True
    
    try:
        with open(urbackup_file, 'r') as f:
            urbackup_data = yaml.safe_load(f)
        
        volumes = urbackup_data['services']['urbackup']['volumes']
        volume_entry = '/var/lib/jfsdata:/backups-cloud'
        
        # Check if volume already exists
        if volume_entry not in volumes:
            volumes.append(volume_entry)
            
            # Write updated config
            with open(urbackup_file, 'w') as f:
                yaml.dump(urbackup_data, f, default_flow_style=False)
        
        return True
    except Exception:
        return False

def main():
    parser = argparse.ArgumentParser(description='Validate S3 credentials and update JuiceFS config')
    parser.add_argument('--access-key', required=True, help='S3 Access Key')
    parser.add_argument('--secret-key', required=True, help='S3 Secret Key')
    parser.add_argument('--s3-url', required=True, help='S3 URL')
    
    args = parser.parse_args()
    
    # Validate credentials
    if not validate_s3_credentials(args.access_key, args.secret_key, args.s3_url):
        print("Provided credentials not valid")
        sys.exit(0)
    
    # Update JuiceFS configuration
    if not update_juicefs_config(args.access_key, args.secret_key, args.s3_url):
        sys.exit(0)
    
    # Update UrBackup configuration
    if update_urbackup_config():
        # Restart UrBackup service after successful config update
        try:
            subprocess.run(['systemctl', 'restart', 'juicefs.service'], check=True)
            subprocess.run(['sleep', '10'], check=True)
            subprocess.run(['systemctl', 'restart', 'urbackup.service'], check=True)
        except subprocess.CalledProcessError:
            pass  # Continue even if restart fails
    else:
        sys.exit(0)
    
    print("Success")
    sys.exit(0)

if __name__ == "__main__":
    main()
