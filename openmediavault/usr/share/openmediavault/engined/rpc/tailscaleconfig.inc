<?php
/**
 * This file is part of OpenMediaVault.
 *
 * @license   http://www.gnu.org/licenses/gpl.html GPL Version 3
 * @author    Volker Theile <volker.theile@openmediavault.org>
 * @copyright Copyright (c) 2009-2024 Volker Theile
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
 *
 * You should have received a copy of the GNU General Public License
 * along with OpenMediaVault. If not, see <http://www.gnu.org/licenses/>.
 */

//Home cloud changes new component
namespace Engined\Rpc;

require_once("openmediavault/functions.inc");

class TailscaleConfig extends \OMV\Rpc\ServiceAbstract {

	/**
	 * Get the RPC service name.
	 */


	public function getName() {
		return "TailscaleConfig";
	}

	/**
	 * Initialize the RPC service.
	 */
	public function initialize() {
		$this->registerMethod("generateAccessToken");
		$this->registerMethod("DisconnectVPN");
		$this->registerMethod("ConnectVPN");
		$this->registerMethod("savetailscaleTermsFlag");

	}

	public function generateAccessToken($params, $context) {
	    // Validate the RPC caller context.
	    $this->validateMethodContext($context, [
	        "role" => OMV_ROLE_ADMINISTRATOR
	    ]);
		
	    // Validate the parameters of the RPC service method.
	    $this->validateMethodParams($params["tailscaleClientData"], "rpc.homecloud.generateAccessToken");
	    $this->savetailscaleTermsFlag($params["tailscaleTermsData"], $context);
	    return $this->execBgProc(function($bgStatusFilename, $bgOutputFilename)
	            use ($params) {
	            
	        $cmdArgs = [];
	        $cmdArgs[] = '/sbin/tailscale-config.py';
	        $cmdArgs[] = '--client-id';
	        $cmdArgs[] = escapeshellarg(trim($params["tailscaleClientData"]["clientid"]));
	        $cmdArgs[] = '--client-secret';
	        $cmdArgs[] = escapeshellarg(trim($params["tailscaleClientData"]["clientsecret"]));
	        $cmdArgs[] = '--tailnet-name';
	        $cmdArgs[] = escapeshellarg(trim($params["tailscaleClientData"]["tailnetname"]));
	
	        $cmd = new \OMV\System\Process("sudo", $cmdArgs);
	        $cmd->setEnv("SHELL", "/bin/sh");
	        $cmd->setRedirect2to1();
	        
	        if (0 !== ($exitStatus = $this->exec($cmd, $output, $bgOutputFilename))) {
	            throw new \OMV\ExecException($cmd, $output, $exitStatus);
	        }
	        return $output;
			
	    });
	}
	
	
	public function DisconnectVPN($params, $context) {
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
			]);

			// Get the output from the tailscale status script
			try {
				$cmd = new \OMV\System\Process("/sbin/tailscale_disconnect.sh");
				$cmd->setEnv("SHELL", "/bin/sh");
				$output = [];
				$result = (int) $cmd->execute($output);
				if ($result !== 0) {
					throw new \RuntimeException(sprintf(
						"Failed to execute. Error: %d",
						implode("\n", $output),$result
					));
				}
				return "Successfully disconnected from VPN";
			}catch (\Exception $e) {
				// Log and rethrow exceptions for further handling
				error_log("Error executing VPN disconnect");
				throw $e;
			}


		}

		public function ConnectVPN($params, $context) {
			$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR
			]);

			// Get the output from the tailscale status script
			try {
				$cmd = new \OMV\System\Process("/sbin/tailscale_connect.sh");
				$cmd->setEnv("SHELL", "/bin/sh");
				$output = [];
				$result = (int) $cmd->execute($output);
				if ($result !== 0) {
					throw new \RuntimeException(sprintf(
						"Failed to execute. Error: %d",
						implode("\n", $output),$result
					));
				}
				//return [
				//    'status' => 'success',
				//    'message' => 'VPN connected successfully'
				//];
				return "Successfully connected to VPN";
			}catch (\Exception $e) {
				// Log and rethrow exceptions for further handling
				error_log("Error executing VPN connect");
				throw $e;
			}
		}
		final public function savetailscaleTermsFlag($params,$context){
		
			try{
				// Validate the parameters of the RPC service method.
					$this->validateMethodParams($params, "rpc.common.savetailscaletermsflags");
					// Get the tailscale terms data from parameters
					$tailscaleTermsData = $params;
	
					// Validate required fields
					if (!isset($tailscaleTermsData['tailscaleTermsVersion']) ||
						!isset($tailscaleTermsData['user']) ||
						!isset($tailscaleTermsData['accepted']) ||
						!isset($tailscaleTermsData['accepted-date'])|
						!isset($tailscaleTermsData['comment'])) {
						throw new \OMV\Exception(sprintf("Missing required tailscale terms data fields"));
					}
	
					//Read flag file contents in an array if file exists already else create new file
	
					$flagFile = "/var/flagsfile.json";
	
					// Read existing data
					$flagArray = [];
					if(file_exists($flagFile)){
						$flagArray=json_decode(file_get_contents($flagFile),true);
					
					}
					
				
					if ($tailscaleTermsData['accepted'] === true){
						
						// Write a new entry to file every time user accepts license flag
						$flagArray[] = $tailscaleTermsData;
						if (file_put_contents($flagFile, json_encode($flagArray)) === false) {
							throw new \OMV\Exception("Failed to write tailscale terms data");
						}
						
						
					}
					else{
						
						throw new \OMV\Exception(sprintf("Tailscale terms have not been accepted yet.".
								" Please accept the terms before moving to next step."));
					}
				
	
	
				 }catch (\Exception $e) {
					throw $e;
				}
				
	
		}
	}

