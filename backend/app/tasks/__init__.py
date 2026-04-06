from app.tasks.celery_app import celery_app
from app.tasks.face_indexing import index_event_photos

__all__ = ["celery_app", "index_event_photos"]
