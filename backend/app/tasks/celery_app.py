from celery import Celery
from app.config import settings

celery_app = Celery(
    "snapmoment",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_routes={
        'app.tasks.photo_processing.process_single_photo': {'queue': 'image_processing'},
        'app.tasks.face_indexing.index_event_photos': {'queue': 'ai_processing'},
        'app.tasks.face_indexing.index_faces': {'queue': 'ai_processing'},
    },
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    worker_max_tasks_per_child=100,
)

celery_app.autodiscover_tasks(["app.tasks"])
