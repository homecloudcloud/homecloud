#!/bin/bash
set -e

GITHUB_REPO="https://github.com/homecloudcloud/homecloud"
CONFIG_FILE="config.txt"
VG_NAME="DATA_VOL"
DISK="/dev/nvme0n1"

echo "[1/10] Installing required packages..."
apt-get update
apt-get install -y lvm2 git curl wget 

echo "[2/10] Checking existing LVM setup..."
if lvs "/dev/$VG_NAME/home_dirs" &>/dev/null && mountpoint -q "/dev/$VG_NAME/home_dirs" 2>/dev/null; then
    echo "LV already exists and is mounted, skipping LVM setup..."
else
    echo "Setting up LVM..."
    # Deactivate and unmount existing volumes
    swapoff -a 2>/dev/null || true
    umount "$DISK"* 2>/dev/null || true
    vgchange -an "$VG_NAME" 2>/dev/null || true
    vgremove -y "$VG_NAME" 2>/dev/null || true
    pvremove -y "$DISK" 2>/dev/null || true
    wipefs -a "$DISK" 
    dd if=/dev/zero of="$DISK" bs=1M count=10 status=none conv=fsync
    
    echo "[3/10] Creating PV, VG, and LVs..."
    pvcreate -ff -y "$DISK"
    vgcreate "$VG_NAME" "$DISK"
    lvcreate -L 10G "$VG_NAME" -n swap
    lvcreate -l 100%FREE "$VG_NAME" -n home_dirs 
    mkswap "/dev/$VG_NAME/swap"
fi

echo "[4/10] Setting up swap..."
grep -q "/dev/$VG_NAME/swap" /etc/fstab || echo "/dev/$VG_NAME/swap none swap defaults,x-systemd.requires=lvm2-activation-early.service 0 0" >> /etc/fstab
swapon -a 

echo "[5/10] Downloading config.txt from GitHub..."
wget -O /boot/firmware/config.txt "${GITHUB_REPO}/raw/main/${CONFIG_FILE}"

echo "[6/10] Installing base packages..."
systemctl disable dphys-swapfile.service 
apt-get install -y software-properties-common 
add-apt-repository -y contrib 
add-apt-repository -y non-free 
apt-get update |
apt-get install -y i2c-tools hostapd dnsmasq systemd-resolved 
systemctl disable hostapd 
systemctl disable dnsmasq 

echo "[7/10] Installing OMV HC package"
apt-get install -y gnupg wget apt-transport-https 
#wget -qO - https://packages.openmediavault.org/public/archive.key | gpg --dearmor | \
#    tee /usr/share/keyrings/openmediavault-archive-keyring.gpg > /dev/null 

#echo "deb [signed-by=/usr/share/keyrings/openmediavault-archive-keyring.gpg] https://packages.openmediavault.org/public sandworm main" | \
#    tee /etc/apt/sources.list.d/openmediavault.list 

apt-get update 
# Download latest OMV deb file from GitHub
OMV_DEB=$(curl -s "${GITHUB_REPO}/releases/latest" | grep -o 'openmediavault[^"]*\.deb' | head -1)
if [ -z "$OMV_DEB" ]; then
    # Fallback: try to find any OMV deb in the repo
    OMV_DEB=$(curl -s "https://api.github.com/repos/homecloudcloud/homecloud/contents/" | grep -o '"name":"openmediavault[^"]*\.deb"' | cut -d'"' -f4 | head -1)
fi
if [ -n "$OMV_DEB" ]; then
    wget "${GITHUB_REPO}/raw/main/${OMV_DEB}"
    apt-get install -y "./${OMV_DEB}"
else
    echo "Error: Could not find OMV deb file in repository"
    exit 1
fi 
omv-confdbadm populate 
omv-salt deploy run systemd-networkd 

echo "[8/10] Setting up admin user..."
id admin &>/dev/null || adduser --system --uid 997 --home /home/admin --shell /bin/bash admin 
groupmod -a -U admin _ssh 
usermod -aG sudo admin 
mkdir -p /home/admin 
cp -R /etc/skel/. /home/admin 
chown -R admin:users /home/admin 
chmod 755 /home/admin 
chsh -s /bin/bash admin 

echo "[INFO] Please set password for 'admin' user (if prompted):"
passwd admin 

echo "[9/10] Adding homecloud repository..."
wget -qO - http://repo.homecloud.cloud/repository_dir/public.key | gpg --dearmor > /usr/share/keyrings/homecloud.gpg 2>/dev/null || true
echo "deb [arch=arm64 signed-by=/usr/share/keyrings/homecloud.gpg] http://repo.homecloud.cloud/repository_dir stable main" > /etc/apt/sources.list.d/homecloud.list
apt update
apt install -y homecloud || echo "Warning: homecloud package not available"


echo "[11/20] Configuring network interfaces..."
UUID=$(omv-rpc -u admin 'Network' 'enumerateDevicesList' '{"start":0, "limit": -1}' | jq -r '.data[] | select(.devicename=="end0") | .uuid')
UUIDWIFI=$(omv-rpc -u admin 'Network' 'enumerateDevicesList' '{"start":0, "limit": -1}' | jq -r '.data[] | select(.devicename=="wlan0") | .uuid')

omv-rpc -u admin 'Network' 'setEthernetIface' "{\"uuid\": \"$UUID\",\"devicename\":\"end0\", \"method\": \"dhcp\",\"address\": \"\",\"netmask\": \"0\",\"gateway\":\"\",\"routemetric\":0,\"method6\":\"auto\",\"address6\":\"\",\"netmask6\":0,\"gateway6\":\"\",\"routemetric6\":0,\"dnsnameservers\":\"8.8.8.8\",\"dnssearch\":\"\",\"mtu\": 1500,\"wol\":false,\"comment\":\"Wired\",\"altmacaddress\":\"\"}"

omv-rpc -u admin 'Network' 'setWirelessIface' "{\"uuid\": \"$UUIDWIFI\",\"devicename\":\"wlan0\",\"method\": \"dhcp\",\"address\": \"\",\"netmask\": \"0\",\"gateway\":\"\",\"routemetric\":0,\"method6\":\"auto\",\"address6\":\"\",\"netmask6\":0,\"gateway6\":\"\",\"routemetric6\":0,\"dnsnameservers\":\"8.8.8.8\",\"dnssearch\":\"\",\"mtu\": 1500,\"wol\":false,\"comment\":\"Wi-Fi\",\"altmacaddress\":\"\", \"wpassid\": \"ding@dong_5G\", \"wpapsk\": \"Shaurya@123\",\"keymanagement\":\"psk\", \"hidden\": false}"

echo "[12/20] Validating network configuration..."
VALIDATION_RESULT=$(omv-rpc -u admin 'Homecloud' 'enumerateConfiguredDevicesWithStatus' 2>/dev/null || echo '{}')
WIRED_COMMENT=$(echo "$VALIDATION_RESULT" | jq -r 'if type == "object" and has("data") then .data[] | select(.devicename=="end0") | .comment else .[] | select(.devicename=="end0") | .comment end' 2>/dev/null || echo "")
WIFI_COMMENT=$(echo "$VALIDATION_RESULT" | jq -r 'if type == "object" and has("data") then .data[] | select(.devicename=="wlan0") | .comment else .[] | select(.devicename=="wlan0") | .comment end' 2>/dev/null || echo "")

if [[ "$WIRED_COMMENT" != "Wired" ]] || [[ "$WIFI_COMMENT" != "Wi-Fi" ]]; then
    echo "Network configuration validation failed. Continuing anyway..."
fi

echo "[13/20] Installing Tailscale..."
curl -fsSL https://tailscale.com/install.sh | sh

echo "[14/20] Installing Docker..."
apt install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/$(. /etc/os-release && echo "$ID")/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$(. /etc/os-release && echo "$ID") $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "[15/20] Removing NetworkManager..."
systemctl stop NetworkManager 2>/dev/null || true
systemctl disable NetworkManager 2>/dev/null || true
rm -f /etc/systemd/system/dbus-org.freedesktop.NetworkManager.service



echo "[17/20] Configuring admin user groups..."
usermod -aG _ssh,users,openmediavault-admin admin

echo "[18/20] Installing Python environment..."
apt update
apt install -y python3 python3-venv python3.11-dev
python3 -m venv /lib/homecloud
wget "${GITHUB_REPO}/raw/main/requirements.txt"
/lib/homecloud/bin/pip install -r requirements.txt
source /lib/homecloud/bin/activate
pip install adafruit-blinka lgpio adafruit-circuitpython-ssd1306
omv-salt deploy run phpfpm

echo "[✅ DONE] Homecloud setup script finished. If stopped in between Reboot and rerun the script. After that Follow the next steps in README file. 
