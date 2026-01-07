# Fargate Deployment Checklist

Use this checklist to ensure a smooth deployment of the Subtitercmd video processing pipeline to AWS Fargate.

## ✅ Pre-Deployment Checklist

### AWS Account Setup
- [ ] AWS account created and configured
- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] IAM user/role has necessary permissions:
  - [ ] ECS/Fargate
  - [ ] ECR
  - [ ] Step Functions
  - [ ] IAM role creation
  - [ ] VPC management
  - [ ] CloudWatch Logs
  - [ ] S3 (for Terraform state)
- [ ] Verified AWS credentials: `aws sts get-caller-identity`

### Local Development Environment
- [ ] Docker installed and running
- [ ] Terraform >= 1.0 installed
- [ ] jq installed (for JSON parsing)
- [ ] Make installed (optional but recommended)
- [ ] Git repository cloned

### Configuration Files
- [ ] Created `.env.fargate` from template:
  ```bash
  cd app/subtitercmd
  cp env.fargate.template .env.fargate
  ```
- [ ] Updated `.env.fargate` with actual values:
  - [ ] Database URL (RDS endpoint)
  - [ ] OpenAI API key
  - [ ] Deepgram API key
  - [ ] AWS credentials
  - [ ] Stripe keys
  - [ ] Email configuration
  - [ ] Other API keys and secrets

### S3 Bucket for Terraform State
- [ ] Created S3 bucket for Terraform state:
  ```bash
  aws s3 mb s3://subtiter-terraform-state-v2 --region eu-west-1
  ```
- [ ] Enabled versioning on the bucket:
  ```bash
  aws s3api put-bucket-versioning \
    --bucket subtiter-terraform-state-v2 \
    --versioning-configuration Status=Enabled
  ```

## ✅ Infrastructure Deployment

### Terraform Initialization
- [ ] Navigated to Terraform directory:
  ```bash
  cd infra/resources
  ```
- [ ] Initialized Terraform:
  ```bash
  terraform init
  ```
- [ ] Verified initialization successful

### Terraform Planning
- [ ] Reviewed Terraform plan:
  ```bash
  terraform plan
  ```
- [ ] Verified resources to be created:
  - [ ] VPC and networking components
  - [ ] ECS cluster
  - [ ] ECR repository
  - [ ] Task definition
  - [ ] Step Functions state machine
  - [ ] IAM roles and policies
  - [ ] CloudWatch log group
  - [ ] Security groups
- [ ] No unexpected changes or errors

### Terraform Apply
- [ ] Applied Terraform configuration:
  ```bash
  terraform apply
  ```
- [ ] Typed 'yes' to confirm
- [ ] Deployment completed successfully
- [ ] Noted output values:
  - [ ] ECS cluster name: `_________________`
  - [ ] ECR repository URL: `_________________`
  - [ ] Step Function ARN: `_________________`
  - [ ] CloudWatch log group: `_________________`

### Infrastructure Verification
- [ ] Verified ECS cluster exists:
  ```bash
  aws ecs describe-clusters --clusters subtiter-video-processing-cluster
  ```
- [ ] Verified ECR repository exists:
  ```bash
  aws ecr describe-repositories --repository-names subtitercmd
  ```
- [ ] Verified Step Function exists:
  ```bash
  aws stepfunctions list-state-machines | grep subtiter
  ```
- [ ] Verified CloudWatch log group exists:
  ```bash
  aws logs describe-log-groups --log-group-name-prefix /ecs/subtiter
  ```

## ✅ Docker Image Build and Push

### Build Docker Image
- [ ] Navigated to subtitercmd directory:
  ```bash
  cd ../../app/subtitercmd
  ```
- [ ] Verified `.env.fargate` exists and is configured
- [ ] Made scripts executable:
  ```bash
  chmod +x build-and-push.sh trigger-step-function.sh entrypoint.sh
  ```
- [ ] Built Docker image locally (optional test):
  ```bash
  docker build -t subtitercmd:latest .
  ```
- [ ] Verified build successful

### Push to ECR
- [ ] Logged in to ECR:
  ```bash
  aws ecr get-login-password --region eu-west-1 | \
    docker login --username AWS --password-stdin <account-id>.dkr.ecr.eu-west-1.amazonaws.com
  ```
- [ ] Built and pushed image:
  ```bash
  ./build-and-push.sh eu-west-1
  ```
- [ ] Verified image in ECR:
  ```bash
  aws ecr list-images --repository-name subtitercmd
  ```
- [ ] Checked image scan results (if enabled):
  ```bash
  aws ecr describe-image-scan-findings \
    --repository-name subtitercmd \
    --image-id imageTag=latest
  ```

## ✅ Testing

### Local Docker Test (Optional)
- [ ] Tested container locally:
  ```bash
  docker run --rm \
    -e TASK_INPUT='{"user_id":"test","video_id":"test","mock_process":"true"}' \
    subtitercmd:latest
  ```
- [ ] Verified container starts and runs without errors

### Test Execution on Fargate
- [ ] Triggered test execution:
  ```bash
  ./trigger-step-function.sh \
    a285b474-7081-7094-7d0f-a3db04a98629 \
    947ff41e-11d5-4f11-9211-c32f3b3da0c9
  ```
- [ ] Noted execution ARN: `_________________`
- [ ] Monitored logs in real-time:
  ```bash
  aws logs tail /ecs/subtiter-video-processing --follow
  ```
- [ ] Verified execution completed successfully:
  ```bash
  aws stepfunctions describe-execution --execution-arn <ARN>
  ```
- [ ] Checked output/results in S3 or database

### Verify Processing Pipeline
- [ ] Audio extraction completed
- [ ] Transcription completed
- [ ] Important segments identified
- [ ] Video segments extracted
- [ ] Cropping and stacking completed
- [ ] Subtitles embedded
- [ ] Results stored correctly
- [ ] Database updated (if enabled)
- [ ] Chat notifications sent (if enabled)

## ✅ Integration

### Python Integration
- [ ] Tested `trigger_fargate.py` module:
  ```bash
  python trigger_fargate.py <USER_ID> <VIDEO_ID>
  ```
- [ ] Verified execution triggered successfully
- [ ] Verified status check works

### FastAPI Integration (if applicable)
- [ ] Reviewed `fastapi_integration_example.py`
- [ ] Integrated trigger code into video upload endpoint
- [ ] Tested upload → processing flow
- [ ] Verified background task execution
- [ ] Tested status check endpoint
- [ ] Tested execution history endpoint

## ✅ Monitoring Setup

### CloudWatch Logs
- [ ] Verified logs are being written:
  ```bash
  aws logs tail /ecs/subtiter-video-processing --since 1h
  ```
- [ ] Set up log retention policy (already set to 7 days in Terraform)
- [ ] Created log insights queries for common issues

### CloudWatch Alarms
- [ ] Created alarm for failed executions
- [ ] Created alarm for long-running tasks
- [ ] Created alarm for high error rates
- [ ] Configured SNS topic for notifications (optional)

### Metrics Dashboard
- [ ] Created CloudWatch dashboard with:
  - [ ] Execution count
  - [ ] Success/failure rate
  - [ ] Execution duration
  - [ ] Task CPU/Memory utilization

## ✅ Security

### Secrets Management
- [ ] Considered moving secrets to AWS Secrets Manager:
  ```bash
  aws secretsmanager create-secret \
    --name subtiter/openai-api-key \
    --secret-string "sk-your-key"
  ```
- [ ] Updated task definition to reference secrets (if using Secrets Manager)

### IAM Policies
- [ ] Reviewed task execution role permissions
- [ ] Reviewed task role permissions
- [ ] Verified least privilege principle
- [ ] Documented required permissions

### Network Security
- [ ] Reviewed security group rules
- [ ] Considered using private subnets with NAT Gateway for production
- [ ] Verified VPC configuration

### Image Scanning
- [ ] Verified ECR image scanning is enabled
- [ ] Reviewed scan results
- [ ] Addressed any critical vulnerabilities

## ✅ CI/CD Setup (Optional)

### GitHub Actions
- [ ] Reviewed `.github/workflows/deploy-fargate.yml`
- [ ] Added required secrets to GitHub repository:
  - [ ] AWS_ACCESS_KEY_ID
  - [ ] AWS_SECRET_ACCESS_KEY
  - [ ] All application secrets (DATABASE_URL, API keys, etc.)
- [ ] Tested workflow by pushing to main branch
- [ ] Verified automatic deployment works

## ✅ Documentation

### Team Documentation
- [ ] Shared deployment documentation with team
- [ ] Documented environment variables and their purpose
- [ ] Documented monitoring and alerting setup
- [ ] Created runbook for common issues

### Knowledge Transfer
- [ ] Trained team on triggering executions
- [ ] Showed team how to monitor logs
- [ ] Explained Step Functions workflow
- [ ] Documented troubleshooting steps

## ✅ Production Readiness

### Performance
- [ ] Tested with realistic video sizes
- [ ] Verified processing times are acceptable
- [ ] Monitored resource utilization (CPU/Memory)
- [ ] Adjusted task resources if needed

### Scalability
- [ ] Tested concurrent executions
- [ ] Verified Step Functions can handle load
- [ ] Considered implementing queue-based processing
- [ ] Planned for auto-scaling (if needed)

### Cost Optimization
- [ ] Reviewed cost estimates
- [ ] Considered Fargate Spot for non-critical workloads
- [ ] Right-sized task resources based on actual usage
- [ ] Set up cost alerts

### Disaster Recovery
- [ ] Documented recovery procedures
- [ ] Tested task definition rollback
- [ ] Verified Terraform state backup
- [ ] Documented emergency contacts

## ✅ Post-Deployment

### Monitoring
- [ ] Set up regular log reviews
- [ ] Monitor execution success rates
- [ ] Track processing times
- [ ] Monitor costs

### Maintenance
- [ ] Scheduled regular dependency updates
- [ ] Planned for Docker image updates
- [ ] Set up automated security scanning
- [ ] Documented maintenance procedures

### Optimization
- [ ] Reviewed performance metrics
- [ ] Identified optimization opportunities
- [ ] Planned for future improvements
- [ ] Documented lessons learned

## 📋 Quick Reference

### Important ARNs and IDs
- **ECS Cluster**: `subtiter-video-processing-cluster`
- **ECR Repository**: `subtitercmd`
- **Task Definition**: `subtiter-video-processing`
- **Step Function**: `subtiter-video-processing-workflow`
- **Log Group**: `/ecs/subtiter-video-processing`

### Common Commands
```bash
# Trigger processing
./trigger-step-function.sh <USER_ID> <VIDEO_ID>

# View logs
aws logs tail /ecs/subtiter-video-processing --follow

# Check executions
make -f Makefile.fargate status

# Rebuild and deploy
./build-and-push.sh eu-west-1

# Update infrastructure
cd ../../infra/resources && terraform apply
```

### Emergency Contacts
- **AWS Support**: _________________
- **DevOps Lead**: _________________
- **On-Call Engineer**: _________________

## ✅ Sign-off

- [ ] All checklist items completed
- [ ] System tested end-to-end
- [ ] Team trained and documentation shared
- [ ] Monitoring and alerts configured
- [ ] Ready for production use

**Deployed By**: _________________  
**Date**: _________________  
**Environment**: [ ] Production [ ] Staging [ ] Development  
**Version/Commit**: _________________

---

## 🎉 Congratulations!

Your Subtitercmd video processing pipeline is now deployed to AWS Fargate and ready for production use!

For ongoing support, refer to:
- `DEPLOYMENT_GUIDE.md` - Detailed deployment guide
- `README_FARGATE.md` - Quick reference
- `FARGATE_SETUP_SUMMARY.md` - Setup summary

