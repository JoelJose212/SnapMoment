import uuid
from sqlalchemy import Column, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
from pgvector.sqlalchemy import Vector
from app.database import Base

class FaceIndex(Base):
    __tablename__ = "face_indices"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    photo_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("photos.id", ondelete="CASCADE"), index=True)
    event_id: Mapped[uuid.UUID] = mapped_column(index=True)
    
    # Store ArcFace embedding as a vector for high-speed indexing
    embedding: Mapped[list] = mapped_column(Vector(512))
    
    # Optional metadata (like bounding box)
    metadata_json: Mapped[dict] = mapped_column(JSON, nullable=True)
