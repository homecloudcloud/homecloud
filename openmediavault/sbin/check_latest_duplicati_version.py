#!/usr/bin/env python3
import json
import sys
import requests
from typing import Optional, Tuple
from pathlib import Path
from datetime import datetime, timedelta
import re

VERSION_CACHE_FILE = "/var/cache/homecloud/duplicati.ver.json"
CACHE_DURATION = timedelta(hours=24)
LAST_WORKING_VERSIONS_URL = "https://raw.githubusercontent.com/homecloudcloud/homecloud/main/app_last_working_versions.json"

def read_version_cache() -> Optional[str]:
    """Read version from cache file if valid"""
    try:
        cache_file = Path(VERSION_CACHE_FILE)
        if not cache_file.exists():
            return None

        with open(cache_file, 'r') as f:
            versions = json.load(f)

        if not versions or not isinstance(versions, list):
            return None

        latest_entry = versions[-1]
        cached_time = datetime.fromtimestamp(latest_entry['timestamp'])
        
        # Check if cache is still valid (less than 24 hours old)
        if datetime.now() - cached_time <= CACHE_DURATION:
            return latest_entry['ver']
            
        return None

    except Exception as e:
        print(f"Error reading cache: {str(e)}")
        return None

def write_version_cache(version: str) -> None:
    """Write version to cache file"""
    try:
        cache_file = Path(VERSION_CACHE_FILE)
        
        # Create directory if it doesn't exist
        cache_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Read existing versions or create new array
        versions = []
        if cache_file.exists():
            try:
                with open(cache_file, 'r') as f:
                    versions = json.load(f)
            except json.JSONDecodeError:
                versions = []
        
        # Add new version entry
        versions.append({
            'ver': version,
            'timestamp': datetime.now().timestamp()
        })
        
        # Write updated versions to file
        with open(cache_file, 'w') as f:
            json.dump(versions, f, indent=2)

    except Exception as e:
        print(f"Error writing cache: {str(e)}")

def get_last_working_version() -> Optional[str]:
    """Get last known working version from remote JSON file"""
    try:
        response = requests.get(LAST_WORKING_VERSIONS_URL, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        return data.get("duplicati", "")
        
    except Exception as e:
        print(f"Error fetching last working version: {str(e)}")
        return None

def clean_version(version: str) -> str:
    """Clean version format - extract numeric version from formats like 2.1.0.5_stable_2025-03-04"""
    # Remove 'v' prefix
    version = version.lstrip('v')
    # Split on underscore and take first part (before _stable, _beta, etc.)
    version = version.split('_')[0]
    return version

def compare_versions(version1: str, version2: str) -> int:
    """Compare two version strings. Returns -1 if v1 < v2, 0 if equal, 1 if v1 > v2"""
    def normalize_version(v):
        # Remove 'v' prefix and split by dots
        v = v.lstrip('v')
        parts = re.split(r'[.-]', v)
        # Convert to integers, treating non-numeric parts as 0
        return [int(x) if x.isdigit() else 0 for x in parts]
    
    v1_parts = normalize_version(version1)
    v2_parts = normalize_version(version2)
    
    # Pad shorter version with zeros
    max_len = max(len(v1_parts), len(v2_parts))
    v1_parts.extend([0] * (max_len - len(v1_parts)))
    v2_parts.extend([0] * (max_len - len(v2_parts)))
    
    for i in range(max_len):
        if v1_parts[i] < v2_parts[i]:
            return -1
        elif v1_parts[i] > v2_parts[i]:
            return 1
    
    return 0



def check_internet_connectivity():
    """Check internet connectivity using OMV RPC"""
    try:
        result = subprocess.run(['omv-rpc', '-u', 'admin', 'Homecloud', 'enumeratePhysicalNetworkDevices'],
                              capture_output=True, text=True, check=True)
        devices = json.loads(result.stdout)
        
        for device in devices:
            if device.get('devicename') == 'internet0':
                return device.get('state', False)
        return False
    except Exception:
        return False

def get_latest_tag() -> Tuple[Optional[str], str]:
    """Get latest version from cache or GitHub releases, considering last working version"""
    try:
        # First check cache
        cached_version = read_version_cache()
        if cached_version:
            return cached_version, ""

        # Get GitHub latest version
        url = "https://github.com/duplicati/duplicati/releases/latest"
        headers = {
            "Accept": "application/json",
            "User-Agent": "Duplicati-Version-Checker"
        }

        response = requests.get(url, headers=headers, timeout=10, allow_redirects=True)
        response.raise_for_status()

        final_url = response.url
        if not final_url:
            return None, "Unable to retrieve from App repository"

        version_tag = final_url.split('/')[-1]
        if not version_tag:
            return None, "Version mismatch"

        github_version = clean_version(version_tag)
        
        # Get last known working version
        last_working_version = get_last_working_version()
        
        # Determine which version to use
        if last_working_version and last_working_version.strip():
            last_working_clean = clean_version(last_working_version)
            
            # Compare versions
            comparison = compare_versions(last_working_clean, github_version)
            
            if comparison <= 0:  # last_working <= github
                final_version = last_working_clean
            else:  # last_working > github
                final_version = github_version
        else:
            final_version = github_version
        
        # Cache the final version
        write_version_cache(final_version)

        return final_version, ""

    except requests.RequestException as e:
        return None, f"Error connecting to App repository: {str(e)}"
    except Exception as e:
        return None, f"Error checking version: {str(e)}"

def main():
    """Main function to get and return latest version"""
    try:
        latest_version, message = get_latest_tag()
        
        if latest_version is None:
            result = {"version": "", "message": message}
            if not check_internet_connectivity():
                result["message"] = "Error: Not connected to Internet. Check your network connectivity"
        else:
            result = {"version": latest_version, "message": message}
            
    except Exception as e:
        result = {"version": "", "message": str(e)}

    # Print JSON result
    print(json.dumps(result))
    
    # Always exit with 0 as we need to show meesage on page rather than error
    sys.exit(0 if result["version"] else 0)

if __name__ == "__main__":
    main()
