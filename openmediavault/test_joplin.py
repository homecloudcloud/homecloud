#!/usr/bin/env python3
import json
import requests

LAST_WORKING_VERSIONS_URL = "https://raw.githubusercontent.com/homecloudcloud/homecloud/main/app_last_working_versions.json"

def test_last_working_version():
    try:
        response = requests.get(LAST_WORKING_VERSIONS_URL, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        joplin_version = data.get("joplin", "")
        print(f"Joplin last working version: '{joplin_version}'")
        print(f"Is empty: {not joplin_version.strip()}")
        return joplin_version
        
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    test_last_working_version()