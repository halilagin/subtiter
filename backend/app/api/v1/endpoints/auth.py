from datetime import datetime, timedelta
from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
import urllib.parse
import requests


from app.core.security import verify_password, create_access_token
from app.db.database import get_db
from app.db.model_document import Level0SubscriptionPlanInstance, Level1SubscriptionPlanInstanceMonthly, Level2SubscriptionPlanInstanceMonthly, Level3SubscriptionPlanInstanceMonthly, User
from app.schemas.schema_user import Token, User as UserSchema
from app.core.auth import get_current_active_user
from app.config import settings
from app.schemas import schema_user
from app.aws_app_stack.klippers_cognito import klippers_cognito
from app.aws_app_stack.google_token_verifier import GoogleTokenVerifier
from app.aws_app_stack.facebook_token_verifier import FacebookTokenVerifier
from app.aws_app_stack import cognito_config



import stripe
import os
import logging
import traceback

logger = logging.getLogger(__name__)


class FacebookTokenRequest(BaseModel):
    accessToken: str
    


stripe.api_key = os.getenv('STRIPE_SECRET_KEY')


router = APIRouter(prefix="/auth")

@router.post("/login", response_model=Token)
async def login_custom(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Custom JWT authentication - uses local database and custom JWT tokens.
    This is the default /login endpoint for backward compatibility.
    """
    print("LOGIN: Starting custom login process...")
    print(f"LOGIN: Form data username: {form_data.username}")

    user = db.query(User).filter(User.email == form_data.username).filter(User.is_active == True).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id, "subscription_plan": user.subscription_plan, "email": user.email},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login/authprovider", response_model=Token)
async def login_cognito(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Cognito authentication - uses AWS Cognito and returns Cognito JWT tokens.
    Use this endpoint when using cognito_auth_middleware.
    """
    print("LOGIN: Starting Cognito login process...")
    print(f"LOGIN: Form data username: {form_data.username}")

    try:
        # Authenticate with AWS Cognito
        auth_result = klippers_cognito.get_access_token(
            username=form_data.username,
            password=form_data.password
        )

        if not auth_result:
            print("LOGIN: Cognito authentication failed")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        print("LOGIN: Cognito authentication successful")

        # Return Cognito tokens
        # You can return either the AccessToken or IdToken depending on your needs
        # IdToken contains user attributes like email, AccessToken is for API authorization
        return {
            "access_token": auth_result.get('IdToken'),  # Using IdToken as it contains user info
            "token_type": "bearer",
            "refresh_token": auth_result.get('RefreshToken'),  # Optional: include refresh token
        }
    except Exception as e:
        error_msg = str(e)
        print(f"LOGIN: Cognito authentication error: {error_msg}")

        if "USER_NOT_CONFIRMED" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is not confirmed. Please check your email for the confirmation code and confirm your account.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        elif "INVALID_CREDENTIALS" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed",
                headers={"WWW-Authenticate": "Bearer"},
            )

@router.post("/register", response_model=schema_user.User)
async def register(
    user_data: schema_user.UserRegister,
    db: Session = Depends(get_db)
):
    """
    Register a new user in both AWS Cognito User Pool and local database.
    The user will receive a verification code via email if email verification is enabled in Cognito.
    """
    try:
        # Check if user already exists in local database
        db_user = db.query(User).filter(User.email == user_data.email.strip()).first()
        if db_user:
            raise HTTPException(status_code=422, detail="Email already registered")

        # Create user in local database (without committing yet)
        db_user = User(
            name=user_data.name,
            email=user_data.email.strip(),
            subscription_plan="no_plan",
            subscription_id="no_plan",
            subscription_config_json=Level0SubscriptionPlanInstance.model_dump(),
            is_active=True,  # Will be activated after email confirmation
            hashed_password=None  # Password is managed by Cognito
        )
        db.add(db_user)
        db.flush()  # This assigns an ID to db_user

        # Register user in AWS Cognito
        cognito_response = klippers_cognito.register_user(
            email=user_data.email.strip(),
            password=user_data.password,
            name=user_data.name,
            subscription_plan="no_plan",
            user_id=db_user.id
        )

        # Set the username from the Cognito user_sub
        if cognito_response and cognito_response.get('user_sub'):
            db_user.username = cognito_response['user_sub']

        # Automatically confirm the user (bypass email verification)
        # klippers_cognito.admin_confirm_user(user_data.email.strip())
        # If Cognito registration is successful, commit to the database
        db.commit()

        db_user.hashed_password = None
        schmea_user_instance = schema_user.User.model_validate(db_user)
        return schmea_user_instance

    except HTTPException:
        db.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"User registration failed")
    except Exception as e:
        db.rollback()
        traceback.print_exc()
        error_msg = str(e)
        if "already registered" in error_msg.lower():
            raise HTTPException(status_code=522, detail="Email already registered in Cognito")
        else:
            raise HTTPException(status_code=501, detail=f"User registration failed")




@router.post("/register-and-confirm", response_model=schema_user.User)
async def register_and_confirm(
    user_data: schema_user.UserRegisterAndConfirm,
    db: Session = Depends(get_db)
):
    """
    Register a new user and optionally confirm immediately if confirmation code is provided.

    This endpoint supports two workflows:
    1. Register only: Provide email, name, password (user receives verification email)
    2. Register + Confirm: Provide email, name, password, confirmation_code (immediate confirmation)

    Use case: When you want to register and confirm in a single API call.
    """
    try:
        # Check if user already exists in local database
        db_user = db.query(User).filter(User.email == user_data.email.strip()).first()
        if db_user:
            raise HTTPException(status_code=422, detail="Email already registered")

        # Register user in AWS Cognito
        try:
            cognito_result = klippers_cognito.register_user(
                email=user_data.email.strip(),
                password=user_data.password,
                name=user_data.name,
                subscription_plan="no_plan"
            )
        except Exception as cognito_error:
            error_msg = str(cognito_error)
            if "already registered" in error_msg.lower():
                raise HTTPException(status_code=422, detail="Email already registered in Cognito")
            elif "password" in error_msg.lower():
                raise HTTPException(status_code=422, detail=error_msg)
            else:
                raise HTTPException(status_code=500, detail=f"Cognito registration failed: {error_msg}")

        # If confirmation code is provided, confirm the user immediately
        if user_data.confirmation_code:
            try:
                klippers_cognito.confirm_user_signup(
                    email=user_data.email.strip(),
                    confirmation_code=user_data.confirmation_code
                )
            except Exception as confirm_error:
                # If confirmation fails, we should clean up the Cognito user
                # But for now, just raise the error
                error_msg = str(confirm_error)
                if "code mismatch" in error_msg.lower() or "expired" in error_msg.lower():
                    raise HTTPException(
                        status_code=400,
                        detail="Invalid or expired confirmation code. User registered but not confirmed."
                    )
                raise HTTPException(
                    status_code=500,
                    detail=f"User registered but confirmation failed: {error_msg}"
                )

        # Create user in local database
        db_user = User(
            username=cognito_result['user_sub'],
            name=user_data.name,
            email=user_data.email.strip(),
            subscription_plan="no_plan",
            subscription_id="no_plan",
            subscription_config_json=Level0SubscriptionPlanInstance.model_dump(),
            is_active=True,
            hashed_password=None
        )
        db.add(db_user)
        db.flush()
        db.commit()

        db_user.hashed_password = None
        schema_user_instance = schema_user.User.model_validate(db_user)
        return schema_user_instance

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/confirm-signup", response_model=schema_user.MessageResponse)
async def confirm_signup(
    confirm_data: schema_user.UserConfirmSignup,
):
    """
    Confirm user signup with the verification code sent to their email.
    This is required when email verification is enabled in Cognito.
    """
    try:
        klippers_cognito.confirm_user_signup(
            email=confirm_data.email.strip(),
            confirmation_code=confirm_data.confirmation_code
        )
        return {"message": "User confirmed successfully. You can now login."}
    except Exception as e:
        error_msg = str(e)
        if "code mismatch" in error_msg.lower() or "expired" in error_msg.lower():
            raise HTTPException(status_code=400, detail="Invalid or expired confirmation code")
        raise HTTPException(status_code=500, detail=error_msg)


@router.get("/confirm-signup/{email}/{confirmation_code}", response_class=HTMLResponse)
async def confirm_signup_link(
    email: str,
    confirmation_code: str
):
    """
    Confirm user signup via email link.
    This endpoint is called when user clicks the confirmation link in their email.
    """
    try:
        # Perform the actual confirmation with Cognito
        klippers_cognito.confirm_user_signup(
            email=email.strip(),
            confirmation_code=confirmation_code
        )
        
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Email Confirmed - Klippers.ai</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                .container {
                    background: white;
                    padding: 3rem;
                    border-radius: 10px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                    text-align: center;
                    max-width: 500px;
                }
                .success-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }
                h1 {
                    color: #2d3748;
                    margin-bottom: 1rem;
                }
                p {
                    color: #4a5568;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                }
                .button {
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 12px 30px;
                    border-radius: 5px;
                    text-decoration: none;
                    font-weight: 600;
                    transition: transform 0.2s;
                }
                .button:hover {
                    transform: translateY(-2px);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="success-icon">✅</div>
                <h1>Email Confirmed Successfully!</h1>
                <p>Your email has been verified. You can now log in to your Klippers.ai account.</p>
                <a href="https://klippers.ai/login" class="button">Go to Login</a>
            </div>
        </body>
        </html>
        """
    except Exception as e:
        error_msg = str(e)
        is_invalid_code = "code mismatch" in error_msg.lower() or "expired" in error_msg.lower()

        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Confirmation Failed - Klippers.ai</title>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                }}
                .container {{
                    background: white;
                    padding: 3rem;
                    border-radius: 10px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                    text-align: center;
                    max-width: 500px;
                }}
                .error-icon {{
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }}
                h1 {{
                    color: #2d3748;
                    margin-bottom: 1rem;
                }}
                p {{
                    color: #4a5568;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                }}
                .error-details {{
                    background: #fff5f5;
                    border-left: 4px solid #f56565;
                    padding: 1rem;
                    margin-bottom: 2rem;
                    text-align: left;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="error-icon">❌</div>
                <h1>Confirmation Failed</h1>
                <p>{'The confirmation code is invalid or has expired.' if is_invalid_code else 'There was an error confirming your email.'}</p>
                <div class="error-details">
                    <strong>Error:</strong> {error_msg}
                </div>
                <p>Please contact support or try registering again.</p>
            </div>
        </body>
        </html>
        """


@router.post("/admin-confirm-user", response_model=schema_user.MessageResponse)
async def admin_confirm_user(
    body: dict = Body(...),
):
    """
    Admin endpoint to confirm a user without requiring the verification code.
    Use this for development/testing purposes only.
    """
    try:
        email = body.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")

        klippers_cognito.admin_confirm_user(email.strip())
        return {"message": f"User {email} confirmed successfully. They can now login."}
    except Exception as e:
        error_msg = str(e)
        raise HTTPException(status_code=500, detail=error_msg)


@router.post("/update-subscription-id", response_model=schema_user.MessageResponse)
async def update_subscription_id(
    body: dict = Body(...),
    db: Session = Depends(get_db)
):
    try:
        email = body.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")

        customers = stripe.Customer.list(email=email, limit=1)

        if customers.data is None or len(customers.data) == 0:
            raise HTTPException(status_code=400, detail="Customer not found")

        customer = customers.data[0]
        print(f"customer: {customer}")

        db_user = db.query(User).filter(User.email == email.strip()).first()
        if not db_user:
            raise HTTPException(status_code=400, detail="User not found")

        # Get subscription ID from customer's subscriptions
        # Get more subscriptions to choose from (sorted by created date, most recent first)
        subscriptions = stripe.Subscription.list(
            customer=customer.id,
            status='all',
            limit=10
        )

        if subscriptions.data:
            # Prioritize active or incomplete subscriptions over expired ones
            active_or_incomplete = next(
                (s for s in subscriptions.data if s.status in ['active', 'incomplete', 'trialing', 'past_due']), 
                None
            )
            if active_or_incomplete:
                db_user.subscription_id = active_or_incomplete.id
                db_user.subscription_status = active_or_incomplete.status
                # Get product name from subscription items
                # Use dictionary-style access for 'items' to avoid conflict with the dict.items() method
                if active_or_incomplete['items'] and active_or_incomplete['items'].data:
                    product_id = active_or_incomplete['items'].data[0].price.product
                    # Fetch the product details separately
                    try:
                        product = stripe.Product.retrieve(product_id)
                        db_user.subscription_plan = product.name
                    except Exception as e:
                        print(f"Error fetching product: {e}")
                        db_user.subscription_plan = product_id
            else:
                # Fall back to most recent subscription (first in list)
                db_user.subscription_id = subscriptions.data[0].id
                db_user.subscription_status = subscriptions.data[0].status
                # Get product name from subscription items
                # Use dictionary-style access for 'items' to avoid conflict with the dict.items() method
                if subscriptions.data[0]['items'] and subscriptions.data[0]['items'].data:
                    product_id = subscriptions.data[0]['items'].data[0].price.product
                    # Fetch the product details separately
                    try:
                        product = stripe.Product.retrieve(product_id)
                        db_user.subscription_plan = product.name
                    except Exception as e:
                        print(f"Error fetching product: {e}")
                        db_user.subscription_plan = product_id
        else:
            db_user.subscription_id = None
            db_user.subscription_status = None
            db_user.subscription_plan = None
        db_user.subscription_updated_at = datetime.now()


        if db_user.subscription_plan == "klippers_level1":
            db_user.subscription_config_json = Level1SubscriptionPlanInstanceMonthly.model_dump()
        elif db_user.subscription_plan == "klippers_level2":
            db_user.subscription_config_json = Level2SubscriptionPlanInstanceMonthly.model_dump()
        elif db_user.subscription_plan == "klippers_level3":
            db_user.subscription_config_json = Level3SubscriptionPlanInstanceMonthly.model_dump()


        db.commit()
        return {"message": "User updated successfully"}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/google/verify-token", response_model=Token)
async def verify_google_token(
    body: dict = Body(...),
    db: Session = Depends(get_db)
):
    """
    Verify a Google access token from the frontend Google Sign-In SDK.
    Creates or finds the user and returns a custom JWT token for API access.

    This endpoint is for when you're using Google's JavaScript SDK directly in your frontend.

    Request body:
    {
        "access_token": "google_access_token_here"
    }

    Note: Also supports legacy "credential" field for ID tokens for backward compatibility.
    """
    try:
        logger.debug("verify_google_token: Endpoint called")
        logger.debug("verify_google_token: Request body keys: %s", body.keys())

        # Support both access_token (new) and credential (legacy ID token)
        google_token = body.get('access_token') or body.get('credential')

        if not google_token:
            logger.warning("verify_google_token: Missing access_token or credential in request body")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing 'access_token' or 'credential' in request body"
            )

        logger.debug("verify_google_token: Received Google token, length=%d", len(google_token))
        logger.info("Verifying Google token from frontend SDK...")

        # Initialize Google token verifier
        logger.debug("verify_google_token: Initializing GoogleTokenVerifier with client_id=%s", settings.GOOGLE_CLIENT_ID[:20] + "..." if settings.GOOGLE_CLIENT_ID else "NOT_SET")
        google_verifier = GoogleTokenVerifier(settings.GOOGLE_CLIENT_ID)

        # Determine if this is an access token or ID token
        # Access tokens are typically opaque strings, ID tokens are JWTs (have dots)
        is_jwt = google_token.count('.') == 2
        
        if is_jwt:
            # Legacy ID token verification
            logger.debug("verify_google_token: Detected ID token (JWT), using verify_token method...")
            google_claims = google_verifier.verify_token(google_token)
        else:
            # Access token verification via UserInfo API
            logger.debug("verify_google_token: Detected access token, using verify_access_token method...")
            google_claims = google_verifier.verify_access_token(google_token)

        if not google_claims:
            logger.error("verify_google_token: Google token verification failed - claims are None/empty")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token"
            )

        logger.debug("verify_google_token: Token verified successfully, claims keys: %s", google_claims.keys())

        # Extract user info from Google token
        email = google_claims.get('email')
        name = google_claims.get('name', email)
        google_sub = google_claims.get('sub')

        logger.debug("verify_google_token: Extracted claims - email=%s, name=%s, google_sub=%s", email, name, google_sub)

        if not email:
            logger.error("verify_google_token: Email not found in Google token claims")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not found in Google token"
            )

        logger.info(f"Google token verified for email: {email}")

        # Check if user exists in local database
        logger.debug("verify_google_token: Querying database for user with email: %s", email)
        db_user = db.query(User).filter(User.email == email).first()

        if not db_user:
            # Create new user
            logger.info(f"Creating new user from Google sign-in: {email}")
            logger.debug("verify_google_token: Creating User object with username=%s, name=%s, subscription_plan=no_plan", google_sub, name)
            db_user = User(
                username=google_sub,  # Use Google sub as username
                name=name,
                email=email,
                subscription_plan="no_plan",
                subscription_config_json=Level0SubscriptionPlanInstance.model_dump(),
                is_active=True,
                hashed_password=None  # No password for Google OAuth users
            )
            logger.debug("verify_google_token: Adding user to database session")
            db.add(db_user)
            logger.debug("verify_google_token: Committing database transaction")
            db.commit()
            db.refresh(db_user)
            logger.info(f"Created new user with ID: {db_user.id}")
        else:
            logger.info(f"Found existing user with ID: {db_user.id}")
            logger.debug("verify_google_token: Existing user details - username=%s, subscription_plan=%s, is_active=%s",
                        db_user.username, db_user.subscription_plan, db_user.is_active)

        # Create custom JWT token for API access
        logger.debug("verify_google_token: Creating custom JWT token with expiry=%d minutes", settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

        token_data = {
            "sub": db_user.username,
            "user_id": db_user.id,
            "subscription_plan": db_user.subscription_plan,
            "email": db_user.email,
            "name": db_user.name
        }
        logger.debug("verify_google_token: Token data: %s", token_data)

        access_token = create_access_token(
            data=token_data,
            expires_delta=access_token_expires
        )

        logger.debug("verify_google_token: Custom JWT token created, length=%d", len(access_token))
        logger.info(f"Successfully authenticated Google user: {email}")

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google token verification error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )


@router.post("/facebook/verify-token", response_model=Token)
async def verify_facebook_token(
    request: FacebookTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Verify a Facebook access token from the frontend Facebook SDK.
    Creates or finds the user and returns a custom JWT token for API access.

    This endpoint is for when you're using Facebook's JavaScript SDK directly in your frontend.

    Request body:
    {
        "accessToken": "facebook_access_token_here",
        "userID": "facebook_user_id_here"
    }
    """
    try:
        logger.debug("verify_facebook_token: Endpoint called")

        facebook_token = request.accessToken
        

        if not facebook_token:
            logger.warning("verify_facebook_token: Missing accessToken in request body")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing 'accessToken' in request body"
            )

        logger.debug("verify_facebook_token: Received Facebook token, length=%d", len(facebook_token))
        logger.info("Verifying Facebook token from frontend SDK...")

        # Get Facebook credentials from environment
        facebook_app_id = settings.FACEBOOK_APP_ID
        facebook_app_secret = settings.FACEBOOK_APP_SECRET

        if not facebook_app_id or not facebook_app_secret:
            logger.error("verify_facebook_token: Facebook credentials not configured in environment")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Facebook authentication not configured"
            )

        # Initialize Facebook token verifier
        logger.debug("verify_facebook_token: Initializing FacebookTokenVerifier with app_id=%s", facebook_app_id[:20] + "..." if len(facebook_app_id) > 20 else facebook_app_id)
        facebook_verifier = FacebookTokenVerifier(facebook_app_id, facebook_app_secret)

        # Verify the Facebook token
        logger.debug("verify_facebook_token: Calling verify_token method...")
        facebook_data = facebook_verifier.verify_token(facebook_token)

        if not facebook_data:
            logger.error("verify_facebook_token: Facebook token verification failed - data is None/empty")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Facebook token"
            )

        logger.debug("verify_facebook_token: Token verified successfully, data keys: %s", facebook_data.keys())

        # Extract user info from Facebook data
        email = facebook_data.get('email')
        name = facebook_data.get('name', email)
        facebook_id = facebook_data.get('facebook_id') or facebook_data.get('sub')

        logger.debug("verify_facebook_token: Extracted data - email=%s, name=%s, facebook_id=%s", email, name, facebook_id)

        if not email:
            logger.error("verify_facebook_token: Email not found in Facebook token data")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not found in Facebook token. Please grant email permission."
            )

        logger.info(f"Facebook token verified for email: {email}")

        # Check if user exists in local database
        logger.debug("verify_facebook_token: Querying database for user with email: %s", email)
        db_user = db.query(User).filter(User.email == email).first()

        if not db_user:
            # Create new user
            logger.info(f"Creating new user from Facebook sign-in: {email}")
            logger.debug("verify_facebook_token: Creating User object with username=%s, name=%s, subscription_plan=no_plan", facebook_id, name)
            db_user = User(
                username=facebook_id,  # Use Facebook ID as username
                name=name,
                email=email,
                subscription_plan="no_plan",
                subscription_config_json=Level0SubscriptionPlanInstance.model_dump(),
                is_active=True,
                hashed_password=None  # No password for Facebook OAuth users
            )
            logger.debug("verify_facebook_token: Adding user to database session")
            db.add(db_user)
            logger.debug("verify_facebook_token: Committing database transaction")
            db.commit()
            db.refresh(db_user)
            logger.info(f"Created new user with ID: {db_user.id}")
        else:
            logger.info(f"Found existing user with ID: {db_user.id}")
            logger.debug("verify_facebook_token: Existing user details - username=%s, subscription_plan=%s, is_active=%s",
                        db_user.username, db_user.subscription_plan, db_user.is_active)

        # Create custom JWT token for API access
        logger.debug("verify_facebook_token: Creating custom JWT token with expiry=%d minutes", settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)


        token_data = {
            "sub": db_user.username,
            "user_id": db_user.id,
            "subscription_plan": db_user.subscription_plan,
            "email": db_user.email,
            "name": db_user.name
        }
        logger.debug("verify_facebook_token: Token data: %s", token_data)

        access_token = create_access_token(
            data=token_data,
            expires_delta=access_token_expires
        )

        logger.debug("verify_facebook_token: Custom JWT token created, length=%d", len(access_token))
        logger.info(f"Successfully authenticated Facebook user: {email}")

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Facebook token verification error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )


@router.get("/google/login")
async def google_login():
    """
    Initiate Google OAuth flow via AWS Cognito.
    This redirects the user to Cognito's hosted UI which then redirects to Google.
    halils note: watch this video https://www.youtube.com/watch?v=GuHN_ZqHExs
    """
    # Build the Cognito OAuth URL
    cognito_domain = cognito_config.aws_cognito_user_pool_domain
    region = cognito_config.region
    client_id = cognito_config.aws_cognito_user_pool_client_id

    # Determine callback URL based on environment
    callback_url = os.getenv('GOOGLE_OAUTH_CALLBACK_URL', 'http://localhost:8000/api/v1/auth/google/callback')

    # Build the authorization URL
    params = {
        'client_id': client_id,
        'response_type': 'code',
        'scope': 'email openid profile',
        'redirect_uri': callback_url,
        'identity_provider': 'Google'  # This tells Cognito to use Google
    }

    cognito_oauth_url = f"https://{cognito_domain}.auth.{region}.amazoncognito.com/oauth2/authorize?{urllib.parse.urlencode(params)}"

    logger.info(f"Redirecting to Google OAuth via Cognito: {cognito_oauth_url}")

    return RedirectResponse(url=cognito_oauth_url)


@router.get("/google/callback")
async def google_callback(
    code: str,
    db: Session = Depends(get_db)
):
    """
    Handle the OAuth callback from Cognito after Google authentication.
    Exchange the authorization code for Cognito tokens.
    """
    try:
        logger.info(f"Google OAuth callback received with code: {code[:10]}...")

        # Exchange authorization code for tokens
        cognito_domain = cognito_config.aws_cognito_user_pool_domain
        region = cognito_config.region
        client_id = cognito_config.aws_cognito_user_pool_client_id
        callback_url = os.getenv('GOOGLE_OAUTH_CALLBACK_URL', 'http://localhost:8000/api/v1/auth/google/callback')

        token_url = f"https://{cognito_domain}.auth.{region}.amazoncognito.com/oauth2/token"

        token_data = {
            'grant_type': 'authorization_code',
            'client_id': client_id,
            'code': code,
            'redirect_uri': callback_url
        }

        logger.info(f"Exchanging code for tokens at: {token_url}")

        response = requests.post(
            token_url,
            data=token_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )

        if response.status_code != 200:
            logger.error(f"Token exchange failed: {response.text}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to exchange authorization code: {response.text}"
            )

        tokens = response.json()
        id_token = tokens.get('id_token')
        refresh_token = tokens.get('refresh_token')

        logger.info("Successfully exchanged code for tokens")

        # Verify and decode the ID token to get user info
        claims = klippers_cognito.verify_token(id_token, token_use="id")

        if not claims:
            logger.error("Failed to verify ID token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token received from Google"
            )

        email = claims.get('email')
        user_sub = claims.get('sub')  # Cognito user ID
        name = claims.get('name', email)

        logger.info(f"User authenticated via Google: {email}")

        # Check if user exists in local database
        db_user = db.query(User).filter(User.email == email).first()

        if not db_user:
            # Create new user in local database
            logger.info(f"Creating new user from Google OAuth: {email}")
            db_user = User(
                username=user_sub,
                name=name,
                email=email,
                subscription_plan="free",  # Default plan
                is_active=True,
                hashed_password=None  # No password for OAuth users
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)

        # Build frontend redirect URL with tokens
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:22081')
        redirect_params = {
            'access_token': id_token,  # Send ID token to frontend
            'refresh_token': refresh_token,
            'token_type': 'bearer'
        }

        redirect_url = f"{frontend_url}/auth-provider/callback?{urllib.parse.urlencode(redirect_params)}"

        logger.info(f"Redirecting to frontend: {frontend_url}/auth-provider/callback")

        return RedirectResponse(url=redirect_url)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google OAuth callback error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )


@router.post("/logout")
async def logout():
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user