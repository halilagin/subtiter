# flake8: noqa: E501
import requests
from jose import jwt
from typing import Dict, Optional
import logging
import traceback
from app.config import settings

logger = logging.getLogger(__name__)


class GoogleTokenVerifier:
    """
    Verifies Google OAuth tokens (both ID tokens and access tokens)
    """
    def __init__(self, google_client_id: str):
        self.google_client_id = google_client_id
        self.google_jwks_url = "https://www.googleapis.com/oauth2/v3/certs"
        self.google_userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
        self._jwks = None
        
    def _get_jwks(self) -> Dict:
        """Fetch Google's JWKS (cached)"""
        if self._jwks is None:
            try:
                logger.debug("GoogleTokenVerifier: Fetching Google JWKS from %s", self.google_jwks_url)
                response = requests.get(self.google_jwks_url, timeout=5)
                response.raise_for_status()
                self._jwks = response.json()
                logger.debug("GoogleTokenVerifier: Successfully fetched Google JWKS, contains %d keys", len(self._jwks.get('keys', [])))
            except Exception as e:
                logger.error(f"GoogleTokenVerifier: Failed to fetch Google JWKS: {e}", exc_info=True)
                raise
        else:
            logger.debug("GoogleTokenVerifier: Using cached Google JWKS")
        return self._jwks
    
    def _get_public_key(self, token: str) -> Optional[str]:
        """Extract the public key for the token from Google's JWKS"""
        try:
            logger.debug("GoogleTokenVerifier: Extracting public key from JWKS")
            headers = jwt.get_unverified_headers(token)
            kid = headers.get('kid')
            
            logger.debug("GoogleTokenVerifier: Token kid=%s", kid)
            
            if not kid:
                logger.error("GoogleTokenVerifier: Token missing 'kid' in header")
                return None
            
            logger.debug("GoogleTokenVerifier: Fetching Google JWKS from %s", self.google_jwks_url)
            jwks = self._get_jwks()
            available_kids = [key.get('kid') for key in jwks.get('keys', [])]
            logger.debug("GoogleTokenVerifier: Available kids in Google JWKS: %s", available_kids)
            
            for key in jwks.get('keys', []):
                if key.get('kid') == kid:
                    logger.debug("GoogleTokenVerifier: Found matching public key for kid=%s", kid)
                    return key
            
            logger.error(f"GoogleTokenVerifier: Public key not found for kid: {kid}")
            logger.error(f"GoogleTokenVerifier: Available Google JWKS kids: {available_kids}")
            return None
        except Exception as e:
            logger.error(f"GoogleTokenVerifier: Error getting Google public key: {e}", exc_info=True)
            return None
    
    def verify_access_token(self, access_token: str) -> Optional[Dict]:
        """
        Verify a Google access token by calling Google's UserInfo API
        
        Args:
            access_token: The access token from Google OAuth
            
        Returns:
            User info dictionary if valid, None otherwise
        """
        try:
            logger.debug("GoogleTokenVerifier: Starting access token verification")
            logger.debug("GoogleTokenVerifier: Access token length=%d", len(access_token))
            
            # Call Google's UserInfo API with the access token
            headers = {
                'Authorization': f'Bearer {access_token}'
            }
            
            logger.debug("GoogleTokenVerifier: Calling Google UserInfo API at %s", self.google_userinfo_url)
            response = requests.get(self.google_userinfo_url, headers=headers, timeout=10)
            
            if response.status_code != 200:
                logger.error("GoogleTokenVerifier: UserInfo API returned status %d: %s", 
                           response.status_code, response.text)
                return None
            
            user_info = response.json()
            logger.debug("GoogleTokenVerifier: UserInfo API response keys: %s", list(user_info.keys()))
            logger.debug("GoogleTokenVerifier: Subject=%s, Email=%s, Email_verified=%s, Name=%s",
                        user_info.get('sub'), user_info.get('email'), 
                        user_info.get('email_verified'), user_info.get('name'))
            
            # Verify email is verified
            if not user_info.get('email_verified'):
                logger.error("GoogleTokenVerifier: Google account email not verified")
                return None
            
            logger.debug("GoogleTokenVerifier: Access token validation successful")
            return user_info
            
        except requests.RequestException as e:
            logger.error(f"GoogleTokenVerifier: Request to UserInfo API failed: {e}", exc_info=True)
            return None
        except Exception as e:
            logger.error(f"GoogleTokenVerifier: Access token verification failed: {e}", exc_info=True)
            traceback.print_exc()
            return None
    
    def verify_token(self, token: str) -> Optional[Dict]:
        """
        Verify a Google ID token (JWT)
        
        Returns:
            Decoded token claims if valid, None otherwise
        """
        try:
            logger.debug("GoogleTokenVerifier: Starting ID token verification")
            logger.debug("GoogleTokenVerifier: Token length=%d", len(token))
            logger.debug("GoogleTokenVerifier: Expected audience (client_id)=%s", self.google_client_id[:20] + "..." if len(self.google_client_id) > 20 else self.google_client_id)

            # Decode header for debugging
            try:
                headers = jwt.get_unverified_headers(token)
                logger.debug("GoogleTokenVerifier: Token headers: alg=%s, kid=%s", headers.get('alg'), headers.get('kid'))
            except Exception as decode_err:
                logger.debug("GoogleTokenVerifier: Could not decode token headers: %s", decode_err)

            public_key = self._get_public_key(token)
            if not public_key:
                logger.error("GoogleTokenVerifier: Could not retrieve Google public key for token")
                return None
            
            logger.debug("GoogleTokenVerifier: Public key retrieved successfully")
            logger.debug("GoogleTokenVerifier: Decoding and verifying JWT...")

            claims = jwt.decode(
                token,
                public_key,
                algorithms=['RS256'],
                audience=self.google_client_id,
                issuer='https://accounts.google.com',
                options={
                    'verify_signature': True,
                    'verify_aud': True,
                    'verify_iss': True,
                    'verify_exp': True,
                }
            )
            
            logger.debug("GoogleTokenVerifier: Token decoded successfully")
            logger.debug("GoogleTokenVerifier: Claims keys: %s", list(claims.keys()))
            logger.debug("GoogleTokenVerifier: Issuer=%s, Audience=%s, Subject=%s, Email=%s, Email_verified=%s",
                        claims.get('iss'), claims.get('aud'), claims.get('sub'), 
                        claims.get('email'), claims.get('email_verified'))

            # Verify email is verified
            if not claims.get('email_verified'):
                logger.error("GoogleTokenVerifier: Google account email not verified")
                return None
            
            logger.debug("GoogleTokenVerifier: Email verified, token validation successful")
            return claims
            
        except jwt.ExpiredSignatureError:
            logger.error("GoogleTokenVerifier: Google token has expired")
            return None
        except jwt.JWTClaimsError as e:
            logger.error(f"GoogleTokenVerifier: Token claims validation failed: {e}")
            return None
        except Exception as e:
            logger.error(f"GoogleTokenVerifier: Token verification failed: {e}", exc_info=True)
            traceback.print_exc()
            return None

