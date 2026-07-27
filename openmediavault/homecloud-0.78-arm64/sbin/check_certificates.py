import json
import subprocess
import datetime
import os
from typing import Tuple, Optional
import random

def run_omv_rpc(command: str, method: str, params: str) -> dict:
    """Execute omv-rpc command and return JSON response"""
    try:
        cmd = ['omv-rpc', '-u', 'admin', command, method, params]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return json.loads(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Error executing omv-rpc: {e}")
        raise
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON response: {e}")
        raise

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

def manage_libernest_certificates() -> bool:
    """
    Check for Libernest certificates and manage them:
    - If multiple exist, delete all but one
    - If any expire within 30 days, renew
    Returns: True if certificate was renewed, False otherwise
    """
    try:
        # Get list of certificates
        cert_list = run_omv_rpc('CertificateMgmt', 'getList', 
            '{"start":0,"limit":-1,"sortdir":"ASC"}')
        
        if not cert_list.get('total', 0):
            print("No certificates found")
            return False

        print(f"Found {cert_list.get('total')} certificates")

        # Get current time and 30 days from now
        current_time = datetime.datetime.now().timestamp()
        thirty_days_future = current_time + (30 * 24 * 60 * 60)

        # Find all Libernest certificates
        libernest_certs = []
        for cert in cert_list.get('data', []):
            cert_name = cert.get('name', '')
            if 'Libernest' in cert_name:
                libernest_certs.append(cert)
        
        if not libernest_certs:
            print("No Libernest certificates found")
            return False
        
        print(f"Found {len(libernest_certs)} Libernest certificates")
        
        # If multiple Libernest certificates, delete all but the first one
        if len(libernest_certs) > 1:
            print("Multiple Libernest certificates found, deleting extras...")
            for cert in libernest_certs[1:]:
                print(f"Deleting extra Libernest certificate: {cert['uuid']}")
                delete_cmd = ['omv-rpc', '-u', 'admin', 'CertificateMgmt', 'delete', 
                            f'{{"uuid":"{cert["uuid"]}"}}']  
                subprocess.run(delete_cmd, check=True)
            
            # Apply changes after deletions
            print("Applying certificate changes...")
            subprocess.run(['omv-salt', 'deploy', 'run', 'certificates'], check=True)
        
        # Check if remaining certificate expires within 30 days
        remaining_cert = libernest_certs[0]
        print(f"\nChecking remaining Libernest certificate:")
        print(f"Name: {remaining_cert.get('name')}")
        print(f"UUID: {remaining_cert.get('uuid')}")
        
        try:
            valid_until = int(remaining_cert.get('validto', 0))
            
            if valid_until <= thirty_days_future:
                print(f"Certificate expires within 30 days, renewing...")
                return renew_libernest_certificate(remaining_cert)
            else:
                print(f"Certificate is valid for more than 30 days")
                return False
                
        except Exception as e:
            print(f"Error processing certificate date: {e}")
            return False

    except Exception as e:
        print(f"Error managing certificates: {e}")
        return False

def renew_libernest_certificate(old_cert: dict) -> bool:
    """Delete old Libernest certificate and create new one"""
    try:
        # Delete existing certificate
        print(f"Deleting existing Libernest certificate: {old_cert['uuid']}")
        delete_cmd = ['omv-rpc', '-u', 'admin', 'CertificateMgmt', 'delete', 
                    f'{{"uuid":"{old_cert["uuid"]}"}}']  
        subprocess.run(delete_cmd, check=True)
        
        # Apply certificate changes after deletion
        print("Applying certificate changes...")
        subprocess.run(['omv-salt', 'deploy', 'run', 'certificates'], check=True)
        
        # Generate random 4-digit number for new certificate
        random_suffix = str(random.randint(1000, 9999))
        
        # Generate new UUID
        new_uuid = get_environment_variable_uuid()
        if not new_uuid:
            print("Failed to generate UUID for certificate")
            return False
        
        # Create new certificate data
        cert_data = {
            "uuid": new_uuid,
            "size": 4096,
            "days": 9125,
            "c": "IN",
            "st": "BANGALORE", 
            "l": "BANGALORE",
            "o": "Libernest Tech",
            "ou": f"Homecloud-{random_suffix}",
            "cn": "homecloud",
            "email": "admin@homecloud.local"
        }
        
        print(f"Creating new Libernest certificate with OU: {cert_data['ou']}")
        install_cmd = ['omv-rpc', '-u', 'admin', 'CertificateMgmt', 'create', 
                     json.dumps(cert_data)]
        install_result = subprocess.run(install_cmd, capture_output=True, text=True)
        
        if install_result.returncode == 0:
            print("Applying certificate changes...")
            subprocess.run(['omv-salt', 'deploy', 'run', 'certificates'], check=True)
            print("Successfully renewed Libernest certificate")
            return True
        else:
            print(f"Failed to create certificate: {install_result.stderr}")
            return False
            
    except Exception as e:
        print(f"Error renewing certificate: {e}")
        return False


def find_certificate_files() -> Tuple[Optional[str], Optional[str]]:
    """Find Libernest certificate files using omv-rpc"""
    try:
        # Get list of certificates
        cert_list = run_omv_rpc('CertificateMgmt', 'getList', 
            '{"start":0,"limit":-1,"sortdir":"ASC"}')
        
        if not cert_list.get('total', 0):
            print("No certificates found")
            return None, None

        # Look for Libernest certificate
        for cert in cert_list.get('data', []):
            cert_name = cert.get('name', '')
            if 'Libernest' in cert_name:
                uuid = cert['uuid']
                cert_file = f"/etc/ssl/certs/openmediavault-{uuid}.crt"
                key_file = f"/etc/ssl/private/openmediavault-{uuid}.key"
                
                # Check if files exist
                if os.path.exists(cert_file) and os.path.exists(key_file):
                    print(f"Found Libernest certificate: {cert_file}")
                    print(f"Found Libernest key: {key_file}")
                    return cert_file, key_file

        print("Could not find Libernest certificate files")
        return None, None

    except Exception as e:
        print(f"Error finding certificate files: {e}")
        return None, None


def set_environment_variables(cert_file: str, key_file: str):
    """Set system-wide environment variables for certificate paths"""
    try:
        # Set environment variables
        os.environ['SSL_CERT_FILE'] = cert_file
        os.environ['SSL_KEY_FILE'] = key_file

        # Also write to /etc/environment for system-wide persistence
        with open('/etc/environment', 'w') as f:
            f.write(f'\nSSL_CERT_FILE="{cert_file}"\n')
            f.write(f'SSL_KEY_FILE="{key_file}"\n')

        print(f"Environment variables set successfully")
        print(f"Certificate file: {cert_file}")
        print(f"Key file: {key_file}")
        
    except Exception as e:
        print(f"Error setting environment variables: {e}")

def main():
    # Manage Libernest certificates
    cert_renewed = manage_libernest_certificates()
    
    if cert_renewed:
        print("Certificate renewal completed successfully")
        
        # Set environment variables after renewal
        cert_file, key_file = find_certificate_files()
        if cert_file and key_file:
            set_environment_variables(cert_file, key_file)
        else:
            print("Could not locate certificate files for environment variables")
    else:
        print("No certificate renewal needed")

if __name__ == "__main__":
    main()
