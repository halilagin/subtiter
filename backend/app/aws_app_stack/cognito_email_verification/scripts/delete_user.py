#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "boto3",
#     "python-dotenv",
# ]
# ///
"""
Quick script to admin-delete a Cognito user.
Usage: uv run scripts/delete_user.py <email>
"""

import sys
import os
from dotenv import load_dotenv

# Load environment variables before importing any app modules
load_dotenv()

# Add backend root directory to path to import app modules
# Script is at: backend/app/aws_app_stack/cognito_email_verification/scripts/delete_user.py
# Need to go up 5 levels to reach backend/
backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
sys.path.insert(0, backend_root)

from app.aws_app_stack.klippers_cognito import klippers_cognito  # noqa: E402

def main():
    if len(sys.argv) < 2:
        print("Usage: uv run scripts/delete_user.py <email>")
        print("Example: uv run scripts/delete_user.py halil.agin+cognito009@gmail.com")
        sys.exit(1)

    email = sys.argv[1]

    try:
        print(f"Deleting user: {email}")
        klippers_cognito.admin_delete_user(email)
        print(f"✓ User {email} deleted successfully!")
    except Exception as e:
        print(f"✗ Failed to delete user: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
