#!/bin/bash

# Klippers Database Backup Script
# This script backs up the PostgreSQL database

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="klippers-postgres-db"
DB_NAME="klippers_test"
DB_USER="klippersuser"
BACKUP_DIR="./backups"
DATE_FORMAT=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${DATE_FORMAT}.sql"

# Functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if container is running
check_container() {
    print_info "Checking container status..."
    if ! docker ps | grep -q "${CONTAINER_NAME}"; then
        print_error "Container '${CONTAINER_NAME}' is not running!"
        print_info "To start the container: docker-compose up -d klippers_postgres_db"
        exit 1
    fi
    print_success "Container is running"
}

# Create backup directory
create_backup_dir() {
    print_info "Creating backup directory: ${BACKUP_DIR}"
    mkdir -p "${BACKUP_DIR}"
}

# Backup database
backup_database() {
    print_info "Backing up database..."
    print_info "Container: ${CONTAINER_NAME}"
    print_info "Database: ${DB_NAME}"
    print_info "User: ${DB_USER}"
    print_info "Backup file: ${BACKUP_FILE}"
    
    # Backup using pg_dump
    docker exec "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" > "${BACKUP_FILE}"
    
    if [ $? -eq 0 ]; then
        print_success "Backup created successfully: ${BACKUP_FILE}"
        
        # Show file size
        FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
        print_info "Backup file size: ${FILE_SIZE}"
    else
        print_error "Backup failed!"
        exit 1
    fi
}

# Cleanup old backups (older than 7 days)
cleanup_old_backups() {
    print_info "Cleaning up old backups (older than 7 days)..."
    find "${BACKUP_DIR}" -name "${DB_NAME}_*.sql" -type f -mtime +7 -exec echo "Deleting: {}" \; -exec rm {} \;
    print_success "Old backups cleaned up"
}

# List backups
list_backups() {
    print_info "Available backups:"
    if [ -d "${BACKUP_DIR}" ]; then
        ls -lah "${BACKUP_DIR}/${DB_NAME}_"*.sql 2>/dev/null || print_warning "No backup files found"
    else
        print_warning "Backup directory not found"
    fi
}

# Main function
main() {
    echo "=========================================="
    echo "🗄️  Klippers Database Backup Script"
    echo "=========================================="
    
    check_container
    create_backup_dir
    backup_database
    cleanup_old_backups
    list_backups
    
    echo "=========================================="
    print_success "Backup process completed!"
    echo "=========================================="
}

# Run script
main "$@"
