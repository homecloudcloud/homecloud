#!/usr/bin/env python3

import json
import sqlite3
import argparse
import os
import sys
import uuid
import time


def table_columns(cursor, table):
    cursor.execute(f"PRAGMA table_info({table})")
    return {row[1] for row in cursor.fetchall()}


def extract_name(data):
    return (
        data.get("Name")
        or data.get("Backup", {}).get("Name")
        or f"Imported-{uuid.uuid4().hex[:8]}"
    )


def extract_description(data):
    if isinstance(data.get("Description"), str):
        return data["Description"]

    if isinstance(data.get("Backup"), dict):
        if isinstance(data["Backup"].get("Description"), str):
            return data["Backup"]["Description"]

    return ""


def extract_targeturl(data):
    return (
        data.get("TargetURL")
        or data.get("Backup", {}).get("TargetURL")
    )


def extract_sources(data):
    if isinstance(data.get("Sources"), list):
        return data["Sources"]

    if isinstance(data.get("Backup"), dict):
        if isinstance(data["Backup"].get("Sources"), list):
            return data["Backup"]["Sources"]

    return []


def extract_settings(data):
    settings = []

    if isinstance(data.get("Settings"), list):
        settings.extend(data["Settings"])

    if isinstance(data.get("Backup"), dict):
        if isinstance(data["Backup"].get("Settings"), list):
            settings.extend(data["Backup"]["Settings"])

    return settings


def main():
    parser = argparse.ArgumentParser(description="Import Duplicati backup job from JSON")
    parser.add_argument("--db", required=True, help="Duplicati-server.sqlite path")
    parser.add_argument("--json", required=True, help="Exported Duplicati JSON")
    args = parser.parse_args()

    if not os.path.exists(args.db):
        sys.exit("ERROR: SQLite DB not found")

    with open(args.json, "r") as f:
        data = json.load(f)

    name = extract_name(data)
    description = extract_description(data)
    target_url = extract_targeturl(data)

    if not target_url:
        sys.exit("ERROR: backend option missing (TargetURL required)")

    conn = sqlite3.connect(args.db)
    c = conn.cursor()

    backup_cols = table_columns(c, "Backup")

    dbpath = f"/var/lib/duplicati/db/{uuid.uuid4().hex}.sqlite"

    backup_row = {
        "Name": name,
        "Description": description,
        "Tags": data.get("Tags", ""),
        "TargetURL": target_url,
        "DBPath": dbpath,
        "Version": 2,
        "IsTemporary": 0,
        "Created": int(time.time()),
    }

    cols = [k for k in backup_row if k in backup_cols]
    vals = [backup_row[k] for k in cols]

    # ---- Check if job already exists ----
    c.execute("SELECT ID FROM Backup WHERE Name = ?", (name,))
    row = c.fetchone()

    if row:
        print(f"Backup job '{name}' already exists (ID={row[0]}). Skipping import.")
        conn.close()
        return

    c.execute(
        f"INSERT INTO Backup ({','.join(cols)}) VALUES ({','.join(['?']*len(cols))})",
        vals,
    )

    backup_id = c.lastrowid
    print(f"Created backup ID {backup_id}")

    # ---- Sources ----
    source_cols = table_columns(c, "Source")
    for path in extract_sources(data):
        if not isinstance(path, str):
            continue

        row = {
            "BackupID": backup_id,
            "Path": path,
        }

        cols = [k for k in row if k in source_cols]
        vals = [row[k] for k in cols]

        c.execute(
            f"INSERT INTO Source ({','.join(cols)}) VALUES ({','.join(['?']*len(cols))})",
            vals,
        )

    # ---- Options (NO secrets, Filter REQUIRED) ----
    option_cols = table_columns(c, "Option")
    for opt in extract_settings(data):
        if not isinstance(opt, dict):
            continue

        name = opt.get("Name")
        value = opt.get("Value")

        if not name:
            continue

        # Skip passphrases / passwords
        if name.lower() in ("passphrase", "password"):
            value = ""

        row = {
            "BackupID": backup_id,
            "Name": name,
            "Value": value,
            "Filter": "",   # REQUIRED (NOT NULL)
        }

        cols = [k for k in row if k in option_cols]
        vals = [row[k] for k in cols]

        c.execute(
            f"INSERT INTO Option ({','.join(cols)}) VALUES ({','.join(['?']*len(cols))})",
            vals,
        )

    conn.commit()
    conn.close()

    print("Import completed successfully")


if __name__ == "__main__":
    main()

