"""
Email service for sending verification emails with proper variable substitution
"""
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class VerificationEmailService:
    """Service for sending verification emails with custom templates"""
    
    def __init__(self):
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_user = os.getenv('SMTP_USER')
        self.smtp_password = os.getenv('SMTP_PASSWORD')
        self.from_email = os.getenv('FROM_EMAIL', self.smtp_user)
        
    def send_verification_email(self, to_email: str, verification_code: str) -> bool:
        """
        Send a verification email with the code properly substituted
        
        Args:
            to_email: Recipient email address (also used as username)
            verification_code: The 6-digit verification code from Cognito
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            # Load the HTML template
            template_path = Path(__file__).parent.parent / 'aws_app_stack' / 'cognito_email_verification' / 'user_verification_template' / 'email_template.html'
            
            with open(template_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            # Substitute the variables
            html_content = html_content.replace('{username}', to_email)
            html_content = html_content.replace('{####}', verification_code)
            
            # Create the email message
            message = MIMEMultipart('alternative')
            message['Subject'] = 'Welcome to Subtiter.ai - Verify Your Email 🎬'
            message['From'] = self.from_email
            message['To'] = to_email
            
            # Attach the HTML content
            html_part = MIMEText(html_content, 'html', 'utf-8')
            message.attach(html_part)
            
            # Send the email
            if not self.smtp_user or not self.smtp_password:
                logger.warning("SMTP credentials not configured. Email not sent.")
                logger.info(f"Would send verification email to {to_email} with code {verification_code}")
                logger.info(f"Verification link: https://subtiter.ai/api/v1/auth/confirm-signup/{to_email}/{verification_code}")
                return True  # Return True for development
            
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(message)
            
            logger.info(f"Verification email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send verification email to {to_email}: {e}")
            return False


# Singleton instance
verification_email_service = VerificationEmailService()

