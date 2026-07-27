#!/usr/bin/env python3

import json
import subprocess
import os
import requests
import platform
import socket
import yaml
import boto3
from urllib3.exceptions import InsecureRequestWarning

# Disable SSL warnings
requests.packages.urllib3.disable_warnings(category=InsecureRequestWarning)

COMPOSE_FILE = "/etc/juicefs/docker-compose.yaml"
META_URL = "sqlite3:///var/lib/juicefs/meta.db"


def check_service_status(service_name):
    try:
        exists = subprocess.run(['systemctl', 'list-unit-files', service_name],
                              capture_output=True, text=True)
        if exists.returncode != 0:
            return False
            
        result = subprocess.run(['systemctl', 'is-active', service_name], 
                              capture_output=True, text=True)
        return result.stdout.strip() == 'active'
    except Exception:
        return False


def check_tailscale_service_status(service_name):
    try:
        result = subprocess.run(["systemctl", "status", service_name], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        for line in result.stdout.split("\n"):
            if "Active:" in line:
                short_status = line.split(":")[1].strip()
                short_1_status = short_status.split('(', 1)
                if "active" in short_1_status[0]:
                    for line in result.stdout.split("\n"):
                        if "Status:" in line:
                            if "Connected" in line:
                                return True
                            else:
                                return False
        return False
    except subprocess.CalledProcessError:
        return False


def check_directories():
    required_dirs = ['/var/lib/juicefs', '/etc/juicefs']
    return all(os.path.isdir(dir) for dir in required_dirs)


def get_local_ip():
    try:
        arch = platform.machine().lower()    
        if arch in ['x86_64', 'amd64', 'x86']:
            hostname = socket.gethostname()
            return hostname

        cmd = "ip route get 1 2>/dev/null | awk '{print $7; exit}' | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$'"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.stdout.strip():
            return result.stdout.strip()

        result = subprocess.run(['hostname', '-I'], capture_output=True, text=True)
        if result.stdout.strip():
            return result.stdout.strip().split()[0]

        return '127.0.0.1'
    except Exception:
        return '127.0.0.1'


def get_tailscale_fqdn():
    try:
        if not check_tailscale_service_status('tailscaled.service'):
            return None

        result = subprocess.run(['tailscale', 'status', '--json'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            status_data = json.loads(result.stdout)
            if status_data.get('BackendState') != 'Running':
                return None
            fqdn = status_data.get('Self', {}).get('DNSName', '').rstrip('.')
            if fqdn:
                return fqdn
    except Exception:
        pass
    return None


def check_url_status(url):
    try:
        response = requests.get(url, verify=False, timeout=5)
        return response.status_code == 200
    except Exception:
        return False


def get_juicefs_status():
    if not check_service_status('juicefs.service'):
        return "Not deployed"
        
    dirs_exist = check_directories()
    service_running = check_service_status('juicefs.service')

    if not dirs_exist:
        return "Not deployed"
    elif not service_running:
        return "Down"
    return "Running"


def read_storage_config():
    try:
        if not os.path.exists(COMPOSE_FILE):
            return None, None, None

        with open(COMPOSE_FILE) as f:
            data = yaml.safe_load(f)

        env_list = data["services"]["juicefs"]["environment"]

        env = {}
        for item in env_list:
            if "=" in item:
                k, v = item.split("=", 1)
                env[k.strip()] = v.strip()

        return env.get("JFS_BUCKET"), env.get("ACCESS_KEY"), env.get("SECRET_KEY")

    except Exception:
        return None, None, None


def check_bucket_connection(bucket_url, access, secret):
    try:
        bucket = bucket_url.split("/")[-1]
        endpoint = "/".join(bucket_url.split("/")[:-1])

        s3 = boto3.client(
            "s3",
            aws_access_key_id=access,
            aws_secret_access_key=secret,
            endpoint_url=endpoint,
            verify=False
        )

        s3.head_bucket(Bucket=bucket)

        return True

    except Exception:
        return False


def get_bucket_size_fast():
    """Get storage size using juicefs status from container"""
    try:
        result = subprocess.run(
            ['docker', 'exec', 'juicefs', 'juicefs', 'status', META_URL],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode != 0:
            return None

        # Parse JSON output
        data = json.loads(result.stdout)
        used_space_bytes = data.get('Stat', {}).get('UsedSpace', 0)
        
        if used_space_bytes > 0:
            # Convert bytes to GB
            used_space_gb = used_space_bytes / (1024 ** 3)
            return round(used_space_gb, 2)

        return None

    except Exception:
        return None


def main():
    status = get_juicefs_status()

    tailscale_fqdn = get_tailscale_fqdn()
    if tailscale_fqdn:
        base_hostname = tailscale_fqdn
    else:
        base_hostname = get_local_ip()

    hostname = f"https://{base_hostname}"
    api_endpoint = f"{hostname}"


    result = {
        "status": status
    }

    if status == "Running":
        bucket, access, secret = read_storage_config()

        if not bucket or not access or not secret:
            result["storage_connected"] = False
        else:
            connected = check_bucket_connection(bucket, access, secret)

            result["storage_connected"] = connected

            if connected:
                result["bucket_url"] = bucket
                size = get_bucket_size_fast()
                if size is not None:
                    result["storage_size_gb"] = size

    print(json.dumps(result))


if __name__ == "__main__":
    main()