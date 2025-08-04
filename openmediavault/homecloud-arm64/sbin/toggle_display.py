#!/usr/bin/env python3

import requests
import urllib3

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def toggle_display():
    """
    Call the toggle_display API and ignore certificate errors
    """
    try:
        # Make POST request to the API
        response = requests.post(
            "https://localhost:5000/toggle_display",
            verify=False  # Ignore SSL certificate verification
        )
        
        # Print the response
        if response.status_code == 200:
            print(f"Success: {response.json()}")
            return True
        else:
            print(f"Error: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    toggle_display()
