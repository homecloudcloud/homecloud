#!/usr/bin/env python3

import json
import requests
import os
import time
from urllib.error import URLError
import re

LAST_WORKING_VERSIONS_URL = "https://raw.githubusercontent.com/homecloudcloud/homecloud/main/app_last_working_versions.json"

def read_cached_version():
    """Read version from cache file"""
    cache_file = "/var/cache/homecloud/vaultwarden.ver.json"
    try:
        if not os.path.exists(cache_file):
            return None, None

        with open(cache_file, 'r') as f:
            data = json.load(f)
            
        if not data or not isinstance(data, list) or len(data) == 0:
            return None, None
            
        # Get the last entry
        last_entry = data[-1]
        return last_entry.get('ver'), last_entry.get('timestamp')
            
    except (json.JSONDecodeError, IOError) as e:
        #print(f"Error reading cache file: {str(e)}")
        return None, None

def update_cache(version):
    """Update the cache file with new version"""
    cache_file = "/var/cache/homecloud/vaultwarden.ver.json"
    cache_dir = os.path.dirname(cache_file)
    
    try:
        # Create cache directory if it doesn't exist
        if not os.path.exists(cache_dir):
            os.makedirs(cache_dir, mode=0o755, exist_ok=True)
            
        # Read existing cache
        existing_data = []
        if os.path.exists(cache_file):
            try:
                with open(cache_file, 'r') as f:
                    existing_data = json.load(f)
                    if not isinstance(existing_data, list):
                        existing_data = []
            except json.JSONDecodeError:
                existing_data = []
        
        # Add new entry
        new_entry = {
            "ver": version,
            "timestamp": time.time()
        }
        
        existing_data.append(new_entry)
        
        # Write updated cache
        with open(cache_file, 'w') as f:
            json.dump(existing_data, f, indent=2)
            
    except Exception as e:
        #print(f"Error updating cache: {str(e)}")
        return None

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

def get_last_working_version():
    """Get last known working version from remote JSON file"""
    try:
        response = requests.get(LAST_WORKING_VERSIONS_URL, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        return data.get("vaultwarden", "")
        
    except Exception as e:
        #print(f"Error fetching last working version: {str(e)}")
        return None

def compare_versions(version1, version2):
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

def get_latest_version():
    """Get latest version tag from GitHub API or cache"""
    # Check cache first
    cached_version, cached_timestamp = read_cached_version()
    
    # If we have a cached version, check if it's still valid (less than 24 hours old)
    if cached_version and cached_timestamp:
        current_time = time.time()
        if current_time - cached_timestamp < 86400:  # 24 hours in seconds
            return {"version": cached_version, "message": ""}
    
    # If cache is invalid or doesn't exist, try GitHub API
    url = "https://api.github.com/repos/dani-garcia/vaultwarden/tags"
    
    try:
        # Set a timeout and user agent for the request
        headers = {
            'User-Agent': 'Python/VaultwardenVersionCheck',
            'Accept': 'application/json'
        }
        response = requests.get(url, headers=headers, timeout=10)
        
        # Check if request was successful
        if response.status_code == 200:
            tags = response.json()
            if tags and len(tags) > 0:
                # First tag is the latest
                github_version = tags[0]['name'].lstrip('v')
                
                # Get last known working version
                last_working_version = get_last_working_version()
                
                # Determine which version to use
                if last_working_version and last_working_version.strip():
                    last_working_clean = last_working_version.lstrip('v')
                    
                    # Compare versions
                    comparison = compare_versions(last_working_clean, github_version)
                    
                    if comparison <= 0:  # last_working <= github
                        final_version = last_working_clean
                    else:  # last_working > github
                        final_version = github_version
                else:
                    final_version = github_version
                
                # Update cache with final version
                update_cache(final_version)
                
                return {"version": final_version, "message": ""}
            else:
                # If GitHub returns empty tags, use cached version if available
                if cached_version:
                    return {"version": cached_version, "message": ""}
                return {"version": "", "message": "Error retrieving version from app repository"}
        else:
            # If GitHub request fails, use cached version if available
            if cached_version:
                return {"version": cached_version, "message": ""}
            if not check_internet_connectivity():
                return {"version": "", "message": "Error: Not connected to Internet. Check your network connectivity"}
            
    except (requests.RequestException, json.JSONDecodeError, KeyError) as e:
        #print(f"Error fetching from GitHub: {str(e)}")
        # On any error, return cached version if available
        if cached_version:
            return {"version": cached_version, "message": ""}
        if not check_internet_connectivity():
            return {"version": "", "message": "Error: Not connected to Internet. Check your network connectivity"}
        else: 
            return {"version": "", "message": "Error retrieving version from app repository"}

if __name__ == "__main__":
    result = get_latest_version()
    print(json.dumps(result))
