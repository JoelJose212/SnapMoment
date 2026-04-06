import uuid
import io
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List
from app.database import get_db
from app.models.photo import Photo
from app.models.event import Event
from app.schemas import PhotoOut, ProcessStatusOut
from app.services.auth import require_photographer
from app.services import s3 as s3_service
from app.services.redis_service import get_task_status, store_task_status
from app.config import settings
from PIL import Image

router = APIRouter(prefix="/api/events", tags=["photos"])

THUMBNAIL_SIZE = (400, 400)


def _make_thumbnail(image_bytes: bytes) -> bytes:
    img = Image.open(io.BytesIO(image_bytes))
    img.thumbnail(THUMBNAIL_SIZE, Image.LANCZOS)
    out = io.BytesIO()
    img.save(out, format="JPEG", quality=75)
    return out.getvalue()


@router.post("/{event_id}/photos")
async def upload_photos(
    event_id: str,
    files: List[UploadFile] = File(...),
    current_user: dict = Depends(require_photographer),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Event).where(Event.id == uuid.UUID(event_id)))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    uploaded = []
    for file in files:
        file_bytes = await file.read()
        ext = file.filename.split(".")[-1].lower() if "." in file.filename else "jpg"

        # Upload original
        key = s3_service.generate_key(f"events/{event_id}/photos", ext)
        url = await s3_service.upload_file(file_bytes, key)

        # Thumbnail
        try:
            thumb_bytes = _make_thumbnail(file_bytes)
            thumb_key = s3_service.generate_key(f"events/{event_id}/thumbs", "jpg")
            thumb_url = await s3_service.upload_file(thumb_bytes, thumb_key)
        except Exception:
            thumb_url = url

        photo = Photo(
            id=uuid.uuid4(),
            event_id=uuid.UUID(event_id),
            s3_key=key,
            s3_url=url,
            thumbnail_url=thumb_url,
            face_indexed=False,
            faces_count=0,
        )
        db.add(photo)
        uploaded.append(photo)

    await db.commit()
    return {"uploaded": len(uploaded), "photos": [str(p.id) for p in uploaded]}


@router.get("/{event_id}/photos", response_model=list[PhotoOut])
async def list_photos(event_id: str, current_user: dict = Depends(require_photographer), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Photo).where(Photo.event_id == uuid.UUID(event_id)).order_by(Photo.uploaded_at.desc()))
    return result.scalars().all()


@router.delete("/{event_id}/photos/{photo_id}")
async def delete_photo(event_id: str, photo_id: str, current_user: dict = Depends(require_photographer), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Photo).where(Photo.id == uuid.UUID(photo_id), Photo.event_id == uuid.UUID(event_id)))
    photo = result.scalar_one_or_none()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    try:
        await s3_service.delete_file(photo.s3_key)
    except Exception:
        pass

    await db.delete(photo)
    await db.commit()
    return {"message": "Photo deleted"}


@router.delete("/{event_id}/photos")
async def delete_all_photos(event_id: str, current_user: dict = Depends(require_photographer), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Photo).where(Photo.event_id == uuid.UUID(event_id)))
    photos = result.scalars().all()
    for photo in photos:
        try:
            await s3_service.delete_file(photo.s3_key)
        except Exception:
            pass
    await db.execute(delete(Photo).where(Photo.event_id == uuid.UUID(event_id)))
    await db.commit()
    return {"message": f"Deleted {len(photos)} photos"}


@router.post("/{event_id}/process")
async def process_photos(event_id: str, current_user: dict = Depends(require_photographer)):
    from app.tasks.face_indexing import index_event_photos
    await store_task_status(event_id, {"status": "queued", "processed": 0, "total": 0, "unique_faces": 0})
    index_event_photos.delay(event_id)
    return {"message": "Processing started", "event_id": event_id}


@router.get("/{event_id}/process/status", response_model=ProcessStatusOut)
async def get_process_status(event_id: str, current_user: dict = Depends(require_photographer)):
    status = await get_task_status(event_id)
    if not status:
        return ProcessStatusOut(status="idle", processed=0, total=0, unique_faces=0)
    return ProcessStatusOut(**status)
