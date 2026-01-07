#!/bin/bash

# Script to deploy the Lambda Custom Message trigger for Cognito
# This Lambda function will handle email customization with proper variable substitution

set -e

# Set AWS credentials
export AWS_ACCESS_KEY_ID="your_aws_access_key_id"
export AWS_SECRET_ACCESS_KEY="your_aws_secret_access_key"

REGION="eu-west-1"
USER_POOL_ID="eu-west-1_zm3OfnfeQ"
LAMBDA_FUNCTION_NAME="CognitoCustomMessageTrigger"
LAMBDA_ROLE_NAME="CognitoLambdaExecutionRole"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAMBDA_FILE="$(dirname "$SCRIPT_DIR")/lambda_custom_message.py"

echo "========================================="
echo "Deploying Cognito Custom Message Lambda"
echo "========================================="
echo ""

# Step 1: Create IAM role for Lambda (if it doesn't exist)
echo "Step 1: Creating IAM role for Lambda..."
ROLE_ARN=$(aws iam get-role --role-name "$LAMBDA_ROLE_NAME" --query 'Role.Arn' --output text 2>/dev/null || echo "")

if [ -z "$ROLE_ARN" ]; then
    echo "Creating new IAM role..."
    
    # Create trust policy
    cat > /tmp/lambda-trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
    
    ROLE_ARN=$(aws iam create-role \
        --role-name "$LAMBDA_ROLE_NAME" \
        --assume-role-policy-document file:///tmp/lambda-trust-policy.json \
        --query 'Role.Arn' \
        --output text)
    
    # Attach basic Lambda execution policy
    aws iam attach-role-policy \
        --role-name "$LAMBDA_ROLE_NAME" \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    
    echo "✅ IAM role created: $ROLE_ARN"
    echo "Waiting 10 seconds for role to propagate..."
    sleep 10
else
    echo "✅ IAM role already exists: $ROLE_ARN"
fi

# Step 2: Package and create/update Lambda function
echo ""
echo "Step 2: Packaging Lambda function..."
cd "$(dirname "$LAMBDA_FILE")"
zip /tmp/lambda-function.zip lambda_custom_message.py

echo "Creating/updating Lambda function..."
FUNCTION_EXISTS=$(aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --region "$REGION" 2>/dev/null || echo "")

if [ -z "$FUNCTION_EXISTS" ]; then
    echo "Creating new Lambda function..."
    aws lambda create-function \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --runtime python3.11 \
        --role "$ROLE_ARN" \
        --handler lambda_custom_message.lambda_handler \
        --zip-file fileb:///tmp/lambda-function.zip \
        --region "$REGION" \
        --timeout 10 \
        --memory-size 128
    echo "✅ Lambda function created"
else
    echo "Updating existing Lambda function..."
    aws lambda update-function-code \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --zip-file fileb:///tmp/lambda-function.zip \
        --region "$REGION"
    echo "✅ Lambda function updated"
fi

# Step 3: Add permission for Cognito to invoke Lambda
echo ""
echo "Step 3: Granting Cognito permission to invoke Lambda..."
aws lambda add-permission \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --statement-id "CognitoInvoke" \
    --action "lambda:InvokeFunction" \
    --principal cognito-idp.amazonaws.com \
    --source-arn "arn:aws:cognito-idp:$REGION:697903399510:userpool/$USER_POOL_ID" \
    --region "$REGION" 2>/dev/null || echo "Permission already exists"

# Step 4: Attach Lambda trigger to Cognito User Pool
echo ""
echo "Step 4: Attaching Lambda trigger to Cognito User Pool..."
LAMBDA_ARN=$(aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --region "$REGION" --query 'Configuration.FunctionArn' --output text)

aws cognito-idp update-user-pool \
    --user-pool-id "$USER_POOL_ID" \
    --region "$REGION" \
    --lambda-config CustomMessage="$LAMBDA_ARN"

echo ""
echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
echo ""
echo "Lambda Function ARN: $LAMBDA_ARN"
echo ""
echo "The Lambda Custom Message trigger is now active."
echo "All verification emails will use the custom template"
echo "with proper {username} and {####} variable substitution."
echo ""
echo "Test by registering a new user!"
echo ""

# Cleanup
rm -f /tmp/lambda-function.zip /tmp/lambda-trust-policy.json

