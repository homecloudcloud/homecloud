import subprocess
import json
import sys
import openmediavault.firstaid
import openmediavault.net
import openmediavault.rpc
import openmediavault.stringutils
import openmediavault
import urllib.request
import requests

def send_api_request(path,variable,data):
    try:
        url = "http://127.0.0.1:5000/" + str(path)
        
        if (variable == None):
            response = requests.post(url)
        else:
            data = {variable: data}
            #print(f"data is {data}")
            response = requests.post(url, params=data)
        
        if response.status_code == 200:
            #print(f"API request sent successfully. Response: {response.text}")
            return response.text
        else:
            print(f"Error sending API request. Status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Error sending API request: {e}")

def validate_device_name(device_name):
    #check if device_name exist in enumerateMountedFileSystems list by invoking omv-rpc
    try:
        devices = openmediavault.rpc.call("FileSystemMgmt", "enumerateMountedFilesystems")
        #print(f"existing shares------------:{existing_shares}\n")
        for device in devices:
            if device['canonicaldevicefile'] == device_name:
                return device['uuid']
        return False
    except:
        return False

def get_existing_shared_folders():
    try:
        existing_shares = openmediavault.rpc.call("ShareMgmt", "enumerateSharedFolders")
        #print(f"existing shares------------:{existing_shares}\n")
        return existing_shares
    except:
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

def delete_samba_export(uuid):
    try:
        #print(f"deleting samba export {uuid}")
        rpc_params = {}
        rpc_params.update(
            {
                "uuid": uuid
            }
        )
        openmediavault.rpc.call("SMB", "deleteShare", rpc_params)
        result = subprocess.run(["/usr/sbin/omv-salt", "deploy", "run", "samba"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        #print(f"result: {result}")
        return True
    except:
        return False
    
def delete_shared_folder(uuid):
    try:
        rpc_params = {}
        rpc_params.update(
            {
                "uuid": uuid,
                "recursive": (bool(False))
            }
        )
        #print (f"Deleting shared folder: {uuid}")
        result = openmediavault.rpc.call("ShareMgmt", "delete", rpc_params)
        #print(f"result: {result}")
        result = subprocess.run(["/usr/sbin/omv-salt", "deploy", "run", "webgui"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        return True
    except:
        return False


def main(device_name):
    # Get the filesystem UUID from the device name
    fs_uuid = validate_device_name(device_name)
    shared_folder_uuid=False
    if (fs_uuid != False):
        #find if this has a shared folder
        shared_folders = get_existing_shared_folders()
        for folder in shared_folders:
            if (folder['mntent']['devicefile'] == device_name):
                #print(f"Deleting shared folder: {folder['uuid']}")
                shared_folder_uuid=folder['uuid']
                break
        if (shared_folder_uuid!=False):
            #check smb share and delete it
            #print(f"shared folder to delete is {shared_folder_uuid}")
            smb_shares =  get_existing_samba_export_list()
            for share in smb_shares['data']:
                if (share['sharedfolderref'] == shared_folder_uuid):
                    #print(f"Found samba share: {share['name']}")
                    if (delete_samba_export(share['uuid'])==True):        
                        break
                    else:
                    #    print(f"Error: Failed to delete samba share {share['name']}")
                        return False
            delete_shared_folder(shared_folder_uuid)
        #now stop photoprism and filebrowser services before unmounting drive as these may be using the drive. Also update YAML files
        send_api_request("stop_photoprism_service",None,None)
        # lets stop other process from starting photoprism till we unmount the drive and update YAML
        subprocess.run(["touch", "/tmp/photoprism-start-stop-in-progress"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        # Unmount the filesystem
        #print(f"Unmounting filesystem: {fs_uuid}")
        uuid=fs_uuid
        send_api_request("unmount_fs","uuid",uuid)
        #update YAML for photoprism and filebrowser
        send_api_request("update_YAML",None,None)
        #delete the temp file so other process can start photoprism and filebrowser
        subprocess.run(["rm", "-f", "/tmp/photoprism-start-stop-in-progress"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
    else:
        print(f"Error: No filesystem found for device {device_name}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py <device_name>")
        print("Example: python script.py /dev/sda1")
        sys.exit(1)
    
    device_name = sys.argv[1]
    main(device_name)
