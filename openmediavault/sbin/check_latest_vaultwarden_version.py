#!/usr/bin/env python3

import json
import requests
import os
import time
from urllib.error import URLError

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
        print(f"Error reading cache file: {str(e)}")
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
        print(f"Error updating cache: {str(e)}")

def get_latest_version():
    """Get latest version tag from GitHub API or cache"""
    # Check cache first
    cached_version, cached_timestamp = read_cached_version()
    
    # If we have a cached version, check if it's still valid (less than 24 hours old)
    if cached_version and cached_timestamp:
        current_time = time.time()
        if current_time - cached_timestamp < 86400:  # 24 hours in seconds
            return {"version": cached_version}
    
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
                latest_version = tags[0]['name']
                # Remove 'v' prefix if it exists
                latest_version = latest_version.lstrip('v')
                
                # Update cache with new version
                update_cache(latest_version)
                
                return {"version": latest_version}
            else:
                # If GitHub returns empty tags, use cached version if available
                if cached_version:
                    return {"version": cached_version}
                return {"version": ""}
        else:
            # If GitHub request fails, use cached version if available
            if cached_version:
                return {"version": cached_version}
            return {"version": ""}
            
    except (requests.RequestException, json.JSONDecodeError, KeyError) as e:
        print(f"Error fetching from GitHub: {str(e)}")
        # On any error, return cached version if available
        if cached_version:
            return {"version": cached_version}
        return {"version": ""}

if __name__ == "__main__":
    result = get_latest_version()
    print(json.dumps(result))
