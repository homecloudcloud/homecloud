from flask import Flask, request, jsonify
from utils import send_reset_email
import os
import subprocess

app = Flask(__name__)

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
RESET_TOKEN = os.getenv("RESET_TOKEN")

@app.route("/request-reset", methods=["POST"])
def request_reset():
    data = request.json
    if data.get("email") != ADMIN_EMAIL:
        return jsonify({"error": "Invalid user"}), 403

    token = RESET_TOKEN
    send_reset_email(ADMIN_EMAIL, token)
    return jsonify({"message": "Reset link sent."})

@app.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    if data.get("token") != RESET_TOKEN:
        return jsonify({"error": "Invalid token"}), 403

    new_password = data.get("new_password")
    if not new_password:
        return jsonify({"error": "Missing password"}), 400

    result = subprocess.run(["/reset.sh", new_password], capture_output=True, text=True)
    if result.returncode == 0:
        return jsonify({"message": "Password reset successful."})
    return jsonify({"error": "Failed to reset"}), 500
