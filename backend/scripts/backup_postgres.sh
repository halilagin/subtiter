#!/bin/bash

#ENV_PATH=".env.docker.prod"
ENV_PATH="/home/ubuntu/github/subtiter_repo/subtiter/backend/.env.docker.prod"

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
# Default values will be used if not set in .env
DB_BACKUP_CONTAINER_NAME="${DB_BACKUP_CONTAINER_NAME:-subtiter-postgres-db-prod}" # Or use CONTAINER_ID
DB_BACKUP_DB_NAME="${DB_BACKUP_DB_NAME:-subtiter_prod}"
DB_BACKUP_DB_USER="${DB_BACKUP_DB_USER:-subtiteruser_prod}"
DB_BACKUP_DIR="${DB_BACKUP_DIR:-/tmp/backups}" # e.g., /mnt/backups/postgres
DB_BACKUP_DATE_FORMAT=$(date +"%Y-%m-%d_%H-%M-%S")
DB_BACKUP_FILE="${DB_BACKUP_DIR}/${DB_BACKUP_DB_NAME}_${DB_BACKUP_DATE_FORMAT}.sql" # Using .gz for compression
DB_BACKUP_DAYS_TO_KEEP="${DB_BACKUP_DAYS_TO_KEEP:-7}"
DB_BACKUP_S3_BUCKET_NAME="${DB_BACKUP_S3_BUCKET_NAME:-subtiter-psql-backup}"

# --- Create backup directory if it doesn't exist ---
mkdir -p "${DB_BACKUP_DIR}"

# --- Perform the backup ---
echo "Starting backup of database '${DB_BACKUP_DB_NAME}' from container '${DB_BACKUP_CONTAINER_NAME}'..."

# Using docker exec to run pg_dump inside the container
# The output is piped to gzip for compression and then redirected to the backup file on the host

# echo docker exec -u postgres ${DB_BACKUP_CONTAINER_NAME}  pg_dump -U ${DB_BACKUP_DB_USER} -d ${DB_BACKUP_DB_NAME}" -Fc > /tmp/backup_file.dump"



docker exec -u postgres -i "${DB_BACKUP_CONTAINER_NAME}" pg_dump -U "${DB_BACKUP_DB_USER}" -d "${DB_BACKUP_DB_NAME}" -Fc > "${DB_BACKUP_FILE}"
# docker exec -u postgres -t "${DB_BACKUP_CONTAINER_NAME}" pg_dump -U "${DB_BACKUP_DB_USER}" -d "${DB_BACKUP_DB_NAME}" -Fc | gzip > "${DB_BACKUP_FILE}"
# -Fc creates a custom-format archive, which is generally recommended as it's compressed
# and allows for more flexibility during restore (e.g., selecting specific tables).
# If you prefer a plain SQL dump, remove -Fc and change the extension to .sql (and remove gzip if not compressing)
# e.g., docker exec -t "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" > "${BACKUP_DIR}/${DB_NAME}_${DATE_FORMAT}.sql"

# --- Check if backup was successful ---
if [ $? -eq 0 ]; then
  echo "Backup successful: ${DB_BACKUP_FILE}"
else
  echo "ERROR: Backup failed!"
  # Optional: Send a notification here (e.g., email)
  exit 1
fi

echo "Uploading backup to S3..."
echo aws s3 cp "${DB_BACKUP_FILE}" "s3://${DB_BACKUP_S3_BUCKET_NAME}/${DB_BACKUP_FILE}"

aws s3 cp "${DB_BACKUP_FILE}" "s3://${DB_BACKUP_S3_BUCKET_NAME}/${DB_BACKUP_FILE}" || {
  echo "ERROR: Failed to upload backup to S3!"
}

# --- Prune old backups (optional) ---
if [ -n "${DB_BACKUP_DAYS_TO_KEEP}" ]; then
  echo "Pruning backups older than ${DB_BACKUP_DAYS_TO_KEEP} days in ${DB_BACKUP_DIR}..."
  find "${DB_BACKUP_DIR}" -name "${DB_BACKUP_DB_NAME}_*.sql" -type f -mtime +"${DB_BACKUP_DAYS_TO_KEEP}" -exec echo "Deleting old backup: {}" \; -exec rm {} \;
  # For plain .sql files:
  # find "${DB_BACKUP_DIR}" -name "${DB_BACKUP_DB_NAME}_*.sql" -type f -mtime +"${DB_BACKUP_DAYS_TO_KEEP}" -exec echo "Deleting old backup: {}" \; -exec rm {} \;
  echo "Pruning complete."
fi

echo "Backup process finished."
exit 0
