#!/usr/bin/python3
import json
import subprocess
import sys
from typing import Dict, Any

def check_tailscale_status() -> bool:
    """Check Tailscale VPN status using omv-rpc"""
    try:
        cmd = ["omv-rpc", "-u", "admin", "Homecloud", "getTailscaleStatus"]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        status = json.loads(result.stdout)
        
        if isinstance(status, dict):
            # Check for 'response' in response
            if 'response' in status:
                return status['response'].lower() == 'up'
            # Check direct status
            elif 'running' in status:
                return status['running'].lower() == 'up'
            # Check any value in the dict
            else:
                for value in status.values():
                    if isinstance(value, str) and value.lower() == 'up':
                        return True
        elif isinstance(status, str):
            return status.lower() == 'up'
        
        return False
    except Exception as e:
        return False

def disable_funnel(source_port: int, destination_port: int) -> Dict[str, Any]:
    """Disable Tailscale funnel for specified ports and perform additional tasks"""
    try:
        # Disable the funnel
        cmd = [
            "tailscale", "funnel",
            "--bg",
            "--tcp", str(source_port),
            f"tcp://localhost:{destination_port}",
            "off"
        ]
        
        print(f"Running command: {' '.join(cmd)}")
        sys.stdout.flush()
        result = subprocess.run(cmd, text=True, timeout=60)
        
        print(f"Command completed with exit code: {result.returncode}")
        sys.stdout.flush()
        
        if result.returncode != 0:
            return {
                "status": "Error",
                "message": f"Tailscale funnel command failed with exit code {result.returncode}",
                "source_port": source_port,
                "destination_port": destination_port
            }
        #paperless env file update
        if destination_port == 8000:
            try:
                update_response = subprocess.run(
                    ["curl", "--insecure", "--request", "POST", 
                    "https://127.0.0.1:5000/update_paperless-ngx_env"],
                    capture_output=True,
                    text=True,
                    check=True
                )
                if update_response.returncode != 0:
                    return {
                        "status": "Error",
                        "message": f"Funnel disabled but failed to update paperless env file: {update_response.stderr}",
                        "source_port": source_port,
                        "destination_port": destination_port
                    }
            except subprocess.CalledProcessError as e:
                return {
                    "status": "Error",
                    "message": f"Funnel disabled but failed to update paperless env: {str(e)}",
                    "source_port": source_port,
                    "destination_port": destination_port
                }
        else:
        # Update immich.json file
            try:
                update_response = subprocess.run(
                    ["curl", "--insecure", "--request", "POST", 
                    "https://127.0.0.1:5000/update_immich_JSON"],
                    capture_output=True,
                    text=True,
                    check=True
                )
                if update_response.returncode != 0:
                    return {
                        "status": "Error",
                        "message": f"Funnel disabled but failed to update immich.json: {update_response.stderr}",
                        "source_port": source_port,
                        "destination_port": destination_port
                    }
            except subprocess.CalledProcessError as e:
                return {
                    "status": "Error",
                    "message": f"Funnel disabled but failed to update immich.json: {str(e)}",
                    "source_port": source_port,
                    "destination_port": destination_port
                }

        # Restart service
        if destination_port == 8000:
            try:
                service_result = subprocess.run(
                    ["systemctl", "restart", "paperless.service"],
                    capture_output=True,
                    text=True,
                    check=True
                )
                if service_result.returncode != 0:
                    return {
                        "status": "Error",
                        "message": f"Funnel disabled and paperless env updated updated, but failed to restart service: {service_result.stderr}",
                        "source_port": source_port,
                        "destination_port": destination_port
                    }
            except subprocess.CalledProcessError as e:
                return {
                    "status": "Error",
                    "message": f"Funnel disabled and paperless env updated, but failed to restart service: {str(e)}",
                    "source_port": source_port,
                    "destination_port": destination_port
                }

            return {
                "status": "Success",
                "message": "Non-VPN Internet access for this app disabled successfully. It will take few minutes for paperless to start. You may need to restart paperless app installed on your phone.",
                "source_port": source_port,
                "destination_port": destination_port
            }
        else:
            try:
                service_result = subprocess.run(
                    ["systemctl", "restart", "immich.service"],
                    capture_output=True,
                    text=True,
                    check=True
                )
                if service_result.returncode != 0:
                    return {
                        "status": "Error",
                        "message": f"Funnel disabled and immich json updated, but failed to restart service: {service_result.stderr}",
                        "source_port": source_port,
                        "destination_port": destination_port
                    }
            except subprocess.CalledProcessError as e:
                return {
                    "status": "Error",
                    "message": f"Funnel disabled and immich json updated, but failed to restart service: {str(e)}",
                    "source_port": source_port,
                    "destination_port": destination_port
                }

            return {
                "status": "Success",
                "message": "Non-VPN Internet access for this app disabled successfully. It will take few minutes for Immich to start. You may need to restart Immich app installed on your phone.",
                "source_port": source_port,
                "destination_port": destination_port
            }
            
    except subprocess.TimeoutExpired:
        return {
            "status": "Error",
            "message": "Tailscale funnel command timed out after 30 seconds",
            "source_port": source_port,
            "destination_port": destination_port
        }
    except subprocess.CalledProcessError as e:
        return {
            "status": "Error",
            "message": f"Failed to disable funnel: {str(e)}",
            "source_port": source_port,
            "destination_port": destination_port
        }
    except Exception as e:
        return {
            "status": "Error",
            "message": f"Exception while disabling funnel: {str(e)}",
            "source_port": source_port,
            "destination_port": destination_port
        }


def main() -> None:
    # Check if correct number of arguments provided
    if len(sys.argv) != 3:
        result = {
            "status": "Error",
            "message": "Usage: script.py source_port destination_port"
        }
        print(json.dumps(result, indent=2))
        sys.exit(1)
    
    try:
        # Parse port numbers
        source_port = int(sys.argv[1])
        destination_port = int(sys.argv[2])
        
        # Check if ports are valid
        if not (0 < source_port < 65536 and 0 < destination_port < 65536):
            result = {
                "status": "Error",
                "message": "Ports must be between 1 and 65535"
            }
            print(json.dumps(result, indent=2))
            sys.exit(1)
        
        # Check Tailscale status
        if not check_tailscale_status():
            result = {
                "status": "Error",
                "message": "Tailscale VPN is not running"
            }
            print(json.dumps(result, indent=2))
            sys.exit(1)
        
        # Disable funnel
        result = disable_funnel(source_port, destination_port)
        print(json.dumps(result, indent=2))
        
        # Exit with appropriate status code
        sys.exit(0 if result["status"] == "Success" else 1)
        
    except ValueError:
        result = {
            "status": "Error",
            "message": "Ports must be valid integers"
        }
        print(json.dumps(result, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()
