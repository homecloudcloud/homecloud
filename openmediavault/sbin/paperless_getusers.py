#!/usr/bin/env python3

import json
import subprocess
import sys

def check_service_active(service_name):
    """Check if a systemd service is active"""
    try:
        result = subprocess.run(['systemctl', 'is-active', service_name], 
                              capture_output=True, text=True)
        return result.stdout.strip() == 'active'
    except Exception:
        return False

def get_container_name():
    """Get the paperless container name"""
    try:
        result = subprocess.run(
            ['docker', 'ps', '--filter', 'name=paperless-webserver', '--format', '{{.Names}}'],
            capture_output=True, text=True, check=True
        )
        container_names = result.stdout.strip().split('\n')
        if container_names and container_names[0]:
            return container_names[0]
        return None
    except subprocess.CalledProcessError:
        return None

def check_container_health(container_name):
    """Check if container is healthy"""
    try:
        result = subprocess.run(
            ['docker', 'inspect', '--format', '{{.State.Health.Status}}', container_name],
            capture_output=True, text=True
        )
        
        if result.returncode != 0:
            # Container might not have health check, check if it's running
            result = subprocess.run(
                ['docker', 'inspect', '--format', '{{.State.Status}}', container_name],
                capture_output=True, text=True, check=True
            )
            return result.stdout.strip() == 'running'
        
        status = result.stdout.strip()
        return status == 'healthy'
    except Exception:
        return False

def get_paperless_users(container_name):
    """Get users from paperless container"""
    python_cmd = "import json; from django.contrib.auth.models import User; print(json.dumps([{'id': u.id, 'username': u.username, 'email': u.email, 'is_superuser': u.is_superuser, 'is_active': u.is_active} for u in User.objects.exclude(username__in=['consumer', 'AnonymousUser'])], indent=2))"
    
    try:
        result = subprocess.run(
            ['docker', 'exec', container_name, 'python', 'manage.py', 'shell', '-c', python_cmd],
            capture_output=True, text=True, check=True
        )
        return json.loads(result.stdout)
    except subprocess.CalledProcessError as e:
        return {"error": f"Command failed: {e.stderr}"}
    except json.JSONDecodeError:
        return {"error": "Failed to parse user data"}

def main():
    # Check if paperless service is active
    if not check_service_active('paperless.service'):
        print(json.dumps({"error": "Paperless service is not active"}))
        sys.exit(1)
    
    # Get container name
    container_name = get_container_name()
    if not container_name:
        print(json.dumps({"error": "Paperless container not found"}))
        sys.exit(1)
    
    # Check container health
    if not check_container_health(container_name):
        print(json.dumps({"error": "Paperless container is not healthy"}))
        sys.exit(1)
    
    # Get users
    users = get_paperless_users(container_name)
    print(json.dumps(users))

if __name__ == "__main__":
    main()
