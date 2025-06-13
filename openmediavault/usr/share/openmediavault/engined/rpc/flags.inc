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

 /**Home cloud changes new component */

namespace Engined\Rpc;


require_once("openmediavault/functions.inc");

class Flags extends \OMV\Rpc\ServiceAbstract {
	/**
	 * Get the RPC service name.
	 */
	public function getName() {
		return "Flags";
	}

	/**
	 * Initialize the RPC service.
	 */
	public function initialize() {
		$this->registerMethod("saveLicenseFlag");
		$this->registerMethod("readLicenseFlag");
		$this->registerMethod("readLicenseText");
		$this->registerMethod("readSetUpFlags");
		$this->registerMethod("saveSetUpFlags");
		$this->registerMethod("saveLastCompletedStep");
		$this->registerMethod("readLastCompletedStep");

	}

    final public function saveLicenseFlag($params,$context){
		
		try{

			// Validate the parameters of the RPC service method.
				$this->validateMethodParams($params, "rpc.common.savelicenseflags");
				// Get the license data from parameters
				$licenseData = $params['licenseData'];

				// Validate required fields
				if (!isset($licenseData['licenseVersion']) ||
					!isset($licenseData['user']) ||
					!isset($licenseData['accepted']) ||
					!isset($licenseData['accepted-date'])|
					!isset($licenseData['comment'])) {
					throw new \OMV\Exception(sprintf("Missing required license data fields"));
				}

				//Read flag file contents in an array if file exists already else create new file

				$flagFile = "/var/flagsfile.json";

				// Read existing data
				$flagArray = [];
				if(file_exists($flagFile)){
					$flagArray=json_decode(file_get_contents($flagFile),true);
				
				}
				
			
				if ($licenseData['accepted'] === true){
					/*$entryExists=false;
					foreach ($flagArray as $entry) {
						if (isset($entry['user']) && 
						isset($entry['licenseVersion']) && 
						isset($entry['accepted']) &&
						$entry['user'] === $licenseData['user'] &&
						$entry['licenseVersion'] === $licenseData['licenseVersion'] &&
						$entry['accepted'] === true) 
						{
							// Entry already exists
							$entryExists=true;
							break; 
						}
						
					}
					// Check for existing entry before opening file for writing
					if ($entryExists) {
						throw new \OMV\Exception("License already accepted by this user", $entryExists);
					}
					*/
					// Write a new entry to file every time user accepts license flag
					$flagArray[] = $licenseData;
					if (file_put_contents($flagFile, json_encode($flagArray)) === false) {
						throw new \OMV\Exception("Failed to write license data");
					}
					
					
				}
				else{
					
					throw new \OMV\Exception(sprintf("License has not been accepted yet.".
							" Please accept the license before moving to next step."));
				}
			


 			}catch (\Exception $e) {
				throw $e;
			}
			

    }
     public function readLicenseFlag($params,$context){

		// Validate the parameters of the RPC service method.
		$this->validateMethodParams($params, "rpc.common.readlicenseflags");

            $flagFile = "/var/flagsfile.json";
			$flagArray=[];
			$output["flagValue"]=false;
			if (file_exists($flagFile)){

				$flagArray=json_decode(file_get_contents($flagFile),true);
				foreach ($flagArray as $entry) {
					if (isset($entry['user']) && $entry['user'] === $params['username']) {
						if ($entry['accepted'] === true) {
							$output["flagValue"]=true;
							break;
						}
						
					}
				}

			}
			
			return $output;

    }

	public function readLicenseText($params,$context){
		
		$licenseFile="/etc/homecloud/license.json";
		if (file_exists($licenseFile)){
				$licenseTextData=json_decode(file_get_contents($licenseFile), true);
				foreach($licenseTextData as $entry){
					if(isset($entry['latest']) && $entry['latest'] === true){
						return $entry;
					}
				}
		}		
		else{
				throw new \OMV\Exception(sprintf("License file does not exist."));
		}

	}

	final public function saveSetUpFlags($params,$context){   //Allowed for admin only

		
		try{
			// Validate the RPC caller context.
				$this->validateMethodContext($context, [
					"role" => OMV_ROLE_ADMINISTRATOR
				]);

			// Validate the parameters of the RPC service method.
				$this->validateMethodParams($params, "rpc.common.saveSetUpflags");
				// Get the flag data from parameters
				$flagName = $params['flagName'];
				$flagValue = $params['flagValue'];
				$flagData=[$flagName=>$flagValue];

				// Validate required fields
				if (!isset($flagName) ||
					!isset($flagValue) )
					 {
					throw new \OMV\Exception(sprintf("Missing required flag fields"));
				}

				//Read flag file contents in an array if file exists already else create new file

				$flagFile = "/var/flagsfile.json";

				// Read existing data
				$flagArray = [];
				if(file_exists($flagFile)){
					$flagArray=json_decode(file_get_contents($flagFile),true);
				
				}
				
			
				if ($flagValue === true){
					$entryExists=false;
					foreach ($flagArray as $entry) {
						if (array_key_exists($flagName,$entry))
						{
							// Entry already exists
							$entryExists=true;
							break; 
						}
						
					}
					// Check for existing entry before opening file for writing
					if (!$entryExists) {
			
						// Only open and write to file if we're actually going to add new data
						$flagArray[] = $flagData;
						if (file_put_contents($flagFile, json_encode($flagArray)) === false) {
							throw new \OMV\Exception("Failed to write flag data");
						}
					}
					
				}
			

 			}catch (\Exception $e) {
				throw $e;
			}
			

    }
     public function readSetUpFlags($params,$context){   //Allowed for admin only

		// Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR    
		]);

		// Validate the parameters of the RPC service method.
		$this->validateMethodParams($params, "rpc.common.readSetUpFlags");

            $flagFile = "/var/flagsfile.json";
			$flagArray=[];
			$flagName=$params['flagName'];
			$output["flagValue"]=false;
			if (file_exists($flagFile)){

				$flagArray=json_decode(file_get_contents($flagFile),true);
				foreach ($flagArray as $entry) {
					if (array_key_exists($flagName,$entry)) {
							$output["flagValue"]=$entry[$flagName];
							break;
						}
						
				}
				

			}
			
			return $output;

    }




	final public function saveLastCompletedStep($params,$context){   //Allowed for admin only

		
		try{
			// Validate the RPC caller context.
				$this->validateMethodContext($context, [
					"role" => OMV_ROLE_ADMINISTRATOR
				]);

			// Validate the parameters of the RPC service method.
				$this->validateMethodParams($params, "rpc.common.saveLastCompletedStep");
				// Get the flag data from parameters
				$lastCompletedStepName = $params['lastCompletedStepName']; 
				
				
				// Validate required fields
				if (!isset($lastCompletedStepName) )
				{
					throw new \OMV\Exception(sprintf("Missing required step name field"));
				}

				//Read flag file contents in an array if file exists already else create new file

				$flagFile = "/var/flagsfile.json";

				// Read existing data
				$flagArray = [];
				if(file_exists($flagFile)){
					$flagArray=json_decode(file_get_contents($flagFile),true);
				
				}
				
			
				
				$entryExists=false;
				// Loop through and update existing entry
				foreach ($flagArray as $key => $entry) {
					if (array_key_exists("lastCompletedStepName", $entry)) {
						// Update the existing entry
						$flagArray[$key]["lastCompletedStepName"] = $lastCompletedStepName;
						$entryExists = true;
						break;
					}
				}
				
				// If entry doesn't exist, add new one
				if (!$entryExists) {
					$flagArray[] = ["lastCompletedStepName" => $lastCompletedStepName];
				}
		
				// Write back to file
				if (file_put_contents($flagFile, json_encode($flagArray)) === false) {
					throw new \OMV\Exception("Failed to write flag data");
				}
				else{
					if($params['lastCompletedStepName'] === 'complete'){
						$this->saveSetUpFlags(['flagName'=>'setup_overall_flag','flagValue'=>true],$context);
					}
				}
					
				
			

 			}catch (\Exception $e) {
				throw $e;
			}
			

    }
    final  public function readLastCompletedStep($params,$context){   //Allowed for admin only

		// Validate the RPC caller context.
		$this->validateMethodContext($context, [
			"role" => OMV_ROLE_ADMINISTRATOR    
		]);


            $flagFile = "/var/flagsfile.json";
			$flagArray=[];
			$output["lastCompletedStepName"]='';
			if (file_exists($flagFile)){

				$flagArray=json_decode(file_get_contents($flagFile),true);
				foreach ($flagArray as $entry) {
					if (array_key_exists('lastCompletedStepName',$entry)) {
							$output['lastCompletedStepName']=$entry['lastCompletedStepName'];
							break;
						}
						
				}
				

			}
			
			return $output;

    }



}



