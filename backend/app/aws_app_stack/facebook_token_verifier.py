# flake8: noqa: E501
import requests
from typing import Dict, Optional
import logging
import traceback
import hmac
import hashlib

logger = logging.getLogger(__name__)


class FacebookTokenVerifier:
    """
    Verifies Facebook OAuth tokens using Facebook Graph API
    """
    def __init__(self, facebook_app_id: str, facebook_app_secret: str):
        self.facebook_app_id = facebook_app_id
        self.facebook_app_secret = facebook_app_secret
        self.debug_token_url = "https://graph.facebook.com/debug_token"
        self.graph_api_url = "https://graph.facebook.com/v18.0"
        
    def _get_app_access_token(self) -> str:
        """Generate app access token"""
        return f"{self.facebook_app_id}|{self.facebook_app_secret}"
    
    def verify_token(self, token: str) -> Optional[Dict]:
        """
        Verify a Facebook access token
        
        Returns:
            User data if token is valid, None otherwise
        """
        try:
            logger.debug("FacebookTokenVerifier: Starting token verification")
            logger.debug("FacebookTokenVerifier: Token length=%d", len(token))
            
            app_access_token = self._get_app_access_token()
            
            # Step 1: Verify token with Facebook's debug_token endpoint
            logger.debug("FacebookTokenVerifier: Calling debug_token endpoint")
            params = {
                'input_token': token,
                'access_token': app_access_token
            }
            
            response = requests.get(self.debug_token_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            logger.debug("FacebookTokenVerifier: debug_token response: %s", data)
            
            if 'data' not in data:
                logger.error("FacebookTokenVerifier: Invalid response format from Facebook")
                return None
            
            token_data = data['data']
            
            # Check if token is valid
            if not token_data.get('is_valid'):
                logger.error("FacebookTokenVerifier: Token is not valid according to Facebook")
                return None
            
            # Verify app_id matches
            if token_data.get('app_id') != self.facebook_app_id:
                logger.error("FacebookTokenVerifier: Token app_id mismatch. Expected=%s, Got=%s",
                           self.facebook_app_id, token_data.get('app_id'))
                return None
            
            # Check token expiration
            expires_at = token_data.get('expires_at', 0)
            if expires_at > 0:  # 0 means never expires
                import time
                current_time = time.time()
                if current_time >= expires_at:
                    logger.error("FacebookTokenVerifier: Token has expired")
                    return None
            
            user_id = token_data.get('user_id')
            if not user_id:
                logger.error("FacebookTokenVerifier: No user_id in token data")
                return None
            
            logger.debug("FacebookTokenVerifier: Token is valid for user_id=%s", user_id)
            
            # Step 2: Get user information from Graph API
            logger.debug("FacebookTokenVerifier: Fetching user profile data")
            user_url = f"{self.graph_api_url}/me"

            # Calculate appsecret_proof for server-side API calls
            appsecret_proof = hmac.new(
                self.facebook_app_secret.encode('utf-8'),
                token.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()

            user_params = {
                'fields': 'id,email,name,first_name,last_name,picture',
                'access_token': token,
                'appsecret_proof': appsecret_proof
            }
            
            user_response = requests.get(user_url, params=user_params, timeout=10)
            user_response.raise_for_status()
            user_data = user_response.json()
            
            logger.debug("FacebookTokenVerifier: User data retrieved: id=%s, email=%s, name=%s",
                        user_data.get('id'), user_data.get('email'), user_data.get('name'))
            
            if user_data.get('id') != user_id:
                logger.error("FacebookTokenVerifier: User ID mismatch between token and profile")
                return None
            
            # Return combined data
            result = {
                'sub': user_id,  # Subject (user ID) - compatible with JWT format
                'email': user_data.get('email'),
                'name': user_data.get('name'),
                'given_name': user_data.get('first_name'),
                'family_name': user_data.get('last_name'),
                'picture': user_data.get('picture', {}).get('data', {}).get('url') if isinstance(user_data.get('picture'), dict) else None,
                'facebook_id': user_id,
                'app_id': token_data.get('app_id'),
                'scopes': token_data.get('scopes', []),
            }
            
            logger.debug("FacebookTokenVerifier: Token verification successful")
            return result
            
        except requests.RequestException as e:
            logger.error(f"FacebookTokenVerifier: Network error during token verification: {e}", exc_info=True)
            return None
        except Exception as e:
            logger.error(f"FacebookTokenVerifier: Token verification failed: {e}", exc_info=True)
            traceback.print_exc()
            return None

