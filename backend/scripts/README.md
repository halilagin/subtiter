# 🗄️ Subtiter Backend Scripts

This directory contains utility scripts for managing the Subtiter backend, including AI cost analysis, database backup/restore, and user management.

## 💰 AI Cost Analysis Scripts

### `calculate_ai_costs.py` - Comprehensive Cost Analysis
Provides detailed breakdown of AI provider costs from `ai_cost.json` files.

```bash
python scripts/calculate_ai_costs.py <path_to_ai_cost.json>

# Example:
python scripts/calculate_ai_costs.py app/subtiter_warehouse/user123/video456/ai_cost.json
```

**Output includes:**
- 📊 Total cost and operation count
- 💰 Costs by provider (OpenAI, AWS Rekognition)
- 🔧 Costs by operation type (transcription, face detection, etc.)
- 🤖 Costs by model (whisper-1, gpt-4-turbo, rekognition models)
- 📈 Average cost per operation
- 📉 Percentage breakdown

**Example Output:**
```
================================================================================
AI COST ANALYSIS: ai_cost.json
================================================================================

📊 TOTAL COST: $0.064067
📝 Total Operations: 48

--------------------------------------------------------------------------------
💰 COSTS BY PROVIDER:
--------------------------------------------------------------------------------
  aws_rekognition                $  0.045000 (70.24%)
  openai                         $  0.019067 (29.76%)
```

### `sum_ai_costs.sh` - Quick Cost Summary
Quick bash script to sum up total AI costs.

```bash
./scripts/sum_ai_costs.sh <path_to_ai_cost.json>

# Example:
./scripts/sum_ai_costs.sh app/subtiter_warehouse/user123/video456/ai_cost.json
```

**Output:**
```
Total Cost: $0.064067
Total Operations: 48
```

## 📁 Database Backup Scripts

### 1. `backup_database.sh` - Manual Backup
Manually backs up the database.

```bash
# Take backup
./scripts/backup_database.sh
```

**Features:**
- ✅ Container status check
- ✅ Automatic backup directory creation
- ✅ Colored output
- ✅ File size display
- ✅ Old backup cleanup (7 days)
- ✅ Backup listing

### 2. `restore_database.sh` - Database Restore
Restores the database from a backup.

```bash
# Restore latest backup
./scripts/restore_database.sh latest

# Restore specific backup
./scripts/restore_database.sh subtiter_test_2025-10-28_21-48-21.sql

# List available backups
./scripts/restore_database.sh
```

**Features:**
- ✅ Security confirmation
- ✅ Automatic file finding
- ✅ Database cleanup and recreation
- ✅ Error checking

### 3. `setup_auto_backup.sh` - Automatic Backup Setup
Sets up automatic backups using cron jobs.

```bash
# Set up daily backup (at 02:00)
./scripts/setup_auto_backup.sh add daily

# Set up hourly backup
./scripts/setup_auto_backup.sh add hourly

# Set up weekly backup (Sunday 02:00)
./scripts/setup_auto_backup.sh add weekly

# List current cron jobs
./scripts/setup_auto_backup.sh list

# Remove cron jobs
./scripts/setup_auto_backup.sh remove

# Run test backup
./scripts/setup_auto_backup.sh test
```

## 🚀 Quick Start

### 1. First Backup
```bash
cd /Users/berfinagin/projects/subtiter/backend
./scripts/backup_database.sh
```

### 2. Set Up Automatic Backup
```bash
# Set up daily backup
./scripts/setup_auto_backup.sh add daily
```

### 3. Check Backups
```bash
# List available backups
ls -lah ./backups/

# Check cron jobs
./scripts/setup_auto_backup.sh list
```

## 📊 Backup Files

Backups are stored in `./backups/` directory:
- Format: `subtiter_test_YYYY-MM-DD_HH-MM-SS.sql`
- Size: ~32KB (empty database)
- Automatic cleanup: Files older than 7 days are deleted

## ⚙️ Configuration

Default settings in scripts:
- **Container**: `subtiter-postgres-db`
- **Database**: `subtiter_test`
- **User**: `subtiteruser`
- **Backup Directory**: `./backups/`

## 🔧 Troubleshooting

### Container Not Running
```bash
# Start container
docker-compose up -d subtiter_postgres_db

# Check container status
docker ps | grep subtiter-postgres-db
```

### Backup Failed
```bash
# Check container logs
docker logs subtiter-postgres-db

# Test database connection
docker exec subtiter-postgres-db psql -U subtiteruser -d subtiter_test -c "\dt"
```

### Restore Failed
```bash
# Check if backup file exists
ls -lah ./backups/

# Check backup file contents
head -20 ./backups/subtiter_test_*.sql
```

## 📝 Log Files

- **Cron Log**: `./backup_cron.log` (for automatic backups)
- **Manual Log**: Terminal output (for manual backups)

## 🎯 Recommended Usage

1. **Development**: Take manual backups
2. **Test**: Set up daily automatic backups
3. **Production**: Hourly backup + S3 backup

## 🔒 Security

- Backup files are stored locally
- Restore operation requires confirmation
- Old backups are automatically cleaned up
- Database passwords are stored in environment variables

---

**Note**: These scripts are designed for development environments. Additional security measures should be taken in production environments.
