# from datetime import time
# flake8: noqa: E501
from datetime import datetime, timedelta
import logging
# import app.config as appConfig

from sqlalchemy import func

from app.db.model_document import OldUserPromotionCode, UserPromotionCode, UserVideo, UserVideoStatus, UserVideoProcessStatus
from dotenv import load_dotenv
from app.config import settings
from sqlalchemy.orm import Session
from app.db.database import SessionLocal

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)




def _update_promotion_code_values(db: Session, user_video: UserVideo):
    """
    Update promotion code values for a specific user
    """

    
    user_promotion_code = db.query(UserPromotionCode).filter(UserPromotionCode.user_id == user_video.user_id).first()
    if not user_promotion_code:
        return
    # delete promotion code if the allowance is less than the video duration
    # save the old promotion code to the old_user_promotion_codes table
    allowance_in_video_duration = user_promotion_code.video_allowance_in_seconds
    allowance_in_video_count = user_promotion_code.video_count_allowance
    if allowance_in_video_duration is None:
        allowance_in_video_duration = 0
    if allowance_in_video_count is None:
        allowance_in_video_count = 0
    

    if allowance_in_video_duration <= 0 or allowance_in_video_count <= 0:
        db.delete(user_promotion_code)
        db.add(OldUserPromotionCode(
            user_id=user_video.user_id, 
            code=user_promotion_code.code,
        ))
        return
    


    reduction_in_video_duration = min (allowance_in_video_duration, user_video.video_duration)
    reduction_in_video_count = 1

    
    # all video duration is reduced by the promotion code
    user_video.video_duration_reduced_by_promotion_code = reduction_in_video_duration
    user_promotion_code.video_allowance_in_seconds -= reduction_in_video_duration
    user_promotion_code.video_count_allowance -= reduction_in_video_count
    db.add(user_promotion_code)

    if user_promotion_code.video_allowance_in_seconds <= 0 or user_promotion_code.video_count_allowance <= 0:
        db.delete(user_promotion_code)
        db.add(OldUserPromotionCode(
            user_id=user_video.user_id, 
            code=user_promotion_code.code,
        ))
        return


    # db.commit()



def _update_video_status_in_db(db: Session, user_id: str, video_id: str, status: str, processing_started_at: str, processing_completed_at: str):
    """
    Update video status in database for a specific user and video
    """
    
    try:
        # Set the session on DocumentDAO
        
        user_video = db.query(UserVideo).filter(UserVideo.user_id == user_id, UserVideo.video_id == video_id).first()

        if user_video:
            user_video.status = status
            if processing_started_at:
                user_video.processing_started_at = processing_started_at
            if processing_completed_at:
                user_video.processing_completed_at = processing_completed_at
            if status == "completed":
                _update_promotion_code_values(db, user_video)
            db.commit()
            logger.info(f"Updated video {video_id} status to {status} for user {user_id}")
        else:
            logger.error(f"User video not found: user_id={user_id}, video_id={video_id}")
            
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating video status: {e}")
        raise e
    finally:
        db.close()


def update_video_status_in_db_command(user_id: str, video_id: str, status: str, processing_started_at: str, processing_completed_at: str):
    """Update video status in database via command line."""
    load_dotenv()
    db = SessionLocal()
    logger.info(f"Updating video status: user_id={user_id}, video_id={video_id}, status={status}")
    _update_video_status_in_db(db, user_id, video_id, status, processing_started_at, processing_completed_at)
    logger.info("Video status update completed.")



def _insert_video_processing_status_in_db(db: Session, user_video_id: str, status: str):
    """
    Update video status in database for a specific user and video
    """
    # Create a new DB session explicitly
    
    try:
        # Set the session on DocumentDAO
        user_video_process_status = UserVideoProcessStatus(user_video_id=user_video_id, status=status)
        db.add(user_video_process_status)
        db.commit()
        logger.info(f"Inserted video {user_video_id} processing status to {status}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error inserting video processing status: {e}")
        raise e
    finally:
        db.close()

        


def insert_video_processing_status_in_db_command(user_video_id: str, status: str):
    """Update video status in database via command line."""
    load_dotenv()
    db = SessionLocal()
    logger.info(f"Updating video procesing status: user_video_id={user_video_id}, status={status}")
    _insert_video_processing_status_in_db(db, user_video_id, status)
    logger.info("Video processing status update completed.")


# Example Usage
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == 'insert-video-processing-status-in-db':
        insert_video_processing_status_in_db_command()
    else:
        update_video_status_in_db_command()