<?php
/**
 * This file is part of OpenMediaVault.
 *
 * @license   http://www.gnu.org/licenses/gpl.html GPL Version 3
 * @author    Your Name <your.email@example.com>
 * @copyright Copyright (c) 2009-2023 Volker Theile
 *
 * OpenMediaVault is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * OpenMediaVault is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */
namespace Engined\Rpc;

require_once("openmediavault/functions.inc");

class Homecloud extends \OMV\Rpc\ServiceAbstract {
    public function getName() {
        return "Homecloud";
    }

    public function initialize() {
        $this->registerMethod("getTailscaleStatus");
        $this->registerMethod("getWiFiStatus");
        $this->registerMethod("getConnectedDevicesTailscale");
        $this->registerMethod("getConnectedDevicesTailscaleBg");
        $this->registerMethod("getConnectedDeviceswindowsTailscale");
        $this->registerMethod("getConnectedDeviceswindowsTailscaleBg");
        $this->registerMethod("getConnectedDevicesiosTailscale");
        $this->registerMethod("getConnectedDevicesiosTailscaleBg");
        $this->registerMethod("getConnectedDevicesmacosTailscale");
        $this->registerMethod("getConnectedDevicesmacosTailscaleBg");
        $this->registerMethod("getConnectedDevicesandroidTailscale");
        $this->registerMethod("getConnectedDevicesandroidTailscaleBg");
        $this->registerMethod("getImmichServiceStatus");
        $this->registerMethod("restart_immich");
        $this->registerMethod("reset_immich");
        $this->registerMethod("get_backup_size_immich");
        $this->registerMethod("get_external_disks");
        $this->registerMethod("get_external_disksBg");
        $this->registerMethod("immich_backup_execute");
        $this->registerMethod("immich_get_admin_users");
        $this->registerMethod("immich_reset_admin_password");
        $this->registerMethod("immich_check_version");
        $this->registerMethod("immich_update_version");
        $this->registerMethod("immich_get_latest_version");
        $this->registerMethod("immich_remove");
        $this->registerMethod("getVaultwardenServiceStatus");
        $this->registerMethod("vaultwarden_get_latest_version");
        $this->registerMethod("vaultwarden_update_version");
        $this->registerMethod("vaultwarden_check_version");
        $this->registerMethod("get_backup_size_vaultwarden");
        $this->registerMethod("vaultwarden_backup_execute");
        $this->registerMethod("reset_vaultwarden");
        $this->registerMethod("restart_vaultwarden");
        $this->registerMethod("vaultwarden_remove");
        $this->registerMethod("getPaperlessServiceStatus");
        $this->registerMethod("paperless_get_latest_version");
        $this->registerMethod("paperless_check_version");
        $this->registerMethod("paperless_remove");
        $this->registerMethod("paperless_update_version");
        $this->registerMethod("paperless_reset_password");
        $this->registerMethod("get_backup_size_paperless");
        $this->registerMethod("paperless_backup_execute");
        $this->registerMethod("restart_paperless");
        $this->registerMethod("reset_paperless");
        $this->registerMethod("paperless_getusers");
        $this->registerMethod("getJoplinServiceStatus");
        $this->registerMethod("joplin_get_latest_version");
        $this->registerMethod("joplin_update_version");
        $this->registerMethod("joplin_check_version");
        $this->registerMethod("joplin_remove");
        $this->registerMethod("get_backup_size_joplin");
        $this->registerMethod("joplin_backup_execute");
        $this->registerMethod("restart_joplin");
        $this->registerMethod("reset_joplin");
        $this->registerMethod("getJellyfinServiceStatus");
        $this->registerMethod("jellyfin_get_latest_version");
        $this->registerMethod("jellyfin_update_version");
        $this->registerMethod("jellyfin_check_version");
        $this->registerMethod("jellyfin_remove");
        $this->registerMethod("reset_jellyfin");
        $this->registerMethod("jellyfin_backup_execute");
        $this->registerMethod("get_backup_size_jellyfin");
        $this->registerMethod("restore_find_backups");
        $this->registerMethod("restore_find_backupsBg");
        $this->registerMethod("get_free_space_internaldisk");
        $this->registerMethod("immich_restore_execute");
        $this->registerMethod("vaultwarden_restore_execute");
        $this->registerMethod("joplin_restore_execute");
        $this->registerMethod("paperless_restore_execute");
        $this->registerMethod("jellyfin_restore_execute");
        $this->registerMethod("get_backup_size_drive");
        $this->registerMethod("drive_backup_execute");
        $this->registerMethod("restart_jellyfin");
        $this->registerMethod("drive_restore_execute");
        $this->registerMethod("getFunnelStatus");
        $this->registerMethod("createTailscaleFunnel");
        $this->registerMethod("disableTailscaleFunnel");
        $this->registerMethod("enumeratePhysicalNetworkDevices");   
        $this->registerMethod("enumeratePhysicalNetworkDevicesList");
        $this->registerMethod("enumerateConfiguredDevicesWithStatus");
        $this->registerMethod("checkNetworkInterfaceStatusForWizard");
        $this->registerMethod("checkVpnStatusForWizard");
        $this->registerMethod("checkNotificationEmailForWizard");
        $this->registerMethod("checkInternetStatusForWizard");
        $this->registerMethod("checkDriveUserSetupForWizard");
        $this->registerMethod("checkPhotosAppDeployForWizard");
        $this->registerMethod("checkDocsAppDeployForWizard");
        $this->registerMethod("checkNotesAppDeployForWizard");
        $this->registerMethod("checkPasswordAppDeployForWizard");
        $this->registerMethod("checkMediaAppDeployForWizard");
        $this->registerMethod("appAutoUpdates");
     	$this->registerMethod("setUserAll");
        $this->registerMethod("setPasswordByContextAll");
		$this->registerMethod("setPasswordByContextSmb");
		$this->registerMethod("setPasswordByContextOmv");
        $this->registerMethod("getUser");
    	$this->registerMethod("getUserList");
  		$this->registerMethod("deleteUser");
        $this->registerMethod("getPrivilegesByRoleFilterHomedirs");
        $this->registerMethod("enumerateSharedFolders");
        $this->registerMethod("getSharedFoldersListFilterHomedirs");
        $this->registerMethod("getPrivilegesFilterGroups");
        $this->registerMethod("deleteShareandSMB");
        $this->registerMethod("setShareandSMB");
        $this->registerMethod("getShare");
        $this->registerMethod("getShareCandidates");
        $this->registerMethod("tailscale_update_version");
        $this->registerMethod("tailscale_check_version");
        $this->registerMethod("getExternalDisksList");
		$this->registerMethod("getExternalDisksListBg");
        $this->registerMethod("enumerateDevices");
        $this->registerMethod("getUSBFileSystemsList");
		$this->registerMethod("getUSBFileSystemsListBg");
        $this->registerMethod("enumerateUSBFilesystems");
        $this->registerMethod("createFS");
        $this->registerMethod("ejectDisk");
        $this->registerMethod("deleteBackup");
        $this->registerMethod("getFormatCandidates");
        $this->registerMethod("getFormatCandidatesBg");
        $this->registerMethod("jellyfin_getusers");
        $this->registerMethod("get_pin_jellyfin");
        $this->registerMethod("setWirelessIface");
        $this->registerMethod("getWirelessIface");
        $this->registerMethod("getInterface");
        $this->registerMethod("getHotspotStatus");
        $this->registerMethod("getSysInfo");
        $this->registerMethod("check_app_version");
        $this->registerMethod("getTraefikServiceStatus");
        $this->registerMethod("traefik_check_version");
        $this->registerMethod("traefik_get_latest_version");
        $this->registerMethod("joplin_getusers");
        $this->registerMethod("getHostname");
        $this->registerMethod("immich_delete_thumbnails");
    }



public function jellyfin_backup_execute($params, $context) {
    $output_err = "";
    $cmdArgs = [];

    // Validate the RPC caller context.
    $this->validateMethodContext($context, [
        "role" => OMV_ROLE_ADMINISTRATOR
    ]);

    $this->validateMethodParams($params, "rpc.homecloud.joplin_backup_execute");

    // Get the username who invoked this function
    $username = $context['username'];
    
    // Get the primary group of the user
    $userInfo = posix_getpwnam($username);
    if ($userInfo === false) {
        throw new \OMV\Exception(
            "Failed to get user information for '{$username}'"
        );
    }
    // Get group name from group ID
    $groupInfo = posix_getgrgid($userInfo['gid']);
    if ($groupInfo === false) {
        throw new \OMV\Exception(
            "Failed to get group information for user '{$username}'"
        );
    }
    $groupname = $groupInfo['name'];

return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
    use ($params,$username,$groupname) {
    // Create Process with mount path, username, and group name
    $output_err="";
    $cmdArgs = [];
    $cmdArgs[]='echo "starting backup....";';
    $cmdArgs[]='export MOUNT_PATH='.escapeshellarg(trim($params["mount_path"])).';';
    $cmdArgs[]='export USER='.escapeshellarg(trim($username)).';';
    $cmdArgs[]='export GROUP='.escapeshellarg(trim($groupname)).';';
    $cmdArgs[]='/sbin/jellyfin_backup_execute.sh $MOUNT_PATH $USER $GROUP';
    $cmd = new \OMV\System\Process("sudo", $cmdArgs);
    $cmd->setEnv("SHELL", "/bin/sh");
    $cmd->setRedirect2to1();
    if (0 !== ($exitStatus = $this->exec($cmd, $output,
        $bgOutputFilename))) {
        throw new \OMV\ExecException($cmd,$output, $exitStatus);
        }

        return $output;
      });
}

public function getHostname($params, $context) {
    // Validate the RPC caller context.
    $this->validateMethodContext($context, [
        "role" => OMV_ROLE_ADMINISTRATOR
    ]);
    
    $context = stream_context_create([
        "http" => [
            "ignore_errors" => true,
            "timeout" => 10
        ],
        "ssl" => [
            "verify_peer" => false,
            "verify_peer_name" => false
        ]
    ]);
    
    $response = file_get_contents("https://127.0.0.1:5000/get_hostname", false, $context);
    $data = json_decode($response, true);
    
    return ["hostname" => $data["hostname"]];
}


public function getHotspotStatus($params, $context) {
    // Validate the RPC caller context.
    $this->validateMethodContext($context, [
        "role" => OMV_ROLE_ADMINISTRATOR
    ]);
    
    $result = [
        "active" => "Inactive",
        "ssid" => "",
        "dnsmasq_running" => false,
        "hostapd_running" => false,
        "wlan0_ip" => "",
        "expected_ip" => ""
    ];
    
    try {
        // Check if dnsmasq service is running
        $cmd = new \OMV\System\Process("systemctl", ["is-active", "dnsmasq.service"]);
        try {
            $dnsmasq_output = [];
            $cmd->execute($dnsmasq_output);
            $dnsmasq_status = implode("", $dnsmasq_output);
            $result["dnsmasq_running"] = (trim($dnsmasq_status) === "active");
        } catch (\Exception $e) {
            $result["dnsmasq_running"] = false;
        }
        
        // Check if hostapd service is running
        $cmd = new \OMV\System\Process("systemctl", ["is-active", "hostapd.service"]);
        try {
            $hostapd_output = [];
            $cmd->execute($hostapd_output);
            $hostapd_status = implode("", $hostapd_output);
            $result["hostapd_running"] = (trim($hostapd_status) === "active");
        } catch (\Exception $e) {
            $result["hostapd_running"] = false;
        }
        
        // Get expected IP from dnsmasq.conf
        $expected_ip = "";
        if (file_exists('/etc/dnsmasq.conf')) {
            $dnsmasq_content = file_get_contents('/etc/dnsmasq.conf');
            if (preg_match('/listen-address=.*,([0-9.]+)/', $dnsmasq_content, $matches)) {
                $expected_ip = $matches[1];
                $result["expected_ip"] = $expected_ip;
            }
        }
        
        // Check wlan0 IP address
        $cmd = new \OMV\System\Process("ip", ["addr", "show", "wlan0"]);
        try {
            $ip_output = [];
            $cmd->execute($ip_output);
            $ip_output_str = implode("\n", $ip_output);
            if (preg_match('/inet ([0-9.]+)\//', $ip_output_str, $matches)) {
                $result["wlan0_ip"] = $matches[1];
            }
        } catch (\Exception $e) {
            // wlan0 interface might not exist or have IP
        }
        
        // Check iwconfig for Master mode and get SSID
        $cmd = new \OMV\System\Process("iwconfig", ["wlan0"]);
        try {
            $iwconfig_output = [];
            $cmd->execute($iwconfig_output);
            $iwconfig_output_str = implode("\n", $iwconfig_output);
            
            // Get SSID from hostapd configuration
            if (file_exists('/etc/hostapd/hostapd.conf')) {
                $hostapd_content = file_get_contents('/etc/hostapd/hostapd.conf');
                if (preg_match('/ssid=(.+)/', $hostapd_content, $matches)) {
                    $result["ssid"] = trim($matches[1]);
                }
            }
            
            // Determine if hotspot is active based on all conditions
            $ip_matches = ($result["wlan0_ip"] === $expected_ip && !empty($expected_ip));
            $services_running = ($result["dnsmasq_running"] && $result["hostapd_running"]);
            $master_mode = (strpos($iwconfig_output_str, 'Mode:Master') !== false);
            
            // Debug: Log the status for troubleshooting
            error_log("Hotspot debug - dnsmasq: " . ($result["dnsmasq_running"] ? "true" : "false") . 
                     ", hostapd: " . ($result["hostapd_running"] ? "true" : "false") . 
                     ", IP match: " . ($ip_matches ? "true" : "false") . 
                     ", Master mode: " . ($master_mode ? "true" : "false"));
            
            if ($services_running && $ip_matches && $master_mode) {
                $result["active"] = "Active";
            }
            
        } catch (\Exception $e) {
            // iwconfig might fail if wlan0 doesn't exist
            error_log("iwconfig error: " . $e->getMessage());
        }
        
        return $result;
        
    } catch (\Exception $e) {
        error_log("Error checking hotspot status: " . $e->getMessage());
        return $result;
    }
}


    
    /**
     * Delete Immich thumbnails to free up space
     * @param params The method parameters.
     * @param context The context of the caller.
     * @return Array containing status information.
     */
    
    public function immich_delete_thumbnails($params, $context) {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        
        $result = [
            "success" => false,
            "space_freed" => 0,
            "message" => ""
        ];
        
        try {
            // Check if Immich .env file exists
            $env_file = '/etc/immich/.env';
            if (!file_exists($env_file)) {
                $result["message"] = "Immich not deployed or .env file missing";
                return $result;
            }
            
            // Read the .env file
            $env_content = file_get_contents($env_file);
            $upload_location = null;
            
            // Find UPLOAD_LOCATION in the file
            if (preg_match('/UPLOAD_LOCATION=([^\n]+)/', $env_content, $matches)) {
                $upload_location = trim($matches[1]);
            }
            
            if (empty($upload_location)) {
                $result["message"] = "UPLOAD_LOCATION not found in Immich configuration";
                return $result;
            }
            
            // Append /thumbs to the upload location
            $thumbs_dir = rtrim($upload_location, '/') . '/thumbs';
            
            // Check if the directory exists
            if (!is_dir($thumbs_dir)) {
                $result["message"] = "Thumbnails directory not found: " . $thumbs_dir;
                return $result;
            }
            
            // Get the size of the thumbnails directory
            $cmd = new \OMV\System\Process("du", ["-sb", $thumbs_dir]);
            $cmd->execute($output);
            $size_output = implode("", $output);
            $size_parts = explode("\t", $size_output);
            $space_used = intval($size_parts[0]);
            
            // Delete the contents of the thumbnails directory
            $cmd = new \OMV\System\Process("find", [$thumbs_dir, "-type", "f", "-delete"]);
            $cmd->execute();
            
            // Also delete subdirectories but keep the main directory
            $cmd = new \OMV\System\Process("find", [$thumbs_dir, "-mindepth", "1", "-type", "d", "-exec", "rm", "-rf", "{}", "\\;"]);
            $cmd->execute();
            
            // Set success result
            $result["success"] = true;
            $result["space_freed"] = $space_used;
            $result["message"] = "Successfully deleted thumbnails, freed " . 
                $this->formatBytes($space_used);
            
            return $result;
        } catch (\Exception $e) {
            $result["message"] = "Error deleting thumbnails: " . $e->getMessage();
            return $result;
        }
    }
    
    /**
     * Helper function to format bytes into human-readable format
     */
    private function formatBytes($bytes, $precision = 2) {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
    

    public function get_backup_size_jellyfin($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Validate the parameters of the RPC service method.
		//$this->validateMethodParams($params, "rpc.homecloud.getImmichServiceStatus");

        // Get the output from the tatus script
        
        $cmd = new \OMV\System\Process("/sbin/jellyfin_backup_calculate_size.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }


    /**
     * Get system information including warranty details.
     * @param params The method parameters.
     * @param context The context of the caller.
     * @return Array containing system information with warranty details.
     */
    public function getSysInfo($params, $context) {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        
        $result = [
            "serial_number" => "",
            "purchase_date" => "",
            "storage" => "",
            "warranty_status" => "Unknown",
            "hardware_version" => "",
            "total_memory" => "",
            "cpu_cores" => "",
            "software_version" => ""
        ];
        
        try {
            // Get total memory
            $meminfo = file_get_contents('/proc/meminfo');
            if (preg_match('/MemTotal:\s+(\d+) kB/', $meminfo, $matches)) {
                $total_memory_kb = $matches[1];
                $total_memory_gb = round($total_memory_kb / 1024 / 1024, 1);
                $result["total_memory"] = $total_memory_gb . " GB";
            }
            
            // Get CPU cores
            $cpu_info = file_get_contents('/proc/cpuinfo');
            $cpu_cores = substr_count($cpu_info, 'processor');
            $result["cpu_cores"] = (string)$cpu_cores;
            
            // Get software versions from both packages
            $omv_version = shell_exec("dpkg-query -W --showformat='\${Version}' openmediavault 2>/dev/null");
            $homecloud_version = shell_exec("dpkg-query -W --showformat='\${Version}' homecloud 2>/dev/null");
            
            $omv_ver = ($omv_version !== null && trim($omv_version) !== '') ? trim($omv_version) : "Unknown";
            $homecloud_ver = ($homecloud_version !== null && trim($homecloud_version) !== '') ? trim($homecloud_version) : "Unknown";
            
            $result["software_version"] = $omv_ver . ":" . $homecloud_ver;
            
            // Check if warranty file exists
            $warranty_file = '/boot/warranty.json';
            if (file_exists($warranty_file)) {
                // Read warranty information from file
                $warranty_content = file_get_contents($warranty_file);
                $warranty_data = json_decode($warranty_content, true);
                
                if ($warranty_data) {
                    // Extract warranty information
                    $result["serial_number"] = isset($warranty_data["serial_number"]) ? $warranty_data["serial_number"] : "";
                    $result["purchase_date"] = isset($warranty_data["purchase_date"]) ? $warranty_data["purchase_date"] : "";
                    $result["storage"] = isset($warranty_data["storage"]) ? $warranty_data["storage"] : "";
                    $result["hardware_version"] = isset($warranty_data["hardware_version"]) ? $warranty_data["hardware_version"] : "";

                    // Calculate warranty status
                    if (!empty($result["purchase_date"])) {
                        $purchase_date = new \DateTime($result["purchase_date"]);
                        $today = new \DateTime();
                        
                        // If purchase date is in the future, it's not valid yet
                        if ($purchase_date > $today) {
                            $result["warranty_status"] = "Not Valid Yet";
                        } else {
                            // Add 1 year to purchase date to get warranty end date
                            $warranty_end = clone $purchase_date;
                            $warranty_end->modify('+1 year');
                            
                            // If today is before warranty end date, it's in warranty
                            if ($today <= $warranty_end) {
                                $result["warranty_status"] = "In Warranty";
                            } else {
                                $result["warranty_status"] = "Out of Warranty";
                            }
                        }
                    }
                }
            }
            return $result;
        } catch (\Exception $e) {
            // Log error but return default result
            error_log("Error getting system information: " . $e->getMessage());
            return $result;
        }
    }

    public function check_app_version($params, $context) {
        $this->validateMethodContext($context, ["role" => OMV_ROLE_ADMINISTRATOR]);
        $this->validateMethodParams($params, "rpc.homecloud.check_app_version");

        $cmd = new \OMV\System\Process("/sbin/app_versions.py ", [$params['appname']]);
        $cmd->setEnv("SHELL", "/bin/sh");
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    
   /**
     * Returns disks without filesystem and not part of any volumegroups.
     */
    public function getFormatCandidates($params, $context) {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
    
        // Get a list of all potential usable devices.
        if (FALSE === ($devs = \OMV\System\Storage\StorageDevice::enumerateUnused()))
            throw new \OMV\Exception("Failed to get list of unused devices.");
    
        // Get a list of all detected file systems.
        $filesystems = \OMV\System\Filesystem\Filesystem::getFilesystems();
    
        // Get the list of device files that are occupied by a file system.
        $usedDevs = [];
        foreach ($filesystems as $filesystemk => $filesystemv) {
            $usedDevs[] = $filesystemv->getParentDeviceFile();
            // Check if the file system uses multiple devices, e.g.
            // a BTRFS RAID, and add them.
            if ($filesystemv->hasMultipleDevices()) {
                $usedDevs = array_merge($filesystemv->getDeviceFiles(), $usedDevs);
            }
        }
    
        // Helper functions to extract major/minor device numbers
        if (!function_exists('major')) {
            function major($dev) {
                return ($dev >> 8) & 0xfff;
            }
        }
        if (!function_exists('minor')) {
            function minor($dev) {
                return ($dev & 0xff) | (($dev >> 12) & 0xfff00);
            }
        }
    
        // Get list of devices that are part of LVM physical volumes and their parent disks
        $pvDevices = [];
        try {
            // Get all PV device paths using pvs
            $cmd = new \OMV\System\Process("pvs --noheadings -o pv_name");
            $cmd->execute($output);
    
            $majorMinorMap = [];
    
            // Build map of all block devices major:minor => device path
            foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator("/dev")) as $file) {
                $path = $file->getPathname();
            
                if (filetype($path) !== "block") {
                    continue;
                }
            
                $stat = @stat($path);
                if (!$stat) {
                    continue;
                }
            
                $devNum = $stat['rdev'];
                $maj = major($devNum);
                $min = minor($devNum);
                $devKey = sprintf("%d:%d", $maj, $min);
                $majorMinorMap[$devKey] = $path;
            }
            
    
            foreach ($output as $line) {
                $pvPath = trim($line);
                if (!file_exists($pvPath)) {
                    continue;
                }
                $realPvPath = realpath($pvPath);
                if ($realPvPath) {
                    $pvDevices[] = $realPvPath;
    
                    // Use udevadm to find the parent disk major:minor
                    $cmd2 = new \OMV\System\Process("udevadm info -q property -n " . escapeshellarg($realPvPath));
                    $cmd2->execute($udevOutput);
    
                    foreach ($udevOutput as $udevLine) {
                        if (preg_match('/^ID_PART_ENTRY_DISK=([0-9]+:[0-9]+)/', $udevLine, $matches)) {
                            $parentDev = $matches[1];
                            if (isset($majorMinorMap[$parentDev])) {
                                $parentPath = realpath($majorMinorMap[$parentDev]);
                                if ($parentPath) {
                                    $pvDevices[] = $parentPath;
                                }
                            }
                        }
                    }
                }
            }
    
            $pvDevices = array_unique($pvDevices);
            error_log("Excluding LVM PVs and parent disks: " . print_r($pvDevices, true));
    
        } catch (\Exception $e) {
            error_log("LVM PV detection failed: " . $e->getMessage());
        }
    
        // Prepare the result list.
        $result = [];
        foreach ($devs as $devk => $devv) {
            // Get the storage device object for the specified device file.
            $sd = \OMV\System\Storage\StorageDevice::getStorageDevice($devv);
            if (is_null($sd) || !$sd->exists())
                continue;
    
            // Skip read-only devices like CDROM.
            if (TRUE === $sd->isReadOnly())
                continue;
    
            // Skip devices that are part of LVM physical volumes or their parents
            $deviceFile = $sd->getDeviceFile();
            $canonicalDeviceFile = $sd->getCanonicalDeviceFile();
            if (in_array($deviceFile, $pvDevices, true) || in_array($canonicalDeviceFile, $pvDevices, true)) {
                continue;
            }
    
            // Does this device already contain a file system?
            if (in_array($sd->getCanonicalDeviceFile(), $usedDevs, true))
                continue;
    
            // The device is a potential candidate to create a file system on it.
            $result[] = [
                "devicefile" => $sd->getDeviceFile(),
                "size" => $sd->getSize(),
                "description" => $sd->getDescription()
            ];
        }
        return $result;
    }
    
    /**
	 * Get a network interface configuration object.
	 * @param params An array containing the following fields:
	 *   \em uuid The UUID of the configuration object.
	 * @param context The context of the caller.
	 * @return The requested configuration object.
	 */
	function getInterface($params, $context) {
		// Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
		// Validate the parameters of the RPC service method.
		#$this->validateMethodParams($params, "rpc.common.objectuuid");
		// Get the configuration object.
		$db = \OMV\Config\Database::getInstance();
		$object = $db->get("conf.system.network.interface", $params['uuid']);
		// Modify the generic network interface configuration data.
		// Other interface type related data must be modified separately.
		$result = $object->getAssoc();
		$result['dnsnameservers'] = str_replace(" ", ",",
			$result['dnsnameservers']);
		$result['dnssearch'] = str_replace(" ", ",", $result['dnssearch']);
		$result['slaves'] = explode_safe(",", $result['slaves']);
		return $result;
	}

	/**
	 * Helper function to store the interface configuration object.
	 * @param params The method parameters.
	 * @param ifaceParams The object containing the specific interface
	 *   attributes.
	 * @return The configuration object.
	 */
    private function setInterfaceConfig($params, $ifaceParams) {
		// Modify various configuration attributes.
		$params['dnsnameservers'] = implode(" ", explode_csv(
		    $params['dnsnameservers']));
		$params['dnssearch'] = implode(" ", explode_csv(
		    $params['dnssearch']));
		// Prepare the configuration object.
		$object = new \OMV\Config\ConfigObject("conf.system.network.interface");
		$object->setAssoc($params);
		$object->setAssoc($ifaceParams);
		// Set the configuration object.
		$db = \OMV\Config\Database::getInstance();
		if (TRUE === $object->isNew()) {
			// Check uniqueness.
			$db->assertIsUniqueByFilter($object, [
				"operator" => "and",
				"arg0" => [
					"operator" => "stringEquals",
					"arg0" => "type",
					"arg1" => $object->get("type")
				],
				"arg1" => [
					"operator" => "stringEquals",
					"arg0" => "devicename",
					"arg1" => $object->get("devicename")
				]
			]);
		}
		$db->set($object);
		// Return the configuration object.
		return $object->getAssoc();
	}
    
    /**
     * Set (add/update) a wireless network interface configuration object.
     * @param params The method parameters.
     * @param context The context of the caller.
     * @return The stored configuration object.
     * removes hotspot configuration
     */
    function setWirelessIface($params, $context) {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        // Validate the network interface specific parameters of the
        // RPC service method.
        $this->validateMethodParams($params, "rpc.network.setwirelessiface");
        // Delete hotspot flag file if it exists
        $hotspot_flag_file = '/var/lib/hotspot_active';
        if (file_exists($hotspot_flag_file)) {
            unlink($hotspot_flag_file);
        }
        // Set the configuration object.
        $result = $this->setInterfaceConfig($params, [
            "type" => "wifi",
            "wpassid" => $params['wpassid'],
            "wpapsk" => $params['wpapsk'],
            "keymanagement" => $params['keymanagement'],
            "hidden" => $params['hidden']
        ]);

        // Stop and disable hotspot-related services
        try {
            // Stop and disable hostapd service
            $cmd = new \OMV\System\Process("systemctl", ["stop", "hostapd.service"]);
            $cmd->execute();
            $cmd = new \OMV\System\Process("systemctl", ["disable", "hostapd.service"]);
            $cmd->execute();
            
            // Stop and disable dnsmasq service
            $cmd = new \OMV\System\Process("systemctl", ["stop", "dnsmasq.service"]);
            $cmd->execute();
            $cmd = new \OMV\System\Process("systemctl", ["disable", "dnsmasq.service"]);
            $cmd->execute();
            
            // Stop and disable hotspot-ip service if it exists
            if (file_exists("/etc/systemd/system/hotspot-ip.service")) {
                $cmd = new \OMV\System\Process("systemctl", ["stop", "hotspot-ip.service"]);
                $cmd->execute();
                $cmd = new \OMV\System\Process("systemctl", ["disable", "hotspot-ip.service"]);
                $cmd->execute();
            }
        } catch (\Exception $e) {
            // Log error but continue with interface configuration
            error_log("Error stopping hotspot services: " . $e->getMessage());
        }
        // Apply changes using omv-salt
        
        try {
            $cmd = new \OMV\System\Process("omv-salt", ["deploy", "run", "systemd-networkd"]);
            $cmd->execute();
            error_log("Network configuration applied successfully");
        } catch (\Exception $e) {
            error_log("Error applying network configuration: " . $e->getMessage());
        }
        return $result;


    }

    /**
	 * Get all configured network interfaces devices.
	 * @param params The method parameters.
	 * @param context The context of the caller.
	 * @return A list of applicable network interfaces devices.
	 */
	function enumerateConfiguredDevices($params, $context) {
		// Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
		// Get all network interface configuration objects.
		$db = \OMV\Config\Database::getInstance();
		$objects = $db->get("conf.system.network.interface");
		// Now get the network interface configuration objects.
		$result = [];
		foreach ($objects as $objectk => $objectv) {
			$objectAssoc = $objectv->getAssoc();
			// Is the ethernet interface device somewhere referenced?
			$objectAssoc['_used'] = $db->isReferenced($objectv);
			$objectAssoc['_readonly'] = FALSE;
			// Check if it is used by a bonding interface.
			if ($db->exists("conf.system.network.interface", [
				"operator" => "and",
				"arg0" => [
					"operator" => "stringEquals",
					"arg0" => "type",
					"arg1" => "bond"
				],
				"arg1" => [
					"operator" => "stringContains",
					"arg0" => "slaves",
					"arg1" => $objectv->get("devicename")
				]
			])) {
				$objectAssoc['_used'] = TRUE;
				$objectAssoc['_readonly'] = TRUE;
			}
			$objectAssoc['slaves'] = explode_safe(",", $objectAssoc['slaves']);
			$result[] = $objectAssoc;
		}
		return $result;
	}

	/**
	 * Get all network interface configuration objects. Note, only the
	 * generic interface attributes are converted from a string representation
	 * to their origin value type.
	 * @param params An array containing the following fields:
	 *   \em start The index where to start.
	 *   \em limit The number of objects to process.
	 *   \em sortfield The name of the column used to sort.
	 *   \em sortdir The sort direction, ASC or DESC.
	 * @param context The context of the caller.
	 * @return An array containing the requested objects. The field \em total
	 *   contains the total number of objects, \em data contains the object
	 *   array. An exception will be thrown in case of an error.
	 */
	function getInterfaceList($params, $context) {
		// Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
		// Validate the parameters of the RPC service method.
		$this->validateMethodParams($params, "rpc.common.getlist");
		// Get all network interface configuration objects.
		$result = $this->callMethod("enumerateConfiguredDevices",
		  $params, $context);

		/**new code-Additional call to pull field values to be displayed on datatable page--start**/
		$resultn=[];
		$resultf=[];
		foreach ($result as $key=>$item) {

			$resultn[$key] = $this->getIfaceInfo($item['devicename']);
			$resultf[$key]=$item;
			if ($result[$key]['address'] === ''){
				$resultf[$key]['address']=$resultn[$key]['address'];
			}
			if ($result[$key]['address6'] === ''){
				$resultf[$key]['address6']=$resultn[$key]['address6'];
			}
			if ($result[$key]['gateway'] === ''){
				$resultf[$key]['gateway']=$resultn[$key]['gateway'];
			}
			if ($result[$key]['gateway6'] === ''){
				$resultf[$key]['gateway6']=$resultn[$key]['gateway6'];
			}
			if ($result[$key]['mtu'] === ''){
				$resultf[$key]['mtu']=$resultn[$key]['mtu'];
			}
			if ($result[$key]['netmask'] === ''){
				$resultf[$key]['netmask']=$resultn[$key]['netmask'];
			}
			if ($result[$key]['netmask6'] === ''){
				$resultf[$key]['netmask6']=$resultn[$key]['netmask6'];
			}

		}


		/**new code-Additional call to pull field values to be displayed on datatable page--end**/

		// Filter the result.
		return $this->applyFilter($resultf, $params['start'],
		  $params['limit'], $params['sortfield'], $params['sortdir']);


	}

    /**
	 * Get a wireless network interface configuration object.
	 * @param params An array containing the following fields:
	 *   \em uuid The UUID of the configuration object.
	 * @param context The context of the caller.
	 * @return The requested configuration object.
	 */
    function getWirelessIface($params, $context) {
		return $this->callMethod("getInterface", $params, $context);
	}

	public function getFormatCandidatesBg($params, $context) {
		return $this->callMethodBg("getFormatCandidates", $params, $context);
	}

    /**
     * Eject a disk by removing all associated shared folders.
     * @param params An array containing the following fields:
     *   \em devicefile The device file to eject, e.g. /dev/sdc.
     * @param context The context of the caller.
     * @return An array with the status of the operation.
     * @throw \OMV\Exception
     */
    public function ejectDisk($params, $context) {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        
        // Validate the parameters of the RPC service method.
        $this->validateMethodParams($params, "rpc.homecloud.ejectdisk");
        
        $devicefile = $params['devicefile'];
        $removedShares = [];
        $unmountedFilesystems = [];
        
        try {
            // Get all shared folders
            $sharedFoldersParams = [
                "start" => 0,
                "limit" => -1,
                "sortfield" => "name",
                "sortdir" => "ASC"
            ];
            
            // Get the list of shared folders
            $sharedFolders = $this->callMethod("getSharedFoldersListFilterHomedirs", 
                $sharedFoldersParams, $context);
            
            if (isset($sharedFolders['data']) && is_array($sharedFolders['data'])) {
                // Iterate through all shared folders
                foreach ($sharedFolders['data'] as $sharedFolder) {
                    // Check if the shared folder is on the device we want to eject
                    if (isset($sharedFolder['mntent']['devicefile']) && 
                        strpos($sharedFolder['mntent']['devicefile'], $devicefile) === 0) {
                        
                        // Get the UUID of the shared folder
                        $uuid = $sharedFolder['uuid'];
                        
                        // Delete the shared folder and its SMB share
                        $this->callMethod("deleteShareandSMB", ["uuid" => $uuid,"recursive" => false], $context);
                        
                        // Add to the list of removed shares
                        $removedShares[] = [
                            "uuid" => $uuid,
                            "name" => $sharedFolder['name'],
                            "devicefile" => $sharedFolder['mntent']['devicefile']
                        ];
                    }
                }
            }
            
            // Get all USB filesystems
            $fileSystemsParams = [
                "start" => 0,
                "limit" => -1,
                "sortfield" => "status",
                "sortdir" => "ASC"
            ];
            
            // Get the list of USB filesystems
            $fileSystems = $this->callMethod("getUSBFileSystemsList", $fileSystemsParams, $context);
            
            if (isset($fileSystems['data']) && is_array($fileSystems['data'])) {
                // Iterate through all filesystems
                foreach ($fileSystems['data'] as $fileSystem) {
                    // Check if the filesystem is on the device we want to eject
                    if (isset($fileSystem['parentdevicefile']) && 
                        $fileSystem['parentdevicefile'] === $devicefile) {
                        
                        // Get the UUID of the filesystem
                        $fsUuid = $fileSystem['uuid'];
                        
                        if (!empty($fsUuid)) {
                            // Unmount the filesystem using FileSystemMgmt RPC
                            $rpcParams = ["id" => $fsUuid];
                            \OMV\Rpc\Rpc::call("FileSystemMgmt", "umount", $rpcParams, $context);
                            
                            // Add to the list of unmounted filesystems
                            $unmountedFilesystems[] = [
                                "uuid" => $fsUuid,
                                "devicefile" => $fileSystem['devicefile'],
                                "label" => $fileSystem['label']
                            ];
                        }
                    }
                }
            }
            
            // Return success with list of removed shares and unmounted filesystems
            return [
                "success" => true,
                "removedShares" => $removedShares,
                "unmountedFilesystems" => $unmountedFilesystems,
                "message" => count($removedShares) . " shared folder(s) removed and " . 
                    count($unmountedFilesystems) . " filesystem(s) unmounted. Device ejected successfully."
            ];
            
        } catch (\Exception $e) {
            return [
                "success" => false,
                "removedShares" => $removedShares,
                "unmountedFilesystems" => $unmountedFilesystems,
                "message" => "Error ejecting device: " . $e->getMessage()
            ];
        }
    }



	/**
	 * Helper function to get information about the given file system.
	 */
	private function getFsInfo($fs = NULL, $fsb = NULL) {
		$result = [
			"devicename" => "",
			"devicefile" => "",
			"predictabledevicefile" => "",
			"canonicaldevicefile" => "",
			"parentdevicefile" => "",
			"devlinks" => [],
			"uuid" => "",
			"label" => "",
			"type" => "",
			"blocks" => "-1", // as string
			"mounted" => FALSE,
			"mountpoint" => "",
			"used" => "-1", // as string
			"available" => "-1", // as string
			"size" => "-1", // as string
			"percentage" => -1,
			"description" => "",
			"propposixacl" => "",
			"propquota" => "",
			"propresize" => "",
			"propfstab" => "",
			"propcompress" => "",
			"propautodefrag" => "",
			"hasmultipledevices" => "",
			"devicefiles" => [],
			"comment" => "",
			"_readonly" => FALSE,
			"_used" => FALSE
		];
		if (!is_null($fs) && $fs->exists()) {
			$result = array_merge($result, [
				"devicename" => $fs->getDeviceName(),
				"devicefile" => $fs->getPreferredDeviceFile(),
				"predictabledevicefile" => $fs->getPredictableDeviceFile(),
				"canonicaldevicefile" => $fs->getCanonicalDeviceFile(),
				"parentdevicefile" => $fs->getParentDeviceFile(),
				"devlinks" => $fs->getDeviceFileSymlinks(),
				"mounted" => $fs->isMounted(),
				"uuid" => $fs->getUuid(),
				"label" => $fs->getLabel(),
				"type" => $fs->getType(),
				"description" => $fs->getDescription(),
				"hasmultipledevices" => $fs->hasMultipleDevices(),
				"devicefiles" => $fs->getDeviceFiles()
			]);
			if (TRUE === $result['mounted']) {
				if (FALSE !== ($fsStats = $fs->getStatistics())) {
					$result = array_merge($result, [
						"used" => binary_format($fsStats['used']),
						"available" => $fsStats['available'],
						"percentage" => $fsStats['percentage'],
						"blocks" => $fsStats['blocks'],
						"mountpoint" => $fsStats['mountpoint'],
						"size" => $fsStats['size']
					]);
				}
			}
		};
		if (!is_null($fsb)) {
			$result = array_merge($result, [
				"propposixacl" => $fsb->hasPosixAclSupport(),
				"propquota" => $fsb->hasQuotaSupport(),
				"propresize" => $fsb->hasResizeSupport(),
				"propfstab" => $fsb->hasFstabSupport(),
				"propreadonly" => $fsb->hasReadOnlySupport(),
				"propcompress" => $fsb->hasCompressSupport(),
				"propautodefrag" => $fsb->hasAutoDefragSupport()
			]);
		}
		return $result;
	}

	/**
	 * Helper function to get the mount point configuration object.
	 */
	private function getMountPointConfigObject($object) {
		// Check if the file system is in use. First try to get the
		// corresponding mount point configuration object. Query the
		// database for all device files that exist for the given
		// file system to increase the probability to find the mount
		// point configuration object.
		$fsNames = $object['devlinks'];
		$fsNames[] = $object['canonicaldevicefile'];
		if (TRUE === is_fs_uuid($object['uuid'])) {
			// To keep backward compatibility we need to search for
			// the file system UUID, too.
			$fsNames[] = $object['uuid'];
		}
		$db = \OMV\Config\Database::getInstance();
		$result = $db->getByFilter("conf.system.filesystem.mountpoint", [
			"operator" => "stringEnum",
			"arg0" => "fsname",
			// Remove duplicates and re-index the array.
			"arg1" => array_values(array_unique($fsNames))
		]);
		return empty($result) ? NULL : $result[0];
	}

	/**
	 * Helper function to check if the given file system is in use.
	 */
	private function hasMountPointConfigObject($object): bool {
		return !is_null($this->getMountPointConfigObject($object));
	}
    
	/**
	 * Enumerate all file systems that have been detected, except the
	 * file system containing the operation system.
	 * @param params The method parameters.
	 * @param context The context of the caller.
	 * @return An array of objects with the following fields: \em uuid,
	 *   \em devicefile, \em type, \em label, \em blocks, \em size,
	 *   \em mountpoint, \em blocks, \em used, \em available, \em description,
	 *   \em propposixacl, \em propquota, \em propresize, \em propfstab,
	 *   \em mounted and \em percentage. Additional the internal fields
	 *   \em _used and \em _readonly are set.
	 * @throw \OMV\Exception
	 */
	public function enumerateUSBFilesystems($params, $context) {
		// Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
		// Get list of all detected file systems.
		$filesystems = \OMV\System\Filesystem\Filesystem::getFilesystems();
		// Process the detected file systems and skip unwanted ones.
		$procs = [];
		foreach ($filesystems as $fs) {
			// Collect the file system information asynchronous.
			$procs[] = $this->asyncProc(function() use ($fs) {
				// Get the file system backend.
				$fsb = $fs->getBackend();
				if (is_null($fsb)) {
					throw new \OMV\Exception(
						"No file system backend set for '%s'.",
						$fs->getDeviceFile());
				}
				// Set default values.
				$object = $this->getFsInfo($fs, $fsb);
				// Check if the file system is in use by getting the mount
				// point configuration objects.
				$mpObject = $this->getMountPointConfigObject($object);
				// If such object exist, then check if it is referenced by
				// any other object, e.g. by a shared folder configuration
				// object.
				if (!is_null($mpObject)) {
					$db = \OMV\Config\Database::getInstance();
					$object['_used'] = $db->isReferenced($mpObject);
				}
				// Mark the device where the operating system is installed on
				// as used and read-only.
				if (\OMV\System\System::isRootDeviceFile($object['devicefile'])) {
					$object['_used'] = TRUE;
					$object['_readonly'] = TRUE;
				}
				return $object;
			});
		}
		return $this->waitAsyncProcs($procs);
	}



	/**
	 * Get the list of configured file systems.
	 * @param object $params An object containing the following fields:
	 *   \em start The index where to start.
	 *   \em limit The number of objects to process.
	 *   \em sortfield The name of the column used to sort.
	 *   \em sortdir The sort direction, ASC or DESC.
	 * @param object $context The context of the caller.
	 * @return array An array of objects with the following fields: \em uuid,
	 *   \em devicefile, \em type, \em label, \em blocks, \em size,
	 *   \em mountpoint, \em blocks, \em used, \em available,
	 *   \em description, \em mounted, \em percentage, \em status,
	 *   \em propposixacl, \em propquota, \em propresize and \em propfstab.
	 *   The field 'status' has the following meaning:<ul>
	 *   \li 1 - Online
	 *   \li 2 - Initializing in progress
	 *   \li 3 - Missing
	 *   </ul>
	 *  Additional the internal fields \em _used and \em _readonly are set.
	 * @ŧhrow \OMV\Exception
	 */
	public function getUSBFileSystemsList($params, $context) {
		// Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
		// Validate the parameters of the RPC service method.
		$this->validateMethodParams($params, "rpc.common.getlist");
		// Get a list of all detected file systems.
		$detectedFsObjects = $this->callMethod("enumerateUSBFilesystems",
			NULL, $context);
		// Try to detect file systems that are being initialized.
		$result = [];
		if (file_exists("/tmp")) {
			foreach (new \DirectoryIterator("/tmp") as $file) {
				if ($file->isDot())
					continue;
				if (!$file->isFile())
					continue;
				// Check if it is a file we are interested in. The filename
				// must look like omv-initfs@<device>.build, e.g.
				// omv-initfs@_dev_sdb.build
				$regex = '/^omv-initfs@.+\.build$/i';   
				if (1 !== preg_match($regex, $file->getFilename()))
					continue;
				$fileName = sprintf("/tmp/%s", $file->getFilename());
				// Read the file content and decode JSON data into an
				// associative array.
				$jsonFile = new \OMV\Json\File($fileName);
				$jsonFile->open("r");
				$fsInfo = $jsonFile->read();
				$jsonFile->close();
				// Check whether the file system initialization process has
				// been finished already. This is done by simply checking if
				// the device file is already in the list of detected file
				// systems. If this is the case, then unlink the file system
				// build file.
				$found = FALSE;
				foreach ($detectedFsObjects as $fsObjectk => $fsObjectv) {
					$fsNames = $fsObjectv['devlinks'];
					$fsNames[] = $fsObjectv['devicefile'];
					$fsNames[] = $fsObjectv['canonicaldevicefile'];
					if (in_array($fsInfo['devicefile'], $fsNames)) {
						$found = TRUE;
						break;
					}
				}
				if (TRUE === $found) {
					if (TRUE === $jsonFile->exists()) {
						$jsonFile->unlink();
					}
					continue;
				}
				// The file system creation is still in progress. Get as much
				// as possible information about the file system and append
				// them to the result list.
				$fsbMngr = \OMV\System\Filesystem\Backend\Manager::getInstance();
				$fsb = $fsbMngr->getBackendByType($fsInfo['type']);
				if (is_null($fsb)) {
					throw new \OMV\Exception(
						"No file system backend exists for '%s'.",
						$fsInfo['type']);
				}
				$result[] = array_merge($this->getFsInfo(NULL, $fsb), [
					"devicefile" => $fsInfo['devicefile'],
					"parentdevicefile" => $fsInfo['parentdevicefile'],
					"devicefiles" => [ $fsInfo['devicefile'] ],
					"label" => $fsInfo['label'],
					"type" => $fsInfo['type'],
					"status" => 2, // Initializing
				]);
			}
		}
		// Get the configured file systems except 'bind' and 'loop' devices.
		$db = \OMV\Config\Database::getInstance();
		$mntents = $db->getByFilter("conf.system.filesystem.mountpoint", [
			"operator" => "not",
			"arg0" => [
				"operator" => "or",
				"arg0" => [
					"operator" => "stringContains",
					"arg0" => "opts",
					"arg1" => "bind"
				],
				"arg1" => [
					"operator" => "stringContains",
					"arg0" => "opts",
					"arg1" => "loop"
				]
			]
		]);
		foreach ($mntents as $mntentk => $mntentv) {
			// Get the file system backend.
			$fsbMngr = \OMV\System\Filesystem\Backend\Manager::getInstance();
			$fsb = $fsbMngr->getBackendByType($mntentv->get("type"));
			if (is_null($fsb)) {
				throw new \OMV\Exception(
				  "No file system backend exists for '%s'.",
				  $mntentv->get("type"));
			}
			// Is the file system detected and online?
			// Iterate over all detected file systems and check if the
			// configured one is in the list.
			foreach ($detectedFsObjects as $fsObjectk => $fsObjectv) {
				$fsNames = $fsObjectv['devlinks'];
				$fsNames[] = $fsObjectv['devicefile'];
				$fsNames[] = $fsObjectv['canonicaldevicefile'];
				if (TRUE === is_fs_uuid($fsObjectv['uuid'])) {
					$fsNames[] = $fsObjectv['uuid'];
				}
				if (in_array($mntentv->get("fsname"), $fsNames)) {
					$result[] = array_merge($fsObjectv, [
						"comment" => $mntentv->get("comment"),
						"usagewarnthreshold" => $mntentv->get("usagewarnthreshold"),
						"mountopts" => $mntentv->get("opts"),
						"status" => 1 // Online
					]);
					continue 2;
				}
			}
			// The configured file system is not in the list of detected
			// file systems. Append all available file system information
			// to the result list and mark it as 'Missing'.
			$result[] = array_merge($this->getFsInfo(NULL, $fsb), [
				"devicefile" => is_devicefile($mntentv->get("fsname")) ?
					$mntentv->get("fsname") : "",
				"devicefiles" => is_devicefile($mntentv->get("fsname")) ?
					[ $mntentv->get("fsname") ] : [],
				"uuid" => is_uuid($mntentv->get("fsname")) ?
					$mntentv->get("fsname") : "",
				"type" => $mntentv->get("type"),
				"mountpoint" => $mntentv->get("dir"),
				"comment" => $mntentv->get("comment"),
				"usagewarnthreshold" => $mntentv->get("usagewarnthreshold"),
				"mountopts" => $mntentv->get("opts"),
				"status" => 3, // Missing
				"_used" => $db->isReferenced($mntentv)
			]);
		}

        $filteredResult = array_filter($result, function($fs) {
            // Check devicefile
            
            
            // Check canonicaldevicefile
            if (!empty($fs['canonicaldevicefile']) && 
                (strpos($fs['canonicaldevicefile'], '/dev/dm') !== FALSE || 
                strpos($fs['canonicaldevicefile'], '/dev/mmc') !== FALSE)) {
                return FALSE;
            }
            
            
            return TRUE;
        });
        
        // Reset array keys to ensure sequential indexing
        $result = array_values($filteredResult);
        
		// Filter result.
		return $this->applyFilter($result, $params['start'],
			$params['limit'], $params['sortfield'], $params['sortdir']);
	}


	/**
	 * Execute the getList() RPC as background process.
	 */
	public function getUSBFileSystemsListBg($params, $context) {
		return $this->callMethodBg("getUSBFileSystemsList", $params, $context);
	}


    /**
     * Create a file system on the given storage device.
     * @param params An array containing the following fields:
     *   \em devicefile The device file of the storage device on which
     *     the file system is to be created.
     *   \em type The file system to create, e.g. ext3 or xfs.
     * @param context The context of the caller.
     * @return The name of the background process status file.
     * @throw \OMV\Exception
     */
    public function createFS($params, $context) {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        // Validate the parameters of the RPC service method.
        $this->validateMethodParams($params, "rpc.filesystemmgmt.create");
        // Get the storage device object.
        $sd = \OMV\System\Storage\StorageDevice::assertGetStorageDevice(
            $params['devicefile']);
        // Get the storage device backend of the given device.
        $sdbMngr = \OMV\System\Storage\Backend\Manager::getInstance();
        $sdbMngr->assertBackendExists($sd->getDeviceFile());
        $sdb = $sdbMngr->getBackend($sd->getDeviceFile());
        // Get the corresponding file system backend.
        $fsbMngr = \OMV\System\Filesystem\Backend\Manager::getInstance();
        $fsbMngr->assertBackendExistsByType($params['type']);
        $fsb = $fsbMngr->getBackendByType($params['type']);
        // Get the file system device file name from the storage device
        // backend (this may differ depending on the storage device).
        $fsDeviceFile = $sdb->fsDeviceFile($sd->getDeviceFile());
        
        // Generate a label based on device model and partition number
        $deviceModel = $sd->getModel();
        // Clean up the model name to make it suitable for a label
        $deviceModel = preg_replace('/[^a-zA-Z0-9]/', '', $deviceModel);
        // Limit to 12 characters to ensure it fits in filesystem label limits
        $deviceModel = substr($deviceModel, 0, 12);
        
        // Extract partition number from device file
        $partitionNumber = '';
        if (preg_match('/(\d+)$/', $fsDeviceFile, $matches)) {
            $partitionNumber = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
        } else {
            $partitionNumber = '01'; // Default to 01 if no number found
        }
        
        // Create the label
        $fsLabel = $deviceModel . '-' . $partitionNumber;
        
        // Create a file that contains the details of the file system being
        // initialized. The file is parsed by the 'FileSystemMgmt.getList'
        // RPC to display the state of the file system initialization
        // process. There is no other way to detect file systems being
        // initialized (blkid detects them after the initialization has
        // been finished).
        $fileName = sprintf("/tmp/omv-initfs@%s.build", str_replace(
            "/", "_", $sd->getDeviceFile()));
        $jsonFile = new \OMV\Json\File($fileName);
        // Create the background process.
        return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
        use ($params, $sd, $sdb, $fsb, $fsDeviceFile, $jsonFile, $fsLabel) {
            // Create the file and write the file system information.
            $jsonFile->open("c");
            $jsonFile->write([
                "devicefile" => $fsDeviceFile,
                "parentdevicefile" => $sd->getDeviceFile(),
                "type" => $fsb->getType(),
                "label" => $fsLabel
            ]);
            $jsonFile->close();
            // Wipe all existing data on the storage device.
            $sd->wipe();
            // Create the partition if necessary.
            switch ($sdb->getType()) {
            case OMV_STORAGE_DEVICE_TYPE_SOFTWARERAID:
            case OMV_STORAGE_DEVICE_TYPE_DEVICEMAPPER:
            case OMV_STORAGE_DEVICE_TYPE_LOOPDEVICE:
                // No need to create a partition for those types.
                break;
            default:
                // Create a partition across the entire storage device.
                $cmdArgs = [];
                $cmdArgs[] = "--new=1:0:0";
                $cmdArgs[] = "--typecode=1:8300";
                $cmdArgs[] = "--print";
                $cmdArgs[] = escapeshellarg($sd->getDeviceFile());
                $cmd = new \OMV\System\Process("sgdisk", $cmdArgs);
                $cmd->setRedirect2to1();
                if (0 !== ($exitStatus = $this->exec($cmd, $output,
                        $bgOutputFilename))) {
                    throw new \OMV\ExecException($cmd, $output, $exitStatus);
                }
                break;
            }
            // Re-read the partition table.
            $cmdArgs = [];
            $cmdArgs[] = escapeshellarg($sd->getDeviceFile());
            $cmd = new \OMV\System\Process("partprobe", $cmdArgs);
            $cmd->setRedirect2to1();
            if (0 !== ($exitStatus = $this->exec($cmd, $output,
                    $bgOutputFilename))) {
                throw new \OMV\ExecException($cmd, $output, $exitStatus);
            }
            // We need to wait to give the kernel some time to re-read the
            // partition table and until the device file exists. Abort if
            // the device file does not exist after the specified time.
            $fsbd = new \OMV\System\BlockDevice($fsDeviceFile);
            $fsbd->waitForDevice(10);
            // Create the file system with the label.
            $cmdArgs = [];
            $cmdArgs[] = "-V";
            $cmdArgs[] = sprintf("-t %s", $fsb->getType());
            
            // Add label option based on filesystem type
            switch ($fsb->getType()) {
            case "ext4":
            case "ext3":
            case "ext2":
                $cmdArgs[] = sprintf("-L %s", escapeshellarg($fsLabel));
                break;
            case "xfs":
                $cmdArgs[] = sprintf("-L %s", escapeshellarg($fsLabel));
                break;
            case "jfs":
                $cmdArgs[] = sprintf("-L %s", escapeshellarg($fsLabel));
                break;
            case "vfat":
            case "fat":
                $cmdArgs[] = sprintf("-n %s", escapeshellarg($fsLabel));
                break;
            case "ntfs":
                $cmdArgs[] = sprintf("-L %s", escapeshellarg($fsLabel));
                break;
            }
            
            $cmdArgs[] = $fsb->getMkfsOptions($sd);
            $cmdArgs[] = escapeshellarg($fsbd->getDeviceFile());
            $cmd = new \OMV\System\Process("mkfs", $cmdArgs);
            $cmd->setRedirect2to1();
            if (0 !== ($exitStatus = $this->exec($cmd, $output,
                    $bgOutputFilename))) {
                throw new \OMV\ExecException($cmd, $output, $exitStatus);
            }
            // Notify configuration changes.
            $dispatcher = \OMV\Engine\Notify\Dispatcher::getInstance();
            $dispatcher->notify(OMV_NOTIFY_CREATE,
                "org.openmediavault.conf.system.filesystem", [
                    "devicefile" => $fsDeviceFile,
                    "parentdevicefile" => $sd->getDeviceFile(),
                    "type" => $fsb->getType(),
                    "label" => $fsLabel
                ]);
            return $output;
        }, NULL, function() use($jsonFile) {
            // Cleanup
            $jsonFile->unlink();
        });
    }



    /**
	 * Get list of candidates (file systems) that can be used for shared
	 * folders.
	 * @param params The method parameters.
	 * @param context The context of the caller.
	 * @return An array containing objects with the following fields:
	 *   \em uuid, and \em description. The field \em uuid is the UUID
	 *   from the mount point configuration object.
	 */
	public function getShareCandidates($params, $context) {
		// Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
		// Get a list of mount points, except bind mounts.
		$db = \OMV\Config\Database::getInstance();
		$objects = $db->getByFilter("conf.system.filesystem.mountpoint", [
			  "operator" => "not",
			  "arg0" => [
				  "operator" => "stringContains",
				  "arg0" => "opts",
				  "arg1" => "bind"
			  ]
		  ]);
		// Get the shared folder candidates.
		$result = [];
		foreach ($objects as $objectk => $objectv) {
			// Skip file systems that are not mounted at the moment. To find
			// out, just check if the given directory is a mount point.
			$mp = new \OMV\System\MountPoint($objectv->get("dir"));
			if (FALSE === $mp->isMountPoint())
				continue;
			// Get the file system implementation for the specified mount
			// point. Skip the mount point if no file system implementation
			// exists.
			$fs = \OMV\System\Filesystem\Filesystem::getImplByMountPoint(
				$objectv->get("dir"));
			if (TRUE === is_null($fs))
				continue;
			// Skip file systems that do not implement the required interface
			// to be handled as shared folder candidate.
			if (FALSE === ($fs instanceof
				\OMV\System\Filesystem\SharedFolderCandidateInterface))
				continue;
			// Populate the description property. Use the 'comment' property
			// of the mount point database configuration object, otherwise
			// the description delivered by the file system object.
			$description = $fs->getDescription();
			if (!empty($objectv->get("comment"))) {
				$description = sprintf("%s [%s]",
					$fs->getCanonicalDeviceFile(),
					$objectv->get("comment"));
			}
            
             // Try to get filesystem label using the filesystem implementation
            $fsLabel = $fs->getLabel();
            if (!empty($fsLabel)) {
                $description = sprintf("%s - %s", $fsLabel, $description);
            }

			// Append the shared folder candidate.
			$result[] = [
				"uuid" => $objectv->get("uuid"),
				"description" => $description
			];
		}
		return $result;
	}

    /**
	 * Get a shared folder configuration object.
	 * @param params An array containing the following fields:
	 *   \em uuid The UUID of the configuration object.
	 * @param context The context of the caller.
	 * @return The requested configuration object. The field \em mountpoint
	 *   is the directory where the corresponding filesystem is mounted.
	 */
	public function getShare($params, $context) {
		// Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
		// Validate the parameters of the RPC service method.
		$this->validateMethodParams($params, "rpc.common.objectuuid");
		// Get the configuration object.
		$db = \OMV\Config\Database::getInstance();
		$object = $db->get("conf.system.sharedfolder", $params['uuid']);
		// Get the mount point configuration object and add the mount point
		// to the returned shared folder configuration object.
		$meObject = $db->get("conf.system.filesystem.mountpoint",
		  $object->get("mntentref"));
		$object->add("mountpoint", "string");
		$object->set("mountpoint", $meObject->get("dir"));
		return $object->getAssoc();
	}

    /**
	 * Set (add/update) a shared folder config object.
	 * @param params An array containing the following fields:
	 *   \em uuid The UUID of the shared folder object.
	 *   \em name The name of the shared folder.
	 *   \em reldirpath The relative directory path.
	 *   \em comment The comment.
	 *   \em mntentref The UUID of the mount point configuration object
	 *     wherein the shared folder is located.
	 *   \em mode The file mode of the shared folder directory. This field
	 *     is optional. Defaults to 775.
	 * @param context The context of the caller.
	 * @return The stored configuration object.
	 */
	public function setShareandSMB($params, $context) {
		// Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
		// Validate the parameters of the RPC service method.
		$this->validateMethodParams($params, "rpc.sharemgmt.set");
		// The field 'reldirpath' may not contain the characters '..'. This
		// is because of security reasons: the given canonicalized absolute
		// path MUST be below the given mount point.
		if (1 == preg_match("/\.\./", $params['reldirpath'])) {
			throw new \InvalidArgumentException(sprintf(
				"The field '%s' contains forbidden two-dot symbols.",
				"reldirpath"));
		}
		// Prepare the configuration object. Use the name of the shared
		// folder as the relative directory name of the share.
		$object = new \OMV\Config\ConfigObject("conf.system.sharedfolder");
		$object->setAssoc($params, TRUE, TRUE);
		$object->set("reldirpath", build_path(DIRECTORY_SEPARATOR,
			...explode(DIRECTORY_SEPARATOR, $params['reldirpath'])).
			DIRECTORY_SEPARATOR);
		// Set the configuration object.
		$db = \OMV\Config\Database::getInstance();
		// Check uniqueness:
		// - The share name must be global unique because the name
		//   is also used when exporting a shared folder via NFS
		//   for example.
		$db->assertIsUnique($object, "name", sprintf(
			"A shared folder with the name '%s' already exists.",
			$object->get("name")));
		// - The mount directory must be unique on the same volume, too.
		$db->assertIsUniqueByFilter(
			$object,
			[
				"operator" => "and",
				"arg0" => [
					"operator" => "stringEquals",
					"arg0" => "mntentref",
					"arg1" => $object->get("mntentref")
				],
				"arg1" => [
					"operator" => "stringEquals",
					"arg0" => "reldirpath",
					"arg1" => $object->get("reldirpath")
				]
			],
			sprintf("A shared folder with the path '%s' already exists ".
				"for the specified file system.",
				$object->get("reldirpath"))
		);
		if (FALSE === $object->isNew()) {
			// Get the existing configuration object.
			$oldObject = $db->get("conf.system.sharedfolder",
				$object->getIdentifier());
			// Copy the privileges.
			if (FALSE === $oldObject->isEmpty("privileges")) {
				$object->set("privileges", $oldObject->get("privileges"));
			}
		}
		$db->set($object);
		// Append the file mode field to the notification object if set.
		// Defaults to 775.
		$object->add("mode", "string", "775");
		if (array_key_exists("mode", $params)) {
			$object->set("mode", $params['mode']);
		}
		// Get the mount point configuration object to build the absolute
		// shared folder path.
		$meObject = $db->get("conf.system.filesystem.mountpoint",
			$object->get("mntentref"));
		// Build the absolute shared folder path.
		$pathName = build_path(DIRECTORY_SEPARATOR, $meObject->get("dir"),
			$object->get("reldirpath"));
		// Create the shared folder directory if necessary.
		if (FALSE === file_exists($pathName)) {
			// Create the directory.
			switch ($meObject->get("type")) {
			case "btrfs":
				$parentDir = dirname($pathName);
				// Ensure the whole path exists, otherwise the Btrfs
				// subvolume can't be created.
				if (FALSE === is_dir($parentDir)) {
					if (FALSE === mkdir($parentDir, 0700, TRUE)) {
						throw new \OMV\Exception(
							"Failed to create the directory '%s': %s",
							$parentDir, last_error_msg());
					}
				}
				// Create the Btrfs subvolume.
				\OMV\System\Filesystem\Btrfs::createSubvolume($pathName);
				break;
			default:
				// Note, the `mkdir` function seems to have a bug when
				// using the mask parameter, e.g. `octdec("777")` does
				// not create the correct permissions as expected, thus
				// change the mode using chmod.
				if (FALSE === mkdir($pathName, 0700, TRUE)) {
					throw new \OMV\Exception(
						"Failed to create the directory '%s': %s",
						$pathName, last_error_msg());
				}
				break;
			}
			// Adapt the directory mode. Ignore errors because non posix FS will not support
            @chmod($pathName, octdec($object->get("mode")));
			//if (FALSE === chmod($pathName, octdec($object->get("mode")))) {
			//	throw new \OMV\Exception(
			//		"Failed to set file mode to '%s' for '%s': %s",
			//		$object->get("mode"), $pathName, last_error_msg());
			//}
		}
		// Change group owner of directory to the configured default
		// users group, e.g. 'users'.
		$defaultGroup = \OMV\Environment::get("OMV_USERMGMT_DEFAULT_GROUP",
			"users");
        //Ignore errors because non posix FS will not support
        @chgrp($pathName, $defaultGroup);

		//if (FALSE === chgrp($pathName, $defaultGroup)) {
		//	throw new \OMV\Exception(
		//		"Failed to set file group to '%s' for '%s': %s",
		//		$defaultGroup, $pathName, last_error_msg());
		//}
		// Set the setgid bit. Setting this permission means that all files
		// created in the folder will inherit the group of the folder rather
		// than the primary group of the user who creates the file.
		$mode = fileperms($pathName) | 02000;
        //Ignore errors because non posix FS will not support
        @chmod($pathName, $mode);

		//if (FALSE === chmod($pathName, $mode)) {
		//	throw new \OMV\Exception(
		//		"Failed to set file mode to '%o' for '%s': %s",
		//		$mode, $pathName, last_error_msg());
		//}
		// Walk through the directory path to make sure group 'users' can
		// access all subdirectories.
		// Example:
		// <sf_mount_dir>/<reldirpath>
		// <sf_mount_dir>
		//  |- dir1
		//  |  |- dir1.1
		//  |  '- dir1.2
		//  |     '- dir1.2.1
		//  '
		$parts = explode(DIRECTORY_SEPARATOR, trim($object->get("reldirpath"),
			DIRECTORY_SEPARATOR));
		array_pop($parts); // Remove last directory, this is already processed.
		if (count($parts) > 0) {
			$absPath = $meObject->get("dir");
			// To prevent reaching the command line length limit (we can
			// not expect how long the absolute paths of all subdirectory
			// will be nor how many subdirectories need to be processed)
			// when processing all subdirectories with one 'setfacl' call,
			// each subdirectory will be processed separately.
			foreach ($parts as $partk => $partv) {
				$absPath = build_path(DIRECTORY_SEPARATOR, $absPath, $partv);
				$cmdArgs = [];
				$cmdArgs[] = '--modify';
				$cmdArgs[] = sprintf("group:%s:--x", $defaultGroup);
				$cmdArgs[] = escapeshellarg($absPath);
				$cmd = new \OMV\System\Process("setfacl", $cmdArgs);
				$cmd->setRedirect2to1();
				$cmd->execute();
			}
		}

        //Code to create a SMB share for this shared folder
       // Create corresponding SMB share
       try {
           $smbParams = [
               "uuid" => $params['uuid'],  // Use UUID from input parameters
               "enable" => true,
               "sharedfolderref" => $object->getIdentifier(),
               "comment" => $object->get("comment") ?: $object->get("name"),
               "guest" => "no",
               "readonly" => false,
               "browseable" => true,
               "recyclebin" => false,
               "recyclemaxsize" => 0,
               "recyclemaxage" => 0,
               "hidedotfiles" => true,
               "inheritacls" => true,
               "inheritpermissions" => false,
               "easupport" => false,
               "storedosattributes" => false,
               "hostsallow" => "",
               "hostsdeny" => "",
               "audit" => false,
               "timemachine" => true,
               "extraoptions" => ""
           ];
       
           \OMV\Rpc\Rpc::call("SMB", "setShare", $smbParams, $context);
       
       } catch (\Exception $e) {
           // Log error but continue since shared folder creation was successful
           $this->getLogger()->error(sprintf(
               "Failed to create SMB share for shared folder '%s': %s",
               $object->get("name"),
               $e->getMessage()
           ));
       }
       
		// Return the configuration object.
		return $object->getAssoc();
	}

	/**
	 * Delete a shared folder and it's coresponding SMB export configuration object.
	 * @param params An array containing the following fields:
	 *   \em uuid The UUID of the configuration object.
	 *   \em recursive Remove the shared folder and its content recursively.
	 * @param context The context of the caller.
	 * @return The deleted configuration object.
	 */
    function deleteShareandSMB($params, $context) {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        // Validate the parameters of the RPC service method.
        $this->validateMethodParams($params, "rpc.sharemgmt.delete");
        
        // Get the configuration object.
        $db = \OMV\Config\Database::getInstance();
        $object = $db->get("conf.system.sharedfolder", $params['uuid']);
        
        // First find and delete corresponding SMB share if exists
        $smbShares = \OMV\Rpc\Rpc::call("SMB", "getShareList", [
            "start" => 0,
            "limit" => -1,
            "sortfield" => "name",
            "sortdir" => "ASC"
        ], $context);
        
        if (isset($smbShares['data']) && is_array($smbShares['data'])) {
            foreach ($smbShares['data'] as $share) {
                if ($share['sharedfolderref'] === $params['uuid']) {
                    // Found matching SMB share, delete it
                    \OMV\Rpc\Rpc::call("SMB", "deleteShare", [
                        "uuid" => $share['uuid']
                    ], $context);
                    break;
                }
            }
        }
    
        // Now check if the shared folder is referenced by other services
        $db->assertIsNotReferenced($object);
        
        // Delete shared folder content recursively?
        $recursive = boolvalEx($params['recursive']);
        
        // Rest of the validation and deletion logic remains the same
        if (TRUE === $recursive) {
            // Do not delete the shared folder content if another shared
            // folder points to the same directory.
            if ($db->exists("conf.system.sharedfolder", [
                "operator" => "and",
                "arg0" => [
                    "operator" => "stringNotEquals",
                    "arg0" => "uuid",
                    "arg1" => $object->get("uuid")
                ],
                "arg1" => [
                    "operator" => "and",
                    "arg0" => [
                        "operator" => "stringEquals",
                        "arg0" => "mntentref",
                        "arg1" => $object->get("mntentref")
                    ],
                    "arg1" => [
                        "operator" => "stringEquals",
                        "arg0" => "reldirpath",
                        "arg1" => $object->get("reldirpath")
                    ]
                ]
            ])) {
                throw new \OMV\Exception("Cannot unlink the shared folder ".
                  "content because another shared folder also refers to it");
            }
    
            // Rest of the code remains the same...
        }
    
        // Notify configuration changes.
        $dispatcher = \OMV\Engine\Notify\Dispatcher::getInstance();
        $dispatcher->notify(OMV_NOTIFY_PREDELETE,
          "org.openmediavault.conf.system.sharedfolder",
          $object->getAssoc(), $recursive);
    
        // Remove the shared folder and its content recursively?
        if (TRUE === $recursive) {
            // Get the mount point configuration object to build the absolute
            // shared folder path.
            $meObject = $db->get("conf.system.filesystem.mountpoint",
              $object->get("mntentref"));
            // Build the absolute shared folder path.
            $dirPath = build_path(DIRECTORY_SEPARATOR, $meObject->get("dir"),
              $object->get("reldirpath"));
            // Delete the shared folder directory.
            $cmdArgs = [];
            $cmdArgs[] = "-f";
            $cmdArgs[] = "-r";
            $cmdArgs[] = escapeshellarg($dirPath);
            $cmd = new \OMV\System\Process("rm", $cmdArgs);
            $cmd->setRedirect2to1();
            $cmd->execute();
        }
    
        // Delete the configuration object.
        $db->delete($object);
        \OMV\Rpc\Rpc::call("Config", "applyChanges", [
			"modules" => [ "samba" ],
			"force" => TRUE
		], $context);
        
        // Return the deleted configuration object.
        return $object->getAssoc();
    }
    
	

    public function getPrivilegesFilterGroups($params, $context) {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        // Validate the parameters of the RPC service method.
        $this->validateMethodParams($params, "rpc.common.objectuuid");
        // Get the shared folder configuration object.
        $db = \OMV\Config\Database::getInstance();
        $object = $db->get("conf.system.sharedfolder", $params['uuid']);
        // Prepare result object.
        $result = [];
        // Process non-system users.
        $users = \OMV\Rpc\Rpc::call("UserMgmt", "enumerateUsers", NULL,
          $context);
        foreach ($users as $userk => $userv) {
            // Set default values.
            $privilege = new \OMV\Dictionary([
                "type" => "user",
                "name" => $userv['name'],
                "perms" => NULL
            ]);
            // Check if there are any configured privileges for the
            // given user.
            if (FALSE === $object->isEmpty("privileges")) {
                foreach ($object->get("privileges.privilege") as $objectv) {
                    if (($objectv['type'] === $privilege->get("type")) &&
                      ($objectv['name'] === $privilege->get("name"))) {
                        $privilege->set("perms", intval($objectv['perms']));
                        break;
                    }
                }
            }
            $result[] = $privilege->getData();
        }
        
        // Removed the groups processing section completely
        
        return $result;
    }
    

    /**
	 * Get list of shared folder configuration objects.
	 * @param params An array containing the following fields:
	 *   \em start The index where to start.
	 *   \em limit The number of objects to process.
	 *   \em sortfield The name of the column used to sort.
	 *   \em sortdir The sort direction, ASC or DESC.
	 * @param context The context of the caller.
	 * @return An array containing the requested objects. The field \em total
	 *   contains the total number of objects, \em data contains the object
	 *   array. An exception will be thrown in case of an error.
	 */
    public function getSharedFoldersListFilterHomedirs($params, $context) {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        // Validate the parameters of the RPC service method.
        $this->validateMethodParams($params, "rpc.common.getlist");
        // Enumerate all shared folders.
        $objects = $this->callMethod("enumerateSharedFolders", NULL,
            $context);
        
        // Filter out the 'home-dirs' shared folder
        $objects = array_filter($objects, function($object) {
            return $object['name'] !== 'home-dirs';
        });
        // Re-index array after filtering
        $objects = array_values($objects);
    
        // Filter the result.
        return $this->applyFilter($objects, $params['start'],
            $params['limit'], $params['sortfield'], $params['sortdir']);
    }
    

    /**
	 * Enumerate all shared folder configuration objects.
	 * @param params The method parameters.
	 * @param context The context of the caller.
	 * @return The list of configured shared folders.
	 */
	public function enumerateSharedFolders($params, $context) {
		// Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
		// Get all configured shared folder configuration objects.
		$db = \OMV\Config\Database::getInstance();
		$objects = $db->get("conf.system.sharedfolder");
		// Add additional informations.
		$result = [];
		foreach ($objects as $objectk => $objectv) {
			$objectDict = new \OMV\Dictionary($objectv->getAssoc());
			// Set the default values.
			$objectDict->set("_used", FALSE);
			$objectDict->set("device", "");
			$objectDict->copy("name", "description");
			$objectDict->set("mntent", [
				"devicefile" => "",
				"fsname" => "",
				"dir" => "",
				"type" => "",
				"posixacl" => FALSE
			]);
			$objectDict->set("snapshots", FALSE);
			// Get the mount point configuration object to append additional
			// information to the returned objects, e.g. the devicefile or
			// a modified description.
			if ($db->exists("conf.system.filesystem.mountpoint", [
				"operator" => "stringEquals",
				"arg0" => "uuid",
				"arg1" => $objectDict->get("mntentref")
			])) {
				$meObject = $db->get("conf.system.filesystem.mountpoint",
					$objectDict->get("mntentref"));
				$objectDict->set("device", $meObject->get("fsname"));
				// Get the file system backend to get various information
				// about the file system features, e.g. if it supports
				// POSIX ACL.
				$fsbMngr = \OMV\System\Filesystem\Backend\Manager::getInstance();
				$fsbMngr->assertBackendExistsByType($meObject->get("type"));
				$fsb = $fsbMngr->getBackendByType($meObject->get("type"));
				$objectDict->set("mntent.fsname", $meObject->get("fsname"));
				$objectDict->set("mntent.dir", $meObject->get("dir"));
				$objectDict->set("mntent.type", $meObject->get("type"));
				$objectDict->set("mntent.posixacl", $fsb->hasPosixAclSupport());
				// Try to get additional information from the file system if
				// it is mounted right at the moment.
				$fs = \OMV\System\Filesystem\Filesystem::getImplByMountPoint(
					$meObject->get("dir"));
				if ((FALSE === is_null($fs)) && $fs->exists()) {
					// Get the device file of the file system.
					$deviceFile = $fs->getDeviceFile();
					$objectDict->set("mntent.devicefile", $deviceFile);
					// Use the file system label for the 'device' property,
					// otherwise use the device file.
					$objectDict->set("device", $deviceFile);
					if (TRUE === $fs->hasLabel())
						$objectDict->set("device", $fs->getLabel());
				}
				// Modify the description field.
				if (!empty($objectDict->get("comment"))) {
					$objectDict->set("description", sprintf(
						gettext("%s [%s]"),
						$objectDict->get("name"),
						$objectDict->get("comment")));
				} else {
					$objectDict->set("description", sprintf(
						gettext("%s [on %s, %s]"),
						$objectDict->get("name"),
						$objectDict->get("device"),
						$objectDict->get("reldirpath")));
				}
				// Are snapshots supported?
				$sfAbsPath = build_path(DIRECTORY_SEPARATOR,
					$meObject->get("dir"), $objectv->get("reldirpath"));
				if (("btrfs" == $meObject->get("type")) && !is_null($fs)) {
					// Try to get the subvolume information.
					$sfInfo = $fs->getSubvolumeInfo($sfAbsPath);
					// Block the creation of snapshots if this is not a
					// subvolume or if it is a snapshot itself.
					$snapshotsSupported = !(!$sfInfo || is_uuid(
						$sfInfo['parent_uuid']));
					$objectDict->set("snapshots", $snapshotsSupported);
				}
			}
			// Is the shared folder referenced by any object? Shared
			// folder references are named 'sharedfolderref'.
			$objectDict->set("_used", $db->isReferenced($objectv));
			// Append the configuration object to the result list.
			$result[] = $objectDict->getData();
		}
		return $result;
	}

	/**
	 * Get the shared folder privileges for the given role.
	 * @param params An array containing the following fields:
	 *   \em role The role type, e.g. 'user' or 'group'.
	 *   \em name The name of the user or group.
	 * @param context The context of the caller.
	 * @return An array of objects with the following fields:
	 *   uuid, name, perms.
	 */
	public function getPrivilegesByRoleFilterHomedirs($params, $context) {
		// Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
		// Validate the parameters of the RPC service method.
		$this->validateMethodParams($params, "rpc.sharemgmt.getprivilegesbyrole");
		// Get all configured shared folder configuration objects.
		$db = \OMV\Config\Database::getInstance();
		$sfObjects = $db->get("conf.system.sharedfolder");
		// Append additional information.
		$result = [];
		foreach ($sfObjects as $sfObjectk => $sfObjectv) {
             // Skip if the shared folder name is "home-dirs" as we don't want user to change home-dir permissions
            if ($sfObjectv->get("name") === "home-dirs") {
                continue;  
            }
			// Set default values.
			$privDict = new \OMV\Dictionary([
				"uuid" => $sfObjectv->get("uuid"),
				"name" => $sfObjectv->get("name"),
				"perms" => NULL
			]);
			// Check if there are any configured privileges for the
			// given user/group.
			if (FALSE === $sfObjectv->isEmpty("privileges")) {
				foreach ($sfObjectv->get("privileges.privilege") as $privv) {
					if ($params['role'] !== $privv['type'])
						continue;
					if ($params['name'] !== $privv['name'])
						continue;
					$privDict->set("perms", intval($privv['perms']));
					break;
				}
			}
			$result[] = $privDict->getData();
		}
		return $result;
	}

	/**
	 * Delete a user.
	 * @param params An array containing the following fields:
	 *   \em name The name of the user to delete.
	 * @param context The context of the caller.
	 * @return The deleted configuration object.
	 */
	function deleteUser($params, $context) {
		// Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
		// Validate the parameters of the RPC service method.
		$this->validateMethodParams($params, "rpc.usermgmt.deleteuser");
		// Get the user configuration object (required for the notification
		// event).
		$object = $this->callMethod("getUser", array(
			  "name" => $params['name']
		  ), $this->getAdminContext());
		// Delete the user.
		$cmdArgs = [];
		$cmdArgs[] = "--force";
        $cmdArgs[] = "-r";       // Remove home directory and mail spool
		$cmdArgs[] = escapeshellarg($params['name']);
		$cmd = new \OMV\System\Process("userdel", $cmdArgs);
		$cmd->setRedirect2to1();
		$cmd->execute();
		// Delete additional user information stored in database.
		$db = \OMV\Config\Database::getInstance();
		$db->deleteByFilter("conf.system.usermngmnt.user", [
			"operator" => "stringEquals",
			"arg0" => "name",
			"arg1" => $params['name']
		]);
		// Notify configuration changes.
		$dispatcher = \OMV\Engine\Notify\Dispatcher::getInstance();
		$dispatcher->notify(OMV_NOTIFY_DELETE,
		  "org.openmediavault.conf.system.usermngmnt.user", $object);
		// Return the deleted configuration object.
		return $object;
	}

    /**
	 * Enumerate users.
	 * @param type The user type, e.g. system, normal or all.
	 * @return An array containing user objects with following fields:
	 *   name, UID, GID, comment, home directory, and shell program,
	 *   last changed, minimum, maximum, warn, inactive, expire and
	 *   reserved.
	 */
	private function enumerateUsersByType($type) {
		// Get list of user names.
		$users = \OMV\System\User::getUsers();
		// Iterate through all users to filter the requested ones.
		$result = [];
		foreach ($users as $userk => $userv) {
			// Get the user information about the user.
			if (FALSE === ($userInfo = $this->getUserInfo($userv)))
				continue;
			// Append user 'root'?
			if ((0 == strcasecmp("root", $userInfo['name'])) &&
			  (FALSE == \OMV\Environment::getBoolean(
			  "OMV_USERMGMT_ENUMERATE_USER_ROOT", TRUE)))
				continue;
			// Check if the current user is requested.
			$append = FALSE;
			switch ($type) {
			case "system":
				$append = $userInfo['system'];
				break;
			case "normal":
				$append = !$userInfo['system'];
				break;
			case "all":
				$append = TRUE;
				break;
			}
			if (FALSE === $append)
				continue;
			$result[] = $userInfo;
		}
		return $result;
	}
	/**
	 * Get list of users (except system users).
	 * @param params An array containing the following fields:
	 *   \em start The index where to start.
	 *   \em limit The number of objects to process.
	 *   \em sortfield The name of the column used to sort.
	 *   \em sortdir The sort direction, ASC or DESC.
	 * @param context The context of the caller.
	 * @return An array containing the requested objects. The field \em total
	 *   contains the total number of objects, \em data contains the object
	 *   array. An exception will be thrown in case of an error.
	 */
	function getUserList($params, $context) {
		// Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
		// Validate the parameters of the RPC service method.
		$this->validateMethodParams($params, "rpc.common.getlist");
		// Get the list of non-system user.
		$users = $this->enumerateUsersByType("normal");

		// Process users and append additional information stored in
		// the database.
		foreach ($users as $userk => &$userv) {
			// Set the defaults of the additional information.
			$userv = array_merge($userv, [
				"email" => "",
				"disallowusermod" => FALSE,
				"sshpubkeys" => []
			]);
			// Get additional information stored in database.
			$db = \OMV\Config\Database::getInstance();
			$objects = $db->getByFilter("conf.system.usermngmnt.user", [
				"operator" => "stringEquals",
				"arg0" => "name",
				"arg1" => $userv['name']
			]);
			if (0 < count($objects)) {
				// Get the user configuration object. Due the fact that a user
				// name is unique, we can simply use the first found object.
				$object = $objects[0];
				// Append additional information.
				$userv['email'] = $object->get("email");
				$userv['disallowusermod'] = $object->get("disallowusermod");
				if (FALSE === $object->isEmpty("sshpubkeys"))
					$userv['sshpubkeys'] = $object->get("sshpubkeys.sshpubkey");
			}
		}



		// Filter the result.
		return $this->applyFilter($users, $params['start'],
			$params['limit'], $params['sortfield'], $params['sortdir'],
			$params['search']);

	}

    /**
     * Enumerate all disk devices on the system.
     * @param params The method parameters.
     * @param context The context of the caller.
     * @return An array containing physical disk device objects with the
     *   fields \em devicename, \em canonicaldevicefile, \em devicefile,
     *   \em devicelinks, \em model, \em size, \em description, \em vendor,
     *   \em serialnumber, \em israid, \em isroot and \em isreadonly.
     * @throw \OMV\Exception
     */
    public function enumerateDevices($params, $context) {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        // Get the device containing the operating system. Mark it as
        // read-only to deny wiping this device.
        $rootDeviceFile = \OMV\System\System::getRootDeviceFile();
        // Get all existing devices except software RAID devices.
        if (FALSE === ($devs = \OMV\System\Storage\StorageDevice::enumerate(
        OMV_STORAGE_DEVICE_TYPE_DISK))) {
            throw new \OMV\Exception(
            "Failed to get list of hard disks and hardware RAID devices.");
        }
        // Prepare result list.
        $objects = [];
        foreach ($devs as $devk => $devv) {
            $sd = \OMV\System\Storage\StorageDevice::getStorageDevice($devv);
            if (is_null($sd) || !$sd->exists())
                continue;
            // Skip devices where no media is available, e.g. CDROM device
            // without an inserted media.
            if (FALSE === $sd->IsMediaAvailable())
                continue;
                
            // Get the canonical device file
            $canonicalDeviceFile = $sd->getCanonicalDeviceFile();
            
            // Skip devices where canonicaldevicefile contains /dev/nvm or /dev/mmc
            if (strpos($canonicalDeviceFile, '/dev/nvm') !== FALSE || 
                strpos($canonicalDeviceFile, '/dev/mmc') !== FALSE)
                continue;
                
            $objects[] = [
                "devicename" => $sd->getDeviceName(),
                "canonicaldevicefile" => $canonicalDeviceFile,
                "devicefile" => $sd->getPredictableDeviceFile(),
                "devicelinks" => $sd->getDeviceFileSymlinks(),
                "model" => $sd->getModel(),
                "size" => $sd->getSize(),
                "description" => $sd->getDescription(),
                "vendor" => $sd->getVendor(),
                "serialnumber" => $sd->getSerialNumber(),
                "wwn" => $sd->getWorldWideName(),
                "israid" => $sd->isRaid(),
                "isroot" => \OMV\System\System::isRootDeviceFile(
                    $canonicalDeviceFile, FALSE),
                "isreadonly" => $sd->isReadOnly()
            ];
        }
        return $objects;
    }

    /**
     * Enumerate all disk devices on the system. The field \em hdparm will be
     * added to the hard disk objects if there exists additional hard disk
     * parameters (e.g. S.M.A.R.T. or AAM) that can be defined individually
     * per hard disk.
     * @param object $params An object containing the following fields:
     *   \em start The index where to start.
     *   \em limit The number of objects to process.
     *   \em sortfield The name of the column used to sort.
     *   \em sortdir The sort direction, ASC or DESC.
     * @param object $context The context of the caller.
     * @return object An array containing the requested objects. The field
     *   \em total contains the total number of objects, \em data contains
     *   the object array. An exception will be thrown in case of an error.
     */
    public function getExternalDisksList($params, $context) {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        // Validate the parameters of the RPC service method.
        $this->validateMethodParams($params, "rpc.common.getlist");
        
        // Enumerate all disk devices on the system.
        $objects = $this->callMethod("enumerateDevices", NULL, $context);
        
        // Get file systems to check if devices are in use
        $fileSystemsParams = [
            "start" => 0,
            "limit" => -1,
            "sortfield" => "status",
            "sortdir" => "ASC"
        ];
        $fileSystems = $this->callMethod("getUSBFileSystemsList", $fileSystemsParams, $context);
        $fileSystemsData = $fileSystems['data'];
        
        // Create a lookup array of parent device files
        $usedDevices = [];
        foreach ($fileSystemsData as $fs) {
            if (isset($fs['parentdevicefile']) && !empty($fs['parentdevicefile'])) {
                $usedDevices[] = $fs['parentdevicefile'];
            }
        }
        
        // Append additional configuration data.
        foreach ($objects as $objectk => &$objectv) {
            // Check if there exists a hdparm configuration object for the
            // given device. Note, we have to check for '/dev/xxx' and
            // '/dev/disk/by-id/xxx' entries.
            $db = \OMV\Config\Database::getInstance();
            $confObjects = $db->getByFilter("conf.system.hdparm", [
                "operator" => "stringEnum",
                "arg0" => "devicefile",
                "arg1" => array_merge([ $objectv['devicefile'] ],
                    $objectv['devicelinks'])
            ]);
            if (1 <= count($confObjects)) {
                // Append the first found configuration values.
                $objectv['hdparm'] = $confObjects[0]->getAssoc();
            }
            
            // Check if the device is used by any file system
            $objectv['_used'] = in_array($objectv['canonicaldevicefile'], $usedDevices);
        }
        
        // Filter result.
        return $this->applyFilter($objects, $params['start'],
            $params['limit'], $params['sortfield'], $params['sortdir']);
    }


	/**
	 * Execute the getList() RPC as background process.
	 */
	public function getExternalDisksListBg($params, $context) {
		return $this->callMethodBg("getExternalDisksList", $params, $context);
	}




	/**
	 * Set the password of the current context user.
	 * @param params An array containing the following fields:
	 *   \em password The new password.
	 * @param context The context of the caller.
	 * @return void
	 */
	function setPasswordByContextAll($params, $context) {
		// Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_EVERYONE
		]);
		// Validate the parameters of the RPC service method.
		$this->validateMethodParams($params,
			"rpc.usermgmt.setpasswordbycontext");
		$user = new \OMV\System\User($context['username']);
		$user->assertExists();
        
        $object = $this->callMethod("getUser", [
			"name" => $context['username']
		], $this->getAdminContext());
		// Make sure the user is allowed to modify their account.
		if (TRUE === $object['disallowusermod']) {
			throw new \OMV\Exception(
				"Unauthorized attempt to modify the user account '%s'",
				$object['name']);
		}
        
		$user->changePassword($params['password']);
        $this->setPasswordByContextSmb($user->getName(),$params['password']);

		// Notify configuration changes if the given user exists in the
		// database. System users like 'admin' are ignored.
		$db = \OMV\Config\Database::getInstance();
		$filter = [
			"operator" => "stringEquals",
			"arg0" => "name",
			"arg1" => $user->getName()
		];
		if (TRUE === $db->exists("conf.system.usermngmnt.user", $filter)) {
			$object = $db->getByFilter("conf.system.usermngmnt.user",
				$filter, 1);
			// Append some more information to the notification object.
			$objectAssoc = array_merge($object->getAssoc(), [
				"password" => $params['password']
			]);
			// Notify configuration changes.
			$dispatcher = \OMV\Engine\Notify\Dispatcher::getInstance();
			$dispatcher->notify(OMV_NOTIFY_MODIFY,
				"org.openmediavault.conf.system.usermngmnt.user",
				$objectAssoc, $object->getAssoc());
		}
	}

	function setPasswordByContextSmb($user, $password) {
	    //$name = is_array($user) ? $user['name'] : $user->getName();
        $name = $user;
	    try {
	        // First check if user exists in Samba database
	        $checkCmd = new \OMV\System\Process("pdbedit", [
	            "-L",
	            escapeshellarg($name)
	        ]);
	        
	        try {
	            $checkCmd->execute();
	        } catch (\Exception $e) {
	            // User doesn't exist in Samba DB, return error
	            throw new \OMV\Exception(
	                "User '%s' does not exist in the Samba database. Password cannot be changed.",
	                escapeshellarg($name)
	            );
	        }
	        
	        // User exists, proceed with password change
	        // Create command string for password change
	        $cmdString = sprintf(
	            "printf '%s\n%s\n' | smbpasswd -s %s",
	            $password,
	            $password,
	            escapeshellarg($name)
	        );
	        
	        // Use ShellScript instead of Process for this complex command
	        $script = new \OMV\System\ShellScript($cmdString);
	        $script->execute();
	        
	        error_log("Samba password changed successfully for user '$name'.");
	        
	    } catch (\OMV\Exception $e) {
	        // Rethrow OMV exceptions (like user not existing)
	        throw $e;
	    } catch (\Exception $e) {
	        error_log("Error changing Samba password for user '$name': " . $e->getMessage());
	        throw new \RuntimeException(sprintf(
	            "Failed to change Samba password for User %s: %s",
	            $name,
	            $e->getMessage()
	        ));
	    }
	}
	
    /**
	 * Get an user configuration object.
	 * @param params An array containing the following fields:
	 *   \em name The name of the user.
	 * @param context The context of the caller.
	 * @return The requested configuration object.
	 */
	function getUser($params, $context) {
		// Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
		// Validate the parameters of the RPC service method.
		$this->validateMethodParams($params, "rpc.usermgmt.getuser");
		// Ensure the user exists.
		$user = new \OMV\System\User($params['name']);
		$user->assertExists();
		// Get the user information.
		$result = $this->getUserInfo($user->getName());
		// Set the defaults of the additional information.
		$result = array_merge($result, [
			"email" => "",
			"disallowusermod" => FALSE,
			"sshpubkeys" => []
		]);
		// Get additional user information stored in database.
		$db = \OMV\Config\Database::getInstance();
		$objects = $db->getByFilter("conf.system.usermngmnt.user", [
			"operator" => "stringEquals",
			"arg0" => "name",
			"arg1" => $user->getName()
		]);
		if (0 < count($objects)) {
			// Get the user configuration object. Due the fact that a user
			// name is unique, we can simply use the first found object.
			$object = $objects[0];
			// Append additional information.
			$result['email'] = $object->get("email");
			$result['disallowusermod'] = $object->get("disallowusermod");
			if (FALSE === $object->isEmpty("sshpubkeys"))
				$result['sshpubkeys'] = $object->get("sshpubkeys.sshpubkey");
		}
		return $result;
	}

	function setPasswordByContextOmv($user,$password){
		$user->changePassword($password);
		// Notify configuration changes if the given user exists in the
		// database. System users like 'admin' are ignored.ap
		$db = \OMV\Config\Database::getInstance();
		$filter = [
			"operator" => "stringEquals",
			"arg0" => "name",
			"arg1" => $user->getName()
		];
		if (TRUE === $db->exists("conf.system.usermngmnt.user", $filter)) {
			$object = $db->getByFilter("conf.system.usermngmnt.user",
				$filter, 1);
			// Append some more information to the notification object.
			$objectAssoc = array_merge($object->getAssoc(), [
				"password" => $password
			]);
			// Notify configuration changes.
			$dispatcher = \OMV\Engine\Notify\Dispatcher::getInstance();
			$dispatcher->notify(OMV_NOTIFY_MODIFY,
				"org.openmediavault.conf.system.usermngmnt.user",
				$objectAssoc, $object->getAssoc());
		}
    }

	/**
	 * Return info about an user by their name or UID.
	 * @param id The user identifier; name or UID.
	 * @return Returns an associative array with the user information
	 *   or FALSE if the user does not exist.
	 */
	private function getUserInfo($id) {
		$user = new \OMV\System\User($id);
		if (!$user->exists())
			return FALSE;
		return [
			"name" => $user->getName(),
			"uid" => $user->getUid(),
			"gid" => $user->getGid(),
			"comment" => $user->getGecos(),
			"dir" => $user->getHomeDirectory(),
			"shell" => $user->getShell(),
			"lastchanged" => $user->getLastChanged(),
			"minimum" => $user->getMinimum(),
			"maximum" => $user->getMaximum(),
			"warn" => $user->getWarn(),
			"inactive" => $user->getInactive(),
			"expire" => $user->getExpire(),
			"reserved" => $user->getReserved(),
			"groups" => $user->getGroups(),
			"system" => $user->isSystemAccount()
		];
	}

    function setUserAll($params, $context) {
    
    
        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
    
    
        // Validate the parameters of the RPC service method.
        $this->validateMethodParams($params, "rpc.usermgmt.setuser");
    
        
        // Check if the given user is a system account. Abort this attempt.
        $user = new \OMV\System\User($params['name']);
        if ($user->exists() && $user->isSystemAccount()) {
    
            throw new \OMV\Exception(
                "Unauthorized attempt to modify the system user account '%s'",
                $params['name']);
        }
    
        // Convert SSH keys to RFC 4716 format and ensure uniqueness
        foreach ($params['sshpubkeys'] as $sshPubKeyk => &$sshPubKeyv) {
            $pubKey = new \OMV\Ssh\PublicKey($sshPubKeyv);
            $sshPubKeyv = $pubKey->toRfc4716();
        }
        $params['sshpubkeys'] = array_unique($params['sshpubkeys']);
    
        // Database operations
        $db = \OMV\Config\Database::getInstance();
        $filter = [
            "operator" => "stringEquals",
            "arg0" => "name",
            "arg1" => $params['name']
        ];
    
        // Handle existing or new user configuration
        if ($db->exists("conf.system.usermngmnt.user", $filter)) {
            $notifyType = OMV_NOTIFY_MODIFY;
            $object = $oldObject = $db->getByFilter(
                "conf.system.usermngmnt.user", $filter, 1);
            $object->set("email", $params['email']);
            $object->set("disallowusermod", $params['disallowusermod']);
            $object->set("sshpubkeys", [
                "sshpubkey" => $params['sshpubkeys']
            ]);
        } else {
            $notifyType = OMV_NOTIFY_CREATE;
            $object = new \OMV\Config\ConfigObject(
                "conf.system.usermngmnt.user");
            $object->setNew();
            $object->set("name", $params['name']);
            $object->set("email", $params['email']);
            $object->set("disallowusermod", $params['disallowusermod']);
            $object->set("sshpubkeys", [
                "sshpubkey" => $params['sshpubkeys']
            ]);
        }
        $db->set($object, TRUE);
    
        // Prepare command arguments
        $cmdArgs = [];
        $cmdArgs[] = "--gid";
        $cmdArgs[] = escapeshellarg(\OMV\Environment::get(
            "OMV_USERMGMT_DEFAULT_GROUP"));
    
        if (array_key_exists("shell", $params) &&
                !empty($params['shell'])) {
            if (!file_exists($params['shell'])) {
                throw new \OMV\Exception("The shell '%s' does not exist.",
                    $params['shell']);
            }
            $cmdArgs[] = "--shell";
            $cmdArgs[] = escapeshellarg($params['shell']);
        }
        if (array_key_exists("comment", $params)) {
            $cmdArgs[] = "--comment";
            $cmdArgs[] = escapeshellarg($params['comment']);
        }
        if (array_key_exists("groups", $params) &&
                !empty($params['groups'])) {
            foreach ($params['groups'] as $groupk => $groupv) {
                $group = new \OMV\System\Group($groupv);
                $group->assertExists();
            }
            $cmdArgs[] = "--groups";
            $cmdArgs[] = escapeshellarg(implode(",", $params['groups']));
        }
    
        // Create new user if doesn't exist
        if (!$user->exists()) {
            // Get user management settings
            $hdsobject = $db->get("conf.system.usermngmnt.homedir");
            
            if (array_key_exists("uid", $params)) {
                $cmdArgs[] = "--uid";
                $cmdArgs[] = $params['uid'];
            }
            
            if (TRUE === $hdsobject->get("enable")) {
                $sfpath = \OMV\Rpc\Rpc::call("ShareMgmt", "getPath",
                    array("uuid" => $hdsobject->get("sharedfolderref")),
                    $context);
                $homedir = build_path(DIRECTORY_SEPARATOR, $sfpath, $params['name']);
                $cmdArgs[] = "--create-home";
                $cmdArgs[] = "--home";
                $cmdArgs[] = escapeshellarg($homedir);
            }
            
            $cmdArgs[] = escapeshellarg($params['name']);
            $oldUmask = umask(0007);  
            try {
                // Create the new user
                $cmd = new \OMV\System\Process("useradd", $cmdArgs);
                $cmd->setRedirect2to1();
                $cmd->execute();
    
                // Set home directory permissions
                if (TRUE === $hdsobject->get("enable") && isset($homedir)) {
                    try {
                        // Get list of all shared folders
                        $sharedFolders = \OMV\Rpc\Rpc::call("ShareMgmt", 
                            "enumerateSharedFolders", [], $context);
                        
                        // Find the UUID of 'home-dirs' share
                        $homeDirsUuid = null;
                        foreach ($sharedFolders as $share) {
                            if ($share['name'] === 'home-dirs') {
                                $homeDirsUuid = $share['uuid'];
                                break;
                            }
                        }
                        
                        if ($homeDirsUuid === null) {
                            throw new \OMV\Exception("Could not find 'home-dirs' shared folder");
                        }
    
                        // Get username and ensure it ends with '/'
                        $username = $params['name'];
                        $relativePath = $username . '/';  // Add trailing slash
    
                        // Set ACLs using setFileACL RPC
                        $aclParams = [
                            "uuid" => $homeDirsUuid,
                            "file" => $relativePath,
                            "recursive" => true,
                            "replace" => true,
                            "owner" => $username,
                            "group" => "users",
                            "userperms" => 7,
                            "groupperms" => 7,
                            "otherperms" => 0,
                            "users" => [],
                            "groups" => []
                        ];
    
                   
    
                        // Call setFileACL RPC method
                       // \OMV\Rpc\Rpc::call("ShareMgmt", "setFileACL", 
                        //    $aclParams, $context);
    
                        // Verify permissions
                        //$cmd = new \OMV\System\Process("getfacl", [
                        //    "-p",
                        //    escapeshellarg($homedir)
                        //]);
                        //$cmd->setRedirect2to1();
                        //$output = $cmd->execute();
                        
    
                    } catch (\Exception $e) {
                        
                        throw $e;
                    }
                }
            } finally {
                umask($oldUmask);
            }
        }
        // Create Samba user
        try {
            // Construct the full command with proper piping
            $cmdString = sprintf(
                "printf '%s\n%s\n' | pdbedit -a -t %s",
                $params['password'],
                $params['password'],
                escapeshellarg($params['name'])
            );
            
            // Use ShellScript for commands that need shell features like piping
            $script = new \OMV\System\ShellScript($cmdString);
            $output = array();
            $script->execute($output);
        } catch (\Exception $e) {
            throw $e;
        }
        
        
    
        // Update the password if provided
        if (array_key_exists("password", $params) &&
                !empty($params['password'])) {
            $user = new \OMV\System\User($params['name']);
            $user->assertExists();
            $user->changePassword($params['password']);
            
            // Update Samba password
            try {
                $this->setPasswordByContextSmb($params['name'], $params['password']);
            } catch (\Exception $e) {
                throw $e;
            }
        }
    
        // Append additional information to notification object
        $objectAssoc = array_merge($object->getAssoc(), $params);
        
        // Notify configuration changes
        $dispatcher = \OMV\Engine\Notify\Dispatcher::getInstance();
        $dispatcher->notify($notifyType,
            "org.openmediavault.conf.system.usermngmnt.user",
            $objectAssoc,
            !is_null($oldObject) ? $oldObject->getAssoc() : NULL);
        
        
        // Return the configuration object
        return $objectAssoc;
    }
    


    public function appAutoUpdates($params, $context) {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        $this->validateMethodParams($params, "rpc.homecloud.appAutoUpdates");

        // Extract parameters from the input
        $appName = $params['appname'];
        $action = $params['action'];

        // Create command with parameters
        $cmd = new \OMV\System\Process("/sbin/app-auto-updates.py", [
            $appName,
            $action
        ]);
        
        $cmd->setEnv("SHELL", "/bin/sh");
        $cmd->execute($output);
        
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }


	/**
	 * Helper function to get details of the given network interface device.
	 * @param deviceName The name of the network interface device.
	 * @return An array containing the network interface details. The following
	 *   fields are returned: devicename, gateway, gateway6, address, address6,
	 *   netmask, netmask6, ether, mtu, state, link, vlan and vlanid.
	 */
	private function getIfaceInfo($deviceName) {
		// Set the default values.
		$obj = [
			"devicename" => $deviceName,
			"gateway" => "",
			"gateway6" => "",
			"address" => "",
			"address6" => "",
			"prefix" => -1,
			"prefix6" => -1,
			"netmask" => "",
			"netmask6" => "",
			"ether" => "",
			"mtu" => "",
			"state" => gettext("UNKNOWN"),
			"link" => FALSE,
			"vlan" => FALSE,
			"vlanid" => -1,
			"speed" => -1,
			"description" => "",
			"stats" => []
		];
		// Get the network interface object.
		$mngr = \OMV\System\Net\NetworkInterfaceBackend\Manager::getInstance();
		$iface = $mngr->getImpl($deviceName);
		if (!is_null($iface) && $iface->exists()) {
			$gateway = $iface->getGateway();
			$gateway6 = $iface->getGateway6();
			$address = $iface->getIP();
			$address6 = $iface->getIP6();
			$prefix = $iface->getPrefix();
			$prefix6 = $iface->getPrefix6();
			$netmask = $iface->getNetmask();
			$netmask6 = $iface->getNetmask6();
			$ether = $iface->getMAC();
			$state = $iface->getState();
			$speed = $iface->getSpeed();
			$stats = $iface->getStatistics();
			$obj['type'] = $iface->getType();
			$obj['description'] = $iface->getDescription();
			$obj['stats'] = !$stats ? [] : $stats;
			$obj['gateway'] = !$gateway ? "" : $gateway;
			$obj['gateway6'] = !$gateway6 ? "" : $gateway6;
			$obj['address'] = !$address ? "" : $address;
			$obj['address6'] = !$address6 ? "" : $address6;
			$obj['prefix'] = !$prefix ? -1 : $prefix;
			$obj['prefix6'] = !$prefix6 ? -1 : $prefix6;
			$obj['netmask'] = !$netmask ? "" : $netmask;
			$obj['netmask6'] = !$netmask6 ? "" : $netmask6;
			$obj['ether'] = !$ether ? "" : $ether;
			$obj['mtu'] = $iface->getMTU();
			$obj['state'] = !$state ? gettext("UNKNOWN") : $state;
			$obj['link'] = $iface->getLink();
			$obj['speed'] = !$speed ? -1 : $speed;
			if ("vlan" == $obj['type']) {
				$obj['vlan'] = TRUE;
				$obj['vlanid'] = $iface->getVlanId();
			}
		}
		return $obj;
	}

	/**
	 * Enumerate all network interface devices on the system.
	 * @param params The method parameters.
	 * @param context The context of the caller.
	 * @return An array of objects. Each object represents a network interface
	 *   device with the following properties: \em devicename, \em gateway,
	 *   \em gateway6, \em address, \em address6, \em netmask, \em netmask6,
	 *   \em ether, \em mtu, \em state, \em link, \em vlan and \em vlanid.
	 */
	public function enumeratePhysicalNetworkDevices($params, $context) {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        
        $mngr = \OMV\System\Net\NetworkInterfaceBackend\Manager::getInstance();
        // Enumerate all network interface devices on the system.
        if (FALSE === ($devs = $mngr->enumerate(
          OMV_NETWORK_INTERFACE_TYPE_ALL))) {
            throw new \OMV\Exception(
              "Failed to get list of network interface devices.");
        }
        // Generate the result objects including all information about
        // the network interfaces.
        $result = [];
        foreach ($devs as $devk => $devv) {
            // Get the network interface backend.
            $mngr->assertBackendExists($devv);
            $nib = $mngr->getBackend($devv);
            // Set the default attributes.
            $object = [
                "uuid" => \OMV\Environment::get("OMV_CONFIGOBJECT_NEW_UUID"),
                "comment" =>  "",
                "_used" =>  FALSE,
                "_readonly" =>  FALSE
            ];
            
            // Check if configuration exists for this interface
            $filter = [
                "operator" => "stringEquals",
                "arg0" => "devicename",
                "arg1" => $devv
            ];
            $db = \OMV\Config\Database::getInstance();
            
            if ($db->exists("conf.system.network.interface", $filter)) {
                $cfgObject = $db->getByFilter("conf.system.network.interface",
                  $filter, 1);
                $configData = $cfgObject->getAssoc();
                
                // Check if device has type 'loopback' or 'virtual' in config
                if (($configData['type'] === 'loopback' || $configData['type'] === 'virtual')) {
                    continue;  // Skip this device
                }
                
                // Append the configuration attributes
                $object = array_merge($object, $configData);
                $object['slaves'] = explode_safe(",", $object['slaves']);
                $object['_used'] = $db->isReferenced($cfgObject);
            }
    
            // Get the current network interface information
            $object = array_merge($object, $this->getIfaceInfo($devv));
    
            // Skip if device has type 'loopback' or 'virtual' from interface info
            if (($object['type'] === 'loopback' || $object['type'] === 'virtual')) {
                continue;
            }
    
            // Check wireless status for wlan devices
            if (strpos($devv, 'wlan') === 0) {
                $cmd = new \OMV\System\Process('iwconfig', [$devv]);
                $cmd->execute($output);
                $iwconfig_output = implode("\n", $output);

                // Check if the interface is in Master mode (hotspot/AP mode)
                if (strpos($iwconfig_output, 'Mode:Master') !== false) {
                        // Skip this device as it's in hotspot mode
                    continue;
                }

    
                // Check if Mode is Managed
                if (strpos($iwconfig_output, 'Mode:Managed') !== false) {
                    if (
                        (strpos($iwconfig_output, 'ESSID:off/any') !== false || 
                         strpos($iwconfig_output, 'ESSID:"') === false) && 
                        strpos($iwconfig_output, 'Access Point: Not-Associated') !== false
                    ) {
                        $object['state'] = 'DOWN';
                    } elseif (
                        strpos($iwconfig_output, 'ESSID:"') !== false && 
                        strpos($iwconfig_output, 'Access Point: ') !== false && 
                        strpos($iwconfig_output, 'Access Point: Not-Associated') === false
                    ) {
                        $object['state'] = 'UP';
                    }
                }
            }
    
            // Check whether the interface device is used by a bonding interface
            if ($db->exists("conf.system.network.interface", [
                "operator" => "and",
                "arg0" => [
                    "operator" => "stringEquals",
                    "arg0" => "type",
                    "arg1" => "bond"
                ],
                "arg1" => [
                    "operator" => "stringContains",
                    "arg0" => "slaves",
                    "arg1" => $devv
                ]
            ])) {
                $object['_used'] = TRUE;
                $object['_readonly'] = TRUE;
                $object['method'] = "";
                $object['method6'] = "";
            }
            
            // Check if interface has a valid IPv4 address
            $hasValidIpv4 = false;
            if (isset($object['address']) && !empty($object['address']) && $object['address'] !== '0.0.0.0') {
                $hasValidIpv4 = true;
            }
            
            // For wlan0 and end0, state should be false if address is blank
            if ($devv === 'wlan0' || $devv === 'end0' || $devv === 'eth0') {
                if (!$hasValidIpv4) {
                    $object['state'] = false;
                }
            }
            
            // For regular network interfaces
            if (isset($object['state'])) {
                $object['state'] = ($object['state'] === 'UP');
            }
            
            // Modify the wireless (wlan) device section to set boolean values directly
            if (strpos($devv, 'wlan') === 0) {
                $cmd = new \OMV\System\Process('iwconfig', [$devv]);
                $cmd->execute($output);
                $iwconfig_output = implode("\n", $output);
            
                // Check if Mode is Managed
                if (strpos($iwconfig_output, 'Mode:Managed') !== false) {
                    if (
                        (strpos($iwconfig_output, 'ESSID:off/any') !== false || 
                         strpos($iwconfig_output, 'ESSID:"') === false) && 
                        strpos($iwconfig_output, 'Access Point: Not-Associated') !== false
                    ) {
                        $object['state'] = false; // Instead of 'DOWN'
                    } elseif (
                        strpos($iwconfig_output, 'ESSID:"') !== false && 
                        strpos($iwconfig_output, 'Access Point: ') !== false && 
                        strpos($iwconfig_output, 'Access Point: Not-Associated') === false
                    ) {
                        // Only true if both connected to AP AND has valid IPv4
                        $object['state'] = $hasValidIpv4;
                    }
                }
            }
            
            // Append network interface device to result list
            $result[] = $object;
        }
        
        // Rest of the function remains unchanged...
    
        // Add VPN object to the result array
        try {
            $tailscaleResponse = $this->getTailscaleStatus([], $context);
            // Convert status to boolean - true if "Up", false otherwise
            $isVpnUp = (isset($tailscaleResponse['status']) && 
                        strtolower($tailscaleResponse['status']) === 'up');
        
            $vpnObject = [
                "uuid" => \OMV\Environment::get("OMV_CONFIGOBJECT_NEW_UUID"),
                "devicename" => "vpn0",
                "type" => "vpn",
                "method" => null,
                "method6" => null,
                "address" => null,
                "netmask" => null,
                "gateway" => null,
                "address6" => null,
                "netmask6" => null,
                "gateway6" => null,
                "dnsnameservers" => null,
                "dnssearch" => null,
                "mtu" => null,
                "wol" => null,
                "comment" => "VPN",
                "slaves" => null,
                "_used" => false,
                "_readonly" => true,
                "state" => $isVpnUp
            ];
            $result[] = $vpnObject;
        } catch (\Exception $e) {
            // If there's an error getting VPN status, add VPN object with state as false
            $vpnObject = [
                "uuid" => \OMV\Environment::get("OMV_CONFIGOBJECT_NEW_UUID"),
                "devicename" => "vpn0",
                "type" => "vpn",
                "method" => null,
                "method6" => null,
                "address" => null,
                "netmask" => null,
                "gateway" => null,
                "address6" => null,
                "netmask6" => null,
                "gateway6" => null,
                "dnsnameservers" => null,
                "dnssearch" => null,
                "mtu" => null,
                "wol" => null,
                "comment" => "VPN Interface",
                "slaves" => null,
                "_used" => false,
                "_readonly" => true,
                "state" => false
            ];
            $result[] = $vpnObject;
        }


        try {
            $host = "8.8.8.8";
            $port = 53;
            $timeout = 2;
            
            $fp = @fsockopen($host, $port, $errno, $errstr, $timeout);
            if ($fp) {
                fclose($fp);
                $state = true;
            } else {
                $state = false;
            }

            $internetObject = [
                "uuid" => \OMV\Environment::get("OMV_CONFIGOBJECT_NEW_UUID"),
                "devicename" => "internet0",
                "type" => "internet",
                "method" => null,
                "method6" => null,
                "address" => null,
                "netmask" => null,
                "gateway" => null,
                "address6" => null,
                "netmask6" => null,
                "gateway6" => null,
                "dnsnameservers" => null,
                "dnssearch" => null,
                "mtu" => null,
                "wol" => null,
                "comment" => "Internet Connectivity",
                "slaves" => null,
                "_used" => false,
                "_readonly" => true,
                "state" => $state
            ];
            $result[] = $internetObject;
        } catch (\Exception $e) {
            // If there's an error checking internet connectivity, add object with state as false
            $internetObject = [
                "uuid" => \OMV\Environment::get("OMV_CONFIGOBJECT_NEW_UUID"),
                "devicename" => "internet0",
                "type" => "internet",
                "method" => null,
                "method6" => null,
                "address" => null,
                "netmask" => null,
                "gateway" => null,
                "address6" => null,
                "netmask6" => null,
                "gateway6" => null,
                "dnsnameservers" => null,
                "dnssearch" => null,
                "mtu" => null,
                "wol" => null,
                "comment" => "Internet Connectivity",
                "slaves" => null,
                "_used" => false,
                "_readonly" => true,
                "state" => false
            ];
            $result[] = $internetObject;
        }       
    return $result;
	}

	/**
	 * Enumerate all network interface devices on the system, except loopback.
	 * @param params An array containing the following fields:
	 *   \em start The index where to start.
	 *   \em limit The number of objects to process.
	 *   \em sortfield The name of the column used to sort.
	 *   \em sortdir The sort direction, ASC or DESC.
	 * @param context The context of the caller.
	 * @return An array containing the requested objects. The field \em total
	 *   contains the total number of objects, \em data contains the object
	 *   array. An exception will be thrown in case of an error.
	 */
	function enumeratePhysicalNetworkDevicesList($params, $context) {
		// Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
		// Validate the parameters of the RPC service method.
		$this->validateMethodParams($params, "rpc.common.getlist");
		// Get the system network interface devices.
		$result = $this->callMethod("enumeratePhysicalNetworkDevices", NULL, $context);
		// Filter the result.
		return $this->applyFilter($result, $params['start'],
		  $params['limit'], $params['sortfield'], $params['sortdir']);
	}

    /**
	 * Get all configured network interfaces devices with status.
	 * @param params The method parameters.
	 * @param context The context of the caller.
	 * @return A list of applicable network interfaces devices.
	 */
    /**
 * Get all configured network interfaces devices with status.
 * @param params The method parameters.
 * @param context The context of the caller.
 * @return A list of applicable network interfaces devices.
 */
function enumerateConfiguredDevicesWithStatus($params, $context) {
    // Validate the RPC caller context.
    $this->validateMethodContext($context, [
        "role" => OMV_ROLE_ADMINISTRATOR
    ]);
    
    // Get all network interface configuration objects from database
    $db = \OMV\Config\Database::getInstance();
    $objects = $db->get("conf.system.network.interface");
    
    // Generate the result objects including all information about the network interfaces
    $result = [];
    foreach ($objects as $objectk => $objectv) {
        $objectAssoc = $objectv->getAssoc();
        $devicename = $objectv->get("devicename");
        
        // Skip loopback and virtual interfaces
        if ($objectAssoc['type'] === 'loopback' || $objectAssoc['type'] === 'virtual') {
            continue;
        }
        
        // Is the interface device somewhere referenced?
        $objectAssoc['_used'] = $db->isReferenced($objectv);
        $objectAssoc['_readonly'] = FALSE;
        
        // Check if it is used by a bonding interface
        if ($db->exists("conf.system.network.interface", [
            "operator" => "and",
            "arg0" => [
                "operator" => "stringEquals",
                "arg0" => "type",
                "arg1" => "bond"
            ],
            "arg1" => [
                "operator" => "stringContains",
                "arg0" => "slaves",
                "arg1" => $devicename
            ]
        ])) {
            $objectAssoc['_used'] = TRUE;
            $objectAssoc['_readonly'] = TRUE;
            $objectAssoc['method'] = "";
            $objectAssoc['method6'] = "";
        }
        
        // Get the current network interface information
        $ifaceInfo = $this->getIfaceInfo($devicename);
        $objectAssoc = array_merge($objectAssoc, $ifaceInfo);
        
        // Convert slaves to array
        $objectAssoc['slaves'] = explode_safe(",", $objectAssoc['slaves']);
        
        // Check if interface has a valid IPv4 address
        $hasValidIpv4 = false;
        if (isset($objectAssoc['address']) && !empty($objectAssoc['address']) && $objectAssoc['address'] !== '0.0.0.0') {
            $hasValidIpv4 = true;
        }
        
        // For regular network interfaces, convert state to boolean and consider IPv4 status
        if (isset($objectAssoc['state'])) {
            // Only consider UP if both link is up AND has valid IPv4
            $objectAssoc['state'] = ($objectAssoc['state'] === 'UP' && $hasValidIpv4);
        } else {
            // If state is not set, use IPv4 status
            $objectAssoc['state'] = $hasValidIpv4;
        }
        
        // Special handling for wireless interfaces
        if (strpos($devicename, 'wlan') === 0) {
            $cmd = new \OMV\System\Process('iwconfig', [$devicename]);
            $cmd->execute($output);
            $iwconfig_output = implode("\n", $output);
            
            // Check if Mode is Managed
            if (strpos($iwconfig_output, 'Mode:Managed') !== false) {
                if (
                    (strpos($iwconfig_output, 'ESSID:off/any') !== false || 
                     strpos($iwconfig_output, 'ESSID:"') === false) && 
                    strpos($iwconfig_output, 'Access Point: Not-Associated') !== false
                ) {
                    $objectAssoc['state'] = false; // Instead of 'DOWN'
                } elseif (
                    strpos($iwconfig_output, 'ESSID:"') !== false && 
                    strpos($iwconfig_output, 'Access Point: ') !== false && 
                    strpos($iwconfig_output, 'Access Point: Not-Associated') === false
                ) {
                    // Only true if both connected to AP AND has valid IPv4
                    $objectAssoc['state'] = $hasValidIpv4;
                }
            }
        }
        
        // Append network interface device to result list
        $result[] = $objectAssoc;
    }
    
    return $result;
}

	
    



    /****Wizard related rpcs-start */
    /**
	 * Get all configured network interfaces devices with status.
	 * @param params The method parameters.
	 * @param context The context of the caller.
	 * @return A list of applicable network interfaces devices.
	 */
	function checkNetworkInterfaceStatusForWizard($params, $context) {
		 // Validate the RPC caller context.
         $this->validateMethodContext($context, [
	        "role" => OMV_ROLE_ADMINISTRATOR
	    ]);
		$result = $this->callMethod("enumerateConfiguredDevicesWithStatus", NULL, $context);
        $wiredUp = false;
        $wifiUp = false;
       
        
        foreach ($result as $device) {
            if ($device['comment'] === 'Wired' && $device['state'] === true) {
                $wiredUp = true;
            }
            if ($device['comment'] === 'Wi-Fi' && $device['state'] === true) {
                $wifiUp = true;
            }
        }
        
        if (!$wiredUp && !$wifiUp) {
            throw new \OMV\Exception(
                "Both Wired and Wi-Fi interfaces are down.Please set up atleast one interface"
            );
        }

        //Call Flags to set last completed step
        $flags =  new Flags();
        $params = ['lastCompletedStepName' => 'networkInterface'];
        $flags->saveLastCompletedStep($params, $context);

        
        // Return an array with a success status
        
        return "Network is connected";
    }
	function checkInternetStatusForWizard($params, $context) {
		 // Validate the RPC caller context.
         $this->validateMethodContext($context, [
	        "role" => OMV_ROLE_ADMINISTRATOR
	    ]);
		$result = $this->callMethod("enumeratePhysicalNetworkDevices", NULL, $context);
        $internetConnected = false;
       
       
        
        foreach ($result as $device) {
            if ($device['type'] === 'internet' && $device['state'] === true) {
                $internetConnected = true;
            }
           
        }
        
        $result['internetConnected']=$internetConnected;
        return $result;
    }

    public function checkVpnStatusForWizard($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        /* Get the output from the tailscale status script
        
        $cmd = new \OMV\System\Process("/sbin/check_tailscale_status.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        */
        $output = $this->getTailscaleStatus($params, $context);
        if($output["status"] !== "Up")
        {
            throw new \OMV\Exception(
                sprintf("VPN is not Configured. Please configure VPN again."));
        }

        //Call Flags to set last completed step
        $flags =  new Flags();
        $params = ['lastCompletedStepName' => 'vpnConfig'];
        $flags->saveLastCompletedStep($params, $context);

        
        // Return an array with a success status
        
        return "VPN is connected";

    }

    public function checkNotificationEmailForWizard($params, $context) {
        
        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        
        $getNotificationEmail=new OMVRpcServiceEmailNotification();
        $result=$getNotificationEmail->get($params, $context);
        if(isset($result)){
            if($result["enable"]!== true || $result["primaryemail"]==="" || $result["primaryemail"]===null || $result["server"]==="" || $result["server"]===null ){
                throw new \OMV\Exception(
                    sprintf("Notification Email is not Configured. Please configure Notification Email again.Config: %s", json_encode($result)));
            }
        }
        else{
            throw new \OMV\Exception(
                sprintf("Notification Email is not Configured. Please configure Notification Email again.Config: %s", json_encode($result)));
        }
         //Call Flags to set last completed step
         $flags =  new Flags();
         $params = ['lastCompletedStepName' => 'notification'];
         $flags->saveLastCompletedStep($params, $context);
 
         
         // Return an array with a success status
         
         return "Notification Email is updated successfully";

    }

    public function checkDriveUserSetupForWizard($params,$context){

         // Validate the RPC caller context.
         $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        
        $result=$this->getUserList($params, $context);
        if(isset($result)){
            if(!$result["total"] > 0 ){
                throw new \OMV\Exception(
                    sprintf("No Users created for drive. Please create atleast one user."));
            }
        }
        else{
            throw new \OMV\Exception(
                sprintf("No Users created for drive. Please create atleast one user."));
        }
         //Call Flags to set last completed step
         $flags =  new Flags();
         $params = ['lastCompletedStepName' => 'appsDriveUsers'];
         $flags->saveLastCompletedStep($params, $context);
 
         
         // Return an array with a success status
         
         return "Drive set up completed successfully";

    }
    public function checkPhotosAppDeployForWizard($params,$context){

         // Validate the RPC caller context.
         $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        
        $result=$this->getImmichServiceStatus($params, $context);
        if(isset($result)){
            if($result["status"] === "Not deployed" ){
                throw new \OMV\Exception(
                    sprintf("Photos app not deployed. Please deploy it again"));
            }
        }
        else{
            throw new \OMV\Exception(
                sprintf("Photos app not deployed. Please deploy it again."));
        }
         //Call Flags to set last completed step
         $flags =  new Flags();
         $params = ['lastCompletedStepName' => 'appsPhoto'];
         $flags->saveLastCompletedStep($params, $context);
 
         
         // Return an array with a success status
         
         return "Photos App set up completed successfully";

    }
    public function checkDocsAppDeployForWizard($params,$context){

         // Validate the RPC caller context.
         $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        
        $result=$this->getPaperlessServiceStatus($params, $context);
        if(isset($result)){
            if($result["status"] === "Not deployed" ){
                throw new \OMV\Exception(
                    sprintf("Documents app not deployed. Please deploy it again."));
            }
        }
        else{
            throw new \OMV\Exception(
                sprintf("Documents app not deployed. Please deploy it again."));
        }
         //Call Flags to set last completed step
         $flags =  new Flags();
         $params = ['lastCompletedStepName' => 'appsPaperless'];
         $flags->saveLastCompletedStep($params, $context);
 
         
         // Return an array with a success status
         
         return "Docs App set up completed successfully";

    }
    public function checkNotesAppDeployForWizard($params,$context){

         // Validate the RPC caller context.
         $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        
        $result=$this->getJoplinServiceStatus($params, $context);
        if(isset($result)){
            if($result["status"] === "Not deployed" ){
                throw new \OMV\Exception(
                    sprintf("Notes app not deployed. Please deploy it again."));
            }
        }
        else{
            throw new \OMV\Exception(
                sprintf("Notes app not deployed. Please deploy it again."));
        }
         //Call Flags to set last completed step
         $flags =  new Flags();
         $params = ['lastCompletedStepName' => 'appsNotes'];
         $flags->saveLastCompletedStep($params, $context);
 
         
         // Return an array with a success status
         
         return "Notes App set up completed successfully";

    }
    public function checkPasswordAppDeployForWizard($params,$context){

         // Validate the RPC caller context.
         $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        
        $result=$this->getVaultwardenServiceStatus($params, $context);
        if(isset($result)){
            if($result["status"] === "Not deployed" ){
                throw new \OMV\Exception(
                    sprintf("Password manager app not deployed. Please deploy it again."));
            }
        }
        else{
            throw new \OMV\Exception(
                sprintf("Password manager app not deployed. Please deploy it again."));
        }
         //Call Flags to set last completed step
         $flags =  new Flags();
         $params = ['lastCompletedStepName' => 'appsPasswordManager'];
         $flags->saveLastCompletedStep($params, $context);
 
         
         // Return an array with a success status
         
         return "Password manager App set up completed successfully";

    }
    public function checkMediaAppDeployForWizard($params,$context){

         // Validate the RPC caller context.
         $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        
        $result=$this->getJellyfinServiceStatus($params, $context);
        if(isset($result)){
            if($result["status"] === "Not deployed" ){
                throw new \OMV\Exception(
                    sprintf("Media app not deployed. Please deploy it again."));
            }
        }
        else{
            throw new \OMV\Exception(
                sprintf("Media app not deployed. Please deploy it again."));
        }
         //Call Flags to set last completed step
         $flags =  new Flags();
         $params = ['lastCompletedStepName' => 'appsMedia'];
         $flags->saveLastCompletedStep($params, $context);
 
         
         // Return an array with a success status
         
         return "Media App set up completed successfully";

    }
    /****Wizard related rpcs-end */


    public function jellyfin_remove($params, $context) {
         // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
				use ($params) {

        
	    $output_err="";
		$cmdArgs = [];
        $cmdArgs[]='echo "Removing Jellyfin";';
        $cmdArgs[]='/sbin/jellyfin_remove.py';
        $cmd = new \OMV\System\Process("sudo", $cmdArgs);
			$cmd->setEnv("SHELL", "/bin/sh");
			$cmd->setRedirect2to1();
			if (0 !== ($exitStatus = $this->exec($cmd, $output,
					$bgOutputFilename))) {
				throw new \OMV\ExecException($cmd,$output, $exitStatus);
			}

		return $output;
    });
    }

    public function joplin_remove($params, $context) {
         // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
				use ($params) {

        
	    $output_err="";
		$cmdArgs = [];
        $cmdArgs[]='echo "Removing Joplin";';
        $cmdArgs[]='/sbin/joplin_remove.py';
        $cmd = new \OMV\System\Process("sudo", $cmdArgs);
			$cmd->setEnv("SHELL", "/bin/sh");
			$cmd->setRedirect2to1();
			if (0 !== ($exitStatus = $this->exec($cmd, $output,
					$bgOutputFilename))) {
				throw new \OMV\ExecException($cmd,$output, $exitStatus);
			}

		return $output;
    });
    }


    public function paperless_remove($params, $context) {
         // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
				use ($params) {

        
	    $output_err="";
		$cmdArgs = [];
        $cmdArgs[]='echo "Removing Paperless-ngx";';
        $cmdArgs[]='/sbin/paperless_remove.py';
        $cmd = new \OMV\System\Process("sudo", $cmdArgs);
			$cmd->setEnv("SHELL", "/bin/sh");
			$cmd->setRedirect2to1();
			if (0 !== ($exitStatus = $this->exec($cmd, $output,
					$bgOutputFilename))) {
				throw new \OMV\ExecException($cmd,$output, $exitStatus);
			}

		return $output;
    });
    }


    public function vaultwarden_remove($params, $context) {
         // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
				use ($params) {

        
	    $output_err="";
		$cmdArgs = [];
        $cmdArgs[]='echo "Removing Vaultwarden";';
        $cmdArgs[]='/sbin/vaultwarden_remove.py';
        $cmd = new \OMV\System\Process("sudo", $cmdArgs);
			$cmd->setEnv("SHELL", "/bin/sh");
			$cmd->setRedirect2to1();
			if (0 !== ($exitStatus = $this->exec($cmd, $output,
					$bgOutputFilename))) {
				throw new \OMV\ExecException($cmd,$output, $exitStatus);
			}

		return $output;
    });
    }

    public function immich_remove($params, $context) {
         // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
				use ($params) {

        
	    $output_err="";
		$cmdArgs = [];
        $cmdArgs[]='echo "Removing Immich";';
        $cmdArgs[]='/sbin/immich_remove.py';
        $cmd = new \OMV\System\Process("sudo", $cmdArgs);
			$cmd->setEnv("SHELL", "/bin/sh");
			$cmd->setRedirect2to1();
			if (0 !== ($exitStatus = $this->exec($cmd, $output,
					$bgOutputFilename))) {
				throw new \OMV\ExecException($cmd,$output, $exitStatus);
			}

		return $output;
    });
    }

    public function getTailscaleStatus($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Get the output from the tailscale status script
        
        $cmd = new \OMV\System\Process("/sbin/check_tailscale_status.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);

    }

    public function immich_get_latest_version($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Get the output from the tailscale status script
        
        $cmd = new \OMV\System\Process("/sbin/check_latest_immich_version.py");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function vaultwarden_get_latest_version($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Get the output from the tailscale status script
        
        $cmd = new \OMV\System\Process("/sbin/check_latest_vaultwarden_version.py");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }
    public function paperless_get_latest_version($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Get the output from the tailscale status script
        
        $cmd = new \OMV\System\Process("/sbin/check_latest_paperless_version.py");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function joplin_get_latest_version($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Get the output from the tailscale status script
        
        $cmd = new \OMV\System\Process("/sbin/check_latest_joplin_version.py");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }


    public function jellyfin_get_latest_version($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Get the output from the tailscale status script
        
        $cmd = new \OMV\System\Process("/sbin/check_latest_jellyfin_version.py");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function traefik_get_latest_version($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Get the output from the tailscale status script
        
        $cmd = new \OMV\System\Process("/sbin/check_latest_traefik_version.py");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function immich_check_version($params, $context) {
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Get the output from the tailscale status script
        
        $cmd = new \OMV\System\Process("/sbin/check_immich_version.py");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function paperless_check_version($params, $context) {
	    $output_err="";
		$cmdArgs = [];
        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
        // Get the output from the tailscale status script
        $cmd = new \OMV\System\Process("/sbin/check_paperless_version.py");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function traefik_check_version($params, $context) {
	    $output_err="";
		$cmdArgs = [];
        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
        // Get the output from the tailscale status script
        $cmd = new \OMV\System\Process("/sbin/check_traefik_version.py");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function joplin_check_version($params, $context) {
	    $output_err="";
		$cmdArgs = [];
        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
        // Get the output from the tailscale status script
        $cmd = new \OMV\System\Process("/sbin/check_joplin_version.py");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function tailscale_check_version($params, $context) {
	    $output_err="";
		$cmdArgs = [];
        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
        // Get the output from the tailscale status script
        $cmd = new \OMV\System\Process("/sbin/tailscale_ver_update.py --version");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function jellyfin_check_version($params, $context) {
	    $output_err="";
		$cmdArgs = [];
        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
        // Get the output from the tailscale status script
        $cmd = new \OMV\System\Process("/sbin/check_jellyfin_version.py");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function vaultwarden_check_version($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Get the output from the tailscale status script
        
        $cmd = new \OMV\System\Process("/sbin/check_vaultwarden_version.py");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);

    }

    public function immich_update_version($params, $context) {
         // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
        $this->validateMethodParams($params, "rpc.homecloud.immich_update_version");

        return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
				use ($params) {

        
	    $output_err="";
		$cmdArgs = [];
        $cmdArgs[]='echo "starting Immich Update";';
		$cmdArgs[]='export NEW_VERSON_ID='.escapeshellarg(trim($params["version"])).';';
        $cmdArgs[]='/sbin/immich_ver_update.py $NEW_VERSON_ID';
        $cmd = new \OMV\System\Process("sudo", $cmdArgs);
		$cmd->setEnv("SHELL", "/bin/sh");
		$cmd->setRedirect2to1();
		if (0 !== ($exitStatus = $this->exec($cmd, $output,
			$bgOutputFilename))) {
			//throw new \OMV\ExecException($cmd, $output, $exitStatus);
			throw new \OMV\ExecException($cmd,$output, $exitStatus);
		    }

			return $output;
    });
    }

    public function vaultwarden_update_version($params, $context) {
         // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
        $this->validateMethodParams($params, "rpc.homecloud.vaultwarden_update_version");

        return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
				use ($params) {

        
	    $output_err="";
		$cmdArgs = [];
        $cmdArgs[]='echo "starting Vaultwarden Update";';
		$cmdArgs[]='export NEW_VERSION_ID='.escapeshellarg(trim($params["version"])).';';
        $cmdArgs[]='/sbin/vaultwarden_ver_update.py $NEW_VERSION_ID';
        $cmd = new \OMV\System\Process("sudo", $cmdArgs);
		$cmd->setEnv("SHELL", "/bin/sh");
		$cmd->setRedirect2to1();
		if (0 !== ($exitStatus = $this->exec($cmd, $output,
			$bgOutputFilename))) {
			//throw new \OMV\ExecException($cmd, $output, $exitStatus);
			throw new \OMV\ExecException($cmd,$output, $exitStatus);
		    }
			return $output;
    });
    }


    public function paperless_getusers($params, $context) {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        
        $cmd = new \OMV\System\Process("/sbin/paperless_getusers.py");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function joplin_getusers($params, $context) {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        
        $cmd = new \OMV\System\Process("/sbin/joplin_getusers.py");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }
    
    public function paperless_update_version($params, $context) {
         // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
        $this->validateMethodParams($params, "rpc.homecloud.paperless_update_version");

        return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
				use ($params) {

        
	    $output_err="";
		$cmdArgs = [];
        $cmdArgs[]='echo "starting Paperless-ngx Update";';
		$cmdArgs[]='export NEW_VERSION_ID='.escapeshellarg(trim($params["version"])).';';
        $cmdArgs[]='/sbin/paperless_ver_update.py --user admin $NEW_VERSION_ID';
        $cmd = new \OMV\System\Process("sudo", $cmdArgs);
		$cmd->setEnv("SHELL", "/bin/sh");
		$cmd->setRedirect2to1();
		if (0 !== ($exitStatus = $this->exec($cmd, $output,
			$bgOutputFilename))) {
			//throw new \OMV\ExecException($cmd, $output, $exitStatus);
			throw new \OMV\ExecException($cmd,$output, $exitStatus);
		    }
			return $output;
    });
    }



    public function joplin_update_version($params, $context) {
         // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
        $this->validateMethodParams($params, "rpc.homecloud.joplin_update_version");

        return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
				use ($params) {

        
	    $output_err="";
		$cmdArgs = [];
        $cmdArgs[]='echo "starting Joplin Update";';
		$cmdArgs[]='export NEW_VERSION_ID='.escapeshellarg(trim($params["version"])).';';
        $cmdArgs[]='/sbin/joplin_ver_update.py $NEW_VERSION_ID';
        $cmd = new \OMV\System\Process("sudo", $cmdArgs);
        //$cmd = new \OMV\System\Process($cmdArgs);
		$cmd->setEnv("SHELL", "/bin/sh");
		$cmd->setRedirect2to1();
		if (0 !== ($exitStatus = $this->exec($cmd, $output,
			$bgOutputFilename))) {
			//throw new \OMV\ExecException($cmd, $output, $exitStatus);
			throw new \OMV\ExecException($cmd,$output, $exitStatus);
		    }
			return $output;
    });
    }


    public function tailscale_update_version($params, $context) {
        // Validate the RPC caller context.
       $this->validateMethodContext($context, [
           "role" => OMV_ROLE_ADMINISTRATOR
       ]);
       //$this->validateMethodParams($params, "rpc.homecloud.joplin_update_version");

       return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
               use ($params) {

       
       $output_err="";
       $cmdArgs = [];
       $cmdArgs[]='echo "Starting Tailscale VPN Update";';
       //$cmdArgs[]='export NEW_VERSION_ID='.escapeshellarg(trim($params["version"])).';';
       $cmdArgs[]='/sbin/tailscale_ver_update.py --update';
       $cmd = new \OMV\System\Process("sudo", $cmdArgs);
       //$cmd = new \OMV\System\Process($cmdArgs);
       $cmd->setEnv("SHELL", "/bin/sh");
       $cmd->setRedirect2to1();
       if (0 !== ($exitStatus = $this->exec($cmd, $output,
           $bgOutputFilename))) {
           //throw new \OMV\ExecException($cmd, $output, $exitStatus);
           throw new \OMV\ExecException($cmd,$output, $exitStatus);
           }
           return $output;
   });
   }

    public function jellyfin_update_version($params, $context) {
         // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
        $this->validateMethodParams($params, "rpc.homecloud.jellyfin_update_version");
        //$USER = $context['username'];

        return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
				use ($params) {

        
	    $output_err="";
		$cmdArgs = [];
        $cmdArgs[]='echo "starting Jellyfin Update";';
		$cmdArgs[]='export NEW_VERSION_ID='.escapeshellarg(trim($params["version"])).';';
        $cmdArgs[]='export USER='.escapeshellarg(trim($params["name"])).';';
        $cmdArgs[]='/sbin/jellyfin_ver_update.py $NEW_VERSION_ID $USER';
        $cmd = new \OMV\System\Process("sudo", $cmdArgs);
		$cmd->setEnv("SHELL", "/bin/sh");
		$cmd->setRedirect2to1();
		if (0 !== ($exitStatus = $this->exec($cmd, $output,
			$bgOutputFilename))) {
			//throw new \OMV\ExecException($cmd, $output, $exitStatus);
			throw new \OMV\ExecException($cmd,$output, $exitStatus);
		    }
			return $output;
    });
    }


    public function vaultwarden_restore_execute($params, $context) {
        $output_err = "";
        $cmdArgs = [];

        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);

        $this->validateMethodParams($params, "rpc.homecloud.vaultwarden_restore_execute");



        return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
                use ($params) {
            // Create Process with mount path, username, and group name
            $output_err="";
            $cmdArgs = [];
            $cmdArgs[]='echo "Starting restore....";';
            $cmdArgs[]='export MOUNT_PATH='.escapeshellarg(trim($params["mount_path"])).';';
            
            $cmdArgs[]='/sbin/vaultwarden_restore_execute.py $MOUNT_PATH';
            $cmd = new \OMV\System\Process("sudo", $cmdArgs);
            $cmd->setEnv("SHELL", "/bin/sh");
            $cmd->setRedirect2to1();
            if (0 !== ($exitStatus = $this->exec($cmd, $output,
                $bgOutputFilename))) {
                throw new \OMV\ExecException($cmd,$output, $exitStatus);
                }
                return $output;
            });
    }



    public function joplin_restore_execute($params, $context) {
        $output_err = "";
        $cmdArgs = [];

        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);

        $this->validateMethodParams($params, "rpc.homecloud.joplin_restore_execute");

        return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
            use ($params) {
        // Create Process with mount path, username, and group name
        $output_err="";
        $cmdArgs = [];
        $cmdArgs[]='echo "Starting restore....";';
        $cmdArgs[]='export MOUNT_PATH='.escapeshellarg(trim($params["mount_path"])).';';
        
        $cmdArgs[]='/sbin/joplin_restore_execute.py $MOUNT_PATH';
        $cmd = new \OMV\System\Process("sudo", $cmdArgs);
        $cmd->setEnv("SHELL", "/bin/sh");
        $cmd->setRedirect2to1();
        if (0 !== ($exitStatus = $this->exec($cmd, $output,
            $bgOutputFilename))) {
            throw new \OMV\ExecException($cmd,$output, $exitStatus);
            }
            return $output;
        });
    }


    public function jellyfin_restore_execute($params, $context) {
        $output_err = "";
        $cmdArgs = [];

        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);

        $this->validateMethodParams($params, "rpc.homecloud.joplin_restore_execute");

        return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
            use ($params) {
        // Create Process with mount path, username, and group name
        $output_err="";
        $cmdArgs = [];
        $cmdArgs[]='echo "Starting restore....";';
        $cmdArgs[]='export MOUNT_PATH='.escapeshellarg(trim($params["mount_path"])).';';
        
        $cmdArgs[]='/sbin/jellyfin_restore_execute.py $MOUNT_PATH';
        $cmd = new \OMV\System\Process("sudo", $cmdArgs);
        $cmd->setEnv("SHELL", "/bin/sh");
        $cmd->setRedirect2to1();
        if (0 !== ($exitStatus = $this->exec($cmd, $output,
            $bgOutputFilename))) {
            throw new \OMV\ExecException($cmd,$output, $exitStatus);
            }
            return $output;
        });
    }

    public function immich_restore_execute($params, $context) {
        $output_err = "";
        $cmdArgs = [];

        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);

        $this->validateMethodParams($params, "rpc.homecloud.immich_restore_execute");



        return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
                use ($params) {
            // Create Process with mount path, username, and group name
            $output_err="";
            $cmdArgs = [];
            $cmdArgs[]='echo "Starting restore....";';
            $cmdArgs[]='export MOUNT_PATH='.escapeshellarg(trim($params["mount_path"])).';';
            
            $cmdArgs[]='/sbin/immich_restore_execute.py $MOUNT_PATH';
            $cmd = new \OMV\System\Process("sudo", $cmdArgs);
            $cmd->setEnv("SHELL", "/bin/sh");
            $cmd->setRedirect2to1();
            if (0 !== ($exitStatus = $this->exec($cmd, $output,
                $bgOutputFilename))) {
                throw new \OMV\ExecException($cmd,$output, $exitStatus);
                }
                return $output;
            });
    }


    public function drive_restore_execute($params, $context) {
        $output_err = "";
        $cmdArgs = [];

        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);

        $this->validateMethodParams($params, "rpc.homecloud.drive_restore_execute");



        return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
                use ($params) {
            // Create Process with mount path, username, and group name
            $output_err="";
            $cmdArgs = [];
            $cmdArgs[]='echo "Starting restore....";';
            $cmdArgs[]='export MOUNT_PATH='.escapeshellarg(trim($params["mount_path"])).';';
            
            $cmdArgs[]='/sbin/drive_restore_execute.py $MOUNT_PATH';
            $cmd = new \OMV\System\Process("sudo", $cmdArgs);
            $cmd->setEnv("SHELL", "/bin/sh");
            $cmd->setRedirect2to1();
            if (0 !== ($exitStatus = $this->exec($cmd, $output,
                $bgOutputFilename))) {
                throw new \OMV\ExecException($cmd,$output, $exitStatus);
                }
                return $output;
            });
    }

    public function paperless_restore_execute($params, $context) {
        $output_err = "";
        $cmdArgs = [];

        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);

        $this->validateMethodParams($params, "rpc.homecloud.paperless_restore_execute");



        return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
                use ($params) {
            // Create Process with mount path, username, and group name
            $output_err="";
            $cmdArgs = [];
            $cmdArgs[]='echo "Starting restore....";';
            $cmdArgs[]='export MOUNT_PATH='.escapeshellarg(trim($params["mount_path"])).';';
            
            $cmdArgs[]='/sbin/paperless_restore_execute.py $MOUNT_PATH';
            $cmd = new \OMV\System\Process("sudo", $cmdArgs);
            $cmd->setEnv("SHELL", "/bin/sh");
            $cmd->setRedirect2to1();
            if (0 !== ($exitStatus = $this->exec($cmd, $output,
                $bgOutputFilename))) {
                throw new \OMV\ExecException($cmd,$output, $exitStatus);
                }
                return $output;
            });
    }


    public function deleteBackup($params, $context) {
        $output_err = "";
        $cmdArgs = [];
    
        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
    
        $this->validateMethodParams($params, "rpc.homecloud.removeBackup");
        return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
                use ($params) {
            // Create Process with mount path, username, and group name
            $output_err="";
            $cmdArgs = [];
            $cmdArgs[]='echo "Deleting selected backup and all its contents...";';
            $cmdArgs[]='export MOUNT_PATH='.escapeshellarg(trim($params["mount_path"])).';';
            
            // Use a single command with proper shell syntax
            $cmdArgs[]='if [ -d "$MOUNT_PATH" ]; then rm -rf "$MOUNT_PATH"/ && echo "Successfully deleted selected backup."; else echo "Error: Path $MOUNT_PATH does not exist"; exit 1; fi';
            
            $cmd = new \OMV\System\Process("sudo", $cmdArgs);
            $cmd->setEnv("SHELL", "/bin/sh");
            $cmd->setRedirect2to1();
            if (0 !== ($exitStatus = $this->exec($cmd, $output,
                $bgOutputFilename))) {
                throw new \OMV\ExecException($cmd,$output, $exitStatus);
                }
                return $output;
            });
    }
    


    public function immich_backup_execute($params, $context) {
        $output_err = "";
        $cmdArgs = [];

        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);

        $this->validateMethodParams($params, "rpc.homecloud.immich_backup_execute");

        // Get the username who invoked this function
        $username = $context['username'];
        
        // Get the primary group of the user
        $userInfo = posix_getpwnam($username);
        if ($userInfo === false) {
            throw new \OMV\Exception(
                "Failed to get user information for '{$username}'"
            );
        }
        
        // Get group name from group ID
        $groupInfo = posix_getgrgid($userInfo['gid']);
        if ($groupInfo === false) {
            throw new \OMV\Exception(
                "Failed to get group information for user '{$username}'"
            );
        }
        $groupname = $groupInfo['name'];



    return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
            use ($params,$username,$groupname) {
        // Create Process with mount path, username, and group name
        $output_err="";
        $cmdArgs = [];
        $cmdArgs[]='echo "starting backup....";';
        $cmdArgs[]='export MOUNT_PATH='.escapeshellarg(trim($params["mount_path"])).';';
        $cmdArgs[]='export USER='.escapeshellarg(trim($username)).';';
        $cmdArgs[]='export GROUP='.escapeshellarg(trim($groupname)).';';
        $cmdArgs[]='/sbin/immich_backup_execute.sh $MOUNT_PATH $USER $GROUP';
        $cmd = new \OMV\System\Process("sudo", $cmdArgs);
        $cmd->setEnv("SHELL", "/bin/sh");
        $cmd->setRedirect2to1();
        if (0 !== ($exitStatus = $this->exec($cmd, $output,
            $bgOutputFilename))) {
            throw new \OMV\ExecException($cmd,$output, $exitStatus);
            }

            return $output;
          });
        }



    public function drive_backup_execute($params, $context) {
            $output_err = "";
            $cmdArgs = [];
    
            // Validate the RPC caller context.
            $this->validateMethodContext($context, [
                "role" => OMV_ROLE_ADMINISTRATOR
            ]);
    
            $this->validateMethodParams($params, "rpc.homecloud.drive_backup_execute");
            
        return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
                use ($params) {
            // Create Process with mount path, username, and group name
            $output_err="";
            $cmdArgs = [];
            $cmdArgs[]='echo "starting backup....";';
            $cmdArgs[]='export MOUNT_PATH='.escapeshellarg(trim($params["mount_path"])).';';
            $cmdArgs[]='/sbin/drive_backup_execute.py $MOUNT_PATH';
            $cmd = new \OMV\System\Process("sudo", $cmdArgs);
            $cmd->setEnv("SHELL", "/bin/sh");
            $cmd->setRedirect2to1();
            if (0 !== ($exitStatus = $this->exec($cmd, $output,
                $bgOutputFilename))) {
                throw new \OMV\ExecException($cmd,$output, $exitStatus);
                }
    
                return $output;
              });
    }

    public function createTailscaleFunnel($params, $context) {
        $output_err = "";
        $cmdArgs = [];

        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);

        $this->validateMethodParams($params, "rpc.homecloud.createTailscaleFunnel");
        
    return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
            use ($params) {
        // Create Process with mount path, username, and group name
        $output_err="";
        $cmdArgs = [];
        $cmdArgs[]='echo "Creating funnel on Tailscale....";';
        $cmdArgs[]='export SOURCE_PORT='.escapeshellarg(trim($params["source_port"])).';';
        $cmdArgs[]='export DESTINATION_PORT='.escapeshellarg(trim($params["destination_port"])).';';
        $cmdArgs[]='/sbin/create_tailscale_funnel.py $SOURCE_PORT $DESTINATION_PORT';
        $cmd = new \OMV\System\Process("sudo", $cmdArgs);
        $cmd->setEnv("SHELL", "/bin/sh");
        $cmd->setRedirect2to1();
        if (0 !== ($exitStatus = $this->exec($cmd, $output,
            $bgOutputFilename))) {
            throw new \OMV\ExecException($cmd,$output, $exitStatus);
            }

            return $output;
          });
    }

    public function disableTailscaleFunnel($params, $context) {
        $output_err = "";
        $cmdArgs = [];

        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);

        $this->validateMethodParams($params, "rpc.homecloud.disableTailscaleFunnel");
        
    return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
            use ($params) {
        // Create Process with mount path, username, and group name
        $output_err="";
        $cmdArgs = [];
        $cmdArgs[]='echo "Creating funnel on Tailscale....";';
        $cmdArgs[]='export SOURCE_PORT='.escapeshellarg(trim($params["source_port"])).';';
        $cmdArgs[]='export DESTINATION_PORT='.escapeshellarg(trim($params["destination_port"])).';';
        $cmdArgs[]='/sbin/disable_tailscale_funnel.py $SOURCE_PORT $DESTINATION_PORT';
        $cmd = new \OMV\System\Process("sudo", $cmdArgs);
        $cmd->setEnv("SHELL", "/bin/sh");
        $cmd->setRedirect2to1();
        if (0 !== ($exitStatus = $this->exec($cmd, $output,
            $bgOutputFilename))) {
            throw new \OMV\ExecException($cmd,$output, $exitStatus);
            }

            return $output;
          });
    }


    public function vaultwarden_backup_execute($params, $context) {
        $output_err = "";
        $cmdArgs = [];

        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);

        $this->validateMethodParams($params, "rpc.homecloud.vaultwarden_backup_execute");

        // Get the username who invoked this function
        $username = $context['username'];
        
        // Get the primary group of the user
        $userInfo = posix_getpwnam($username);
        if ($userInfo === false) {
            throw new \OMV\Exception(
                "Failed to get user information for '{$username}'"
            );
        }
        
        

        // Get group name from group ID
        $groupInfo = posix_getgrgid($userInfo['gid']);
        if ($groupInfo === false) {
            throw new \OMV\Exception(
                "Failed to get group information for user '{$username}'"
            );
        }
        $groupname = $groupInfo['name'];



    return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
            use ($params,$username,$groupname) {
        // Create Process with mount path, username, and group name
        $output_err="";
        $cmdArgs = [];
        $cmdArgs[]='echo "starting backup....";';
        $cmdArgs[]='export MOUNT_PATH='.escapeshellarg(trim($params["mount_path"])).';';
        $cmdArgs[]='export USER='.escapeshellarg(trim($username)).';';
        $cmdArgs[]='export GROUP='.escapeshellarg(trim($groupname)).';';
        $cmdArgs[]='/sbin/vaultwarden_backup_execute.sh $MOUNT_PATH $USER $GROUP';
        $cmd = new \OMV\System\Process("sudo", $cmdArgs);
        $cmd->setEnv("SHELL", "/bin/sh");
        $cmd->setRedirect2to1();
        if (0 !== ($exitStatus = $this->exec($cmd, $output,
            $bgOutputFilename))) {
            throw new \OMV\ExecException($cmd,$output, $exitStatus);
            }

            return $output;
          });
}



    
    public function paperless_backup_execute($params, $context) {
        $output_err = "";
        $cmdArgs = [];

        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);

        $this->validateMethodParams($params, "rpc.homecloud.paperless_backup_execute");

        // Get the username who invoked this function
        $username = $context['username'];
        
        // Get the primary group of the user
        $userInfo = posix_getpwnam($username);
        if ($userInfo === false) {
            throw new \OMV\Exception(
                "Failed to get user information for '{$username}'"
            );
        }
        // Get group name from group ID
        $groupInfo = posix_getgrgid($userInfo['gid']);
        if ($groupInfo === false) {
            throw new \OMV\Exception(
                "Failed to get group information for user '{$username}'"
            );
        }
        $groupname = $groupInfo['name'];

    return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
            use ($params,$username,$groupname) {
        // Create Process with mount path, username, and group name
        $output_err="";
        $cmdArgs = [];
        $cmdArgs[]='echo "starting backup....";';
        $cmdArgs[]='export MOUNT_PATH='.escapeshellarg(trim($params["mount_path"])).';';
        $cmdArgs[]='export USER='.escapeshellarg(trim($username)).';';
        $cmdArgs[]='export GROUP='.escapeshellarg(trim($groupname)).';';
        $cmdArgs[]='/sbin/paperless_backup_execute.sh $MOUNT_PATH $USER $GROUP';
        $cmd = new \OMV\System\Process("sudo", $cmdArgs);
        $cmd->setEnv("SHELL", "/bin/sh");
        $cmd->setRedirect2to1();
        if (0 !== ($exitStatus = $this->exec($cmd, $output,
            $bgOutputFilename))) {
            throw new \OMV\ExecException($cmd,$output, $exitStatus);
            }

            return $output;
          });
}


public function joplin_backup_execute($params, $context) {
        $output_err = "";
        $cmdArgs = [];

        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);

        $this->validateMethodParams($params, "rpc.homecloud.joplin_backup_execute");

        // Get the username who invoked this function
        $username = $context['username'];
        
        // Get the primary group of the user
        $userInfo = posix_getpwnam($username);
        if ($userInfo === false) {
            throw new \OMV\Exception(
                "Failed to get user information for '{$username}'"
            );
        }
        // Get group name from group ID
        $groupInfo = posix_getgrgid($userInfo['gid']);
        if ($groupInfo === false) {
            throw new \OMV\Exception(
                "Failed to get group information for user '{$username}'"
            );
        }
        $groupname = $groupInfo['name'];

    return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
        use ($params,$username,$groupname) {
        // Create Process with mount path, username, and group name
        $output_err="";
        $cmdArgs = [];
        $cmdArgs[]='echo "starting backup....";';
        $cmdArgs[]='export MOUNT_PATH='.escapeshellarg(trim($params["mount_path"])).';';
        $cmdArgs[]='export USER='.escapeshellarg(trim($username)).';';
        $cmdArgs[]='export GROUP='.escapeshellarg(trim($groupname)).';';
        $cmdArgs[]='/sbin/joplin_backup_execute.sh $MOUNT_PATH $USER $GROUP';
        $cmd = new \OMV\System\Process("sudo", $cmdArgs);
        $cmd->setEnv("SHELL", "/bin/sh");
        $cmd->setRedirect2to1();
        if (0 !== ($exitStatus = $this->exec($cmd, $output,
            $bgOutputFilename))) {
            throw new \OMV\ExecException($cmd,$output, $exitStatus);
            }

            return $output;
          });
}



    public function getPaperlessServiceStatus($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
        

        // Get the output from the status script
        
        $cmd = new \OMV\System\Process("/sbin/check_paperless.py");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function getTraefikServiceStatus($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
        

        // Get the output from the status script
        
        $cmd = new \OMV\System\Process("/sbin/check_traefik.py");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function getJoplinServiceStatus($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Get the output from the tatus script
        
        $cmd = new \OMV\System\Process("/sbin/check_joplin.py");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function getJellyfinServiceStatus($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Get the output from the tatus script
        
        $cmd = new \OMV\System\Process("/sbin/check_jellyfin.py");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function getVaultwardenServiceStatus($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Get the output from the tatus script
        
        $cmd = new \OMV\System\Process("/sbin/check_vaultwarden.py");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);

    }

    public function getImmichServiceStatus($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Validate the parameters of the RPC service method.
		//$this->validateMethodParams($params, "rpc.homecloud.getImmichServiceStatus");

        // Get the output from the tatus script
        
        $cmd = new \OMV\System\Process("/sbin/check_immich.py");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);

    }
    public function get_backup_size_immich($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Validate the parameters of the RPC service method.
		//$this->validateMethodParams($params, "rpc.homecloud.getImmichServiceStatus");

        // Get the output from the tatus script
        
        $cmd = new \OMV\System\Process("/sbin/immich_backup_calculate_size.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function getFunnelStatus($params, $context) {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
    
        // Validate the parameters of the RPC service method.
        $this->validateMethodParams($params, "rpc.homecloud.getFunnelStatus");
        
        // Get the appname from params
        $appname = $params['appname'];
    
        // Execute the Python script with appname parameter
        $cmd = new \OMV\System\Process("/sbin/check_tailscale_funnel.py", $appname);
        $cmd->setEnv("SHELL", "/bin/sh");
        $cmd->execute($output);
        
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }
   

    public function get_backup_size_drive($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Validate the parameters of the RPC service method.
		//$this->validateMethodParams($params, "rpc.homecloud.getImmichServiceStatus");

        // Get the output from the tatus script
        
        $cmd = new \OMV\System\Process("/sbin/drive_backup_calculate_size.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function get_backup_size_paperless($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Validate the parameters of the RPC service method.
		//$this->validateMethodParams($params, "rpc.homecloud.getImmichServiceStatus");

        // Get the output from the tatus script
        
        $cmd = new \OMV\System\Process("/sbin/paperless_backup_calculate_size.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function get_backup_size_joplin($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Validate the parameters of the RPC service method.
		//$this->validateMethodParams($params, "rpc.homecloud.getImmichServiceStatus");

        // Get the output from the tatus script
        
        $cmd = new \OMV\System\Process("/sbin/joplin_backup_calculate_size.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function get_free_space_internaldisk($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Validate the parameters of the RPC service method.
		//$this->validateMethodParams($params, "rpc.homecloud.getImmichServiceStatus");

        // Get the output from the tatus script
        
        $cmd = new \OMV\System\Process("/sbin/get_free_space_internaldisk.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function get_backup_size_vaultwarden($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Validate the parameters of the RPC service method.
		//$this->validateMethodParams($params, "rpc.homecloud.getImmichServiceStatus");

        // Get the output from the tatus script
        
        $cmd = new \OMV\System\Process("/sbin/vaultwarden_backup_calculate_size.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function getWiFiStatus($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Get the output from the tailscale status script
        
        $cmd = new \OMV\System\Process("/sbin/check_wifi_status.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        $cmd->setRedirect2to1();
        $cmd->execute($output);

       	/*throw new \RuntimeException(sprintf(
					"Output: %s",
					$output
				));
                */
        
        // Convert the output to JSON and return it
        return $output;

    }

    
    public function restart_immich($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Get the output from the tailscale status script
        
        $cmd = new \OMV\System\Process("/sbin/restart_immich.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);

    }

    public function restart_jellyfin($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Get the output from the tailscale status script
        
        $cmd = new \OMV\System\Process("/sbin/restart_jellyfin.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);

    }

       
    public function restart_vaultwarden($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Get the output from the tailscale status script
        
        $cmd = new \OMV\System\Process("/sbin/restart_vaultwarden.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);

    }

    public function restart_joplin($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Get the output from the tailscale status script
        
        $cmd = new \OMV\System\Process("/sbin/restart_joplin.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);

    }

    public function restart_paperless($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Get the output from the tailscale status script
        
        $cmd = new \OMV\System\Process("/sbin/restart_paperless.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);

    }

    public function reset_immich($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Get the output from the tailscale status script
        
        $cmd = new \OMV\System\Process("/sbin/reset_immich.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function reset_jellyfin($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Get the output from the tailscale status script
        
        $cmd = new \OMV\System\Process("/sbin/reset_jellyfin.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }


    public function reset_paperless($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];
        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
        // Get the output from the tailscale status script
        $cmd = new \OMV\System\Process("/sbin/reset_paperless.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function reset_vaultwarden($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Get the output from the tailscale status script
        
        $cmd = new \OMV\System\Process("/sbin/reset_vaultwarden.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function reset_joplin($params, $context) {
        
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        // Get the output from the tailscale status script
        
        $cmd = new \OMV\System\Process("/sbin/reset_joplin.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        //$cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }

    public function getConnectedDevicesTailscale($params, $context) {
        error_log("Starting getConnectedDevicesTailscale");
        
        // ... rest of the code as above ...
        $output_err = "";
        $cmdArgs = [];

        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);

        try {
            $cmd = new \OMV\System\Process("/sbin/get_connected_devices_tailscale.sh");
            error_log("Created Process object");
            
            $cmd->setEnv("SHELL", "/bin/sh");
            error_log("Set shell environment");
            
            error_log("About to execute command");
            $cmd->execute($output);
            // Join the array elements to create a complete JSON string
            $jsonString = implode("", $output);
            $jsonData = json_decode($jsonString, true);
            return $this->applyFilter($jsonData['data'], $params['start'],
			$params['limit'], $params['sortfield'], $params['sortdir']);
            //return $jsonData;

        } catch (\Exception $e) {
            error_log("Exception caught: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }
    
    public function getConnectedDeviceswindowsTailscale($params, $context) {
        error_log("Starting getConnectedDevicesTailscale");
        
        // ... rest of the code as above ...
        $output_err = "";
        $cmdArgs = [];

        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);

        try {
            $cmd = new \OMV\System\Process("/sbin/get_connected_devices_tailscale.sh windows");
            error_log("Created Process object");
            
            $cmd->setEnv("SHELL", "/bin/sh");
            error_log("Set shell environment");
            
            error_log("About to execute command");
            $cmd->execute($output);
            // Join the array elements to create a complete JSON string
            $jsonString = implode("", $output);
            $jsonData = json_decode($jsonString, true);
            return $this->applyFilter($jsonData['data'], $params['start'],
			$params['limit'], $params['sortfield'], $params['sortdir']);
            //return $jsonData;

        } catch (\Exception $e) {
            error_log("Exception caught: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }

    public function getConnectedDevicesmacosTailscale($params, $context) {
        error_log("Starting getConnectedDevicesTailscale");
        
        // ... rest of the code as above ...
        $output_err = "";
        $cmdArgs = [];

        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);

        try {
            $cmd = new \OMV\System\Process("/sbin/get_connected_devices_tailscale.sh macos");
            error_log("Created Process object");
            
            $cmd->setEnv("SHELL", "/bin/sh");
            error_log("Set shell environment");
            
            error_log("About to execute command");
            $cmd->execute($output);
            // Join the array elements to create a complete JSON string
            $jsonString = implode("", $output);
            $jsonData = json_decode($jsonString, true);
            return $this->applyFilter($jsonData['data'], $params['start'],
			$params['limit'], $params['sortfield'], $params['sortdir']);
            //return $jsonData;

        } catch (\Exception $e) {
            error_log("Exception caught: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }

    public function getConnectedDevicesiosTailscale($params, $context) {
        error_log("Starting getConnectedDevicesTailscale");
        
        // ... rest of the code as above ...
        $output_err = "";
        $cmdArgs = [];

        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);

        try {
            $cmd = new \OMV\System\Process("/sbin/get_connected_devices_tailscale.sh ios");
            error_log("Created Process object");
            
            $cmd->setEnv("SHELL", "/bin/sh");
            error_log("Set shell environment");
            
            error_log("About to execute command");
            $cmd->execute($output);
            // Join the array elements to create a complete JSON string
            $jsonString = implode("", $output);
            $jsonData = json_decode($jsonString, true);
            return $this->applyFilter($jsonData['data'], $params['start'],
			$params['limit'], $params['sortfield'], $params['sortdir']);
            //return $jsonData;

        } catch (\Exception $e) {
            error_log("Exception caught: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }

    public function getConnectedDevicesandroidTailscale($params, $context) {
        error_log("Starting getConnectedDevicesTailscale");
        
        // ... rest of the code as above ...
        $output_err = "";
        $cmdArgs = [];

        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);

        try {
            $cmd = new \OMV\System\Process("/sbin/get_connected_devices_tailscale.sh android");
            error_log("Created Process object");
            
            $cmd->setEnv("SHELL", "/bin/sh");
            error_log("Set shell environment");
            
            error_log("About to execute command");
            $cmd->execute($output);
            // Join the array elements to create a complete JSON string
            $jsonString = implode("", $output);
            $jsonData = json_decode($jsonString, true);
            return $this->applyFilter($jsonData['data'], $params['start'],
			$params['limit'], $params['sortfield'], $params['sortdir']);
            //return $jsonData;

        } catch (\Exception $e) {
            error_log("Exception caught: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }

    public function restore_find_backups($params, $context) {
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);
        $this->validateMethodParams($params, "rpc.homecloud.restore_find_backups");

        try {
            $cmdArgs[]='export APP_NAME='.escapeshellarg(trim($params["app"])).';';
            $cmdArgs[]='sudo /sbin/restore_find_backups.py $APP_NAME';
            $cmd = new \OMV\System\Process($cmdArgs);

            $cmd->setEnv("SHELL", "/bin/sh");
            $cmd->execute($output);
            // Join the array elements to create a complete JSON string
            $jsonString = implode("", $output);
            $jsonData = json_decode($jsonString, true);
            return $this->applyFilter($jsonData['data'], $params['start'],
			$params['limit'], $params['sortfield'], $params['sortdir']);
            //return $jsonData;

        } catch (\Exception $e) {
            error_log("Exception caught: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }



    public function get_external_disks($params, $context) {
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);



        try {
            $cmd = new \OMV\System\Process("/sbin/get_external_disks.sh");
            $cmd->setEnv("SHELL", "/bin/sh");
            $cmd->execute($output);
            // Join the array elements to create a complete JSON string
            $jsonString = implode("", $output);
            $jsonData = json_decode($jsonString, true);
            return $this->applyFilter($jsonData['data'], $params['start'],
			$params['limit'], $params['sortfield'], $params['sortdir']);
            //return $jsonData;

        } catch (\Exception $e) {
            error_log("Exception caught: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }

        /**
     * Get list of Jellyfin users.
     * @param params The method parameters.
     * @param context The context of the caller.
     * @return Array containing the list of Jellyfin users.
     */
    public function jellyfin_getusers($params, $context) {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        
        $db_file = '/var/lib/jellyfin/config/data/jellyfin.db';
        $users = '';
        
        try {
            // Check if the database file exists
            if (file_exists($db_file)) {
                // Use exec directly to isolate issues with OMV Process wrapper
                $output = [];
                $cmd = "sqlite3 " . escapeshellarg($db_file) . " 'SELECT Username FROM Users;'";
                exec($cmd, $output, $retval);
                
                // Log raw output for debugging
                error_log("Jellyfin user query returned code: $retval");
                error_log("Jellyfin raw output: " . print_r($output, true));
    
                if ($retval === 0 && !empty($output)) {
                    // Clean up usernames and join them
                    $clean = array_map('trim', $output);
                    $users = implode(',', $clean);
                }
            } else {
                error_log("Jellyfin DB not found at: $db_file");
            }
    
            return [
                "users" => $users
            ];
        } catch (\Exception $e) {
            error_log("Jellyfin getusers error: " . $e->getMessage());
            return [
                "users" => ""
            ];
        }
    }
    
    /**
 * Get PIN for Jellyfin password reset.
 * @param params The method parameters.
 * @param context The context of the caller.
 * @return Array containing user and PIN information.
 */
/**
 * Get PIN for Jellyfin password reset.
 * @param params The method parameters.
 * @param context The context of the caller.
 * @return Array containing user and PIN information.
 */
    public function get_pin_jellyfin($params, $context) {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, [
            "role" => OMV_ROLE_ADMINISTRATOR
        ]);
        
        $result = [
            'user' => '',
            'pin' => ''
        ];
        
        try {
            // Default config directory
            $config_dir = '/var/lib/jellyfin/config';
            
            // Try to read the config directory from docker-compose.yml
            $docker_compose_file = '/etc/jellyfin/docker-compose.yml';
            if (file_exists($docker_compose_file)) {
                $yaml_content = file_get_contents($docker_compose_file);
                
                // Parse the YAML content
                if (function_exists('yaml_parse')) {
                    $docker_config = yaml_parse($yaml_content);
                } else {
                    // Fallback to simple regex parsing if yaml_parse is not available
                    if (preg_match_all('/- ([^:]+):\/config/', $yaml_content, $matches)) {
                        if (!empty($matches[1])) {
                            $config_dir = $matches[1][0];
                        }
                    }
                }
                
                // Extract config directory from parsed YAML
                if (isset($docker_config['services']['jellyfin']['volumes'])) {
                    foreach ($docker_config['services']['jellyfin']['volumes'] as $volume) {
                        if (strpos($volume, ':/config') !== false) {
                            list($host_path, $container_path) = explode(':', $volume);
                            if ($container_path === '/config') {
                                $config_dir = trim($host_path);
                                break;
                            }
                        }
                    }
                }
            }
            
            error_log("Using Jellyfin config directory: $config_dir");
            
            // Check if directory exists
            if (!is_dir($config_dir)) {
                error_log("Jellyfin config directory not found: $config_dir");
                return $result;
            }
            
            // Find all JSON files that match the password reset pattern
            $files = glob($config_dir . '/passwordreset*.json');
            
            if (empty($files)) {
                error_log("No password reset files found in $config_dir");
                return $result;
            }
            
            // Get the most recent file based on creation time
            $latest_file = null;
            $latest_time = 0;
            
            foreach ($files as $file) {
                $file_time = filemtime($file);
                if ($file_time > $latest_time) {
                    $latest_time = $file_time;
                    $latest_file = $file;
                }
            }
            
            if (!$latest_file) {
                error_log("Failed to determine latest password reset file");
                return $result;
            }
            
            error_log("Found latest password reset file: $latest_file");
            
            // Read the JSON file
            $content = file_get_contents($latest_file);
            $data = json_decode($content, true);
            
            if (!$data || !isset($data['Pin']) || !isset($data['UserName']) || !isset($data['ExpirationDate'])) {
                error_log("Invalid JSON format in password reset file");
                return $result;
            }
            
            // Check if the PIN has expired
            $expiration_date = new \DateTime($data['ExpirationDate']);
            $current_date = new \DateTime();
            
            if ($current_date > $expiration_date) {
                error_log("PIN has expired. Expiration: " . $expiration_date->format('Y-m-d H:i:s'));
                return $result;
            }
            
            // Return the user and PIN
            $result['user'] = $data['UserName'];
            $result['pin'] = $data['Pin'];
            
            return $result;
        } catch (\Exception $e) {
            error_log("Error getting Jellyfin PIN: " . $e->getMessage());
            return $result;
        }
    }




    public function immich_get_admin_users($params, $context) {
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        $cmd = new \OMV\System\Process("/sbin/immich_get_admin_users.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        $cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);
    }
    public function immich_reset_admin_password($params, $context) {
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        $cmd = new \OMV\System\Process("/sbin/immich_reset_password.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        $cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);

    }
     public function paperless_reset_password($params, $context) {
	    $output_err="";
		$cmdArgs = [];

        // Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
		]);

        $this->validateMethodParams($params, "rpc.homecloud.paperless_reset_password");


        return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
				use ($params) {

        
	    $output_err="";
		$cmdArgs = [];
        $cmdArgs[]='echo "Resetting password";';
		$cmdArgs[]='export USER='.escapeshellarg(trim($params["user"])).';';
   		$cmdArgs[]='export PASSWORD='.escapeshellarg(trim($params["password"])).';';

        $cmdArgs[]='/sbin/paperless_reset_password.py $USER $PASSWORD';
        $cmd = new \OMV\System\Process("sudo", $cmdArgs);
		$cmd->setEnv("SHELL", "/bin/sh");
		$cmd->setRedirect2to1();
		if (0 !== ($exitStatus = $this->exec($cmd, $output,
			$bgOutputFilename))) {
			//throw new \OMV\ExecException($cmd, $output, $exitStatus);
			throw new \OMV\ExecException($cmd,$output, $exitStatus);
		    }

			return $output;
        });




        $cmdArgs[]='export OAUTH_CLIENT_ID='.escapeshellarg(trim($params["clientid"])).';';




        $cmd = new \OMV\System\Process("/sbin/immich_reset_password.sh");
        $cmd->setEnv("SHELL", "/bin/sh");
        $cmd->setRedirect2to1();
        $cmd->execute($output);
        // Since the script outputs JSON directly, just return the first line
        return json_decode($output[0], true);

    }

    /**
	 * Execute the getList() RPC as background process.
	 */
	public function getConnectedDevicesTailscaleBg($params, $context) {
		return $this->callMethodBg("getConnectedDevicesTailscale", $params, $context);
	}

    public function getConnectedDeviceswindowsTailscaleBg($params, $context) {
		return $this->callMethodBg("getConnectedDeviceswindowsTailscale", $params, $context);
	}

    public function getConnectedDevicesiosTailscaleBg($params, $context) {
		return $this->callMethodBg("getConnectedDevicesiosTailscale", $params, $context);
	}
    
    public function getConnectedDevicesmacosTailscaleBg($params, $context) {
		return $this->callMethodBg("getConnectedDevicesmacosTailscale", $params, $context);
	}
    
    public function getConnectedDevicesandroidTailscaleBg($params, $context) {
		return $this->callMethodBg("getConnectedDevicesandroidTailscale", $params, $context);
	}
    public function get_external_disksBg($params, $context) {
		return $this->callMethodBg("get_external_disks", $params, $context);
	}
    public function restore_find_backupsBg($params, $context) {
		return $this->callMethodBg("restore_find_backups", $params, $context);
	}


}