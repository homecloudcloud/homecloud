#!/usr/bin/env python3

import sys
import json
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
import argparse
import urllib3
# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

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


def main():
    parser = argparse.ArgumentParser(description='Validate S3 credentials and update JuiceFS config')
    parser.add_argument('--access-key', required=True, help='S3 Access Key')
    parser.add_argument('--secret-key', required=True, help='S3 Secret Key')
    parser.add_argument('--s3-url', required=True, help='S3 URL')
    
    args = parser.parse_args()
    
    # Validate credentials
    if not validate_s3_credentials(args.access_key, args.secret_key, args.s3_url):
        print(json.dumps({"status": "failure", "message": "Provided credentials not valid"}))
        sys.exit(0)
    
    print(json.dumps({"status": "success", "message": "Credentials validated successfully"}))
    sys.exit(0)

if __name__ == "__main__":
    main()
