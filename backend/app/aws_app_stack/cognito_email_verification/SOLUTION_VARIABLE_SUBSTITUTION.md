# Solution: Fix Cognito Email Variable Substitution

## Problem

AWS Cognito was not substituting `{username}` and `{####}` variables in verification emails, resulting in URLs like:
```
https://subtiter.ai/api/v1/auth/confirm-signup/{username}/712956
```

Instead of:
```
https://subtiter.ai/api/v1/auth/confirm-signup/user@example.com/712956
```

## Root Cause

The Cognito User Pool was created **without** `UsernameAttributes` configured to use email. When this setting is not configured at pool creation time:

1. Cognito treats `username` and `email` as separate fields
2. The `{username}` placeholder in email templates doesn't get substituted properly
3. The `VerificationMessageTemplate` field doesn't support variable substitution in HTML attributes
4. **This setting CANNOT be changed after the user pool is created** (AWS limitation)

## Solutions

You have **3 options** to fix this issue:

---

### ✅ **Option 1: Lambda Custom Message Trigger** (RECOMMENDED)

This is the **proper AWS-recommended solution** that works with your existing user pool.

#### How It Works
- A Lambda function intercepts Cognito's email sending
- The function receives the verification code and user email
- It customizes the email with proper variable substitution
- Cognito sends the customized email

#### Deployment Steps

```bash
cd app/aws_app_stack/cognito_email_verification/scripts
./deploy_lambda_trigger.sh
```

This script will:
1. Create an IAM role for the Lambda function
2. Deploy the Lambda function with your custom email template
3. Grant Cognito permission to invoke the Lambda
4. Attach the Lambda trigger to your Cognito User Pool

#### Files Created
- `lambda_custom_message.py` - The Lambda function code
- `deploy_lambda_trigger.sh` - Automated deployment script

#### Advantages
✅ Works with existing user pool  
✅ No code changes required in your application  
✅ Full control over email content  
✅ Proper variable substitution guaranteed  
✅ Can customize for different trigger types (signup, forgot password, etc.)

#### Test It
After deployment, register a new user and check the verification email!

---

### Option 2: Recreate User Pool with UsernameAttributes

#### Steps
1. Create a new Cognito User Pool with `UsernameAttributes=['email']`
2. Migrate existing users (if any)
3. Update your application configuration with the new pool ID

#### Advantages
✅ Native Cognito variable substitution works  
✅ No Lambda function needed  

#### Disadvantages
❌ Requires migrating users  
❌ Downtime during migration  
❌ Need to update all configurations  

---

### Option 3: Custom Email Sending from Backend

#### How It Works
- Disable Cognito's automatic emails
- Send verification emails from your backend using SMTP/SES
- Full control over email content and delivery

#### Implementation
Use the `VerificationEmailService` class in `app/service/email_service.py`

#### Advantages
✅ Complete control over email sending  
✅ Can use your own email service (SendGrid, Mailgun, etc.)  
✅ Custom analytics and tracking  

#### Disadvantages
❌ More complex implementation  
❌ Need to manage email infrastructure  
❌ Cognito doesn't provide verification codes via API  

---

## Recommended Solution

**Use Option 1 (Lambda Custom Message Trigger)**

This is the best solution because:
1. ✅ Works immediately with your existing setup
2. ✅ No application code changes needed
3. ✅ AWS-recommended approach
4. ✅ Reliable and scalable
5. ✅ Easy to maintain and update

## Deployment Instructions

### Deploy the Lambda Trigger

```bash
# Navigate to scripts directory
cd app/aws_app_stack/cognito_email_verification/scripts

# Run the deployment script
./deploy_lambda_trigger.sh
```

The script will output:
```
=========================================
✅ Deployment Complete!
=========================================

Lambda Function ARN: arn:aws:lambda:eu-west-1:697903399510:function:CognitoCustomMessageTrigger

The Lambda Custom Message trigger is now active.
All verification emails will use the custom template
with proper {username} and {####} variable substitution.

Test by registering a new user!
```

### Verify It Works

1. Register a new user via your API
2. Check the verification email
3. The link should now show: `https://subtiter.ai/api/v1/auth/confirm-signup/user@example.com/123456`
4. Click the link to verify it works!

## Troubleshooting

### Lambda function not triggering
- Check CloudWatch Logs for the Lambda function
- Verify the trigger is attached in Cognito User Pool console
- Ensure Lambda has permission to be invoked by Cognito

### Email still not working
- Check Cognito email configuration (should use COGNITO_DEFAULT or SES)
- Verify auto-verified attributes include 'email'
- Check if user pool is in sandbox mode (50 emails/day limit)

### Need to update the email template
1. Edit `lambda_custom_message.py`
2. Run `./deploy_lambda_trigger.sh` again
3. Test with a new user registration

## AWS Console Verification

To verify the Lambda trigger is attached:

1. Go to AWS Cognito Console
2. Select your User Pool (`subtiter-user-pool`)
3. Click "Triggers" tab
4. Verify "Custom message" shows your Lambda function ARN

## Cost

Lambda Custom Message triggers are very cost-effective:
- **Lambda**: ~$0.20 per 1 million requests
- **Typical usage**: If you have 1000 signups/month = $0.0002/month
- **Essentially free** for most applications

## Support

If you encounter issues:
1. Check CloudWatch Logs for the Lambda function
2. Review Cognito User Pool settings
3. Test with `python lambda_custom_message.py` locally first

## Summary

✅ **Problem**: Cognito not substituting `{username}` in emails  
✅ **Solution**: Lambda Custom Message Trigger  
✅ **Status**: Ready to deploy  
✅ **Action**: Run `./deploy_lambda_trigger.sh`  

---

**Last Updated**: November 2, 2025

