import os
import uuid
import shutil
import aiofiles
from pathlib import Path
from typing import Optional
from app.config import settings


async def upload_file(file_bytes: bytes, key: str, content_type: str = "image/jpeg") -> str:
    """Upload file and return public URL."""
    if settings.USE_LOCAL_STORAGE:
        return await _local_upload(file_bytes, key)
    else:
        return await _s3_upload(file_bytes, key, content_type)


async def _local_upload(file_bytes: bytes, key: str) -> str:
    dest = Path(settings.LOCAL_STORAGE_PATH) / key
    dest.parent.mkdir(parents=True, exist_ok=True)
    async with aiofiles.open(dest, "wb") as f:
        await f.write(file_bytes)
    return f"{settings.LOCAL_STORAGE_BASE_URL}/{key}"


async def _s3_upload(file_bytes: bytes, key: str, content_type: str) -> str:
    import boto3
    s3 = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )
    import io
    s3.upload_fileobj(
        io.BytesIO(file_bytes),
        settings.AWS_S3_BUCKET,
        key,
        ExtraArgs={"ContentType": content_type, "ACL": "public-read"},
    )
    return f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"


async def delete_file(key: str) -> None:
    if settings.USE_LOCAL_STORAGE:
        path = Path(settings.LOCAL_STORAGE_PATH) / key
        if path.exists():
            path.unlink()
    else:
        import boto3
        s3 = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
        )
        s3.delete_object(Bucket=settings.AWS_S3_BUCKET, Key=key)


def get_signed_url(key: str, expiry_seconds: int = 7200) -> str:
    if settings.USE_LOCAL_STORAGE:
        return f"{settings.LOCAL_STORAGE_BASE_URL}/{key}"
    import boto3
    s3 = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.AWS_S3_BUCKET, "Key": key},
        ExpiresIn=expiry_seconds,
    )


def generate_key(prefix: str, extension: str = "jpg") -> str:
    return f"{prefix}/{uuid.uuid4()}.{extension}"
