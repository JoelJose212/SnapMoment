import uuid
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

            # Batch size for processing (with an RTX 4090, we can do larger batches)
            BATCH_SIZE = 5
            
            for i in range(0, total, BATCH_SIZE):
                batch_photos = photos[i : i + BATCH_SIZE]
                
                for photo in batch_photos:
                    try:
                        # Get image path
                        if settings.USE_LOCAL_STORAGE:
                            img_path = str(Path(settings.LOCAL_STORAGE_PATH) / photo.s3_key)
                        else:
                            import boto3
                            s3 = boto3.client("s3", aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                                             aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                                             region_name=settings.AWS_REGION)
                            with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                                s3.download_fileobj(settings.AWS_S3_BUCKET, photo.s3_key, tmp)
                                img_path = tmp.name

                        # Extract faces
                        results = face_engine.extract_all_embeddings(img_path)
                        faces_count = len(results)
                        
                        if faces_count > 0:
                            logger.info(f"✅ Photo {photo.id}: Found {faces_count} faces.")
                        else:
                            logger.warning(f"⚠️ Photo {photo.id}: No faces detected.")

                        # 1. Update Photo indexed status
                        await session.execute(
                            update(Photo).where(Photo.id == photo.id).values(
                                face_indexed=True,
                                face_embeddings={"faces": results},
                                faces_count=faces_count,
                            )
                        )
                        
                        # 2. Add to pgvector Index
                        from app.models.face_index import FaceIndex
                        for face in results:
                            fi = FaceIndex(
                                id=uuid.uuid4(),
                                photo_id=photo.id,
                                event_id=photo.event_id,
                                embedding=face["embedding"],
                                metadata_json={"bbox": face.get("facial_area", {})}
                            )
                            session.add(fi)

                        unique_faces += faces_count

                    except Exception as e:
                        logger.error(f"❌ Error indexing photo {photo.id}: {str(e)}")

                    processed += 1
                
                # Commit batch
                await session.commit()
                
                # Update status after each batch
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
