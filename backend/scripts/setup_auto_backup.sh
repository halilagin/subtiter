#!/bin/bash

# Subtiter Auto Backup Setup Script
# This script sets up automatic backups using cron jobs

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="/Users/berfinagin/projects/subtiter/backend"
BACKUP_SCRIPT="${SCRIPT_DIR}/scripts/backup_database.sh"
CRON_LOG="${SCRIPT_DIR}/backup_cron.log"

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

# Add cron job
add_cron_job() {
    local frequency="$1"
    local cron_entry=""
    
    case "$frequency" in
        "hourly")
            cron_entry="0 * * * * cd ${SCRIPT_DIR} && ${BACKUP_SCRIPT} >> ${CRON_LOG} 2>&1"
            ;;
        "daily")
            cron_entry="0 2 * * * cd ${SCRIPT_DIR} && ${BACKUP_SCRIPT} >> ${CRON_LOG} 2>&1"
            ;;
        "weekly")
            cron_entry="0 2 * * 0 cd ${SCRIPT_DIR} && ${BACKUP_SCRIPT} >> ${CRON_LOG} 2>&1"
            ;;
        *)
            print_error "Invalid frequency: $frequency"
            print_info "Valid options: hourly, daily, weekly"
            exit 1
            ;;
    esac
    
    print_info "Adding cron job: $cron_entry"
    
    # Get current crontab
    (crontab -l 2>/dev/null; echo "$cron_entry") | crontab -
    
    if [ $? -eq 0 ]; then
        print_success "Cron job added successfully!"
        print_info "Backup frequency: $frequency"
        print_info "Log file: $CRON_LOG"
    else
        print_error "Failed to add cron job!"
        exit 1
    fi
}

# List cron jobs
list_cron_jobs() {
    print_info "Current cron jobs:"
    crontab -l 2>/dev/null | grep -E "(backup|subtiter)" || print_warning "No Subtiter backup cron jobs found"
}

# Remove cron jobs
remove_cron_jobs() {
    print_info "Removing Subtiter backup cron jobs..."
    crontab -l 2>/dev/null | grep -v "backup_database.sh" | crontab -
    print_success "Cron jobs removed!"
}

# Test backup
test_backup() {
    print_info "Running test backup..."
    cd "$SCRIPT_DIR"
    ./scripts/backup_database.sh
}

# Main function
main() {
    echo "=========================================="
    echo "⏰ Subtiter Auto Backup Setup"
    echo "=========================================="
    
    case "${1:-help}" in
        "add")
            if [ -z "$2" ]; then
                print_error "Frequency not specified!"
                print_info "Usage: $0 add <frequency>"
                print_info "Valid options: hourly, daily, weekly"
                exit 1
            fi
            add_cron_job "$2"
            ;;
        "list")
            list_cron_jobs
            ;;
        "remove")
            remove_cron_jobs
            ;;
        "test")
            test_backup
            ;;
        "help"|*)
            echo "Usage: $0 <command> [options]"
            echo ""
            echo "Commands:"
            echo "  add <frequency>  - Add cron job (hourly, daily, weekly)"
            echo "  list            - List current cron jobs"
            echo "  remove          - Remove cron jobs"
            echo "  test            - Run test backup"
            echo "  help            - Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 add daily     # Daily backup at 02:00"
            echo "  $0 add hourly    # Hourly backup"
            echo "  $0 list          # Show current cron jobs"
            echo "  $0 remove        # Remove all backup cron jobs"
            echo "  $0 test          # Run test backup"
            ;;
    esac
}

# Run script
main "$@"
