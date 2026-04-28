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


@celery_app.task(bind=True, name="index_single_photo", queue="ai_processing", max_retries=3)
def index_single_photo(self, photo_id: str, event_id: str, img_key: str):
    """Celery task: index a single photo using Buffalo_L on the GPU queue."""
    import asyncpg
    import asyncio
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
    from sqlalchemy import update
    from app.models.photo import Photo
    from app.database import Base
    
    async def run():
        engine = create_async_engine(settings.DATABASE_URL, echo=False)
        Session = async_sessionmaker(engine, expire_on_commit=False)
        
        try:
            if settings.USE_LOCAL_STORAGE:
                img_path = str(Path(settings.LOCAL_STORAGE_PATH) / img_key)
            else:
                import boto3
                s3 = boto3.client("s3", aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                                 aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                                 region_name=settings.AWS_REGION)
                with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                    s3.download_fileobj(settings.AWS_S3_BUCKET, img_key, tmp)
                    img_path = tmp.name

            # Extract faces (running on GPU if available)
            results = face_engine.extract_all_embeddings(img_path)
            faces_count = len(results)
            
            if faces_count > 0:
                logger.info(f"✅ Photo {photo_id}: Found {faces_count} faces.")
            else:
                logger.warning(f"⚠️ Photo {photo_id}: No faces detected.")
                
            has_crops = False
            # Generate crops from the thumbnail
            if faces_count > 0:
                try:
                    from PIL import Image
                    with Image.open(img_path) as im:
                        w, h = im.size
                        min_x = min(f.get("bbox", [w//2, h//2, w//2, h//2])[0] for f in results)
                        max_x = max(f.get("bbox", [w//2, h//2, w//2, h//2])[2] for f in results)
                        min_y = min(f.get("bbox", [w//2, h//2, w//2, h//2])[1] for f in results)
                        max_y = max(f.get("bbox", [w//2, h//2, w//2, h//2])[3] for f in results)
                        
                        fx = (min_x + max_x) // 2
                        fy = (min_y + max_y) // 2
                        
                        crops_dir = Path(settings.LOCAL_STORAGE_PATH) / "crops"
                        crops_dir.mkdir(parents=True, exist_ok=True)
                        
                        size = min(w, h)
                        left = max(0, min(fx - size // 2, w - size))
                        top = max(0, min(fy - size // 2, h - size))
                        im.crop((left, top, left + size, top + size)).convert("RGB").save(crops_dir / f"{photo_id}_1x1.jpg", quality=90)
                        
                        sw = int(h * (9/16))
                        if sw > w:
                            sw = w
                            sh = int(w * (16/9))
                        else:
                            sh = h
                        
                        left = max(0, min(fx - sw // 2, w - sw))
                        top = max(0, min(fy - sh // 2, h - sh))
                        im.crop((left, top, left + sw, top + sh)).convert("RGB").save(crops_dir / f"{photo_id}_9x16.jpg", quality=90)
                        has_crops = True
                except Exception as crop_err:
                    logger.error(f"⚠️ Error generating crops for {photo_id}: {crop_err}")

            async with Session() as session:
                from app.models.face_index import FaceIndex
                for face in results:
                    fi = FaceIndex(
                        id=uuid.uuid4(),
                        photo_id=uuid.UUID(photo_id),
                        event_id=uuid.UUID(event_id),
                        embedding=face["embedding"],
                        metadata_json={"bbox": face.get("bbox", [])}
                    )
                    session.add(fi)

                await session.execute(
                    update(Photo).where(Photo.id == uuid.UUID(photo_id)).values(
                        face_indexed=True,
                        face_embeddings={"faces": results},
                        faces_count=faces_count,
                        has_social_crops=has_crops
                    )
                )
                await session.commit()
                
        except Exception as e:
            logger.error(f"❌ Error indexing single photo {photo_id}: {str(e)}")
            raise
        finally:
            await engine.dispose()

    asyncio.run(run())
    return {"status": "complete", "photo_id": photo_id}


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
                    Photo.event_id == uuid.UUID(event_id),
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
                        # AI Smart-Crop Logic
                        if faces_count > 0:
                            try:
                                from PIL import Image
                                with Image.open(img_path) as im:
                                    w, h = im.size
                                    
                                    # Group-Aware Smart-Crop: Calculate bounding box for ALL faces
                                    # Buffalo_L uses 'bbox' = [x1, y1, x2, y2]
                                    min_x = min(f.get("bbox", [w//2, h//2, w//2, h//2])[0] for f in results)
                                    max_x = max(f.get("bbox", [w//2, h//2, w//2, h//2])[2] for f in results)
                                    min_y = min(f.get("bbox", [w//2, h//2, w//2, h//2])[1] for f in results)
                                    max_y = max(f.get("bbox", [w//2, h//2, w//2, h//2])[3] for f in results)
                                    
                                    # Midpoint of the entire group
                                    fx = (min_x + max_x) // 2
                                    fy = (min_y + max_y) // 2
                                    
                                    # Adaptive Margin: expand group area slightly
                                    gw = max_x - min_x
                                    gh = max_y - min_y
                                    
                                    crops_dir = Path(settings.LOCAL_STORAGE_PATH) / "crops"
                                    crops_dir.mkdir(parents=True, exist_ok=True)
                                    
                                    # 1:1 Square Crop
                                    size = min(w, h)
                                    # If group is large, ensure we don't crop into them
                                    left = max(0, min(fx - size // 2, w - size))
                                    top = max(0, min(fy - size // 2, h - size))
                                    im.crop((left, top, left + size, top + size)).convert("RGB").save(crops_dir / f"{photo.id}_1x1.jpg", quality=90)
                                    
                                    # 9:16 Story Crop (Vertical)
                                    sw = int(h * (9/16))
                                    if sw > w:
                                        sw = w
                                        sh = int(w * (16/9))
                                    else:
                                        sh = h
                                    
                                    # Centering logic with group preference
                                    left = max(0, min(fx - sw // 2, w - sw))
                                    top = max(0, min(fy - sh // 2, h - sh))
                                    im.crop((left, top, left + sw, top + sh)).convert("RGB").save(crops_dir / f"{photo.id}_9x16.jpg", quality=90)
                                    
                                    logger.info(f"✨ Smart-Crops generated for photo {photo.id}")
                            except Exception as crop_err:
                                logger.error(f"⚠️ Error generating crops for {photo.id}: {crop_err}")

                        # 2. Add to pgvector Index
                        from app.models.face_index import FaceIndex
                        for face in results:
                            fi = FaceIndex(
                                id=uuid.uuid4(),
                                photo_id=photo.id,
                                event_id=photo.event_id,
                                embedding=face["embedding"],
                                metadata_json={"bbox": face.get("bbox", [])}
                            )
                            session.add(fi)

                        unique_faces += faces_count
                        has_crops = faces_count > 0

                        # 3. Update Photo indexed status
                        await session.execute(
                            update(Photo).where(Photo.id == photo.id).values(
                                face_indexed=True,
                                face_embeddings={"faces": results},
                                faces_count=faces_count,
                                has_social_crops=has_crops
                            )
                        )

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

            # ── Phase 2: DBSCAN Clustering ────────────────────────────
            # Group all indexed faces into person-identity clusters.
            # This makes selfie matching O(clusters) instead of O(faces).
            logger.info(f"🔵 Phase 2: Clustering faces for event {event_id}...")
            await store_task_status(event_id, {
                "status": "clustering",
                "processed": processed,
                "total": total,
                "unique_faces": unique_faces,
            })

            from app.models.face_index import FaceIndex
            from app.models.face_cluster import FaceCluster
            from sqlalchemy import delete as sa_delete

            fi_result = await session.execute(
                select(FaceIndex).where(FaceIndex.event_id == uuid.UUID(event_id))
            )
            all_face_indices = fi_result.scalars().all()

            face_data = [
                {"photo_id": str(fi.photo_id), "embedding": list(fi.embedding)}
                for fi in all_face_indices
            ]

            clusters = face_engine.cluster_event_faces(face_data)

            # Delete old clusters for this event
            await session.execute(
                sa_delete(FaceCluster).where(FaceCluster.event_id == uuid.UUID(event_id))
            )

            for c in clusters:
                fc = FaceCluster(
                    id=uuid.uuid4(),
                    event_id=uuid.UUID(event_id),
                    cluster_label=c["cluster_label"],
                    centroid=c["centroid"],
                    photo_ids=c["photo_ids"],
                    face_count=c["face_count"],
                )
                session.add(fc)

            await session.commit()
            logger.info(f"✅ Clustering done: {len(clusters)} clusters saved for event {event_id}.")

            await store_task_status(event_id, {
                "status": "complete",
                "processed": processed,
                "total": total,
                "unique_faces": unique_faces,
                "clusters": len(clusters),
            })

        await engine.dispose()

    asyncio.run(run())
    return {"status": "complete", "event_id": event_id}
