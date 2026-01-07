#!/bin/bash

ENV_PATH=".env"

# --- Source environment variables if .env file exists ---
if [ -f "${ENV_PATH}" ]; then
  echo "Loading environment variables from ${ENV_PATH}"
  # Temporarily disable 'exit on unset variable' if it's set, to avoid script exiting if .env is missing variables
  # Then re-enable it if it was originally set.
  shopt_u_was_set=$(shopt -po nounset | awk '{print $2}')
  set +u
  # shellcheck disable=SC1090
  source "${ENV_PATH}"
  if [ "$shopt_u_was_set" == "on" ]; then
    set -u
  fi
else
  echo "INFO: ${ENV_PATH} not found. Using default configuration values."
fi

# --- Configuration ---
# Default values will be used if not set in .env or overridden by backup script's vars.
# These will preferentially use DB_BACKUP_ environment variables if they are set,
# otherwise they fall back to specific defaults.
DB_RESTORE_CONTAINER_NAME="${DB_BACKUP_CONTAINER_NAME:-klippers-postgres-db}"
DB_RESTORE_DB_NAME="${DB_BACKUP_DB_NAME:-klippers_test}"
DB_RESTORE_DB_USER="${DB_BACKUP_DB_USER:-klippersuser}"
DB_RESTORE_BACKUP_DIR="${DB_BACKUP_DIR:-/tmp/backups}"

# --- Helper function for logging ---
log_info() {
  echo "INFO: $1"
}

log_error() {
  echo "ERROR: $1" >&2
}

# --- Determine backup file to restore ---
BACKUP_FILE_TO_RESTORE=""
if [ -n "$1" ]; then
  if [ -f "$1" ]; then
    BACKUP_FILE_TO_RESTORE="$1"
    log_info "Using provided backup file: ${BACKUP_FILE_TO_RESTORE}"
  else
    log_error "Provided backup file not found: $1"
    exit 1
  fi
else
  log_info "No backup file provided. Searching for the latest backup in ${DB_RESTORE_BACKUP_DIR} for database ${DB_RESTORE_DB_NAME}..."
  if [ ! -d "${DB_RESTORE_BACKUP_DIR}" ]; then
      log_error "Backup directory ${DB_RESTORE_BACKUP_DIR} not found."
      exit 1
  fi
  # Find command: -print0 and xargs -0 for safe handling of filenames with spaces/newlines
  # ls -t sorts by modification time, newest first
  LATEST_BACKUP=$(find "${DB_RESTORE_BACKUP_DIR}" -name "${DB_RESTORE_DB_NAME}_*.sql.gz" -type f -print0 | xargs -0 ls -t 2>/dev/null | head -n 1)
  if [ -z "${LATEST_BACKUP}" ]; then
    log_error "No backup files found in ${DB_RESTORE_BACKUP_DIR} matching pattern ${DB_RESTORE_DB_NAME}_*.sql.gz"
    exit 1
  else
    BACKUP_FILE_TO_RESTORE="${LATEST_BACKUP}"
    log_info "Found latest backup file: ${BACKUP_FILE_TO_RESTORE}"
  fi
fi

# --- Confirmation ---
echo ""
echo "---------------------------------------------------------------------"
echo "WARNING: About to restore database '${DB_RESTORE_DB_NAME}'"
echo "from backup file: '${BACKUP_FILE_TO_RESTORE}'"
echo "Target container: '${DB_RESTORE_CONTAINER_NAME}'"
echo "As user: '${DB_RESTORE_DB_USER}'"
echo ""
echo "This operation will involve:"
echo "1. DROPPING the existing database '${DB_RESTORE_DB_NAME}' (if it exists)."
echo "2. CREATING a new database '${DB_RESTORE_DB_NAME}'."
echo "3. RESTORING data from the backup file."
echo "---------------------------------------------------------------------"
echo "IMPORTANT: Ensure no active connections to '${DB_RESTORE_DB_NAME}' before proceeding."
read -r -p "Are you sure you want to proceed? (type 'yes' to confirm): " CONFIRMATION

if [[ "${CONFIRMATION}" != "yes" ]]; then
  log_info "Restore operation cancelled by the user."
  exit 0
fi

# --- Perform the restore ---
log_info "Starting restore of database '${DB_RESTORE_DB_NAME}'..."

# Step 1: Terminate connections and Drop the existing database (if it exists)
log_info "Attempting to terminate active connections to '${DB_RESTORE_DB_NAME}'..."
# Use psql to execute commands:
# 1. Select and terminate all backends connected to DB_RESTORE_DB_NAME, except the current session.
#    pg_terminate_backend() returns true for success, false for failure.
#    We select count(*) to see how many connections were attempted to be terminated.
#    Note: The user DB_RESTORE_DB_USER needs to be a superuser or have appropriate permissions
#    to terminate other users' backends.
TERMINATE_SQL="SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_RESTORE_DB_NAME}' AND pid <> pg_backend_pid();"
docker exec "${DB_RESTORE_CONTAINER_NAME}" psql -U "${DB_RESTORE_DB_USER}" -d postgres -qtAX -c "${TERMINATE_SQL}"
TERMINATE_CONN_STATUS=$?

if [ ${TERMINATE_CONN_STATUS} -ne 0 ]; then
  log_info "Warning: Command to terminate connections exited with status ${TERMINATE_CONN_STATUS}. This might be okay if no connections existed or due to permission issues. Proceeding with drop attempt."
else
  log_info "Successfully issued commands to terminate connections. There might be a slight delay for connections to fully terminate."
  # Optional: Add a short sleep to give connections time to close, though pg_terminate_backend should be quite fast.
  # sleep 2
fi

log_info "Attempting to drop existing database '${DB_RESTORE_DB_NAME}' (if it exists)..."
# The user DB_RESTORE_DB_USER needs permissions to drop the database. Typically, this means being the owner or a superuser.
# Connecting to 'postgres' database to avoid "cannot drop the currently open database" errors.
docker exec "${DB_RESTORE_CONTAINER_NAME}" psql -U "${DB_RESTORE_DB_USER}" -d postgres -c "DROP DATABASE IF EXISTS \"${DB_RESTORE_DB_NAME}\";"
DROP_STATUS=$?
if [ ${DROP_STATUS} -ne 0 ]; then
  # This might not be a fatal error if the DB didn't exist, but log a warning.
  # CREATE DATABASE will fail later if it exists and couldn't be dropped.
  log_info "Warning: 'DROP DATABASE' command exited with status ${DROP_STATUS}. This may be okay if the database didn't exist."
fi

# Step 2: Create the new database
log_info "Creating new database '${DB_RESTORE_DB_NAME}'..."
# The user DB_RESTORE_DB_USER needs CREATEDB privilege, or be a superuser.
# Setting the owner explicitly to DB_RESTORE_DB_USER.
docker exec "${DB_RESTORE_CONTAINER_NAME}" psql -U "${DB_RESTORE_DB_USER}" -d postgres -c "CREATE DATABASE \"${DB_RESTORE_DB_NAME}\" OWNER \"${DB_RESTORE_DB_USER}\";"
CREATE_STATUS=$?
if [ ${CREATE_STATUS} -ne 0 ]; then
  log_error "Failed to create database '${DB_RESTORE_DB_NAME}'. Exit status: ${CREATE_STATUS}."
  log_error "Please check if user '${DB_RESTORE_DB_USER}' has CREATEDB privileges, can connect to the 'postgres' database, and that the database was successfully dropped."
  exit 1
fi



# Step 3: Restore the database from the backup file
log_info "Preparing to restore database '${DB_RESTORE_DB_NAME}' from '${BACKUP_FILE_TO_RESTORE}'..."

CONTAINER_BACKUP_FILENAME=$(basename "${BACKUP_FILE_TO_RESTORE}")
CONTAINER_BACKUP_PATH="/tmp/${CONTAINER_BACKUP_FILENAME}"

log_info "Copying backup file '${BACKUP_FILE_TO_RESTORE}' to container '${DB_RESTORE_CONTAINER_NAME}:${CONTAINER_BACKUP_PATH}'..."
docker cp "${BACKUP_FILE_TO_RESTORE}" "${DB_RESTORE_CONTAINER_NAME}:${CONTAINER_BACKUP_PATH}"
COPY_STATUS=$?

if [ ${COPY_STATUS} -ne 0 ]; then
  log_error "Failed to copy backup file to container. Docker cp exit status: ${COPY_STATUS}."
  exit 1
fi


# Execute gunzip and pg_restore inside the container
# The `sh -c` allows us to run a shell command string that includes the pipe.
docker exec "${DB_RESTORE_CONTAINER_NAME}" sh -c "pg_restore -v -U '${DB_RESTORE_DB_USER}' -d '${DB_RESTORE_DB_NAME}' ${CONTAINER_BACKUP_PATH}"
RESTORE_STATUS=$? # Capture status from sh -c, which should reflect pg_restore's status if --exit-on-error is used

# # --- Clean up backup file from container ---
# log_info "Cleaning up backup file '${CONTAINER_BACKUP_PATH}' from container '${DB_RESTORE_CONTAINER_NAME}'..."
# docker exec "${DB_RESTORE_CONTAINER_NAME}" rm -f "${CONTAINER_BACKUP_PATH}"
# CLEANUP_STATUS=$?
# if [ ${CLEANUP_STATUS} -ne 0 ]; then
#   log_info "Warning: Failed to remove backup file from container. Manual cleanup may be required in '${DB_RESTORE_CONTAINER_NAME}:${CONTAINER_BACKUP_PATH}'."
# fi


# # --- Check if restore was successful ---
# # The RESTORE_STATUS is now from the docker exec sh -c command
# if [ ${RESTORE_STATUS} -eq 0 ]; then
#   log_info "Database restore successful: '${DB_RESTORE_DB_NAME}' restored from '${BACKUP_FILE_TO_RESTORE}'"
# else
#   log_error "Database restore failed with status ${RESTORE_STATUS}!"
#   log_error "Check the output from pg_restore for details. The database '${DB_RESTORE_DB_NAME}' might be in an inconsistent state."
#   exit 1
# fi

# log_info "Restore process finished."
# exit 0 