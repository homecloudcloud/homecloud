#!/usr/bin/env python3

import argparse
import os
import sys
import sqlite3
import subprocess
from pathlib import Path

def get_current_settings(db_path):
    """Get current SMTP settings from database"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    settings = {}
    keys = ['mail_servername', 'mail_serverport', 'mail_username', 'mail_password', 'mail_from', 'mail_admin_addrs']
    
    for key in keys:
        cursor.execute("SELECT value FROM settings WHERE key = ?", (key,))
        result = cursor.fetchone()
        settings[key] = result[0] if result else ''
    
    conn.close()
    return settings

def settings_changed(current, new_settings):
    """Check if new settings differ from current ones"""
    for key, value in new_settings.items():
        if current.get(key, '') != value:
            return True
    return False

def update_urbackup_setting(db_path, key, value):
    """Update UrBackup setting in database"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get table structure
    cursor.execute("PRAGMA table_info(settings)")
    columns = [col[1] for col in cursor.fetchall()]
    print(f"Table columns: {columns}")
    
    # Delete existing entries
    cursor.execute("DELETE FROM settings WHERE key = ?", (key,))
    
    # Insert with correct number of columns based on table structure
    if len(columns) >= 6:
        cursor.execute("INSERT INTO settings VALUES (?, ?, ?, ?, ?, ?)", (key, value, 0, '', '', ''))
    elif len(columns) == 5:
        cursor.execute("INSERT INTO settings VALUES (?, ?, ?, ?, ?)", (key, value, 0, '', ''))
    else:
        cursor.execute("INSERT INTO settings (key, value) VALUES (?, ?)", (key, value))
    
    conn.commit()
    conn.close()

def remove_urbackup_setting(db_path, key):
    """Remove UrBackup setting from database"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM settings WHERE key = ?", (key,))
    conn.commit()
    conn.close()

def main():
    parser = argparse.ArgumentParser(description='Update UrBackup SMTP configuration', add_help=False)
    parser.add_argument('-s', '--state', help='Set to "disabled" to remove SMTP config')
    parser.add_argument('-f', '--from-email', help='From email address')
    parser.add_argument('-r', '--admin-email', help='Admin email address')
    parser.add_argument('-h', '--smtp-host', help='SMTP host')
    parser.add_argument('--help', action='help', help='Show this help message and exit')
    parser.add_argument('-p', '--smtp-port', help='SMTP port')
    parser.add_argument('-u', '--smtp-user', help='SMTP username')
    parser.add_argument('-w', '--smtp-password', help='SMTP password')

            
    args = parser.parse_args()
    
    db_path = "/var/lib/urbackup/urbackup/backup_server_settings.db"
    
    if not os.path.exists(db_path):
        print(f"Error: {db_path} does not exist")
        sys.exit(1)
    
    # Get current settings
    current_settings = get_current_settings(db_path)
    
    service_stopped = False
    
    try:
        if args.state == "disabled":
            # Check if any SMTP settings exist
            if any(current_settings.values()):
                subprocess.run(['systemctl', 'stop', 'urbackup.service'], check=False)
                service_stopped = True
                
                # Remove SMTP settings
                remove_urbackup_setting(db_path, 'mail_servername')
                remove_urbackup_setting(db_path, 'mail_serverport')
                remove_urbackup_setting(db_path, 'mail_username')
                remove_urbackup_setting(db_path, 'mail_password')
                remove_urbackup_setting(db_path, 'mail_from')
                remove_urbackup_setting(db_path, 'mail_admin_addrs')
                
                print("Successfully disabled email configuration")
            else:
                print("Email configuration already disabled")
        else:
            # Validate required parameters
            required = [args.from_email, args.admin_email, args.smtp_host, 
                       args.smtp_port, args.smtp_user, args.smtp_password]
            if not all(required):
                print("Error: Missing required parameters")
                parser.print_help()
                sys.exit(1)
            
            # Check if settings need to be updated
            new_settings = {
                'mail_servername': args.smtp_host,
                'mail_serverport': args.smtp_port,
                'mail_username': args.smtp_user,
                'mail_password': args.smtp_password,
                'mail_from': args.from_email,
                'mail_admin_addrs': args.admin_email
            }
            
            if settings_changed(current_settings, new_settings):
                subprocess.run(['systemctl', 'stop', 'urbackup.service'], check=False)
                service_stopped = True
                
                # Update SMTP settings
                update_urbackup_setting(db_path, 'mail_servername', args.smtp_host)
                update_urbackup_setting(db_path, 'mail_serverport', args.smtp_port)
                update_urbackup_setting(db_path, 'mail_username', args.smtp_user)
                update_urbackup_setting(db_path, 'mail_password', args.smtp_password)
                update_urbackup_setting(db_path, 'mail_from', args.from_email)
                update_urbackup_setting(db_path, 'mail_admin_addrs', args.admin_email)
                
                print("Successfully updated email configuration")
            else:
                print("Email configuration unchanged")
    
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
    
    finally:
        # Only restart service if we stopped it
        if service_stopped:
            subprocess.run(['systemctl', 'start', 'urbackup.service'], check=False)

if __name__ == "__main__":
    main()