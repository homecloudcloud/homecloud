#!/usr/bin/env python3

import json
import subprocess
import yaml
from packaging import version
from typing import Dict, Tuple, Optional

def run_command(cmd: list) -> Tuple[int, str, str]:
    """Run command and return returncode, stdout, stderr"""
    try:
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        stdout, stderr = process.communicate()
        return process.returncode, stdout.strip(), stderr.strip()
    except Exception as e:
        return 1, "", str(e)

def get_service_status() -> Dict:
    """Get Joplin service status"""
    try:
        cmd = ["omv-rpc", "-u", "admin", "Homecloud", "getJoplinServiceStatus"]
        returncode, stdout, stderr = run_command(cmd)
        if returncode == 0:
            return json.loads(stdout)
        raise Exception(f"Failed to get service status: {stderr}")
    except Exception as e:
        return {"status": "Error", "error": str(e)}

def get_deployed_version() -> Optional[str]:
    """Get deployed version from docker-compose.yml"""
    try:
        with open("/etc/joplin/docker-compose.yml", "r") as f:
            config = yaml.safe_load(f)
            image = config['services']['app']['image']
            return image.split(":")[-1]
    except Exception as e:
        print(f"Error reading deployed version: {e}")
        return None

def get_available_version() -> Optional[str]:
    """Get latest available version"""
    try:
        cmd = ["omv-rpc", "-u", "admin", "Homecloud", "joplin_get_latest_version"]
        returncode, stdout, stderr = run_command(cmd)
        if returncode == 0:
            return json.loads(stdout)["version"]
        raise Exception(f"Failed to get latest version: {stderr}")
    except Exception as e:
        print(f"Error getting latest version: {e}")
        return None

def compare_versions(deployed: str, available: str) -> str:
    """Compare versions and return status"""
    try:
        # Extract version numbers, removing architecture prefixes
        def extract_version(version_str):
            # Remove architecture prefix (e.g., "arm64-" or "amd64-")
            if '-' in version_str:
                parts = version_str.split('-', 1)
                if len(parts) > 1:
                    return parts[1]  # Return version part after first dash
            return version_str
        
        deployed_clean = extract_version(deployed)
        available_clean = extract_version(available)
        
        if version.parse(available_clean) > version.parse(deployed_clean):
            return "Update-Available"
        return "No-Updates"
    except Exception as e:
        print(f"Error comparing versions: {e}")
        return "Error"


def main():
    result = {
        "status": "",
        "available_version": "",
        "deployed_version": ""
    }

    # Check service status
    service_status = get_service_status()
    if service_status.get("status") not in ["Running", "Starting", "Down"]:
        result["status"] = "Not deployed"
        print(json.dumps(result))
        return
    
    # Get deployed version
    deployed_version = get_deployed_version()
    if not deployed_version:
        result["status"] = "Error"
        print(json.dumps(result))
        return

    # Get available version
    available_version = get_available_version()
    if not available_version:
        result["status"] = "Error"
        print(json.dumps(result))
        return
    # Update result with versions
    result["deployed_version"] = deployed_version
    result["available_version"] = available_version

    # Compare versions and set status
    result["status"] = compare_versions(deployed_version, available_version)

    # Print result as JSON
    print(json.dumps(result))

if __name__ == "__main__":
    main()

