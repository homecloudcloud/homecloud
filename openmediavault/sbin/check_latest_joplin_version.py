#!/usr/bin/env python3
import json
import requests
import sys
import os
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional, Dict, Union
from urllib.error import URLError
import re

VERSION_CACHE_FILE = "/var/cache/homecloud/joplin.ver.json"
CACHE_DURATION = timedelta(hours=24)
LAST_WORKING_VERSIONS_URL = "https://raw.githubusercontent.com/homecloudcloud/homecloud/main/app_last_working_versions.json"

def read_cached_version() -> Optional[Dict[str, Union[str, float]]]:
    """Read the last version entry from cache file"""
    try:
        cache_file = Path(VERSION_CACHE_FILE)
        if not cache_file.exists():
            return None

        with open(cache_file, 'r') as f:
            cache_data = json.load(f)

        if not cache_data or not isinstance(cache_data, list):
            return None

        return cache_data[-1]  # Return the last entry

    except Exception as e:
        print(f"Error reading version cache: {str(e)}", file=sys.stderr)
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


def write_version_cache(version: str) -> None:
    """Append new version to cache file"""
    try:
        cache_file = Path(VERSION_CACHE_FILE)
        cache_file.parent.mkdir(parents=True, exist_ok=True)

        # Read existing cache or create new
        cache_data = []
        if cache_file.exists():
            try:
                with open(cache_file, 'r') as f:
                    cache_data = json.load(f)
            except json.JSONDecodeError:
                cache_data = []

        # Append new version entry
        new_entry = {
            "ver": version,
            "timestamp": datetime.now().timestamp()
        }
        cache_data.append(new_entry)

        # Write updated cache
        with open(cache_file, 'w') as f:
            json.dump(cache_data, f, indent=2)

    except Exception as e:
        print(f"Error writing version cache: {str(e)}", file=sys.stderr)

def get_last_working_version() -> Optional[str]:
    """Get last known working version from remote JSON file"""
    try:
        response = requests.get(LAST_WORKING_VERSIONS_URL, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        return data.get("joplin", "")
        
    except Exception as e:
        print(f"Error fetching last working version: {str(e)}", file=sys.stderr)
        return None

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

def fetch_github_version() -> Optional[str]:
    """Fetch latest version from GitHub"""
    url = "https://api.github.com/repos/laurent22/joplin/tags"
    
    try:
        headers = {
            'User-Agent': 'Python/JoplinVersionCheck',
            'Accept': 'application/json'        
            }
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            tags = response.json()
            if tags and len(tags) > 0:
                github_version = tags[0]['name'].lstrip('v')
                
                # Get last known working version
                last_working_version = get_last_working_version()
                
                # Determine which version to use
                if last_working_version and last_working_version.strip():
                    last_working_clean = last_working_version.lstrip('v')
                    
                    # Compare versions
                    comparison = compare_versions(last_working_clean, github_version)
                    
                    if comparison <= 0:  # last_working <= github
                        return last_working_clean
                    else:  # last_working > github
                        return github_version
                else:
                    return github_version
        else:
            print(f"GitHub API returned status code: {response.status_code}", file=sys.stderr)
                
        return None

    except Exception as e:
        print(f"Error fetching from GitHub: {str(e)}", file=sys.stderr)
        return None

def get_latest_version() -> Dict[str, str]:
    """Get latest version from cache or GitHub"""
    try:
        # First check cache file
        cached_entry = read_cached_version()
        
        if cached_entry:
            cached_time = datetime.fromtimestamp(cached_entry['timestamp'])
            cached_version = cached_entry['ver']
            
            # If cache is less than 24 hours old, use it
            if datetime.now() - cached_time <= CACHE_DURATION:
                return {"version": cached_version, "message": ""}
            
            # Cache is old, try GitHub
            github_version = fetch_github_version()
            
            if github_version:
                # Got new version from GitHub, cache it
                write_version_cache(github_version)
                return {"version": github_version, "message": ""}
            else:
                # GitHub failed, try last working version, otherwise use cached version
                last_working_version = get_last_working_version()
                if last_working_version and last_working_version.strip():
                    last_working_clean = last_working_version.lstrip('v')
                    write_version_cache(last_working_clean)
                    return {"version": last_working_clean, "message": ""}
                else:
                    return {"version": cached_version,"message": ""}
        
        # No cache exists, try GitHub first, then fallback to last working version
        github_version = fetch_github_version()
        if github_version:
            write_version_cache(github_version)
            return {"version": github_version, "message": ""}
        
        # GitHub failed, try to use last working version as fallback
        last_working_version = get_last_working_version()
        if last_working_version and last_working_version.strip():
            last_working_clean = last_working_version.lstrip('v')
            write_version_cache(last_working_clean)
            return {"version": last_working_clean, "message": ""}
        
        if not check_internet_connectivity():
            return {"version": "", "message": "Error: Not connected to Internet. Check your network connectivity"}
        
    except Exception as e:
        print(f"Exception in get_latest_version: {str(e)}", file=sys.stderr)
        # If anything fails but we have a cached version, use it
        cached_entry = read_cached_version()
        if cached_entry:
            return {"version": cached_entry['ver']}
        return {"version": "", "message": "Error retrieving version from app repository"}

if __name__ == "__main__":
    result = get_latest_version()
    print(json.dumps(result))
