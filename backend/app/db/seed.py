import uuid
from ..db.model_document import PromotionCode, User, Role, Group, UserVideo, Level1SubscriptionPlanInstanceMonthly
from ..core.security import get_password_hash
from .database import SessionLocal
from datetime import datetime, timedelta, timezone
from app.klipperscmd.clippercmd.model.short_config_model import LanguageCode, VideoAspectRatio, VideoType, VideoFormat
from app.config import settings
import os
import shutil

sample_config_json = {
    "segment_count": 10,
    "capitalize_words": True,
    "capitalize_first_char_in_words": True,
    "video_people_context": "podcast",  # podcast,solo, vlog, interview, presentation, etc.
    "how_many_people_in_video": 1,
    "dissaminate_on_social_media": True,
    "target_short_video_length": 60,  # in seconds, -1 auto-detect
    "language_code": LanguageCode.EN,  # auto-detect, en, tr, etc.
    "video_aspect_ratio": VideoAspectRatio.SIXTEEN_BY_NINE,  # 16:9, 9:16, 1:1, etc.
    "generate_engaging_captions": True,
    "use_emojis_in_ass_words": True,
    "video_type": VideoType.VIDEO,  # video, image, gif, etc.
    "video_format": VideoFormat.MP4,  # mp4, mov, avi, etc.
    "video_resolution": "1920x1080",  # in pixels, -1 auto-detect
    "dissaminate_on_social_media_json": {
        "facebook": False,
        "instagram": False,
        "twitter": False,
        "linkedin": False,
        "youtube": False,
        "tiktok": False,
        "pinterest": False,
        "reddit": False,
        "snapchat": False,
        "telegram": False,
    }
}

def seed_user_videos(db):
    """Seed user_videos table with sample data"""
    admin_user = db.query(User).filter(User.username == "halilagintest").first()
    admin_user_id = admin_user.id
    user_videos = [ 
        UserVideo(
            id="41f21be3-dcf1-4f7d-ba53-f79d7c7b925f",
            user_id=admin_user_id,
            video_id="f7143179-7169-44a0-8063-54f7af6adf79",
            config_json=sample_config_json,
            video_duration=100,
            processing_started_at=datetime(2025, 8, 8, 22, 33, 11),
            processing_completed_at=datetime(2025, 8, 8, 22, 40, 11),
            uploaded_at=datetime(2025, 8, 8, 14, 6, 9, 375327),
            created_at=datetime(2025, 8, 8, 14, 6, 9, 375330),
            status="completed",
            meta_data={}
        ),
        UserVideo(
            id="c207c9c0-5108-4c9f-8e6e-c08b38fc4cff",
            user_id=admin_user_id,
            video_id="fe80098a-f9b8-4a4a-8177-e657799bb59b",
            config_json=sample_config_json,
            video_duration=100,
            processing_started_at=datetime(2025, 8, 8, 22, 33, 11),
            processing_completed_at=datetime(2025, 8, 8, 22, 40, 17),
            uploaded_at=datetime(2025, 8, 8, 22, 24, 11, 473884),
            created_at=datetime(2025, 8, 8, 22, 24, 11, 473886),
            status="completed",
            meta_data={}
        ),
        UserVideo(
            id="30af39aa-f62f-4eeb-bf0d-4e3bf4507b96",
            user_id=admin_user_id,
            video_id="12fad16c-65c7-4b51-bfbe-6974225cfd83",
            config_json=sample_config_json,
            video_duration=100,
            processing_started_at=datetime(2025, 8, 8, 22, 33, 11),
            processing_completed_at=datetime(2025, 8, 8, 22, 40, 24),
            uploaded_at=datetime(2025, 8, 8, 22, 32, 37, 612461),
            created_at=datetime(2025, 8, 8, 22, 32, 37, 612463),
            status="completed",
            meta_data={}
        ),
        UserVideo(
            id="4e4c514d-ae2a-49c6-9ad9-78a3b60704ac",
            user_id=admin_user_id,
            video_id="8f283f57-9481-49b4-ac0c-9d0fc060015b",
            config_json=sample_config_json,
            video_duration=100,
            processing_started_at=datetime(2025, 8, 8, 22, 33, 11),
            processing_completed_at=datetime(2025, 8, 8, 22, 40, 46),
            uploaded_at=datetime(2025, 8, 8, 22, 17, 31, 453477),
            created_at=datetime(2025, 8, 8, 22, 17, 31, 453480),
            status="completed",
            meta_data={}
        )
    ]
    db.add_all(user_videos)
    db.commit()

    sample_video_dir_path = os.path.join(settings.VIDEO_WAREHOUSE_ROOT_DIR, "sample_user", "sample_video")
    for user_video in user_videos:
        new_video_dir = os.path.join(settings.VIDEO_WAREHOUSE_ROOT_DIR, user_video.user_id, user_video.video_id)
        os.makedirs(new_video_dir, exist_ok=True)
        print(f"Copying all files from {sample_video_dir_path} to {new_video_dir}")
        shutil.copytree(sample_video_dir_path, new_video_dir, dirs_exist_ok=True)



def seed_users(db):
    try:
        # Create roles
        admin_role = Role(name="admin")
        user_role = Role(name="user")
        db.add_all([admin_role, user_role])

        # Create groups
        dev_group = Group(name="developers")
        test_group = Group(name="testers")
        db.add_all([dev_group, test_group])

        # Create users
        users = [
            User(
                id="8c8ef5c7-f30e-44c4-a370-2011b837988d",
                username="admin",
                email="admin@example.com",
                hashed_password=get_password_hash("admin123"),
                subscription_config_json=Level1SubscriptionPlanInstanceMonthly.model_dump(),
                is_active=True,
                is_superuser=True,
            ),
            User(
                username="john_doe",
                email="john@example.com",
                hashed_password=get_password_hash("password123"),
                subscription_config_json=Level1SubscriptionPlanInstanceMonthly.model_dump(),
                is_active=True,
            ),
            User(
                username="jane_doe",
                email="jane@example.com",
                hashed_password=get_password_hash("password456"),
                subscription_config_json=Level1SubscriptionPlanInstanceMonthly.model_dump(),
                is_active=True,
            ),
            User(
                id="f1f3106a-2a75-4ba6-8c31-2c13d0773721",
                username="halilagintest",
                email="halil.agin+klippers@gmail.com",
                hashed_password=get_password_hash("123456"),
                subscription_config_json=Level1SubscriptionPlanInstanceMonthly.model_dump(),
                is_active=True,
                subscription_id="sub_1RVEu3Gg0tCTvsYGY9Kh23RF",
                subscription_plan="VOLUME_BASED_PAYMENT",
                subscription_created_at=datetime.now(timezone.utc),
                subscription_updated_at=datetime.now(timezone.utc),
                subscription_expires_at=datetime.now(timezone.utc) + timedelta(days=365),
            ),
        ]
        db.add_all(users)
        db.flush()

        # Assign roles and groups
        admin_user = db.query(User).filter_by(username="admin").first()
        john_user = db.query(User).filter_by(username="john_doe").first()
        jane_user = db.query(User).filter_by(username="jane_doe").first()

        # Assign roles
        admin_user.roles.append(admin_role)
        john_user.roles.append(user_role)
        jane_user.roles.append(user_role)

        # Assign groups
        admin_user.groups.extend([dev_group, test_group])
        john_user.groups.append(dev_group)
        jane_user.groups.append(test_group)
        db.commit()

    except Exception as e:
        print(f"Error seeding database: {e}")


def seed_database():
    db = SessionLocal()
    try:
        seed_users(db)
        # seed_user_videos(db)
        db.commit()
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()



def apply_promotion_codes_with_text(engine, text, count):
    """Apply promotion codes to the database with text"""
    print("Applying promotion codes to the database with text")
    print(f"Engine passed to function URL: {engine.url}")
    print(f"Text: {text}")
    print(f"Count: {count}")
    db = SessionLocal()

    promotion_codes = [PromotionCode(
        id=str(uuid.uuid4()),
        code=f"{text.upper()}{i}",
        level=1,
        video_allowance_in_seconds=1 * 60 * 60,  # 1 hour
        video_upload_size_allowance_in_mb=300,  # 300 MB
        video_count_allowance=30,  # 1 video
    ) for i in range(count)]
    db.add_all(promotion_codes)
    db.commit()
    for code in promotion_codes:
        db.refresh(code)
    print(f"Saved {len(promotion_codes)} promotion codes to the database")
    db.close()

def apply_promotion_codes(engine):
    """Apply promotion codes to the database"""
    print("Applying promotion codes to the database")
    print(f"Engine passed to function URL: {engine.url}")
    db = SessionLocal()
    print(f"SessionLocal engine URL: {db.bind.url}")

    BASE_VIDEO_ALLOWANCE_SECONDS = 1 * 60 * 60  # 1 hour
    BASE_UPLOAD_ALLOWANCE_MB = 100
    BASE_COUNT_ALLOWANCE = 10

    def leve1_promotion_code_generation() -> PromotionCode:
        base_code = str(uuid.uuid4())[:8].upper()
        return PromotionCode(
            id=str(uuid.uuid4()),
            code=f"{base_code}1",
            level=1,
            video_allowance_in_seconds=BASE_VIDEO_ALLOWANCE_SECONDS,
            video_upload_size_allowance_in_mb=BASE_UPLOAD_ALLOWANCE_MB,
            video_count_allowance=BASE_COUNT_ALLOWANCE,
        )

    def leve2_promotion_code_generation() -> PromotionCode:
        base_code = str(uuid.uuid4())[:8].upper()
        return PromotionCode(
            id=str(uuid.uuid4()),
            code=f"{base_code}2",
            level=2,
            video_allowance_in_seconds=BASE_VIDEO_ALLOWANCE_SECONDS * 2,
            video_upload_size_allowance_in_mb=BASE_UPLOAD_ALLOWANCE_MB * 2,
            video_count_allowance=BASE_COUNT_ALLOWANCE * 2,
        )

    def leve3_promotion_code_generation() -> PromotionCode:
        base_code = str(uuid.uuid4())[:8].upper()
        return PromotionCode(
            id=str(uuid.uuid4()),
            code=f"{base_code}3",
            level=3,
            video_allowance_in_seconds=BASE_VIDEO_ALLOWANCE_SECONDS * 3,
            video_upload_size_allowance_in_mb=BASE_UPLOAD_ALLOWANCE_MB * 3,
            video_count_allowance=BASE_COUNT_ALLOWANCE * 3,
        )

    def generate_promotion_codes_set() -> list[PromotionCode]:
        return [
            leve1_promotion_code_generation(),
            leve2_promotion_code_generation(),
            leve3_promotion_code_generation(),
        ]

    def generate_n_promotion_codes_sets(count: int) -> list[PromotionCode]:
        codes = []
        for _ in range(count):
            codes.extend(generate_promotion_codes_set())
        return codes

    def save_promotion_codes(promotion_codes: list[PromotionCode]):
        db.add_all(promotion_codes)
        db.commit()
        for code in promotion_codes:
            db.refresh(code)
        return promotion_codes

    try:
        # Generate and save 10 sets of promotion codes (levels 1, 2, and 3 for each set)
        generated_codes = generate_n_promotion_codes_sets(10)
        save_promotion_codes(generated_codes)
        print(f"Saved {len(generated_codes)} promotion codes to the database")
        
    except Exception as e:
        print(f"Error applying promotion codes: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
