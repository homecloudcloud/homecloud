from flask import Flask, request, jsonify, send_from_directory, redirect, url_for
from utils import send_reset_email
import os
import subprocess
import logging
import traceback
import socket
import secrets
import time
import urllib.request
import urllib.error
import json
import ssl
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('password-reset-app')

app = Flask(__name__, static_folder='./omv-password-reset-frontend', static_url_path='')

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")

# Token management
TOKEN_VALIDITY_MINUTES = 90
token_data = {
    "token": None,
    "expiry": None
}

def generate_reset_token():
    """Generate a secure random token with 90-minute validity"""
    token = secrets.token_hex(16)  # 32 character hex string (128 bits of entropy)
    expiry = datetime.now() + timedelta(minutes=TOKEN_VALIDITY_MINUTES)
    
    # Update global token data
    token_data["token"] = token
    token_data["expiry"] = expiry
    
    logger.info(f"Generated new token valid until {expiry.isoformat()}")
    return token

def is_token_valid(token):
    """Check if the provided token is valid and not expired"""
    if not token_data["token"] or not token_data["expiry"]:
        logger.warning("No token has been generated yet")
        return False
        
    if token != token_data["token"]:
        logger.warning("Token mismatch")
        return False
        
    if datetime.now() > token_data["expiry"]:
        logger.warning(f"Token expired at {token_data['expiry'].isoformat()}")
        return False
        
    return True

# Generate initial token
RESET_TOKEN = generate_reset_token()

# Log startup information
logger.info(f"Starting password reset app with ADMIN_EMAIL: {ADMIN_EMAIL}")
logger.info(f"Initial token generated and valid for {TOKEN_VALIDITY_MINUTES} minutes")
logger.info(f"Container hostname: {socket.gethostname()}")

@app.route("/forgot-password/request.html")
def serve_request_page():
    logger.debug("Serving request.html page")
    return send_from_directory(app.static_folder, "request.html")

@app.route("/forgot-password/reset.html")
def serve_reset_page():
    # Get token from query parameter if provided
    token = request.args.get('token')
    logger.debug(f"Serving reset.html page with token: {token[:4]}..." if token else "Serving reset.html page without token")
    if token:
        # If token is provided, serve the reset page with the token
        return send_from_directory(app.static_folder, "reset.html")
    return send_from_directory(app.static_folder, "reset.html")

@app.route("/forgot-password/request-reset", methods=["POST"])
def request_reset():
    logger.debug("Received password reset request")
    
    # Handle JSON requests
    if request.is_json:
        data = request.json
        email = data.get("email")
        logger.debug(f"JSON request with email: {email}")
    # Handle form submissions
    else:
        email = request.form.get("email")
        logger.debug(f"Form request with email: {email}")
    
    if email != ADMIN_EMAIL:
        logger.warning(f"Invalid email provided: {email}")
        return jsonify({"error": "Invalid user"}), 403

    # Generate a new token for this request
    token = generate_reset_token()
    logger.info(f"Sending reset email to {ADMIN_EMAIL} with token: {token[:4]}...")
    send_reset_email(ADMIN_EMAIL, token)
    return jsonify({"message": "Reset link sent. Check your email for next step."})

@app.route("/forgot-password/reset-password", methods=["GET", "POST"])
def reset_password():
    logger.debug(f"Reset password request received: {request.method}")
    token = None
    new_password = None
    otp = None
    
    # Handle GET requests with query parameters
    if request.method == "GET":
        token = request.args.get("token")
        logger.debug(f"GET request with token: {token[:4]}..." if token else "GET request without token")
        if is_token_valid(token):
            # Redirect to the reset page with the token
            logger.debug("Valid token, redirecting to reset page")
            return redirect(f"/forgot-password/reset.html?token={token}")
        else:
            logger.warning("Invalid or expired token provided in GET request")
            return jsonify({"error": "Invalid or expired token"}), 403
    
    # Handle POST requests with JSON
    elif request.is_json:
        data = request.json
        token = data.get("token")
        new_password = data.get("new_password")
        otp = data.get("otp")
        logger.debug(f"JSON request with token: {token[:4]}..." if token else "JSON request without token")
        logger.debug(f"Password provided: {'yes' if new_password else 'no'}")
        logger.debug(f"OTP provided: {'yes' if otp else 'no'}")
    
    # Handle POST requests with form data
    else:
        token = request.form.get("token")
        new_password = request.form.get("new_password")
        otp = request.form.get("otp")
        logger.debug(f"Form request with token: {token[:4]}..." if token else "Form request without token")
        logger.debug(f"Password provided: {'yes' if new_password else 'no'}")
        logger.debug(f"OTP provided: {'yes' if otp else 'no'}")
    
    # Validate token and password
    if not is_token_valid(token):
        logger.warning("Invalid or expired token provided in POST request")
        return jsonify({"error": "Invalid or expired token"}), 403
    
    if not new_password:
        logger.warning("No password provided")
        return jsonify({"error": "Missing password"}), 400
    
    if not otp:
        logger.warning("No OTP provided")
        return jsonify({"error": "Missing verification code"}), 400
    
    # Validate OTP using validate-totp endpoint
    try:
        import urllib.request
        import urllib.error
        import json
        import ssl
        
        logger.debug("Validating OTP code")
        
        # Prepare the request data for OTP validation
        otp_data = json.dumps({"code": otp}).encode('utf-8')
        
        # Try different URLs for the API endpoint
        urls_to_try = [
            "https://172.17.0.1:5000/validate-totp",
            "https://192.168.128.1:5000/validate-totp",
            "https://host.docker.internal:5000/validate-totp"
        ]
        
        otp_valid = False
        otp_error = None
        
        for url in urls_to_try:
            logger.debug(f"Trying OTP validation URL: {url}")
            
            try:
                # Create the request
                req = urllib.request.Request(
                    url,
                    data=otp_data,
                    headers={
                        "Content-Type": "application/json",
                        "User-Agent": "OMV-Password-Reset/1.0"
                    },
                    method="POST"
                )
                
                # Create a context that ignores certificate validation
                context = ssl._create_unverified_context()
                
                # Use the context when opening the URL
                with urllib.request.urlopen(req, timeout=10, context=context) as response:
                    response_data = json.loads(response.read().decode('utf-8'))
                    logger.info(f"OTP validation successful using URL: {url}")
                    otp_valid = True
                    break
                    
            except urllib.error.HTTPError as e:
                logger.error(f"HTTP error with OTP validation {url}: {e.code}")
                try:
                    error_content = e.read().decode('utf-8')
                    error_data = json.loads(error_content)
                    otp_error = error_data.get("message", f"Verification code error: {e.code}")
                except Exception:
                    otp_error = f"Verification code error: {e.code}"
                
            except Exception as e:
                logger.error(f"OTP validation error with {url}: {str(e)}")
                otp_error = f"Verification code error: {str(e)}"
        
        if not otp_valid:
            logger.warning(f"OTP validation failed: {otp_error}")
            return jsonify({"error": otp_error or "Invalid verification code"}), 400
        
        logger.info("OTP validation successful, proceeding with password reset")
        
    except Exception as e:
        logger.error(f"Error during OTP validation: {str(e)}")
        return jsonify({"error": f"Error validating verification code: {str(e)}"}), 500
    
    # Reset the password using the update_password endpoint
    try:
        import urllib.request
        import urllib.error
        import json
        import ssl
        
        logger.debug("Preparing to send password update request")
        
        # Prepare the request data
        data = json.dumps({"username": "admin", "password": new_password}).encode('utf-8')
        logger.debug(f"Request data prepared: {len(data)} bytes")
        
        # Try different URLs for the API endpoint
        urls_to_try = [
            "https://172.17.0.1:5000/update_password",
            "https://192.168.128.1:5000/update_password",
            "https://host.docker.internal:5000/update_password"
        ]
        
        success = False
        last_error = None
        
        for url in urls_to_try:
            logger.debug(f"Trying URL: {url}")
            
            try:
                # Create the request
                req = urllib.request.Request(
                    url,
                    data=data,
                    headers={
                        "Content-Type": "application/json",
                        "User-Agent": "OMV-Password-Reset/1.0"
                    },
                    method="POST"
                )
                
                # Create a context that ignores certificate validation
                context = ssl._create_unverified_context()
                logger.debug("Created unverified SSL context")
                
                # Use the context when opening the URL
                logger.debug("Sending request...")
                with urllib.request.urlopen(req, timeout=10, context=context) as response:
                    logger.debug(f"Received response: {response.status}")
                    response_data = json.loads(response.read().decode('utf-8'))
                    logger.info(f"Password reset successful using URL: {url}")
                    
                    # Invalidate the token after successful use
                    token_data["expiry"] = datetime.now() - timedelta(minutes=1)
                    logger.info("Token has been invalidated after successful use")
                    
                    success = True
                    break
            except urllib.error.HTTPError as e:
                logger.error(f"HTTP error with {url}: {e.code}")
                try:
                    error_content = e.read().decode('utf-8')
                    logger.error(f"Error response: {error_content}")
                    error_data = json.loads(error_content)
                    error_message = error_data.get("message", f"HTTP error: {e.code}")
                except Exception as parse_error:
                    logger.error(f"Failed to parse error response: {parse_error}")
                    error_message = f"HTTP error: {e.code}"
                
                last_error = error_message
                
            except urllib.error.URLError as e:
                logger.error(f"URL error with {url}: {str(e.reason)}")
                last_error = f"Connection error: {str(e.reason)}"
                
            except Exception as e:
                logger.error(f"Unexpected error with {url}: {str(e)}")
                logger.error(traceback.format_exc())
                last_error = f"Unexpected error: {str(e)}"
        
        if success:
            return jsonify({"message": "Password reset successful."})
        else:
            logger.error(f"All URLs failed. Last error: {last_error}")
            
            
    except Exception as e:
        # Handle any other errors
        logger.error(f"Unexpected error in reset_password: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


# Add a route for the path parameter version
@app.route("/forgot-password/reset-password/<token>", methods=["GET"])
def reset_password_with_token(token):
    logger.debug(f"Reset password with token in URL path: {token[:4]}..." if token else "No token")
    if is_token_valid(token):
        # Redirect to the reset page with the token
        logger.debug("Valid token, redirecting to reset page")
        return redirect(f"/forgot-password/reset.html?token={token}")
    else:
        logger.warning("Invalid or expired token provided in URL path")
        return jsonify({"error": "Invalid or expired token"}), 403

@app.route("/forgot-password/request-homecloud-totp", methods=["POST"])
def request_homecloud_totp():
    """
    API endpoint to request a TOTP code from the Homecloud service.
    This calls the generate-totp endpoint on the Homecloud service.
    """
    logger.debug("Received homecloud TOTP request")
    
    try:
        import urllib.request
        import urllib.error
        import json
        import ssl
        
        logger.debug("Preparing to send TOTP generation request")
        
        # Try different URLs for the API endpoint
        urls_to_try = [
            "https://172.17.0.1:5000/generate-totp",
            "https://192.168.128.1:5000/generate-totp",
            "https://host.docker.internal:5000/generate-totp"
        ]
        
        success = False
        last_error = None
        response_data = None
        
        for url in urls_to_try:
            logger.debug(f"Trying URL: {url}")
            
            try:
                # Create the request
                req = urllib.request.Request(
                    url,
                    data=b'',  # Empty data for POST request
                    headers={
                        "Content-Type": "application/json",
                        "User-Agent": "Homecloud-Password-Reset/1.0"
                    },
                    method="POST"
                )
                
                # Create a context that ignores certificate validation
                context = ssl._create_unverified_context()
                logger.debug("Created unverified SSL context")
                
                # Use the context when opening the URL
                logger.debug("Sending request...")
                with urllib.request.urlopen(req, timeout=10, context=context) as response:
                    logger.debug(f"Received response: {response.status}")
                    response_data = json.loads(response.read().decode('utf-8'))
                    logger.info(f"TOTP generation successful using URL: {url}")
                    success = True
                    break
                    
            except urllib.error.HTTPError as e:
                logger.error(f"HTTP error with {url}: {e.code}")
                try:
                    error_content = e.read().decode('utf-8')
                    logger.error(f"Error response: {error_content}")
                    error_data = json.loads(error_content)
                    error_message = error_data.get("message", f"HTTP error: {e.code}")
                except Exception as parse_error:
                    logger.error(f"Failed to parse error response: {parse_error}")
                    error_message = f"HTTP error: {e.code}"
                
                last_error = error_message
                
            except urllib.error.URLError as e:
                logger.error(f"URL error with {url}: {str(e.reason)}")
                last_error = f"Connection error: {str(e.reason)}"
                
            except Exception as e:
                logger.error(f"Unexpected error with {url}: {str(e)}")
                logger.error(traceback.format_exc())
                last_error = f"Unexpected error: {str(e)}"
        
        if success:
            return jsonify({
                "status": "success",
                "message": "TOTP code generated and displayed on device"
            })
        else:
            logger.error(f"All URLs failed. Last error: {last_error}")
            return jsonify({
                "status": "error",
                "message": f"Failed to generate TOTP code: {last_error}"
            }), 500
            
    except Exception as e:
        logger.error(f"Error in request_homecloud_totp: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "status": "error",
            "message": f"Unexpected error: {str(e)}"
        }), 500

@app.route("/forgot-password/assets/logos/<filename>")
def serve_logo(filename):
    """Serve logo images from assets/logos directory"""
    logger.debug(f"Serving logo file: {filename}")
    logos_path = os.path.join(app.static_folder, "assets/logos")
    return send_from_directory(logos_path, filename)


# Add a simple health check endpoint
@app.route("/forgot-password/show-app-links.html")
def serve_app_links_page():
    """Serve the app links HTML page"""
    logger.debug("Serving show-app-links.html page")
    return send_from_directory(app.static_folder, "show-app-links.html")
    
@app.route("/forgot-password/get-app-links")
def get_app_links():
    """API endpoint to fetch app links from the backend"""
    logger.debug("Fetching app links from backend")
    
    try:
        # Create a context that ignores certificate validation
        context = ssl._create_unverified_context()
        
        # Try different URLs for the API endpoint
        urls_to_try = [
            "https://172.17.0.1:5000/getappsendpoint",
            "https://192.168.128.1:5000/getappsendpoint",
            "https://host.docker.internal:5000/getappsendpoint"
        ]
        
        success = False
        last_error = None
        app_data = None
        
        for url in urls_to_try:
            logger.debug(f"Trying URL: {url}")
            
            try:
                # Create the request
                req = urllib.request.Request(
                    url,
                    headers={"User-Agent": "OMV-Password-Reset/1.0"},
                    method="GET"
                )
                
                # Send the request
                with urllib.request.urlopen(req, timeout=10, context=context) as response:
                    logger.debug(f"Received response: {response.status}")
                    app_data = json.loads(response.read().decode('utf-8'))
                    logger.info(f"Successfully fetched app links from {url}: {len(app_data)} apps found")
                    success = True
                    break
                    
            except urllib.error.HTTPError as e:
                logger.error(f"HTTP error with {url}: {e.code}")
                last_error = f"HTTP error: {e.code}"
                
            except urllib.error.URLError as e:
                logger.error(f"URL error with {url}: {str(e.reason)}")
                last_error = f"Connection error: {str(e.reason)}"
                
            except Exception as e:
                logger.error(f"Unexpected error with {url}: {str(e)}")
                last_error = f"Unexpected error: {str(e)}"
        
        if success:
            return jsonify(app_data)
        else:
            logger.error(f"All URLs failed. Last error: {last_error}")
            return jsonify({"error": f"Failed to fetch app links: {last_error}"}), 500
            
    except Exception as e:
        logger.error(f"Unexpected error fetching app links: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


@app.route("/health", methods=["GET"])
def health_check():
    logger.debug("Health check requested")
    
    # Calculate remaining token validity
    token_valid = False
    remaining_minutes = 0
    
    if token_data["token"] and token_data["expiry"]:
        now = datetime.now()
        if now < token_data["expiry"]:
            token_valid = True
            remaining_seconds = (token_data["expiry"] - now).total_seconds()
            remaining_minutes = int(remaining_seconds / 60)
    
    return jsonify({
        "status": "ok",
        "environment": {
            "ADMIN_EMAIL_SET": bool(ADMIN_EMAIL),
            "TOKEN_VALID": token_valid,
            "TOKEN_REMAINING_MINUTES": remaining_minutes,
            "HOSTNAME": socket.gethostname()
        }
    })

if __name__ == "__main__":
    logger.info("Starting Flask application on 0.0.0.0:80")
    app.run(host="0.0.0.0", port=80)
