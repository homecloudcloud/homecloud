#!/usr/bin/env python3

import os
import sys
import yaml
import gzip
import boto3
import subprocess

COMPOSE_FILE = "/etc/juicefs/docker-compose.yaml"
META_DB = "/var/lib/juicefs/meta.db"
TMP_GZ = "/tmp/meta.json.gz"
TMP_JSON = "/tmp/meta.json"


def read_env_from_compose():
    with open(COMPOSE_FILE, "r") as f:
        data = yaml.safe_load(f)

    services = data.get("services", {})
    env = {}

    for svc in services.values():
        if "environment" in svc:
            for item in svc["environment"]:
                if "=" in item:
                    k, v = item.split("=", 1)
                    env[k.strip()] = v.strip()

    return env


def initialize_db_if_needed(env):
    """Initialize JuiceFS DB if new S3 bucket and no local metadata"""
    access = env.get("ACCESS_KEY")
    secret = env.get("SECRET_KEY")
    bucket_url = env.get("JFS_BUCKET")
    fsname = env.get("JFS_NAME")
    meta = env.get("JFS_META")

    if not all([access, secret, bucket_url, fsname, meta]):
        print("Missing required variables in compose file")
        return False

    # Already exists locally
    if os.path.exists(META_DB) and os.path.getsize(META_DB) > 0:
        return False

    # Extract bucket name from URL
    bucket = bucket_url.split("/")[-1]

    # Check if bucket has metadata
    endpoint = "/".join(bucket_url.split("/")[:-1])
    prefix = f"{fsname}/meta/"

    s3 = boto3.client(
        "s3",
        aws_access_key_id=access,
        aws_secret_access_key=secret,
        endpoint_url=endpoint,
        verify=False
    )

    resp = s3.list_objects_v2(Bucket=bucket, Prefix=prefix)
    if "Contents" in resp:
        return False  # metadata exists remotely

    print("No existing metadata found. Initializing new JuiceFS DB...")

    # Correct format command for new S3 bucket
    subprocess.run(
        [
            "/usr/local/bin/juicefs", "format",
            "--storage", "s3",
            "--bucket", bucket_url,
            "--access-key", access,
            "--secret-key", secret,
            meta,     # metadata DB URL
            fsname    # filesystem name
        ],
        check=True
    )
    print("New JuiceFS DB initialized")
    return True


def restore_metadata(env):
    access = env.get("ACCESS_KEY")
    secret = env.get("SECRET_KEY")
    bucket_url = env.get("JFS_BUCKET")
    fsname = env.get("JFS_NAME")
    meta = env.get("JFS_META")

    # Initialize if needed
    initialize_db_if_needed(env)

    # Already exists locally
    if os.path.exists(META_DB) and os.path.getsize(META_DB) > 0:
        print("Metadata DB already present — skipping restore")
        return

    bucket = bucket_url.split("/")[-1]
    endpoint = "/".join(bucket_url.split("/")[:-1])
    prefix = f"{fsname}/meta/"

    print("Connecting to S3...")

    s3 = boto3.client(
        "s3",
        aws_access_key_id=access,
        aws_secret_access_key=secret,
        endpoint_url=endpoint,
        verify=False
    )

    resp = s3.list_objects_v2(Bucket=bucket, Prefix=prefix)

    if "Contents" not in resp:
        print("No metadata dump found — starting fresh")
        # Still update JuiceFS config so container can start
        subprocess.run(
            ["/usr/local/bin/juicefs", "config", "--access-key", access, "--secret-key", secret, meta],
            check=True
        )
        return

    latest = max(resp["Contents"], key=lambda x: x["LastModified"])["Key"]

    print("Downloading:", latest)
    s3.download_file(bucket, latest, TMP_GZ)

    print("Decompressing metadata")
    with gzip.open(TMP_GZ, "rb") as f_in:
        with open(TMP_JSON, "wb") as f_out:
            f_out.write(f_in.read())

    print("Restoring metadata")
    subprocess.run(
        ["/usr/local/bin/juicefs", "load", meta, TMP_JSON],
        check=True
    )

    print("Updating JuiceFS DB with current credentials")
    subprocess.run(
        ["/usr/local/bin/juicefs", "config", "--access-key", access, "--secret-key", secret, meta],
        check=True
    )

    print("Metadata restore complete")


def main():
    env = read_env_from_compose()
    restore_metadata(env)


if __name__ == "__main__":
    main()