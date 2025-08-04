#!/usr/bin/env python3
"""
Tailscale Update Script

This script manages Tailscale version checking and updates in an unattended way.
It can check the current version, check for updates, and perform updates.
"""

import subprocess
import logging
import sys
import os
import time
import argparse
import json
from datetime import datetime
import re

# Configure logging
log_dir = "/var/log/tailscale"
os.makedirs(log_dir, exist_ok=True)
log_file = os.path.join(log_dir, "tailscale_update.log")

logging.basicConfig(
    level=logging.CRITICAL,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler(sys.stdout)
    ]
)

def get_current_version():
    """Get the current Tailscale version."""
    try:
        result = subprocess.run(
            ["/usr/bin/tailscale", "version"],
            capture_output=True,
            text=True,
            check=True
        )
        # Extract the version number from the first line
        version_line = result.stdout.strip().split('\n')[0]
        # Use regex to extract version number (e.g., 1.82.5)
        version_match = re.search(r'(\d+\.\d+\.\d+)', version_line)
        if version_match:
            return version_match.group(1)
        return version_line  # Return the whole line if regex fails
    except subprocess.CalledProcessError as e:
        logging.error(f"Failed to get current Tailscale version: {e}")
        return "Unknown"
    except Exception as e:
        logging.error(f"Unexpected error getting Tailscale version: {e}")
        return "Unknown"

def get_latest_version():
    """Get the latest available Tailscale version using 'tailscale version --upstream'."""
    try:
        result = subprocess.run(
            ["/usr/bin/tailscale", "version", "--upstream"],
            capture_output=True,
            text=True,
            check=True
        )
        output = result.stdout.strip()
        
        # Look for the upstream version line
        for line in output.split('\n'):
            if "upstream:" in line:
                # Extract version number after "upstream:"
                upstream_version = line.split('upstream:')[1].strip()
                return upstream_version
        
        # If we can't find the upstream line, look for any version number in the output
        version_match = re.search(r'(\d+\.\d+\.\d+)', output)
        if version_match:
            return version_match.group(1)
            
        # If we still can't find a version, log and return unknown
        logging.warning(f"Could not parse upstream version from output: {output}")
        return "Unknown"
    except subprocess.CalledProcessError as e:
        logging.error(f"Failed to check for latest Tailscale version: {e}")
        return "Unknown"
    except Exception as e:
        logging.error(f"Unexpected error checking latest version: {e}")
        return "Unknown"

def check_tailscale_status():
    """Check if Tailscale is running properly."""
    try:
        result = subprocess.run(
            ["/usr/bin/tailscale", "status"],
            capture_output=True,
            text=True,
            check=True
        )
        return True, result.stdout.strip()
    except subprocess.CalledProcessError as e:
        return False, f"Error: {e.stderr.strip()}"
    except Exception as e:
        return False, f"Unexpected error: {str(e)}"

def restart_tailscale():
    """Restart the Tailscale service."""
    logging.info("Attempting to restart Tailscale service...")
    try:
        subprocess.run(
            ["systemctl", "restart", "tailscaled"],
            capture_output=True,
            text=True,
            check=True
        )
        logging.info("Tailscale service restarted successfully")
        return True
    except subprocess.CalledProcessError as e:
        logging.error(f"Failed to restart Tailscale service: {e.stderr.strip()}")
        return False
    except Exception as e:
        logging.error(f"Unexpected error restarting Tailscale service: {e}")
        return False

def update_tailscale(force=False):
    """Update Tailscale to the latest version."""
    current_version = get_current_version()
    latest_version = get_latest_version()
    
    logging.info(f"Current Tailscale version: {current_version}")
    logging.info(f"Latest Tailscale version: {latest_version}")
    
    # Check if update is needed
    if current_version == latest_version or latest_version == "Unknown":
        result = {
            "current_version": current_version,
            "latest_version": latest_version,
            "status": "No-Updates",
            "message": "Already running the latest version"
        }
        print(json.dumps(result))
        return True
    
    # Check if Tailscale is running properly before update
    status_ok, status_msg = check_tailscale_status()
    if not status_ok:
        logging.warning(f"Tailscale status check failed before update: {status_msg}")
        if not force:
            logging.error("Aborting update due to pre-update status check failure. Use --force to override.")
            result = {
                "current_version": current_version,
                "latest_version": latest_version,
                "status": "Error",
                "message": "Pre-update status check failed"
            }
            print(json.dumps(result))
            return False
        logging.warning("Proceeding with update despite status check failure due to --force flag")
    else:
        logging.info("Pre-update status check passed")
    
    # Perform the update
    logging.info("Starting Tailscale update...")
    try:
        update_cmd = ["/usr/bin/tailscale", "update", "--yes"]
        update_result = subprocess.run(
            update_cmd,
            capture_output=True,
            text=True,
            check=True
        )
        logging.info(f"Update command output: {update_result.stdout.strip()}")
        
        # Wait a moment for the update to complete
        time.sleep(5)
        
        # Check new version
        new_version = get_current_version()
        logging.info(f"Updated Tailscale version: {new_version}")
        
        # Verify Tailscale is running properly after update
        status_ok, status_msg = check_tailscale_status()
        if not status_ok:
            logging.warning(f"Tailscale status check failed after update: {status_msg}")
            if restart_tailscale():
                # Check status again after restart
                status_ok, status_msg = check_tailscale_status()
                if not status_ok:
                    logging.error(f"Tailscale still not running properly after restart: {status_msg}")
                    result = {
                        "current_version": new_version,
                        "latest_version": latest_version,
                        "status": "Error",
                        "message": "Update completed but service not running properly"
                    }
                    print(json.dumps(result))
                    return False
                logging.info("Tailscale running properly after restart")
            else:
                logging.error("Failed to recover Tailscale after update")
                result = {
                    "current_version": new_version,
                    "latest_version": latest_version,
                    "status": "Error",
                    "message": "Update completed but failed to restart service"
                }
                print(json.dumps(result))
                return False
        
        logging.info("Tailscale update completed successfully")
        result = {
            "current_version": new_version,
            "latest_version": latest_version,
            "status": "Updated",
            "message": "Successfully updated to latest version"
        }
        print(json.dumps(result))
        return True
    
    except subprocess.CalledProcessError as e:
        logging.error(f"Failed to update Tailscale: {e.stderr.strip()}")
        result = {
            "current_version": current_version,
            "latest_version": latest_version,
            "status": "Error",
            "message": f"Update failed: {e.stderr.strip()}"
        }
        print(json.dumps(result))
        return False
    except Exception as e:
        logging.error(f"Unexpected error during Tailscale update: {e}")
        result = {
            "current_version": current_version,
            "latest_version": latest_version,
            "status": "Error",
            "message": f"Unexpected error: {str(e)}"
        }
        print(json.dumps(result))
        return False

def main():
    """Main function to parse arguments and run the appropriate command."""
    parser = argparse.ArgumentParser(description='Tailscale version management tool')
    
    # Create mutually exclusive group for commands
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--version', action='store_true', help='Show current Tailscale version')
    group.add_argument('--check-latest-version', action='store_true', help='Check for latest Tailscale version')
    group.add_argument('--update', action='store_true', help='Update Tailscale to latest version')
    
    # Additional options
    parser.add_argument('--force', action='store_true', help='Force update even if pre-checks fail')
    
    args = parser.parse_args()
    
    logging.info("=" * 50)
    logging.info(f"Tailscale update script started at {datetime.now().isoformat()}")
    
    if args.version:
        # Get and display current version
        current_version = get_current_version()
        latest_version = get_latest_version()
        if current_version == latest_version or latest_version == "Unknown":
            status = "No-Updates"
        else:
            status = "Update-Available"
        result = {
            "deployed_version": current_version,
            "available_version": latest_version,
            "status": status
        }
        print(json.dumps(result))
        return 0
        
    elif args.check_latest_version:
        # Check for latest version and compare
        current_version = get_current_version()
        latest_version = get_latest_version()
        
        if current_version == latest_version or latest_version == "Unknown":
            status = "No-Updates"
        else:
            status = "Update-Available"
            
        result = {
            "deployed_version": current_version,
            "available_version": latest_version,
            "status": status
        }
        print(json.dumps(result))
        return 0
        
    elif args.update:
        # Update to latest version
        success = update_tailscale(force=args.force)
        return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())