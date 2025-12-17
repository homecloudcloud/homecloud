#!/usr/bin/env python3
import subprocess
import json
import shlex


# The filesystem to update
TARGET_FS = "/dev/mapper/DATA_VOL-home_dirs"
NEW_OPTS = "x-systemd.device-timeout=30,x-systemd.requires=lvm2-activation-early.service"

def get_mount_point(fsname):
    """Return mount point of the given filesystem using df -h"""
    try:
        df_out = subprocess.check_output(["df", "-h"], text=True)
        for line in df_out.splitlines():
            if line.startswith(fsname):
                parts = line.split()
                return parts[5]  # Mount point is 6th column
    except subprocess.CalledProcessError as e:
        print("Error running df:", e)
    return None

def read_omv_mountpoints():
    """Return list of OMV mountpoints as Python objects"""
    try:
        out = subprocess.check_output(
            ["omv-confdbadm", "read", "conf.system.filesystem.mountpoint"],
            text=True
        )
        return json.loads(out)
    except subprocess.CalledProcessError as e:
        print("Failed to read OMV mountpoints:", e)
    except json.JSONDecodeError as e:
        print("Failed to parse OMV JSON:", e)
    return []


def update_mount_opts(fs_entry, new_opts):
    existing_opts = fs_entry.get("opts", "")
    
    # Check if new options already exist
    if new_opts in existing_opts:
        print(f"Options '{new_opts}' already present in mount options")
        return False
    
    # Append new options to existing opts
    if existing_opts:
        fs_entry["opts"] = f"{existing_opts},{new_opts}"
    else:
        fs_entry["opts"] = new_opts
    
    json_data = json.dumps(fs_entry)
    
    subprocess.run(
        ["omv-confdbadm", "update", "conf.system.filesystem.mountpoint", "-"],
        input=json_data,
        text=True,
        check=True
    )
    return True



def main():
    mount_point = get_mount_point(TARGET_FS)
    if not mount_point:
        print(f"Mount point for {TARGET_FS} not found.")
        return

    mounts = read_omv_mountpoints()
    if not mounts:
        print("No OMV mountpoints found.")
        return

    # Find the filesystem entry that matches our mount point
    fs_to_update = None
    for fs in mounts:
        if fs.get('dir') == mount_point:
            fs_to_update = fs
            break
    
    if not fs_to_update:
        print(f"No OMV entry found for {mount_point}")
        return

    # Update the mount options
    if update_mount_opts(fs_to_update, NEW_OPTS):
        print(f"Updated opts for {mount_point} to: {NEW_OPTS}")
        print("Deploying fstab changes...")
        subprocess.run(["omv-salt", "deploy", "run", "fstab"], check=True)
        print("Fstab deployment completed")
    else:
        print(f"No changes needed for {mount_point}")

if __name__ == "__main__":
    main()
