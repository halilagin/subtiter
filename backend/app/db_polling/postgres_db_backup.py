# from datetime import time
import time
from dotenv import load_dotenv
import os
import logging
import subprocess


load_dotenv()

# Set your secret key. Remember to switch to your live secret key in production.
# See your keys here: https://dashboard.stripe.com/apikeys



# --- Configure Logging for the Email Thread ---
log_file_name = 'postgres_db_backup.log'
logger = logging.getLogger('PostgresDBBackupLogger')
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




def backup_postgres_db():
    """
    Backup the postgres db by running the backup_postgres.sh script
    """
    script_path = "scripts/backup_postgres.sh"
    try:
        logger.info(f"Attempting to run postgres backup script: {script_path}")
        # Ensure the script is executable
        # It's good practice to make sure the script has execute permissions.
        # You can do this once outside the script or check here.
        # For simplicity, we assume it's executable. If not, add:
        # os.chmod(script_path, 0o755)

        # Run the script
        process = subprocess.run(
            [script_path],
            capture_output=True,
            text=True,
            check=False  # Set to True if you want to raise CalledProcessError on non-zero exit codes
        )

        # Log stdout
        if process.stdout:
            logger.info(f"Script stdout:\n{process.stdout}")
        # Log stderr
        if process.stderr:
            logger.error(f"Script stderr:\n{process.stderr}")

        if process.returncode == 0:
            logger.info(f"Postgres backup script '{script_path}' executed successfully.")
        else:
            logger.error(f"Postgres backup script '{script_path}' failed with return code {process.returncode}.")

    except FileNotFoundError:
        logger.error(f"Error: The script {script_path} was not found.")
    except Exception as e:
        logger.error(f"An unexpected error occurred while trying to run {script_path}: {e}")



def backup_postgres_db_loop(interval_seconds: int):
    """
    Periodically run the script to backup the postgres db
    """
    process_id = os.getpid()
    while True:
        logger.info(f"Process {process_id} checking for documents to send email for view of signed document...")
        backup_postgres_db()
        time.sleep(interval_seconds)




# Example Usage (Update credentials for Gmail)
if __name__ == "__main__":
    print("Starting postgres db backup batch process...")
    backup_postgres_db()
    print("Postgres DB backup batch process finished.")
