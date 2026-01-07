# from datetime import time
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import time
import os
import logging
from app.dao.document_dao import DocumentDAO
# import app.config as appConfig
from app.db.database import SessionLocal
from jinja2 import Environment, FileSystemLoader
# Load environment variables from .env file once at the start

# --- Configure Logging for the Email Thread ---
log_file_name = 'email_thread.log'
email_logger = logging.getLogger('EmailThreadLogger')
email_logger.setLevel(logging.INFO)  # Set the minimum level to log

# Prevent adding multiple handlers if this module is reloaded somehow
if not email_logger.hasHandlers():
    # Create a file handler to write logs to a file
    file_handler = logging.FileHandler(log_file_name)

    # Create a formatter for the log messages
    formatter = logging.Formatter('%(asctime)s - [PID:%(process)d] - %(levelname)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
    file_handler.setFormatter(formatter)

    # Add the handler to the logger
    email_logger.addHandler(file_handler)
# --- End Logging Configuration ---


class EmailManager:
    """
    Manages sending emails using a Google (Gmail) account via SMTP.
    """
    def __init__(self, email_address: str, password: str):
        """
        Initializes the EmailManager with Google credentials.

        Args:
            email_address: Your full Gmail address (e.g., your_email@gmail.com).
            password: Your Google account password OR (recommended) an App Password
                      if using 2-Factor Authentication.
                      NOTE: Storing passwords directly in code is insecure.
                      Consider using environment variables or a secret management system.
                      Example using environment variables:
                      import os
                      email_address = os.environ.get('GMAIL_EMAIL')
                      password = os.environ.get('GMAIL_APP_PASSWORD') # Use App Password if 2FA is enabled
        """
        self.email_address = email_address
        self.password = password
        # Google SMTP server details (using TLS)
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587  # TLS port recommended by Google

    def send_email_to_signer_with_request_to_sign(self, signer_email: str, email_body: str):
        """
        Sends an email to the signer with a link to the request to sign.
        """
        self.send_email(self, signer_email, "Please Sign the Document", email_body)



    def send_email(self, to_address: str, subject: str, body: str):
        """
        Sends an email with HTML content.

        Args:
            to_address (str): The recipient's email address.
            subject (str): The subject of the email.
            body (str): The HTML content of the email.
        """
        if not self.email_address or not self.password:
            email_logger.error("Email address or password not configured.")
            return False

        # Create a multipart message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = self.email_address
        msg['To'] = to_address

        # Create the HTML part
        html_part = MIMEText(body, 'html')

        # Attach the HTML part to the message
        msg.attach(html_part)

        # Create a secure SSL context
        context = ssl.create_default_context()

        try:
            email_logger.info(f"Connecting to {self.smtp_server}:{self.smtp_port}...")
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.ehlo()  # Say hello to server
                email_logger.info("Starting TLS...")
                server.starttls(context=context)  # Secure the connection
                server.ehlo()  # Re-identify ourselves over TLS connection
                # server.set_debuglevel(1)  # Keep debug output for now
                email_logger.info("Logging in...")
                server.login(self.email_address, self.password)
                email_logger.info(f"Sending email to {to_address}...")
                server.sendmail(self.email_address, to_address, msg.as_string())
                email_logger.info("Email sent successfully!")
                return True
        except smtplib.SMTPAuthenticationError as e:
            email_logger.error(f"Authentication failed for {self.email_address}. Check credentials/App Password. Error: {e}")
            return False
        except smtplib.SMTPConnectError as e:
            email_logger.error(f"Could not connect to the SMTP server {self.smtp_server}:{self.smtp_port}. Error: {e}")
            return False
        except Exception as e:
            email_logger.error(f"An error occurred while sending email: {e}", exc_info=True)
            return False



def prepare_request_signing_email_body(signing_callback_url: str, document_id: str, signer_id: str):
    """
    Prepare the email body using Jinja2 template
    """
    env = Environment(loader=FileSystemLoader('email_templates'))
    template = env.get_template('request_signing_email_template.j2')
    return template.render(signing_callback_url=signing_callback_url, document_id=document_id, signer_id=signer_id)

def prepare_view_signed_pdf_email_body(signing_callback_url: str, document_id):
    """
    Prepare the email body using Jinja2 template
    """
    env = Environment(loader=FileSystemLoader('email_templates'))
    template = env.get_template('view_signed_pdf_email_template.j2')
    return template.render(signing_callback_url=signing_callback_url, document_id=document_id)


def send_emails_in_batches():
    """
    Send emails to signers in batches with explicit DB session
    """
    # Create a new DB session explicitly
    db = SessionLocal()
    try:
        # Set the session on DocumentDAO
        DocumentDAO.db = db
        singer_batch = DocumentDAO.get_signer_email_queue()
        email_logger.info(f"Found {len(singer_batch)} emails to send.")
        SIGNING_CALLBACK_URL = os.getenv("SIGNING_CALLBACK_URL", "https://yourdomain.com/sign")
        SIGNING_CALLBACK_URL_SIGNED_PDF_VIEW = os.getenv("SIGNING_CALLBACK_URL_SIGNED_PDF_VIEW", "https://localhost:3080/signed-pdf-view")
        gmail_email = os.environ.get("GMAIL_EMAIL")
        gmail_password = os.environ.get("GMAIL_APP_PASSWORD")
        email_manager = EmailManager(gmail_email, gmail_password)

        for index, signer_item in enumerate(singer_batch):
            if index == 0:
                email_logger.info(f" Process {os.getpid()} - Attempting to send email from {gmail_email}...")

            try:
                document_id = signer_item.document_id
                signer_id = signer_item.signer_id
                email = signer_item.email

                if signer_item.email_type == "signer_email_queue":
                    subject = f"Klippers: Sign Request"
                    # Render the template with the required variables
                    body = prepare_request_signing_email_body(SIGNING_CALLBACK_URL, document_id, signer_id)
                elif signer_item.email_type == "signed_pdf_view":
                    subject = f"Klippers: View Signed Document"
                    body = f"""
                            You can view the signed document here:
                        {SIGNING_CALLBACK_URL_SIGNED_PDF_VIEW}?documentId={document_id}
                        """
                    body = prepare_view_signed_pdf_email_body(SIGNING_CALLBACK_URL_SIGNED_PDF_VIEW, document_id)
                else:
                    email_logger.error(f"Invalid email type: {signer_item.email_type}")
                    continue

                success = email_manager.send_email(email, subject, body)
                if success:
                    email_logger.info(f"Email sent successfully to {email}.")
                    DocumentDAO.delete_signer_email_queue(signer_item.id)
                else:
                    email_logger.error(f"Failed to send email to {email}.")

            except Exception as e:
                email_logger.error(f"An unexpected error occurred in the email loop: {e}", exc_info=True)
    finally:
        # Always close the DB session
        db.close()

def send_test_email_loop(interval_seconds: int):
    """
    Periodically sends a test email using credentials from environment variables.
    Logs output to the 'EmailThreadLogger'.
    """
    process_id = os.getpid()
    email_logger.info(f"Starting email loop with PID: {process_id}. Interval: {interval_seconds} seconds.")
    while True:
        email_logger.info(f"Process {process_id} checking for emails to send...")
        send_emails_in_batches()
        time.sleep(interval_seconds)




def run():
    # --- IMPORTANT SECURITY NOTE ---
    # Avoid hardcoding credentials. Use environment variables or a secure method.
    # USE AN APP PASSWORD IF 2FA IS ENABLED ON YOUR GOOGLE ACCOUNT.
    # Example:
    gmail_email = os.environ.get("GMAIL_EMAIL")
    gmail_password = os.environ.get("GMAIL_APP_PASSWORD")  # Use the App Password here

    # Replace with your actual credentials FOR TESTING ONLY if not using environment variables
    # REMEMBER TO USE AN APP PASSWORD IF YOU HAVE 2FA ENABLED

    if not gmail_email or not gmail_password:
        print("Please set GMAIL_EMAIL and GMAIL_APP_PASSWORD environment variables or update the script.")
    else:
        email_manager = EmailManager(gmail_email, gmail_password)

        # Send a test email
        recipient = "halil.agin@peralabs.co.uk"  # Replace with a valid recipient
        subject = "Test Gmail from Python"
        body = "This is a test email sent using the EmailManager class via Gmail."

        email_manager.send_email(recipient, subject, body)


def test_email_body():
    SIGNING_CALLBACK_URL = os.getenv("SIGNING_CALLBACK_URL", "https://yourdomain.com/sign")
    SIGNING_CALLBACK_URL_SIGNED_PDF_VIEW = os.getenv("SIGNING_CALLBACK_URL_SIGNED_PDF_VIEW", "https://localhost:3080/signed-pdf-view")
    document_id = "1234567890"
    signer_id = "1234567890"
    body = prepare_request_signing_email_body(SIGNING_CALLBACK_URL, document_id, signer_id)
    print(body)
    print("=" * 100)
    body = prepare_view_signed_pdf_email_body(SIGNING_CALLBACK_URL_SIGNED_PDF_VIEW, document_id)
    print(body)

def test_sending_email():
    SIGNING_CALLBACK_URL = os.getenv("SIGNING_CALLBACK_URL", "https://yourdomain.com/sign")
    document_id = "1234567890"
    signer_id = "1234567890"
    gmail_email = os.environ.get("GMAIL_EMAIL")
    gmail_password = os.environ.get("GMAIL_APP_PASSWORD")  # Use the App Password here

    email_manager = EmailManager(gmail_email, gmail_password)
    recipient = "halil.agin@peralabs.co.uk"  # Replace with a valid recipient
    subject = "Test Gmail from Python"
    body = prepare_request_signing_email_body(SIGNING_CALLBACK_URL, document_id, signer_id)
    email_manager.send_email(recipient, subject, body)

# Example Usage (Update credentials for Gmail)
if __name__ == "__main__":
    # run()
    # send_emails_in_batches()
    # test_email_body()
    test_sending_email()