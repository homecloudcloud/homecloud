#!/usr/bin/env python3

import subprocess
import logging
import argparse
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('docker-cleanup')

def run_command(command, description):
    """Run a command and log the output"""
    logger.info(f"Running {description}...")
    try:
        result = subprocess.run(
            command,
            check=True,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        logger.info(f"Success: {result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Error: {e.stderr}")
        return False

def cleanup_docker(force=False):
    """Run Docker cleanup commands"""
    # Force flag for non-interactive mode
    force_flag = ["-f"] if force else []
    
    # Clean up stopped containers
    run_command(["docker", "container", "prune"] + force_flag, "container cleanup")
    
    # Clean up unused images
    run_command(["docker", "image", "prune", "--all"] + force_flag, "image cleanup")
    
    # Clean up unused volumes
    run_command(["docker", "volume", "prune"] + force_flag, "volume cleanup")
    
    # Clean up unused networks
    run_command(["docker", "network", "prune"] + force_flag, "network cleanup")
    
    # Run system prune as a final step to catch anything missed
    run_command(["docker", "system", "prune"] + force_flag, "system cleanup")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clean up Docker resources")
    parser.add_argument("-f", "--force", action="store_true", help="Run commands without confirmation prompts")
    args = parser.parse_args()
    
    logger.info("Starting Docker cleanup process")
    cleanup_docker(args.force)
    logger.info("Docker cleanup completed")
