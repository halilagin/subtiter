# flake8: noqa: E501
from fastapi.responses import JSONResponse
from typing import Callable
import jwt
from fastapi import Request, status
import logging
from app.db.database import SessionLocal
from app.dao.user_dao import get_or_create_user

# from app.main import app
from app.config import settings
from app.aws_app_stack.klippers_cognito import klippers_cognito

# Configure logger
logger = logging.getLogger(__name__) 


# Ensure the logger has a handler if none exist
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler) 

public_urls = [
    "/docs",
    "/redoc",
    "/openapi.json",
    "/api/v1/auth/login",
    "/api/v1/auth/login/cognito",
    "/api/v1/auth/login/authprovider",
    "/api/v1/auth/google/authorized-redirect",
    "/api/v1/auth/google/verify-token",
    "/api/v1/auth/facebook/verify-token",
    "/api/v1/auth/google/login",
    "/api/v1/auth/google/callback",
    "/api/v1/auth/register",
    "/api/v1/auth/confirm-signup",
    "/api/v1/auth/update-subscription-id",
    "/api/v1/subscription/create-payment-intent",
    "/api/v1/user-shorts/serve/",
    "/api/v1/user-trimming/serve/",
    "/api/v1/shorts/thumbnail",
    "/api/v1/user-videos/video-thumbnail",
    "/api/v1/chat",
    "/public",

]

async def custom_auth_middleware(request: Request, call_next: Callable):
    """
    Original custom middleware that extracts the user ID from a JWT provided in the Authorization header
    and sets it on request.state for all subsequent endpoint handlers.
    Uses custom JWT tokens signed with SECRET_KEY.
    """

    # Handle CORS preflight requests first - bypass auth for OPTIONS requests
    if request.method == "OPTIONS":
        response = await call_next(request)
        return response

    # Bypass authentication for auth-related endpoints
    in_public_url = any([request.url.path.startswith(url) for url in public_urls])
    if in_public_url:
        request.state.user_id = None
        response = await call_next(request)
        return response

    # Extract the 'Authorization' header if present
    authorization: str = request.headers.get("Authorization")

    if not authorization:
        logger.info("middleware no token provided.")
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "No token provided."},
        )

    # Typically the header is in the format: 'Bearer <token>'
    scheme, _, token = authorization.partition(" ")

    # Do a simple check for Bearer scheme
    if scheme.lower() != "bearer":
        logger.info("middleware invalid authentication scheme.")
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Invalid authentication scheme."},
        )

    try:
        # Decode the JWT using custom SECRET_KEY
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        request.state.user_id = decoded_token.get("user_id")
        request.state.user_email = decoded_token.get("email")
        request.state.subscription_plan = decoded_token.get("subscription_plan") or "no_plan"

        # Use a database session to get or create the user
        try:
            db = SessionLocal()
            get_or_create_user(db, user_id=request.state.user_id, email=request.state.user_email)
        finally:
            db.close()

        logger.info("middleware request.state: %s", request.state)
        # Continue processing the request
        response = await call_next(request)
        return response
    except jwt.ExpiredSignatureError:
        logger.info("middleware token has expired.")
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Token has expired."},
        )
    except jwt.InvalidTokenError:
        logger.info("middleware invalid token.")
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Invalid token provided."},
        )


async def cognito_auth_middleware(request: Request, call_next: Callable):
    """
    Cognito-based authentication middleware that verifies AWS Cognito JWT tokens.
    Uses Cognito's JWKS to validate token signatures.
    """
    logger.debug("cognito_middleware: Processing request - method=%s, path=%s", request.method, request.url.path)

    # Handle CORS preflight requests first - bypass auth for OPTIONS requests
    if request.method == "OPTIONS":
        logger.debug("cognito_middleware: Bypassing auth for OPTIONS request")
        response = await call_next(request)
        return response

    # Bypass authentication for auth-related endpoints
    in_public_url = any([request.url.path.startswith(url) for url in public_urls])
    if in_public_url:
        logger.debug("cognito_middleware: Bypassing auth for public URL: %s", request.url.path)
        request.state.user_id = None
        response = await call_next(request)
        return response

    # Extract the 'Authorization' header if present
    authorization: str = request.headers.get("Authorization")
    logger.debug("cognito_middleware: Authorization header present: %s", bool(authorization))

    if not authorization:
        logger.info("cognito_middleware: no token provided.")
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "No token provided."},
        )

    # Typically the header is in the format: 'Bearer <token>'
    scheme, _, token = authorization.partition(" ")
    logger.debug("cognito_middleware: Auth scheme=%s, token_length=%d", scheme, len(token) if token else 0)

    # Do a simple check for Bearer scheme
    if scheme.lower() != "bearer":
        logger.info("cognito_middleware: invalid authentication scheme.")
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Invalid authentication scheme."},
        )

    try:
        # Try to verify as Cognito JWT token first
        # First try to verify as access token, then as ID token if that fails
        logger.debug("cognito_middleware: Attempting to verify token as Cognito access token")
        decoded_token = klippers_cognito.verify_token(token, token_use="access")

        if not decoded_token:
            # Try as ID token
            logger.debug("cognito_middleware: Access token verification failed, trying as Cognito ID token")
            decoded_token = klippers_cognito.verify_token(token, token_use="id")

        if not decoded_token:
            # If Cognito verification fails, try as custom JWT (for Google sign-in users)
            logger.debug("cognito_middleware: Cognito token verification failed, trying as custom JWT")
            try:
                decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                logger.debug("cognito_middleware: Token verified as custom JWT")
                
                # Extract user information from custom JWT
                request.state.user_id = decoded_token.get("user_id")
                request.state.user_email = decoded_token.get("email")
                request.state.subscription_plan = decoded_token.get("subscription_plan") or "PAY_AS_YOU_GO"
                
                # Use a database session to get or create the user
                try:
                    db = SessionLocal()
                    get_or_create_user(db, user_id=request.state.user_id, email=request.state.user_email)
                finally:
                    db.close()

                logger.info("cognito_middleware: Successfully authenticated user with custom JWT: %s", request.state.user_id)
                logger.info("cognito_middleware request.state: user_id=%s, email=%s", request.state.user_id, request.state.user_email)
                
                # Continue processing the request
                response = await call_next(request)
                return response
                
            except jwt.ExpiredSignatureError:
                logger.info("cognito_middleware: Custom JWT token has expired")
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "Token has expired."},
                )
            except jwt.InvalidTokenError:
                logger.info("cognito_middleware: Failed to verify token as both Cognito and custom JWT")
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "Invalid or expired token."},
                )

        # Successfully verified as Cognito token
        logger.debug("cognito_middleware: Token verified as Cognito token. Claims: %s", decoded_token.keys())

        # Extract user information from Cognito token claims
        # Access tokens have 'sub' (user UUID) and 'username'
        # ID tokens have 'sub', 'cognito:username', 'email', etc.
        request.state.user_id = decoded_token.get("custom:user_id") 
        request.state.user_email = decoded_token.get("email")
        request.state.cognito_username = decoded_token.get("cognito:username") or decoded_token.get("username")
        request.state.subscription_plan = decoded_token.get("custom:subscription_plan") or "PAY_AS_YOU_GO"

        # Use a database session to get or create the user
        try:
            db = SessionLocal()
            get_or_create_user(db, user_id=request.state.user_id, email=request.state.user_email)
        finally:
            db.close()

        logger.debug("cognito_middleware: Extracted Cognito claims - sub=%s, email=%s, cognito_username=%s, subscription_plan=%s",
                     decoded_token.get("sub"), decoded_token.get("email"), 
                     decoded_token.get("cognito:username") or decoded_token.get("username"),
                     decoded_token.get("custom:subscription_plan"))

        logger.info("cognito_middleware: Successfully authenticated user with Cognito: %s", request.state.user_id)
        logger.info("cognito_middleware request.state: user_id=%s, email=%s", request.state.user_id, request.state.user_email)

        # Continue processing the request
        logger.debug("cognito_middleware: Proceeding to next handler")
        response = await call_next(request)
        logger.debug("cognito_middleware: Response status=%s", response.status_code)
        return response

    except Exception as e:
        logger.error(f"cognito_middleware: Unexpected error during token verification: {e}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Authentication failed."},
        )


# Default auth middleware - currently using Cognito
auth_middleware = cognito_auth_middleware

