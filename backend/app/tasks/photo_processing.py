import logging
import os
import uuid
from pathlib import Path
from PIL import Image, ImageOps

# Optional imports handled gracefully to allow workers without them to boot
try:
    import rawpy
except ImportError:
    rawpy = None

from app.tasks.celery_app import celery_app
from app.config import settings

logger = logging.getLogger(__name__)

THUMBNAIL_SIZE = (1080, 1080)  # High-Res Thumbnail for AI & Guest Gallery
HIGH_RES_MAX = (3600, 3600) # Full High-Res delivery JPG

def _process_image_to_high_res_and_thumb(image_path: str, is_raw: bool):
    """
    Process image (RAW or JPG) into a high-res delivery JPG and a fast thumbnail.
    Returns (high_res_bytes, thumbnail_bytes)
    """
    import io

    if is_raw and rawpy:
        with rawpy.imread(image_path) as raw:
            # For RAW, we use half_size=True to make processing 400% faster
            # while still delivering a high-quality 6-12 megapixel image.
            rgb_half = raw.postprocess(
                use_camera_wb=True,
                half_size=True,
                no_auto_bright=False,
                output_bps=8,
                demosaic_algorithm=rawpy.DemosaicAlgorithm.LINEAR,
            )
        img = Image.fromarray(rgb_half)
    else:
        # Load standard image
        img = Image.open(image_path)
    
    img = ImageOps.exif_transpose(img) # Fix rotation
    
    # 1. Generate High-Res Delivery image
    high_res_img = img.copy()
    high_res_img.thumbnail(HIGH_RES_MAX, Image.LANCZOS)
    
    high_res_io = io.BytesIO()
    high_res_img.save(high_res_io, format="JPEG", quality=85, optimize=True, progressive=True)
    high_res_bytes = high_res_io.getvalue()
    
    # 2. Generate Thumbnail for AI and Guest Gallery
    thumb_img = high_res_img.copy()
    thumb_img.thumbnail(THUMBNAIL_SIZE, Image.LANCZOS)
    
    thumb_io = io.BytesIO()
    thumb_img.save(thumb_io, format="JPEG", quality=75, optimize=True)
    thumb_bytes = thumb_io.getvalue()
    
    return high_res_bytes, thumb_bytes

@celery_app.task(bind=True, name="process_single_photo", queue="image_processing", max_retries=3)
def process_single_photo(self, photo_id: str, event_id: str, original_file_path: str, filename: str):
    """
    Standardize the uploaded photo. Runs on the CPU-bound 'image_processing' queue.
    """
    import asyncio
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
    from sqlalchemy import update
    from app.models.photo import Photo
    from app.services import s3 as s3_service
    
    async def run():
        logger.info(f"Processing photo {photo_id} (Event: {event_id})")
        
        try:
            ext = filename.lower().split('.')[-1]
            is_raw = ext in ['cr2', 'nef', 'arw', 'dng', 'raw']
            
            # 1. Process Image
            high_res_bytes, thumb_bytes = _process_image_to_high_res_and_thumb(original_file_path, is_raw)
            
            # 2. Upload High-Res and Thumb
            high_res_key = s3_service.generate_key(f"events/{event_id}/photos", "jpg")
            thumb_key = s3_service.generate_key(f"events/{event_id}/thumbs", "jpg")
            
            high_res_url = await s3_service.upload_file(high_res_bytes, high_res_key)
            thumb_url = await s3_service.upload_file(thumb_bytes, thumb_key)
            
            # 3. Update DB
            engine = create_async_engine(settings.DATABASE_URL, echo=False)
            SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
            
            async with SessionLocal() as session:
                await session.execute(
                    update(Photo)
                    .where(Photo.id == uuid.UUID(photo_id))
                    .values(
                        s3_key=high_res_key,
                        s3_url=high_res_url,
                        thumbnail_url=thumb_url,
                        status="ready"
                    )
                )
                await session.commit()
            
            await engine.dispose()
            
            # 4. Trigger AI Indexing on the Thumbnail
            # Ensure the thumbnail path is accessible if using local storage
            if settings.USE_LOCAL_STORAGE:
                ai_img_path = str(Path(settings.LOCAL_STORAGE_PATH) / thumb_key)
            else:
                # We'll let the AI task download it from the URL/Key
                ai_img_path = thumb_key
            
            from app.tasks.face_indexing import index_single_photo
            index_single_photo.delay(photo_id, event_id, ai_img_path)
            
            logger.info(f"✅ Photo {photo_id} processed successfully. AI task dispatched.")
            
            # Optional: Cleanup original local file if it was FTP ingest
            try:
                if os.path.exists(original_file_path) and "ftp_ingest" in original_file_path:
                    pass # We leave it for now, or delete if we don't want to keep RAWs locally forever
            except:
                pass
            
            return {"status": "success", "photo_id": photo_id}
            
        except Exception as e:
            logger.error(f"❌ Error processing photo {photo_id}: {e}")
            raise

    asyncio.run(run())
