from flask import Flask, request
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


# Change these
# to the right size for your display!
WIDTH = 128
HEIGHT = 32  # Change to 64 if needed
BORDER = 5
app = Flask(__name__)

def wait_for_oled_available(max_retries=10, initial_delay=0.5):
    for attempt in range(max_retries):
        try:
            oled_reset = digitalio.DigitalInOut(board.D4)
            test_oled = adafruit_ssd1306.SSD1306_I2C(WIDTH, HEIGHT, i2c, addr=0x3C, reset=oled_reset)
            test_oled.fill(0)
            test_oled.show()
            return test_oled
        except:
            if attempt < max_retries - 1:
                time.sleep(initial_delay * (2 ** attempt))
    return None

# Use for I2C.
i2c = board.I2C()  # uses board.SCL and board.SDA

# Wait for OLED to be available
oled = wait_for_oled_available()
if oled is None:
    print("OLED not available, exiting")
    sys.exit(1)

# Create blank image for drawing.
image = Image.new("1", (oled.width, oled.height))

# Get drawing object to draw on image.
draw = ImageDraw.Draw(image)

# Draw a white background
draw.rectangle((0, 0, oled.width, oled.height), outline=1, fill=0)

# Draw a smaller inner rectangle
#draw.rectangle(
 #   (BORDER, BORDER, oled.width - BORDER - 1, oled.height - BORDER - 1),
  #  outline=0,
   # fill=0,
#)

font_height=13

# Load default font.
font = ImageFont.load_default()

def clear_screen():
    try:
        draw.rectangle((0, 0, oled.width, oled.height), outline=0, fill=0)
        oled.image(image)
        oled.show()
    except:
        return None

def draw_text(text1,text2,text3):
    try:
        #to disable display. comment next line when display working---------------------------------------------------------------------------------------------------
        #return True
        global font_height
        parts = []       
        if (text1):
            parts.append([])
            parts[-1].append(text1)
        if (text2):
            #parts.append(text2)
            parts[-1].append(text2)
        if (text3):
            parts[-1].append(text3)
        
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
            if (text1 == "Configuring"):
                image = Image.open('system-configuring.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            if (text1 == "Homecloud"):
                image = Image.open('system-configuring.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            if (text1 == "Network File"):
                image = Image.open('system-configuring.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            if (text1 == "File"):
                image = Image.open('system-configuring.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            if (text1 == "WiFi"):
                image = Image.open('wifi-disconnected.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            if (text1 == "To Reset"):
                image = Image.open('wifi-disconnected.ppm').convert('1')
                draw = ImageDraw.Draw(image)
            if (text1 == "Checking"):
                image = Image.open('system-configuring.ppm').convert('1')
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


def turn_off_display():
    """
    Turn off the OLED display completely.
    This puts the display into a low power state.
    """
    try:
        
        # Clear the display first
        oled.fill(0)
        oled.show()
        
        # Send the display off command
        # 0xAE is the SSD1306 command to turn the display off
        oled.write_cmd(0xAE)
        
        
        return True
    except Exception as e:
        #print(f"Error turning off display: {e}")
        return False



#write main loop to display text and then exit
if __name__ == '__main__':
    clear_screen()
    
    # Check command line arguments
    if len(sys.argv) != 2:
        print("Usage: python3 reboot-message.py [reboot|poweroff]")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == "reboot":
        draw_text("Homecloud", "Restarting", "")
    elif command == "poweroff":
        draw_text("Homecloud", "Powering", "Off")
        # Wait for 2 seconds before turning off display
        time.sleep(6)
        turn_off_display()
    else:
        print("Invalid command. Use 'reboot' or 'poweroff'")
        sys.exit(1)