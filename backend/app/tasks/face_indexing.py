import asyncio
import logging
import tempfile
import os
from pathlib import Path
from app.tasks.celery_app import celery_app
from app.services import face_engine
from app.services.redis_service import store_task_status
from app.config import settings

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="index_event_photos")
def index_event_photos(self, event_id: str):
    """Celery task: index all un-indexed photos in an event using DeepFace ArcFace."""
    import asyncpg
    import asyncio
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
    from sqlalchemy import select, update
    from app.models.photo import Photo
    from app.database import Base
    import json

    async def run():
        engine = create_async_engine(settings.DATABASE_URL, echo=False)
        Session = async_sessionmaker(engine, expire_on_commit=False)

        async with Session() as session:
            result = await session.execute(
                select(Photo).where(
                    Photo.event_id == event_id,
                    Photo.face_indexed == False
                )
            )
            photos = result.scalars().all()
            total = len(photos)
            processed = 0
            unique_faces = 0

            # Update task started status
            await store_task_status(event_id, {
                "status": "processing",
                "processed": 0,
                "total": total,
                "unique_faces": 0,
            })

            for photo in photos:
                try:
                    # Get image path
                    if settings.USE_LOCAL_STORAGE:
                        img_path = str(Path(settings.LOCAL_STORAGE_PATH) / photo.s3_key)
                    else:
                        # Download from S3 to temp file
                        import boto3, io
                        s3 = boto3.client("s3", aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                                         aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                                         region_name=settings.AWS_REGION)
                        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                            s3.download_fileobj(settings.AWS_S3_BUCKET, photo.s3_key, tmp)
                            img_path = tmp.name

                    embeddings = face_engine.extract_all_embeddings(img_path)
                    faces_count = len(embeddings)
                    unique_faces += faces_count

                    await session.execute(
                        update(Photo).where(Photo.id == photo.id).values(
                            face_indexed=True,
                            face_embeddings={"faces": embeddings},
                            faces_count=faces_count,
                        )
                    )
                    await session.commit()
                except Exception as e:
                    logger.error(f"Error indexing photo {photo.id}: {e}")

                processed += 1
                await store_task_status(event_id, {
                    "status": "processing",
                    "processed": processed,
                    "total": total,
                    "unique_faces": unique_faces,
                })

            await store_task_status(event_id, {
                "status": "complete",
                "processed": processed,
                "total": total,
                "unique_faces": unique_faces,
            })
        await engine.dispose()

    asyncio.run(run())
    return {"status": "complete", "event_id": event_id}
