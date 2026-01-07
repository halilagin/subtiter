# from datetime import time
# flake8: noqa: E501
from datetime import datetime, timedelta
import logging
import click
# import app.config as appConfig
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import func
from app.db.database import SessionLocal
from app.db.model_document import UserAdminVideoAllowance, UserPromotionCode, UserVideo, UserVideoStatus, UserVideoProcessStatus, User, SubscriptionPlanConfig, Level0SubscriptionPlanInstance


# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)




def __get_applicable_sum_of_video_duration_in_last_n_days(db: Session, user_id: str, in_last_n_days: int=30) -> int:
    """
    Get sum of video duration in seconds for a specific user in the last month
    """
    # Create a new DB session explicitly
    logger.info(f"[__get_applicable_sum_of_video_duration_in_last_n_days] Starting for user_id={user_id}, in_last_n_days={in_last_n_days}")
    
    try:
        # Calculate date one month ago
        one_month_ago = datetime.utcnow() - timedelta(days=in_last_n_days)
        logger.debug(f"[__get_applicable_sum_of_video_duration_in_last_n_days] Querying videos from {one_month_ago} onwards for user {user_id}")

        # Query videos uploaded in the last month for this user
        total_duration = db.query(func.sum(UserVideo.video_duration - UserVideo.video_duration_reduced_by_promotion_code)).filter(
            UserVideo.user_id == user_id,
            UserVideo.status == "completed",
            UserVideo.uploaded_at >= one_month_ago
            
        ).scalar() or 0

        logger.info(f"[__get_applicable_sum_of_video_duration_in_last_n_days] Total applicable video duration for user {user_id} in last {in_last_n_days} days: {total_duration} seconds")
        return int(total_duration)

    except Exception as e:
        logger.error(f"[__get_applicable_sum_of_video_duration_in_last_n_days] Error getting sum of video duration for user {user_id}: {e}")
        raise e

def __get_sum_of_video_duration_in_last_n_days(db: Session, user_id: str, in_last_n_days: int=30) -> int:
    """
    Get sum of video duration in seconds for a specific user in the last month
    """
    # Create a new DB session explicitly
    
    try:
        # Calculate date one month ago
        one_month_ago = datetime.utcnow() - timedelta(days=in_last_n_days)

        # Query videos uploaded in the last month for this user
        total_duration = db.query(func.sum(UserVideo.video_duration )).filter(
            UserVideo.user_id == user_id,
            UserVideo.status == "completed",
            UserVideo.uploaded_at >= one_month_ago
            
        ).scalar() or 0

        logger.info(f"Total video duration for user {user_id} in last month: {total_duration} seconds")
        return int(total_duration)

    except Exception as e:
        logger.error(f"Error getting sum of video duration: {e}")
        raise e
    

def _get_sum_of_video_duration_in_last_n_days(user_id: str, in_last_n_days: int=30) -> int:
    """
    Get sum of video duration in seconds for a specific user in the last month
    """
    # Create a new DB session explicitly
    db = SessionLocal()
    try:
        return __get_applicable_sum_of_video_duration_in_last_n_days(db, user_id, in_last_n_days)
    except Exception as e:
        logger.error(f"Error getting sum of video duration: {e}")
        raise e
    finally:
        db.close()



def __get_number_of_video_uploaded_in_last_n_days(db: Session, user_id: str, in_last_n_days: int=30) -> int:
    """
    Get the number of videos uploaded for a specific user in the last n days
    """
    # Create a new DB session explicitly
    logger.info(f"[__get_number_of_video_uploaded_in_last_n_days] Starting for user_id={user_id}, in_last_n_days={in_last_n_days}")
    try:
        # Calculate date n days ago
        n_days_ago = datetime.utcnow() - timedelta(days=in_last_n_days)
        logger.debug(f"[__get_number_of_video_uploaded_in_last_n_days] Querying videos from {n_days_ago} onwards for user {user_id}")

        # Query count of videos uploaded in the last n days for this user
        video_count = db.query(func.count(UserVideo.id)).filter(
            UserVideo.user_id == user_id,
            UserVideo.uploaded_at >= n_days_ago
            
        ).scalar() or 0

        logger.info(f"[__get_number_of_video_uploaded_in_last_n_days] Total number of videos for user {user_id} in last {in_last_n_days} days: {video_count}")
        return int(video_count)

    except Exception as e:
        logger.error(f"[__get_number_of_video_uploaded_in_last_n_days] Error getting number of videos uploaded for user {user_id}: {e}")
        raise e
    

def _get_number_of_video_uploaded_in_last_n_days(user_id: str, in_last_n_days: int=30) -> int:
    """
    Get the number of videos uploaded for a specific user in the last n days
    """
    # Create a new DB session explicitly
    db = SessionLocal()
    try:
        return __get_number_of_video_uploaded_in_last_n_days(db, user_id, in_last_n_days)
    except Exception as e:
        logger.error(f"Error getting number of videos uploaded: {e}")
        raise e
    finally:
        db.close()


def __update_video_duration_in_db( db: Session, user_id: str, video_id: str, duration: float):
    """
    Update video duration in database for a specific user and video
    """
    try:
        user_video = db.query(UserVideo).filter(UserVideo.user_id == user_id, UserVideo.video_id == video_id).first()
        if user_video:
            user_video.video_duration = int(duration)
            db.commit()
            logger.info(f"Updated video {video_id} duration to {duration} seconds for user {user_id}")
        else:
            logger.error(f"User video not found: user_id={user_id}, video_id={video_id}")

    except Exception as e:
        logger.error(f"Error updating video duration: {e}")
        raise e
    
    

def _update_video_duration_in_db(user_id: str, video_id: str, duration: float):
    """
    Update video duration in database for a specific user and video
    """
    # Create a new DB session explicitly
    db = SessionLocal()
    try:
        # Set the session on DocumentDAO
        __update_video_duration_in_db(db, user_id, video_id, duration)
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating video duration: {e}")
        raise e
    finally:
        db.close()



@click.command('update-video-duration')
@click.option(
    '--user-id',
    required=True,
    type=str,
    help="User ID."
)
@click.option(
    '--video-id',
    required=True,
    type=str,
    help="Video ID."
)
@click.option(
    '--duration',
    required=True,
    type=float,
    help="Duration."
)
def update_video_duration_in_db_command(user_id: str, video_id: str, duration: float):
    """Gets the duration of a video file in seconds."""
    _update_video_duration_in_db(user_id, video_id, duration)



def _extract_video_duration(video_file):
    """Gets the duration of a video file in seconds using ffprobe."""
    import subprocess
    ffprobe_cmd = [
        'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1', video_file
    ]
    try:
        result = subprocess.run(ffprobe_cmd, capture_output=True, text=True, check=True)
        duration = float(result.stdout.strip())
        click.echo(f"Video duration: {duration:.2f} seconds")
        return duration
    except subprocess.CalledProcessError as e:
        click.secho(f"Error getting video duration: {e.stderr}", fg="red")
        raise click.Abort()




def __get_subscription_plan_config(db: Session, user_id: str) -> SubscriptionPlanConfig:
    """Get subscription plan for a user"""
    logger.info(f"[__get_subscription_plan_config] Getting subscription plan config for user_id={user_id}")
    user = db.query(User).filter(User.id == user_id).first()
    logger.debug(f"[__get_subscription_plan_config] user.subscription_config_json: {user.subscription_config_json}")
    if not user:
        logger.error(f"[__get_subscription_plan_config] User with id {user_id} not found in the database")
        raise ValueError(f"User with id {user_id} not found in the database.")
    
    # Handle case where subscription_config_json is None - return default no_plan config
    if user.subscription_config_json is None:
        logger.warning(f"[__get_subscription_plan_config] User {user_id} has no subscription_config_json, returning default no_plan config")
        return Level0SubscriptionPlanInstance
    
    subscription_plan = SubscriptionPlanConfig(**user.subscription_config_json)
    logger.info(f"[__get_subscription_plan_config] User {user_id} subscription plan: max_monthly_video_duration={subscription_plan.max_monthly_video_duration}s, max_monthly_video_count={subscription_plan.max_monthly_video_count}")
    return subscription_plan

def _get_subscription_plan_config(user_id: str) -> SubscriptionPlanConfig:
    """Get subscription plan for a user"""
    db = SessionLocal()
    try:
        return __get_subscription_plan_config(db, user_id)
    except Exception as e:
        logger.error(f"Error getting subscription plan: {e}")
        raise e
    finally:
        db.close()


@click.command('extract-video-duration')
@click.option(
    '--video-file',
    required=True,
    type=click.Path(exists=True, dir_okay=False),
    help="Input video file."
)
def extract_duration_command(video_file):
    """Gets the duration of a video file in seconds."""
    duration = _extract_video_duration(video_file)
    click.echo(f"Duration extracted: {duration} seconds")






@click.command("get-number-of-video-uploaded")
@click.option('--in-last-n-days', required=True, default=30, help='Number of days to get the sum of video duration')
@click.option('--user-id', required=True, help='User ID')
def get_number_of_video_uploaded_in_last_n_days_command(user_id: str, in_last_n_days: int):
    """Update video status in database via command line."""
    number_of_videos = _get_number_of_video_uploaded_in_last_n_days(user_id, in_last_n_days)
    click.echo(f"Number of video uploaded: {number_of_videos}")

@click.command("get-sum-of-video-duration")
@click.option('--in-last-n-days', required=True, default=30, help='Number of days to get the sum of video duration')
@click.option('--user-id', required=True, help='User ID')
def get_sum_of_video_duration_in_last_30_days_command(user_id: str, in_last_n_days: int):
    """Update video status in database via command line."""
    sum_of_video_duration = _get_sum_of_video_duration_in_last_n_days(user_id, in_last_n_days)
    click.echo(f"Sum of video duration: {sum_of_video_duration} seconds")
    


def _get_user_subscription_plan_name(db: Session, user_id: str) -> str:
    """Get user subscription plan string"""
    logger.info(f"[_get_user_subscription_plan_name] Getting subscription plan name for user_id={user_id}")
    result = db.query(User.subscription_plan).filter(User.id == user_id).first()
    if not result:
        logger.info(f"[_get_user_subscription_plan_name] No subscription plan found for user {user_id}, returning 'no_plan'")
        return "no_plan"
    
    plan_name = result[0]
    logger.info(f"[_get_user_subscription_plan_name] User {user_id} subscription plan name: {plan_name}")
    return plan_name


def __is_user_allowed_to_upload_video(db: Session, user_id: str, in_last_n_days: int):
    """Check if user is allowed to upload video"""
    logger.info(f"[__is_user_allowed_to_upload_video] Starting check for user_id={user_id}, in_last_n_days={in_last_n_days}")
    
    subscription_plane_name = _get_user_subscription_plan_name(db, user_id)
    logger.info(f"[__is_user_allowed_to_upload_video] Retrieved subscription plan name: {subscription_plane_name}")
    
    subscription_plan: SubscriptionPlanConfig = __get_subscription_plan_config(db, user_id)
    logger.info(f"[__is_user_allowed_to_upload_video] Subscription plan limits - max_monthly_video_duration: {subscription_plan.max_monthly_video_duration}s, max_monthly_video_count: {subscription_plan.max_monthly_video_count}")

    
    sum_of_video_duration = __get_applicable_sum_of_video_duration_in_last_n_days(db, user_id, in_last_n_days)
    logger.info(f"[__is_user_allowed_to_upload_video] Initial sum_of_video_duration: {sum_of_video_duration}s")
    
    number_of_videos = __get_number_of_video_uploaded_in_last_n_days(db, user_id, in_last_n_days)
    logger.info(f"[__is_user_allowed_to_upload_video] Initial number_of_videos: {number_of_videos}")
    
    # user_admin_video_allowance = db.query(UserAdminVideoAllowance).filter(UserAdminVideoAllowance.user_id == user_id).first()
    # if user_admin_video_allowance:
    #     sum_of_video_duration -= user_admin_video_allowance.video_allowance_in_seconds
    #     number_of_videos -= user_admin_video_allowance.video_count_allowance

    now = datetime.utcnow()
    user_promotion_code = db.query(UserPromotionCode).filter(
        UserPromotionCode.user_id == user_id
    ).first()
    
    if user_promotion_code:
        logger.info(f"[__is_user_allowed_to_upload_video] User has promotion code - video_allowance_in_seconds: {user_promotion_code.video_allowance_in_seconds}s, video_count_allowance: {user_promotion_code.video_count_allowance}")
        sum_of_video_duration -= user_promotion_code.video_allowance_in_seconds
        number_of_videos -= user_promotion_code.video_count_allowance
        logger.info(f"[__is_user_allowed_to_upload_video] After promotion code adjustment - sum_of_video_duration: {sum_of_video_duration}s, number_of_videos: {number_of_videos}")
    else:
        logger.info(f"[__is_user_allowed_to_upload_video] No promotion code found for user {user_id}")
    
    duration_check = sum_of_video_duration < subscription_plan.max_monthly_video_duration
    count_check = number_of_videos < subscription_plan.max_monthly_video_count
    
    logger.info(f"[__is_user_allowed_to_upload_video] Duration check: {sum_of_video_duration} < {subscription_plan.max_monthly_video_duration} = {duration_check}")
    logger.info(f"[__is_user_allowed_to_upload_video] Count check: {number_of_videos} < {subscription_plan.max_monthly_video_count} = {count_check}")
    
    is_allowed = duration_check and count_check
    
    logger.info(f"[__is_user_allowed_to_upload_video] Final result for user {user_id}: is_allowed={is_allowed}")
    return is_allowed


def __is_user_allowed_to_generate_shorts(db: Session, user_id: str, in_last_n_days: int):
    return __is_user_allowed_to_upload_video(db, user_id, in_last_n_days)

def _is_user_allowed_to_upload_video(user_id: str, in_last_n_days: int):
    """Check if user is allowed to upload video"""
    db = SessionLocal()
    try:
        return __is_user_allowed_to_upload_video(db, user_id, in_last_n_days)
    except Exception as e:
        logger.error(f"Error checking if user is allowed to upload video: {e}")
        raise e
    finally:
        db.close()


@click.command("is-user-allowed-to-upload-video")
@click.option('--user-id', required=True, help='User ID')
@click.option('--in-last-n-days', required=True, default=30, help='Number of days to get the sum of video duration')
def is_user_allowed_to_upload_video_command(user_id: str, in_last_n_days: int):
    """Update video status in database via command line."""
    is_user_allowed_to_upload_video = _is_user_allowed_to_upload_video(user_id, in_last_n_days)
    click.echo(f"Is user allowed to upload video: {is_user_allowed_to_upload_video}")


@click.group("subscription-plan-guard")
def subscription_plan_guard_group():
    """Subscription Plan Guard CLI Tool"""
    pass
    

subscription_plan_guard_group.add_command(extract_duration_command)
subscription_plan_guard_group.add_command(get_sum_of_video_duration_in_last_30_days_command)
subscription_plan_guard_group.add_command(update_video_duration_in_db_command)
subscription_plan_guard_group.add_command(is_user_allowed_to_upload_video_command)
subscription_plan_guard_group.add_command(get_number_of_video_uploaded_in_last_n_days_command)

# Example Usage
if __name__ == "__main__":
    import sys
    subscription_plan_guard_group()