#!/usr/bin/env python3

import json
import requests
import sys
from typing import Optional, Tuple
from pathlib import Path
from urllib.error import URLError
from datetime import datetime, timedelta


VERSION_CACHE_FILE = "/var/cache/homecloud/jellyfin.ver.json"
CACHE_DURATION = timedelta(hours=24)


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


def get_latest_version():

    
    """Get latest version tag from GitHub API"""
    url = "https://api.github.com/repos/jellyfin/jellyfin/tags"
    
    try:
          # First check cache
        cached_version = read_version_cache()
        if cached_version:
            return cached_version, "success"


        # Set a timeout and user agent for the request
        headers = {
            'User-Agent': 'Python/JellyfinVersionCheck',
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
                # Cache the new version
                write_version_cache(latest_version)
                return latest_version, "success"
            else:
                return None, "No version tag found in URL"
        else:
            return None, f"Error checking version"
            
    except (requests.RequestException, json.JSONDecodeError, KeyError) as e:
        return None, f"Error checking version"

if __name__ == "__main__":
    latest_version,message = get_latest_version()
    if latest_version is None:
        result = {"version": "", "message": message}
    else:
        result = {"version": latest_version, "message": message}

    print(json.dumps(result))
    sys.exit(0 if result["version"] else 1)

