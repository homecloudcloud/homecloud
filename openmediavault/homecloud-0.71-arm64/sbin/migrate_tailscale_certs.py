#!/usr/bin/env python3
import json
import subprocess
import os
import sys
from datetime import datetime
import requests

def run_omv_rpc(command: str, method: str, params: str):
    """Execute omv-rpc command and return JSON response"""
    try:
        cmd = ['omv-rpc', '-u', 'admin', command, method, params]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return json.loads(result.stdout)
    except:
        return None

def get_environment_variable_uuid():
    try:
        command = ['/usr/sbin/omv-env get OMV_CONFIGOBJECT_NEW_UUID']
        process = subprocess.run(command, text=True, check=True, shell=True, capture_output=True)
        if process.returncode != 0:
            return None
        a = process.stdout.split("=")
        uuid = a[1].replace("\n", "")
        return uuid
    except:
        return None

def check_tailscale_certificates():
    """Check if tailscale certificates already exist in OMV"""
    cert_list = run_omv_rpc('CertificateMgmt', 'getList', '{"start":0,"limit":-1,"sortdir":"ASC"}')
    if not cert_list:
        return False
    
    for cert in cert_list.get('data', []):
        if cert.get('comment') == 'tailscale':
            return True
    return False

def get_tailscale_status():
    """Get tailscale status"""
    try:
        result = subprocess.run(['tailscale', 'status'], capture_output=True, text=True)
        if 'Logged out' in result.stdout:
            return 'Logged out'
        elif 'Stopped' in result.stdout:
            return 'Stopped'
        else:
            # Check if actually up by getting hostname
            hostname_result = subprocess.run(['tailscale', 'status', '--json'], capture_output=True, text=True)
            if hostname_result.returncode == 0:
                status_data = json.loads(hostname_result.stdout)
                if status_data.get('Self', {}).get('Online'):
                    return 'Up'
        return 'Stopped'
    except:
        return 'Logged out'

def get_tailscale_hostname():
    """Get tailscale hostname"""
    try:
        result = subprocess.run(['tailscale', 'status', '--json'], capture_output=True, text=True, check=True)
        status_data = json.loads(result.stdout)
        hostname = status_data.get('Self', {}).get('DNSName', '')
        return hostname.rstrip('.')
    except:
        return None

def check_certificate_validity(cert_path):
    """Check if certificate is valid (not expired)"""
    try:
        cmd = ["openssl", "x509", "-enddate", "-noout", "-in", cert_path]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        expiry_str = result.stdout.strip().split('=')[1]
        expiry_date = datetime.strptime(expiry_str, '%b %d %H:%M:%S %Y %Z')
        return expiry_date > datetime.now()
    except:
        return False

def import_tailscale_certificate(cert_path, key_path):
    """Import tailscale certificate to OMV"""
    try:
        # Read certificate and key files
        with open(cert_path, 'r') as f:
            cert_content = f.read()
        with open(key_path, 'r') as f:
            key_content = f.read()
        
        # Generate new UUID
        new_uuid = get_environment_variable_uuid()
        if not new_uuid:
            return None
        
        # Create certificate data
        cert_data = {
            "uuid": new_uuid,
            "certificate": cert_content,
            "privatekey": key_content,
            "comment": "tailscale"
        }
        
        # Install certificate
        install_cmd = ['omv-rpc', '-u', 'admin', 'CertificateMgmt', 'set', json.dumps(cert_data)]
        install_result = subprocess.run(install_cmd, capture_output=True, text=True)
        
        if install_result.returncode == 0:
            # Apply certificate changes
            subprocess.run(['omv-salt', 'deploy', 'run', 'certificates'], check=True)
            
            # Verify installation
            cert_list = run_omv_rpc('CertificateMgmt', 'getList', '{"start":0,"limit":-1,"sortdir":"ASC"}')
            if cert_list:
                for cert in cert_list.get('data', []):
                    if cert.get('comment') == 'tailscale':
                        return cert['uuid']
        return None
    except:
        return None

def update_traefik_config(cert_uuid):
    """Update Traefik configuration with new certificate paths"""
    try:
        url = "https://127.0.0.1:5000/update_traefik_config"
        params = {
            "cert_file": f"/etc/ssl/certs/openmediavault-{cert_uuid}.crt",
            "key_file": f"/etc/ssl/private/openmediavault-{cert_uuid}.key"
        }
        requests.post(url, params=params, verify=False, timeout=10)
    except:
        pass

def bring_tailscale_up():
    """Try to bring tailscale up"""
    try:
        result = subprocess.run(['tailscale', 'up'], capture_output=True, text=True, timeout=30)
        return result.returncode == 0
    except:
        return False

def tailscale_logout():
    """Logout from tailscale"""
    try:
        subprocess.run(['tailscale', 'logout'], capture_output=True, text=True)
    except:
        pass

def main():
    try:
        # Check if migration has already been completed
        migration_marker = '/var/lib/openmediavault/.tailscale_cert_migrated'
        if os.path.exists(migration_marker):
            print("Tailscale certificate migration already completed")
            sys.exit(0)
        
        # Check if tailscale certificates already exist in OMV
        if check_tailscale_certificates():
            print("Tailscale certificates already exist in OMV")
            # Create marker file to prevent future runs
            try:
                os.makedirs('/var/lib/openmediavault', exist_ok=True)
                with open(migration_marker, 'w') as f:
                    f.write('migrated')
            except:
                pass
            sys.exit(0)
        
        # Check tailscale status
        status = get_tailscale_status()
        
        if status == 'Logged out':
            print("Tailscale not configured")
            sys.exit(0)
        
        hostname = None
        
        if status == 'Up':
            hostname = get_tailscale_hostname()
        elif status == 'Stopped':
            # Try to bring tailscale up
            if bring_tailscale_up():
                hostname = get_tailscale_hostname()
            else:
                # Unable to bring up, logout and exit
                tailscale_logout()
                print("Unable to bring tailscale up, logged out")
                sys.exit(0)
        
        if not hostname:
            print("Could not get tailscale hostname")
            sys.exit(0)
        
        # Check if certificate files exist
        cert_path = f"/etc/ssl/certs/{hostname}.crt"
        key_path = f"/etc/ssl/private/{hostname}.key"
        
        if not (os.path.exists(cert_path) and os.path.exists(key_path)):
            print("Tailscale certificate files not found")
            # Create marker to prevent future attempts
            try:
                os.makedirs('/var/lib/openmediavault', exist_ok=True)
                with open(migration_marker, 'w') as f:
                    f.write('no_files_found')
            except:
                pass
            sys.exit(0)
        
        # Check if certificate is valid
        if not check_certificate_validity(cert_path):
            print("Tailscale certificate is not valid")
            sys.exit(0)
        
        # Import certificate to OMV
        cert_uuid = import_tailscale_certificate(cert_path, key_path)
        if cert_uuid:
            print("Successfully imported tailscale certificate to OMV")
            
            # Remove original certificate files only after successful import
            try:
                os.remove(cert_path)
                os.remove(key_path)
                print("Removed original certificate files")
            except:
                pass
            
            # Update Traefik configuration
            update_traefik_config(cert_uuid)
            print("Updated Traefik configuration")
            
            # Create marker file to indicate successful migration
            try:
                os.makedirs('/var/lib/openmediavault', exist_ok=True)
                with open(migration_marker, 'w') as f:
                    f.write('migrated')
            except:
                pass
        else:
            print("Failed to import tailscale certificate")
        
        sys.exit(0)
        
    except Exception as e:
        print(f"Migration completed with warnings: {e}")
        sys.exit(0)

if __name__ == "__main__":
    main()