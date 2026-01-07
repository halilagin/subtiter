# flake8: noqa: E501
from sqlalchemy.orm import Session
import logging
from app.db.model_document import User
from app.db.model_document import Level0SubscriptionPlanInstance, Level1SubscriptionPlanInstanceMonthly, Level2SubscriptionPlanInstanceMonthly, Level3SubscriptionPlanInstanceMonthly, Level1SubscriptionPlanInstanceYearly, Level2SubscriptionPlanInstanceYearly, Level3SubscriptionPlanInstanceYearly
from app.schemas.schema_user import UserCreate
import uuid

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_user(db: Session, user_id: str):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    db_user = User(
        id=str(uuid.uuid4()),
        email=user.email,
        name=user.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_or_create_user(db: Session, user_id: str, email: str, full_name: str = None) -> User:
    """
    Gets a user by ID or creates a new one if they don't exist.
    Assigns a default subscription plan to new users.
    """
    user = get_user(db, user_id)
    if user:
        return user
    
    # User does not exist, so create a new one
    logger.info(f"User with id {user_id} not found. Creating new user.")
    
    # Check if user with this email already exists
    user_by_email = get_user_by_email(db, email)
    if user_by_email:
        logger.warning(f"User with email {email} already exists with a different ID. Returning existing user by email.")
        return user_by_email


    new_user = User(
        id=user_id,
        email=email,
        name=full_name,
        subscription_config_json=Level0SubscriptionPlanInstance,
        subscription_plan="no_plan",
        subscription_id="no_plan"
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    logger.info(f"Successfully created new user with id {user_id} and email {email}")
    
    return new_user
