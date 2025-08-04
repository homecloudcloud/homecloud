#!/usr/bin/env python3

import subprocess
import json

def get_joplin_users():
    sql_query = "SELECT id, email, is_admin, enabled FROM users;"

    docker_cmd = [
        "docker", "exec", "-i", "joplin-db-1",
        "psql", "-U", "joplin", "-d", "joplin", "-A", "-F", ",", "-t", "-c", sql_query
    ]

    try:
        result = subprocess.run(docker_cmd, capture_output=True, text=True, check=True)
        raw_output = result.stdout.strip()

        users = []
        for line in raw_output.splitlines():
            if line.strip():
                parts = line.strip().split(",")
                users.append({
                    "id": parts[0],  # treat UUID as string
                    "email": parts[1],
                    "is_admin": parts[2].lower() == "t",
                    "enabled": parts[3].lower() == "t",
                })

        return json.dumps(users)

    except subprocess.CalledProcessError as e:
        print("Error running command:", e)
        print("STDERR:", e.stderr)
        return json.dumps([])

if __name__ == "__main__":
    print(get_joplin_users())