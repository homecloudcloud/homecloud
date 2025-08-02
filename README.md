Pre-requisite to install Homecloud on Raspberry PI:
- Raspberry PI 5 (older models may work as well but not tested).
- SD card(32 GB or more) with Raspbian 64 bit image (RASPIOS-bookworm-lite) - DESKTOP version NOT supported. 
- NVMe hat attached to base card.
- OLED display attached to base card.
- NVMe SSD storage (recommended 128 GB +)

Steps to install Homecloud on Raspberry Pi:
1.Install RASPI OS (64bit) Lite to SDCARD (Downloads/2025-05-13-RASPIOS-bookworm) Make sure image is arm64 (not armhf)
   - Edit settings: 
        - Set hostname: homecloud.local
        - username: test
          password: xxxxxx   
2. Insert SSD. Boot. Connect HDMI and network cable. Check IP on monitor (HDMI connected). SSH using test@IP and sudo su -
3. Run raspi-config > Advanced Settings > network interface names > Enable predictable name.
4. Enable i2c bus by : raspi-config interface enable i2c.
5. Uncomment all non-dev repo of raspi in /etc/apt/sources.list.d/raspi.list
6. 

