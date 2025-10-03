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

def check_certificate_validity() -> Tuple[bool, Optional[dict]]:
    """
    Check if valid certificate exists and not expiring in next month
    Returns: (bool, cert_info)
    """
    try:
        # Get list of certificates
        cert_list = run_omv_rpc('CertificateMgmt', 'getList', 
            '{"start":0,"limit":100,"sortfield":"name","sortdir":"asc"}')
        
        if not cert_list.get('total', 0):
            print("No certificates found")
            return False, None

        print(f"Found {cert_list.get('total')} certificates")

        # Get current date and date one month from now
        now = datetime.datetime.now()
        one_month_future = now + datetime.timedelta(days=30)

        # Debug print the certificates
        for cert in cert_list.get('data', []):
            print(f"\nCertificate details:")
            print(f"Name: {cert.get('name', 'N/A')}")
            print(f"OU: {cert.get('ou', 'N/A')}")
            print(f"Valid until: {cert.get('validto', 'N/A')}")
            
            try:
                # Handle both string and integer timestamp formats
                valid_until = cert.get('validto')
                if isinstance(valid_until, int):
                    valid_until = datetime.datetime.fromtimestamp(valid_until)
                elif isinstance(valid_until, str):
                    try:
                        valid_until = datetime.datetime.strptime(valid_until, '%Y-%m-%d %H:%M:%S')
                    except ValueError:
                        print(f"Error parsing date string: {valid_until}")
                        continue
                
                if valid_until > one_month_future:
                    print(f"Certificate is valid until: {valid_until}")
                    return True, cert
                else:
                    print(f"Certificate expires soon: {valid_until}")
            except Exception as e:
                print(f"Error processing certificate date: {e}")
                continue

        print("No valid certificates found or all certificates expire within a month")
        return False, None

    except Exception as e:
        print(f"Error checking certificate validity: {e}")
        return False, None

def generate_new_certificate() -> bool:
    """Generate new certificate using omv-rpc with random 4-digit number appended to ou"""
    try:
        # Generate random 4-digit number
        random_suffix = str(random.randint(1000, 9999))
        
        params = {
            "size": 4096,
            "days": 9125,
            "c": "IN",
            "st": "BANGALORE",
            "l": "BANGALORE",
            "o": "Libernest Tech",
            "ou": f"Homecloud-{random_suffix}",  # Append random number to ou
            "cn": "homecloud",
            "email": "admin@homecloud.local"
        }
        
        # Convert params to JSON string
        params_json = json.dumps(params)
        
        print(f"Generating certificate with OU: {params['ou']}")
        result = run_omv_rpc('CertificateMgmt', 'create', params_json)
        
        # Store the random suffix for potential future use
        with open('/etc/ssl/homecloud_suffix.txt', 'w') as f:
            f.write(random_suffix)
            
        print("Successfully generated new certificate")
        
        # Deploy the certificate changes
        print("Deploying certificate changes...")
        try:
            deploy_cmd = ['omv-salt', 'deploy', 'run', 'certificates']
            subprocess.run(deploy_cmd, check=True, capture_output=True, text=True)
            print("Certificate deployment completed successfully")
        except subprocess.CalledProcessError as e:
            print(f"Error deploying certificates: {e}")
            print(f"Error output: {e.stderr}")
            return False
            
        return True
        
    except Exception as e:
        print(f"Error generating certificate: {e}")
        return False


def find_certificate_files() -> Tuple[Optional[str], Optional[str]]:
    """Find certificate and key files in /etc/ssl directories"""
    cert_dir = "/etc/ssl/certs"
    key_dir = "/etc/ssl/private"
    cert_file = None
    key_file = None

    try:
        # Try to read the stored suffix if it exists
        stored_suffix = None
        if os.path.exists('/etc/ssl/homecloud_suffix.txt'):
            with open('/etc/ssl/homecloud_suffix.txt', 'r') as f:
                stored_suffix = f.read().strip()

        # Look for certificate with stored suffix first
        if stored_suffix:
            cert_pattern = f"Homecloud-{stored_suffix}"
            print(f"Looking for certificate with OU: {cert_pattern}")
            
            # Use openssl to check certificates for matching OU
            for file in os.listdir(cert_dir):
                if file.endswith('.crt'):
                    try:
                        cmd = ['openssl', 'x509', '-in', os.path.join(cert_dir, file), 
                              '-noout', '-subject']
                        result = subprocess.run(cmd, capture_output=True, text=True)
                        if cert_pattern in result.stdout:
                            cert_file = os.path.join(cert_dir, file)
                            # Look for matching key
                            key_name = file.replace('.crt', '.key')
                            if os.path.exists(os.path.join(key_dir, key_name)):
                                key_file = os.path.join(key_dir, key_name)
                                break
                    except Exception:
                        continue

        # If not found with stored suffix, look for any homecloud certificate
        if not cert_file:
            for file in os.listdir(cert_dir):
                if "homecloud" in file.lower() and file.endswith('.crt'):
                    cert_file = os.path.join(cert_dir, file)
                    # Look for matching key
                    key_name = file.replace('.crt', '.key')
                    if os.path.exists(os.path.join(key_dir, key_name)):
                        key_file = os.path.join(key_dir, key_name)
                        break

        if cert_file and key_file:
            print(f"Found certificate: {cert_file}")
            print(f"Found key: {key_file}")
        else:
            print("Could not find matching certificate and key files")

        return cert_file, key_file

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
    # Check if valid certificate exists
    valid_cert, cert_info = check_certificate_validity()

    # Generate new certificate if needed
    if not valid_cert:
        print("Generating new certificate...")
        if not generate_new_certificate():
            print("Failed to generate new certificate")
            return

    # Find certificate files
    cert_file, key_file = find_certificate_files()
    
    if cert_file and key_file:
        # Set environment variables
        set_environment_variables(cert_file, key_file)
    else:
        print("Could not locate certificate files")

if __name__ == "__main__":
    main()
