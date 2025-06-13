import json
import subprocess
import os
from datetime import datetime
import shutil
import requests
from pathlib import Path

def get_tailscale_status():
    try:
        cmd = ["omv-rpc", "-u", "admin", "Homecloud", "getTailscaleStatus"]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return json.loads(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Error getting Tailscale status: {e}")
        return None

def check_certificate_expiry(cert_path):
    try:
        cmd = ["openssl", "x509", "-enddate", "-noout", "-in", cert_path]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        expiry_str = result.stdout.strip().split('=')[1]
        # Changed format string to match 'Apr 28 14:53:03 2025 GMT'
        expiry_date = datetime.strptime(expiry_str, '%b %d %H:%M:%S %Y GMT')
        days_remaining = (expiry_date - datetime.now()).days
        return days_remaining
    except subprocess.CalledProcessError as e:
        print(f"Error checking certificate expiry: {e}")
        return None


def renew_certificate(hostname):
    try:
        cmd = ["tailscale", "cert", hostname]
        subprocess.run(cmd, check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error renewing certificate: {e}")
        return False

def move_certificate_files(hostname):
    try:
        # Define paths
        current_cert = f"{hostname}.crt"
        current_key = f"{hostname}.key"
        cert_dest = f"/etc/ssl/certs/{hostname}.crt"
        key_dest = f"/etc/ssl/private/{hostname}.key"

        # Move certificate and key files
        shutil.move(current_cert, cert_dest)
        shutil.move(current_key, key_dest)
        return True
    except Exception as e:
        print(f"Error moving certificate files: {e}")
        return False

def update_traefik_config(hostname):
    try:
        url = "https://127.0.0.1:5000/update_traefik_config"
        params = {
            "cert_file": f"/etc/ssl/certs/{hostname}.crt",
            "key_file": f"/etc/ssl/private/{hostname}.key"
        }
        response = requests.post(url, params=params, verify=False)
        response.raise_for_status()
        return True
    except requests.RequestException as e:
        print(f"Error updating Traefik configuration: {e}")
        return False

def main():
    # Get Tailscale status
    status = get_tailscale_status()
    if not status or status.get('status') != 'Up':
        print("Tailscale is not running")
        return

    hostname = status.get('hostname')
    if not hostname:
        print("Hostname not found in Tailscale status")
        return

    cert_path = f"/etc/ssl/certs/{hostname}.crt"
    
    # Check if certificate exists
    if not Path(cert_path).exists():
        print(f"Certificate not found: {cert_path}")
        should_renew = True
    else:
        # Check certificate expiry
        days_remaining = check_certificate_expiry(cert_path)
        if days_remaining is None:
            print("Failed to check certificate expiry")
            return
        
        should_renew = days_remaining <= 15
        if not should_renew:
            print(f"Certificate is still valid for {days_remaining} days")
            return

    # Renew certificate if needed
    if should_renew:
        print("Renewing certificate...")
        if not renew_certificate(hostname):
            print("Failed to renew certificate")
            return

        print("Moving certificate files...")
        if not move_certificate_files(hostname):
            print("Failed to move certificate files")
            return

        print("Updating Traefik configuration...")
        if not update_traefik_config(hostname):
            print("Failed to update Traefik configuration")
            return

        print("Certificate renewal process completed successfully")

if __name__ == "__main__":
    main()
