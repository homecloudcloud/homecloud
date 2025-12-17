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

def get_environment_variable_uuid():
    try:
        command = ['/usr/sbin/omv-env get OMV_CONFIGOBJECT_NEW_UUID']
        process = subprocess.run(command, text=True, check=True, shell=True, capture_output=True)
        if process.returncode != 0:
            return None
        else:
            a = process.stdout.split("=")
            uuid = a[1]
            uuid = uuid.replace("\n", "")
            return uuid
    except:
        return False

def manage_omv_certificate(hostname):
    try:
        # Read certificate and private key files
        with open(f"{hostname}.crt", 'r') as f:
            cert_content = f.read()
        with open(f"{hostname}.key", 'r') as f:
            key_content = f.read()
        
        # Get list of existing certificates
        cert_list_cmd = ['omv-rpc', '-u', 'admin', 'CertificateMgmt', 'getList', 
                       '{"start":0,"limit":-1,"sortdir":"ASC"}']
        cert_list_result = subprocess.run(cert_list_cmd, capture_output=True, text=True)
        
        if cert_list_result.returncode == 0:
            cert_list_data = json.loads(cert_list_result.stdout)
            
            # Delete existing tailscale certificate if found
            deleted_cert = False
            for cert in cert_list_data.get('data', []):
                if cert.get('comment') == 'tailscale':
                    print(f"Deleting existing tailscale certificate: {cert['uuid']}")
                    delete_cmd = ['omv-rpc', '-u', 'admin', 'CertificateMgmt', 'delete', 
                                f'{{"uuid":"{cert["uuid"]}"}}']  
                    subprocess.run(delete_cmd, check=True)
                    deleted_cert = True
            
            if deleted_cert:
                print("Applying certificate changes...")
                subprocess.run(['omv-salt', 'deploy', 'run', 'certificates'], check=True)
            
            # Install new certificate
            print("Installing new tailscale certificate")
            new_uuid = get_environment_variable_uuid()
            if not new_uuid:
                print("Failed to generate UUID for certificate")
                return False
            
            cert_data = {
                "uuid": new_uuid,
                "certificate": cert_content,
                "privatekey": key_content,
                "comment": "tailscale"
            }
            
            install_cmd = ['omv-rpc', '-u', 'admin', 'CertificateMgmt', 'set', 
                         json.dumps(cert_data)]
            install_result = subprocess.run(install_cmd, capture_output=True, text=True)
            
            if install_result.returncode == 0:
                print("Applying certificate changes...")
                subprocess.run(['omv-salt', 'deploy', 'run', 'certificates'], check=True)
                
                # Verify certificate installation by getting updated list
                verify_result = subprocess.run(cert_list_cmd, capture_output=True, text=True)
                if verify_result.returncode == 0:
                    verify_data = json.loads(verify_result.stdout)
                    
                    # Find the tailscale certificate in the updated list
                    for cert in verify_data.get('data', []):
                        if cert.get('comment') == 'tailscale':
                            actual_uuid = cert['uuid']
                            print(f"Certificate installed successfully with UUID: {actual_uuid}")
                            
                            # Clean up temporary certificate files
                            os.remove(f"{hostname}.crt")
                            os.remove(f"{hostname}.key")
                            
                            return actual_uuid
                    
                    print("Failed to verify certificate installation")
                    return False
                else:
                    print("Failed to verify certificate installation")
                    return False
            else:
                print(f"Failed to install certificate: {install_result.stderr}")
                return False
        else:
            print(f"Failed to get certificate list: {cert_list_result.stderr}")
            return False
            
    except Exception as e:
        print(f"Error managing OMV certificate: {str(e)}")
        return False

def update_traefik_config(cert_uuid):
    try:
        url = "https://127.0.0.1:5000/update_traefik_config"
        params = {
            "cert_file": f"/etc/ssl/certs/openmediavault-{cert_uuid}.crt",
            "key_file": f"/etc/ssl/private/openmediavault-{cert_uuid}.key"
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

    hostname = hostname.rstrip('.')
    
    # Get OMV certificates and look for tailscale certificate
    try:
        cert_list_cmd = ['omv-rpc', '-u', 'admin', 'CertificateMgmt', 'getList', 
                       '{"start":0,"limit":-1,"sortdir":"ASC"}']
        cert_list_result = subprocess.run(cert_list_cmd, capture_output=True, text=True)
        
        should_renew = True
        if cert_list_result.returncode == 0:
            cert_list_data = json.loads(cert_list_result.stdout)
            
            # Look for tailscale certificate that matches hostname
            for cert in cert_list_data.get('data', []):
                if (cert.get('comment') == 'tailscale' and 
                    hostname in cert.get('name', '')):
                    uuid = cert['uuid']
                    cert_path = f"/etc/ssl/certs/openmediavault-{uuid}.crt"
                    
                    if os.path.exists(cert_path):
                        # Check certificate expiry
                        days_remaining = check_certificate_expiry(cert_path)
                        if days_remaining is not None and days_remaining > 15:
                            print(f"Certificate is still valid for {days_remaining} days")
                            should_renew = False
                        break
        
        if should_renew:
            print("Renewing certificate...")
            if not renew_certificate(hostname):
                print("Failed to renew certificate")
                return

            print("Managing OMV certificate...")
            cert_uuid = manage_omv_certificate(hostname)
            if not cert_uuid:
                print("Failed to manage OMV certificate")
                return

            print("Updating Traefik configuration...")
            if not update_traefik_config(cert_uuid):
                print("Failed to update Traefik configuration")
                return

            print("Certificate renewal process completed successfully")
            
    except Exception as e:
        print(f"Error checking OMV tailscale certificate: {str(e)}")
        return

if __name__ == "__main__":
    main()
