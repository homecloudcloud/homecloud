#!/usr/bin/env python3

import json
import subprocess
import os
import requests
from urllib3.exceptions import InsecureRequestWarning

# Disable SSL warnings
requests.packages.urllib3.disable_warnings(category=InsecureRequestWarning)

def check_service_status(service_name):
    """Check if a systemd service exists and is running"""
    try:
        # First check if service exists
        exists = subprocess.run(['systemctl', 'list-unit-files', service_name],
                              capture_output=True, text=True)
        if exists.returncode != 0:
            return False
            
        # If service exists, check if it's active
        result = subprocess.run(['systemctl', 'is-active', service_name], 
                              capture_output=True, text=True)
        return result.stdout.strip() == 'active'
    except Exception:
        return False

def check_tailscale_service_status(service_name):
    try:
        result = subprocess.run(["systemctl", "status", service_name], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        #print(f"Service '{service_name}' status:\n{result.stdout}")
        for line in result.stdout.split("\n"):
            if "Active:" in line:
                short_status = line.split(":")[1].strip()
                short_1_status = short_status.split('(', 1)
                #print(f"Service '{service_name}' status: {short_status}\n{short_1_status[0]}")
                #return short_1_status[0]
                if "active" in short_1_status[0]:
                    for line in result.stdout.split("\n"):
                        if "Status:" in line:
                            if "Connected" in line:
                                return True
                            else:
                                return False
        return False
    except subprocess.CalledProcessError as e:
        return False

def check_directories():
    """Check if required directories exist"""
    required_dirs = ['/var/lib/duplicati', '/etc/duplicati']
    return all(os.path.isdir(dir) for dir in required_dirs)

def get_local_ip():
    """Get local IP address"""
    try:
        # Try using ip route
        cmd = "ip route get 1 2>/dev/null | awk '{print $7; exit}' | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$'"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.stdout.strip():
            return result.stdout.strip()

        # Try using hostname -I
        result = subprocess.run(['hostname', '-I'], capture_output=True, text=True)
        if result.stdout.strip():
            return result.stdout.strip().split()[0]

        return '127.0.0.1'
    except Exception:
        return '127.0.0.1'

def get_tailscale_fqdn():
    """Get Tailscale FQDN if available"""
    try:
        # Check if tailscale is installed and running
        if not check_tailscale_service_status('tailscaled.service'):
            return None

        # Get tailscale status in JSON format
        result = subprocess.run(['tailscale', 'status', '--json'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            status_data = json.loads(result.stdout)
            # Check BackendState first
            if status_data.get('BackendState') != 'Running':
                return None
            fqdn = status_data.get('Self', {}).get('DNSName', '').rstrip('.')
            if fqdn:
                return fqdn
    except Exception:
        pass
    return None

def check_url_status(url):
    """Check URL status code ignoring SSL verification"""
    try:
        #print(f"checking url status of {url}")
        response = requests.get(url, verify=False, timeout=5)
        #print(f"Response: {response}")
        return response.status_code == 200
    except Exception:
        return False

def get_duplicati_status():
    """Determine duplicati status based on service and directories"""
    # First check if service exists by checking service status
    if not check_service_status('duplicati.service'):
        return "Not deployed"
        
    dirs_exist = check_directories()
    service_running = check_service_status('duplicati.service')

    if not dirs_exist:
        return "Not deployed"
    elif not service_running:
        return "Down"
    return "Running"



def main():
    # Get initial status
    status = get_duplicati_status()
    
    # Get hostname
    #print(f"waiting for tailscale_fqdn")
    tailscale_fqdn = get_tailscale_fqdn()
    #print(f"tailscale_fqdn:{tailscale_fqdn}")
    if tailscale_fqdn:
        base_hostname = tailscale_fqdn
    else:
        #print(f"waiting for get_local_ip")
        base_hostname = get_local_ip()

    # Format hostname and API endpoint
    hostname = f"https://{base_hostname}:8200"
    api_endpoint = f"{hostname}"

    # Check URL status if service is running
    if status == "Running":
        if not check_url_status(hostname):
            status = "Starting"

    # Prepare result
    result = {
        "status": status,
        "hostname": hostname,
        "api_endpoint": api_endpoint
    }

    # Output JSON
    print(json.dumps(result))

if __name__ == "__main__":
    main()

