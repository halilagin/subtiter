#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Variables from .env (though we'll use the direct value here for simplicity in the script)
DB_BACKUP_S3_BUCKET_NAME="klippers-psql-backup"
IAM_ROLE_NAME="klippers-backup"
IAM_POLICY_NAME="KlippersBackupS3PutObjectPolicy"

# Prompt for user-specific AWS information
read -p "Enter your AWS Region (e.g., us-east-1, eu-west-2): " AWS_REGION
read -p "Enter your AWS Account ID: " AWS_ACCOUNT_ID

echo "--- Starting S3 Bucket and IAM Role Creation ---"

# 1. Create the S3 Bucket
echo "Attempting to create S3 bucket: ${DB_BACKUP_S3_BUCKET_NAME} in region ${AWS_REGION}..."
if aws s3api head-bucket --bucket "${DB_BACKUP_S3_BUCKET_NAME}" 2>/dev/null; then
  echo "Bucket ${DB_BACKUP_S3_BUCKET_NAME} already exists. Skipping creation."
else
  aws s3api create-bucket --bucket "${DB_BACKUP_S3_BUCKET_NAME}" --region "${AWS_REGION}"
  echo "S3 bucket ${DB_BACKUP_S3_BUCKET_NAME} created successfully."
fi
echo "--------------------------------------------------"

# 2. Create the IAM Policy JSON for S3 Access
S3_POLICY_FILE="s3-put-policy.json"
cat <<EOF > "${S3_POLICY_FILE}"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:s3:::${DB_BACKUP_S3_BUCKET_NAME}/*"
      ]
    }
  ]
}
EOF
echo "IAM S3 policy JSON file '${S3_POLICY_FILE}' created."
echo "--------------------------------------------------"

# 3. Create the IAM Policy
echo "Attempting to create IAM policy: ${IAM_POLICY_NAME}..."
POLICY_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:policy/${IAM_POLICY_NAME}"
if aws iam get-policy --policy-arn "${POLICY_ARN}" 2>/dev/null; then
  echo "IAM Policy ${IAM_POLICY_NAME} already exists (ARN: ${POLICY_ARN}). Skipping creation."
else
  aws iam create-policy --policy-name "${IAM_POLICY_NAME}" --policy-document "file://${S3_POLICY_FILE}"
  echo "IAM policy ${IAM_POLICY_NAME} created successfully. ARN: ${POLICY_ARN}"
fi
echo "--------------------------------------------------"

# 4. Create the IAM Role Trust Policy JSON
# This example allows EC2 instances to assume the role.
# Modify the "Principal" section if another service (e.g., Lambda) needs to assume this role.
TRUST_POLICY_FILE="trust-policy.json"
cat <<EOF > "${TRUST_POLICY_FILE}"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
echo "IAM role trust policy JSON file '${TRUST_POLICY_FILE}' created."
echo "--------------------------------------------------"

# 5. Create the IAM Role
echo "Attempting to create IAM role: ${IAM_ROLE_NAME}..."
if aws iam get-role --role-name "${IAM_ROLE_NAME}" 2>/dev/null; then
  echo "IAM Role ${IAM_ROLE_NAME} already exists. Skipping creation."
else
  aws iam create-role --role-name "${IAM_ROLE_NAME}" --assume-role-policy-document "file://${TRUST_POLICY_FILE}"
  echo "IAM role ${IAM_ROLE_NAME} created successfully."
fi
echo "--------------------------------------------------"

# 6. Attach the Policy to the Role
echo "Attempting to attach policy ${IAM_POLICY_NAME} to role ${IAM_ROLE_NAME}..."
# Check if policy is already attached
ATTACHED_POLICIES=$(aws iam list-attached-role-policies --role-name "${IAM_ROLE_NAME}" --query "AttachedPolicies[?PolicyArn=='${POLICY_ARN}'].PolicyArn" --output text)
if [ -n "${ATTACHED_POLICIES}" ]; then
    echo "Policy ${IAM_POLICY_NAME} is already attached to role ${IAM_ROLE_NAME}."
else
    aws iam attach-role-policy --role-name "${IAM_ROLE_NAME}" --policy-arn "${POLICY_ARN}"
    echo "Policy ${IAM_POLICY_NAME} (ARN: ${POLICY_ARN}) attached to role ${IAM_ROLE_NAME}."
fi
echo "--------------------------------------------------"

# Clean up temporary JSON files
rm -f "${S3_POLICY_FILE}" "${TRUST_POLICY_FILE}"
echo "Temporary policy JSON files removed."

echo "--- Script execution finished ---"
echo "S3 Bucket: ${DB_BACKUP_S3_BUCKET_NAME}"
echo "IAM Role: ${IAM_ROLE_NAME}"
echo "IAM Policy: ${IAM_POLICY_NAME} (ARN: ${POLICY_ARN})"
echo "Remember to adjust the trust policy in '${TRUST_POLICY_FILE}' (now deleted, but template above) if services other than EC2 need to assume this role."
