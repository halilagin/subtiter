#!/bin/bash

# Klippers Database Restore Script
# This script restores the PostgreSQL database

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

# Show usage information
show_usage() {
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Examples:"
    echo "  $0 klippers_test_2025-10-28_21-48-21.sql"
    echo "  $0 latest  # Use the latest backup"
    echo ""
    echo "Available backups:"
    if [ -d "${BACKUP_DIR}" ]; then
        ls -lah "${BACKUP_DIR}/${DB_NAME}_"*.sql 2>/dev/null || print_warning "No backup files found"
    else
        print_warning "Backup directory not found"
    fi
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

# Find backup file
find_backup_file() {
    local backup_file="$1"
    
    if [ "$backup_file" = "latest" ]; then
        print_info "Searching for latest backup file..."
        backup_file=$(ls -t "${BACKUP_DIR}/${DB_NAME}_"*.sql 2>/dev/null | head -n1)
        if [ -z "$backup_file" ]; then
            print_error "No backup file found!"
            exit 1
        fi
        print_info "Latest backup: $(basename "$backup_file")"
    else
        # If full path is provided, use it; otherwise search in backup directory
        if [[ "$backup_file" == /* ]]; then
            # Full path
            if [ ! -f "$backup_file" ]; then
                print_error "Backup file not found: $backup_file"
                exit 1
            fi
        else
            # Just filename, search in backup directory
            backup_file="${BACKUP_DIR}/${backup_file}"
            if [ ! -f "$backup_file" ]; then
                print_error "Backup file not found: $backup_file"
                exit 1
            fi
        fi
    fi
    
    echo "$backup_file"
}

# Confirm restore
confirm_restore() {
    local backup_file="$1"
    print_warning "⚠️  WARNING: This will completely delete and restore the current database!"
    print_warning "Backup file: $(basename "$backup_file")"
    print_warning "Database: ${DB_NAME}"
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        print_info "Operation cancelled."
        exit 0
    fi
}

# Restore database
restore_database() {
    local backup_file="$1"
    
    print_info "Restoring database..."
    print_info "Backup file: $backup_file"
    print_info "Database: ${DB_NAME}"
    
    # First, clean and recreate the database
    print_info "Cleaning current database..."
    docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};"
    docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d postgres -c "CREATE DATABASE ${DB_NAME};"
    
    # Restore backup
    print_info "Restoring backup..."
    docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" < "$backup_file"
    
    if [ $? -eq 0 ]; then
        print_success "Database restored successfully!"
    else
        print_error "Database restore failed!"
        exit 1
    fi
}

# Main function
main() {
    echo "=========================================="
    echo "🔄 Klippers Database Restore Script"
    echo "=========================================="
    
    # Parameter check
    if [ $# -eq 0 ]; then
        show_usage
        exit 1
    fi
    
    check_container
    
    local backup_file
    backup_file=$(find_backup_file "$1")
    
    confirm_restore "$backup_file"
    restore_database "$backup_file"
    
    echo "=========================================="
    print_success "Restore process completed!"
    echo "=========================================="
}

# Run script
main "$@"
