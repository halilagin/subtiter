#!/bin/bash

# Script to update AWS Cognito email verification template
# Usage: ./update_template.sh [--html|--text]

set -e

# Set AWS credentials
export AWS_ACCESS_KEY_ID="your_aws_access_key_id"
export AWS_SECRET_ACCESS_KEY="your_aws_secret_access_key"

USER_POOL_ID="eu-west-1_AGIh2GbhI"  # New pool with UsernameAttributes=['email']
REGION="eu-west-1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$(dirname "$SCRIPT_DIR")/user_verification_template"
HTML_TEMPLATE="$TEMPLATE_DIR/email_template.html"
TEXT_TEMPLATE="$TEMPLATE_DIR/email_template.txt"
JSON_OUTPUT="/tmp/cognito_verification_template.json"

# Default to HTML
USE_HTML=true

# Parse arguments
if [ "$1" == "--text" ]; then
    USE_HTML=false
elif [ "$1" == "--html" ]; then
    USE_HTML=true
fi

echo "Updating Cognito email verification template..."
echo "User Pool ID: $USER_POOL_ID"
echo "Region: $REGION"

if [ "$USE_HTML" = true ]; then
    echo "Template Type: HTML"
    echo "Template File: $HTML_TEMPLATE"
    
    # Check if HTML template file exists
    if [ ! -f "$HTML_TEMPLATE" ]; then
        echo "Error: HTML template file not found: $HTML_TEMPLATE"
        exit 1
    fi
    
    # Read HTML content and escape for JSON
    HTML_CONTENT=$(cat "$HTML_TEMPLATE" | jq -Rs .)
    
    # Create JSON with HTML content
    cat > "$JSON_OUTPUT" << EOF
{
  "EmailMessage": $HTML_CONTENT,
  "EmailMessageByLink": $HTML_CONTENT,
  "EmailSubject": "Welcome to Klippers.ai - Verify Your Email 🎬",
  "DefaultEmailOption": "CONFIRM_WITH_CODE"
}
EOF
else
    echo "Template Type: Plain Text"
    echo "Template File: $TEXT_TEMPLATE"
    
    # Check if text template file exists
    if [ ! -f "$TEXT_TEMPLATE" ]; then
        echo "Error: Text template file not found: $TEXT_TEMPLATE"
        exit 1
    fi
    
    # Read text content and escape for JSON
    TEXT_CONTENT=$(tail -n +3 "$TEXT_TEMPLATE" | jq -Rs .)
    
    # Create JSON with text content
    cat > "$JSON_OUTPUT" << EOF
{
  "EmailMessage": $TEXT_CONTENT,
  "EmailSubject": "Welcome to Klippers.ai - Verify Your Email 🎬",
  "DefaultEmailOption": "CONFIRM_WITH_CODE"
}
EOF
fi

echo ""
echo "Generated JSON template at: $JSON_OUTPUT"
echo ""

# Read the HTML content directly
HTML_CONTENT=$(cat "$HTML_TEMPLATE")

echo "Step 1: Clearing VerificationMessageTemplate (which doesn't substitute variables properly)..."
# We need to set it to a minimal config to effectively disable it
cat > /tmp/minimal_template.json << 'EOF'
{
  "DefaultEmailOption": "CONFIRM_WITH_CODE"
}
EOF

# Update with minimal template first
aws cognito-idp update-user-pool \
  --user-pool-id "$USER_POOL_ID" \
  --region "$REGION" \
  --verification-message-template file:///tmp/minimal_template.json

echo ""
echo "Step 2: Setting EmailVerificationMessage (legacy field that DOES substitute variables)..."

# Now set the legacy fields which DO substitute variables
aws cognito-idp update-user-pool \
  --user-pool-id "$USER_POOL_ID" \
  --region "$REGION" \
  --email-verification-message "$HTML_CONTENT" \
  --email-verification-subject "Welcome to Klippers.ai - Verify Your Email" \
  --auto-verified-attributes email

echo ""
echo "✅ Email template updated successfully!"
echo "✅ Using legacy EmailVerificationMessage field for proper variable substitution"
echo "✅ Auto-verified attributes set to: email"
echo ""
echo "Verifying the update..."

# Verify the update
aws cognito-idp describe-user-pool \
  --user-pool-id "$USER_POOL_ID" \
  --region "$REGION" \
  --query 'UserPool.VerificationMessageTemplate.EmailSubject' \
  --output text

echo ""
echo "✅ Verification complete!"
echo ""

# Clean up
rm -f "$JSON_OUTPUT"

