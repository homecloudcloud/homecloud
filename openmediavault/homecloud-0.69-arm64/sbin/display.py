from flask import Flask, request, jsonify
from flask_cors import CORS
import board
import digitalio
import Adafruit_SSD1306
import adafruit_ssd1306
import board
import digitalio
from PIL import Image, ImageDraw, ImageFont
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
import busio
import threading
import random
import copy
import json
import natsort
import openmediavault.firstaid
import openmediavault.net
import openmediavault.rpc
import openmediavault.stringutils
import openmediavault
import urllib.request
import requests
import yaml
import asyncio
import systemd.journal
import os
import pwd
import grp
from pwd import getpwnam
from pathlib import Path
from functools import wraps
import os
import ssl
from waitress import serve
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import shutil
import shlex
import crypt
import ipaddress
import hmac
import hashlib
import time
import base64
import tempfile
import errno



# Global variable to store the current TOTP and its expiration time
current_totp = None
current_jellyfin_totp = None
totp_expiry = 0
jellyfin_totp_display_msg_id = 0
something_on_display = False



####  OMV authentication code
# Get OMV configuration from environment variables
OMV_HOST = os.getenv('OMV_HOST', 'localhost')
OMV_PORT = os.getenv('OMV_PORT', '443')
OMV_BASE_URL = f'https://{OMV_HOST}:{OMV_PORT}'
###

semaphore = threading.Semaphore(1)
semaphore_file_YAML = threading.Semaphore(1)
rpc_params = {}

internal_storage_disk_name="nvm"
internal_storage_share_exists = False
remove_all_msg = False

FIRST_START = True
msg_id_on_display = -1
persistent_msg_id = "False"
COMMON_USERNAME="admin"
HOME_DIRS_DEVICE="/dev/mapper/DATA_VOL-home_dirs"
INDEXING_SCHEDULE = None
DISPLAY_TIMEOUT = 180
display_start_time = 0
display_is_on = True
display_timer_thread = None
display_timer_stop_event = None
DEFAULT_DISPLAY_DURATION = 5  # Default duration in seconds to display text

# Initialize OLED display with error handling
oled = None
image = None
draw = None
font = None
display_available = False

# Change these
# to the right size for your display!
WIDTH = 128
HEIGHT = 32  # Change to 64 if needed
BORDER = 5
app = Flask(__name__)
MSG_ID_TO_BE_REMOVED = 0
#msg_id_remove = ''
msg_id_remove = []
# List to store display texts


try:
    # Use for I2C.
    i2c = board.I2C()  # uses board.SCL and board.SDA
    oled_reset = digitalio.DigitalInOut(board.D4)
    oled = adafruit_ssd1306.SSD1306_I2C(WIDTH, HEIGHT, i2c, addr=0x3C, reset=oled_reset)
    
    # Clear display.
    oled.fill(0)
    oled.show()
    
    # Create blank image for drawing.
    image = Image.new("1", (oled.width, oled.height))
    
    # Get drawing object to draw on image.
    draw = ImageDraw.Draw(image)
    
    # Draw a white background
    draw.rectangle((0, 0, oled.width, oled.height), outline=1, fill=0)
    
    # Load default font.
    font = ImageFont.load_default()
    
    display_available = True
    
except Exception as e:
    print(f"OLED display not available or failed to initialize: {e}")
    display_available = False




SLEEP_TIME = 0
display_texts=[]
font_height=13

# Load default font.
font = ImageFont.load_default()
#font = ImageFont.truetype('OpenSans-Regular.ttf', font_height)
#font = ImageFont.truetype('NotablyAbsentDEMO.ttf', font_height)
#font = ImageFont.truetype("/home/shaurya/OLED_Stats/lineawesome-webfont.ttf", 8)

#parser = argparse.ArgumentParser()
#parser.add_argument("Text", help="Display text on OLED")
#args = parser.parse_args()
#text = args.Text
#draw_text(text)
#semaphore = threading.Semaphore(1)


def turn_off_display():
    """
    Turn off the OLED display completely.
    This puts the display into a low power state.
    """
    global display_available, oled
    if not display_available or oled is None:
        return False
        
    try:
        global display_is_on
        # Clear the display first
        oled.fill(0)
        oled.show()
        
        # Send the display off command
        # 0xAE is the SSD1306 command to turn the display off
        oled.write_cmd(0xAE)
        display_is_on = False
        
        return True
    except Exception as e:
        #print(f"Error turning off display: {e}")
        return False
        
def turn_on_display():
    """
    Turn the OLED display back on after it has been turned off.
    Also resets the display timeout timer.
    """
    global display_available, oled
    if not display_available or oled is None:
        return False
        
    try:
        # 0xAF is the SSD1306 command to turn the display on
        oled.write_cmd(0xAF)
        
        # Clear the display to ensure a clean state
        oled.fill(0)
        oled.show()
        
        # Update display state
        global display_is_on
        display_is_on = True
        
        return True
    except Exception as e:
        #print(f"Error turning on display: {e}")
        return False

def start_display_timeout_timer():
    """
    Start a timer that will turn off the display after DISPLAY_TIMEOUT seconds.
    If an existing timer thread is active, it will be killed before starting a new one.
    """
    global display_is_on
    global DISPLAY_TIMEOUT
    global display_timer_thread
    global display_timer_stop_event
    global display_available, oled
    if not display_available or oled is None:
        return False
    
    # Check if there's an existing timer thread and kill it
    if display_timer_thread is not None and display_timer_thread.is_alive():
        # Signal the thread to stop
        if display_timer_stop_event is not None:
            display_timer_stop_event.set()
        # Wait a short time for the thread to exit
        display_timer_thread.join(0.1)
    
    # Create a new stop event
    display_timer_stop_event = threading.Event()
    
    def timer_thread():
        global display_is_on
        # Wait for either the timeout or the stop event
        timeout_reached = not display_timer_stop_event.wait(DISPLAY_TIMEOUT)
        
        # If timeout was reached (not stopped) and display is still on
        if timeout_reached and display_is_on:
            success = turn_off_display()
            if success:
                print(f"Display turned off automatically after {DISPLAY_TIMEOUT} seconds")
    
    # Create and start the timer thread
    display_timer_thread = threading.Thread(target=timer_thread)
    display_timer_thread.daemon = True  # Make thread a daemon so it doesn't block program exit
    display_timer_thread.start()
    
    return True



def send_display_request(text_to_display,msg_type,time_to_display,action,msg_id):
    try:
        url = "https://127.0.0.1:5000/display"
        lines = text_to_display.splitlines()
        if len(lines) < 3:
            lines.append("")

        data = {'line1': lines[0], 'line2': lines[1], 'line3': lines[2], 'type': msg_type, 'time_to_display': time_to_display, 'msg_req': action, 'msg_id': msg_id}
        response = requests.post(url, params=data,verify=False)
        if response.status_code == 200:
            #print(f"Display request sent successfully. Response: {response.text}")
            return response.text
        else:
            #print(f"Error sending display request. Status code: {response.status_code}")
            return response.status_code
    except requests.exceptions.RequestException as e:
        print(f"Error sending display request: {e}")

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

def draw_text(text1, text2, text3):
    try:
        global persistent_msg_id
        global display_is_on
        global DEFAULT_DISPLAY_DURATION
        image=None
        #to disable display. comment next line when display working---------------------------------------------------------------------------------------------------
        #return True
        global font_height
        
        global display_available, oled
        if not display_available or oled is None:
            return False


        parts = []
        if (text1):
            parts.append([])
            parts[-1].append(text1)
        if (text2):
            #parts.append(text2)
            parts[-1].append(text2)
        if (text3):
            parts[-1].append(text3)
        clear_screen()
        #image changes
        if (text1):
            if (text1 == "Online"):
                if ("HOTSPOT" in text2):
                    image = Image.open('hotspot.ppm').convert('1')
                    draw = ImageDraw.Draw(image)
                else:
                    image = Image.open('wifi-connected.ppm').convert('1')
                    draw = ImageDraw.Draw(image)
            if (text1 == "HOTSPOT ON"):
                image = Image.open('hotspot.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            if (text1 == "Offline"):
                image = Image.open('wifi-disconnected.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            if (text1 == "Indexing"):
                image = Image.open('indexing.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            if (text1 == "VPN:Up"):
                image = Image.open('vpn-connected.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            if (text1 == "VPN:Down"):
                image = Image.open('vpn-disconnected.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            if (text1 == "WiFi Reset"):
                image = Image.open('system-configuring.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            if (text1 == "PhotoPrism"):
                image = Image.open('system-configuring.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            #if (text1 == "Configuring"):
            #    image = Image.open('system-configuring.ppm').convert('1')
            #    draw = ImageDraw.Draw(image)
            if (text1 == "Homecloud"):
                image = Image.open('info.ppm').convert('1')
                if (text2 == "Started"):
                    image = Image.open('info.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            if (text1 == "Starting"):
                image = Image.open('hotspot.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            if (text1 == "Network File"):
                image = Image.open('system-configuring.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            if (text1 == "File"):
                image = Image.open('system-configuring.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            if (text1 == "Wi-Fi"):
                if ("UP" in text2):
                    image = Image.open('wifi-connected.ppm').convert('1')
                    draw = ImageDraw.Draw(image)
                elif ("CONNECTED" in text2):
                    image = Image.open('wifi-connected.ppm').convert('1')
                    draw = ImageDraw.Draw(image)
                else:
                    image = Image.open('wifi-disconnected.ppm').convert('1')
                    draw = ImageDraw.Draw(image)
            if (text1 == "To Reset WiFi"):
                image = Image.open('wifi-disconnected.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            if (text1 == "Checking"):
                image = Image.open('system-configuring.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            if (text1 == "Restarting"):
                image = Image.open('system-configuring.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            if (text1 == "Low Disk"):
                image = Image.open('info.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            if (text1 == "Internal"):
                image = Image.open('system-configuring.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            if (text1 == "Disk Space"):
                image = Image.open('info.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            if (image==None):#catch all
                image = Image.open('info.ppm').convert('1')
                draw = ImageDraw.Draw(image)

        for i, element in enumerate(parts[-1]):
            #print(element)
            bbox = font.getbbox(element)
            #(font_width, font_height) = bbox[2] - bbox[0], bbox[3] - bbox[1]
            font_width = bbox[2] - bbox[0]
            #print(f"{oled.width},{oled.height},{font_width},{font_height},{oled.width // 2 - font_width // 2},{oled.height // 2 - font_height // 2 -(10-(i*10))}")
            draw.text(
                #(oled.width // 2 - font_width // 2, oled.height // 2 - font_height // 2 -(10-(i*10))),
                (50, oled.height // 2 - font_height // 2 -(10-(i*10))),
                element,
                font=font,
                fill=255,
            )
        oled.image(image)
        oled.show()

        return True
    except:
        return None

def find_element(matrix, target):
    for row_index, row in enumerate(matrix):
        for col_index, element in enumerate(row):
            if element == target:
                return row_index, col_index
    return None

def invoke_salt(arg_1,arg_2,arg_3):
    try:
        result = subprocess.run(["/usr/sbin/omv-salt", arg_1, arg_2, arg_3], check=True, stdout=subprocess.PIPE, universal_newlines=True)
      #  print(f"result: {result}")
        return True
    except:
        return False

# Function to remove the row containing the target element
def remove_row_with_element(matrix, target):
    new_matrix = [row for row in matrix if target not in row]
    #print (f"new_matrix is {new_matrix}")
    return new_matrix


def clear_screen():
    try:
        draw.rectangle((0, 0, oled.width, oled.height), outline=0, fill=0)
        oled.image(image)
        oled.show()
    except:
        return None

def timer(time_to_display):
    global something_on_display
    global msg_id_on_display
    if (time_to_display > 120):
        return False
    start_time = datetime.now()
    start_current_date_time = start_time.strftime("%Y-%m-%d %H:%M:%S")
    #print(f"beging_current_date_time:{start_current_date_time}")
    fmt = "%Y-%m-%d %H:%M:%S"
    while True:
        #something_on_display = True
        now = datetime.now()
        current_date_time = now.strftime("%Y-%m-%d %H:%M:%S")
        #print(f"current_date_time:{current_date_time}")
        fmt = "%Y-%m-%d %H:%M:%S"
        time_diff = datetime.strptime(current_date_time, fmt) - datetime.strptime(start_current_date_time, fmt)
        #print(f"time_diff:{time_diff}")
        days = time_diff.days
        hours, remainder = divmod(time_diff.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        #print(f"in timer seconds: {seconds} time_to_display is {time_to_display}")
        if seconds >= time_to_display:
            clear_screen()
            something_on_display = False
            msg_id_on_display = -1
            break
    return True

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
                if not ip_address:
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
                    # Method 3: Check for wireless hotspot IP (master mode)
                    try:
                        # Directly check if wlan0 has an IP address
                        cmd = "ip addr show wlan0 | grep 'inet ' | awk '{print $2}' | cut -d/ -f1"
                        ip_address = subprocess.check_output(cmd, shell=True, text=True).strip()
                        
                        # If we got an IP and it's valid, use it
                        if ip_address:
                            # Check if it's the hotspot IP (typically 172.31.1.1)
                            if ip_address.startswith('172.31.1.'):
                                print(f"Found hotspot IP: {ip_address}")
                            else:
                                print(f"Found wlan0 IP: {ip_address}")
                        else:
                            raise Exception("No valid IP on wlan0")
                    except Exception as e:
                        print(f"Error getting wlan0 IP: {e}")
                        # Method 4: Try to get any interface IP
                        try:
                            interfaces = get_interface_ip_addresses()
                            if interfaces and len(interfaces) > 0:
                                # Use the first non-localhost IP
                                for ip in interfaces:
                                    if ip != '127.0.0.1':
                                        ip_address = ip
                                        break
                                else:
                                    ip_address = '127.0.0.1'
                            else:
                                ip_address = '127.0.0.1'
                        except:
                            ip_address = '127.0.0.1'
            
            hostname = ip_address
            
        if hostname.endswith('.'):
            return hostname[:-1]
        return hostname
    except:
        return "Unable to get hostname"

def get_user_uid_gid(username):
    try:
        user_info = pwd.getpwnam(username)
        return user_info.pw_uid, user_info.pw_gid
    except KeyError as e:
        return None, None
'''
def start_photoprism_service(**kwargs):
    global COMMON_USERNAME
    if os.path.exists("/tmp/photoprism-start-stop-in-progress"):
        return False
    else:
        if (kwargs):
            # if first key is user then check if it is same as COMMON_USERNAME. If yes then do nothing as yaml file for that user is already read.
            # If not then find the homedirectory of user and load the user specific yaml file
            first_key, first_value = next(iter(kwargs.items()))
            if (first_key=="user"):
                user = first_value
                photoprism_yaml = f'/home/{user}/.docker-compose.yml'
            if (user == COMMON_USERNAME):
                photoprism_yaml = f'/etc/photoprism/docker-compose.yml'
        else:
            photoprism_yaml = f'/etc/photoprism/docker-compose.yml'

        subprocess.run(["touch", "/tmp/photoprism-start-stop-in-progress"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        #result = subprocess.run(["docker", "compose", "-f", "/etc/photoprism/docker-compose.yml", "up", "--detach"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        result = subprocess.run(["docker", "compose", "-f", photoprism_yaml, "up", "--detach"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        subprocess.run(["rm", "-f", "/tmp/photoprism-start-stop-in-progress"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        return True

def stop_photoprism_service(**kwargs):
    global COMMON_USERNAME
    # first check if /tmp/photoprism-start-stop-in-progress file exists. If yes then don't do anything
    if os.path.exists("/tmp/photoprism-start-stop-in-progress"):
        return False
    else:
        #by default if no user provided then we do for family/admin user
        if (kwargs):
            # if first key is user then check if it is same as COMMON_USERNAME. If yes then do nothing as yaml file for that user is already read.
            # If not then find the homedirectory of user and load the user specific yaml file
            first_key, first_value = next(iter(kwargs.items()))
            if (first_key=="user"):
                user = first_value
                photoprism_yaml = f'/home/{user}/.docker-compose.yml'
            if (user == COMMON_USERNAME):
                photoprism_yaml = f'/etc/photoprism/docker-compose.yml'
        else:
            photoprism_yaml = f'/etc/photoprism/docker-compose.yml'

    #create a file so no other process starts/stops photoprism while the file is there
        subprocess.run(["touch", "/tmp/photoprism-start-stop-in-progress"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        #result = subprocess.run(["docker", "compose", "-f", "/etc/photoprism/docker-compose.yml", "down"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        result = subprocess.run(["docker", "compose", "-f", photoprism_yaml , "down"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        subprocess.run(["rm", "-f", "/tmp/photoprism-start-stop-in-progress"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        return True

def start_indexing_photoprism():
    #print(f"in indexing:")
    #stop_photoprism_service()
    #start_photoprism_service()
    command = 'docker compose -f /etc/photoprism/docker-compose.yml exec photoprism bash -c "photoprism index 2>&1 | tee /proc/1/fd/1"'
    result = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True,shell=True)
    return True

def restart_photoprism():
   # print (f"in restart_photoprism:")
    #restart photoprism service and then start indexing
    #text = "Restarting\n PhotoPrism Service"
    #send_display_request(text, 'once', 10, 'add', 0)
    stop_photoprism_service()
    start_photoprism_service()
    #index_thread = threading.Thread(target=start_indexing_photoprism)
    #index_thread.start()
    #start_indexing_photoprism() #starts indexing the newly added disks for photos
    return "True"
'''
def get_system_timezone():
    tzinfo_file = '/root/.tzinfo'
    
    try:
        # Run the omv-rpc command and capture its output
        result = subprocess.run(
            ['omv-rpc', '-u', 'admin', 'System', 'getTimeSettings'],
            capture_output=True,
            text=True,
            check=True
        )
        
        # Parse the JSON output
        time_settings = json.loads(result.stdout)
        
        # Extract the timezone
        timezone = time_settings['timezone']
        
        # Store the timezone in the local file for future use
        try:
            with open(tzinfo_file, 'w') as f:
                f.write(timezone)
        except Exception as e:
            print(f"Warning: Could not write timezone to {tzinfo_file}: {e}")
        
        return timezone
    except (subprocess.CalledProcessError, json.JSONDecodeError, KeyError, Exception) as e:
        #print(f"Error getting timezone from RPC: {e}")
        
        # Try to retrieve the timezone from the local file
        try:
            if os.path.exists(tzinfo_file):
                with open(tzinfo_file, 'r') as f:
                    timezone = f.read().strip()
                    if timezone:
                        #print(f"Using timezone from {tzinfo_file}: {timezone}")
                        return timezone
        except Exception as file_error:
            print(f"Error reading timezone from {tzinfo_file}: {file_error}")
        
        # Default to UTC if all else fails
        return "Asia/Calcutta"


def getmountpoints(): #return all mountpoints of sd* disks
    try:
       # print(f"IN GETMOUNTPOINTS")
        df_output = subprocess.check_output(['df', '-h']).decode('utf-8')
        lines = df_output.strip().split('\n')
        #print(f"lines: {lines}")
        # Remove the header
        lines = lines[1:]


        disk_mountpoints = []
        for mount in lines:
            #print(f"mount: {mount}")
            fields = mount.split()
            #print(f"fields: {fields}")
            device = fields[0]
            #print(f"device: {device}")
            mountpoint = fields[5]
            if device.startswith("/dev/sd"):
                disk_mountpoints.append(mountpoint)

            #if device.startswith("/dev/nvme0n1p3"): #internal disk partition 3 to be mounted as internal storage at directory internal storage
            #    disk_mountpoints.append(f'{mountpoint}/{name_of_internal_storage_share}')
       # print(f"DISKMOUNTS is {disk_mountpoints}")
        return disk_mountpoints
    except:
        return None

def get_disk_model_from_mountpoint(mount_point):
    try:
        # Ensure the mount point exists
        if not os.path.ismount(mount_point):
            return "Error: Not a valid mount point"

        # Get the device name from the mount point
        df_cmd = f"df -P {mount_point} | tail -1 | cut -d' ' -f1"
        device = subprocess.check_output(df_cmd, shell=True, text=True).strip()

        # Get the parent device name (in case it's a partition)
        lsblk_cmd = f"lsblk -ndo pkname {device}"
        parent_device = subprocess.check_output(lsblk_cmd, shell=True, text=True).strip()

        # Use the parent device if available, otherwise use the original device
        target_device = parent_device if parent_device else device
        print(f"target_device: {target_device}")
        # If target_device starts with '/dev/', remove it
        if target_device.startswith('/dev/'):
            target_device = target_device.replace('/dev/', '')
        #print(f"target_device: {target_device}")

        # Now, get the disk information using fdisk
        fdisk_cmd = f"fdisk -l /dev/{target_device}"
        output = subprocess.check_output(fdisk_cmd, shell=True, text=True, stderr=subprocess.DEVNULL)

        # Search for the disk model in the output
        model_match = re.search(r"Disk model: (.*)", output)
        if model_match:
            return model_match.group(1).strip().replace(" ", "-")
        else:
            return "Model not found"

    except subprocess.CalledProcessError as e:
        return f"Error: Command failed: {e}"
    except Exception as e:
        return f"Error: {str(e)}"

def restart_immich_server():
    try:
        subprocess.run(["systemctl", "restart", "immich.service"], check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Failed to restart immich service: {e}")
        return False

def restart_duplicati_server():
    try:
        subprocess.run(["systemctl", "restart", "duplicati.service"], check=False)
    except:
        pass
    return True
 
def update_immich_config() -> bool:
    """
    Update immich.json configuration file based on Tailscale funnel status.
    Returns True if successful, False otherwise.
    """
    config_file = '/etc/immich/immich.json'
    
    try:
        # Check if config file exists
        if not os.path.exists(config_file):
            #print(f"Configuration file {config_file} not found")
            return False

        # Get hostname
        hostname = get_hostname()

        # Get funnel status using omv-rpc
        try:
            cmd = ["omv-rpc", "-u", "admin", "Homecloud", "getFunnelStatus", '{"appname":"immich"}']
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            funnel_status = json.loads(result.stdout)
        except (subprocess.CalledProcessError, json.JSONDecodeError) as e:
            #print(f"Error getting funnel status: {str(e)}")
            funnel_status = None
        
        # Open file with exclusive lock
        with open(config_file, 'r+') as file:
            # Acquire exclusive lock
            fcntl.flock(file.fileno(), fcntl.LOCK_EX)
            
            try:
                # Read current config
                config = json.load(file)
                
                # Determine external domain
                if (funnel_status and 
                    funnel_status.get('status') == 'Enabled' and 
                    funnel_status.get('app') == 'immich' and 
                    funnel_status.get('url')):
                    # Use funnel URL
                    external_domain = funnel_status['url']
                else:
                    # Use local URL
                    external_domain = f"https://{hostname}:2284"
                
                # Update config if needed
                if config.get('server', {}).get('externalDomain') != external_domain:
                    # Ensure server section exists
                    if 'server' not in config:
                        config['server'] = {}
                    
                    # Update external domain
                    config['server']['externalDomain'] = external_domain
                    
                    # Move file pointer to beginning
                    file.seek(0)
                    
                    # Write updated config
                    json.dump(config, file, indent=2)
                    
                    # Truncate remaining content if new content is shorter
                    file.truncate()
                
                return True
                
            except json.JSONDecodeError:
                return False
            finally:
                # Release lock
                fcntl.flock(file.fileno(), fcntl.LOCK_UN)
                
    except (PermissionError, Exception):
        return False


def update_paperless_ngx_config() -> bool:
    """
    Update paperless-ngx docker-compose.env configuration file based on Tailscale funnel status.
    If funnel is not enabled, uses local hostname.
    Returns True if successful, False otherwise.
    """
    config_file = '/etc/paperless/docker-compose.env'
    
    try:
        # Get funnel status using omv-rpc
        try:
            cmd = ["omv-rpc", "-u", "admin", "Homecloud", "getFunnelStatus", '{"appname":"paperless-ngx"}']
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            funnel_status = json.loads(result.stdout)
        except (subprocess.CalledProcessError, json.JSONDecodeError) as e:
            logger.error(f"Error getting funnel status: {e}")
            funnel_status = {"status": "Error", "url": None}

        # Check if config file exists
        if not os.path.exists(config_file):
            logger.error(f"Config file not found: {config_file}")
            return False

        # Determine the URL to use
        if funnel_status.get('status') == 'Enabled' and funnel_status.get('url'):
            new_url = funnel_status['url']
        else:
            # Fallback to hostname if funnel is not enabled or URL is null
            new_url_temp = get_hostname()
            new_url = f"https://{new_url_temp}"

            
        # Read current config
        with open(config_file, 'r') as file:
            lines = file.readlines()

        # Flag to track if we found and updated the URL
        updated = False
        
        # Process each line
        for i, line in enumerate(lines):
            if line.startswith('PAPERLESS_URL='):
                # Update the URL line
                lines[i] = f'PAPERLESS_URL={new_url}\n'
                updated = True
                break
        
        # If PAPERLESS_URL wasn't found, append it
        if not updated:
            lines.append(f'PAPERLESS_URL={new_url}\n')

        # Write the updated config back
        #with open(config_file, 'w') as file:
        #    file.writelines(lines)
        safe_write_file(config_file, lines, mode="w", encoding="utf-8", lock_timeout=5.0, backup=True)


    except Exception as e:
        logger.error(f"Unexpected error updating paperless-ngx config: {e}")
        return False

def generate_totp():
    """
    Generate a random 4-digit TOTP code valid for 1 minute
    """
    global current_totp, totp_expiry
    
    # Generate a random 4-digit code
    totp_code = str(random.randint(1000, 9999))
    
    # Set expiration time to 1 minute from now
    totp_expiry = int(time.time()) + 60
    
    # Store the code
    current_totp = totp_code
    
    return totp_code

def update_smtp_config():
    try:
        # Run omv-rpc command to get SMTP configuration
        cmd = "omv-rpc -u admin 'EmailNotification' 'get'"
        result = subprocess.check_output(cmd, shell=True, text=True)
        
        # Parse JSON output
        smtp_config = json.loads(result)
        
        # List of scripts to update
        scripts = [
            "/sbin/update-immich-smtp.sh",
            "/sbin/update-vaultwarden-smtp.py",
            "/sbin/update-paperless-smtp.sh",
            "/sbin/update-joplin-smtp.sh",
            "/sbin/update-duplicati-smtp.py"
        ]
        
        if smtp_config.get("enable", False):
            # Prepare parameters for enabled SMTP
            params = (
                f"-f {shlex.quote(smtp_config['sender'])} "
                f"-r {shlex.quote(smtp_config['primaryemail'])} "
                f"-h {shlex.quote(smtp_config['server'])} "
                f"-p {smtp_config['port']} "
                f"-u {shlex.quote(smtp_config['username'])} "
                f"-w {shlex.quote(smtp_config['password'])}"
            )
        else:
            # If SMTP is disabled
            params = "-s disabled"
            
        # Execute each script with the parameters
        for script in scripts:
            try:
                cmd = f"{script} {params}"
                subprocess.run(cmd, shell=True, check=True)
                #print(f"Successfully updated SMTP configuration for {script}")
            except subprocess.CalledProcessError as e:
                print(f"Error updating SMTP configuration for {script}: {str(e)}")
                
    except subprocess.CalledProcessError as e:
        print(f"Error getting SMTP configuration: {str(e)}")
    except json.JSONDecodeError as e:
        print(f"Error parsing SMTP configuration: {str(e)}")
    except Exception as e:
        print(f"Unexpected error: {str(e)}")

if __name__ == "__main__":
    update_smtp_config()


class LockTimeoutError(Exception):
    pass

def _acquire_lock(lock_fh, timeout):
    """Acquire exclusive flock with timeout."""
    start = time.time()
    while True:
        try:
            fcntl.flock(lock_fh.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
            return
        except (BlockingIOError, OSError):
            if (time.time() - start) >= timeout:
                raise LockTimeoutError(f"Timeout acquiring lock on {lock_fh.name}")
            time.sleep(0.1)

def _release_lock(lock_fh):
    """Release the flock."""
    fcntl.flock(lock_fh.fileno(), fcntl.LOCK_UN)

def safe_write_file(path,
                    data,
                    mode="w",
                    encoding=None,
                    lock_timeout=5.0,
                    backup=True,
                    backup_suffix=".bak"):
    """
    Safely write to file with:
      - Exclusive lock (flock)
      - Temp file + atomic replace
      - fsync on file and directory
      - Optional backup

    Args:
        path (str): target file path
        data (str|bytes|list): content to write
        mode (str): file mode ('w','wb',etc.)
        encoding (str|None): encoding for text mode
        lock_timeout (float): seconds to wait for lock
        backup (bool): whether to create backup of existing file
        backup_suffix (str): suffix for backup file
    """
    dir_name = os.path.dirname(path) or "."
    os.makedirs(dir_name, exist_ok=True)

    lock_path = path + ".lock"
    lock_fh = None
    
    try:
        lock_fh = open(lock_path, "w")
        _acquire_lock(lock_fh, timeout=lock_timeout)

        fd, tmp_path = tempfile.mkstemp(dir=dir_name)
        try:
            with os.fdopen(fd, mode, encoding=encoding) as tmp_file:
                if isinstance(data, list):
                    tmp_file.writelines(data)
                else:
                    tmp_file.write(data)
                tmp_file.flush()
                os.fsync(tmp_file.fileno())

            if backup and os.path.exists(path):
                backup_path = path + backup_suffix
                shutil.copy2(path, backup_path)

            os.replace(tmp_path, path)

            try:
                dir_fd = os.open(dir_name, os.O_DIRECTORY)
                os.fsync(dir_fd)
                os.close(dir_fd)
            except Exception:
                pass  # Directory fsync is best-effort

        except Exception:
            try:
                os.remove(tmp_path)
            except FileNotFoundError:
                pass
            raise
            
    finally:
        if lock_fh:
            try:
                _release_lock(lock_fh)
                lock_fh.close()
            except Exception:
                pass
        # Clean up lock file
        try:
            os.remove(lock_path)
        except Exception:
            pass



def update_photoprism_YAML(**kwargs): # updates YAML config 
    try:
        global COMMON_USERNAME
        global INDEXING_SCHEDULE


        if (kwargs):
            # if first key is user then check if it is same as COMMON_USERNAME. If yes then do nothing as yaml file for that user is already read.
            # If not then find the homedirectory of user and load the user specific yaml file
            first_key, first_value = next(iter(kwargs.items()))
        hostname = get_hostname()

        #filebrowser_yaml = f'/etc/filebrowser/docker-compose.yml'    
        immich_yaml = f'/etc/immich/docker-compose.yml'
        vaultwarden_yaml = f'/etc/vault-warden/docker-compose-vaultwarden.yml'
        paperless_yaml = f'/etc/paperless/docker-compose.yml'
        paperless_env = f'/etc/paperless/docker-compose.env'
        joplin_yaml = f'/etc/joplin/docker-compose.yml'
        joplin_env = f'/etc/joplin/.env'
        jellyfin_yaml = f'/etc/jellyfin/docker-compose.yml'
        duplicati_yaml = f'/etc/duplicati/docker-compose-duplicati.yaml'

        timezone = get_system_timezone()

        update_smtp_config()


        if (os.path.exists(jellyfin_yaml)):
            with open(jellyfin_yaml, 'r') as file:
                jellyfin_data = yaml.safe_load(file)
            file.close()

    
            if ('labels' not in jellyfin_data['services']['jellyfin']):
                jellyfin_data['services']['jellyfin']['labels'] = []
                jellyfin_data['services']['jellyfin']['labels'].append('traefik.enable=true')
                jellyfin_data['services']['jellyfin']['labels'].append('traefik.http.routers.jellyfin.rule=PathPrefix(`/`)')
                jellyfin_data['services']['jellyfin']['labels'].append('traefik.http.routers.jellyfin.entrypoints=jellyfin')
                jellyfin_data['services']['jellyfin']['labels'].append('traefik.http.middlewares.jellyfin.headers.customrequestheaders.X-Forwarded-Proto=https')
                jellyfin_data['services']['jellyfin']['labels'].append('traefik.http.routers.jellyfin.tls=true')
                jellyfin_data['services']['jellyfin']['labels'].append('traefik.http.services.jellyfin.loadbalancer.server.port=8096')
                jellyfin_data['services']['jellyfin']['labels'].append('traefik.http.services.jellyfin.loadbalancer.passhostheader=true')

            #get uid and gid of user admin
            uid, gid = get_user_uid_gid('admin')
            jellyfin_data['services']['jellyfin']['user'] = f'{uid}:{gid}'
            # parse ['services']['jellyfin']['environment'] array to see if JELLYFIN_PublishedServerUrl key exists. If yes then update the value to https://{hostname}:8096
            # if it does not exist then add the key and value to the array
            #jellyfin_data['services']['jellyfin']['environment'] = [f'JELLYFIN_PublishedServerUrl=https://{hostname}:8096']
            #first check if environment exists
            if ('environment' not in jellyfin_data['services']['jellyfin']):
                jellyfin_data['services']['jellyfin']['environment'] = []
            url_found = 0
            config_found = 0
            cache_found = 0
            timezone_found = 0
            for i, item in enumerate(jellyfin_data['services']['jellyfin']['environment']):
                if item.startswith('JELLYFIN_PublishedServerUrl'):
                    jellyfin_data['services']['jellyfin']['environment'][i] = f'JELLYFIN_PublishedServerUrl=https://{hostname}:8097/'
                    url_found=1
                if item.startswith('JELLYFIN_DATA_DIR'):
                    jellyfin_data['services']['jellyfin']['environment'][i] = f'JELLYFIN_DATA_DIR=/config'
                    config_found=1
                if item.startswith('JELLYFIN_CACHE_DIR'):
                    jellyfin_data['services']['jellyfin']['environment'][i] = f'JELLYFIN_CACHE_DIR=/cache'
                    cache_found=1
                if item.startswith('TZ'):
                    jellyfin_data['services']['jellyfin']['environment'][i] = (f'TZ={timezone}')
                    timezone_found=1
            
            if (url_found == 0):
                jellyfin_data['services']['jellyfin']['environment'].append(f'JELLYFIN_PublishedServerUrl=https://{hostname}:8097/')
            if (config_found == 0):
                jellyfin_data['services']['jellyfin']['environment'].append(f'JELLYFIN_DATA_DIR=/config')
            if (cache_found==0):
                jellyfin_data['services']['jellyfin']['environment'].append(f'JELLYFIN_CACHE_DIR=/cache')
            if (timezone_found==0):
                jellyfin_data['services']['jellyfin']['environment'].append(f'TZ={timezone}')            


            #jellyfin_data['services']['jellyfin']['volumes'] = ['/var/lib/jellyfin/config:/config','/var/lib/jellyfin/cache:/cache']




            #with semaphore_file_YAML:
            #semaphore_file_YAML.acquire()
            #with open(jellyfin_yaml, 'w') as file:
            #    yaml.dump(jellyfin_data, file, default_flow_style=False)
            #file.close()
            yaml_content = yaml.safe_dump(jellyfin_data, default_flow_style=False)
            safe_write_file(jellyfin_yaml, yaml_content, mode="w", encoding="utf-8", lock_timeout=5.0, backup=True)
            #semaphore_file_YAML.release()



        if (os.path.exists(joplin_yaml)):
            with open(joplin_yaml, 'r') as file:
                joplin_data = yaml.safe_load(file)
            file.close()

            if ('labels' not in joplin_data['services']['app']):
                joplin_data['services']['app']['labels'] = []
                joplin_data['services']['app']['labels'].append('traefik.enable=true')
                joplin_data['services']['app']['labels'].append('traefik.http.routers.joplin.rule=PathPrefix(`/`)')
                joplin_data['services']['app']['labels'].append('traefik.http.routers.joplin.entrypoints=joplin')
                joplin_data['services']['app']['labels'].append('traefik.http.middlewares.joplin.headers.customrequestheaders.X-Forwarded-Proto=https')
                joplin_data['services']['app']['labels'].append('traefik.http.routers.joplin.tls=true')
                joplin_data['services']['app']['labels'].append('traefik.http.services.joplin.loadbalancer.server.port=22300')
                joplin_data['services']['app']['labels'].append('traefik.http.services.joplin.loadbalancer.passhostheader=true')

            # get uid and gid of user joplin
            #uid, gid = get_user_uid_gid('joplin')
            #joplin_data['services']['app']['user'] = f'{uid}:{gid}'
            
            joplin_data['services']['db']['volumes'] = ['/var/lib/joplin/postgres:/var/lib/postgresql/data']
             
            # Check if 'ports' exists in services.db and remove it if found
            if 'ports' in joplin_data['services']['db']:
                del joplin_data['services']['db']['ports']


            #with semaphore_file_YAML:
            #semaphore_file_YAML.acquire()
            #with open(joplin_yaml, 'w') as file:
            #    yaml.dump(joplin_data, file, default_flow_style=False)
            #file.close()
            yaml_content = yaml.safe_dump(joplin_data, default_flow_style=False)
            safe_write_file(joplin_yaml, yaml_content, mode="w", encoding="utf-8", lock_timeout=5.0, backup=True)

            #semaphore_file_YAML.release()

        if (os.path.exists(joplin_env)):
            new_lines = []
            with open(joplin_env,'r') as file:

                lines = file.readlines()
                #find uid and gid of user paperless
                
                # check if PAPERLESS_URL exists. If yes update it to value https://{hostname}
                if (hostname != None):
                    for i, line in enumerate(lines):
                        if line.startswith('APP_BASE_URL='):
                            lines[i] = (f"APP_BASE_URL=https://{hostname}:22302/\n")
            file.close()
            #with open(joplin_env, 'w') as file:
            #    file.writelines(lines)
            #file.close()
            safe_write_file(joplin_env, lines, mode="w", encoding="utf-8", lock_timeout=5.0, backup=True)



        if (os.path.exists(paperless_yaml)):
            with open(paperless_yaml, 'r') as file:
                paperless_data = yaml.safe_load(file)
            file.close()

            if ('labels' not in paperless_data['services']['webserver']):                
                paperless_data['services']['webserver']['labels'] = []
                paperless_data['services']['webserver']['labels'].append('traefik.enable=true')
                paperless_data['services']['webserver']['labels'].append('traefik.http.routers.paperless-2.rule=PathPrefix(`/paperless/`)')
                paperless_data['services']['webserver']['labels'].append('traefik.http.routers.paperless-2.tls=true')
                paperless_data['services']['webserver']['labels'].append('traefik.http.services.paperless-2.loadbalancer.server.port=8000')

            
            paperless_data['services']['webserver']['volumes'] = ['/var/lib/paperless/data:/usr/src/paperless/data', '/var/lib/paperless/media:/usr/src/paperless/media', '/var/lib/paperless/export:/usr/src/paperless/export', '/var/lib/paperless/consume:/usr/src/paperless/consume']
            paperless_data['services']['db']['volumes'] = ['/var/lib/paperless/pgdata:/var/lib/postgresql/data']
            paperless_data['services']['broker']['volumes'] = ['/var/lib/paperless/redisdata:/data']

            if 'environment' not in paperless_data['services']['gotenberg']:
                paperless_data['services']['gotenberg']['environment'] = []
                paperless_data['services']['gotenberg']['environment'].append(f'GOTENBERG_LIBREOFFICE_PRELOAD: "true"')
                paperless_data['services']['gotenberg']['environment'].append(f'GOTENBERG_LIBREOFFICE_START_TIMEOUT: "30s"')

            #paperless_data['volumes'] = ['data:/var/lib/paperless/data', 'media:/var/lib/paperless/media', 'pgdata:/var/lib/paperless/postgres/', 'redisdata:/var/lib/paperless/redisdata']
            # remove volumes section
            paperless_data.pop('volumes', None)

            #with semaphore_file_YAML:
            #semaphore_file_YAML.acquire()
            #with open(paperless_yaml, 'w') as file:
            #    yaml.dump(paperless_data, file, default_flow_style=False)
            #file.close()
            yaml_content = yaml.safe_dump(paperless_data, default_flow_style=False)
            safe_write_file(paperless_yaml, yaml_content, mode="w", encoding="utf-8", lock_timeout=5.0, backup=True)

            #semaphore_file_YAML.release()
        
        

        if (os.path.exists(paperless_env)):
            new_lines = []
            with open(paperless_env,'r') as file:

                lines = file.readlines()
                #find uid and gid of user paperless
                uid, gid = get_user_uid_gid('paperless')
                
                # check if PAPERLESS_URL exists. If yes update it to value https://{hostname}
                if (hostname != None):
                    for i, line in enumerate(lines):
                        if line.startswith('PAPERLESS_FORCE_SCRIPT_NAME='):
                            lines[i] = (f"PAPERLESS_FORCE_SCRIPT_NAME=/paperless\n")
                        elif line.startswith('PAPERLESS_URL='):
                            lines[i] = (f"PAPERLESS_URL=https://{hostname}\n")
                        if line.startswith('PAPERLESS_TIME_ZONE='):
                            lines[i] = (f"PAPERLESS_TIME_ZONE={timezone}\n")
                        if not any(line.startswith('PAPERLESS_FORCE_SCRIPT_NAME=') for line in lines):
                            lines.append(f"PAPERLESS_FORCE_SCRIPT_NAME=/paperless\n")
                        if not any(line.startswith('PAPERLESS_URL=') for line in lines):
                            lines.append(f"PAPERLESS_URL=https://{hostname}\n")
                        if not any(line.startswith('PAPERLESS_TIME_ZONE=') for line in lines):
                            lines.append(f'PAPERLESS_TIME_ZONE={timezone}\n')
                        if line.startswith('PAPERLESS_TIME_ZONE='):
                            lines[i] = (f"PAPERLESS_TIME_ZONE={timezone}\n")
                        if not any(line.startswith('USERMAP_UID=') for line in lines):
                            lines.append(f'USERMAP_UID={uid}\n')
                        if not any(line.startswith('USERMAP_GID=') for line in lines):
                            lines.append(f'USERMAP_GID={gid}\n')
                        if not any(line.startswith('PAPERLESS_OCR_LANGUAGE=') for line in lines):
                            lines.append(f'PAPERLESS_OCR_LANGUAGE=eng\n')
                          
                        if not any(line.startswith('PAPERLESS_MEDIA_ROOT=') for line in lines):
                            lines.append(f'PAPERLESS_MEDIA_ROOT=/usr/src/paperless/media\n')
                        if not any(line.startswith('PAPERLESS_CONSUMPTION_DIR=') for line in lines):
                            lines.append(f'PAPERLESS_CONSUMPTION_DIR=/usr/src/paperless/consume\n')
                        if not any(line.startswith('PAPERLESS_EXPORT_DIR=') for line in lines):
                            lines.append(f'PAPERLESS_EXPORT_DIR=/usr/src/paperless/export\n')
                        if not any(line.startswith('PAPERLESS_DATA_DIR=') for line in lines):
                            lines.append(f'PAPERLESS_DATA_DIR=/usr/src/paperless/data\n')
                        if not any(line.startswith('PAPERLESS_CONSUMER_RECURSIVE=') for line in lines):
                            lines.append(f'PAPERLESS_CONSUMER_RECURSIVE=true\n')
                        if not any(line.startswith('PAPERLESS_CONSUMER_POLLING=') for line in lines):
                            lines.append(f'PAPERLESS_CONSUMER_POLLING=600\n')
            file.close()
            #with open(paperless_env, 'w') as file:
            #    file.writelines(lines)
            #file.close()
            safe_write_file(paperless_env, lines, mode="w", encoding="utf-8", lock_timeout=5.0, backup=True)

            update_paperless_ngx_config()

        # check if these files exist otherwise return
        #if (os.path.exists(filebrowser_yaml)):
        #    with open(filebrowser_yaml, 'r') as file:
        #        data = yaml.safe_load(file)
        #    file.close()    
        
        print(f"entering updating immich_yaml file {immich_yaml}")

        if (os.path.exists(immich_yaml)):
            with open(immich_yaml, 'r') as file:
                immich_data = yaml.safe_load(file)
            file.close()
            #print(f"read immich_yaml file {immich_yaml} {immich_data}")
            # add a section if not already present  immich_data['services']['immich-server']['labels'] and it should have traefik related labels
            if ('labels' not in immich_data['services']['immich-server']):
                print(f"updating immich_data in mem")
                immich_data['services']['immich-server']['labels'] = []
                immich_data['services']['immich-server']['labels'].append('traefik.enable=true')
                immich_data['services']['immich-server']['labels'].append('traefik.http.routers.immich.entrypoints=immich')
                immich_data['services']['immich-server']['labels'].append('traefik.http.routers.immich.rule=PathPrefix(`/`)')
                immich_data['services']['immich-server']['labels'].append('traefik.http.routers.immich.tls=true')
                immich_data['services']['immich-server']['labels'].append('traefik.http.services.immich.loadbalancer.server.port=2283')
            
            volumes = immich_data['services']['immich-server']['volumes']
            config_volume = '/etc/immich/immich.json:/etc/immich/immich.json'
            config_volume_found = 0
            for i,vol in enumerate(volumes):
                if config_volume in vol:
                    config_volume_found = 1
            
            if (config_volume_found == 0):
                immich_data['services']['immich-server']['volumes'].append(f'{config_volume}')
            
                 # open file /etc/immich/.env and update UPLOAD_LOCATION to /var/lib/immich, DB_DATA_LOCATION to /var/lib/immich/postgres, TZ to Asia/Calcultta
            env_file = '/etc/immich/.env'
            #print(f"File exists: {os.path.exists(env_file)}")
            #print(f"File is readable: {os.access(env_file, os.R_OK)}")
            #print(f"File is writable: {os.access(env_file, os.W_OK)}")
            if (os.path.exists('/etc/immich/.env')):
                with open('/etc/immich/.env', 'r') as file:
                    lines = file.readlines()
                    for i, line in enumerate(lines):
                        if line.startswith('UPLOAD_LOCATION='):
                            lines[i] = 'UPLOAD_LOCATION=/var/lib/immich\n'
                        elif line.startswith('DB_DATA_LOCATION='):
                            lines[i] = 'DB_DATA_LOCATION=/var/lib/immich/postgres\n'
                        # check if IMMICH_CONFIG_FILE is present in .env file. If not then add it
                        if not any(line.startswith('IMMICH_CONFIG_FILE=') for line in lines):
                            lines.append('IMMICH_CONFIG_FILE=/etc/immich/immich.json\n')
                        if not any(line.startswith('TZ=') for line in lines):
                            lines.append(f'TZ={timezone}\n')
                        if line.startswith('TZ='):
                            lines[i] = f'TZ={timezone}\n'
                file.close()
            # write the changes to file
                #with open('/etc/immich/.env', 'w') as file:
                #    file.writelines(lines)
                #file.close()
                safe_write_file(env_file, lines, mode="w", encoding="utf-8", lock_timeout=5.0, backup=True)

                

            
           

        if (os.path.exists(vaultwarden_yaml)):
            print(f"opening vaultwarden yaml")
            #print(f"File exists: {os.path.exists(vaultwarden_yaml)}")
            #print(f"File is readable: {os.access(vaultwarden_yaml, os.R_OK)}")
            #print(f"File is writable: {os.access(vaultwarden_yaml, os.W_OK)}")
            #print(f"File permissions: {oct(os.stat(vaultwarden_yaml).st_mode)}")
            #print(f"Current user: {os.getuid()}")
            with open(vaultwarden_yaml, 'r') as file:
                vaultwarden_data = yaml.safe_load(file)
            file.close()
            #print(f"opening vaultwarden yaml2")
            if (pwd.getpwnam('vault')):
                #print(f"opening vaultwarden yaml3")
                uid,gid=get_user_uid_gid('vault')
                #print(f"uid{uid} {gid}")
            #uid,gid=get_user_uid_gid(vault)
            vaultwarden_data['services']['vaultwarden']['user'] = f'{uid}:{gid}'
            #print(f"uid2{uid} {gid}")
            if ('labels' not in vaultwarden_data['services']['vaultwarden']):
                vaultwarden_data['services']['vaultwarden']['labels'] = []
                vaultwarden_data['services']['vaultwarden']['labels'].append('traefik.enable=true')
                vaultwarden_data['services']['vaultwarden']['labels'].append('traefik.http.routers.vaultwarden.rule=PathPrefix(`/passwords`)')
                vaultwarden_data['services']['vaultwarden']['labels'].append('traefik.http.routers.vaultwarden.tls=true')
            # get hostname using get_hostname and update that in vaultwarden_data['services']['vaultwarden']['environment']['DOMAIN']
            #print(f"uid3{uid} {gid}")
            #print(f"Current vaultwarden data structure:{vaultwarden_data}")
            
            if (hostname != None):
                domain_found = 0
                tz_found = 0
                #print(f"hostname is {hostname}")
                for i, item in enumerate(vaultwarden_data['services']['vaultwarden']['environment']):
                    if item.startswith('DOMAIN'):
                        vaultwarden_data['services']['vaultwarden']['environment'][i] = f'DOMAIN=https://{hostname}/passwords/'
                        domain_found = 1
                    if item.startswith('TZ'):
                        vaultwarden_data['services']['vaultwarden']['environment'][i] = f'TZ={timezone}'
                        tz_found = 1
                
                if tz_found == 0:
                    # Append with correct format without newline
                    vaultwarden_data['services']['vaultwarden']['environment'].append(f'TZ={timezone}')

                if domain_found == 0:
                    # Append with correct format without newline
                    vaultwarden_data['services']['vaultwarden']['environment'].append(f'DOMAIN=https://{hostname}/passwords/')
            #with open(vaultwarden_yaml, 'w') as file:
            #    yaml.dump(vaultwarden_data, file, default_flow_style=False)
            #file.close()
            yaml_content = yaml.safe_dump(vaultwarden_data, default_flow_style=False)
            safe_write_file(vaultwarden_yaml, yaml_content, mode="w", encoding="utf-8", lock_timeout=5.0, backup=True)

        #print(f"Checkpoint 1 --------------------------------------")
        #print(f"IN UPDATE YAML:")
        #if (INDEXING_SCHEDULE != None):
        #    data['services']['photoprism']['environment']['PHOTOPRISM_INDEX_SCHEDULE'] = INDEXING_SCHEDULE
        #    with semaphore_file_YAML:
        #        with open(photoprism_yaml, 'w') as file:
        #            yaml.dump(data, file, default_flow_style=False)
        #        file.close()
        #        INDEXING_SCHEDULE = None
        #    return True
        
        #code to update uid,gid for [services][filebrowser][environment] - PUID and PGID library. Since "family" is admin filebrowser should run with family user uid,gid
        uid, gid = get_user_uid_gid(COMMON_USERNAME)
        #print(f"Checkpoint 2 --------------------------------------")
        #print(data)
        #print (uid,gid)
        #if (uid and gid):
         #   print('deleting')
        #    data['services']['filebrowser']['environment'] = []
            # clear the nested array ['services']['filebrowser']['environment']
        #    data['services']['filebrowser']['environment'].append(f'PUID={uid}')
        #    data['services']['filebrowser']['environment'].append(f'PGID={gid}')
            #data['services']['filebrowser']['environment']['PGID'] = str(gid)
            #data['services']['filebrowser']['environment']['PGID'] = gid
        #print (data)
        # code to add in YAML based on new additions in mountpoint list
        mountpoint_tba = []
        mountpoints=[]
        mountpoints=getmountpoints()
        #print(f"mountpoint: {mountpoints}")
        
        ### changes for filebrowser - filebrowser should show all external mounted disks and /home/family home directory
        #volumes_fbrowser = data['services']['filebrowser']['volumes']
        #print(f"volumes: {volumes}")
        change_in_disks = 0
        if (mountpoints): # check if anything need to be added (if new disks inserted)
            for mount in mountpoints:
                found = 0
                for volume in volumes:
                    if (mount in volume):
                        #print(f"found:{mount} in {volume}")
                        found = 1
                        continue
                if (found == 0):
                    mountpoint_tba.append(mount)
                    change_in_disks = 1
            if (mountpoint_tba):
                mount = ""
                for mount in mountpoint_tba:
                    model=get_disk_model_from_mountpoint(mount)
                    if (os.path.exists(immich_yaml)):
                        immich_data['services']['immich-server']['volumes'].append(f'{mount}:/external-storage/{model}-{mount.replace("/srv/","")}')
                    ### changes for filebrowser - filebrowser should show all external mounted disks and /home/family home directory
                    #data['services']['filebrowser']['volumes'].append(f'{mount}:{mount}')
                    #data['services']['filebrowser']['volumes'].append(f'{mount}:/srv/external-storage/{model}-{mount.replace("/srv/","")}')

        mountpoint_tba = []
        #with semaphore_file_YAML:
        #semaphore_file_YAML.acquire()

        

        #with open('/etc/filebrowser/docker-compose.yml', 'w') as file:
        #    yaml.dump(data, file, default_flow_style=False)
        #file.close()
        #if (os.path.exists(immich_yaml)):
        #    with open(immich_yaml, 'w') as file:
        #        print(f"writing immich file3 {file}")
        #        yaml.dump(immich_data, file, default_flow_style=False)
        #    file.close()
        yaml_content = yaml.safe_dump(immich_data, default_flow_style=False)
        safe_write_file(immich_yaml, yaml_content, mode="w", encoding="utf-8", lock_timeout=5.0, backup=True)
        update_immich_config()
    #semaphore_file_YAML.release()
    # code to remove in YAML based on deletions in mountpoint list
        with open(immich_yaml, 'r') as file:
            data1 = yaml.safe_load(file)
        file.close()
        mount = ""
        volume = ""
        ### changes for filebrowser - filebrowser should show all external mounted disks and /home/family home directory
        #volumes_fbrowser = ""
        volumes = data1['services']['immich-server']['volumes']
        print(f"volumes: {volumes}")
        for i, volume in enumerate(volumes):
            print(f"volume name is {volume}")
            if i == 0: # first line in volumes is for cache storage so we skip it
                continue
            if i == 1: # first line in volumes is for internal storage dummy directory so we skip it - this is to make sure external disks links are not in family home directory
                continue
            if i == 2: # first line in volumes is for internal storage home directory so we skip it
                continue
            found = 0
            if (mountpoints):
                for mount in mountpoints:
                    if (mount in volume):
                        found = 1
                        continue
        # print(f"found: {found}")
            if (found == 0): # need this volume string to be deleted from YAML
                mountpoint_tba.append(volume)
            # print(f"mountpoint_tba: {mountpoint_tba}")
                change_in_disks = 1
    #  print (f"to be deleted: {mountpoint_tba}")
    # print(f"mountpoint_tba: {mountpoint_tba}")
        #with semaphore_file_YAML:
        #semaphore_file_YAML.acquire()
        if (len(mountpoint_tba)>0):
            for i, volume in enumerate(mountpoint_tba):
                print (f"volume is: {volume}")
                for z, volume_to_delete in enumerate(data1['services']['immich-server']['volumes']):
                    if (volume == volume_to_delete ):
                        #print(f"found {volume} to be deleted")
                        del data1['services']['immich-server']['volumes'][z]
                        #print(f"CALLING REMOVE STALE DISKS - disk to delete is {volume}")
        
        print(f" writing immich_yaml")
        yaml_content = yaml.safe_dump(data1, default_flow_style=False)
        safe_write_file(immich_yaml, yaml_content, mode="w", encoding="utf-8", lock_timeout=5.0, backup=True)
        print(f" exiting immich_yaml write")
    #semaphore_file_YAML.release()
        if (os.path.exists(duplicati_yaml)):
            with open(duplicati_yaml, 'r') as file1:
                duplicati_data = yaml.safe_load(file1)
            file1.close()
            
            # Update PUID and PGID with admin user's uid and gid
            
            admin_user = pwd.getpwnam('admin')
            duplicati_data['services']['duplicati']['environment'][0] = f'PUID={admin_user.pw_uid}'
            duplicati_data['services']['duplicati']['environment'][1] = f'PGID={admin_user.pw_gid}'
            print (f"duplicati - updating uid")

            volumes = duplicati_data['services']['duplicati']['volumes']

            # update TZ in duplicati_data['services']['duplicati']['environment'] to timezone
            if (timezone != None):
                tz_found = 0
                for i, item in enumerate(duplicati_data['services']['duplicati']['environment']):
                    if item.startswith('TZ'):
                        duplicati_data['services']['duplicati']['environment'][i] = f'TZ={timezone}'
                        tz_found = 1
                        print (f"duplicati - updating TZ")
                if tz_found == 0:
                    # Append with correct format without newline
                    duplicati_data['services']['duplicati']['environment'].append(f'TZ={timezone}')

            mountpoint_tba_duplicati = []
            mountpoints_duplicati=[]
            mountpoints_duplicati=getmountpoints()          
            change_in_disks = 0
            if (mountpoints_duplicati): # check if anything need to be added (if new disks inserted)
                for mount1 in mountpoints_duplicati:
                    found = 0
                    print (f"duplicati - mount1 is {mount1}")
                    for volume in volumes:
                        if (mount1 in volume):
                            print(f"found:{mount} in {volume}")
                            found = 1
                            continue
                    if (found == 0):
                        mountpoint_tba_duplicati.append(mount1)
                        change_in_disks = 1
                if (mountpoint_tba_duplicati):
                    mount1 = ""
                    for mount1 in mountpoint_tba_duplicati:
                        model1=get_disk_model_from_mountpoint(mount1)
                        duplicati_data['services']['duplicati']['volumes'].append(f'{mount1}:/external-storage/{model1}-{mount1.replace("/srv/","")}')
            mountpoint_tba_duplicati = []
        
            mount1 = ""
            volume = ""
            volumes = duplicati_data['services']['duplicati']['volumes']
            for i, volume in enumerate(volumes):
                if i == 0: # first line in volumes is for cache storage so we skip it
                    continue
                if i == 1: # first line in volumes is for internal storage dummy directory so we skip it - this is to make sure external disks links are not in family home directory
                    continue
                if i == 2: # first line in volumes is for internal storage home directory so we skip it
                    continue
                if i == 3: # first line in volumes is for cache storage so we skip it
                    continue
                if i == 4: # first line in volumes is for internal storage dummy directory so we skip it - this is to make sure external disks links are not in family home directory
                    continue
                if i == 5: # first line in volumes is for internal storage home directory so we skip it
                    continue
                if i == 6: # first line in volumes is for internal storage home directory so we skip it
                    continue
                if i == 7: # first line in volumes is for internal storage home directory so we skip it
                    continue
                if i == 8: # first line in volumes is for internal storage home directory so we skip it
                    continue
                if i == 9: # first line in volumes is for internal storage home directory so we skip it
                    continue
                found = 0
                if (mountpoints_duplicati):
                    for mount1 in mountpoints:
                        if (mount1 in volume):
                            found = 1
                            continue
                if (found == 0): # need this volume string to be deleted from YAML
                    mountpoint_tba_duplicati.append(volume)
                    change_in_disks = 1

            if (len(mountpoint_tba_duplicati)>0):
                for i, volume in enumerate(mountpoint_tba_duplicati):
                    #print (f"volume is: {volume}")
                    for z, volume_to_delete in enumerate(duplicati_data['services']['duplicati']['volumes']):
                        if (volume == volume_to_delete ):
                            #print(f"found {volume} to be deleted")
                            del duplicati_data['services']['duplicati']['volumes'][z]

            hostname = get_hostname()
            if (hostname != None):
                # Find and update the DUPLICATI__WEBSERVICE_ALLOWED_HOSTNAMES environment variable
                for i, env_var in enumerate(duplicati_data['services']['duplicati']['environment']):
                    if env_var.startswith('DUPLICATI__WEBSERVICE_ALLOWED_HOSTNAMES='):
                        duplicati_data['services']['duplicati']['environment'][i] = f'DUPLICATI__WEBSERVICE_ALLOWED_HOSTNAMES={hostname}'
                        break

            yaml_content = yaml.safe_dump(duplicati_data, default_flow_style=False)
            safe_write_file(duplicati_yaml, yaml_content, mode="w", encoding="utf-8", lock_timeout=5.0, backup=True)

    ### changes for filebrowser - filebrowser should show all external mounted disks and /home/family home directory
    #mountpoint_tba = []
    #with open('/etc/filebrowser/docker-compose.yml', 'r') as file:
    #    data1 = yaml.safe_load(file)
    #file.close()

    #volumes_fbrowser = data1['services']['filebrowser']['volumes']
    #for i, volume in enumerate(volumes_fbrowser):
    #    if i <= 2: # first 3 lines in volumes is for settings etc so we skip
    #        continue
    #    found = 0
    #    for mount in mountpoints:
    #        if (mount in volume):
    #            found = 1
    #            continue
    #    if (found == 0): # need this volume string to be deleted from YAML
    #        mountpoint_tba.append(volume)
    #        change_in_disks = 1
    #print (f"to be deleted: {mountpoint_tba}")

    #with semaphore_file_YAML:
    #semaphore_file_YAML.acquire()

    #if (len(mountpoint_tba)>0):
    #    for i, volume in enumerate(mountpoint_tba):
            #print (f"volume is: {volume}")
    #        for z, volume_to_delete in enumerate(data1['services']['filebrowser']['volumes']):
    #           if (volume == volume_to_delete ):
                    #print(f"found {volume} to be deleted")
    #                del data1['services']['filebrowser']['volumes'][z]

    #with open('/etc/filebrowser/docker-compose.yml', 'w') as file:
    #    yaml.dump(data1, file, default_flow_style=False)
    #file.close()
    #semaphore_file_YAML.release()


    #print (f"change_in_disks: {change_in_disks}")
    #  if (change_in_disks == 1): # avoid restart as this disk change may be due to usb errors
    #      #restart_photoprism_and_index()
    #      index_thread = threading.Thread(target=start_indexing_photoprism)
    #      index_thread.start()

        return True
    except:
        return False

def run_salt(command):
    try:
        result = subprocess.run(command, check=True, stdout=subprocess.PIPE, universal_newlines=True)
    #    print(f"result: {result}")
        return True
    except:
        return False

def get_eligible_disk_candidates_for_shares():
    try:
        #first find list of candidate disks for shared folders
        share_candidates = openmediavault.rpc.call("ShareMgmt", "getCandidates")
        #print(f"candidates------------:{share_candidates}\n")
        return share_candidates
    except:
        return False

def get_existing_shared_folders():
    try:
        existing_shares = openmediavault.rpc.call("ShareMgmt", "enumerateSharedFolders")
        #print(f"existing shares------------:{existing_shares}\n")
        return existing_shares
    except:
        return False


def get_environment_variable_uuid():
    try:
        command = ['/usr/sbin/omv-env get OMV_CONFIGOBJECT_NEW_UUID']
        process=subprocess.run(command, text=True,check=True,shell=True, capture_output=True)
        if process.returncode != 0:
         #   print(f"Error: {process.stderr}")
            return None
        else:
            a = process.stdout.split("=")
            uuid=a[1]
            uuid = uuid.replace("\n", "")
            #print(f"uuid-------------------:{uuid}\n")
            return uuid
    except:
        return False

def create_shared_folder(uuid,name,reldirpath,comment,mntentref):
    try:
        rpc_params = {}
        rpc_params.update(
                        {
                            "uuid": uuid,
                            "name": name,
                            "reldirpath": reldirpath,
                            "comment": comment,
                            "mntentref": mntentref
                        }
        )
        result = openmediavault.rpc.call("ShareMgmt", "set", rpc_params)
        #print(f"created_shared_folder------------------------------------------------------------------------------------------------------: {result}")
        return result
    except:
        return False

def set_shared_folder_permissions(uuid,permissions):
    try:
        rpc_params = {}
        rpc_params.update(
                        {
                            "uuid": uuid,
                            "privileges": permissions
                        }
        )
        result = openmediavault.rpc.call("ShareMgmt", "setPrivileges", rpc_params)
        #print(f"-------------------------------------------result{uuid}{result}")
        return result
    except:
        return False

def get_folder_browser_paths(uuid,type,path):
    try:
        rpc_params = {}
        rpc_params.update(
                        {
                            "uuid": uuid,
                            "type": type,
                            "path": path
                        }
        )
        result = openmediavault.rpc.call("FolderBrowser", "get", rpc_params)
        return result
    except:
        return False

def create_directory(path):
    try:
        os.makedirs(path, exist_ok=True)
        return True
    except:
        return False

def get_fs_path_by_disk(uuid):
    try:
        result = openmediavault.rpc.call("FsTab", "enumerateEntries")
        for disk in result:
            if (disk['uuid'] == uuid):
                return disk['dir']
        return False
    except:
        return False

def get_mount_path_by_devname(device_name):
    try:
        with open('/proc/mounts', 'r') as f:
            mounts = f.readlines()
        f.close()

        #disk_mountpoints = []
        for mount in mounts:
            fields = mount.split()
            device = fields[0]
            if (device == device_name):
                return fields[1]
        return False
    except:
        return False

def create_samba_export_from_shares(share_uuid,comment):
    try:
        uuid=get_environment_variable_uuid()
        rpc_params = {}
        rpc_params.update(
                        {
                            "uuid": uuid,
                            "sharedfolderref":share_uuid,
                            "enable":bool(True),
                            "comment":comment,
                            "guest":"no",
                            "readonly":bool(False),
                            "browseable":bool(True),
                            "recyclebin":bool(False),
                            "recyclemaxsize":0,
                            "recyclemaxage":0,
                            "hidedotfiles":bool(True),
                            "inheritacls":bool(False),
                            "inheritpermissions":bool(True),
                            "easupport":bool(False),
                            "storedosattributes":bool(False),
                            "hostsallow":"",
                            "hostsdeny":"",
                            "audit":bool(False),
                            "timemachine":bool(True),
                            "transportencryption":bool(False),
                            "extraoptions":""
                        }
        )
        #print(f"rpc_params: {rpc_params}")
        result = openmediavault.rpc.call("SMB", "setShare", rpc_params)
       # print(f"result: {result}")
        return result
    except:
        return False

def delete_samba_export_from_shares():
    try:
        # find orphaned shared folders and then delete corresponding SMB exports
        existing_shared_folders = get_existing_shared_folders()
        #(f"existing shared folders: {existing_shared_folders}\n\n")
        
        deleted_count = 0
        for shared_folder in existing_shared_folders:
            devicefile = shared_folder['mntent']['devicefile']
            #print(f"Processing share: {shared_folder['name']}, devicefile: {devicefile}")
            
            if devicefile == '':
                sharedfolder_uuid = shared_folder['uuid']
                #print(f"found orphaned folder to delete: {sharedfolder_uuid}")
                
                # Get existing SMB exports
                existing_samba_export_list = get_existing_samba_export_list()
                if existing_samba_export_list['total'] > 0:
                    for export in existing_samba_export_list['data']:
                        if export['sharedfolderref'] == sharedfolder_uuid:
                            #print(f"deleting samba export: {export['uuid']}")
                            rpc_params = {
                                "uuid": export['uuid']
                            }
                            try:
                                result = openmediavault.rpc.call("SMB", "deleteShare", rpc_params)
                                #print(f"deleted SMB export: {result}")
                                deleted_count += 1
                            except Exception as e:
                                print(f"Error deleting SMB export {export['uuid']}: {str(e)}")
        
        # Deploy changes if any exports were deleted
        if deleted_count > 0:
            try:
                with semaphore:
                    result = subprocess.run(
                        ["/usr/sbin/omv-salt", "deploy", "run", "samba"],
                        check=True,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        universal_newlines=True
                    )
                    #print(f"Deployed samba changes: {result.stdout}")
            except subprocess.CalledProcessError as e:
                #print(f"Error deploying samba changes: {e.stderr}")
                return False

        #print(f"Deleted {deleted_count} SMB exports")
        return True
    except Exception as e:
        #print(f"Error in delete_samba_export_from_shares: {str(e)}")
        return False


def get_existing_samba_export_list():
    try:
        rpc_params = {}
        rpc_params.update(
                        {
                            "start": 0,
                            "limit": 1000,
                            "sortfield": "name",
                            "sortdir": "ASC"
                        }
        )
        result = openmediavault.rpc.call("SMB", "getShareList",rpc_params)
      #  print(f"result: {result}")
        return result
    except:
        return False

def create_smb_internal_disk_share():
    try:
        # first mount internal-storage (nvm disk partition with directory name internal-storage. This is for users to use NVM space for their data/photos)
        global name_of_internal_storage_share
        global internal_storage_disk_name
        global internal_storage_share_exists
        internal_storage_share_exists = False
        disk_uuid = False
        internal_storage_directory_exists=False
        share_candidates = get_eligible_disk_candidates_for_shares()
        #existing_shared_folders = get_existing_shared_folders()
        uuid=get_environment_variable_uuid()
        #print(f"uuid:{uuid}")
        if (share_candidates):
            for candidate in share_candidates:
                internal_storage_share_exists = False
                internal_storage_directory_exists=False
                existing_shared_folders = get_existing_shared_folders()
                #print(f"candidate:{candidate}")
                if(internal_storage_disk_name in candidate['description']):
                    #print(f"This is internal storage as name has nvme")
                    disk_uuid=candidate['uuid']
                    # now search for this disk_name in existing shared folders to see if it already exists otherwise create.
                    for shared_folders in existing_shared_folders:
                        if (disk_uuid == shared_folders['mntentref']):
                            #print(f"internal storage shared folder already exists")
                            created_shared_folder_details = shared_folders
                            internal_storage_share_exists=True
                            break
                    if (internal_storage_share_exists == False):
                        #print(f"internal storage does not exists in this system")
                        #create internal-storage directory in internal-storage partition but check if it already exists first
                        paths = get_folder_browser_paths(disk_uuid, "mntent", "/")
                       # print(f"paths:{paths}")
                        for path in paths:
                            if (path == internal_storage_disk_name):
                                internal_storage_directory_exists=True
                                break
                        if (internal_storage_directory_exists == False):
                            # get the full mount path of internal disk
                            mount_path=get_fs_path_by_disk(disk_uuid)
                            if (mount_path != False):
                                print(f"disk_path = {mount_path}")
                                internal_storage_path = f"{mount_path}/{name_of_internal_storage_share}"
                                create_directory(f"/{internal_storage_path}")
                                #print(f"sending request for creating shared folder with UUID: {uuid}")
                        with semaphore:
                            created_shared_folder_details=create_shared_folder(uuid, f"{name_of_internal_storage_share}-{disk_uuid}", f"{name_of_internal_storage_share}/" , "internal storage", disk_uuid)
                            result = subprocess.run(["/usr/sbin/omv-salt", "deploy", "run", "webgui"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
                            internal_storage_share_exists = True
                        # Add code to create SMB share.
                    samba_export_already_exists=False
                    if (internal_storage_share_exists == True):
                        #existing_shared_folders = get_existing_shared_folders()
                        existing_smb_export = get_existing_samba_export_list()
                        #print(f"existing_smb_export: {existing_smb_export}")
                        if (existing_smb_export['total']>0):
                            for shares in existing_smb_export['data']:
                                if (shares['sharedfolderref'] == created_shared_folder_details['uuid']):
                                    samba_export_already_exists=True
                                    break
                        if (samba_export_already_exists == False):
                        #   print(f"Need to create samba export {created_shared_folder_details['uuid'],name_of_internal_storage_share}")
                            with semaphore:
                                created_smb_export_details = create_samba_export_from_shares(created_shared_folder_details['uuid'],f"{name_of_internal_storage_share}")
                        #      print(f"created_smb_export_details: {created_smb_export_details}")
                                result = subprocess.run(["/usr/sbin/omv-salt", "deploy", "run", "samba"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
                        #     print(f"result: {result}" )
        return True
    except:
        return False

def get_disk_model(device_name):
    try:
        # First, get the parent device name
        lsblk_cmd = f"lsblk -ndo pkname {device_name}"
        parent_device = subprocess.check_output(lsblk_cmd, shell=True, text=True).strip()

        if not parent_device:
            parent_device=device_name

        if parent_device.startswith('/dev/'):
            parent_device = parent_device.replace('/dev/', '')

        # Now, get the disk information using fdisk
        fdisk_cmd = f"sudo fdisk -l /dev/{parent_device}"
        output = subprocess.check_output(fdisk_cmd, shell=True, text=True, stderr=subprocess.DEVNULL)

        # Search for the disk model in the output
        model_match = re.search(r"Disk model: (.*)", output)
        if model_match:
            return model_match.group(1).strip().replace(" ", "-")
        else:
            return "Model not found"

    except subprocess.CalledProcessError:
        return "Error: Unable to retrieve disk information"
    except Exception as e:
        return f"Error: {str(e)}"

#change the owner of a folder/file
def set_folder_ownership_and_acl(shared_folder_uuid, ownername, user, permissions):
    """
    Set ownership on a shared folder for a user using OMV RPC call.

    :param shared_folder_uuid: UUID of the shared folder
    :param username: Username to give ownership
    :param permissions: A string of permissions, e.g., 'rwx' for read, write, execute
    :return: True if successful, False otherwise
    """
    try:
        uid,gid = get_user_uid_gid(ownername)
        group_info = grp.getgrgid(gid)

        acluid,aclgid = get_user_uid_gid(user)
        acl_group_info = grp.getgrgid(aclgid)
        # Prepare the ACL data
        acl = {
            "user": user,
            "perms": 0,
            "group": acl_group_info.gr_name
        }

        # Convert permissions string to numeric value
        if 'r' in permissions:
            acl["perms"] |= 4
        if 'w' in permissions:
            acl["perms"] |= 2
        if 'x' in permissions:
            acl["perms"] |= 1

        # Prepare the RPC parameters
        rpc_params = {
            "uuid": shared_folder_uuid,
            "file": "/",
            "recursive": bool(True),
            "replace": bool(True),
            "owner": ownername,
            "group": group_info.gr_name,
            "users": [{
                "name": acl["user"],
                "perms": acl["perms"]
            }],
            "groups": [{
                "name": "users",
                "perms": acl["perms"]
            }]
        }

        # Make the RPC call
        openmediavault.rpc.call("ShareMgmt", "setFileACL", rpc_params)
        #print(f"Successfully set ownership ACL for user {ownername} on shared folder {shared_folder_uuid}")
        return True

    except Exception as e:
        print(f"Error setting ACL: {str(e)}")
        return False


def validate_time_format(time_input):
    """
    Validates time input format.
    Accepts:
    - HH:MM format (e.g., "14:30")
    - "every X minutes" where X is 1-59
    - "every X hours" where X is 1-23

    Returns: bool
    """
    if not isinstance(time_input, str):
        return False

    time_input = time_input.lower().strip()

    # Validate "every X minutes" format
    if "minutes" in time_input:
        try:
            minutes = int(''.join(filter(str.isdigit, time_input)))
            return 1 <= minutes <= 59
        except ValueError:
            return False

    # Validate "every X hours" format
    if "hours" in time_input:
        try:
            hours = int(''.join(filter(str.isdigit, time_input)))
            return 1 <= hours <= 23
        except ValueError:
            return False

    # Validate HH:MM format
    try:
        # Check if the format matches HH:MM
        if not ':' in time_input:
            return False

        hours, minutes = map(int, time_input.split(':'))
        return (0 <= hours <= 23) and (0 <= minutes <= 59)

    except ValueError:
        return False



def convert_time_to_cron(time_input):
    """
    Convert time input to cron expression.
    Accepts:
    - HH:MM format (e.g., "14:30")
    - "every X minutes" where X is a number (e.g., "every 15 minutes")
    - "every X hours" where X is a number (e.g., "every 2 hours")

    Returns: Cron expression as string
    """
    if not isinstance(time_input, str):
        raise ValueError("Input must be a string")

    time_input = time_input.lower().strip()

    # Handle "every X minutes" format
    if "minutes" in time_input:
        try:
            minutes = int(''.join(filter(str.isdigit, time_input)))
            if minutes < 1 or minutes > 59:
                raise ValueError("Minutes must be between 1 and 59")
            return f"*/{minutes} * * * *"
        except ValueError as e:
            raise ValueError(f"Invalid minutes format: {e}")

    # Handle "every X hours" format
    if "hours" in time_input:
        try:
            hours = int(''.join(filter(str.isdigit, time_input)))
            if hours < 1 or hours > 23:
                raise ValueError("Hours must be between 1 and 23")
            # For hours, we set minutes to 0 and use */X for hours
            return f"0 */{hours} * * *"
        except ValueError as e:
            raise ValueError(f"Invalid hours format: {e}")

    # Handle HH:MM time format
    try:
        hours, minutes = map(int, time_input.split(':'))

        # Validate hours and minutes
        if not (0 <= hours <= 23):
            raise ValueError("Hours must be between 0 and 23")
        if not (0 <= minutes <= 59):
            raise ValueError("Minutes must be between 0 and 59")

        return f"{minutes} {hours} * * *"

    except ValueError as e:
        raise ValueError(f"Invalid time format. Use HH:MM, 'every X minutes', or 'every X hours'")


###OMV authentication code
def omv_auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        global OMV_BASE_URL
        # Skip authentication for localhost requests
        if is_localhost():
            request.omv_user = 'localhost'
            return f(*args, **kwargs)

        #print(f"{request}")
        # For non-localhost requests, perform OMV authentication
        omv_session_id = request.cookies.get('OPENMEDIAVAULT-SESSIONID')

        #print (f"omv_session_id:{omv_session_id}")
        if not omv_session_id:
            return jsonify({'error': 'No OMV session found'}), 401

        try:
            headers = {
                'Cookie': f'OPENMEDIAVAULT-SESSIONID={omv_session_id}',
                'Content-Type': 'application/json'
            }

            response = requests.post(
                f'{OMV_BASE_URL}/rpc.php',
                headers=headers,
                json={'service': 'system', 'method': 'noop', 'params': None},
                verify=False
            )
            #print (f"requests:{requests}")
            #print (f"{response}")
            response_data = response.json()

            if response_data.get('response') == None:
                error = response_data.get('error', {})
                error_message = error.get('message', '')
                if 'Session not authenticated' in error_message:
                    return jsonify({'error': 'User not authenticated'}), 401

            #if response.status_code != 200:
            #    return jsonify({'error': 'Invalid OMV session'}), 401

            #session_info = response.json()
            #if not session_info.get('authenticated', False):
            #    return jsonify({'error': 'User not authenticated'}), 401

            #request.omv_user = session_info.get('username')

        except requests.exceptions.RequestException as e:
            return jsonify({'error': 'Failed to validate OMV session'}), 500

        return f(*args, **kwargs)
    return decorated

def rate_limit_key_func():
    """Custom key function for rate limiting"""
    if is_localhost():
        return "localhost"
    return get_remote_address()

limiter = Limiter(
    app=app,
    key_func=rate_limit_key_func,
    default_limits=["1000 per day", "100 per minute"]  # Higher limits by default
)

#######


def is_localhost():
    """Check if request is coming from localhost"""
    remote_addr = request.remote_addr
    return remote_addr in ['127.0.0.1', 'localhost', '::1']



def create_external_disk_share(devicename): # creates both share and SMB export
    try:
        global persistent_msg_id
        global COMMON_USERNAME
        global HOME_DIRS_DEVICE
        if (devicename == "NONE"): # it means we create share and SMB export for all the disks that are current mounted but not shared.
            #print (f"Checking need to create share and SMB export - -----------: \n")
            uuid=get_environment_variable_uuid()
            existing_shared_folders = get_existing_shared_folders()
            global external_storage_share_exists

            external_storage_directory_exists=False
            share_candidates = get_eligible_disk_candidates_for_shares()
            existing_shared_folders = get_existing_shared_folders()
            #print(existing_shared_folders)
            if (share_candidates):
                for candidate in share_candidates:
                    #print(f"candidate:{candidate}")
                    disk_uuid=candidate['uuid']
                    external_storage_share_exists = False
                    # now search for this disk_name in existing shared folders to see if it already exists otherwise create.
                    for shared_folders in existing_shared_folders:
                        if (disk_uuid == shared_folders['mntentref']):
                            external_storage_share_exists=True
                            #break
                    if (external_storage_share_exists == False):
                        #print(f"Need to create share--------------------------")
                        #share should be all directories in the root of the disk (relative disk path would be /) as we want complete disk partition to be exported
                        #paths = get_folder_browser_paths(disk_uuid, "mntent", "/")
                        #print(f"paths:{paths}")
                        #for path in paths:
                        #    if (path == external_storage_disk_name):
                        #        external_storage_directory_exists=True
                        #        break
                        with semaphore:
                            # we need to make share name consistent across remounts - so we need to include device mount name in the share name
                            device_name = candidate['description'].split()[0]
                            #print(f"device_name: {device_name}")
                            # find mount path by device_name
                            mount_path=get_mount_path_by_devname(device_name)
                            if (mount_path):
                                #print(f"mount_path: {mount_path}")
                                device_path = mount_path.split("/")[2]
                                model=get_disk_model(device_name)
                                #print(f"model is {model}")
                                created_shared_folder_details=create_shared_folder(uuid, f"{model}-{device_path}", "/", "external storage", disk_uuid)
                                #print(f"created_shared_folder: {created_shared_folder_details}")

                            #created_shared_folder_details=create_shared_folder(uuid, f"external-disk-partition-{disk_uuid}", "/", "external storage", disk_uuid)
                            #print(f"created_shared_folder_details: {created_shared_folder_details}")
                            result = subprocess.run(["/usr/sbin/omv-salt", "deploy", "run", "webgui"], check=True, stdout=subprocess.PIPE, universal_newlines=True)

            # Add code to create SMB share.

            existing_shared_folders = get_existing_shared_folders()
            existing_smb_export = get_existing_samba_export_list()
            #print(f"existing_smb_export: {existing_smb_export}")
            for shared_folders in existing_shared_folders:
                samba_export_already_exists=False
                # we don't want to SMB export homedirectory as it is done automatically 
                # by OMV so check for the shared folder for homedirs and skip it
                if (shared_folders['device'] == HOME_DIRS_DEVICE):
                    samba_export_already_exists=True # although it does not exist but we don't want it to exist
                    continue
                #print(f"shared_folders: {shared_folders}")
                if (existing_smb_export['total']>0):
                    for shares in existing_smb_export['data']:
                        if (shares['sharedfolderref'] == shared_folders['uuid']):
                            samba_export_already_exists=True
                            break

                
                if (samba_export_already_exists == False):
                    #print(f"Need to create samba export")
                
                    with semaphore:
                        # REMOVED_ON_MAR-29-2025
                        #permissions=[
                        #    {
                        #        "type": "user",
                        #        "name": COMMON_USERNAME,
                        #        "perms": 7
                        #    }
                        #]
                
                        
                        #set_shared_folder_permissions(shared_folders['uuid'],permissions)
                        # END

                        #set filesystem ownership of shared folder to COMMON_USERNAME (only for filesystems that support it - rest of filesystems doesn't enforce acl - file level permissions - everyone get access)
                        # check if shared folder supports posixacl: true
                        
                        if (shared_folders['mntent']['posixacl'] == bool(True)):
                            set_folder_ownership_and_acl(shared_folders['uuid'], COMMON_USERNAME, COMMON_USERNAME, "rwx")
                        
                        created_smb_export_details = create_samba_export_from_shares(shared_folders['uuid'],"external storage")
                        
                      #  print(f"created_smb_export_details: {created_smb_export_details}")
                    
                        result = subprocess.run(["/usr/sbin/omv-salt", "deploy", "run", "samba"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
                    


            #print(f"persistent_msg_id_1: {persistent_msg_id}")
            if (persistent_msg_id != "False"):
                #print(f"senidng removal display request in xreate_external_disk for {persistent_msg_id}")
                text = "Configuring\nDisk"
                success = f"{send_display_request(text, 'once',1, 'remove', persistent_msg_id)}"
                #start_display_timeout_timer()
                if (success == "True"):
                    persistent_msg_id = "False"


        else:

            #global external_storage_disk_name
            #print (f"creating external storage share: {devicename[0]}")
            device=devicename[0]

            #disk_uuid = uuid
            external_storage_directory_exists=False
            share_candidates = get_eligible_disk_candidates_for_shares()
            existing_shared_folders = get_existing_shared_folders()
            uuid=get_environment_variable_uuid()
            #print(f"uuid:{uuid}")
            if (share_candidates):
                for candidate in share_candidates:
                 #   print(f"candidate:{candidate}")
                    if(device in candidate['description']):
                   #     print(f"external storage is a candidate for shared folder")
                        disk_uuid=candidate['uuid']
                        # now search for this disk_name in existing shared folders to see if it already exists otherwise create.
                        external_storage_share_exists = False
                        for shared_folders in existing_shared_folders:
                            if (disk_uuid == shared_folders['mntentref']):
                                external_storage_share_exists=True
                                break
                if (external_storage_share_exists == False):
                   # print(f"Need to create share")
                    #share should be all directories in the root of the disk (relative disk path would be /) as we want complete disk partition to be exported
                    #paths = get_folder_browser_paths(disk_uuid, "mntent", "/")
                    #print(f"paths:{paths}")
                    #for path in paths:
                    #    if (path == external_storage_disk_name):
                    #        external_storage_directory_exists=True
                    #        break
                    with semaphore:
                         # we need to make share name consistent across remounts - so we need to include device mount name in the share name
                        device_name = candidate['description'].split()[0]
                        #print(f"device_name: {device_name}")
                        # find mount path by device_name
                        mount_path=get_mount_path_by_devname(device_name)
                        if (mount_path):
                    #        print(f"mount_path: {mount_path}")
                            device_path = mount_path.split("/")[2]
                            model=get_disk_model(device_name)
                        created_shared_folder_details=create_shared_folder(uuid, f"{model}-{device_path}", "/", "external storage", disk_uuid)
                        #created_shared_folder_details=create_shared_folder(uuid, f"external-disk-partition-{disk_uuid}", "/", "external storage", disk_uuid)
                        result = subprocess.run(["/usr/sbin/omv-salt", "deploy", "run", "webgui"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
                    existing_shared_folders = get_existing_shared_folders()
                    for shared_folder in existing_shared_folders:
                        if (shared_folder['mntent']['devicefile'] == device):
                            shared_folder_uuid=shared_folder['uuid']
                            shared_folder_posxiacl_support=shared_folder['mntent']['posixacl']
                            shared_folder_device=shared_folder['device']


                # Add code to create SMB share.
                samba_export_already_exists=False
                #existing_shared_folders = get_existing_shared_folders()
                existing_smb_export = get_existing_samba_export_list()
                #print(f"existing_smb_export: {existing_smb_export}")
                #print(f"created_shared_folder_UUID is ----------------- {shared_folder_uuid}")
                if (existing_smb_export['total']>0):
                    for shares in existing_smb_export['data']:
                        if (shares['sharedfolderref'] == shared_folder_uuid ):
                            samba_export_already_exists=True
                            break
                if (samba_export_already_exists == False):
                    #print(f"Need to create samba export----------------\n")
                    with semaphore:
                        # REMOVED_ON_MAR-29-2025
                        #permissions=[
                        #    {
                        #        "type": "user",
                        #        "name": COMMON_USERNAME,
                        #        "perms": 7
                        #    }
                        #]
                        #set_shared_folder_permissions(shared_folder_uuid,permissions)
                        # END
                        #set filesystem ownership of shared folder to COMMON_USERNAME (only for filesystems that support it - rest of filesystems doesn't enforce file level permissions - everyone get access)
                        # check if shared folder supports posixacl: true
                        #print (f"-----------------shared_folder_uuid: {shared_folder_uuid}")
                        if (shared_folder_posxiacl_support == bool(True)):
                            set_folder_ownership_and_acl(shared_folder_uuid, COMMON_USERNAME, COMMON_USERNAME, "rwx")
                        
                        created_smb_export_details = create_samba_export_from_shares(shared_folder_uuid,"external storage")
                        #print(f"created_smb_export_details: {created_smb_export_details}")
                        result = subprocess.run(["/usr/sbin/omv-salt", "deploy", "run", "samba"], check=True, stdout=subprocess.PIPE, universal_newlines=True)

           # print(f"persistent_msg_id: {persistent_msg_id}")
            if (persistent_msg_id != "False"):
            #    print(f"senidng removal display request in create_external_disk for {persistent_msg_id}")
                text = "Configuring\nDisk"
                success = f"{send_display_request(text, 'once',1, 'remove', persistent_msg_id)}"
                if (success == "True"):
                    persistent_msg_id = "False"
                text = "Disk\nReady"
                success = f"{send_display_request(text, 'once',10, 'add', 0)}"
             #   print(f"success: {success}")
        return True
    except:
        return False

def delete_disk_share():
    try:
        rpc_params_1 = {}
        #print("deleting external storage share")
        existing_shared_folders = get_existing_shared_folders()
        #print(f"existing shared folders: {existing_shared_folders}\n\n")
        
        for shared_folder in existing_shared_folders:
            #print(f"in loop,{shared_folder['mntent']['devicefile']}")
            
            # Check if devicefile is empty
            if shared_folder['mntent']['devicefile'] == '':
                uuid = shared_folder['uuid']
                #print(f"found orphaned folder to delete: {uuid}")
                rpc_params_1.update({"uuid": uuid, "recursive": (bool(False))})
                #print(f"rpc_params: {rpc_params_1}")
                
                with semaphore:
                    #print(f"rpc_params: {rpc_params_1}")
                    result = openmediavault.rpc.call("ShareMgmt", "delete", rpc_params_1)
                    #print("result: ")
                    result = subprocess.run(["usr/sbin/omv-salt", "deploy", "run", "webgui"], 
                                         check=True, stdout=subprocess.PIPE, 
                                         universal_newlines=True)
                    result = subprocess.run(["usr/sbin/omv-salt", "deploy", "run", "samba"], 
                                         check=True, stdout=subprocess.PIPE, 
                                         universal_newlines=True)
        return True
    except:
        return False


def read_logs(lines_to_read_from_latest):
    try:
        reader = systemd.journal.Reader()
        reader.add_match(_TRANSPORT="kernel")
        reader.log_level(systemd.journal.LOG_INFO)
        reader.add_match(_SYSTEMD_UNIT="systemd-udevd.service")
        entries = list(reader)[-lines_to_read_from_latest:] # last lines of log
        #print(f"CATALOG: ", entries.get_catalog())
        #for entry in entries:
    # Print the log message and timestamp
        #    print(f"{entry['__REALTIME_TIMESTAMP']}: {entry['MESSAGE']}")
        return entries
    except:
        return False

def mount_all_eligible_disks():
    global persistent_msg_id
    try:
        disks = openmediavault.rpc.call("FileSystemMgmt", "getMountCandidates")
        #print(len(disks))
        if (len(disks)>0):
            text = "Configuring\nDisk"
            #success = f"{send_display_request(text, 'once',10, 'add', 0)}"
            #print(f"persistent_msg_id_mount_1: {persistent_msg_id}")
            if (persistent_msg_id == "False"):
                success =  f"{send_display_request(text, 'once', -1, 'add', 0)}"
                if (success != "False"):
                    persistent_msg_id = success
                    #start_display_timeout_timer()

                    #print(f"persistent_msg_id in mount send request : {persistent_msg_id}")
            #persistent_msg_id = f"{send_display_request(text, 'once',-1, 'add', 0)}"
            #print(f"persistent_msg_id in mount send request : {persistent_msg_id}")
            for disk in disks:
                #success = "False"
                devicefiles = disk["devicefiles"]
                rpc_params = {}
                rpc_params.update(
                    {
                        "id": disk["uuid"]
                    }
                )
                openmediavault.rpc.call(
                    "FileSystemMgmt",
                    "setMountPoint",
                    rpc_params
                )
            # mount disk by calling salt
            with semaphore:
                result = subprocess.run(["/usr/sbin/omv-salt", "deploy", "run", "fstab"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
                update_photoprism_YAML() #update photoprism YAML files to start indexing the new disks for photos
                #restart_photoprism_and_index() # lets not restart it here.
        if (persistent_msg_id != "False"):
            #print(f"senidng removal display request in mount_all_eligible_disks for {persistent_msg_id}")
            success = f"{send_display_request(text, 'once', 1, 'remove', persistent_msg_id)}"
            #print(f"success: {success}")
            if (success == "True"):
                persistent_msg_id = "False"
        return True
    except:
        return False

def run_fsck_hfsplus(device_path, fix=False):
    """
    Run fsck.hfsplus on the specified HFS+ device.

    :param device_path: The path of the HFS+ device (e.g., '/dev/sda1')
    :param fix: If True, attempt to fix errors (use -f flag)
    :return: A tuple (success, output), where success is a boolean and output is the command output
    """
    if not os.path.exists(device_path):
        return False, f"Device {device_path} does not exist."

    cmd = ['fsck.hfsplus']
    if fix:
        cmd.append('-f')
    cmd.append(device_path)

    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, f"Error running fsck.hfsplus: {e.stderr}"
    except Exception as e:
        return False, f"Unexpected error: {str(e)}"

def check_service_status(service_name):
    try:
        result = subprocess.run(["systemctl", "status", service_name], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        #print(f"Service '{service_name}' status:\n{result.stdout}")
        for line in result.stdout.split("\n"):
            if "Active:" in line:
                short_status = line.split(":")[1].strip()
                short_1_status = short_status.split('(', 1)
                #print(f"Service '{service_name}' status: {short_status}\n{short_1_status[0]}")
                #return short_1_status[0]
                if "active" in short_1_status[0]:
                    for line in result.stdout.split("\n"):
                        if "Status:" in line:
                            if "Connected" in line:
                                return "Up"
                            else:
                                return "Down"
        return "Not configured"

        # If the Active: line is not found, print an error message
        print(f"Error: Unable to retrieve the status of service '{service_name}'")
    except subprocess.CalledProcessError as e:
        return "Error"

def get_interface_ip_addresses():
    """Get IP addresses for end0, eth0, and wlan0 interfaces"""
    import netifaces
    interfaces = ['end0', 'eth0', 'wlan0']
    ip_addresses = []
    
    for interface in interfaces:
        try:
            if interface in netifaces.interfaces():
                addrs = netifaces.ifaddresses(interface)
                if netifaces.AF_INET in addrs:
                    for addr in addrs[netifaces.AF_INET]:
                        ip_addresses.append(addr['addr'])
        except:
            continue
    
    return ip_addresses

def get_ethernet_interface_and_is_up():
    try:
        # Get a list of available network interfaces
        #interfaces = netifaces.interfaces()
        #print(f"interfaces:{interfaces}")
        # Find the Ethernet interface

        result = subprocess.run(["networkctl"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        for line in result.stdout.split("\n"):
            if "end0" in line or "eth0" in line:
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

def update_traefik_config(cert_file_path: str, key_file_path: str) -> bool:
    """
    Update Traefik configuration with new certificate and key file paths
    
    Args:
        cert_file_path (str): Path to the certificate file
        key_file_path (str): Path to the private key file
        
    Returns:
        bool: True if update successful, False otherwise
    """
    try:
        config_path = "/etc/traefik/dynamic/config.yaml"
        
        # First verify the input files exist
        if not os.path.exists(cert_file_path):
            raise FileNotFoundError(f"Certificate file not found: {cert_file_path}")
        if not os.path.exists(key_file_path):
            raise FileNotFoundError(f"Key file not found: {key_file_path}")
            
        # Create backup of original config
        backup_path = f"{config_path}.bakup"
        shutil.copy2(config_path, backup_path)
        
        # Read existing config
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)

        # Update certificate paths
        if 'tls' not in config:
            config['tls'] = {}
        if 'stores' not in config['tls']:
            config['tls']['stores'] = {}
        if 'default' not in config['tls']['stores']:
            config['tls']['stores']['default'] = {}
        if 'defaultCertificate' not in config['tls']['stores']['default']:
            config['tls']['stores']['default']['defaultCertificate'] = {}
            
        # Update the paths
        config['tls']['stores']['default']['defaultCertificate']['certFile'] = cert_file_path
        config['tls']['stores']['default']['defaultCertificate']['keyFile'] = key_file_path
        
        # Get hostname/FQDN and update FQDN-related configs
        fqdn = get_hostname()
        if fqdn and '.' in fqdn:  # Check if it's a FQDN (contains dot)
            hostname = fqdn.split('.')[0]
            
            # Ensure http structure exists
            if 'http' not in config:
                config['http'] = {}
            if 'routers' not in config['http']:
                config['http']['routers'] = {}
            if 'middlewares' not in config['http']:
                config['http']['middlewares'] = {}
                
            # Update redirect-homecloudfqdn-to-https rule
            if 'redirect-homecloudfqdn-to-https' not in config['http']['routers']:
                config['http']['routers']['redirect-homecloudfqdn-to-https'] = {}
            config['http']['routers']['redirect-homecloudfqdn-to-https']['rule'] = f"Host(`{fqdn}`)"

            # Update redirect-homecloudfqdn-to-https rule
            if 'redirect-homecloud-to-fqdn' not in config['http']['routers']:
                config['http']['routers']['redirect-homecloud-to-fqdn'] = {}
            config['http']['routers']['redirect-homecloud-to-fqdn']['rule'] = f"Host(`{hostname}`)"
            
            
            # Update to-fqdn middleware
            if 'to-fqdn' not in config['http']['middlewares']:
                config['http']['middlewares']['to-fqdn'] = {'redirectRegex': {}}
            if 'redirectRegex' not in config['http']['middlewares']['to-fqdn']:
                config['http']['middlewares']['to-fqdn']['redirectRegex'] = {}
                
            config['http']['middlewares']['to-fqdn']['redirectRegex']['replacement'] = f"https://{fqdn}$2"
            config['http']['middlewares']['to-fqdn']['redirectRegex']['regex'] = f"^http://{hostname}(:[0-9]+)?(.*)"
        
        # Update IP addresses
        ip_addresses = get_interface_ip_addresses()
        if ip_addresses:
            # Ensure http structure exists
            if 'http' not in config:
                config['http'] = {}
            if 'routers' not in config['http']:
                config['http']['routers'] = {}
                
            # Update redirect-ip-to-https rule with all IPs
            if 'redirect-ip-to-https' not in config['http']['routers']:
                config['http']['routers']['redirect-ip-to-https'] = {}
                
            ip_rules = [f"Host(`{ip}`)" for ip in ip_addresses]
            config['http']['routers']['redirect-ip-to-https']['rule'] = " || ".join(ip_rules)

        
        # Write updated config
        #with open(config_path, 'w') as f:
        #    yaml.safe_dump(config, f, default_flow_style=False)
        yaml_content = yaml.safe_dump(config, default_flow_style=False)
        safe_write_file(config_path, yaml_content, mode="w", encoding="utf-8", lock_timeout=5.0, backup=True)
        return True
        
    except Exception as e:
        # If anything fails, restore backup if it exists
        if os.path.exists(backup_path):
            shutil.copy2(backup_path, config_path)
        print(f"Error updating Traefik config: {str(e)}")
        return False
    finally:
        # Clean up backup file if it exists
        if os.path.exists(backup_path):
            os.remove(backup_path)

@app.route('/update_traefik_config', methods=['POST'])
@omv_auth_required  ###OMV authentication code
@limiter.limit("20 per minute", exempt_when=is_localhost)  # Exempt localhost from rate limiting
def update_traefik_config_api():
    """
    API endpoint to update Traefik configuration
    
    Expected POST parameters:
    - cert_file: path to certificate file
    - key_file: path to private key file
    
    Returns:
        JSON response with success/error status
    """
    try:
        # Get parameters from request
        cert_file = request.args.get('cert_file')
        key_file = request.args.get('key_file')
        
        # Validate input parameters
        if not cert_file or not key_file:
            return jsonify({
                'success': False,
                'error': 'Missing required parameters: cert_file and key_file paths required'
            }), 400
            
        # Call the update function
        success = update_traefik_config(cert_file, key_file)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Traefik configuration updated successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to update Traefik configuration'
            }), 500
            
    except FileNotFoundError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 404
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        }), 500



def update_user_password(username, password):
    """
    Update the password for a Linux user.
    
    Args:
        username (str): The username of the user to update
        password (str): The new password to set
        
    Returns:
        dict: A dictionary with success status and message
    """
    try:
        # Check if user exists
        try:
            pwd.getpwnam(username)
        except KeyError:
            return {"success": False, "message": f"User '{username}' does not exist"}
        
        # Use chpasswd to update the password
        cmd = subprocess.Popen(
            ["chpasswd"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        
        # Format: username:password
        cmd.communicate(input=f"{username}:{password}")
        
        if cmd.returncode != 0:
            return {"success": False, "message": "Failed to update password"}
        
        return {"success": True, "message": f"Password updated successfully for user '{username}'"}
    
    except Exception as e:
        return {"success": False, "message": f"Error updating password: {str(e)}"}

def local_network_only(f):
    """
    Decorator to restrict access to localhost and Docker containers.
    
    This allows access from:
    - 127.0.0.1/8 (localhost)
    - 172.16.0.0/12 (Docker default bridge network)
    - 192.168.0.0/16 (common local network)
    - 10.0.0.0/8 (common local network)
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get client IP
        client_ip = request.remote_addr
        
        # Always allow localhost
        if client_ip in ['127.0.0.1', '::1', 'localhost']:
            return f(*args, **kwargs)
        
        try:
            # Convert IP string to IP address object
            ip_obj = ipaddress.ip_address(client_ip)
            
            # Check if IP is in private ranges
            if any([
                #ip_obj in ipaddress.ip_network('127.0.0.0/8'),      # Localhost
                #ip_obj in ipaddress.ip_network('10.0.0.0/8'),       # Private network
                ip_obj in ipaddress.ip_network('172.0.0.0/8'),    # Docker default
                ip_obj in ipaddress.ip_network('192.168.0.0/16')    # Private network for docker
            ]):
                return f(*args, **kwargs)
                
        except ValueError:
            # If IP address is invalid, deny access
            pass
            
        # If we get here, access is denied
        return jsonify({"error": "Access denied."}), 403
    
    return decorated_function

@app.route('/update_password', methods=['POST'])
@local_network_only
@limiter.limit("20 per minute", exempt_when=is_localhost)  # Exempt localhost from rate limiting
def password_update_route():
    """
    Update the admin user's password. Only accessible from localhost or Docker containers.
    Only allows password changes for the 'admin' user.
    
    Expected JSON payload:
    {
        "username": "admin",
        "password": "new_password"
    }
    
    Returns:
        JSON response with success status and message
    """
    # Check if request has JSON data
    if not request.is_json:
        return jsonify({"error": "Missing JSON data"}), 400
    
    data = request.json
    
    # Validate required fields
    if 'username' not in data or 'password' not in data:
        return jsonify({"error": "Missing required fields: username and password"}), 400
    
    username = data['username']
    password = data['password']
    
    # Validate username is "admin"
    if username != "admin":
        return jsonify({
            "error": "Permission denied.",
            "success": False
        }), 403
    
    # Validate password strength if needed
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters long"}), 400
    
    # Update the password
    result = update_user_password(username, password)
    
    if result["success"]:
        return jsonify(result), 200
    else:
        return jsonify(result), 500


@app.route('/display', methods=['POST'])
@omv_auth_required ###OMV authentication code
@limiter.limit("20 per minute", exempt_when=is_localhost)  # Exempt localhost from rate limiting
def displaytext():
    global something_on_display
    global display_texts
    global remove_all_msg
    global msg_id_on_display
    global display_timer_thread
    global display_timer_stop_event
    print (request)
    msg_id = request.args.get('msg_id')
    line1 = request.args.get('line1')
    line2 = request.args.get('line2')
    line3 = request.args.get('line3')
    msg_type = request.args.get('type')
    msg_req = request.args.get('msg_req')
    #time_to_display = request.args.get('time_to_display')

    time_to_display = int(request.args.get('time_to_display'))
    #print (time_to_display)
    if (time_to_display == -1): # persistent message till removed - we keep the message ON until removed
        if (msg_type == 'once' and msg_req == 'add' ):
            print(f"somethingondisplay1 is {something_on_display} and msg_id_on_display is {msg_id_on_display}")
            if (something_on_display == False and msg_id_on_display == -1 ): # no persistent message currently displayed
                generated_msg_id = f"{random.randint(1, 99995)}"
                clear_screen()
                something_on_display = True
                msg_id_on_display = generated_msg_id
                turn_on_display()
                start_display_timeout_timer()
                draw_text(line1,line2,line3)
                return (f"{generated_msg_id}")
            else:
                return "False"

    if (time_to_display > 120):
        return 'Max 120 seconds allowed'

    if (msg_type == 'once' and msg_req == 'add'):
        #print(f"somethingondisplay2 is {something_on_display}")
        if (something_on_display == False):
            clear_screen()
            turn_on_display()
            draw_text(line1,line2,line3)
            something_on_display = True
            generated_msg_id = f"{random.randint(1, 99995)}"
            msg_id_on_display = generated_msg_id
            display_timer = threading.Thread(target=timer, args=(time_to_display,))
            display_timer.start()
            start_display_timeout_timer()
            #return "True"
            return (f"{generated_msg_id}")
        else:
            while (something_on_display == True):
                time.sleep(0.5)
                #print(f"somethingondisplay3 is {something_on_display}")

            if (something_on_display == False):
                clear_screen()
                turn_on_display()
                draw_text(line1,line2,line3)
                generated_msg_id = f"{random.randint(1, 99995)}"
                msg_id_on_display = generated_msg_id
                something_on_display = True
                display_timer = threading.Thread(target=timer, args=(time_to_display,))
                display_timer.start()
                #return "True"
                return (f"{generated_msg_id}")


    elif (msg_type == 'once' and msg_req == 'remove'):
        if (msg_id == msg_id_on_display and something_on_display == True):
            clear_screen()
            something_on_display = False
            msg_id_on_display = -1
            turn_off_display()
            # Stop the display timer thread if it's running
            #if display_timer_thread is not None and display_timer_thread.is_alive():
            #    if display_timer_stop_event is not None:
            #        display_timer_stop_event.set()
            #    display_timer_thread.join(0.1)

            #draw_text(line1,line2,line3)
            return "True"
        else:
            return "False"

    elif (msg_type == 'cycle' and msg_req == 'add'):
        generated_msg_id = f"{random.randint(1, 99995)}"
        #print (generated_msg_id)
        display_texts.append([])
        display_texts[-1].append(generated_msg_id)
        if line1:
            display_texts[-1].append(line1)
        if line2:
            display_texts[-1].append(line2)
        if line3:
            display_texts[-1].append(line3)
        print(display_texts)
        return (f"{generated_msg_id}")

    #clear_screen()
    #draw_text(line1,line2,line3)
        #time.sleep(10)
    #return 'Text added to display queue'
    if (msg_type == 'cycle' and msg_req == 'remove_all'):
        global remove_all_msg
        remove_all_msg = True
        if (persistent_msg_id == "False"):
            clear_screen()
        return 'Display cleared'

    if (msg_type == 'cycle' and msg_req == 'remove'):
        #print(msg_id)
        global msg_id_remove
        msg_id_remove.append(f"{msg_id}")
        #msg_id_remove.append([])
        #msg_id_remove[-1].append(f"{msg_id}")
        #msg_id_remove = f"{msg_id}"
        global MSG_ID_TO_BE_REMOVED
        #MSG_ID_TO_BE_REMOVED = int(msg_id)
        #print(MSG_ID_TO_BE_REMOVED)
        #display_texts = remove_row_with_element(display_texts, msg_id)
        #print(display_texts)
        return 'Text removed from display queue'

@app.route('/invokesalt_mount', methods=['POST']) #invokes omv-rpc first to insert mount candidates in config.xml and then invokes omv-salt to mount them
@local_network_only
@omv_auth_required ###OMV authentication code
@limiter.limit("20 per minute", exempt_when=is_localhost)  # Exempt localhost from rate limiting
def invoke_salt():
    global persistent_msg_id
    #print (f"in mount________________________",{request})
    #print(f"{is_localhost()}")
    argument_1 = request.args.get('arg_1')
    argument_2 = request.args.get('arg_2')
    argument_3 = request.args.get('arg_3')
    argument_4 = request.args.get('uuid')
    #print(f"--------------------------------{argument_1},{argument_2},{argument_3}---------------------")
    rpc_params = {}
    devicefiles = False
    msg_disk_check = None
    with semaphore:
        text = "Configuring\nDisk"
        #success = f"{send_display_request(text, 'once',10, 'add', 0)}"
        #print(f"persistent_msg_id_mount_1: {persistent_msg_id}")
        if (persistent_msg_id == "False"):
            #turn_off_display()
            success =  f"{send_display_request(text, 'once', -1, 'add', 0)}"
            if (success != "False"):
                persistent_msg_id = success

        disks = openmediavault.rpc.call("FileSystemMgmt", "getMountCandidates")
       # print(f"candidate disks for mounting------------:{disks}")
        if (len(disks)>0):
            for disk in disks:
                if disk["uuid"] == argument_4:
                    # print("found")
                    # if filesystem type is hfsplus then run fsck before mounting
                    if (disk["type"] == "hfsplus"):
                        #send to display message that disk check is running
                        if (msg_disk_check is None):
                            text = f"Checking\nDisk.Pls wait"
                            msg_disk_check = send_display_request(text,'cycle',0,'add',0)
                        # we need to run fsck on this partition before mounting it to enable rw support
                        result, output = run_fsck_hfsplus(disk["canonicaldevicefile"], fix=False)
                        if (msg_disk_check is not None):
                            send_display_request(text,'cycle',0,'remove',msg_disk_check)
                    success = "False"
                    devicefiles = disk["devicefiles"]
                    #print(f"success: {success}")
                    rpc_params = {}
                    rpc_params.update(
                        {
                            "id": argument_4
                        }
                    )
                    openmediavault.rpc.call(
                        "FileSystemMgmt",
                        "setMountPoint",
                        rpc_params
                    )
                   # print(f"result.stdout: {result.stdout},{result}")
                    break
    # mount disk by calling salt
        result = subprocess.run(["/usr/sbin/omv-salt", argument_1, argument_2, argument_3], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        update_photoprism_YAML() #update photoprism YAML files to start indexing the new disks for photos
        #restart_photoprism()
        restart_immich_server()
        restart_duplicati_server()
        #stop_photoprism_service()
        #index_thread = threading.Thread(target=start_indexing_photoprism)
        #index_thread.start()

    if (devicefiles !=False):
        create_share = threading.Thread(target=create_external_disk_share, args=(devicefiles,))
        create_share.start()
        #create_external_disk_share(argument_4)

    return "True"

 

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


def unmount_filesystem(uuid):
    try:
        with semaphore:
            rpc_params = {}
            rpc_params.update(
                {
                    "id": uuid
                }
            )
            openmediavault.rpc.call(
                "FileSystemMgmt",
                "umount",
                rpc_params
            )
            result = subprocess.run(["/usr/sbin/omv-salt", "deploy", "run", "fstab"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        return True
    except:
        return False

@app.route('/getappsendpoint', methods=['GET'])
@local_network_only
@limiter.limit("10 per minute", exempt_when=is_localhost)
def getappsendpoint():
    """
    Returns a JSON array of deployed apps with their web endpoints
    """
    apps_endpoints = []
    
    try:
        # Check Joplin
        try:
            result = subprocess.run(
                ['omv-rpc', '-u', 'admin', 'Homecloud', 'getJoplinServiceStatus'],
                capture_output=True, text=True, check=True
            )
            data = json.loads(result.stdout)
            if data.get('status') == 'Running' and 'hostname' in data:
                apps_endpoints.append({
                    'app': 'Joplin',
                    'webapp': data['hostname']
                })
        except Exception as e:
            print(f"Error getting Joplin status: {e}")
        
        # Check Immich
        try:
            result = subprocess.run(
                ['omv-rpc', '-u', 'admin', 'Homecloud', 'getImmichServiceStatus'],
                capture_output=True, text=True, check=True
            )
            data = json.loads(result.stdout)
            if data.get('status') == 'Running' and 'hostname' in data:
                apps_endpoints.append({
                    'app': 'Immich',
                    'webapp': data['hostname']
                })
        except Exception as e:
            print(f"Error getting Immich status: {e}")
        
        # Check Vaultwarden
        try:
            result = subprocess.run(
                ['omv-rpc', '-u', 'admin', 'Homecloud', 'getVaultwardenServiceStatus'],
                capture_output=True, text=True, check=True
            )
            data = json.loads(result.stdout)
            if data.get('status') == 'Running' and 'hostname' in data:
                apps_endpoints.append({
                    'app': 'Vaultwarden',
                    'webapp': data['hostname']
                })
        except Exception as e:
            print(f"Error getting Vaultwarden status: {e}")
        
        # Check Jellyfin
        try:
            result = subprocess.run(
                ['omv-rpc', '-u', 'admin', 'Homecloud', 'getJellyfinServiceStatus'],
                capture_output=True, text=True, check=True
            )
            data = json.loads(result.stdout)
            if data.get('status') == 'Running' and 'hostname' in data:
                apps_endpoints.append({
                    'app': 'Jellyfin',
                    'webapp': data['hostname']
                })
        except Exception as e:
            print(f"Error getting Jellyfin status: {e}")
        
        # Check Paperless-ngx
        try:
            result = subprocess.run(
                ['omv-rpc', '-u', 'admin', 'Homecloud', 'getPaperlessServiceStatus'],
                capture_output=True, text=True, check=True
            )
            data = json.loads(result.stdout)
            if data.get('status') == 'Running' and 'hostname' in data:
                apps_endpoints.append({
                    'app': 'Paperless-ngx',
                    'webapp': data['hostname']
                })
        except Exception as e:
            print(f"Error getting Paperless status: {e}")

        # Check Paperless-ngx
        try:
            result = subprocess.run(
                ['omv-rpc', '-u', 'admin', 'Homecloud', 'getDuplicatiServiceStatus'],
                capture_output=True, text=True, check=True
            )
            data = json.loads(result.stdout)
            if data.get('status') == 'Running' and 'hostname' in data:
                apps_endpoints.append({
                    'app': 'Duplicati',
                    'webapp': data['hostname']
                })
        except Exception as e:
            print(f"Error getting Duplicati status: {e}")
        
        return jsonify(apps_endpoints)
    
    except Exception as e:
        print(f"Error in getappsendpoint: {e}")
        return jsonify([])




@app.route('/invokesalt_unmount', methods=['POST']) #invokes omv-rpc first to find all disks that are in status 'missing; and  invokes omv-salt to unmount them
@omv_auth_required ###OMV authentication code
@limiter.limit("20 per minute", exempt_when=is_localhost)  # Exempt localhost from rate limiting
def invoke_salt_unmount():
    global persistent_msg_id
    #print(f"{is_localhost()}")
    print (f"in salt_unmount function")
   # stop_photoprism_service()
    rpc_params = {}
    rpc_params.update(
                {
                    "start": 0,
                    "limit": -1
                }
            )
    json_data = openmediavault.rpc.call("FileSystemMgmt", "getList", rpc_params)

    for disk in json_data["data"]:

        if disk["status"] == 3: #3 denotes missing status as per omv document

            uuid = disk["devicefile"]
            print(f"missing disk unmounting: {uuid}")
            text = "Disk\nRemoved"
            success = "False"
            #while (success == "False"):
            #success = f"{send_display_request(text, 'once',10, 'add', 0)}"
            #print(f"persistent_msg_id_unmount_1: {persistent_msg_id}")
            if (persistent_msg_id == "False"):
                success =  f"{send_display_request(text, 'once', -1, 'add', 0)}"
                if (success != "False"):
                    persistent_msg_id = success
                    #start_display_timeout_timer()

                #print(f"persistent_msg_id in unmount send request : {persistent_msg_id}")



                #success = f"{send_display_request(text, 'once',-1, 'add', 0)}"

            delete_samba_export_from_shares()
            # delete all orphaned shares whose devicefile field is missing
            delete_disk_share()
            unmount_filesystem(uuid)

    update_photoprism_YAML() #update photoprism YAML files to stop indexing removed disks for photos

   # print(f"persistent_msg_id_unmount_2: {persistent_msg_id}")
    if (persistent_msg_id != "False"):
        text = "Configuring\nDisk"
        success = f"{send_display_request(text, 'once',1, 'remove', persistent_msg_id)}"
        if (success == "True"):
            persistent_msg_id = "False"

            #print(f"result.stdout: {result.stdout},{result}")
    # only restart photoprism - don't start indexing. Let user manually start indexing as
    #stop_photoprism_service()
    restart_immich_server()
    restart_duplicati_server()
    #start_photoprism_service()
    return "True"

@app.route('/stop_photoprism_service', methods=['POST'])
@omv_auth_required ###OMV authentication code
@limiter.limit("20 per minute", exempt_when=is_localhost)  # Exempt localhost from rate limiting
def invoke_stop_photoprism_service():
    try:
        restart_immich_server()
        #stop_photoprism_service()
        return "True"
    except:
        return "False"


@app.route('/unmount_fs', methods=['POST'])
@omv_auth_required ###OMV authentication code
@limiter.limit("20 per minute", exempt_when=is_localhost)  # Exempt localhost from rate limiting
def invoke_unmount_fs():
    try:
        global persistent_msg_id
        uuid = request.args.get('uuid')
        text = "Configuring\nDisk"

        if (persistent_msg_id == "False"):
                success =  f"{send_display_request(text, 'once', -1, 'add', 0)}"
                if (success != "False"):
                    persistent_msg_id = success
                    #start_display_timeout_timer()

        #print(f"in unmount uuid----------------------------- is {uuid}")
        unmount_filesystem(uuid)

        if (persistent_msg_id != "False"):
            text = "Configuring\nDisk"
            success = f"{send_display_request(text, 'once',1, 'remove', persistent_msg_id)}"
            if (success == "True"):
                persistent_msg_id = "False"
        return "True"
    except:
        return "False"

@app.route('/update_YAML', methods=['POST'])
@omv_auth_required ###OMV authentication code
@limiter.limit("20 per minute", exempt_when=is_localhost)  # Exempt localhost from rate limiting
def invoke_update_YAML():
    try:
        update_photoprism_YAML()
        return "True"
    except:
        return "False"

@app.route('/update_immich_JSON', methods=['POST'])
@omv_auth_required ###OMV authentication code
@limiter.limit("20 per minute", exempt_when=is_localhost)  # Exempt localhost from rate limiting
def invoke_update_immich_JSON():
    try:
        update_immich_config()
        return "True"
    except:
        return "False"


@app.route('/update_paperless-ngx_env', methods=['POST'])
@omv_auth_required ###OMV authentication code
@limiter.limit("20 per minute", exempt_when=is_localhost)  # Exempt localhost from rate limiting
def invoke_update_paperless_ngx_ENV():
    try:
        update_paperless_ngx_config()
        return "True"
    except:
        return "False"


@app.route('/check_tailscale_status', methods=['POST'])
@omv_auth_required ###OMV authentication code
@limiter.limit("20 per minute", exempt_when=is_localhost)  # Exempt localhost from rate limiting
def invoke_check_tailscale_status():
    try:
        status = check_service_status("tailscaled.service")
        # return status in JSON
        return jsonify({
            'status': status
        }), 200
    except:
        return jsonify ({
            'status': 'Error'
        }), 500

@app.route('/start_hotspot', methods=['POST'])
@omv_auth_required ###OMV authentication code
@local_network_only
@limiter.limit("5 per minute", exempt_when=is_localhost)  # Exempt localhost from rate limiting
def start_hotspot():
    try:
        # First, check if wlan0 is configured in OMV and delete it
        # Create hotspot active flag file in persistent location
        global display_is_on
        hotspot_flag_file = '/var/lib/hotspot_active'
        with open(hotspot_flag_file, 'w') as f:
            f.write(str(int(time.time())))  # Write timestamp when hotspot was started
        try:
            subprocess.run(["systemctl", "stop", "triggerhappy.service"], check=True)
            subprocess.run(["systemctl", "stop", "triggerhappy.socket"], check=True)
            if (display_is_on is False):
                toggle_display()
                
            # Get list of configured interfaces
            result = subprocess.run(
                ['omv-rpc', '-u', 'admin', 'Network', 'enumerateConfiguredDevices'],
                capture_output=True, text=True, check=True
            )
            
            # Parse the JSON output
            interfaces = json.loads(result.stdout)
            wlan_uuid = None
            
            # Find wlan0 interface
            for interface in interfaces:
                if interface.get('devicename') == 'wlan0':
                    wlan_uuid = interface.get('uuid')
                    break
            
            # Delete wlan0 interface if found
            if wlan_uuid:
                print(f"Found wlan0 interface with UUID: {wlan_uuid}, deleting it")
                delete_cmd = ['omv-rpc', '-u', 'admin', 'Network', 'deleteInterface', 
                             json.dumps({"uuid": wlan_uuid})]
                subprocess.run(delete_cmd, check=True)
                print("Successfully deleted wlan0 interface from OMV configuration")
                subprocess.run(['omv-salt', 'deploy', 'run', 'systemd-networkd'], check=True)

                # Wait a moment for the changes to take effect
                time.sleep(2)
            text = "Starting WiFi\nHotspot Mode"
            send_display_request(text, 'once', 30, 'add', 0)
        except Exception as e:
            print(f"Error handling OMV network configuration: {e}")
            # Continue anyway, as this is not critical
        
        # Configure hostapd
        hostapd_conf_file = '/etc/hostapd/hostapd.conf'
        with open(hostapd_conf_file, 'r') as f:
            lines = f.readlines()
            for line in lines:
                if 'ssid' in line:
                    ssid = line.split('=')[1].strip()
                    if (ssid):
                        print("hostapd is configured")
                    else:
                        print("hostapd configuration missing")
        
        # Configure dnsmasq for DHCP
        dnsmasq_conf = '/etc/dnsmasq.conf'
        with open(dnsmasq_conf, 'w') as f:
            f.write("interface=wlan0\n")
            f.write("dhcp-range=172.31.1.2,172.31.1.20,255.255.255.0,24h\n")
            f.write("dhcp-option=option:router,172.31.1.1\n")
            f.write("dhcp-option=option:dns-server,172.31.1.1\n")
            f.write("listen-address=127.0.0.1,172.31.1.1\n")
            f.write("bind-interfaces\n")
        
        # Disable and stop systemd-resolved service
        subprocess.run(["systemctl", "disable", "systemd-resolved.service"], check=True)
        subprocess.run(["systemctl", "stop", "systemd-resolved.service"], check=True)
        
        # If resolv.conf is a symlink to systemd-resolved, replace it
        if os.path.islink('/etc/resolv.conf'):
            os.unlink('/etc/resolv.conf')
            with open('/etc/resolv.conf', 'w') as f:
                f.write("nameserver 127.0.0.1\n")
                f.write("nameserver 8.8.8.8\n")
        
        # Create a systemd service to set IP address before dnsmasq starts
        hotspot_ip = '172.31.1.1'
        hostspot_netmask = '255.255.255.0'
        
        # Create a systemd service file for setting IP
        with open('/etc/systemd/system/hotspot-ip.service', 'w') as f:
            f.write("[Unit]\n")
            f.write("Description=Set IP address for WiFi hotspot\n")
            f.write("Before=dnsmasq.service hostapd.service\n")
            f.write("After=network.target\n\n")
            f.write("[Service]\n")
            f.write("Type=oneshot\n")
            f.write("ExecStart=/sbin/ip link set dev wlan0 up\n")
            f.write(f"ExecStart=/sbin/ip addr flush dev wlan0\n")
            f.write(f"ExecStart=/sbin/ip addr add {hotspot_ip}/24 dev wlan0\n")
            f.write("RemainAfterExit=yes\n\n")
            f.write("[Install]\n")
            f.write("WantedBy=multi-user.target\n")
        
        # Create a drop-in file for dnsmasq to ensure it starts after IP is set
        os.makedirs('/etc/systemd/system/dnsmasq.service.d', exist_ok=True)
        with open('/etc/systemd/system/dnsmasq.service.d/override.conf', 'w') as f:
            f.write("[Unit]\n")
            f.write("After=hotspot-ip.service\n")
            f.write("Requires=hotspot-ip.service\n")
        
        # Create a drop-in file for hostapd to ensure it starts after IP is set
        os.makedirs('/etc/systemd/system/hostapd.service.d', exist_ok=True)
        with open('/etc/systemd/system/hostapd.service.d/override.conf', 'w') as f:
            f.write("[Unit]\n")
            f.write("After=hotspot-ip.service\n")
            f.write("Requires=hotspot-ip.service\n")
        
        # Reload systemd to recognize the new service files
        subprocess.run(["systemctl", "daemon-reload"], check=True)
        
        # Unmask all services and ignore any errors
        # Unmask all services and ignore any errors
        subprocess.run(["systemctl", "unmask", "hotspot-ip.service"], check=False)
        subprocess.run(["systemctl", "unmask", "hostapd.service"], check=False)
        subprocess.run(["systemctl", "unmask", "dnsmasq.service"], check=False)
        
        # Enable all services to start on boot
        subprocess.run(["systemctl", "enable", "hotspot-ip.service"], check=True)
        subprocess.run(["systemctl", "enable", "hostapd.service"], check=True)
        subprocess.run(["systemctl", "enable", "dnsmasq.service"], check=True)
        
        # Start services now
        subprocess.run(["systemctl", "start", "hotspot-ip.service"], check=True)
        subprocess.run(["systemctl", "restart", "hostapd.service"], check=True)
        subprocess.run(["systemctl", "restart", "dnsmasq.service"], check=True)
        subprocess.run(["systemctl", "enable", "collectd.service"], check=True)

        
        
        reboot_system()
        return jsonify({
            'status': True
        }), 200
        
    except subprocess.CalledProcessError as e:
        print(f"Error starting hotspot: {e}")
        try:
            os.remove('/var/lib/hotspot_active')
        except:
            pass
        return jsonify({
            'status': 'Error'
        }), 500


@app.route('/check_wired_network_status', methods=['POST'])
@omv_auth_required ###OMV authentication code
def invoke_check_wired_network_status():
    try:
        #print(f"{is_localhost()}")
        status = get_ethernet_interface_and_is_up()
        if (status == False):
            return jsonify({
                'status': "Down"
            }), 200
        else:
            return jsonify({
                'status': "Up"
            }), 200
    except:
        return jsonify ({
            'status': 'Error'
        }), 500


@app.route('/check_wifi_status', methods=['POST'])
@omv_auth_required ###OMV authentication code
@limiter.limit("20 per minute", exempt_when=is_localhost)  # Exempt localhost from rate limiting
def invoke_check_wifi_status():
    try:
        wifi = (subprocess.check_output(['iwgetid -r'], shell=True).decode())
        #print(f"wifi:{len(wifi)}")
        if (len(wifi.strip())>0):
            #return f"{wifi}"
            return jsonify({
                'status': "Connected",
                'SSID': f"{wifi}"
            }), 200
        else:
            #return "Not Connected"
            return jsonify({
                'status': "Not Connected",
                'SSID': ""
            }), 200
    except:
        return jsonify ({
            'status': 'Error'
        }), 500


@app.route('/toggle_display', methods=['POST'])
@omv_auth_required  # OMV authentication code
@limiter.limit("20 per minute", exempt_when=is_localhost)  # Exempt localhost from rate limiting
def toggle_display():
    """
    Toggle the display on or off.
    Returns the new state of the display.
    """
    try:
        global display_is_on
        
        if display_is_on:
            # Display is currently on, turn it off
            status = turn_off_display()
            if status:
                display_is_on = False
                return jsonify({
                    'status': 'success',
                    'display_state': 'off'
                }), 200
        else:
            # Display is currently off, turn it on
            status = turn_on_display()
            draw_text("Homecloud", "", "")
            start_display_timeout_timer()
            if status:
                return jsonify({
                    'status': 'success',
                    'display_state': 'on'
                }), 200
        
        # If we get here, something went wrong with turning the display on/off
        return jsonify({
            'status': 'error',
            'message': 'Failed to toggle display'
        }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500




@app.route('/turn_off_display', methods=['POST'])
@omv_auth_required  # OMV authentication code
@limiter.limit("20 per minute", exempt_when=is_localhost)  # Exempt localhost from rate limiting
def invoke_turn_off_display():
    """
    Toggle the display on or off.
    Returns the new state of the display.
    """
    try:
        global display_is_on
        
        if display_is_on:
            # Display is currently on, turn it off
            status = turn_off_display()
            if status:
                return jsonify({
                    'status': 'success',
                    'display_state': 'off'
                }), 200

        # If we get here, something went wrong with turning the display on/off
        return jsonify({
            'status': 'error',
            'message': 'Already off'
        }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

def read_compose_schedule(file_path):
    """Read PHOTOPRISM_INDEX_SCHEDULE from docker-compose file"""
    try:
        with open(file_path, 'r') as file:
            compose_data = yaml.safe_load(file)
        file.close()
        # Look for the environment variable in services
        for service in compose_data.get('services', {}).values():
            environment = service.get('environment', {})

            # Handle both dictionary and list format
            if isinstance(environment, dict):
                if 'PHOTOPRISM_INDEX_SCHEDULE' in environment:
                    return environment['PHOTOPRISM_INDEX_SCHEDULE']
            elif isinstance(environment, list):
                for env in environment:
                    if isinstance(env, str) and env.startswith('PHOTOPRISM_INDEX_SCHEDULE='):
                        return env.split('=', 1)[1]

        return None

    except Exception as e:
        raise Exception(f"Error reading docker-compose file: {str(e)}")


'''
@app.route('/update_pp_index_schedule', methods=['POST'])
@omv_auth_required ###OMV authentication code
@limiter.limit("20 per minute", exempt_when=is_localhost)  # Exempt localhost from rate limiting
def update_index_schedule():
    try:
        global COMMON_USERNAME
        source = "localhost" if is_localhost() else "external"
        global INDEXING_SCHEDULE

        start_time = request.args.get('start_time')
        user = request.args.get('user')


        # Validate input
        if not start_time:
            return jsonify({'error': 'start_time is required'}), 400
        if not user:
            return jsonify({'error': 'user is required'}), 400

        if not validate_time_format(start_time):
            return jsonify({'error': 'Invalid time format.'}), 400


        # Find docker-compose file
        if (user == COMMON_USERNAME):
            compose_file = f'/etc/photoprism/docker-compose.yml'
        else:
            compose_file = f'/home/{user}/.docker-compose.yml'

        # Convert time to cron format
        cron_schedule = convert_time_to_cron(start_time)
        current_schedule = read_compose_schedule(compose_file)
        #if current_schedule and cron_schedule are same then return no change needed
        if current_schedule == cron_schedule:
            return jsonify({'message': 'Same as existing schedule'}), 200
        #print (f"{cron_schedule}")
        INDEXING_SCHEDULE = cron_schedule
        # Update the YAML file
        if update_photoprism_YAML(user=user)==True :
            stop_photoprism_service(user=user)
            start_photoprism_service(user=user)
            #restart photoprism for that user to affect the changes
            return jsonify({'message': 'Schedule updated and service restarted successfully'}), 200
        else:
            return jsonify({'error': 'Failed to update schedule'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

'''

def convert_cron_to_human_readable(cron_expression):
    """Convert cron expression to human readable format"""
    try:
        parts = cron_expression.strip().split()
        if len(parts) != 5:
            return "Invalid cron format"

        minute, hour, day_month, month, day_week = parts

        # Handle periodic schedules first
        # For "every X hours"
        if hour.startswith('*/'):
            hours = int(hour[2:])
            return f"every {hours} hours"

        # For "every X minutes"
        if minute.startswith('*/'):
            minutes = int(minute[2:])
            return f"every {minutes} minutes"

        # For specific time
        if minute.isdigit() and hour.isdigit():
            return f"{int(hour):02d}:{int(minute):02d}"

        return cron_expression  # Return original if pattern isn't recognized

    except Exception as e:
        return f"Error parsing cron: {str(e)}"


def error_response(message, status_code=400):
    return jsonify({'error': message}), status_code



@app.route('/get_index_schedule', methods=['GET'])
@omv_auth_required ###OMV authentication code
@limiter.limit("20 per minute", exempt_when=is_localhost)  # Exempt localhost from rate limiting
def get_index_schedule():
    try:
        global COMMON_USERNAME
        user = request.args.get('user')

        # Find docker-compose file
        if (user == COMMON_USERNAME):
            compose_file = f'/etc/photoprism/docker-compose.yml'
        else:
            compose_file = f'/home/{user}/.docker-compose.yml'

        #validate if compose_file exists
        if not os.path.exists(compose_file):
            return error_response('Docker compose file not found', 404)

        if not compose_file:
            return error_response('Docker compose file not found', 404)

        # Read schedule from compose file
        schedule = read_compose_schedule(compose_file)
        #print(f"schedule is {schedule}")
        if not schedule:
            return error_response('PHOTOPRISM_INDEX_SCHEDULE not found in compose file', 404)

        # Convert to human readable format
        human_readable = convert_cron_to_human_readable(schedule)

        return jsonify({
            'user': user,
            'cron_schedule': schedule,
            'human_readable': human_readable,
            'compose_file': compose_file
        }), 200

    except Exception as e:
        return error_response(str(e), 500)

def get_ssl_paths():
    """Get SSL certificate and key file paths from /etc/environment"""
    try:
        cert_file = None
        key_file = None
        
        with open('/etc/environment', 'r') as f:
            for line in f:
                line = line.strip()
                if line.startswith('SSL_CERT_FILE='):
                    cert_file = line.split('=')[1].strip('"')
                elif line.startswith('SSL_KEY_FILE='):
                    key_file = line.split('=')[1].strip('"')
                    
        if not cert_file or not key_file:
            raise ValueError("SSL certificate or key file path not found in /etc/environment")
            
        # Verify files exist
        if not os.path.isfile(cert_file):
            raise FileNotFoundError(f"SSL certificate file not found: {cert_file}")
        if not os.path.isfile(key_file):
            raise FileNotFoundError(f"SSL key file not found: {key_file}")
            
        return cert_file, key_file
        
    except Exception as e:
        print(f"Error reading SSL paths: {str(e)}")
        return None, None

def setup_paperless_firewall():
    try:
        # Check if paperless.service exists using systemctl list-unit-files
        check_service_cmd = ["systemctl", "list-unit-files", "paperless.service"]
        service_result = subprocess.run(check_service_cmd, 
                                     capture_output=True, 
                                     text=True, 
                                     check=False)
        
        # Path to docker-compose file
        compose_file = "/etc/paperless/docker-compose.yml"
        
        def get_paperless_port():
            try:
                if os.path.exists(compose_file):
                    with open(compose_file, 'r') as f:
                        compose_data = yaml.safe_load(f)
                    
                    # Get port mapping from webserver service
                    if ('services' in compose_data and 
                        'webserver' in compose_data['services'] and 
                        'ports' in compose_data['services']['webserver']):
                        
                        ports = compose_data['services']['webserver']['ports']
                        # Handle both string and list format
                        if isinstance(ports, list):
                            port_mapping = ports[0]  # Take first port mapping
                        else:
                            port_mapping = ports
                        
                        # Extract host port (before the colon)
                        host_port = port_mapping.split(':')[0]
                        return host_port.strip()
                return None
            except Exception as e:
                print(f"Error reading port from docker-compose: {str(e)}")
                return None
        
        if "paperless.service" in service_result.stdout:
            # Get port from docker-compose
            port = get_paperless_port()
            if not port:
                print("Could not determine paperless port, using default 8000")
                port = "8000"
            
            # Define the rule components for reuse
            rule_specs = [
                "!", "-s", "100.0.0.0/8",
                "-p", "tcp",
                "--dport", port,
                "-j", "REJECT"
            ]
            
            # Check if the rule already exists to avoid duplicates
            check_rule_cmd = ["iptables", "-C", "DOCKER-USER"] + rule_specs
            
            rule_exists = subprocess.run(check_rule_cmd, 
                                       capture_output=True, 
                                       check=False).returncode == 0
            
            if not rule_exists:
                # Add the firewall rule
                add_rule_cmd = ["iptables", "-I", "DOCKER-USER", "1"] + rule_specs
                
                subprocess.run(add_rule_cmd, check=True)
                #print(f"Firewall rule added successfully for paperless service on port {port}")
            else:
                print("Firewall rule already exists")
                
        else:
            # Service doesn't exist, remove any existing rules for paperless
            # We need to check for rules with different possible ports
            possible_ports = ["8000"]  # Add default port
            
            # Also check docker-compose file for current port
            current_port = get_paperless_port()
            if current_port and current_port not in possible_ports:
                possible_ports.append(current_port)
            
            for port in possible_ports:
                rule_specs = [
                    "!", "-s", "100.0.0.0/8",
                    "-p", "tcp",
                    "--dport", port,
                    "-j", "REJECT"
                ]
                
                check_rule_cmd = ["iptables", "-C", "DOCKER-USER"] + rule_specs
                
                rule_exists = subprocess.run(check_rule_cmd, 
                                           capture_output=True, 
                                           check=False).returncode == 0
                
                if rule_exists:
                    # Remove the firewall rule
                    remove_rule_cmd = ["iptables", "-D", "DOCKER-USER"] + rule_specs
                    subprocess.run(remove_rule_cmd, check=True)
                    print(f"Firewall rule removed for port {port} as paperless service does not exist")
                
    except subprocess.CalledProcessError as e:
        print(f"Error managing firewall rule: {str(e)}")
    except Exception as e:
        print(f"Unexpected error: {str(e)}")

def setup_firewall(service_name: str) -> bool:
    """
    Setup firewall rules for specified service for both TCP and UDP
    Args:
        service_name: Name of the service (joplin, jellyfin, vaultwarden, immich, password-reset, duplicati)
    Returns:
        bool: True if successful, False if failed
    """
    try:
        # Service to docker-compose file mapping
        service_configs = {
            'joplin': {
                'file': '/etc/joplin/docker-compose.yml',
                'service_key': 'app'
            },
            'jellyfin': {
                'file': '/etc/jellyfin/docker-compose.yml',
                'service_key': 'jellyfin'
            },
            'vaultwarden': {
                'file': '/etc/vault-warden/docker-compose-vaultwarden.yml',
                'service_key': 'vaultwarden'
            },
            'immich': {
                'file': '/etc/immich/docker-compose.yml',
                'service_key': 'immich-server'
            },
            'password-reset': {
                'file': '/etc/password-reset/docker-compose.yml',
                'service_key': 'reset-app'
            },
            'duplicati': {
                'file': '/etc/duplicati/docker-compose-duplicati.yaml',
                'service_key': 'duplicati'
            }
        }

        if service_name not in service_configs:
            print(f"Unsupported service: {service_name}")
            return False

        config = service_configs[service_name]

        def get_service_port(compose_file: str, service_key: str) -> str:
            """Extract port from docker-compose file"""
            try:
                if os.path.exists(compose_file):
                    with open(compose_file, 'r') as f:
                        compose_data = yaml.safe_load(f)
                    
                    if ('services' in compose_data and 
                        service_key in compose_data['services'] and 
                        'ports' in compose_data['services'][service_key]):
                        
                        ports = compose_data['services'][service_key]['ports']
                        # Handle both string and list format
                        if isinstance(ports, list):
                            port_mapping = ports[0]  # Take first port mapping
                        else:
                            port_mapping = ports
                        # Convert to string if it's an integer
                        port_mapping = str(port_mapping)
                        
                        # Extract container port (after the colon)
                        if ':' in port_mapping:
                            container_port = port_mapping.split(':')[1]
                        else:
                            container_port = port_mapping
                            
                        return container_port.strip()
                return None
            except Exception as e:
                print(f"Error reading port from docker-compose: {str(e)}")
                return None

        # Check if service exists in systemd
        check_service_cmd = ["systemctl", "list-unit-files", f"{service_name}.service"]
        service_result = subprocess.run(check_service_cmd, 
                                     capture_output=True, 
                                     text=True, 
                                     check=False)

        # Get port from docker-compose
        port = get_service_port(config['file'], config['service_key'])
        if not port:
            print(f"Could not determine {service_name} port")
            return False

        # Define the rule components for both TCP and UDP
        rule_specs = {
            'tcp': [
                "-s", "0.0.0.0/0",
                "-p", "tcp",
                "--dport", port,
                "-j", "REJECT"
            ],
            'udp': [
                "-s", "0.0.0.0/0",
                "-p", "udp",
                "--dport", port,
                "-j", "REJECT"
            ]
        }

        if f"{service_name}.service" in service_result.stdout:
            # Service exists, ensure rules are present
            for protocol in ['tcp', 'udp']:
                # Check if rule exists
                check_rule_cmd = ["iptables", "-C", "DOCKER-USER"] + rule_specs[protocol]
                rule_exists = subprocess.run(check_rule_cmd, 
                                           capture_output=True, 
                                           check=False).returncode == 0

                if not rule_exists:
                    # Always add at position 1 (top of chain)
                    add_rule_cmd = ["iptables", "-I", "DOCKER-USER", "1"] + rule_specs[protocol]
                    subprocess.run(add_rule_cmd, check=True)
                    #print(f"Firewall {protocol.upper()} rule added successfully for {service_name} service on port {port}")
                else:
                    print(f"Firewall {protocol.upper()} rule already exists for {service_name}")

        else:
            # Service doesn't exist, remove rules if they exist
            for protocol in ['tcp', 'udp']:
                check_rule_cmd = ["iptables", "-C", "DOCKER-USER"] + rule_specs[protocol]
                rule_exists = subprocess.run(check_rule_cmd, 
                                           capture_output=True, 
                                           check=False).returncode == 0

                if rule_exists:
                    # Remove the firewall rule
                    remove_rule_cmd = ["iptables", "-D", "DOCKER-USER"] + rule_specs[protocol]
                    subprocess.run(remove_rule_cmd, check=True)
                    print(f"Firewall {protocol.upper()} rule removed for {service_name} as service does not exist")

        return True

    except subprocess.CalledProcessError as e:
        print(f"Error managing firewall rule: {str(e)}")
        return False
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return False


@app.route('/setup_paperless_firewall', methods=['POST'])
@omv_auth_required ###OMV authentication code
@limiter.limit("20 per minute", exempt_when=is_localhost)  # Exempt localhost from rate limiting
def invoke_setup_paperless_firewall():
    try:
        setup_paperless_firewall()
        return "True"
    except:
        return "False"

@app.route('/setup_firewall', methods=['POST'])
@omv_auth_required ###OMV authentication code
@limiter.limit("20 per minute", exempt_when=is_localhost)  # Exempt localhost from rate limiting
def invoke_setup_firewall():
    """
    API endpoint to setup firewall rules for a specified service
    Expected query parameter: service
    Example: /setup_firewall?service=jellyfin
    Returns:
        JSON response with status and message
    """
    try:
        # Get service name from query parameters
        service_name = request.args.get('service')
        
        # Validate service name
        valid_services = ['joplin', 'jellyfin', 'vaultwarden', 'immich', 'duplicati']
        
        if not service_name:
            return jsonify({
                'status': 'error',
                'message': 'Service name is required'
            }), 400
            
        if service_name not in valid_services:
            return jsonify({
                'status': 'error',
                'message': f'Invalid service. Must be one of: {", ".join(valid_services)}'
            }), 400
        
        # Call the setup_firewall function
        success = setup_firewall(service_name)
        
        if success:
            return jsonify({
                'status': 'success',
                'message': f'Firewall rules updated successfully for {service_name}'
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': f'Failed to update firewall rules for {service_name}'
            }), 500
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/get_hostname', methods=['GET'])
@omv_auth_required ###OMV authentication code
@limiter.limit("20 per minute", exempt_when=is_localhost)  # Exempt localhost from rate limiting
def get_hostname_route():
    """
    Returns the system hostname as JSON.
    
    This endpoint invokes the existing get_hostname() function
    and returns the result in a JSON format.
    
    Returns:
        JSON: {"hostname": "<hostname>"}
    """
    try:
        # Call the existing get_hostname function
        hostname = get_hostname()
        
        # Return the hostname as JSON
        return jsonify({
            "hostname": hostname,
            "success": True
        }), 200
    except Exception as e:
        # Handle any errors
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

@app.route('/generate-totp', methods=['POST'])
#@omv_auth_required  # OMV authentication code
@local_network_only
@limiter.limit("3 per minute", exempt_when=is_localhost)  # Limit to prevent abuse
def generate_totp_api():
    """
    API endpoint to generate a TOTP code and display it on the OLED.
    If a valid code already exists, it returns that instead of generating a new one.
    """
    try:
        global persistent_msg_id, current_totp, totp_expiry, display_is_on,DISPLAY_TIMEOUT
        
         
        # Check if there's an existing valid TOTP code
        current_time = int(time.time())
        if current_totp is not None and current_time < totp_expiry:
            # Return the existing code
            remaining_seconds = totp_expiry - current_time
            
            #if (display_is_on == False):
            #    turn_on_display()
            #    text = f"Code:\n{current_totp}"
            #    print (f"starting display request")
            #    success = send_display_request(text, "once", 58, "add", 0)

            return jsonify({
                'status': 'success',
                'message': 'Previous TOTP valid'
            }), 200

        # No valid code exists, generate a new one
        #print (f"generating totp")
        totp_code = generate_totp()
        #print (f"totp is {totp_code}")

        # Turn on display and set timeout
        if (display_is_on == False):
            turn_on_display()
            print (f"starting display timer")
            start_display_timeout_timer()
        
        # Display the code on the OLED
        text = f"Code:\n{totp_code}"
        #print (f"starting display request")
        success = send_display_request(text, "once", 58, "add", 0)
        
        return jsonify({
            'status': 'success',
            'message': 'New TOTP code generated and displayed'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/validate-totp', methods=['POST'])
@local_network_only
@limiter.limit("10 per minute")  # Limit to prevent brute force
def validate_totp_api():
    """
    API endpoint to validate a TOTP code
    """
    try:
        global current_totp, totp_expiry

        # Get the code from the request
        if not request.is_json:
            return jsonify({
                'status': 'error',
                'message': 'Missing JSON data'
            }), 400
            
        data = request.json
        if 'code' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Missing code parameter'
            }), 400
            
        submitted_code = data['code']
        
        # Check if there's a valid TOTP code
        if current_totp is None:
            return jsonify({
                'status': 'error',
                'message': 'No active verification code'
            }), 400
            
        # Check if the code has expired
        current_time = int(time.time())
        if current_time > totp_expiry:
            return jsonify({
                'status': 'error',
                'message': 'Verification code has expired'
            }), 400
            
        # Validate the code
        if submitted_code == current_totp:
            # Clear the code after successful validation
            current_totp = None
            totp_expiry = 0
            
            return jsonify({
                'status': 'success',
                'message': 'Verification successful'
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': 'Invalid verification code'
            }), 400
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/stopcontainer', methods=['POST'])
@local_network_only
@limiter.limit("8 per minute")  # Limit to prevent brute force
def stop_container():
    try:
        app_name = request.args.get('name')
        valid_apps = ['paperless', 'immich', 'joplin', 'jellyfin', 'smb', 'vaultwarden']
        
        if not app_name or app_name not in valid_apps:
            return jsonify({'success': False, 'message': 'Invalid app name'})
        
        subprocess.run(['systemctl', 'stop', f'{app_name}.service'], check=True)
        return jsonify({'success': True, 'message': f'{app_name} service stopped'})
        
    except subprocess.CalledProcessError:
        return jsonify({'success': False, 'message': f'Failed to stop {app_name} service'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})


@app.route('/startcontainer', methods=['POST'])
@local_network_only
@limiter.limit("8 per minute")  # Limit to prevent brute force
def start_container():
    try:
        app_name = request.args.get('name')
        valid_apps = ['paperless', 'immich', 'joplin', 'jellyfin', 'smb', 'vaultwarden']
        
        if not app_name or app_name not in valid_apps:
            return jsonify({'success': False, 'message': 'Invalid app name'})
        
        subprocess.run(['systemctl', 'start', f'{app_name}.service'], check=True)
        return jsonify({'success': True, 'message': f'{app_name} service started'})
        
    except subprocess.CalledProcessError:
        return jsonify({'success': False, 'message': f'Failed to start {app_name} service'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

def cycle_display():
    global persistent_msg_id
    global something_on_display
    global MSG_ID_TO_BE_REMOVED
    global msg_id_remove
    global display_texts
    global remove_all_msg
    global FIRST_START

    last_display_time = time.monotonic()
    current_index = 0
    DELAY_TIME = 3
    
    # Flag to track if first-time setup is in progress
    setup_in_progress = False
    
    while True:
        # Handle first-time setup without blocking
        if FIRST_START and not setup_in_progress:
            setup_in_progress = True
            draw_text("Homecloud","Starting","")
            
            # Run setup tasks in a separate thread to avoid blocking
            def run_setup():
                homecloud_ready = False
                while (homecloud_ready == False):

                    global FIRST_START, persistent_msg_id
                    
                    setup_paperless_firewall()
                    setup_firewall("joplin")
                    setup_firewall("jellyfin")
                    setup_firewall("vaultwarden")
                    setup_firewall("immich")
                    setup_firewall("duplicati")

                    #subprocess.run(["rm", "-f", "/tmp/photoprism-start-stop-in-progress"], 
                    #              check=True, stdout=subprocess.PIPE, universal_newlines=True)
                    status = check_service_status_generic("openmediavault-engined.service")   
                    print(f"collectd service status is {status}")
                    if check_service_status_generic("openmediavault-engined.service") == "Running":
                        delete_samba_export_from_shares()
                        delete_disk_share()
                        mount_all_eligible_disks()
                        create_external_disk_share("NONE")
                        update_photoprism_YAML()
                        FIRST_START = False

                        if persistent_msg_id != "False":
                            text = f"Homecloud\nDummy\nDummy"
                            success = f"{send_display_request(text, 'once', 1, 'remove', persistent_msg_id)}"
                            if success == "True":
                                persistent_msg_id = "False"
                        draw_text("Homecloud", "Ready", "")
                        start_display_timeout_timer()
                        homecloud_ready = True
                    else:
                        text = f"Homecloud\nStarting\nServices"
                        if persistent_msg_id == "False":
                            success = f"{send_display_request(text, 'once', -1, 'add', 0)}"
                            if success != "False":
                                persistent_msg_id = success
                
                # Setup is complete
                setup_in_progress = False
            
            # Start setup in a separate thread
            setup_thread = threading.Thread(target=run_setup)
            setup_thread.daemon = True
            setup_thread.start()

        # Handle message queue operations
        if remove_all_msg:
            display_texts = []
            remove_all_msg = False
            clear_screen()
            current_index = 0

        if len(msg_id_remove) > 0:
            new_matrix = []
            for row_index in msg_id_remove:
                for row in display_texts:
                    if row_index not in row:
                        new_matrix.append(row)
                display_texts = [row.copy() for row in new_matrix]
                new_matrix = []
            msg_id_remove = []
            clear_screen()
            current_index = 0

        # Display messages with timing control
        if len(display_texts) > 0 and not something_on_display:
            now = time.monotonic()
            if now - last_display_time >= DELAY_TIME:
                if current_index < len(display_texts):  # Prevent index errors
                    row = display_texts[current_index]
                    line_1 = line_2 = line_3 = ""

                    for col_index, element in enumerate(row):
                        if col_index == 1:
                            line_1 = element
                        elif col_index == 2:
                            line_2 = element
                        elif col_index == 3:
                            line_3 = element

                    clear_screen()
                    draw_text(line_1, line_2, line_3)
                    last_display_time = now

                    current_index = (current_index + 1) % max(1, len(display_texts))

        # Sleep longer to reduce CPU usage and improve API responsiveness
        time.sleep(2)  # Increased sleep time

#app = Flask(__name__)


if __name__ == '__main__':
    display_cycle = threading.Thread(target=cycle_display)
    display_cycle.start()
    #start_display_timeout_timer()
    #SSL CODE
     # Get SSL certificate paths from environment variables
    SSL_CERT_FILE, SSL_KEY_FILE = get_ssl_paths()

    if not (os.path.exists(SSL_CERT_FILE) and os.path.exists(SSL_KEY_FILE)):
        raise RuntimeError("SSL certificate or key not found")

    CORS(app,supports_credentials=True)
    app.run(
            host='0.0.0.0',
            port=5000,
            ssl_context=(SSL_CERT_FILE, SSL_KEY_FILE)
        )

    #app.run(host='0.0.0.0', port=5000)
