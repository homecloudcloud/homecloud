#!/usr/bin/env python3

import requests
import json
import os
import re
import sys
import subprocess
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple


VERSION_CACHE_FILE = "/var/cache/homecloud/duplicati.ver.json"
CACHE_DURATION = timedelta(hours=24)

def read_cached_version() -> Optional[Dict]:
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

def append_version_cache(version: str) -> None:
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

def get_duplicati_api_endpoint() -> Optional[str]:
    """Get Duplicati API endpoint using omv-rpc command"""
    try:
        result = subprocess.run(
            ["omv-rpc", "-u", "admin", "Homecloud", "getDuplicatiServiceStatus"],
            capture_output=True,
            text=True,
            check=True
        )
        
        # Parse JSON response
        status = json.loads(result.stdout)
        if status.get('status') == 'Running' and 'api_endpoint' in status:
            return status['api_endpoint']
        return None
    except Exception as e:
        print(f"Error getting API endpoint: {str(e)}", file=sys.stderr)
        return None

def get_current_version() -> Optional[str]:
    """Get current version from docker-compose.yml"""
    try:
        import yaml
        with open('/etc/duplicati/docker-compose-duplicati.yaml', 'r') as f:
            compose_data = yaml.safe_load(f)
            image = compose_data['services']['duplicati']['image']
            if ':' in image:
                version = image.split(':')[-1]
                # Clean version format (remove _stable, _beta suffixes)
                version = version.split('_')[0]
                return version
        return None
            
    except Exception as e:
        print(f"Error getting version from docker-compose: {str(e)}", file=sys.stderr)
        return None

def fetch_github_version() -> Optional[str]:
    """Fetch the latest version using omv-rpc command"""
    try:
        # Run omv-rpc command
        cmd = ["omv-rpc", "-u", "admin", "Homecloud", "duplicati_get_latest_version"]
        result = subprocess.run(cmd, 
                              capture_output=True, 
                              text=True, 
                              check=True)
        
        # Parse JSON response
        response = json.loads(result.stdout)
        
        # Extract version from response
        if "version" in response and "message" in response:
            if response["message"] == "success":
                return response["version"]
            
        return None
            
    except subprocess.CalledProcessError as e:
        print(f"Command execution failed: {str(e)}", file=sys.stderr)
        return None
    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON response: {str(e)}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"Unexpected error fetching version: {str(e)}", file=sys.stderr)
        return None


        
def get_latest_tag() -> Tuple[Optional[str], str]:
    """Get latest version from cache or GitHub"""
    try:
        # First check cache file
        cached_entry = read_cached_version()
        
        if cached_entry:
            cached_time = datetime.fromtimestamp(cached_entry['timestamp'])
            cached_version = cached_entry['ver']
            
            # If cache is less than 24 hours old, use it
            if datetime.now() - cached_time <= CACHE_DURATION:
                return cached_version, "success"
            
            # Cache is old, try GitHub
            github_version = fetch_github_version()
            
            if github_version:
                # Got new version from GitHub, cache it
                append_version_cache(github_version)
                return github_version, "success"
            else:
                # GitHub failed, use cached version
                return cached_version, "using cached version (GitHub fetch failed)"
        
        # No cache exists, must use GitHub
        github_version = fetch_github_version()
        if github_version:
            append_version_cache(github_version)
            return github_version, "success"
        
        return None, "No version available"

    except Exception as e:
        # If anything fails but we have a cached version, use it
        if cached_entry:
            return cached_entry['ver'], "using cached version (error occurred)"
        return None, f"Error checking version: {str(e)}"

def compare_versions(current: str, latest: str) -> bool:
    """
    Compare version numbers
    Returns True if update is available, False otherwise
    """
    try:
        def parse_version(version: str) -> tuple:
            # Convert version string to tuple of integers
            return tuple(map(int, version.split('.')))
            
        current_parts = parse_version(current)
        latest_parts = parse_version(latest)
        
        return latest_parts > current_parts
    except Exception:
        return False

def check_updates() -> Dict[str, str]:
    """Main function to check for updates"""
    try:
        deployed_version = get_current_version()
        if not deployed_version:
            return {
                "status": "Error",
                "available_version": "Unable to get current version from API",
                "deployed_version": "Unknown"
            }
            
        latest_version, error_message = get_latest_tag()
        if not latest_version:
            return {
                "status": "Error",
                "available_version": error_message,
                "deployed_version": deployed_version
            }
            
        # Compare versions
        if compare_versions(deployed_version, latest_version):
            status = "Update-Available"
        else:
            status = "No-Updates"
            
        return {
            "status": status,
            "available_version": latest_version,
            "deployed_version": deployed_version
        }
        
    except Exception as e:
        return {
            "status": "Error",
            "available_version": f"Error checking updates: {str(e)}",
            "deployed_version": "Unknown"
        }

if __name__ == "__main__":
    # Disable SSL verification warnings
    requests.packages.urllib3.disable_warnings()
    
    result = check_updates()
    print(json.dumps(result))

