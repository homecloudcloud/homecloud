#!/usr/bin/env python3
import json
import requests
import sys
import os
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional, Dict, Union
from urllib.error import URLError

VERSION_CACHE_FILE = "/var/cache/homecloud/paperless.ver.json"
CACHE_DURATION = timedelta(hours=24)

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

def fetch_github_version() -> Optional[str]:
    """Fetch latest version from GitHub"""
    url = "https://api.github.com/repos/paperless-ngx/paperless-ngx/tags"
    
    try:
        headers = {
            'User-Agent': 'Python/PaperlessVersionCheck',
            'Accept': 'application/json'        }
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            tags = response.json()
            if tags and len(tags) > 0:
                latest_version = tags[0]['name']
                return latest_version.lstrip('v')
                
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
                return {"version": cached_version}
            
            # Cache is old, try GitHub
            github_version = fetch_github_version()
            
            if github_version:
                # Got new version from GitHub, cache it
                write_version_cache(github_version)
                return {"version": github_version}
            else:
                # GitHub failed, use cached version
                return {"version": cached_version}
        
        # No cache exists, must use GitHub
        github_version = fetch_github_version()
        if github_version:
            write_version_cache(github_version)
            return {"version": github_version}
        
        return {"version": ""}

    except Exception as e:
        # If anything fails but we have a cached version, use it
        if cached_entry:
            return {"version": cached_entry['ver']}
        return {"version": ""}

if __name__ == "__main__":
    result = get_latest_version()
    print(json.dumps(result))
