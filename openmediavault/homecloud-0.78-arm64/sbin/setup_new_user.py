import argparse
import os
from pathlib import Path
import pwd
import shutil
import yaml
import subprocess
import socket

DOCKER_COMPOSE_ORIGINAL_FILE='/usr/share/homecloud/docker-compose.yml'
DOCKER_COMPOSE_DESTINATION=''
# List of directories to create
directories = [
        '.photoprism/storage',
        'homecloud'
    ]
home_dir = ''
user=''
password = ''

def create_directories(username):
    global DOCKER_COMPOSE_DESTINATION
    global directories
    global home_dir
    global user
    # Get the home directory for the specified user
    home_dir = Path(f'/home/{username}')
    user = username
    # Get the user ID and group ID for the specified username
    try:
        uid = pwd.getpwnam(username).pw_uid
        gid = pwd.getpwnam(username).pw_gid
    except KeyError:
        print(f"Error: User '{username}' not found.")
        return False
    # Create each directory
    # first check if directories already exist. If yes then skip creation
    if os.path.exists(home_dir / directories[0]) and os.path.exists(home_dir / directories[1]):
        print("Directories already exist. Skipping creation.")
    else:
        for dir_name in directories:
            dir_path = home_dir / dir_name
            try:
                dir_path.mkdir(parents=True, exist_ok=True)
                os.chown(dir_path, uid, gid)
                print(f"Created directory: {dir_path}")
            except PermissionError:
                print(f"Permission denied: Unable to create {dir_path}")
            except Exception as e:
                print(f"Error creating {dir_path}: {str(e)}")
                return False
    
    DOCKER_COMPOSE_DESTINATION=f'{home_dir}/.docker-compose.yml'
    if (user=="family"): #for family user (which has admin rights also) the yaml file is located in /etc/photoprism directory
        DOCKER_COMPOSE_DESTINATION='/etc/photoprism/docker-compose.yml'
    #check if destination file DOCKER_COMPOSE_DESTINATION already exists. If yes then don't do anything
    if os.path.exists(DOCKER_COMPOSE_DESTINATION):
        print(f"File already exists: {DOCKER_COMPOSE_DESTINATION}")
        return "USER_EXISTS"

    #Copy template of docker_compose file for user to home directory
    if not os.path.exists(DOCKER_COMPOSE_ORIGINAL_FILE):
        raise FileNotFoundError(f"Source file not found: {DOCKER_COMPOSE_ORIGINAL_FILE}")
        return False

    #check if template filel 
    try:
        shutil.copy2(DOCKER_COMPOSE_ORIGINAL_FILE, DOCKER_COMPOSE_DESTINATION)
        os.chown(DOCKER_COMPOSE_DESTINATION, uid, gid)
        print(f"File successfully copied from {DOCKER_COMPOSE_ORIGINAL_FILE} to {DOCKER_COMPOSE_DESTINATION}")
    except PermissionError:
        print(f"Permission denied. Unable to copy the file.")
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return False
    
    return True


    
    #Update docker_compose_file with new path

def get_tailscale_hostname():
    try:
        # Run the tailscale status command
        result = subprocess.run(['tailscale', 'status', '--json'], 
                                capture_output=True, text=True, check=True)
        
        # The output is in JSON format, so we can parse it
        import json
        status = json.loads(result.stdout)
        
        # The hostname is in the 'Self' section
        hostname = status['Self']['DNSName']
        return hostname
    except subprocess.CalledProcessError as e:
        print(f"Error running tailscale command: {e}")
    except json.JSONDecodeError as e:
        print(f"Error parsing tailscale output: {e}")
    except KeyError as e:
        print(f"Unexpected tailscale output format: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    return None

def check_service_status(service_name):
    try:
        result = subprocess.run(["systemctl", "status", service_name], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        #print(f"Service '{service_name}' status:\n{result.stdout}")
        for line in result.stdout.split("\n"):
            if "Active:" in line:
                short_status = line.split(":")[1].strip()
                short_1_status = short_status.split('(', 1)
                #print(f"Service '{service_name}' status: {short_status}\n{short_1_status[0]}")
                #return short_1_status[0]
                if "active" in short_1_status[0]:
                    for line in result.stdout.split("\n"):
                        if "Status:" in line:
                            if "Connected" in line:
                               # print(f"returining Up")
                                return "Up"
                            else:
                               # print(f"returining Down")
                                return "Down"
        return "Not configured"
    except subprocess.CalledProcessError as e:
        print(f"Error checking service '{service_name}' status: {e}")

def start_photoprism_service():
    global DOCKER_COMPOSE_DESTINATION
    try:
        subprocess.run(["docker", "compose", "-f", DOCKER_COMPOSE_DESTINATION , "up", "--detach"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        #sleep(10)
        return True
    except:
        return False

def update_photoprism_YAML(): # updates YAML config of photoprism for user specific photoprism instance configuration
    try:
        global directories
        global home_dir
        global user
        global DOCKER_COMPOSE_DESTINATION
        #with open('//etc/photoprism/docker-compose.yml', 'r') as file:
        with open(DOCKER_COMPOSE_DESTINATION, 'r') as file:
            data = yaml.safe_load(file)
        file.close()

        hostname=get_hostname()

        #print(f"hostname is {hostname}")
        del data['services']['photoprism']['volumes'][0]
        data['services']['photoprism']['volumes'].append(f'{home_dir}/{directories[0]}:/photoprism/storage')
        data['services']['photoprism']['volumes'].append(f'{home_dir}:/photoprism/originals')
        data['services']['photoprism']['labels'].append(f"traefik.http.routers.photoprism-{user}.rule=HostRegexp(`{{any:.+}}`) && PathPrefix(`/{user}`)")
        data['services']['photoprism']['labels'].append(f"traefik.http.routers.photoprism-{user}.tls=true")
        data['services']['photoprism']['labels'].append(f"traefik.http.routers.photoprism-{user}.tls.certresolver=myresolver")
        data['services']['photoprism']['environment']['PHOTOPRISM_SITE_CAPTION'] = f'{user} photos'
        data['services']['photoprism']['environment']['PHOTOPRISM_SITE_URL'] = f'http://{hostname}/{user}'
        
        try:
            with open(DOCKER_COMPOSE_DESTINATION, 'w') as file:
                yaml.dump(data, file, default_flow_style=False)
            file.close()
        except:
            print("Error: Unable to write to YAML file")
            return False
        return True

    except:
        print("Error: Unable to open YAML file")
        return False

def reset_photoprism_db():
    global DOCKER_COMPOSE_DESTINATION
    try:
        subprocess.run(["docker", "compose", "-f", DOCKER_COMPOSE_DESTINATION, "exec", "photoprism", "photoprism", "reset", "-y"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        return True
    except:
        return False

def delete_all_photoprism_users():
    global DOCKER_COMPOSE_DESTINATION
    try:
        subprocess.run(["docker", "compose", "-f", DOCKER_COMPOSE_DESTINATION, "exec", "photoprism", "photoprism", "user", "reset", "-y"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        return True
    except:
        return False

def add_photoprism_user():
    global DOCKER_COMPOSE_DESTINATION
    global user
    global password
    try:
        email = f'{user}@local.local'
        webdavuploadpath = f'/photoprism/originals/{user}/homecloud'
        subprocess.run(["docker", "compose", "-f", DOCKER_COMPOSE_DESTINATION, "exec", "photoprism", "photoprism", "user", "add", "-n", user, "-m", email, "-p", password, "-r", "admin", "-s", "-w", user], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        return True
    except:
        return False

def set_passwd_admin_user():
    global DOCKER_COMPOSE_DESTINATION
    global password
    try:
        subprocess.run(["docker", "compose", "-f", DOCKER_COMPOSE_DESTINATION, "exec", "photoprism", "photoprism", "users", "mod", "-p", password, "admin"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        return True
    except:
        return False

def stop_photoprism_service():
    global DOCKER_COMPOSE_DESTINATION
    try:
        subprocess.run(["docker", "compose", "-f", DOCKER_COMPOSE_DESTINATION, "down"], check=True, stdout=subprocess.PIPE, universal_newlines=True)
        return True
    except:
        return False

def delete_directories(username):
    global directories
    global home_dir
    global user
    try:
        if home_dir.exists():
            print(f"home_dir is {home_dir}")
            shutil.rmtree(home_dir)
            print(f"Deleted directory: {home_dir}")
        else:
            print(f"Directory {home_dir} does not exist.")
        return True
    except:
        return False

def get_hostname():
    try:
        # Get the hostname
        if (check_service_status("tailscaled.service") == "Up"):
            hostname = get_tailscale_hostname()
        else:
            hostname = f"{socket.gethostname()}.local"
            #print(f"hostname is {hostname}")
        if hostname.endswith('.'):
            return hostname[:-1]
        return hostname
    except:
        return "Unable to get hostname"


def main():
    # Set up argument parser
    parser = argparse.ArgumentParser(description="Setup photoprism instance for specific user")
    parser.add_argument('username', help='The username of the account')
    parser.add_argument('password', help='The password for photoprism that needs to be set for the user')
    parser.add_argument('action', help='add or delete user')
    global password
    # Parse arguments
    args = parser.parse_args()
    password = args.password
    action = args.action
    # Call function to create directories
    if (action =='add'):
        if (create_directories(args.username) == True):
            if (update_photoprism_YAML() == True):
                if(start_photoprism_service() == True):
                    reset_photoprism_db()
                    delete_all_photoprism_users()
                    add_photoprism_user()
                    set_passwd_admin_user()
        else:
            if (create_directories(args.username) == "USER_EXISTS"): # directory and user already exists so we are invoked for password reset only
                #create_directories(args.username)
                delete_all_photoprism_users()
                add_photoprism_user()
                set_passwd_admin_user()
            else:
                return False
    if (action == 'delete'):
        if (create_directories(args.username) == "USER_EXISTS"):
            stop_photoprism_service()
            delete_directories(args.username)
            return True
        else:
            print(f"User {args.username} home directory does not exist")
            return False
if __name__ == '__main__':
    main()
