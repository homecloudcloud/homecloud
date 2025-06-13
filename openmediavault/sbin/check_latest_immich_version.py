#!/usr/bin/env python3
import json
import sys
import requests
from typing import Optional, Tuple
from pathlib import Path
from datetime import datetime, timedelta

VERSION_CACHE_FILE = "/var/cache/homecloud/immich.ver.json"
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

def get_latest_tag() -> Tuple[Optional[str], str]:
    """Get latest version from cache or GitHub releases"""
    try:
        # First check cache
        cached_version = read_version_cache()
        if cached_version:
            return cached_version, "success"

        # If cache invalid or missing, check GitHub
        url = "https://github.com/immich-app/immich/releases/latest"
        headers = {
            "Accept": "application/json",
            "User-Agent": "Immich-Version-Checker"
        }

        # Make request and get the final URL after redirects
        response = requests.get(url, headers=headers, timeout=10, allow_redirects=True)
        response.raise_for_status()

        # Extract version from the final URL
        # URL format: https://github.com/immich-app/immich/releases/tag/v1.xx.x
        final_url = response.url
        if not final_url:
            return None, "No redirect URL found"

        # Extract version from URL
        version_tag = final_url.split('/')[-1]
        if not version_tag:
            return None, "No version tag found in URL"

        # Remove 'v' prefix if present
        latest_version = version_tag.lstrip('v')
        
        # Cache the new version
        write_version_cache(latest_version)

        return latest_version, "success"

    except requests.RequestException as e:
        return None, f"Error making request: {str(e)}"
    except Exception as e:
        return None, f"Error checking version: {str(e)}"


def main():
    """Main function to get and return latest version"""
    try:
        latest_version, message = get_latest_tag()
        
        if latest_version is None:
            result = {"version": "", "message": message}
        else:
            result = {"version": latest_version, "message": message}
            
    except Exception as e:
        result = {"version": "", "message": str(e)}

    # Print JSON result
    print(json.dumps(result))
    
    # Exit with appropriate status code
    sys.exit(0 if result["version"] else 1)

if __name__ == "__main__":
    main()
