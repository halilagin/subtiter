#!/bin/bash

# Script to create a new Cognito User Pool with proper UsernameAttributes configuration
# This will fix the {username} variable substitution issue in email templates

set -e

# Set AWS credentials
export AWS_ACCESS_KEY_ID="your_aws_access_key_id"
export AWS_SECRET_ACCESS_KEY="your_aws_secret_access_key"

REGION="eu-west-1"
OLD_USER_POOL_ID="eu-west-1_zm3OfnfeQ"
POOL_NAME="subtiter-user-pool-v2"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$(dirname "$SCRIPT_DIR")/user_verification_template"
HTML_TEMPLATE="$TEMPLATE_DIR/email_template.html"

echo "========================================="
echo "Creating New Cognito User Pool"
echo "========================================="
echo ""
echo "This will create a new User Pool with:"
echo "  - UsernameAttributes=['email']"
echo "  - Proper variable substitution in emails"
echo "  - Same configuration as old pool"
echo ""

# Read the HTML template
HTML_CONTENT=$(cat "$HTML_TEMPLATE")

# Create the new user pool with proper configuration
echo "Step 1: Creating new User Pool..."
echo ""

NEW_POOL_ID=$(aws cognito-idp create-user-pool \
  --pool-name "$POOL_NAME" \
  --region "$REGION" \
  --username-attributes email \
  --auto-verified-attributes email \
  --email-verification-message "$HTML_CONTENT" \
  --email-verification-subject "Welcome to Subtiter.ai - Verify Your Email 🎬" \
  --policies '{
    "PasswordPolicy": {
      "MinimumLength": 8,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": false
    }
  }' \
  --schema '[
    {
      "Name": "email",
      "AttributeDataType": "String",
      "Required": true,
      "Mutable": false
    },
    {
      "Name": "name",
      "AttributeDataType": "String",
      "Required": false,
      "Mutable": true
    },
    {
      "Name": "subscription_plan",
      "AttributeDataType": "String",
      "DeveloperOnlyAttribute": false,
      "Mutable": true,
      "Required": false,
      "StringAttributeConstraints": {
        "MinLength": "1",
        "MaxLength": "256"
      }
    }
  ]' \
  --user-attribute-update-settings '{
    "AttributesRequireVerificationBeforeUpdate": []
  }' \
  --mfa-configuration OFF \
  --account-recovery-setting '{
    "RecoveryMechanisms": [
      {
        "Priority": 1,
        "Name": "verified_email"
      }
    ]
  }' \
  --query 'UserPool.Id' \
  --output text)

echo "✅ New User Pool created: $NEW_POOL_ID"
echo ""

# Create app client
echo "Step 2: Creating App Client..."
CLIENT_ID=$(aws cognito-idp create-user-pool-client \
  --user-pool-id "$NEW_POOL_ID" \
  --client-name "subtiter-client" \
  --region "$REGION" \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_SRP_AUTH \
  --generate-secret false \
  --prevent-user-existence-errors ENABLED \
  --enable-token-revocation \
  --access-token-validity 1440 \
  --id-token-validity 1440 \
  --refresh-token-validity 30 \
  --token-validity-units '{
    "AccessToken": "minutes",
    "IdToken": "minutes",
    "RefreshToken": "days"
  }' \
  --query 'UserPoolClient.ClientId' \
  --output text)

echo "✅ App Client created: $CLIENT_ID"
echo ""

# Create domain (optional, for hosted UI)
echo "Step 3: Creating User Pool Domain..."
DOMAIN_NAME="subtiter-auth-$(date +%s)"
aws cognito-idp create-user-pool-domain \
  --domain "$DOMAIN_NAME" \
  --user-pool-id "$NEW_POOL_ID" \
  --region "$REGION" 2>/dev/null || echo "Domain creation skipped (optional)"

echo ""
echo "========================================="
echo "✅ New User Pool Created Successfully!"
echo "========================================="
echo ""
echo "NEW CONFIGURATION:"
echo "  User Pool ID: $NEW_POOL_ID"
echo "  Client ID: $CLIENT_ID"
echo "  Region: $REGION"
echo "  Domain: $DOMAIN_NAME (if created)"
echo ""
echo "========================================="
echo "NEXT STEPS:"
echo "========================================="
echo ""
echo "1. Update your .env file:"
echo "   AWS_COGNITO_USER_POOL_ID=$NEW_POOL_ID"
echo "   AWS_COGNITO_CLIENT_ID=$CLIENT_ID"
echo ""
echo "2. Update app/aws_app_stack/cognito_config.py:"
echo "   aws_cognito_user_pool_id = \"$NEW_POOL_ID\""
echo "   aws_cognito_client_id = \"$CLIENT_ID\""
echo ""
echo "3. Test with a new user registration"
echo ""
echo "4. If everything works, delete the old pool:"
echo "   aws cognito-idp delete-user-pool --user-pool-id $OLD_USER_POOL_ID --region $REGION"
echo ""
echo "========================================="
echo "IMPORTANT: Variable Substitution"
echo "========================================="
echo ""
echo "With this new pool, {username} will be substituted"
echo "with the user's email address in verification emails!"
echo ""
echo "The email template will now work correctly with:"
echo "  - {username} → user@example.com"
echo "  - {####} → 123456"
echo ""

# Save configuration to file
cat > /tmp/new_cognito_config.txt << EOF
# New Cognito Configuration
AWS_COGNITO_USER_POOL_ID=$NEW_POOL_ID
AWS_COGNITO_CLIENT_ID=$CLIENT_ID
AWS_REGION=$REGION

# Old pool (for reference)
OLD_USER_POOL_ID=$OLD_USER_POOL_ID
EOF

echo "Configuration saved to: /tmp/new_cognito_config.txt"
echo ""

