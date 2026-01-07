#!/usr/bin/env -S uv run
# flake8: noqa: E501
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "boto3",
#     "python-dotenv",
# ]
# ///
"""
List all users in the Cognito User Pool to verify which users exist.
Usage: uv run scripts/list_cognito_users.py
"""

import sys
import os
from dotenv import load_dotenv

# Load environment variables before importing any app modules
load_dotenv()

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.aws_app_stack.cognito_config import aws_cognito_user_pool_id
import boto3

def main():
    # Check if credentials are loaded
    aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
    aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
    aws_region = os.getenv('AWS_REGION')
    
    print(f"AWS Region: {aws_region}")
    print(f"AWS Access Key ID: {aws_access_key[:10]}... (first 10 chars)" if aws_access_key else "AWS Access Key ID: NOT SET")
    print(f"AWS Secret Key: {'*' * 20} (hidden)" if aws_secret_key else "AWS Secret Key: NOT SET")
    print(f"User Pool ID: {aws_cognito_user_pool_id}")
    print("\n" + "="*60 + "\n")
    
    if not aws_access_key or not aws_secret_key:
        print("ERROR: AWS credentials not found in environment!")
        print("Make sure your .env file contains:")
        print("  - AWS_ACCESS_KEY_ID")
        print("  - AWS_SECRET_ACCESS_KEY")
        print("  - AWS_REGION")
        sys.exit(1)
    
    try:
        client = boto3.client(
            'cognito-idp',
            region_name=aws_region,
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key
        )
        
        print("Fetching users from Cognito User Pool...")
        
        response = client.list_users(
            UserPoolId=aws_cognito_user_pool_id,
            Limit=60
        )
        
        users = response.get('Users', [])
        
        if not users:
            print("No users found in the User Pool.")
        else:
            print(f"Found {len(users)} user(s):\n")
            for i, user in enumerate(users, 1):
                username = user.get('Username')
                status = user.get('UserStatus')
                enabled = user.get('Enabled')
                created = user.get('UserCreateDate')
                
                # Get email from attributes
                email = None
                for attr in user.get('Attributes', []):
                    if attr['Name'] == 'email':
                        email = attr['Value']
                        break
                
                print(f"{i}. Username: {username}")
                print(f"   Email: {email}")
                print(f"   Status: {status}")
                print(f"   Enabled: {enabled}")
                print(f"   Created: {created}")
                print()
        
        # Check for pagination
        if 'PaginationToken' in response:
            print("Note: There are more users. This script shows the first 60.")
            
    except Exception as e:
        print(f"✗ Failed to list users: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

