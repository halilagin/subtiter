"""
AWS Lambda Custom Message Trigger for Cognito
This Lambda function customizes the verification email sent by Cognito
and ensures proper variable substitution.

Deploy this as a Lambda function and attach it to your Cognito User Pool
as a Custom Message trigger.

AWS Console Steps:
1. Go to AWS Lambda console
2. Create a new function named "CognitoCustomMessageTrigger"
3. Copy this code into the function
4. Go to Cognito User Pool -> Triggers
5. Set "Custom message" trigger to this Lambda function
6. Grant Lambda permission to be invoked by Cognito
"""

import json


def lambda_handler(event, context):
    """
    Custom Message Lambda trigger for Cognito
    
    This function is called by Cognito before sending verification emails
    and allows us to customize the message with proper variable substitution.
    """
    
    # Get the trigger source
    trigger_source = event['triggerSource']
    
    # Only customize signup verification emails
    if trigger_source == 'CustomMessage_SignUp':
        # Get user attributes
        username = event['request']['userAttributes'].get('email', event['userName'])
        code = event['request']['codeParameter']
        
        # Read the HTML template (you'll need to include this in the Lambda deployment package)
        # Or store it in S3 and fetch it, or inline it here
        html_template = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Subtiter.ai</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 32px;
            font-weight: 700;
        }
        .header .emoji {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .content {
            padding: 40px 30px;
            color: #333333;
            line-height: 1.6;
        }
        .content h2 {
            color: #667eea;
            font-size: 24px;
            margin-top: 0;
            margin-bottom: 20px;
        }
        .content p {
            margin: 15px 0;
            font-size: 16px;
        }
        .code-box {
            background-color: #f8f9fa;
            border: 2px dashed #667eea;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        .code-box p {
            margin: 5px 0;
            font-size: 14px;
            color: #666666;
        }
        .verification-code {
            font-size: 32px;
            font-weight: 700;
            color: #667eea;
            letter-spacing: 4px;
            font-family: 'Courier New', monospace;
        }
        .verification-link {
            word-break: break-all;
            font-size: 13px;
            color: #667eea;
            background: white;
            padding: 12px;
            border-radius: 4px;
            border: 1px solid #e9ecef;
        }
        .info-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="emoji">🎬</div>
            <h1>Welcome to Subtiter.ai</h1>
        </div>
        <div class="content">
            <h2>Thank you for joining!</h2>
            <p>You're just one step away from accessing your AI-powered video clipping assistant.</p>
            
            <div class="code-box">
                <p style="font-weight: 600; margin-bottom: 15px;">Your Verification Code:</p>
                <div class="verification-code">{CODE}</div>
                <p style="font-size: 14px; color: #666666; margin-top: 15px;">
                    Please use this code to verify your email address.
                </p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="font-weight: 600; margin-top: 0;">Or click this link to verify:</p>
                <p class="verification-link">
                    https://subtiter.ai/api/v1/auth/confirm-signup/{EMAIL}/{CODE}
                </p>
                <p style="font-size: 12px; color: #666666; margin-bottom: 0;">
                    Copy and paste this link into your browser.
                </p>
            </div>
            
            <div class="info-box">
                <p><strong>⏰ Important:</strong> This verification code will expire in 24 hours.</p>
            </div>
        </div>
        <div class="footer">
            <p><strong>Best regards,</strong><br>The Subtiter.ai Team</p>
            <p style="margin-top: 20px; font-size: 12px; color: #999999;">
                © 2025 Subtiter.ai - AI-Powered Video Clipping<br>
                <a href="https://subtiter.ai">subtiter.ai</a>
            </p>
        </div>
    </div>
</body>
</html>"""
        
        # Substitute the variables
        html_content = html_template.replace('{CODE}', code).replace('{EMAIL}', username)
        
        # Set the custom message
        event['response']['emailSubject'] = 'Welcome to Subtiter.ai - Verify Your Email 🎬'
        event['response']['emailMessage'] = html_content
    
    return event


# For testing locally
if __name__ == '__main__':
    # Test event
    test_event = {
        'version': '1',
        'triggerSource': 'CustomMessage_SignUp',
        'region': 'eu-west-1',
        'userPoolId': 'eu-west-1_zm3OfnfeQ',
        'userName': 'test@example.com',
        'request': {
            'userAttributes': {
                'email': 'test@example.com',
                'name': 'Test User'
            },
            'codeParameter': '123456'
        },
        'response': {}
    }
    
    result = lambda_handler(test_event, None)
    print("Email Subject:", result['response']['emailSubject'])
    print("\nEmail contains correct substitution:")
    print("  - Email:", 'test@example.com' in result['response']['emailMessage'])
    print("  - Code:", '123456' in result['response']['emailMessage'])

