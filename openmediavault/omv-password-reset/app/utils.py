import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

def send_reset_email(to_email, token):
    # Create a multipart message for HTML support
    msg = MIMEMultipart("alternative")
    msg['Subject'] = 'Homecloud Admin Password Reset'
    msg['From'] = os.getenv("SMTP_FROM")
    msg['To'] = to_email
    
    hostname = os.getenv("HOSTNAME")
    
    # Plain text version of the email
    text_content = f"""
    You requested a password reset for your Homecloud admin account.
    
    To reset your password, please click on this link:
    https://{hostname}/forgot-password/reset-password/{token}
    
    IMPORTANT: This link will only work on a device that is connected to the same VPN account as your Homecloud.
    
    If you did not request this reset, please ignore this email.
    """
    
    # HTML version of the email with a POST form that auto-submits
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .button {{ background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; }}
            .button:hover {{ background-color: #45a049; }}
            .warning {{ color: #e74c3c; font-weight: bold; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Homecloud Password Reset</h2>
            <p>You requested a password reset for your Homecloud admin account.</p>
            <p>Click the button below to reset your password:</p>
            
            <a href="https://{hostname}/forgot-password/reset-password/{token}" class="button">Reset Password</a>
            
            <p class="warning">IMPORTANT: This link will only work on a device that is connected to the same VPN account as your Homecloud.</p>
            
            <p>If you did not request this reset, please ignore this email.</p>
        </div>
    </body>
    </html>
    """
    
    # Attach parts to the message
    part1 = MIMEText(text_content, "plain")
    part2 = MIMEText(html_content, "html")
    
    # The email client will try to render the last part first
    msg.attach(part1)
    msg.attach(part2)
    
    # Send the email
    with smtplib.SMTP_SSL(os.getenv("SMTP_HOST"), 465) as server:
        server.login(os.getenv("SMTP_USER"), os.getenv("SMTP_PASS"))
        server.send_message(msg)
