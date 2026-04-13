from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://snapmoment:snapmoment123@localhost:5432/snapmoment"
    REDIS_URL: str = "redis://localhost:6379/0"

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 24

    USE_LOCAL_STORAGE: bool = True
    LOCAL_STORAGE_PATH: str = "/app/uploads"
    LOCAL_STORAGE_BASE_URL: str = "http://localhost:8000/uploads"
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_S3_BUCKET: str = "snapmoment-photos"
    AWS_REGION: str = "ap-south-1"

    MSG91_AUTH_KEY: Optional[str] = None
    DEV_MODE: bool = True

    S3_PUBLIC_DOMAIN: str = ""

    # STRIPE
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_PUBLIC_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None

    ADMIN_EMAIL: str = "admin@snapmoment.app"
    ADMIN_PASSWORD: str

    # SMTP Settings (Gmail)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASS: Optional[str] = None

    FRONTEND_URL: str = "http://localhost:3000"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
