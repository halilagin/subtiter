from datetime import datetime
from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
# from sqlalchemy.ext.declarative import declarative_base
import sqlalchemy
import uuid
from enum import Enum
from pydantic import BaseModel

Base = sqlalchemy.orm.declarative_base()


class SubscriptionRecurringInterval(Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"

class SubscriptionPlanConfig(BaseModel):
    """
    Subscription plan configuration.
    """
    name: str
    recurring_interval: str
    max_monthly_video_duration: int  # in seconds
    max_monthly_video_count: int
    max_monthly_video_count_per_user: int
    max_monthly_video_count_per_user_per_week: int
    max_monthly_video_count_per_user_per_month: int
    max_monthly_video_count_per_user_per_year: int



# no plan
Level0SubscriptionPlanInstance = SubscriptionPlanConfig(
    name="no_plan",
    recurring_interval=SubscriptionRecurringInterval.MONTHLY,
    max_monthly_video_duration=0,
    max_monthly_video_count=0,
    max_monthly_video_count_per_user=0,
    max_monthly_video_count_per_user_per_week=0,
    max_monthly_video_count_per_user_per_month=0,
    max_monthly_video_count_per_user_per_year=0,
)


Level1SubscriptionPlanInstanceMonthly = SubscriptionPlanConfig(
    name="klippers_level1_monthly",
    recurring_interval=SubscriptionRecurringInterval.MONTHLY,
    max_monthly_video_duration=2 * 60 * 60,  # 2 hour
    max_monthly_video_count=5,
    max_monthly_video_count_per_user=100,
    max_monthly_video_count_per_user_per_day=10,
    max_monthly_video_count_per_user_per_week=100,
    max_monthly_video_count_per_user_per_month=1000,
    max_monthly_video_count_per_user_per_year=10000,
)

Level2SubscriptionPlanInstanceMonthly = SubscriptionPlanConfig(
    name="klippers_level2_monthly",
    recurring_interval=SubscriptionRecurringInterval.MONTHLY,
    max_monthly_video_duration=Level1SubscriptionPlanInstanceMonthly.max_monthly_video_duration * 4,
    max_monthly_video_count=Level1SubscriptionPlanInstanceMonthly.max_monthly_video_count * 4,
    max_monthly_video_count_per_user=100,
    max_monthly_video_count_per_user_per_day=10,
    max_monthly_video_count_per_user_per_week=100,
    max_monthly_video_count_per_user_per_month=1000,
    max_monthly_video_count_per_user_per_year=10000,
)

Level3SubscriptionPlanInstanceMonthly = SubscriptionPlanConfig(
    name="klippers_level3_monthly",
    recurring_interval=SubscriptionRecurringInterval.MONTHLY,
    max_monthly_video_duration=Level2SubscriptionPlanInstanceMonthly.max_monthly_video_duration * 4,
    max_monthly_video_count=Level2SubscriptionPlanInstanceMonthly.max_monthly_video_count * 4,
    max_monthly_video_count_per_user=100,
    max_monthly_video_count_per_user_per_day=10,
    max_monthly_video_count_per_user_per_week=100,
    max_monthly_video_count_per_user_per_month=1000,
    max_monthly_video_count_per_user_per_year=10000,
)




Level1SubscriptionPlanInstanceYearly = SubscriptionPlanConfig(
    name="klippers_level1_yearly",
    recurring_interval=SubscriptionRecurringInterval.MONTHLY,
    max_monthly_video_duration=10000,
    max_monthly_video_count=1000,
    max_monthly_video_count_per_user=100,
    max_monthly_video_count_per_user_per_day=10,
    max_monthly_video_count_per_user_per_week=100,
    max_monthly_video_count_per_user_per_month=1000,
    max_monthly_video_count_per_user_per_year=10000,
)

Level2SubscriptionPlanInstanceYearly = SubscriptionPlanConfig(
    name="klippers_level2_yearly",
    recurring_interval=SubscriptionRecurringInterval.MONTHLY,
    max_monthly_video_duration=10000,
    max_monthly_video_count=1000,
    max_monthly_video_count_per_user=100,
    max_monthly_video_count_per_user_per_day=10,
    max_monthly_video_count_per_user_per_week=100,
    max_monthly_video_count_per_user_per_month=1000,
    max_monthly_video_count_per_user_per_year=10000,
)

Level3SubscriptionPlanInstanceYearly = SubscriptionPlanConfig(
    name="klippers_level3_yearly",
    recurring_interval=SubscriptionRecurringInterval.MONTHLY,
    max_monthly_video_duration=10000,
    max_monthly_video_count=1000,
    max_monthly_video_count_per_user=100,
    max_monthly_video_count_per_user_per_day=10,
    max_monthly_video_count_per_user_per_week=100,
    max_monthly_video_count_per_user_per_month=1000,
    max_monthly_video_count_per_user_per_year=10000,
)




class StripeDocumentMeter(Base):
    __tablename__ = 'stripe_document_meters'
    document_id = Column(String, primary_key=True)
    user_email = Column(String, nullable=False)
    subscription_id = Column(String, nullable=False)


# Replace the association tables with class declarations
class UserRole(Base):
    """SQLAlchemy model for user-role association"""
    __tablename__ = 'user_roles'

    user_id = Column(String, ForeignKey('users.id'), primary_key=True)
    role_id = Column(Integer, ForeignKey('roles.id'), primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class UserGroup(Base):
    """SQLAlchemy model for user-group association"""
    __tablename__ = 'user_groups'

    user_id = Column(String, ForeignKey('users.id'), primary_key=True)
    group_id = Column(Integer, ForeignKey('groups.id'), primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)



class UserAdminVideoAllowance(Base):
    __tablename__ = 'user_admin_video_allowances'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    video_allowance_in_seconds = Column(Integer, default=0)
    video_count_allowance = Column(Integer, default=0)
    video_upload_size_allowance_in_mb = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    name = Column(String, nullable=True)

    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    subscription_config_json: SubscriptionPlanConfig = Column(JSON, nullable=True)
    subscription_expires_at = Column(DateTime, nullable=True)
    subscription_status = Column(String, nullable=True)
    subscription_created_at = Column(DateTime, nullable=True)
    subscription_updated_at = Column(DateTime, nullable=True)
    subscription_plan = Column(String, nullable=True)  # PAY_AS_YOU_GO, MONTHLY_PAYMENT, VOLUME_BASED_PAYMENT
    subscription_id = Column(String, nullable=True)

    # Update relationship references to use the new association classes
    roles = relationship("Role", secondary="user_roles", back_populates="users")
    groups = relationship("Group", secondary="user_groups", back_populates="users")

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    permissions = Column(String)  # Store permissions as JSON string
    users = relationship("User", secondary="user_roles", back_populates="roles")


class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    users = relationship("User", secondary="user_groups", back_populates="groups")


class UserVideoStatus(Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class VideoProcessingApplication(str, Enum):
    GENERATE_SHORTS = "GENERATE_SHORTS"
    GENERATE_SUBTITLING = "GENERATE_SUBTITLING"
    APPLY_TRIM = "APPLY_TRIM"
    APPLY_SUBTITLES = "APPLY_SUBTITLES"
    APPLY_VOICE_OVER = "APPLY_VOICE_OVER"
    APPLY_VLOG = "APPLY_VLOG"
    APPLY_PODCAST_TEMPLATE = "APPLY_PODCAST_TEMPLATE"


class UserVideo(Base):
    """SQLAlchemy model for signature field placement in document"""
    __tablename__ = 'user_videos'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    video_id = Column(String, nullable=False)
    config_json = Column(JSON, nullable=True)
    video_duration = Column(Integer, nullable=True)  # in seconds
    video_duration_reduced_by_promotion_code = Column(Integer, default=0)  # in seconds
    applied_application = Column(String, default=VideoProcessingApplication.GENERATE_SHORTS.value)
    processing_started_at = Column(DateTime, nullable=True)
    processing_completed_at = Column(DateTime, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="uploaded")  # uploaded, processing, completed, failed
    meta_data = Column(JSON, default={})
    


class UserVideoProcessStatus(Base):
    __tablename__ = 'user_video_process_statuses'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_video_id = Column(String, nullable=False)
    status = Column(String, default="uploaded")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)



class PromotionCode(Base):
    __tablename__ = 'promotion_codes'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String, nullable=False, unique=True, index=True)
    level = Column(Integer, default=1, nullable=False)  # 0: no plan, 1: level 1, 2: level 2, 3: level 3
    video_allowance_in_seconds = Column(Integer, default=0)  # in seconds
    video_count_allowance = Column(Integer, default=0)  # in count
    video_upload_size_allowance_in_mb = Column(Integer, default=0)  # in mb

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)


class UserPromotionCode(Base):
    __tablename__ = 'user_promotion_codes'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    code = Column(String, nullable=False, unique=True)
    video_allowance_in_seconds = Column(Float, nullable=True)
    video_count_allowance = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)



class OldUserPromotionCode(Base):
    __tablename__ = 'old_user_promotion_codes'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    code = Column(String, nullable=False, unique=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    