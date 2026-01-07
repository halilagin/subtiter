# flake8: noqa: E501

import boto3
import hmac, base64, hashlib
import json
from . import cognito_config
import traceback
import requests
from jose import jwk, jwt
from jose.utils import base64url_decode
from typing import Dict, Optional
import logging
from app.config import settings
import os

logger = logging.getLogger(__name__)

# Initialize boto3 client with explicit credentials from environment
# This ensures credentials are loaded properly even when called from scripts
boto3_cognito_client = boto3.client(
    'cognito-idp',
    region_name=cognito_config.region,
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

def get_access_token(user_pool_id, client_id, username, password):
    

    try:
        response = boto3_cognito_client.initiate_auth(
            ClientMetadata={
                "UserPoolId":user_pool_id,
                },
            ClientId=client_id,
            #AuthFlow='ADMIN_NO_SRP_AUTH',
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={
                'USERNAME': username,
                'PASSWORD': password,
            }
        )
        return response['AuthenticationResult']
    except boto3_cognito_client.exceptions.UserNotConfirmedException:
        logger.error(f"User {username} is not confirmed")
        raise Exception("USER_NOT_CONFIRMED")
    except boto3_cognito_client.exceptions.NotAuthorizedException:
        logger.error(f"Invalid credentials for user {username}")
        raise Exception("INVALID_CREDENTIALS")
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        traceback.print_exc()
        raise


class CognitoTokenVerifier:
    """
    Verifies AWS Cognito JWT tokens using JWKS (JSON Web Key Set)
    """
    def __init__(self, user_pool_id: str, client_id: str, region: str):
        self.user_pool_id = user_pool_id
        self.client_id = client_id
        self.region = region
        self.issuer = f"https://cognito-idp.{region}.amazonaws.com/{user_pool_id}"
        self.jwks_url = f"{self.issuer}/.well-known/jwks.json"
        self._jwks = None
        
    def _get_jwks(self) -> Dict:
        """Fetch JWKS from Cognito (cached)"""
        if self._jwks is None:
            try:
                response = requests.get(self.jwks_url, timeout=5)
                response.raise_for_status()
                self._jwks = response.json()
            except Exception as e:
                logger.error(f"Failed to fetch JWKS: {e}")
                raise
        return self._jwks
    
    def _get_public_key(self, token: str) -> Optional[str]:
        """Extract the public key for the token from JWKS"""
        try:
            # Decode header without verification to get the key ID
            headers = jwt.get_unverified_headers(token)
            kid = headers.get('kid')
            
            # Also decode claims to check issuer for debugging
            try:
                unverified_claims = jwt.get_unverified_claims(token)
                token_issuer = unverified_claims.get('iss', 'unknown')
                logger.debug(f"Token issuer: {token_issuer}, Expected issuer: {self.issuer}")
                
                if token_issuer != self.issuer:
                    logger.error(f"Token issuer mismatch! Token is from '{token_issuer}' but expected '{self.issuer}'. This might be a Google token instead of a Cognito token.")
            except Exception as decode_err:
                logger.debug(f"Could not decode token claims for debugging: {decode_err}")
            
            if not kid:
                logger.error("Token missing 'kid' in header")
                return None
            
            logger.debug(f"Looking for kid '{kid}' in Cognito JWKS endpoint: {self.jwks_url}")
            
            # Get JWKS and find the matching key
            jwks = self._get_jwks()
            available_kids = [key.get('kid') for key in jwks.get('keys', [])]
            logger.debug(f"Available kids in Cognito JWKS: {available_kids}")
            
            for key in jwks.get('keys', []):
                if key.get('kid') == kid:
                    return key
            
            logger.error(f"Public key not found for kid: {kid}")
            logger.error(f"This token's kid is not in Cognito's JWKS. Available Cognito kids: {available_kids}")
            return None
        except Exception as e:
            logger.error(f"Error getting public key: {e}")
            return None
    
    def verify_token(self, token: str, token_use: str = "access") -> Optional[Dict]:
        """
        Verify a Cognito JWT token
        
        Args:
            token: The JWT token to verify
            token_use: Expected token use ("access" or "id")
            
        Returns:
            Decoded token claims if valid, None otherwise
        """
        try:
            # Get the public key for this token
            public_key = self._get_public_key(token)
            if not public_key:
                logger.error("Could not retrieve public key for token")
                return None
            
            # Verify the token
            claims = jwt.decode(
                token,
                public_key,
                algorithms=['RS256'],
                audience=self.client_id if token_use == "id" else None,
                issuer=self.issuer,
                options={
                    'verify_signature': True,
                    'verify_aud': token_use == "id",  # Only verify audience for ID tokens
                    'verify_iss': True,
                    'verify_exp': True,
                }
            )
            
            # Verify token_use claim
            if claims.get('token_use') != token_use:
                logger.error(f"Token use mismatch. Expected: {token_use}, Got: {claims.get('token_use')}")
                return None
            
            return claims
            
        except jwt.ExpiredSignatureError:
            logger.error("Token has expired")
            return None
        except jwt.JWTClaimsError as e:
            logger.error(f"Token claims validation failed: {e}")
            return None
        except Exception as e:
            logger.error(f"Token verification failed: {e}")
            traceback.print_exc()
            return None


class SubtiterCognito:
    def __init__(self, user_pool_id, client_id, region):
        self.user_pool_id = user_pool_id
        self.client_id = client_id
        self.region = region
        self.token_verifier = CognitoTokenVerifier(user_pool_id, client_id, region)

    def get_access_token(self, username, password):
        print(f"Getting access token for {username} and password {password}")
        try:
            return get_access_token(self.user_pool_id, self.client_id, username, password)
        except Exception as e:
            # Re-raise with the error message for the endpoint to handle
            raise
    
    def verify_token(self, token: str, token_use: str = "access") -> Optional[Dict]:
        """Verify a Cognito JWT token"""
        return self.token_verifier.verify_token(token, token_use)
    
    def register_user(self, email: str, password: str, name: str, subscription_plan: str, user_id: str) -> Dict:
        """
        Register a new user in Cognito User Pool without sending verification email.
        Uses admin_create_user with MessageAction='SUPPRESS' to prevent automatic emails.
        
        Args:
            email: User's email address (will be used as username)
            password: User's password
            name: User's full name
            subscription_plan: User's subscription plan
            
        Returns:
            Dict containing user_sub (Cognito user ID) and other registration details
            
        Raises:
            Exception: If registration fails
        """
        try:
            # Use admin_create_user to create user without sending verification email
            response = boto3_cognito_client.admin_create_user(
                UserPoolId=self.user_pool_id,
                Username=email,
                UserAttributes=[
                    {'Name': 'email', 'Value': email},
                    {'Name': 'email_verified', 'Value': 'true'},  # Mark email as verified
                    {'Name': 'name', 'Value': name},
                    {'Name': 'custom:subscription_plan', 'Value': subscription_plan},
                    {'Name': 'custom:user_id', 'Value': str(user_id)},
                ],
                MessageAction='SUPPRESS',  # Don't send any email
                TemporaryPassword=password
            )
            
            # Set the permanent password
            boto3_cognito_client.admin_set_user_password(
                UserPoolId=self.user_pool_id,
                Username=email,
                Password=password,
                Permanent=True
            )
            
            logger.info(f"User registered successfully in Cognito without verification email: {email}")
            
            # Extract user_sub from the response
            user_sub = None
            for attr in response['User']['Attributes']:
                if attr['Name'] == 'sub':
                    user_sub = attr['Value']
                    break
            
            return {
                'user_sub': user_sub,
                'user_confirmed': True,
                'code_delivery_details': None
            }
            
        except boto3_cognito_client.exceptions.UsernameExistsException:
            logger.error(f"User already exists in Cognito: {email}")
            raise Exception("Email already registered in Cognito")
        except boto3_cognito_client.exceptions.InvalidPasswordException as e:
            logger.error(f"Invalid password for user {email}: {e}")
            raise Exception("Password does not meet requirements")
        except Exception as e:
            logger.error(f"Failed to register user in Cognito: {e}")
            traceback.print_exc()
            raise Exception(f"Cognito registration failed: {str(e)}")
    
    def send_verification_email(self, email: str) -> Dict:
        """
        Send verification email using Cognito's resend_confirmation_code API.
        This allows us to control when the email is sent and use Cognito's email service
        with proper variable substitution.
        
        Args:
            email: User's email address (username in Cognito)
            
        Returns:
            Dict containing code delivery details
            
        Raises:
            Exception: If sending fails
        """
        try:
            response = boto3_cognito_client.resend_confirmation_code(
                ClientId=self.client_id,
                Username=email
            )
            
            logger.info(f"Verification email sent via Cognito to: {email}")
            
            return {
                'destination': response['CodeDeliveryDetails'].get('Destination'),
                'delivery_medium': response['CodeDeliveryDetails'].get('DeliveryMedium'),
                'attribute_name': response['CodeDeliveryDetails'].get('AttributeName')
            }
            
        except Exception as e:
            logger.error(f"Failed to send verification email via Cognito: {e}")
            traceback.print_exc()
            raise Exception(f"Failed to send verification email: {str(e)}")
    
    def confirm_user_signup(self, email: str, confirmation_code: str) -> bool:
        """
        Confirm user signup with the code sent to their email
        
        Args:
            email: User's email address
            confirmation_code: Confirmation code from email
            
        Returns:
            True if confirmation successful
        """
        try:
            boto3_cognito_client.confirm_sign_up(
                ClientId=self.client_id,
                Username=email,
                ConfirmationCode=confirmation_code
            )
            logger.info(f"User confirmed successfully: {email}")
            return True
        except Exception as e:
            logger.error(f"Failed to confirm user: {e}")
            traceback.print_exc()
            raise Exception(f"Confirmation failed: {str(e)}")
    
    def admin_confirm_user(self, email: str) -> bool:
        """
        Admin confirm a user (bypass email verification)
        
        Args:
            email: User's email address
            
        Returns:
            True if confirmation successful
        """
        try:
            boto3_cognito_client.admin_confirm_sign_up(
                UserPoolId=self.user_pool_id,
                Username=email
            )
            logger.info(f"User admin confirmed successfully: {email}")
            return True
        except Exception as e:
            logger.error(f"Failed to admin confirm user: {e}")
            traceback.print_exc()
            raise Exception(f"Admin confirmation failed: {str(e)}")

    def admin_delete_user(self, email: str) -> bool:
        """
        Admin delete a user from the Cognito User Pool
        
        Args:
            email: User's email address (username in Cognito)
            
        Returns:
            True if deletion successful
        """
        try:
            boto3_cognito_client.admin_delete_user(
                UserPoolId=self.user_pool_id,
                Username=email
            )
            logger.info(f"User deleted successfully: {email}")
            return True
        except boto3_cognito_client.exceptions.UserNotFoundException:
            logger.error(f"User not found: {email}")
            raise Exception(f"User not found: {email}")
        except Exception as e:
            logger.error(f"Failed to delete user: {e}")
            traceback.print_exc()
            raise Exception(f"User deletion failed: {str(e)}")


subtiter_cognito = SubtiterCognito(
    cognito_config.aws_cognito_user_pool_id,
    cognito_config.aws_cognito_user_pool_client_id,
    cognito_config.region
)