#!/usr/bin/python3
import json
import subprocess
import re
from typing import Dict, Any
import argparse
import logging

# Set up logging
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

def get_tailscale_status() -> bool:
    """Check Tailscale VPN status using omv-rpc"""
    try:
        cmd = ["omv-rpc", "-u", "admin", "Homecloud", "getTailscaleStatus"]
        logger.debug(f"Executing command: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        status = json.loads(result.stdout)
        
        logger.debug(f"Tailscale status response: {status}")
        
        if isinstance(status, dict):
            if 'response' in status:
                return status['response'].lower() == 'up'
            elif 'running' in status:
                return status['running'].lower() == 'up'
            else:
                for value in status.values():
                    if isinstance(value, str) and value.lower() == 'up':
                        return True
        elif isinstance(status, str):
            return status.lower() == 'up'
        
        return False
    except Exception as e:
        logger.error(f"Error checking Tailscale status: {e}")
        return False

def get_funnel_status(appname: str = None) -> Dict[str, Any]:
    """Check Tailscale funnel status and get URLs if enabled for specific app"""
    try:
        cmd = ["tailscale", "funnel", "status", "--json"]
        logger.debug(f"Executing command: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        output = result.stdout.strip()
        
        logger.debug(f"Funnel status raw output: {output}")

        # If output is empty, funnel is not configured
        if not output:
            logger.debug("Empty funnel status output")
            return {
                "status": "Disabled",
                "url": None,
                "app": appname,
                "source_port": None,
                "destination_port": None
            }

        # Parse JSON output
        funnel_status = json.loads(output)
        logger.debug(f"Parsed funnel status: {funnel_status}")
        
        # Check if funnel is configured and running
        if "TCP" in funnel_status and "AllowFunnel" in funnel_status:
            # Iterate through all funnel URLs and port mappings
            for url in funnel_status["AllowFunnel"].keys():
                logger.debug(f"Processing URL: {url}")
                # Get the source port from the URL (after the ':')
                source_port = url.split(':')[-1]
                
                # Get the destination port from TCP forward
                if source_port in funnel_status["TCP"]:
                    tcp_forward = funnel_status["TCP"][source_port]["TCPForward"]
                    dest_port = tcp_forward.split(':')[-1]
                    
                    logger.debug(f"Found mapping: source_port={source_port}, dest_port={dest_port}")
                    
                    # Determine app name based on destination port
                    app_name = None
                    if dest_port == "2284":
                        app_name = "immich"
                    if dest_port == "8000":
                        app_name = "paperless-ngx"
                    
                    logger.debug(f"Determined app_name: {app_name}")
                    
                    # If appname matches
                    if app_name == appname:
                        result = {
                            "status": "Enabled",
                            "url": f"https://{url}",
                            "app": app_name,
                            "source_port": source_port,
                            "destination_port": dest_port
                        }
                        logger.debug(f"Returning result for matching app: {result}")
                        return result
            
            # If we get here and haven't returned, the app wasn't found
            logger.debug(f"App {appname} not found in funnel configuration")
            return {
                "status": "Disabled",
                "url": None,
                "app": appname,
                "source_port": None,
                "destination_port": None
            }
        
        # If only AllowFunnel exists but no TCP, funnel is configured but not running
        elif "AllowFunnel" in funnel_status:
            logger.debug("Found AllowFunnel but no TCP configuration")
            return {
                "status": "Configured",
                "url": None,
                "app": appname,
                "source_port": None,
                "destination_port": None
            }

        logger.debug("No funnel configuration found")
        return {
            "status": "Disabled",
            "url": None,
            "app": appname,
            "source_port": None,
            "destination_port": None
        }

    except subprocess.CalledProcessError as e:
        logger.error(f"Error executing funnel status command: {e}")
        return {
            "status": "Disabled",
            "url": None,
            "app": appname,
            "source_port": None,
            "destination_port": None
        }
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing funnel status JSON: {e}")
        return {
            "status": "Disabled",
            "url": None,
            "app": appname,
            "source_port": None,
            "destination_port": None
        }

def main() -> Dict[str, Any]:
    try:
        # Get appname from command line argument
        parser = argparse.ArgumentParser()
        parser.add_argument('appname', help='Application name to check funnel status for')
        args = parser.parse_args()
        
        logger.debug(f"Checking status for app: {args.appname}")

        # Check Tailscale status first
        tailscale_status = get_tailscale_status()
        logger.debug(f"Tailscale status: {tailscale_status}")
        
        if not tailscale_status:
            result = {
                "status": "VPN down",
                "url": None,
                "app": args.appname,
                "source_port": None,
                "destination_port": None
            }
        else:
            # Get funnel status for specific app
            result = get_funnel_status(args.appname)

        # Print result as JSON
        print(json.dumps(result))
        return result
        
    except Exception as e:
        logger.error(f"Unexpected error in main: {e}")
        result = {
            "status": "Error",
            "url": None,
            "app": args.appname if 'args' in locals() else None,
            "source_port": None,
            "destination_port": None
        }
        print(json.dumps(result))
        return result

if __name__ == "__main__":
    main()
