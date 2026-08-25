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

oled_reset = digitalio.DigitalInOut(board.D4)


# Use for I2C.
i2c = board.I2C()  # uses board.SCL and board.SDA
# i2c = board.STEMMA_I2C()  # For using the built-in STEMMA QT connector on a microcontroller
#oled = Adafruit_SSD1306.SSD1306_I2C(WIDTH, HEIGHT, i2c, addr=0x3C, reset=oled_reset)
#to disable display. Uncomment when display working---------------------------------------------------------------------------------------------------
oled = adafruit_ssd1306.SSD1306_I2C(WIDTH, HEIGHT, i2c, addr=0x3C, reset=oled_reset)

# Clear display.
#to disable display. Uncomment when display working---------------------------------------------------------------------------------------------------
oled.fill(0)
oled.show()

# Create blank image for drawing.
# Make sure to create image with mode '1' for 1-bit color.
#to disable display. Uncomment when display working---------------------------------------------------------------------------------------------------
image = Image.new("1", (oled.width, oled.height))

# Get drawing object to draw on image.
#to disable display. Uncomment when display working---------------------------------------------------------------------------------------------------
draw = ImageDraw.Draw(image)

# Draw a white background
#to disable display. Uncomment when display working---------------------------------------------------------------------------------------------------
draw.rectangle((0, 0, oled.width, oled.height), outline=1, fill=0)

# Draw a smaller inner rectangle
#draw.rectangle(
 #   (BORDER, BORDER, oled.width - BORDER - 1, oled.height - BORDER - 1),
  #  outline=0,
   # fill=0,
#)

font_height=13
display_is_on = False
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
            if (text1 == "System"):
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
            if (text1 == "Homecloud"):
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




#write main loop to display text and then exit
if __name__ == '__main__':
    #turn_on_display()
    clear_screen()
    draw_text("Homecloud","Starting","")
   
    # exit 
