from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import json
from clippercmd.model.short_config_model import KlippersShortsConfig

load_dotenv()



class Settings(BaseSettings):
    WEBAPP_API_HOST: str = "localhost"
    WEBAPP_API_PORT: int = 22081
    WEBAPP_API_HOST_FARGATE: str = "klippers.ai"
    WEBAPP_API_PORT_FARGATE: int = 80
    FARGATE_TOKEN: str = "fargate-token"
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    DATABASE_URL: str
    GMAIL_EMAIL: str
    GMAIL_APP_PASSWORD: str
    EMAIL_INTERVAL_SECONDS: int
    EMAIL_SENDER_NAME: str
    EMAIL_SENDER_EMAIL: str
    SIGNING_CALLBACK_URL: str
    STRIPE_SECRET_KEY: str
    STRIPE_DEFAULT_CURRENCY: str
    STRIPE_PAY_AS_YOU_GO_PRODUCT_ID: str
    STRIPE_METERED_PRODUCT_ID: str
    STRIPE_MONTHLY_PRODUCT_ID: str
    STRIPE_PAY_AS_YOU_GO_PRICE: int
    SIGNING_CALLBACK_URL_SIGNED_PDF_VIEW: str
    ACTIVATE_EMAIL_SENDING: bool = True
    ACTIVATE_STRIPE_METERING: bool = True
    ACTIVATE_SIGNING_PDF: bool = True
    ACTIVATE_PSQL_BACKUP: bool = False
    DB_BACKUP_CONTAINER_NAME: str
    DB_BACKUP_DB_NAME: str
    DB_BACKUP_DB_USER: str
    DB_BACKUP_DIR: str
    DB_BACKUP_DATE_FORMAT: str
    DB_BACKUP_FILE: str
    DB_BACKUP_DAYS_TO_KEEP: int
    DB_BACKUP_S3_BUCKET_NAME: str

    VIDEO_WAREHOUSE_S3_BUCKET_NAME: str
    VIDEO_WAREHOUSE_ROOT_DIR: str
    BACKEND_WORKING_DIR: str
    SEGMENT_COUNT: int
    OPENAI_API_KEY: str
    RUN_KLIPPERSCMD_ON: str = "local"
    KLIPPERS_RUN_SCRIPT_FARGATE: str = "run_state_machine.prod.sh"
    KLIPPERS_RUN_SCRIPT: str
    KLIPPERS_CMD_CLIPPER_PY: str
    klippers_level1: str
    klippers_level2: str
    klippers_level3: str

    DEEPGRAM_API_KEY: str
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str
    USER_ID: str = ""
    VIDEO_ID: str = ""
    GOOGLE_CLIENT_ID: str = ""  # Google OAuth Client ID for frontend JS SDK
    FACEBOOK_APP_ID: str = ""
    FACEBOOK_APP_SECRET: str = ""


    REDIS_HOST: str
    REDIS_PORT: int = 26379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str
    REDIS_VIDEO_PROCESS_QUEUE_NAME: str = "video-process-queue"
    REDIS_VIDEO_PROCESS_QUEUE_EXPIRE: int = 60 * 60 * 24 * 10
    REDIS_VIDEO_PROCESS_QUEUE_MAX_LENGTH: int = 1000
    REDIS_VIDEO_PROCESS_QUEUE_MAX_LENGTH: int = 1000

    class Config:
        env_file = ".env"
        extra = "allow"

    def get_klippers_run_script(self) -> str:
        if self.RUN_KLIPPERSCMD_ON == "fargate":
            return self.KLIPPERS_RUN_SCRIPT_FARGATE
        else:
            return self.KLIPPERS_RUN_SCRIPT

    def get_webapi_host(self) -> str:
        if self.RUN_KLIPPERSCMD_ON == "fargate":
            return self.WEBAPP_API_HOST_FARGATE
        else:
            return self.WEBAPP_API_HOST

    def get_webapi_port(self) -> int:
        if self.RUN_KLIPPERSCMD_ON == "fargate":
            return self.WEBAPP_API_PORT_FARGATE
        else:
            return self.WEBAPP_API_PORT

    def get_webapi_url(self) -> str:
        if self.RUN_KLIPPERSCMD_ON == "fargate":
            return f"https://{self.get_webapi_host()}"
        else:
            return f"http://{self.get_webapi_host()}:{self.get_webapi_port()}"

settings = Settings()


def get_shorts_config() -> KlippersShortsConfig:
    if not hasattr(get_shorts_config, "shorts_config"):
        json_file_path = f"{settings.VIDEO_WAREHOUSE_ROOT_DIR}/{settings.USER_ID}/{settings.VIDEO_ID}/shorts_config.json"
        with open(json_file_path, 'r') as f:
            data = json.load(f)
        get_shorts_config.shorts_config = KlippersShortsConfig.model_validate(data)
    return get_shorts_config.shorts_config