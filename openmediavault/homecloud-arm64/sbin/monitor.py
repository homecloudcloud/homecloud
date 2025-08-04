#!/usr/bin/python3
import board
import digitalio
from PIL import Image, ImageDraw, ImageFont
#import adafruit_ssd1306
import Adafruit_SSD1306
import socket
import urllib.request
import argparse
import sys
import time
import subprocess
import netifaces
import os
import fcntl
import struct
import re
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import threading
from flask import Flask, request
import busio
import requests
import psutil
import docker
import systemd.journal
import pwd
import spwd
from urllib.parse import urlparse
import yaml
from pathlib import Path
from pwd import getpwnam
import json
from typing import Optional, Dict, List
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


import logging
from systemd.journal import JournalHandler

msg_id_network_2 = None
msg_id_network_1 = None
msg_id_network_3 = None
msg_id_network_4 = None
msg_id_network_5 = None
msg_id_network_6 = None
msg_id_network_7 = None
msg_id_network_8 = None
msg_id_network_9 = None
msg_id_network_10 = None
msg_id_network_11 = None
msg_id_network_12 = None
msg_id_network_13 = None
msg_id_network_14 = None
msg_id_smb_status = None
msg_id_hotspot = None
msg_id_vpn_1 = None
msg_id_photprism_down = None
msg_id_disk_space=None
msg_id_disk_space_percent=None
msg_id_reboot=None
photoprism_container_name = None
msg_id_start = None
last_vpn_service_status = None
MANDATORY_USER="family"
FIRST_START = True
last_tailscale_status = ''
SYSTEM_TIMEZONE = None
FUN_EXIT = True
wired_msg_up = None
wired_msg_down = None
wifi_msg = None
ETHERNET_INTERFACE = None

# Define the Reset Pin
#oled_reset = digitalio.DigitalInOut(board.D4)
SLEEP_TIME = 0
update_display_lock = threading.Lock()

# Change these
# to the right size for your display!
#WIDTH = 128
#HEIGHT = 32  # Change to 64 if needed
#BORDER = 5

# Use for I2C.
#i2c = board.I2C()  # uses board.SCL and board.SDA
# i2c = board.STEMMA_I2C()  # For using the built-in STEMMA QT connector on a microcontroller
#oled = adafruit_ssd1306.SSD1306_I2C(WIDTH, HEIGHT, i2c, addr=0x3C, reset=oled_reset)


# Clear display.
#oled.fill(0)
#oled.show()

# Create blank image for drawing.
# Make sure to create image with mode '1' for 1-bit color.
#image = Image.new("1", (oled.width, oled.height))

# Get drawing object to draw on image.hostname_current_inYAML
#draw = ImageDraw.Draw(image)

# Draw a white background
#draw.rectangle((0, 0, oled.width, oled.height), outline=0, fill=0)

# Draw a smaller inner rectangle
#draw.rectangle(
 #   (BORDER, BORDER, oled.width - BORDER - 1, oled.height - BORDER - 1),
  #  outline=0,
   # fill=0,
#)

# Load default font.
#font = ImageFont.load_default()
#font = ImageFont.truetype('/home/shaurya/lineawesome-webfont.ttf', 8)
#font = ImageFont.truetype("/home/shaurya/OLED_Stats/lineawesome-webfont.ttf", 8)

#parser = argparse.ArgumentParser()
#parser.add_argument("Text", help="Display text on OLED")
#args = parser.parse_args()
#text = args.Text
#draw_text(text)

def monitor_tmp_directory():
    """
    Monitors /tmp directory usage. If it reaches 95% usage, deletes oldest files
    until at least 50% free space is available.
    """
    tmp_path = "/tmp"
    
    # Get disk usage statistics for /tmp
    stat = os.statvfs(tmp_path)
    total_space = stat.f_blocks * stat.f_frsize
    free_space = stat.f_bavail * stat.f_frsize
    used_percent = 100 - (free_space / total_space * 100)
    
    # Check if usage exceeds 95%
    if used_percent >= 95:
        # Calculate how much space we need to free up to reach 50% free
        target_free_space = total_space * 0.5
        space_to_free = target_free_space - free_space
        
        # Get all files in /tmp with their modification times
        files = []
        for filename in os.listdir(tmp_path):
            file_path = os.path.join(tmp_path, filename)
            # Skip directories and non-regular files
            if os.path.isfile(file_path):
                try:
                    mtime = os.path.getmtime(file_path)
                    size = os.path.getsize(file_path)
                    files.append((file_path, mtime, size))
                except (OSError, PermissionError):
                    # Skip files we can't access
                    continue
        
        # Sort files by modification time (oldest first)
        files.sort(key=lambda x: x[1])
        
        # Delete files until we've freed enough space
        freed_space = 0
        for file_path, _, size in files:
            try:
                os.remove(file_path)
                freed_space += size
                logging.info(f"Deleted {file_path} ({size} bytes) from /tmp")
                
                # Check if we've freed enough space
                if freed_space >= space_to_free:
                    break
            except (OSError, PermissionError):
                # Skip files we can't delete
                continue


def tmp_monitor_thread():
    """
    Thread function that runs monitor_tmp_directory every 30 minutes.
    """
    while True:
        try:
            monitor_tmp_directory()
        except Exception as e:
            logging.error(f"Error in tmp directory monitoring: {e}")
        
        # Sleep for 30 minutes (1800 seconds)
        time.sleep(1800)

# Start the tmp monitoring thread
def start_tmp_monitor():
    """
    Starts the tmp directory monitoring thread.
    """
    tmp_thread = threading.Thread(target=tmp_monitor_thread)
    tmp_thread.daemon = True  # Thread will exit when main program exits
    tmp_thread.start()
    logging.info("Started /tmp directory monitoring thread")

def find_ethernet_interface():
    """
    Find the ethernet interface in the system - whether eth0 or end0
    Returns the interface name if found, None otherwise
    """
    try:
        result = subprocess.run(["networkctl"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        for line in result.stdout.split("\n"):
            if "end0" in line:
                return "end0"
            elif "eth0" in line:
                return "eth0"
        return None
    except:
        return None


def monitor_ethernet_cable():
    """
    Monitors the Ethernet cable connection status using 'ip monitor link'
    and displays messages when the cable is plugged in or out.
    """
    
    try:
        global wired_msg_up
        global wired_msg_down
        global msg_id_hotspot
        global ETHERNET_INTERFACE
        
        if get_ethernet_interface_and_is_up() == True:
            wired_msg_up=send_display_request(
                "Wired\nNetwork\nUP",
                "cycle",
                5,
                "add",
                0
            )
        else:
            wired_msg_down=send_display_request(
                "Wired\nNetwork\nDOWN",
                "cycle",
                5,
                "add",
                0
            )
            

        # Start the ip monitor process
        process = subprocess.Popen(
            ["ip", "monitor", "link", "dev", ETHERNET_INTERFACE],
            stdout=subprocess.PIPE,
            text=True,
            bufsize=1
        )
        
        # Read output line by line
        for line in process.stdout:
            if "LOWER_UP" in line:
                # Cable plugged in
                send_display_request(
                    "Cable\nplugged in",
                    "once",
                    5,
                    "add",
                    0
                )
                time.sleep(5)
                if (wired_msg_down):
                    send_display_request(
                        "Wired\nNetwork\nUP",
                        "cycle",
                        5,
                        "remove",
                        wired_msg_down
                    )
                    wired_msg_down = None
                
                if (wired_msg_up is None):
                    wired_msg_up=send_display_request(
                        "Wired\nNetwork\nUP",
                        "cycle",
                        5,
                        "add",
                        0
                    )
                    
                    if (msg_id_hotspot is not None):
                        print(f"removing msg_id_hotspot")
                        text="text\ntext"
                        send_display_request(text, 'cycle', 0, 'remove', msg_id_hotspot)
                        msg_id_hotspot = None
                    time.sleep(5)
                update_display()
                manage_certificates()
            elif "NO-CARRIER" in line:
                # Cable unplugged
                send_display_request(
                    "Cable\nplugged out",
                    "once",
                    5,
                    "add",
                    0
                )
                time.sleep(8)
                if (wired_msg_up):
                    send_display_request(
                        "Wired\nNetwork\nUP",
                        "cycle",
                        5,
                        "remove",
                        wired_msg_up
                    )
                    wired_msg_up = None

                if (wired_msg_down is None):
                    wired_msg_down=send_display_request(
                        "Wired\nNetwork\nDOWN",
                        "cycle",
                        5,
                        "add",
                        0
                    )
                update_display()
                manage_certificates()
    except Exception as e:
        print(f"Error monitoring Ethernet cable: {e}")
        # Wait before trying again
        time.sleep(10)
        # Restart the monitoring
        ethernet_thread = threading.Thread(target=monitor_ethernet_cable)
        ethernet_thread.daemon = True
        ethernet_thread.start()

def monitor_wifi_status():
    """
    Monitors the WiFi interface status using 'ip monitor link'
    and triggers update_display() when changes occur.
    """
    # Track the last known state
    last_state = None
    global wifi_msg
    global msg_id_network_7
    global msg_id_network_8
    global msg_id_hotspot
    
    try:
        # Set up logger
        logger = logging.getLogger('watchdog-eye.service')
        logger.setLevel(logging.INFO)
        journal_handler = JournalHandler(SYSLOG_IDENTIFIER='watchdog-eye.service')
        logger.addHandler(journal_handler)
        
        logger.info("Starting WiFi status monitoring")
        
        if (get_connected_ssid()):
            text = f"Wi-Fi\nUP"
        else:
            text = f"Wi-Fi\nDOWN"
        if (wifi_msg is None):
            wifi_msg = send_display_request(
                        text,
                        "cycle",
                        5,
                        "add",
                        0
                    )

        # Start the ip monitor process
        process = subprocess.Popen(
            ["ip", "monitor", "link", "dev", "wlan0"],
            stdout=subprocess.PIPE,
            text=True,
            bufsize=1
        )
        
        # Read output line by line
        for line in process.stdout:
            # Extract the current state from the line
            current_state = None
            
            # Check for state UP
            if "state UP" in line:
                current_state = "UP"
            # Check for state DOWN
            elif "state DOWN" in line:
                current_state = "DOWN"
            # Check for state DORMANT
            elif "state DORMANT" in line:
                current_state = "DORMANT"
            # Check for LOWER_UP flag
            elif "<BROADCAST,MULTICAST,UP,LOWER_UP>" in line:
                current_state = "CONNECTED"
            # Check for NO-CARRIER flag
            elif "NO-CARRIER" in line:
                current_state = "DISCONNECTED"
            
            # If we couldn't determine a state from this line, skip it
            if current_state is None:
                continue
                
            logger.info(f"WiFi state: {current_state} (previous: {last_state})")
            
            # If the state has changed, update the display
            if current_state != last_state:
                #print(f"WiFi state changed from {last_state} to {current_state} calling update_display")
                text = f"Wi-Fi\n{current_state}"
                if (wifi_msg):
                    send_display_request(
                        text,
                        "cycle",
                        5,
                        "remove",
                        wifi_msg
                    )
                wifi_msg = send_display_request(
                    text,
                    "cycle",
                    5,
                    "add",
                    0
                )
                # Remove any hotspot related messages
                if (current_state == "UP") or (current_state == "DISCONNECTED" or (current_state == "CONNECTED")):
                    ssid = get_hotspot_status('wlan0')
                    if (ssid is None):
                        text="text\ntext"
                        if (msg_id_network_7 is not None):
                            send_display_request(text, 'cycle', 0, 'remove', msg_id_network_7)
                            msg_id_network_7 = None
                        if (msg_id_network_8 is not None):
                            send_display_request(text, 'cycle', 0, 'remove', msg_id_network_8)
                            msg_id_network_8 = None
                        if (msg_id_hotspot is not None):
                            send_display_request(text, 'cycle', 0, 'remove', msg_id_hotspot)
                            msg_id_hotspot = None

                update_display()
                manage_certificates()
                # Update the last known state
                last_state = current_state
    
    except Exception as e:
        print(f"Error monitoring WiFi status: {e}")
        # Wait before trying again
        time.sleep(10)
        # Restart the monitoring
        wifi_thread = threading.Thread(target=monitor_wifi_status)
        wifi_thread.daemon = True
        wifi_thread.start()

def send_display_request(text_to_display,msg_type,time_to_display,action,msg_id):
    try:
        url = "https://127.0.0.1:5000/display"
        lines = text_to_display.splitlines()
        if len(lines) < 2:
            lines.append("")

        if len(lines) < 3:
            lines.append("")

        data = {'line1': lines[0], 'line2': lines[1], 'line3': lines[2], 'type': msg_type, 'time_to_display': time_to_display, 'msg_req': action, 'msg_id': msg_id}
        response = requests.post(url, params=data,verify=False)
        if response.status_code == 200:
            #print(f"Display request sent successfully. Response: {response.text}")
            return response.text
        else:
            print(f"Error sending display request. Status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Error sending display request: {e}")

def update_YAML():
    """
    Updates YAML configuration files by invoking the update_YAML API endpoint.
    
    This function sends a request to the local API server to update YAML configuration
    files, typically when network conditions change (like VPN status changes).
    
    
    Returns:
        str or None: The response from the API server if successful, None otherwise.
    """
    try:
        # Prepare request data
        
            
        # Send the request to the API endpoint
        url = "https://127.0.0.1:5000/update_YAML"
        
        
        response = requests.post(url, verify=False)
            
        # Check if the request was successful
        if response.status_code == 200:
            #print(f"YAML update request sent successfully. Response: {response.text}")
            return response.text
        else:
            print(f"Error sending YAML update request. Status code: {response.status_code}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"Error sending YAML update request: {e}")
        return None


def get_system_timezone():

    """
    Gets the system timezone in the most efficient manner and stores it in a global variable.
    
    Returns:
        str: The system timezone (e.g., 'UTC', 'America/New_York')
    """
    global SYSTEM_TIMEZONE
    
    # Return cached value if available
    if SYSTEM_TIMEZONE is not None:
        return SYSTEM_TIMEZONE
    
    # Try to get timezone from /etc/timezone (fastest method)
    if os.path.exists('/etc/timezone'):
        try:
            with open('/etc/timezone', 'r') as f:
                SYSTEM_TIMEZONE = f.read().strip()
                return SYSTEM_TIMEZONE
        except:
            pass
    
    # Try to get timezone from timedatectl (works on systemd systems)
    try:
        output = subprocess.check_output(['timedatectl'], universal_newlines=True)
        for line in output.splitlines():
            if 'Time zone:' in line:
                SYSTEM_TIMEZONE = line.split(':', 1)[1].strip().split()[0]
                return SYSTEM_TIMEZONE
    except:
        pass
    
    # Fallback: use Python's datetime module
    try:
        now = datetime.now(timezone.utc).astimezone()
        SYSTEM_TIMEZONE = now.tzname()
        return SYSTEM_TIMEZONE
    except:
        pass
    
    # Last resort
    SYSTEM_TIMEZONE = 'Asia/Calcutta'
    return SYSTEM_TIMEZONE

def check_timezone_changes(sleep_interval=300):  # Check every 5 minutes by default
    """
    Monitors system timezone for changes and restarts services if needed.
    Uses minimal resources by checking infrequently and only taking action when needed.
    
    Args:
        sleep_interval: Time in seconds between checks
    """
    global SYSTEM_TIMEZONE
    
    # Initialize timezone on first run
    if SYSTEM_TIMEZONE is None:
        SYSTEM_TIMEZONE = get_system_timezone()
        
    
    while True:
        try:
            # Get current timezone
            current_tz = get_system_timezone()
            
            # Check if timezone has changed
            if current_tz != SYSTEM_TIMEZONE:
                print(f"Timezone changed from {SYSTEM_TIMEZONE} to {current_tz}")
                SYSTEM_TIMEZONE = current_tz
                
                # Update configuration files
                update_YAML()
                
                # Restart services
                services = [
                    "paperless.service", 
                    "joplin.service", 
                    "password-reset.service", 
                    "jellyfin.service", 
                    "immich.service", 
                    "vaultwarden.service"
                ]
                
                for service in services:
                    restart_service(service)
                    # Small delay between service restarts to reduce system load
                    time.sleep(5)
            
            # Sleep to avoid using CPU resources
            time.sleep(sleep_interval)
            
        except Exception as e:
            print(f"Error checking timezone: {e}")
            time.sleep(sleep_interval)

def send_api_request(path,data):
    try:
        url = "https://127.0.0.1:5000/" + str(path)

        if (data == None):
            response = requests.post(url, verify=False)
        else:
            response = requests.post(url, params=data,verify=False)

        if response.status_code == 200:
            print(f"API request sent successfully. Response: {response.text}")
            return response.text
        else:
            print(f"Error sending API request. Status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Error sending API request: {e}")


def get_ethernet_interface_and_is_up():
    try:
        # Get a list of available network interfaces
        #interfaces = netifaces.interfaces()
        #print(f"interfaces:{interfaces}")
        # Find the Ethernet interface
        global ETHERNET_INTERFACE

        result = subprocess.run(["networkctl"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        for line in result.stdout.split("\n"):
            if ETHERNET_INTERFACE in line:
                if "routable" in line:
                    #print(f"routable:{line}")
                    return True
                elif "no-carrier" in line:
                    #print(f"no-carrier:{line}")
                    return False
                elif "degraded" in line:
                    #print(f"degraded:{line}")
                    return False
                elif "off" in line:
                    return False
            else:
                continue
        return False # if not matching with above then we assume it's down
    except:
        return False

def stop_service(service_name):
    try:
        subprocess.run(["systemctl", "stop", service_name], check=True)
        print(f"Service '{service_name}' has been stopped.")
        return 'Stopped'
    except subprocess.CalledProcessError as e:
        print(f"Error stopping service '{service_name}': {e}")

def restart_service(service_name):
    try:
        subprocess.run(["systemctl", "restart", service_name], check=True)
        #print(f"Service '{service_name}' has been restarted.")
    except subprocess.CalledProcessError as e:
        print(f"Error restarting service '{service_name}': {e}")

def check_service_status_generic(service_name):
    try:
        result = subprocess.run(["systemctl", "status", service_name], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        #print(f"Service {service_name} status:\n{result.stdout}")
        for line in result.stdout.split("\n"):
            #print(f"{line}")
            if "Active: active" in line:
                short_status = line.split(":")[1].strip()
                short_1_status = short_status.split('(', 1)
                #print(f"Service2 {service_name} status: {short_status}\n{short_1_status[0]}")
               # return short_1_status[0]
                if 'active' in short_1_status[0]:
                    return 'Running'
            elif 'Active: inactive' in line:
                return 'Stopped'
    except subprocess.CalledProcessError:
        return 'Unknown'

def enable_service(service_name):
    try:
        subprocess.check_call(['systemctl', 'enable', service_name])
        print(f"Service '{service_name}' enabled successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error enabling service '{service_name}': {e}")

def start_service(service_name):
    try:
        subprocess.check_call(['systemctl', 'restart', service_name])
        print(f"Service '{service_name}' started successfully.")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error starting service '{service_name}': {e}")
        return False

def stop_service(service_name):
    try:
        subprocess.check_call(['systemctl', 'stop', service_name])
        print(f"Service '{service_name}' stopped successfully.")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error starting service '{service_name}': {e}")
        return False

def manage_certificates() -> str:
    # First check tailscale status
    if check_service_status("tailscaled.service") == "Up":
        hostname = get_tailscale_hostname()
        if hostname:
            # Remove trailing dot if present
            hostname = hostname.rstrip('.')
            cert_path = f"/etc/ssl/certs/{hostname}.crt"
            key_path = f"/etc/ssl/private/{hostname}.key"
            
            # Check if both certificate and key exist
            if os.path.exists(cert_path) and os.path.exists(key_path):
                try:
                    # Check certificate expiration using OpenSSL
                    cmd = f"openssl x509 -enddate -noout -in {cert_path}"
                    result = subprocess.check_output(cmd, shell=True, text=True)
                    expiry_str = result.strip().split('=')[1]
                    expiry_date = datetime.strptime(expiry_str, '%b %d %H:%M:%S %Y %Z')
                    
                    if expiry_date > datetime.now():
                        # Certificate is valid, update Traefik config
                        return update_traefik_config(cert_path, key_path)
                except Exception as e:
                    print(f"Error checking Tailscale certificate: {str(e)}")
    
    # If we reach here, either Tailscale is down or certificate is invalid/missing
    # Try OMV certificates
    try:
        cmd = ["omv-rpc", "-u", "admin", "CertificateMgmt", "getList", 
               '{"start":0,"limit":100,"sortfield":"name","sortdir":"asc"}']
        result = subprocess.check_output(cmd, text=True)
        cert_data = json.loads(result)
        
        if cert_data["total"] == 0:
            return "Error: No certificates found in OMV"
        
        # Check each certificate in the data array
        for cert in cert_data["data"]:
            valid_to = int(cert["validto"])
            current_time = int(time.time())
            
            if valid_to > current_time:
                # Found a valid certificate
                uuid = cert["uuid"]
                omv_cert_path = f"/etc/ssl/certs/openmediavault-{uuid}.crt"
                omv_key_path = f"/etc/ssl/private/openmediavault-{uuid}.key"
                
                if os.path.exists(omv_cert_path) and os.path.exists(omv_key_path):
                    return update_traefik_config(omv_cert_path, omv_key_path)
        
        return "Error: No valid certificates found"
        
    except Exception as e:
        return f"Error processing OMV certificates: {str(e)}"


def update_traefik_config(cert_file: str, key_file: str) -> str:
    try:
        url = f"https://127.0.0.1:5000/update_traefik_config"
        params = {
            "cert_file": cert_file,
            "key_file": key_file
        }
        
        response = requests.post(url, params=params, verify=False)
        response.raise_for_status()
        return "Successfully updated Traefik configuration"
    except requests.exceptions.RequestException as e:
        return f"Error updating Traefik configuration: {str(e)}"


#use only for tailscale as it has specific checks for it.
def check_service_status(service_name):
    try:
        # First check if service is running
        result = subprocess.run(["systemctl", "status", service_name], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        
        # For tailscaled service, check the online status from tailscale status --json
        if service_name == "tailscaled.service":
            # First check if service is active
            is_active = False
            for line in result.stdout.split("\n"):
                if "Active:" in line and "active" in line:
                    is_active = True
                    break
            
            if not is_active:
                return "Down"
            
            # Get the system hostname
            hostname_result = subprocess.run(["hostname"], capture_output=True, text=True)
            system_hostname = hostname_result.stdout.strip()
            
            # Get tailscale status in JSON format
            try:
                status_result = subprocess.run(["tailscale", "status", "--json"], 
                                              capture_output=True, text=True, check=True)
                status_data = json.loads(status_result.stdout)
                
                # Check if Self section exists and if Online is true
                if "Self" in status_data and "Online" in status_data["Self"]:
                    if status_data["Self"]["Online"]:
                        return "Up"
                    else:
                        return "Down"
                
                # Fallback check: look for the system hostname in the status data
                # and check if that peer is online
                if "Peer" in status_data:
                    for peer_id, peer_data in status_data["Peer"].items():
                        if peer_data.get("HostName") == system_hostname and peer_data.get("Online"):
                            return "Up"
            except Exception as e:
                print(f"Error checking tailscale status: {e}")
                return "Down"
            
            return "Down"  # Default to Down if we couldn't determine status
        
        # For other services, just check if they're active
        for line in result.stdout.split("\n"):
            if "Active:" in line:
                short_status = line.split(":")[1].strip()
                short_1_status = short_status.split('(', 1)
                if "active" in short_1_status[0]:
                    return "Up"
        
        return "Down"
    except subprocess.CalledProcessError:
        return "Down"


def get_tailscale_hostname():
    try:
        # Run the tailscale status command
        result = subprocess.run(['tailscale', 'status', '--json'],
                                capture_output=True, text=True, check=True)

        # The output is in JSON format, so we can parse it
        import json
        status = json.loads(result.stdout)

        # The hostname is in the 'Self' section
        hostname = status['Self']['DNSName']
        return hostname
    except subprocess.CalledProcessError as e:
        print(f"Error running tailscale command: {e}")
    except json.JSONDecodeError as e:
        print(f"Error parsing tailscale output: {e}")
    except KeyError as e:
        print(f"Unexpected tailscale output format: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    return None
def check_interface_configuration_status(interface):
    try:
        result = subprocess.run(["/usr/sbin/omv-confdbadm", "read", "conf.system.network.interface"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        valid_interface = 0
        #print(f"{interface}")
        for line in result.stdout.split("{"):
            for field in line.split(","):
                if "devicename" in field:
                    device_name = field.split(":")[1].strip()
                    #print(f"device_name:{device_name}")
                    if device_name == interface:
                        valid_interface = 1
                        #print(f"valid_interface:{valid_interface}")
                        #continue
                        interface_name = field.split(":")[1].strip()
                if valid_interface:
                    if "ssid" in field:
                        ssid = field.split(":")[1].strip()
                        #print(f"ssid:{ssid}")
                        if ssid == "":
                            return False
                        else:
                            return ssid


                    #print(f"interface_name:{interface_name}")
            #if interface in line:
        return False
    except subprocess.CalledProcessError as e:
        #print(f"Error checking interface '{interface}' status: {e}")
        return False

def get_connected_ssid():
    try:
        wifi = (subprocess.check_output(['iwgetid -r'], shell=True).decode())
        #print(f"wifi:{len(wifi)}")
        if (len(wifi.strip())>0):
            return wifi
        else:
            return False
    except subprocess.CalledProcessError:
        return False
def get_hotspot_status(interface):
    try:
        # Run the iwconfig command and capture its output
        output = subprocess.check_output(['iwconfig', interface], universal_newlines=True)
        # Split the output into lines
        lines = output.split('\n')
        # Iterate over the lines to find the Mode
        for line in lines:
            if 'Mode:' in line:
                mode_1 = line.split('Mode:')[1].strip()
                mode = mode_1.split(' ')[0].strip()
                #print(f"mode: {mode}")
                if (mode == "Master"):
                    hostapd_conf_file = '/etc/hostapd/hostapd.conf'
                    with open(hostapd_conf_file, 'r') as f:
                        lines = f.readlines()
                        for line in lines:
                            if 'ssid' in line:
                                ssid = line.split('=')[1].strip()
                                if (ssid):
                                    print(f"{ssid}")
                                    return ssid
                # If Mode is not found, return None
                else:
                    return None
    except subprocess.CalledProcessError as e:
        #print(f"Error executing iwconfig: {e}")
        return None


def get_hotspot_password():
    try:
        password = None
        hostapd_conf_file = '/etc/hostapd/hostapd.conf'
        with open(hostapd_conf_file, 'r') as f:
            lines = f.readlines()
            for line in lines:
                if 'wpa_passphrase' in line:
                    password = line.split('=')[1].strip()
                    if (password is not None):
                        #print(f"{password}")
                        return password
        return False
    except subprocess.CalledProcessError as e:
        #print(f"Error executing iwconfig: {e}")
        return None


def get_hostname():
    try:
        # Check if tailscaled service is running
        if (check_service_status("tailscaled.service") == "Up"):
            hostname = get_tailscale_hostname()
        else:
            # Get system IP address instead of hostname
          
            
            # Try multiple methods to get IP address
            ip_address = None
            
            # Method 1: Using 'ip' command
            try:
                cmd = "ip route get 1 | awk '{print $(NF-2);exit}'"
                ip_address = subprocess.check_output(cmd, shell=True, text=True).strip()
                if not ip_address or not is_valid_ip(ip_address):
                    raise Exception("Invalid IP")
            except:
                # Method 2: Using network interfaces
                try:
                    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                    # Doesn't need to be reachable
                    s.connect(('10.255.255.255', 1))
                    ip_address = s.getsockname()[0]
                    s.close()
                except:
                    # Method 3: Fallback to localhost
                    ip_address = '127.0.0.1'
            
            hostname = ip_address
            
        if hostname.endswith('.'):
            return hostname[:-1]
        return hostname
    except:
        return "Unable to get hostname"

def is_valid_ip(ip):
    """Check if the IP address is valid"""
    try:
        parts = ip.split('.')
        return len(parts) == 4 and all(0 <= int(part) <= 255 for part in parts)
    except:
        return False

def stop_hotspot():
    """
    Stops the Wi-Fi hotspot and reverses all changes made by start_hotspot().
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Stop and disable all hotspot-related services
        subprocess.run(["systemctl", "stop", "hostapd.service"], check=True)
        subprocess.run(["systemctl", "disable", "hostapd.service"], check=True)
        subprocess.run(["systemctl", "stop", "dnsmasq.service"], check=True)
        subprocess.run(["systemctl", "disable", "dnsmasq.service"], check=True)
        subprocess.run(["systemctl", "stop", "hotspot-ip.service"], check=True)
        subprocess.run(["systemctl", "disable", "hotspot-ip.service"], check=True)
        
        # Remove the custom systemd service files
        #if os.path.exists('/etc/systemd/system/hotspot-ip.service'):
        #    os.remove('/etc/systemd/system/hotspot-ip.service')
        
        # Remove the systemd override files
        #if os.path.exists('/etc/systemd/system/dnsmasq.service.d/override.conf'):
        #    os.remove('/etc/systemd/system/dnsmasq.service.d/override.conf')
        #if os.path.exists('/etc/systemd/system/hostapd.service.d/override.conf'):
        #    os.remove('/etc/systemd/system/hostapd.service.d/override.conf')
        
        # Restore resolv.conf if needed
        #if os.path.exists('/etc/resolv.conf'):
        #    with open('/etc/resolv.conf', 'w') as f:
        #        f.write("nameserver 127.0.0.53\n")
        
        # Enable and restart systemd-resolved
        subprocess.run(["systemctl", "enable", "systemd-resolved.service"], check=True)
        #subprocess.run(["systemctl", "restart", "systemd-resolved.service"], check=True)
        
        # Bring down the wireless interface
        #subprocess.run(["ip", "link", "set", "dev", "wlan0", "down"], check=True)
        
        # Flush IP address from wlan0
        #subprocess.run(["ip", "addr", "flush", "dev", "wlan0"], check=True)
        
        # Reload systemd to recognize the changes
        subprocess.run(["systemctl", "daemon-reload"], check=True)
        
        # Restart networking service to apply normal network configuration
        #subprocess.run(["systemctl", "restart", "networking"], check=True)
        
        # Restart wpa_supplicant to reconnect to regular Wi-Fi networks
        #subprocess.run(["systemctl", "restart", "wpa_supplicant"], check=True)
        
        # Display status message
        #text = "Hotspot\nStopped"
        #send_display_request(text, "once", 5, "add", 0)
        
        print("Hotspot stopped successfully")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"Error stopping hotspot: {e}")
        return False



def get_interface_ip(interface):
    try:
        # Get a list of available network interfaces
        interfaces = netifaces.interfaces()
        #print(f"interfaces:{interfaces}")

        for i,string in enumerate(interfaces):
            #print(f"interface {i}:{string}")
            if (string == interface):
                interface_status = netifaces.ifaddresses(string)
                #print(f"vpn_interface_status:{interface_status}")
            # Check if the interface has a valid IP address
                if netifaces.AF_INET in interface_status:
                    ip_address = interface_status[netifaces.AF_INET][0]['addr']
                    #print(f"vpn_ip:{ip_address}")
                    return ip_address
                else:
                    return False
            else:
                continue
    except:
        return False

def get_default_gateway():
    try:
        # Get the default gateway using the netifaces module
        gateways = netifaces.gateways()
        default_gateway = gateways['default'][netifaces.AF_INET][0]
        return default_gateway
    except:
        return None

def is_gateway_reachable(gateway_ip):
    try:
        # Use the ping command to check if the gateway is reachable
        subprocess.check_output(['ping', '-c', '1', gateway_ip], universal_newlines=True)
        return True
    except subprocess.CalledProcessError:
        return False
def is_internet_connected():
    try:
        # Try connecting to a public DNS server (Google DNS at 8.8.8.8, port 53).
        socket.create_connection(("8.8.8.8", 53), timeout=3)
        return True
    except (socket.timeout, socket.gaierror, OSError) as e:
        # Handle specific exceptions more clearly
       # print(f"Error checking internet connection: {e}")
        return False

def get_interface_ip(ifname):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        ip_address = socket.inet_ntoa(fcntl.ioctl(
            s.fileno(),
            0x8915,  # SIOCGIFADDR
            struct.pack('256s', bytes(ifname[:15], 'utf-8'))
        )[20:24])
        return ip_address
    except Exception as e:
        #print(f"Error getting IP address for {ifname}: {e}")
        return None
def set_interface_ip(ifname, ip_address, netmask):
    try:
        result = subprocess.run(["ifconfig", ifname, ip_address, "netmask", netmask], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        #print(f"IP address {ip_address}/{netmask} assigned to {ifname} successfully.")
        return True
    except Exception as e:
        #print(f"Error assigning IP address to {ifname}: {e}")
        return False


def remove_stale_disks_from_photoprism_instance():
    try:
        #print(f"IN REMOVE STALE DISKS ")
        DOCKER_COMPOSE_FILE = '/etc/photoprism/docker-compose.yml'
        with open(DOCKER_COMPOSE_FILE, 'r') as file:
            data = yaml.safe_load(file)
        file.close()
        volumes = data['services']['photoprism']['volumes']
        #first check if this directory exists within container
        check_dir_cmd = f"docker compose -f {DOCKER_COMPOSE_FILE} exec photoprism test -d '/photoprism/originals/external-storage'"
        dir_exists = subprocess.call(check_dir_cmd, shell=True) == 0
        if (dir_exists):
            # find all the subdirectories in the container under base path /photoprism/originals/external-storage
            command = f'docker compose -f {DOCKER_COMPOSE_FILE} exec photoprism bash -c "find /photoprism/originals/external-storage -mindepth 1 -maxdepth 1"'
            result = subprocess.check_output(command, shell=True, text=True).strip()
            directories = result.split('\n')
            stale_dir=[]
            for directory in directories:
                stale=1
                for i, volume in enumerate(volumes):
                    #print(f"volume name is {volume}")
                    if i == 0: # first line in volumes is for cache storage so we skip it
                        continue
                    if i == 1: # first line in volumes is for internal storage home directory so we skip it
                        continue
                    if i == 2: # first line in volumes is for internal storage home directory so we skip it
                        continue
                    # if directory is same as volumes then continue
                    if (volume.split(":")[1] == directory):
                        stale=0 #valid directory
                        continue
                if (stale==1): #stale directory
                    stale_dir.append(directory)
            #delete all stale_dir
            for directory in stale_dir:
                empty_cmd = f"docker compose -f {DOCKER_COMPOSE_FILE} exec photoprism find '{directory}' -mindepth 1 -maxdepth 1 | read v"
                is_empty = subprocess.call(empty_cmd, shell=True) != 0
                if is_empty:
                    cmd = f'docker compose -f {DOCKER_COMPOSE_FILE} exec photoprism bash -c "rmdir {directory}"'
                    output = subprocess.check_output(cmd, shell=True, text=True).strip()
            # remove /photoprism/originals/external-storage if no external storage left
            #check if this directory is empty within this container
            empty_cmd = f"docker compose -f {DOCKER_COMPOSE_FILE} exec photoprism find '/photoprism/originals/external-storage' -mindepth 1 -maxdepth 1 | read v"
            is_empty = subprocess.call(empty_cmd, shell=True) != 0
            if is_empty:
                cmd = f'docker compose -f {DOCKER_COMPOSE_FILE} exec photoprism bash -c "rmdir /photoprism/originals/external-storage"'
                output = subprocess.check_output(cmd, shell=True, text=True).strip()
        return True
    except subprocess.CalledProcessError as e:
        #print(f"An error occurred: {e}")
        return False



def get_home_directory(username=None):
    """
    Get home directory path for a user
    Args:
        username: Optional username. If None, returns current user's home
    Returns:
        Path to user's home directory
    """
    try:
        if username is None:
            # Get current user's home directory
            return str(Path.home())
            # Alternative methods:
            # return os.path.expanduser('~')
            # return os.environ.get('HOME')
        else:
            # Get specific user's home directory
            return pwd.getpwnam(username).pw_dir

    except KeyError:
        return f"User {username} not found"
    except Exception as e:
        return f"Error getting home directory: {e}"


def print_sync_status(status):
    """
    Print formatted status information
    """
    print(f"\nOneDrive Status for user: {status['username']}")
    print("-" * 40)
    print(f"Valid configuration: {status['has_valid_config']}")
    print(f"Sync disabled: {status['sync_disabled']}")
    print(f"Process running: {status['is_running']}")
    print(f"Active sync: {status['is_syncing']}")

    if status['action_taken']:
        print(f"Action taken: {status['action_taken']}")

    if status['error']:
        print(f"Error: {status['error']}")

    if status['details']:
        print("\nDetails:")
        for key, value in status['details'].items():
            print(f"  {key}: {value}")




def delete_interface(interface):
    try:
        result = subprocess.run(["/usr/sbin/omv-confdbadm", "read", "conf.system.network.interface"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        valid_interface = 0
        print(f"{interface}")
        for line in result.stdout.split("{"):
            for field in line.split(","):
                if "uuid" in field:
                    uuid_1 = field.split(":")[1].strip()
                    #print(f"uuid_1:{uuid_1}")
                if "devicename" in field:
                    device_name = field.split(":")[1].strip()
                    print(f"device_name:{device_name}")
                    if device_name == interface:
                        valid_interface = 1
                        print(f"valid_interface:{valid_interface}")
                        #continue
                        #interface_name = field.split(":")[1].strip()
                if valid_interface:
                    #if "uuid" in field:
                    #    uuid = field.split(":")[1].strip()
                    uuid = uuid_1[1:-1]
                    print(f"uuid:{uuid}")
                    if uuid == "":
                        return False
                    else:
                        result = subprocess.run(["/usr/sbin/omv-confdbadm", "delete", "--uuid", uuid, "conf.system.network.interface"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
                        print(f"result: {result}")
                        result = subprocess.run(["/usr/sbin/omv-salt", "deploy", "run", "systemd-networkd"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
                        print(f"result: {result}")
                        return True
                    #print(f"interface_name:{interface_name}")
    except subprocess.CalledProcessError:
        return False
'''
def update_photoprism_YAML(user):
    try:
        global MANDATORY_USER

        if (user==MANDATORY_USER):
            photoprism_yaml = '/etc/photoprism/docker-compose.yml'
        else:
            photoprism_yaml = f'/home/{user}/.docker-compose.yml'

        try:
            #check if photoprism yaml file exists
            if (not os.path.isfile(photoprism_yaml)):
                #print("photoprism yaml file does not exist")
                return False
            with open(photoprism_yaml, 'r') as file:
                data = yaml.safe_load(file)
            file.close()
        except Exception as e:
           # print(f"Error1 updating photoprism YAML file: {e}")
            return False

        hostname=get_hostname()
        data['services']['photoprism']['environment']['PHOTOPRISM_SITE_URL'] = f'http://{hostname}/{user}'

        try:
            with open(photoprism_yaml, 'w') as file:
                fcntl.flock(file.fileno(), fcntl.LOCK_EX)
                yaml.dump(data, file, default_flow_style=False)
                # Release the lock
                fcntl.flock(file.fileno(), fcntl.LOCK_UN)
            file.close()
        except:
           # print("Error: Unable to write to YAML file")
            return False
        return True
    except Exception as e:
        #print(f"Error updating photoprism YAML file: {e}")
        return False
'''
def update_vaultwarden_domain() -> bool:
    """
    Update the DOMAIN environment variable in vaultwarden docker-compose yaml
    
    Returns:
        bool: True if successful, False if failed, None if file doesn't exist
    """
    yaml_path = '/etc/vault-warden/docker-compose-vaultwarden.yml'
    
    # Check if file exists
    if not os.path.isfile(yaml_path):
        return None

    try:
        # Get hostname
        hostname = get_hostname()
        if not hostname:
            return False

        # Read existing YAML file
        with open(yaml_path, 'r') as file:
            try:
                config = yaml.safe_load(file)
            except yaml.YAMLError:
                return False

        if hostname is not None:
            # Create a new environment list instead of modifying during iteration
            new_env = []
            domain_found = False
            
            # If environment exists, check existing variables
            if 'environment' in config['services']['vaultwarden']:
                for item in config['services']['vaultwarden']['environment']:
                    if isinstance(item, str) and item.startswith('DOMAIN='):
                        new_env.append(f'DOMAIN=https://{hostname}/passwords/')
                        domain_found = True
                    else:
                        new_env.append(item)
            
            # If domain wasn't found, add it
            if not domain_found:
                new_env.append(f'DOMAIN=https://{hostname}/passwords/')
            
            # Update the environment with the new list
            config['services']['vaultwarden']['environment'] = new_env

        # Write updated YAML back to file
        with open(yaml_path, 'w') as file:
            yaml.dump(config, file, default_flow_style=False)
        
        return True

    except (IOError, OSError) as e:
        print(f"Error updating vaultwarden domain: {e}")
        return False




def update_jellyfin_domain() -> bool:
    """
    Update the JELLYFIN_PublishedServerUrl environment variable in jellyfin docker-compose yaml
    

    
    Returns:
        bool: True if successful, False if failed, None if file doesn't exist
    """
    yaml_path = '/etc/jellyfin/docker-compose.yml'
    
    # Check if file exists
    if not os.path.isfile(yaml_path):
        return None

    try:
        # Get hostname
        hostname = get_hostname()
        if not hostname:
            return False

        # Read existing YAML file
        with open(yaml_path, 'r') as file:
            try:
                config = yaml.safe_load(file)
            except yaml.YAMLError:
                return False


        if (hostname != None):
            domain_found = 0
            #print(f"hostname is {hostname}")
            for i, item in enumerate(config['services']['jellyfin']['environment']):
                if item.startswith('JELLYFIN_PublishedServerUrl'):
                    config['services']['jellyfin']['environment'][i] = f'JELLYFIN_PublishedServerUrl=https://{hostname}:8097/'
                    domain_found = 1
                
            
            if domain_found == 0:
                # Append with correct format without newline
                config['services']['jellyfin']['environment'].append(f'JELLYFIN_PublishedServerUrl=https://{hostname}:8097/')
                

        # Write updated YAML back to file
        with open(yaml_path, 'w') as file:
            yaml.dump(config, file, default_flow_style=False)
        
        return True

    except (IOError, OSError):
        return False

def update_immich_json() -> bool:
    """
    Updates the externalDomain field in /etc/immich/immich.json with funnel URL if enabled,
    otherwise with https://{hostname}:2284
    Returns True if successful, False otherwise
    """
    try:
        json_file = '/etc/immich/immich.json'
        
        # Check if file exists
        if not os.path.exists(json_file):
            return False
            
        # Get hostname
        hostname = get_hostname()
        if not hostname:
            return False

        try:
            # Check funnel status using omv-rpc
            cmd = ["omv-rpc", "-u", "admin", "Homecloud", "getFunnelStatus", '{"appname":"immich"}']
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            funnel_status = json.loads(result.stdout)

            # Open file with exclusive lock
            with open(json_file, 'r+') as file:
                # Acquire exclusive lock
                fcntl.flock(file.fileno(), fcntl.LOCK_EX)
                
                try:
                    # Read and parse JSON
                    config = json.load(file)
                    
                    # Update the externalDomain field based on funnel status
                    if (funnel_status.get('status') == 'Enabled' and 
                        funnel_status.get('app') == 'immich' and 
                        funnel_status.get('url')):
                        config['server']['externalDomain'] = funnel_status['url']
                    else:
                        config['server']['externalDomain'] = f"https://{hostname}:2284"
                    
                    # Move file pointer to beginning
                    file.seek(0)
                    
                    # Write updated JSON
                    json.dump(config, file, indent=2)
                    
                    # Truncate remaining content if new content is shorter
                    file.truncate()
                    
                finally:
                    # Release lock
                    fcntl.flock(file.fileno(), fcntl.LOCK_UN)
                    
            return True
            
        except (subprocess.CalledProcessError, json.JSONDecodeError) as e:
            print(f"Error checking funnel status: {str(e)}")
            return False
            
    except Exception as e:
        print(f"Error updating immich.json: {str(e)}")
        return False


def update_paperless_url():
    """
    Update PAPERLESS_URL by calling the API endpoint.
    Returns True if successful, False if any error occurs.
    """
    try:
        # Get hostname
        hostname = get_hostname()
        if not hostname:
            return False
            
        new_url = f"https://{hostname}"
        
        # Update configuration through API endpoint
        try:
            update_response = subprocess.run(
                ['curl', '--insecure', '--request', 'POST', 
                 'https://127.0.0.1:5000/update_paperless-ngx_env'],
                check=True,
                capture_output=True,
                text=True
            )
            print(f"Successfully updated paperless-ngx configuration: {update_response.stdout}")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"Failed to update paperless-ngx configuration via API: {e}")
            return False
        
    except Exception as e:
        print(f"Unexpected error: {e}")
        return False
        

def reboot_system():
    try:
        # Check if the user has the necessary permissions to reboot
        if os.geteuid() != 0:
           # print("You need to have root privileges to reboot the system.")
            return

        # Reboot the system
        subprocess.run(["reboot"], check=True)
        #print("System is rebooting...")

    except subprocess.CalledProcessError as e:
        print(f"Error rebooting the system: {e}")

def check_swap_space(): #returns amount of free swap space in MB
    try:
        # Get swap memory details
        swap = psutil.swap_memory()

        # Available swap in bytes
        available_swap = swap.free

        # Convert to megabytes
        available_swap_mb = available_swap / (1024 ** 2)
        return available_swap_mb

    except Exception as e:
        return False

def run_smbstatus():
    try:
        result = subprocess.run(
            ['smbstatus'],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            # If JSON format isn't supported, fall back to parsing text output
            result = subprocess.run(
                ['smbstatus'],
                capture_output=True,
                text=True
            )
        return result.stdout
    except subprocess.SubprocessError as e:
        self.logger.error(f"Error running smbstatus: {str(e)}")
        return None



def refresh_dhcp_ip(interface):
    try:
        # Release the current DHCP lease
        subprocess.run(['dhclient', '-r', interface], check=True)
        #print(f"Released DHCP lease on {interface}")

        # Request a new DHCP lease
        subprocess.run(['dhclient', interface], check=True)
        #print(f"Obtained a new DHCP lease on {interface}")

    except subprocess.CalledProcessError as e:
        print(f"Error refreshing DHCP IP on {interface}: {e}")
def start_photoprism_service(user):
    #multi-user
    user_info = pwd.getpwnam(user)
    if (user == MANDATORY_USER):
        DOCKER_COMPOSE_FILE= "/etc/photoprism/docker-compose.yml"
    else:
        DOCKER_COMPOSE_FILE= user_info.pw_dir + "/.docker-compose.yml"

    if os.path.exists("/tmp/photoprism-start-stop-in-progress"):
        return False
    else:
        if (os.path.isfile(DOCKER_COMPOSE_FILE)):
            try:
                subprocess.run(["touch", "/tmp/photoprism-start-stop-in-progress"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
                subprocess.run(["docker", "compose", "-f", DOCKER_COMPOSE_FILE, "up", "--detach"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
                subprocess.run(["rm", "-f", "/tmp/photoprism-start-stop-in-progress"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
                if (user == MANDATORY_USER):
                    remove_stale_disks_from_photoprism_instance() #only for mandatory user as external disks are only mounted for this user
                return True
            except:
                return False

def stop_photoprism_service(user):
    global MANDATORY_USER
    #multi-user
    user_info = pwd.getpwnam(user)
    if (user == MANDATORY_USER):
        DOCKER_COMPOSE_FILE= "/etc/photoprism/docker-compose.yml"
    else:
        DOCKER_COMPOSE_FILE= user_info.pw_dir + "/.docker-compose.yml"

    if os.path.exists("/tmp/photoprism-start-stop-in-progress"):
        return False
    else:
        if (os.path.isfile(DOCKER_COMPOSE_FILE)):
            try:
                subprocess.run(["touch", "/tmp/photoprism-start-stop-in-progress"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
                subprocess.run(["docker", "compose", "-f", DOCKER_COMPOSE_FILE, "down"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
                subprocess.run(["rm", "-f", "/tmp/photoprism-start-stop-in-progress"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
                return True
            except:
                return False

def start_indexing_photoprism(user):
    #global indexing_in_progress
    # Create a Docker client
    client = docker.from_env()
    container = client.containers.get(photoprism_container_name)
    journal = systemd.journal.JournalHandler()
    #multi-user
    user_info = pwd.getpwnam(user)
    DOCKER_COMPOSE_FILE= user_info.pw_dir + "/.docker-compose.yml"
    #command = 'docker compose -f /etc/photoprism/docker-compose.yml exec photoprism bash -c "photoprism index 2>&1 | tee /proc/1/fd/1"'
    command = f'docker compose -f {DOCKER_COMPOSE_FILE} exec photoprism bash -c "photoprism index 2>&1 | tee /proc/1/fd/1"'




    #def stream_process_output(process):
    #    for line in iter(process.stderr.readline, b''):
    #        journal.send(line.encode().decode('utf-8').rstrip())

    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True,shell=True)

    try:
        result = subprocess.run(command, check=True, stdout=subprocess.PIPE, universal_newlines=True)
        #print(f"result: {result}")

        return True
    except:
        return False

#multi-user
def list_user_accounts_with_login():
    if os.geteuid() != 0:
        print("This script requires root privileges to access shadow password information.")
        print("Please run it with sudo.")
        exit(1)


    users_with_login=[]
    for user in pwd.getpwall():
        # Skip users with nologin or false shells
        if user.pw_shell.endswith(('nologin', 'false')):
            continue

        try:
            # Try to get shadow password entry
            spwd.getspnam(user.pw_name)
        except KeyError:
            # Skip if no shadow password entry (usually means login is disabled)
            continue

        # Check if home directory exists
        if not os.path.exists(user.pw_dir):
            continue

        users_with_login.append(f'{user.pw_name}:{user.pw_shell}')

    #weed out root and sync user
    users_with_login = [user for user in users_with_login if user.split(":")[0] != "root" and user.split(":")[0] != "sync"]
    #print(f"users_with_login: {users_with_login}")
    return users_with_login

def get_disk_space(path):
    """
    Get available disk space for the filesystem containing the given path
    Returns tuple of (available_percentage, available_gb)
    """
    try:
        stat = os.statvfs(path)

        # Get total and available blocks
        total_blocks = stat.f_blocks
        free_blocks = stat.f_bfree
        avail_blocks = stat.f_bavail  # Available to non-superuser
        block_size = stat.f_frsize

        # Calculate total and available space in bytes
        total_size = total_blocks * block_size
        avail_size = avail_blocks * block_size

        # Convert to GB
        available_gb = avail_size / (1024**3)

        # Calculate percentage available
        available_percent = (avail_blocks / total_blocks) * 100

        return (round(available_percent, 0), round(available_gb, 1))

    except OSError as e:
        return f"Error getting disk space: {e}"


def check_photoprism_service(user):
    #multi-user
    user_info = pwd.getpwnam(user)
    if (user == MANDATORY_USER):
        DOCKER_COMPOSE_FILE= "/etc/photoprism/docker-compose.yml"
    else:
        DOCKER_COMPOSE_FILE= user_info.pw_dir + "/.docker-compose.yml"
    #print(f"DOCKER_COMPOSE_FILE:{DOCKER_COMPOSE_FILE}")
    if (os.path.isfile(DOCKER_COMPOSE_FILE)):
        try:
            result = subprocess.run(["docker", "compose", "-f", DOCKER_COMPOSE_FILE, "ps"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
            if "photoprism/photoprism" in result.stdout:
                #print(f"photoprism service is running for {user}")
                return True
            else:
                #print(f"photoprism service is NOT running for {user}")
                return False
        except:
            return False


def is_process_running(process_name):
    #print (process_name)
    output = subprocess.check_output(['ps', 'aux'])
    #print (output)
    if process_name.lower() in output.decode().lower():
        return True
    return False

def get_users_with_home_directories():
    users = []
    for user in pwd.getpwall():
        if os.path.isdir(user.pw_dir) and user.pw_dir.startswith('/home/'):
            users.append(user.pw_name)
    return users

def retrieve_running_docker_container(name):
    try:
        client = docker.from_env()
        # Get running containers
        running_containers = client.containers.list(filters={'status': 'running'})

        # Search for a container with the given name
        for container in running_containers:
            if (name in container.name):
                return container.name

    except subprocess.CalledProcessError:
        return None

def check_photoprism_logs_is_indexing_active():
    try:
        docker_logs_1 = subprocess.run(["docker", "compose", "-f", "/etc/photoprism/docker-compose.yml", "logs", "photoprism","--tail=1"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        time.sleep(SLEEP_TIME)
        docker_logs_2 = subprocess.run(["docker", "compose", "-f", "/etc/photoprism/docker-compose.yml", "logs", "photoprism","--tail=1"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        time.sleep(SLEEP_TIME*2)
        docker_logs_3 = subprocess.run(["docker", "compose", "-f", "/etc/photoprism/docker-compose.yml", "logs", "photoprism","--tail=1"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        time.sleep(SLEEP_TIME*4)
        docker_logs_4 = subprocess.run(["docker", "compose", "-f", "/etc/photoprism/docker-compose.yml", "logs", "photoprism","--tail=1"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
       # print(f"hash:",{hash(str(docker_logs_1))},{hash(str(docker_logs_2))},{hash(str(docker_logs_3))},{hash(str(docker_logs_4))})
        #print(f"len:",{len(str(docker_logs_1))},{len(str(docker_logs_2))},{len(str(docker_logs_3))},{len(str(docker_logs_4))})
        #if (len(str(docker_logs_1)) != len(str(docker_logs_2))) or (len(str(docker_logs_2)) != len(str(docker_logs_3))) or (len(str(docker_logs_1)) != len(str(docker_logs_3))) or (len(str(docker_logs_1)) != len(str(docker_logs_4))):
        if (hash(str(docker_logs_1)) != hash(str(docker_logs_2))) or (hash(str(docker_logs_2)) != hash(str(docker_logs_3))) or (hash(str(docker_logs_1)) != hash(str(docker_logs_3))) or (hash(str(docker_logs_1)) != hash(str(docker_logs_4))):
            # some activity ongoing as logs moving. Let's find out if it's indexing or WEBDAV file copying
            for line in docker_logs_4.stdout.split("\n"):
                if ("webdav" in line):
                    if ("MOVE" or "PUT" or "mtime" or "DELETE" in line):
                        #print(f"FILE COPYING")
                        return "file-copy"
                else:
                    return "indexing"
        else:
            return "idle"

    except subprocess.CalledProcessError:
        return None

def parse_active_transfers(smbstatus_output):
    active_transfers = False
    #print(f"smbstatus_output is {smbstatus_output}")
    # Try to identify locked files which typically indicate transfers
    locked_files_section = False

    for line in smbstatus_output.split('\n'):
       # print(f"line is {line}")
        # Skip empty lines
        if not line.strip():
            continue

        # Look for the locked files section
        if "Locked files:" in line:
            locked_files_section = True
            #print(f"locked files section is {locked_files_section}")
            continue

        if locked_files_section:
            # Skip header lines
            if "Pid" in line and "User" in line:
                active_transfers = True

  #  print(f"active_transfers is {active_transfers}")
    return active_transfers

def check_tmp_space():
    try:
        # Get disk usage statistics for /tmp
        tmp_stats = os.statvfs('/tmp')
        
        # Calculate free space in bytes
        # statvfs_result.f_frsize = fundamental filesystem block size
        # statvfs_result.f_bavail = free blocks available to non-superuser
        free_bytes = tmp_stats.f_frsize * tmp_stats.f_bavail
        
        # Convert to MB for comparison (1MB = 1024*1024 bytes)
        free_mb = free_bytes / (1024 * 1024)
        
        #print(f"Free space in /tmp: {free_mb:.2f} MB")
        
        # Check if free space is below 1MB
        if free_mb < 1:
            #print("Warning: /tmp space critically low. Initiating system reboot...")
            text = f"Restarting\nHomecloud"
            send_display_request(text, 'once', 5, 'add', 0)
            # Sync filesystem buffers
            subprocess.run(['sync'], check=True)
            
            # Reboot system - requires root privileges
            subprocess.run(['reboot'], check=True)
            
        return free_mb
            
    except Exception as e:
        print(f"Error checking /tmp space: {str(e)}", file=sys.stderr)
        return None

'''
def check_internet_reachability(interface_name: str) -> bool:
    """
    Checks if the internet is reachable through the specified interface.
    
    Args:
        interface_name (str): The name of the interface to check
        
    Returns:
        bool: True if the internet is reachable through this interface, False otherwise
    """
    try:
        # Try to ping Google's DNS server (8.8.8.8) through the specified interface
        # -I specifies the interface, -c 1 sends just one packet, -W 2 sets a 2-second timeout
        result = subprocess.run(
            ["ping", "-I", interface_name, "-c", "1", "-W", "2", "8.8.8.8"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False  # Don't raise an exception if ping fails
        )
        
        # Check if ping was successful (return code 0)
        if result.returncode == 0:
            return True
            
        # If ping failed, try an alternative method using curl
        # This is useful for interfaces that might block ICMP but allow HTTP
        try:
            # Use curl with a specific interface to check connectivity
            # --interface specifies the interface, --max-time 5 sets a 5-second timeout
            curl_result = subprocess.run(
                ["curl", "--interface", interface_name, "--max-time", "5", "--silent", "--head", "https://www.google.com"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=False
            )
            
            # If curl succeeded (return code 0), internet is reachable
            return curl_result.returncode == 0
            
        except (subprocess.SubprocessError, FileNotFoundError):
            # If curl is not available or fails, fall back to the ping result
            return False
            
    except (subprocess.SubprocessError, FileNotFoundError):
        # If ping command fails or is not available
        return False

def get_all_outbound_interfaces() -> List[Dict[str, any]]:
    """
    Determines all network interfaces that are currently used for sending outbound traffic
    by checking all default routes in the routing table. Also checks internet reachability
    through each interface.
    
    Returns:
        List[Dict]: A list of dictionaries containing information about each outbound interface:
                   [
                       {
                           'name': 'eth0',
                           'is_up': True,
                           'ip_address': '192.168.1.2',
                           'mac_address': '00:11:22:33:44:55',
                           'metric': 100,
                           'gateway': '192.168.1.1',
                           'is_primary': True,  # The route with the lowest metric
                           'internet_reachable': True  # Can reach the internet through this interface
                       },
                       ...
                   ]
    """
    outbound_interfaces = []
    
    try:
        # Get all default routes
        result = subprocess.run(
            ["ip", "route", "show", "default"],
            check=True,
            stdout=subprocess.PIPE,
            universal_newlines=True
        )
        
        routes = result.stdout.strip().split('\n')
        if not routes or not routes[0]:
            return outbound_interfaces
        
        # Parse routes to extract interface and metric
        default_routes = []
        for route in routes:
            # Skip empty lines
            if not route.strip():
                continue
                
            # Extract interface name
            dev_match = re.search(r'dev\s+(\S+)', route)
            if not dev_match:
                continue
                
            interface = dev_match.group(1)
            
            # Extract metric (default is 0 if not specified)
            metric = 0
            metric_match = re.search(r'metric\s+(\d+)', route)
            if metric_match:
                metric = int(metric_match.group(1))
                
            # Extract gateway
            gateway = "unknown"
            via_match = re.search(r'via\s+(\S+)', route)
            if via_match:
                gateway = via_match.group(1)
                
            default_routes.append({
                'name': interface,
                'metric': metric,
                'gateway': gateway,
                'route': route,
                'is_up': False,
                'ip_address': 'unknown',
                'mac_address': 'unknown',
                'is_primary': False,
                'internet_reachable': False
            })
        
        if not default_routes:
            return outbound_interfaces
            
        # Sort by metric (lowest first)
        default_routes.sort(key=lambda x: x['metric'])
        
        # Mark the route with lowest metric as primary
        if default_routes:
            default_routes[0]['is_primary'] = True
        
        # Get additional information for each interface
        for route_info in default_routes:
            interface_name = route_info['name']
            
            # Check if the interface is up
            try:
                link_result = subprocess.run(
                    ["ip", "link", "show", interface_name],
                    check=True,
                    stdout=subprocess.PIPE,
                    universal_newlines=True
                )
                route_info['is_up'] = "state UP" in link_result.stdout
            except subprocess.CalledProcessError:
                route_info['is_up'] = False
            
            # Get IP address and MAC address
            try:
                addr_result = subprocess.run(
                    ["ip", "addr", "show", interface_name],
                    check=True,
                    stdout=subprocess.PIPE,
                    universal_newlines=True
                )
                
                # Extract IP address using regex
                ip_match = re.search(r'inet\s+(\d+\.\d+\.\d+\.\d+)', addr_result.stdout)
                if ip_match:
                    route_info['ip_address'] = ip_match.group(1)
                
                # Extract MAC address using regex
                mac_match = re.search(r'link/ether\s+([0-9a-f:]{17})', addr_result.stdout)
                if mac_match:
                    route_info['mac_address'] = mac_match.group(1)
            except subprocess.CalledProcessError:
                pass
            
            # Check internet reachability through this interface
            if route_info['is_up']:
                route_info['internet_reachable'] = check_internet_reachability(interface_name)
            
            outbound_interfaces.append(route_info)
        
        return outbound_interfaces
        
    except subprocess.CalledProcessError as e:
        print(f"Error determining outbound interfaces: {e}")
        return outbound_interfaces
    except Exception as e:
        print(f"Unexpected error determining outbound interfaces: {e}")
        return outbound_interfaces

def optimize_network_routing():
    """
    Optimizes network routing between wired (end0) and wireless (wlan0) interfaces
    based on their connectivity status and metrics.
    
    Logic:
    1. If both end0 and wlan0 have default routes and internet connectivity, 
       ensure end0 has lower metric (prefer wired connection)
    2. If end0 has lower metric but no internet connectivity, and wlan0 has internet,
       change metrics to prefer wlan0
    3. If wlan0 has lower metric but end0 has internet connectivity,
       change metrics to prefer end0 (wired connection)
       
    Returns:
        dict: A dictionary with the results of the optimization:
              {
                  'action_taken': True/False,  # Whether any change was made
                  'message': 'Description of what was done',
                  'previous_primary': 'interface_name',  # Previous primary interface
                  'current_primary': 'interface_name'    # Current primary interface
              }
    """
    result = {
        'action_taken': False,
        'message': 'No action needed',
        'previous_primary': None,
        'current_primary': None
    }
    
    try:
        # Get all outbound interfaces
        interfaces = get_all_outbound_interfaces()
        
        # Find end0 and wlan0 interfaces if they exist
        end0 = next((iface for iface in interfaces if iface['name'] == 'end0'), None)
        wlan0 = next((iface for iface in interfaces if iface['name'] == 'wlan0'), None)
        
        # If either interface doesn't exist or isn't up, no optimization needed
        if not end0 or not wlan0 or not end0['is_up'] or not wlan0['is_up']:
            result['message'] = "Both end0 and wlan0 interfaces are not available or not up"
            return result
            
        # Find the current primary interface (lowest metric)
        primary_interface = next((iface for iface in interfaces if iface['is_primary']), None)
        if primary_interface:
            result['previous_primary'] = primary_interface['name']
        
        # Case 1: Both have internet connectivity, ensure end0 has lower metric
        if end0['internet_reachable'] and wlan0['internet_reachable']:
            if end0['metric'] > wlan0['metric']:  # end0 should have lower metric
                # Change metrics to prefer end0
                set_interface_metric('end0', wlan0['metric'] - 100)
                result['action_taken'] = True
                result['message'] = "Both interfaces have internet. Changed metrics to prefer wired connection (end0)"
                result['current_primary'] = 'end0'
            else:
                result['message'] = "Both interfaces have internet. Wired connection (end0) already preferred"
                result['current_primary'] = 'end0'
        
        # Case 2: end0 has lower metric but no internet, wlan0 has internet
        elif not end0['internet_reachable'] and wlan0['internet_reachable'] and end0['metric'] < wlan0['metric']:
            # Change metrics to prefer wlan0
            set_interface_metric('wlan0', end0['metric'] - 100)
            result['action_taken'] = True
            result['message'] = "Wired connection (end0) has no internet. Changed metrics to prefer wireless (wlan0)"
            result['current_primary'] = 'wlan0'
        
        # Case 3: wlan0 has lower metric but end0 has internet
        elif end0['internet_reachable'] and wlan0['metric'] < end0['metric']:
            # Change metrics to prefer end0 since it has internet connectivity
            set_interface_metric('end0', wlan0['metric'] - 100)
            result['action_taken'] = True
            result['message'] = "Changed metrics to prefer wired connection (end0) if it has internet"
            result['current_primary'] = 'end0'

        
        # Other cases
        else:
            if end0['internet_reachable']:
                result['current_primary'] = 'end0'
                result['message'] = "Using wired connection (end0) for internet"
            elif wlan0['internet_reachable']:
                result['current_primary'] = 'wlan0'
                result['message'] = "Using wireless connection (wlan0) for internet"
            else:
                result['message'] = "No internet connectivity on either interface"
        
        return result
        
    except Exception as e:
        result['message'] = f"Error optimizing network routing: {str(e)}"
        return result

def set_interface_metric(interface_name, new_metric):
    """
    Sets a new metric for the specified interface's default route.
    
    Args:
        interface_name (str): The name of the interface (e.g., 'end0', 'wlan0')
        new_metric (int): The new metric value to set
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Get the current default route for this interface
        result = subprocess.run(
            ["ip", "route", "show", "default", "dev", interface_name],
            check=True,
            stdout=subprocess.PIPE,
            universal_newlines=True
        )
        
        current_route = result.stdout.strip()
        if not current_route:
            print(f"No default route found for {interface_name}")
            return False
            
        # Delete the current default route
        subprocess.run(
            ["ip", "route", "del", "default", "dev", interface_name],
            check=True
        )
        
        # Extract the gateway from the current route
        gateway = None
        via_match = re.search(r'via\s+(\S+)', current_route)
        if via_match:
            gateway = via_match.group(1)
            
        # Add the new route with the specified metric
        if gateway:
            subprocess.run(
                ["ip", "route", "add", "default", "via", gateway, "dev", interface_name, "metric", str(new_metric)],
                check=True
            )
        else:
            subprocess.run(
                ["ip", "route", "add", "default", "dev", interface_name, "metric", str(new_metric)],
                check=True
            )
            
        print(f"Successfully changed metric for {interface_name} to {new_metric}")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"Error setting interface metric: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error setting interface metric: {e}")
        return False
'''

def update_display():
    with update_display_lock:
        global msg_id_network_2
        global msg_id_network_1
        global msg_id_network_3
        global msg_id_network_4
        global msg_id_network_5
        global msg_id_network_6
        global msg_id_network_7
        global msg_id_network_8
        global msg_id_network_9
        global msg_id_network_10
        global msg_id_network_11
        global msg_id_network_12
        global msg_id_network_13
        global msg_id_network_14
        global msg_id_smb_status
        global msg_id_start
        global msg_id_hotspot
        global last_vpn_service_status
        global msg_id_vpn_1
        global msg_id_photprism_down
        global FIRST_START
        global photoprism_container_name
        global msg_id_disk_space
        global msg_id_disk_space_percent 
        global SYSTEM_ONLINE
        global MULTIPLE_INTERFACES_ACTIVE
        SYSTEM_ONLINE = is_internet_connected()
        global FUN_EXIT
        global wired_msg_up
        global ETHERNET_INTERFACE
    

        #print(f"SYSTEM_ONLINE:{SYSTEM_ONLINE}")
        if (SYSTEM_ONLINE):
            system_status = "Online"
        else:
            system_status = "Offline"
        print(f"in update display {system_status}")
        default_gateway = get_default_gateway()

        update_immich_json()
        update_vaultwarden_domain()
        update_jellyfin_domain()
        update_paperless_url()
        restart_service("paperless.service")
        update_YAML() # this should take care of joplin
        restart_service("joplin.service")
        restart_service("password-reset.service") # this is because for sending reset link we need correct hostname.

        #print(f"default_gateway is {default_gateway}")
        if default_gateway:
            if is_gateway_reachable(default_gateway):
                hostname = get_hostname()
                #print(f"hostname:{hostname}")
                #text = f"Open http://{hostname}"
                vpn_service_status = check_service_status("tailscaled.service")
                vpn_service_status_text = vpn_service_status
                #print(f"am here{vpn_service_status}")
                if "Up" == vpn_service_status:
                    #vpn_ip = get_interface_ip("tailscale0")
                    # Extract just the hostname part from FQDN (remove domain part)
                    if '.' in hostname:
                        hostname = hostname.split('.')[0]
                    vpn_service_status_text += f"\nhttp://\n{hostname}"
                if "Down" == vpn_service_status:
                    connected_ssid = get_connected_ssid()
                    #print(f"SSID STATUS is: {connected_ssid}")
                    wired_network = get_ethernet_interface_and_is_up()
                    if (connected_ssid and wired_network):
                        # If both WIFI and wired connected then better to connect on wired_network IP
                        ethernet_ip = get_interface_ip(ETHERNET_INTERFACE)
                        vpn_service_status_text += f"\nhttps://\n{ethernet_ip}"
                    if (connected_ssid and not wired_network):
                        wifi_ip = get_interface_ip("wlan0")
                        vpn_service_status_text += f"\nhttps://\n{wifi_ip}"
                    if (not connected_ssid and  wired_network):
                        ethernet_ip = get_interface_ip(ETHERNET_INTERFACE)
                        vpn_service_status_text += f"\nhttps://\n{ethernet_ip}"
                textvpn = f"VPN:{vpn_service_status_text}"
                if (msg_id_vpn_1 is not None):
                    #print(f"msg_id_vpn_1:{msg_id_vpn_1}")
                    send_display_request(textvpn, 'cycle', 0, 'remove', msg_id_vpn_1)
                    msg_id_vpn_1 = None
                if (msg_id_vpn_1 is None):
                    msg_id_vpn_1 = send_display_request(textvpn, 'cycle', 0, 'add', 0)
                if (last_vpn_service_status != vpn_service_status): # this is to update hostname in yaml file as when tailscale is up hostname should be vpn accessible otherwise it would be local hostname. this is used in album sharing
                    
                    last_vpn_service_status = vpn_service_status
                    # print(f"msg_id_vpn_1:{msg_id_vpn_1}")

                    update_immich_json()
                    update_vaultwarden_domain()
                    update_jellyfin_domain()
                    update_paperless_url()
                    restart_service("paperless.service")
                    update_YAML() # this should take care of joplin
                    restart_service("joplin.service")
                    restart_service("password-reset.service") # this is because for sending reset link we need correct hostname.
                    manage_certificates()

                    
                if (msg_id_network_4 is not None):
                    send_display_request('text', 'cycle', 0, 'remove', msg_id_network_4)
                    msg_id_network_4 = None

                SYSTEM_ONLINE = is_internet_connected()
                #print(f"SYSTEM_ONLINE:{SYSTEM_ONLINE}")
                if (SYSTEM_ONLINE):
                    system_status = "Online"
                else:
                    system_status = "Offline"


                #print(f"am at 0 text:{vpn_ip}")
                #draw_text(text)
                #time.sleep(SLEEP_TIME)
                #clear_screen()
                connected_ssid = get_connected_ssid()
                ssid = get_hotspot_status('wlan0')
                if (ssid is None):
                    if (msg_id_network_7 is not None):
                            send_display_request(text, 'cycle', 0, 'remove', msg_id_network_7)
                            msg_id_network_7 = None
                    if (msg_id_network_8 is not None):
                        send_display_request(text, 'cycle', 0, 'remove', msg_id_network_8)
                        msg_id_network_8 = None


                if (connected_ssid is not False): # WIFI Connected to Network
                    #time.sleep(SLEEP_TIME)
                    wired_network = get_ethernet_interface_and_is_up()
                    if (wired_network and is_internet_connected()):
                        #first remove any hotspot on and off message
                        if (msg_id_network_9 is not None):
                            send_display_request(text, 'cycle', 0, 'remove', msg_id_network_9)
                            msg_id_network_9 = None
                        #if (msg_id_network_10 is not None):
                        #    send_display_request(text, 'cycle', 0, 'remove', msg_id_network_10)
                        #    msg_id_network_10 = None
                        if (msg_id_network_2 is not None):
                            send_display_request(text, 'cycle', 0, 'remove', msg_id_network_2)
                            msg_id_network_2 = None
                        if (msg_id_network_7 is not None):
                            send_display_request(text, 'cycle', 0, 'remove', msg_id_network_7)
                            msg_id_network_7 = None
                        if (msg_id_network_8 is not None):
                            send_display_request(text, 'cycle', 0, 'remove', msg_id_network_8)
                            msg_id_network_8 = None
                        if (msg_id_network_5 is not None):
                            send_display_request(text, 'cycle', 0, 'remove', msg_id_network_5)
                            msg_id_network_5 = None
                        if (msg_id_network_6 is not None):
                            send_display_request(text, 'cycle', 0, 'remove', msg_id_network_6)
                            msg_id_network_6 = None


                else: #not connected to wifi but hotspot may still be  on
                    wired_network = get_ethernet_interface_and_is_up()
                    #print(f"Wired_network:{wired_network}")
                    if (wired_network and is_internet_connected()):
                        # Check if WIFI hotspot is up
                        ssid = get_hotspot_status('wlan0')
                        
                        if (ssid): 
                            text = "test\ntest\ntest"
                            if (msg_id_network_5):
                                send_display_request(text, 'cycle', 0, 'remove', msg_id_network_5)
                                msg_id_network_5 = None
                            if (msg_id_network_6):
                                send_display_request(text, 'cycle', 0, 'remove', msg_id_network_6)
                                msg_id_network_6 = None
                            if (msg_id_network_7):
                                send_display_request(text, 'cycle', 0, 'remove', msg_id_network_7)
                                msg_id_network_7 = None
                            if (msg_id_network_8):
                                send_display_request(text, 'cycle', 0, 'remove', msg_id_network_8)
                                msg_id_network_8 = None
                            if (msg_id_network_2):
                                send_display_request(text, 'cycle', 0, 'remove', msg_id_network_2)
                                msg_id_network_2 = None
                            if (msg_id_network_9 is not None):
                                send_display_request(text, 'cycle', 0, 'remove', msg_id_network_9)
                                msg_id_network_9 = None
                        
                    
                    else:
                        if (wired_network is False): # it means hotspot is on and no other network is available
                            ssid = get_hotspot_status('wlan0')
                            if (ssid):
                                password = get_hotspot_password()
                                text = f"HOTSPOT ON\n{ssid}\n{password}"
                                if (msg_id_network_7 is None):
                                    msg_id_network_7 = send_display_request(text, 'cycle', 0, 'add', 0)
                                #clear_screen()
                                #draw_text(text)
                                #time.sleep(SLEEP_TIME)  # Check every 10 seconds
                                hotspot_ip = get_interface_ip("wlan0")
                                text = f"HOTSPOT ON\nhttps://\n{hotspot_ip}"
                                if (msg_id_network_8 is None):
                                    msg_id_network_8 = send_display_request(text, 'cycle', 0, 'add', 0)
                                    #clear_screen()
            else:
                # check if WIFI configuration is present
                result = check_interface_configuration_status("\"wlan0\"")

                if (result != False): #WiFi is conifgured but unable to connect either due to router down or bad configuration. Don't do anything.
                                        #Either WiFi will come up or user needs to reset using power button press 2 times (fast press)
                    text = f"WiFi\nDisconnected:{result}"

                else: #WiFi not configured - let's start hotspot but only if wired is also down
                    wired_network = get_ethernet_interface_and_is_up()
                    if (wired_network is False):
                        # get hotspot service up
                        # check if hotspot configuration is present and enable, start hostapd service and assign ip on wlan0
                        ssid = get_hotspot_status('wlan0')
                        #if (ssid is None):
                            #hotspot_ip = start_hotspot() # hotspot is only started either manualy (at shipment) or by pressing power button many times
                            #reboot_system()
                            #ssid = get_hotspot_status('wlan0')
                            #clear_screen()
                            #draw_text(text)
                            #time.sleep(SLEEP_TIME)
                        if (ssid): # check if hotspot is turned on
                            #hostname = get_hostname()
                            password = get_hotspot_password()
                            text = f"HOTSPOT ON\n{ssid}\n{password}"
                            if (msg_id_network_7 is None):
                                msg_id_network_7 = send_display_request(text, 'cycle', 0, 'add', 0)
                            #clear_screen()
                            #draw_text(text)
                            #time.sleep(SLEEP_TIME)  # Check every 10 seconds
                            hotspot_ip = get_interface_ip("wlan0")
                            text = f"HOTSPOT ON\nhttps://\n{hotspot_ip}"
                            if (msg_id_network_8 is None):
                                msg_id_network_8 = send_display_request(text, 'cycle', 0, 'add', 0)
                                #clear_screen()
                                #draw_text(text)
                            time.sleep(SLEEP_TIME)  # Check every 10 seconds

        else: # system has no default gateway so system is offline

        #print("Connect to network")
        # check if WIFI configuration is present
            result = check_interface_configuration_status("\"wlan0\"")
            vpn_service_status = check_service_status("tailscaled.service")
        #print(f"vpn_service_status when it should be down is {vpn_service_status}")
            if "Down" == vpn_service_status:
                if (msg_id_vpn_1 is not None):
                    text = f"test\nWiFi\nDisconnected"
                    #print(f"msg_id_vpn_1:{msg_id_vpn_1}")
                    send_display_request(text, 'cycle', 0, 'remove', msg_id_vpn_1)
                    msg_id_vpn_1 = None
            if (last_vpn_service_status != vpn_service_status): # this is to update hostname in yaml file as when tailscale is up hostname should be vpn accessible otherwise it would be local hostname. this is used in album sharing
                update_immich_json()
                update_vaultwarden_domain()
                update_jellyfin_domain()
                update_paperless_url()
                restart_service("paperless.service")
                update_YAML() # this should take care of joplin
                restart_service("joplin.service")
                restart_service("password-reset.service") # this is because for sending reset link we need correct hostname.
            last_vpn_service_status = vpn_service_status

    
            #system is offline.
            if (result): # WIFI configured but not connected
                text = f"{system_status}\nWiFi\nDisconnected"
                if (msg_id_network_4 is None):
                    msg_id_network_4 = send_display_request(text, 'cycle', 0, 'add', 0)
                    #clear other network messages from display
                if (msg_id_network_1 is not None):
                    send_display_request(text, 'cycle', 0, 'remove', msg_id_network_1)
                    msg_id_network_1 = None
                if (msg_id_network_2 is not None):
                    send_display_request(text, 'cycle', 0, 'remove', msg_id_network_2)
                    msg_id_network_2 = None
                if (msg_id_network_3 is not None):
                    send_display_request(text, 'cycle', 0, 'remove', msg_id_network_3)
                    msg_id_network_3 = None
                if (msg_id_network_13 is not None):
                    send_display_request(text,'cycle',0,'remove',msg_id_network_13)
                    msg_id_network_13 = None

                #clear_screen()
                #draw_text(text)

                #clear_screen()
                # add code to disable and stop hostapd, dnsmasq and start resolved service
            else: # WIFI not configured
                wired_network = get_ethernet_interface_and_is_up()
                ssid = get_hotspot_status('wlan0')
                if (ssid): #check if hotspot is on. 
                    #clear_screen()
                    hostname = get_hostname()
                    password = get_hotspot_password()
                    text = f"HOTSPOT ON\n{ssid}\n{password}"
                    if (msg_id_network_7 is None):
                        msg_id_network_7 = send_display_request(text, 'cycle', 0, 'add', 0)
                    #draw_text(text)
                    time.sleep(SLEEP_TIME)  # Check every 10 seconds
                    #clear_screen()
                    hotspot_ip = get_interface_ip("wlan0")
                    #print(f"hotspot ip is {hotspot_ip}")
                    text = f"HOTSPOT ON\nhttps://\n{hotspot_ip}"
                    if (msg_id_network_8 is None):
                        msg_id_network_8 = send_display_request(text, 'cycle', 0, 'add', 0)
                #clear_screen()
                else:
                    if (wired_msg_up is None): #hotspot not on, wi-fi not configured and wired not connected - time to show hotspot reset message
                        print(f"adding power button message")
                        text = f"Press power\nbtn 5 times\nfor HOTSPOT"
                        if (msg_id_hotspot is None):
                            msg_id_hotspot = send_display_request(text, 'cycle', 0, 'add', 0)
                time.sleep(SLEEP_TIME)  # Check every 10 seconds
                # code to start hostapd, dnsmasq and stop resolved service
        return True


def main():
    global msg_id_network_2
    global msg_id_network_1
    global msg_id_network_3
    global msg_id_network_4
    global msg_id_network_5
    global msg_id_network_6
    global msg_id_network_7
    global msg_id_network_8
    global msg_id_network_9
    global msg_id_network_10
    global msg_id_network_11
    global msg_id_network_12
    global msg_id_network_13
    global msg_id_network_14
    global msg_id_smb_status
    global msg_id_start
    global last_vpn_service_status
    global msg_id_vpn_1
    global msg_id_photprism_down
    global FIRST_START
    global photoprism_container_name
    global msg_id_disk_space
    global msg_id_disk_space_percent
    global SYSTEM_ONLINE
    global MULTIPLE_INTERFACES_ACTIVE
 
    # Set up logger
    logger = logging.getLogger('watchdog-eye.service')
    logger.setLevel(logging.DEBUG)
    outside_last_vpn_service_status = False
    # Add the journal handler
    journal_handler = JournalHandler(SYSLOG_IDENTIFIER='watchdog-eye.service')
    logger.addHandler(journal_handler)

    while True:
        
        if (FIRST_START == True): #clear all cycle messages on display so we start fresh
            SYSTEM_ONLINE = is_internet_connected()
            indexing_in_progress = False
            FIRST_START = False
            # clean up any lock files
            subprocess.run(["rm", "-f", "/tmp/photoprism-start-stop-in-progress"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
            #time.sleep(SLEEP_TIME)
            # update all YAML files with current hostname based on whether tailscale is up or down.
            users = list_user_accounts_with_login()
            get_system_timezone()
            send_api_request("invokesalt_unmount",None) # sync photoprism YAML file to actual disk state
            percent,gb = get_disk_space("/home")
            percent = round(percent, 0)
            gb=round(gb,1)
            
             # check if hotspot_flag_file exists. If yes then display a persistent message
            if os.path.exists("/var/lib/hotspot_active"):
                text = f"Starting\nHotspot\n"
                send_display_request(text, 'once', 59, 'add', 0)
                text = f""

            
            if (msg_id_disk_space_percent is None):
                text = f"Disk Space\nFree:\n{gb}GB"
                msg_id_disk_space_percent = send_display_request(text, 'cycle', 0, 'add', 0)
            update_display()
            manage_certificates()


        #if (photoprism_container_name == None):
        #    photoprism_container_name = retrieve_running_docker_container("photoprism") #if photoprism was started before this script started.
        '''
        if (is_process_running("index") == True):

            # if indexing started from UI then index process is not visible. Only way is to check docker logs for photoprism container and see if any activity in the logs
            if (check_photoprism_service(MANDATORY_USER) == True):
                if(check_photoprism_logs_is_indexing_active() == "indexing"):
                    #print (f"docker_logs:",{docker_logs_1},{docker_logs_2},{docker_logs_3})
                    text = f"Indexing\nPhotos"
                    indexing_in_progress = True
                    if (msg_id_network_11 is None):
                        #time.sleep(SLEEP_TIME)
                        text = f"Indexing\nPhotos"
                        msg_id_network_11 = send_display_request(text, 'cycle', 0, 'add', 0)
        else: #indexing might have been started from UI which doesn't create index process. So check logs
            if (check_photoprism_logs_is_indexing_active() == "indexing"):
                text = f"Indexing\nPhotos"
                indexing_in_progress = True
                if (msg_id_network_11 is None):
                    #time.sleep(SLEEP_TIME)
                    text = f"Indexing\nPhotos"
                    msg_id_network_11 = send_display_request(text, 'cycle', 0, 'add', 0)
            else:
                indexing_in_progress = False
        '''

        percent_updated,gb_updated = get_disk_space("/home")
        if (percent_updated < 5):
            text = f"Low Disk\nSpace"
            if (msg_id_disk_space is None):
                msg_id_disk_space = send_display_request(text, 'cycle', 0, 'add', 0)
            if (percent_updated == 0):
                if (msg_id_disk_space is not None):
                    send_display_request(text, 'cycle', 0, 'remove', msg_id_disk_space)
                    msg_id_disk_space = None
                if (msg_id_disk_space is None):
                    text = f"Internal Disk\nFull\nContact Support"
                    msg_id_disk_space = send_display_request(text, 'cycle', 0, 'add', 0)
        else:
            if (msg_id_disk_space is not None):
                send_display_request(text, 'cycle', 0, 'remove', msg_id_disk_space)
                msg_id_disk_space = None

        if (gb_updated != gb):
            gb=gb_updated
            percent=percent_updated
            text = f"Disk Space\nFree:\n{gb}GB"
            if (msg_id_disk_space_percent is not None):
                send_display_request(text, 'cycle', 0, 'remove', msg_id_disk_space_percent)
                msg_id_disk_space_percent = None
            if (msg_id_disk_space_percent is None):
                msg_id_disk_space_percent = send_display_request(text, 'cycle', 0, 'add', 0)


        #onedrive sync code
        #users = list_user_accounts_with_login()
            #print(f"users {users}")
        #for user in users:
            #status = manage_onedrive_sync(user.split(":")[0])
            #print_sync_status(status)

        '''
        if (check_photoprism_logs_is_indexing_active() == "file-copy"):
                if (msg_id_network_12 is None):
                    time.sleep(SLEEP_TIME)
                    text = f"Network File\nOperations\nIn Progress"
                    msg_id_network_12 = send_display_request(text, 'cycle', 0, 'add', 0)

        if (msg_id_network_12 is not None) and (check_photoprism_logs_is_indexing_active() != "file-copy"):
            send_display_request(text, 'cycle', 0, 'remove', msg_id_network_12)
            msg_id_network_12 = None

        #print(f"indexing_in_progress:{indexing_in_progress}")
        if (msg_id_network_11 is not None) and (indexing_in_progress == False):
            send_display_request(text, 'cycle', 0, 'remove', msg_id_network_11)
            msg_id_network_11 = None

        #check if indexing is not running then check photoprism log for indexing completion message. If indexing completion message is
        # not present then we need to rerun indexing as it might have stopped in between due to disk plugout or other issues. Do nothing if indexing completion message exist.
        #print(f"INDEXING_STATUS={indexing_in_progress}")

        # if indexing process exist but logs are not moving - it may be because of hung indexing process or some other error. restart photoprism and start indexing. We still have no foolproof way to check if logs are active hence commenting for now
        # What if indexing started from UI (index process will not exist but indexing going on but stuck)? -
        #if (is_process_running("index") == True):
            #if (check_photoprism_service() == True):
                #if (check_photoprism_logs_is_indexing_active() == False):
                    #stop_photoprism_service()
                    #start_photoprism_service()
                    #time.sleep(SLEEP_TIME)
                    #index_thread = threading.Thread(target=start_indexing_photoprism)
                    #index_thread.start()

        # We keep an eye on photoprism and try to start it when found dead
        #multi-user
        users=list_user_accounts_with_login()
        for user in users:
            if (check_photoprism_service(user.split(":")[0]) == False):
                start_photoprism_service(user.split(":")[0])
                time.sleep(SLEEP_TIME)


        if (check_photoprism_service(MANDATORY_USER) == False): # if still not up - display message
            text = f"PhotoPrism\nStopped\nRestart System"
            if (msg_id_photprism_down is None):
                msg_id_photprism_down = send_display_request(text, 'cycle', 0, 'add', 0)
                time.sleep(SLEEP_TIME)
        else:
            if (msg_id_photprism_down is not None):
                send_display_request(text, 'cycle', 0, 'remove', msg_id_photprism_down)
                msg_id_photprism_down = None
        '''
       


        # Memory management - we need to keep an eye on memory and swap usage as when it runs OOM then we are seeing reboots (with no log message)

        #print(f"free swap space is -------------------{check_swap_space()}")
        #if (check_swap_space() < 100): # if free swap space falls below 5 MB then we are at risk reboot of system so better restart photoprism to free up memory. Most memory is
        #taken typically by ffmpeg which is not counted in docker photoprism container limit
        #    if (check_photoprism_service(MANDATORY_USER) == True):
                #print(f"RESTARTING PHOTOPRISM DUE TO LOW MEMORY")
        #        text = f"Restarting\nPhotoPrism\nLow Memory"
        #        send_display_request(text, 'once', 5, 'add', 0)
        #        stop_photoprism_service(MANDATORY_USER)
        #        time.sleep(SLEEP_TIME)
        # no need to restart as code elsewhere in this script is checking
        #check_tmp_space() # if free tmp space falls below 1 MB then we are at risk of OMV errors. this is a memory fs with 2 GB storage. So keep an eye on it and reboot if needed.

        #    if (check_photoprism_service() == False):
        #        start_photoprism_service()
        #    #time.sleep(SLEEP_TIME)
        #    if (check_photoprism_service() == True):
        #        if (check_photoprism_logs_is_indexing_active() == False): #might have started indexing from UI.
        #            docker_logs = subprocess.run(["docker", "compose", "-f", "/home/shaurya/docker-compose.yml", "logs", "photoprism", "--tail=30"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        #            #print(docker_logs)
        #           #time.sleep(SLEEP_TIME)
        #            last_indexing_success = False
        #            for line in docker_logs.stdout.split("\n"):
        #                #print(f"line:",{line})
        #                if ("indexing completed" in line) or ("indexed" in line):
        #                    print(f"found indexing completion message")
        #                    last_indexing_success = True
        #                    break
        #            if (last_indexing_success == False):
        #                index_thread = threading.Thread(target=start_indexing_photoprism)
        #                index_thread.start()

        #check file transfer status over smb and display message if file transfer ongoing
        #smbstatus_output = run_smbstatus()
        #print(f"smbstatus_output is {smbstatus_output}")
        #active_transfers =  parse_active_transfers(smbstatus_output)
        #print(f"active_transfers is {active_transfers}")
        #if (active_transfers == True):
        #    if (msg_id_smb_status is None):
        #        time.sleep(SLEEP_TIME)
        #        text = f"Network File\nOperations\nin Progress"
        #        msg_id_smb_status = send_display_request(text, 'cycle', 0, 'add', 0)
        #else:
        #    if (msg_id_smb_status is not None):
        #        send_display_request(text, 'cycle', 0, 'remove', msg_id_smb_status)
        #        msg_id_smb_status = None
        outside_vpn_service_status = check_service_status("tailscaled.service")
        time.sleep(10)
        print(f"outside_vpn_service_status is {outside_vpn_service_status} and last_vpn_service_status is {last_vpn_service_status}")
        if (str(outside_vpn_service_status) != str(last_vpn_service_status)):
            print(f"rechecking")
            time.sleep(1.5)
            outside_vpn_service_status = check_service_status("tailscaled.service")
            if (str(outside_vpn_service_status) != str(last_vpn_service_status)):
                print(f"calling update display 11")
                update_display()
                manage_certificates()

if __name__ == "__main__":
    get_system_timezone()
    # Start timezone monitoring in a background thread
    timezone_thread = threading.Thread(target=check_timezone_changes, daemon=True)
    time.sleep(5)
    timezone_thread.start()
    # Start the Ethernet monitoring thread
    ETHERNET_INTERFACE = find_ethernet_interface()
    ethernet_thread = threading.Thread(target=monitor_ethernet_cable)
    ethernet_thread.daemon = True
    time.sleep(5)
    ethernet_thread.start()
    
    # Start the WiFi monitoring thread
    wifi_thread = threading.Thread(target=monitor_wifi_status)
    wifi_thread.daemon = True
    time.sleep(5)
    wifi_thread.start()

    start_tmp_monitor()
    
    main()
