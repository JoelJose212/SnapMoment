import uuid
from sqlalchemy import Column, Integer, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from pgvector.sqlalchemy import Vector
from app.database import Base


class FaceCluster(Base):
    """
    Stores a DBSCAN-computed person-cluster for an event.
    Each row = one distinct person found across all event photos.
    The centroid is the average of all face embeddings belonging to this cluster.
    """
    __tablename__ = "face_clusters"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    event_id: Mapped[uuid.UUID] = mapped_column(index=True)

    # DBSCAN cluster label (0, 1, 2, ... ; -1 = noise/outlier face, stored separately)
    cluster_label: Mapped[int] = mapped_column(Integer, index=True)

    # Mean of all embeddings in this cluster — used as the fast comparison point
    centroid: Mapped[list] = mapped_column(Vector(512))

    # All photo IDs that contain at least one face belonging to this cluster
    photo_ids: Mapped[list] = mapped_column(JSON, default=list)

    # Number of face detections that belong to this cluster
    face_count: Mapped[int] = mapped_column(Integer, default=0)
