import numpy as np
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def cosine_distance(a: list, b: list) -> float:
    va = np.array(a, dtype=np.float32)
    vb = np.array(b, dtype=np.float32)
    dot = np.dot(va, vb)
    norm = np.linalg.norm(va) * np.linalg.norm(vb)
    if norm == 0:
        return 1.0
    return float(1.0 - dot / norm)


def extract_embedding(image_path: str) -> list:
    """
    Extract ArcFace embedding from a single-face image (selfie).
    Raises ValueError if no face detected.
    """
    try:
        from deepface import DeepFace
        results = DeepFace.represent(
            img_path=image_path,
            model_name="ArcFace",
            detector_backend="retinaface",
            enforce_detection=False,
        )
        if not results:
            raise ValueError("No face detected")
        return results[0]["embedding"]
    except Exception as e:
        logger.error(f"extract_embedding error: {e}")
        if "Face could not be detected" in str(e) or "No face" in str(e):
            raise ValueError("No face detected in the image")
        raise ValueError(str(e))


def extract_all_embeddings(image_path: str) -> list:
    """
    Extract ArcFace embeddings for ALL faces in a group photo.
    Returns list of {embedding, bbox, confidence} dicts.
    """
    try:
        from deepface import DeepFace
        results = DeepFace.represent(
            img_path=image_path,
            model_name="ArcFace",
            detector_backend="retinaface",
            enforce_detection=False,
        )
        output = []
        for r in results:
            output.append({
                "embedding": r["embedding"],
                "bbox": r.get("facial_area", {}),
                "confidence": r.get("face_confidence", 1.0),
            })
        return output
    except Exception as e:
        logger.error(f"extract_all_embeddings error: {e}")
        return []


def match_selfie_to_event(selfie_embedding: list, event_photos: list) -> list:
    """
    Match selfie embedding against stored face embeddings from event photos.
    event_photos: list of {"photo_id", "embeddings": [{embedding, bbox}]}
    Returns list of matches sorted by confidence descending.
    """
    THRESHOLD = 0.68
    matches = []

    for photo in event_photos:
        photo_id = photo["photo_id"]
        embeddings = photo.get("embeddings", [])
        best_distance = 1.0

        for face in embeddings:
            emb = face.get("embedding", [])
            if not emb:
                continue
            dist = cosine_distance(selfie_embedding, emb)
            if dist < best_distance:
                best_distance = dist

        if best_distance < THRESHOLD:
            confidence_score = max(0.0, (1.0 - best_distance / 0.6) * 100)
            matches.append({
                "photo_id": photo_id,
                "distance": best_distance,
                "confidence_score": round(confidence_score, 2),
            })

    matches.sort(key=lambda x: x["confidence_score"], reverse=True)
    return matches
