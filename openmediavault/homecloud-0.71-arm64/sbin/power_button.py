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
#import busio
import requests
import openmediavault.firstaid
import openmediavault.net
import openmediavault.rpc
import openmediavault.stringutils
import openmediavault
from time import sleep

def start_service(service_name):
    try:
        subprocess.check_call(['systemctl', 'restart', service_name])
        print(f"Service '{service_name}' started successfully.")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error starting service '{service_name}': {e}")
        return False

def send_display_request(text_to_display,msg_type,time_to_display,action,msg_id):
    try:
        url = "https://127.0.0.1:5000/display"
        lines = text_to_display.splitlines()
        if len(lines) < 3:
            lines.append("")

        data = {'line1': lines[0], 'line2': lines[1], 'line3': lines[2], 'type': msg_type, 'time_to_display': time_to_display, 'msg_req': action}
        response = requests.post(url, params=data,verify=False)
        if response.status_code == 200:
            #print(f"Display request sent successfully. Response: {response.text}")
            return response.text
        else:
            print(f"Error sending display request. Status code: {response.status_code}")
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

def reboot_system():
    try:
        print("Rebooting the system...")
        # Check if the user has the necessary permissions to reboot
        if os.geteuid() != 0:
            print("You need to have root privileges to reboot the system.")
            return

        # Reboot the system
        subprocess.run(["reboot"], check=True)
        print("System is rebooting...")

    except subprocess.CalledProcessError as e:
        print(f"Error rebooting the system: {e}")

def delete_interface(interface):
    try:
        result = subprocess.run(["/usr/sbin/omv-confdbadm", "read", "conf.system.network.interface"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        #print(f"result: {result}")
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
        if (valid_interface == 0):
            #interface already deleted or not found
            return True
    except subprocess.CalledProcessError:
        return False
def get_interface_ip(interface_name):
    """
    Get the IP address of a network interface.
    
    Args:
        interface_name: Name of the network interface (e.g., 'wlan0')
        
    Returns:
        str: IP address of the interface or None if not found
    """
    try:
        # Run the ip addr command to get interface information
        result = subprocess.run(
            ["ip", "-4", "addr", "show", interface_name],
            capture_output=True,
            text=True,
            check=True
        )
        
        # Parse the output to extract the IP address
        for line in result.stdout.splitlines():
            if "inet " in line:
                # Extract the IP address using regex
                match = re.search(r'inet\s+(\d+\.\d+\.\d+\.\d+)', line)
                if match:
                    return match.group(1)
        
        # If no IP address was found
        return None
    
    except subprocess.CalledProcessError as e:
        print(f"Error getting IP for {interface_name}: {e}")
        return None

def set_interface_ip(interface_name, ip_address, netmask):
    """
    Set the IP address and netmask for a network interface.
    
    Args:
        interface_name: Name of the network interface (e.g., 'wlan0')
        ip_address: IP address to set
        netmask: Network mask to set
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Convert netmask to CIDR notation if needed
        cidr = 24  # Default for 255.255.255.0
        if netmask:
            # Count the number of 1s in the binary representation of the netmask
            octets = netmask.split('.')
            if len(octets) == 4:
                binary = ''.join([bin(int(octet))[2:].zfill(8) for octet in octets])
                cidr = binary.count('1')
        
        # Flush existing IP addresses
        subprocess.run(
            ["ip", "addr", "flush", "dev", interface_name],
            check=True
        )
        
        # Set the new IP address
        subprocess.run(
            ["ip", "addr", "add", f"{ip_address}/{cidr}", "dev", interface_name],
            check=True
        )
        
        # Bring the interface up
        subprocess.run(
            ["ip", "link", "set", "dev", interface_name, "up"],
            check=True
        )
        
        # Verify the IP was set correctly
        time.sleep(1)  # Give the system a moment to apply the changes
        current_ip = get_interface_ip(interface_name)
        if current_ip == ip_address:
            return True
        else:
            print(f"Failed to set IP: expected {ip_address}, got {current_ip}")
            return False
    
    except subprocess.CalledProcessError as e:
        print(f"Error setting IP for {interface_name}: {e}")
        return False


def start_hotspot():
    try:
        # Call the API endpoint to start the hotspot
        url = "https://127.0.0.1:5000/start_hotspot"
        
        # Make the API request with SSL verification disabled
        response = requests.post(url, verify=False, timeout=30)
        
        # Check if the request was successful
        if response.status_code == 200:
            #print("Hotspot started successfully via API")
            data = response.json()
            if 'status' in data and data['status'] is True:
                # Get the hostapd configuration to extract SSID
                hostapd_conf_file = '/etc/hostapd/hostapd.conf'
                ssid = ""
                with open(hostapd_conf_file, 'r') as f:
                    lines = f.readlines()
                    for line in lines:
                        if 'ssid' in line:
                            ssid = line.split('=')[1].strip()
                
                #print(f"Hotspot '{ssid}' is now active")
                return '172.31.1.1'  # Return the hotspot IP
            else:
                print(f"API returned error: {data.get('status', 'Unknown error')}")
                return False
        else:
            print(f"Failed to start hotspot via API. Status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"Unexpected error starting hotspot: {e}")
        return False


def reset_omv_password():
    try:
        #print(f"IN RESET_OMV")
        password=""
        with open('/etc/device-password', 'r') as file:
            lines = file.readlines()
        file.close()

        for line in lines:
            print(f"line is: {line}")
            if 'password' in line:
                password = line.split('=')[1].strip()
                print(f"new password to be changed: {password}")
        if (password==""):
            #print(f"returning False as new password to be changed: {password}")
            return False
        rpc_params = {}
        rpc_params.update(
            {
                "password": password
            }
        )
        openmediavault.rpc.call(
            "UserMgmt",
            "setPasswordByContext",
            rpc_params
        )
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error sending reset OMV password request: {e}")
        return False

def check_wifi_reset_button():
    try:
        # Check if file exists, create it if it doesn't
        if not os.path.exists('/tmp/reset_wifi.tmp'):
            with open('/tmp/reset_wifi.tmp', 'w') as f:
                pass
            return False
        
        # Find the last "Processed" line
        last_processed_line = -1
        with open('/tmp/reset_wifi.tmp', 'r') as file:
            all_lines = file.readlines()
            
        # Find the index of the last "Processed" line
        for i in range(len(all_lines) - 1, -1, -1):
            if all_lines[i].strip() == "Processed":
                last_processed_line = i
                break
        
        # Get all lines after the last "Processed" line
        if last_processed_line >= 0:
            unprocessed_lines = all_lines[last_processed_line + 1:]
        else:
            unprocessed_lines = all_lines
        
        # Clean up the lines
        unprocessed_lines = [line.strip() for line in unprocessed_lines if line.strip()]
        
        # Check if we have enough lines to process
        if len(unprocessed_lines) < 5:
            print(f"Not enough button presses: {len(unprocessed_lines)}/5")
            return False
        
        # Get the last 5 unprocessed lines
        last_five_lines = unprocessed_lines[-5:]
        
        # Extract timestamps from first and last line
        pattern = r"(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})"
        first_match = re.search(pattern, last_five_lines[0], re.IGNORECASE)
        last_match = re.search(pattern, last_five_lines[-1], re.IGNORECASE)
        
        if first_match and last_match:
            first_time_str = first_match.group(1)
            last_time_str = last_match.group(1)
            
            # Parse timestamps
            fmt = "%Y-%m-%d %H:%M:%S"
            first_time = datetime.strptime(first_time_str, fmt)
            last_time = datetime.strptime(last_time_str, fmt)
            current_time = datetime.now()
            
            # Calculate time difference between first and last button press
            time_diff = last_time - first_time
            total_seconds = time_diff.total_seconds()
            
            # Calculate time difference between last button press and current time
            time_since_last_press = current_time - last_time
            seconds_since_last_press = time_since_last_press.total_seconds()
            
            print(f"Time difference between first and last button press: {total_seconds} seconds")
            print(f"Time since last button press: {seconds_since_last_press} seconds")
            
            
            # Check if time difference is less than 2 seconds AND last press is within 10 seconds
            if total_seconds < 3 and seconds_since_last_press < 10:
                print("Valid button press sequence detected - starting hotspot")
                
                
                # Display message
                text = "Starting WiFi\nHotspot Mode"
                send_display_request(text, 'once', 30, 'add', 0)
                
                # Mark all lines as processed
                with open('/tmp/reset_wifi.tmp', 'a') as file:
                    file.write("Processed\n")

                # Start hotspot only once
                start_hotspot()
                return True
            else:
                if seconds_since_last_press >= 10:
                    print("Last button press is too old (more than 10 seconds)")
                if total_seconds >= 3:
                    print("Button presses are too spread out (more than 3 seconds)")
                
                # Mark as processed
                with open('/tmp/reset_wifi.tmp', 'a') as file:
                    file.write("Processed\n")
                return False
        else:
            print("Could not extract timestamps from button press log")
            return False
    
    except Exception as e:
        print(f"Error processing button press log: {e}")
        return False



def main():
    while True:
        text = "Wifi Reset in Progress\n Rebooting Now"
        check_wifi_reset_button()
        #reboot_system()
        return True


if __name__ == "__main__":
    main()