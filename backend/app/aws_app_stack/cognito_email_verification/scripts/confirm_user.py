#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "boto3",
#     "python-dotenv",
# ]
# ///
"""
Quick script to admin-confirm a Cognito user for testing purposes.
Usage: uv run scripts/confirm_user.py <email>
"""

import sys
import os
from dotenv import load_dotenv

# Load environment variables before importing any app modules
load_dotenv()

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.aws_app_stack.cognito import subtiter_cognito  # noqa: E402

def main():
    if len(sys.argv) < 2:
        print("Usage: uv run scripts/confirm_user.py <email>")
        print("Example: uv run scripts/confirm_user.py halil.agin+cognito009@gmail.com")
        sys.exit(1)

    email = sys.argv[1]

    try:
        print(f"Confirming user: {email}")
        subtiter_cognito.admin_confirm_user(email)
        print(f"✓ User {email} confirmed successfully!")
        print("You can now login with this account.")
    except Exception as e:
        print(f"✗ Failed to confirm user: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
