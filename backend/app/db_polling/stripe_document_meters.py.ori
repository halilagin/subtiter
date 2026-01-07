# from datetime import time
import time
from dotenv import load_dotenv
import os
import logging
from app.dao.document_dao import DocumentDAO
# import app.config as appConfig
from app.db.database import SessionLocal
import stripe
from datetime import datetime




load_dotenv()

# Set your secret key. Remember to switch to your live secret key in production.
# See your keys here: https://dashboard.stripe.com/apikeys
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')



# --- Configure Logging for the Email Thread ---
log_file_name = 'stripe_document_meters.log'
logger = logging.getLogger('StripeDocumentMetersLogger')
logger.setLevel(logging.INFO)  # Set the minimum level to log

# Prevent adding multiple handlers if this module is reloaded somehow
if not logger.hasHandlers():
    # Create a file handler to write logs to a file
    file_handler = logging.FileHandler(log_file_name)

    # Create a formatter for the log messages
    formatter = logging.Formatter('%(asctime)s - [PID:%(process)d] - %(levelname)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
    file_handler.setFormatter(formatter)

    # Add the handler to the logger
    logger.addHandler(file_handler)
# --- End Logging Configuration ---






def send_meter(doc_item):
    """
    Record stripe metered usage for a document

    Args:
        db: Database session
        document_id: ID of the document
        user_email: Email of the user
        quantity: Number of units to record (default 1)
    """
    logger.info(f"Starting meter recording for document_id: {doc_item.document_id}, user: {doc_item.user_email}")

    try:
        # Get the customer by email
        customers = stripe.Customer.search(
            query=f"email:'{doc_item.user_email}'",
            limit=1
        )
        if not customers['data']:
            raise Exception(f"No stripe customer found for email: {doc_item.user_email}")

        customer = customers['data'][0]

        # Get active subscription for the customer using list instead of search
        subscriptions = stripe.Subscription.list(
            customer=customer.id,
            status='active',
            limit=1
        )
        if not subscriptions.data:
            raise Exception(f"No active subscription found for customer: {customer.id}")

        subscription = subscriptions.data[0]

        # Get the subscription item I
        subscription_item_id = subscription["items"]["data"][0].id
        print("#" * 100)
        print("subscription.id:", subscription_item_id)
        print("#" * 100)

        # Create usage record
        # stripe.SubscriptionItem.create_usage_record(
        #     subscription_item_id,
        #     quantity=1,
        #     timestamp=int(datetime.now().timestamp())
        # )

        stripe.billing.MeterEvent.create(
            # subscription_item=subscription_item_id,
            event_name="ox_v4_volume",
            payload={"value": "1", "stripe_customer_id": customer.id},
            timestamp=int(datetime.now().timestamp())
        )

        return True

    except Exception as e:
        logger.error(f"Error recording meter: {str(e)}", exc_info=True)
        raise Exception(f"Error recording meter: {str(e)}")


def send_document_meters_in_batches():
    """
    Send emails to signers in batches with explicit DB session
    """
    # Create a new DB session explicitly
    db = SessionLocal()
    try:
        # Set the session on DocumentDAO
        DocumentDAO.db = db
        read_document_meters_in_batches = DocumentDAO.get_stripe_document_meter_queue()
        logger.info(f"Found {len(read_document_meters_in_batches)} docs to send.")

        for index, doc_item in enumerate(read_document_meters_in_batches):
            if index == 0:
                logger.info(f" Process {os.getpid()} - Attempting to record doc meter...")
            try:
                send_meter(doc_item)
                DocumentDAO.delete_stripe_document_meter(doc_item.document_id)
            except Exception as e:
                DocumentDAO.db.rollback()
                logger.error(f"An unexpected error occurred in stripe document meter loop: {e}", exc_info=True)
    finally:
        # Always close the DB session
        db.close()


def send_document_meters_loop(interval_seconds: int):
    """
    Periodically sends a test email using credentials from environment variables.
    Logs output to the 'EmailThreadLogger'.
    """
    process_id = os.getpid()
    while True:
        logger.info(f"Process {process_id} checking for docuemnts to send to stripe...")
        send_document_meters_in_batches()
        time.sleep(interval_seconds)

# Example Usage (Update credentials for Gmail)
if __name__ == "__main__":
    send_document_meters_in_batches()