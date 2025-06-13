#!/usr/bin/env python3

import sys
import json
import subprocess
import argparse
import os
import tempfile

def get_service_status() -> dict:
    """Get Paperless service status"""
    try:
        cmd = ['omv-rpc', '-u', 'admin', 'Homecloud', 'getPaperlessServiceStatus']
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0 and result.stdout.strip():
            return json.loads(result.stdout.strip())
    except Exception as e:
        print(f"Error checking service status: {str(e)}")
    
    return {"status": "Not Running"}

def change_password(username: str, password: str, debug: bool = False) -> bool:
    """Change password using expect script"""
    try:
        # Create expect script content
        expect_script = f"""#!/usr/bin/expect -f
log_user 1
set timeout 30
spawn docker compose -f /etc/paperless/docker-compose.yml exec webserver ./manage.py changepassword {username}
expect {{
    "Password: " {{
        send "{password}\\r"
        exp_continue
    }}
    "Password (again): " {{
        send "{password}\\r"
        exp_continue
    }}
    "Password changed successfully" {{
        exit 0
    }}
    timeout {{
        puts "Timeout occurred"
        exit 1
    }}
    eof {{
        exit 2
    }}
}}
"""
        # Create temporary file using tempfile module
        with tempfile.NamedTemporaryFile(mode='w', delete=False, prefix='expect_', suffix='.exp') as temp_file:
            temp_file.write(expect_script)
            script_path = temp_file.name

        # Make the script executable
        os.chmod(script_path, 0o755)

        if debug:
            print(f"Created expect script at {script_path}")
            print("Script contents:")
            print(expect_script)

        # Run the expect script
        try:
            result = subprocess.run(['expect', script_path], 
                                  capture_output=True, 
                                  text=True,
                                  check=True)

            if debug:
                print("Command output:", result.stdout)
                print("Command error:", result.stderr)

            success = ("Password changed successfully" in result.stdout or 
                      "changed successfully" in result.stdout)

        finally:
            # Clean up the temporary file
            try:
                os.unlink(script_path)
            except Exception as e:
                if debug:
                    print(f"Warning: Could not delete temporary file {script_path}: {e}")

        return success

    except subprocess.CalledProcessError as e:
        if debug:
            print(f"Command failed with return code {e.returncode}")
            print("Output:", e.output)
            print("Error:", e.stderr)
        return False
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Change Paperless-ngx user password')
    parser.add_argument('username', help='Username to change password for')
    parser.add_argument('password', help='New password')
    parser.add_argument('--debug', action='store_true', help='Enable debug output')
    
    args = parser.parse_args()
    
    # Check service status
    status = get_service_status()
    
    if status.get('status') != "Running":
        print(json.dumps({"status": "Not Running"}))
        sys.exit(1)
    
    # Change password if service is running
    if change_password(args.username, args.password, args.debug):
        print(json.dumps({
            "status": "success",
            "message": f"Password changed successfully for user {args.username}"
        }))
    else:
        print(json.dumps({
            "status": "error",
            "message": "Failed to change password. Either username is incorrect or password is too common - try a unique password."
        }))

if __name__ == "__main__":
    main()

