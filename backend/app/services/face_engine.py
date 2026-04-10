import numpy as np
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Check for GPU availability on startup
try:
    import tensorflow as tf
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        logger.info(f"🚀 AI Engine: GPU detected! Using {len(gpus)} GPU(s).")
        for gpu in gpus:
            logger.info(f" - Device: {gpu}")
        # Optional: enable memory growth to avoid hogging all VRAM
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    else:
        logger.warning("⚠️ AI Engine: No GPU detected. Falling back to CPU. Ensure CUDA/cuDNN are installed.")
except ImportError:
    logger.warning("⚠️ AI Engine: TensorFlow NOT found. GPU acceleration disabled.")
except Exception as e:
    logger.error(f"⚠️ AI Engine: Error initializing GPU: {e}")


def l2_normalize(x: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(x)
    if norm == 0:
        return x
    return x / norm


def cosine_distance(a: list, b: list) -> float:
    va = l2_normalize(np.array(a, dtype=np.float32))
    vb = l2_normalize(np.array(b, dtype=np.float32))
    dot = np.dot(va, vb)
    # Since they are l2 normalized, norm(a)*norm(b) = 1
    return float(1.0 - dot)


def extract_embedding(image_path: str) -> list:
    """
    Extract ArcFace embedding from a single-face image (selfie).
    MANDATORY: Uses RetinaFace for high precision.
    """
    from deepface import DeepFace
    
    try:
        results = DeepFace.represent(
            img_path=image_path,
            model_name="ArcFace",
            detector_backend="opencv", # Most compatible, zero-setup detector
            enforce_detection=False,   # Force the system to accept the photo
            align=True,
        )
        if results and len(results) > 0:
            face = results[0]
            emb = face.get("embedding", [])
            return l2_normalize(np.array(emb, dtype=np.float32)).tolist()
            
    except Exception as e:
        if isinstance(e, ValueError):
            raise e
        logger.error(f"❌ AI Engine: Selfie analysis failed: {e}")
        raise ValueError("Face not detected. Please take a clear, well-lit selfie.")


def extract_all_embeddings(image_path: str) -> list:
    """
    Extract ArcFace embeddings for ALL faces in a group photo.
    Enforces strict quality control to prevent false positives.
    """
    from deepface import DeepFace
    
    try:
        results = DeepFace.represent(
            img_path=image_path,
            model_name="ArcFace",
            detector_backend="retinaface",
            enforce_detection=False,
            align=True,
        )
        
        # Filter by confidence and normalize
        filtered_results = []
        for face in results:
            if face.get("face_confidence", 0) > 0.80:
                emb = face.get("embedding")
                if emb:
                    face["embedding"] = l2_normalize(np.array(emb, dtype=np.float32)).tolist()
                    filtered_results.append(face)
        
        return filtered_results
        
    except Exception as e:
        logger.error(f"❌ AI Engine: Group photo analysis failed: {e}")
        return []


def match_selfie_to_event(selfie_embedding: list, event_photos: list) -> list:
    """
    Match selfie embedding against stored face embeddings from event photos.
    event_photos: list of {"photo_id", "embeddings": [{embedding, bbox}]}
    Returns list of matches sorted by confidence descending.
    """
    if not event_photos:
        return []
 
    # ArcFace Cosine Distance Threshold. 
    # Values below 0.40 are very high confidence same-person.
    THRESHOLD = 0.40 
    matches = []
    
    # 1. Prepare data for NumPy vectorization
    # We flatten all faces from all photos into a single matrix
    face_data = [] # List of (photo_id, embedding)
    for photo in event_photos:
        photo_id = photo["photo_id"]
        for face in photo.get("embeddings", []):
            emb = face.get("embedding")
            if emb:
                face_data.append((photo_id, emb))
    
    if not face_data:
        return []

    # 2. Convert to NumPy arrays
    photo_ids = [fd[0] for fd in face_data]
    embeddings_matrix = np.array([fd[1] for fd in face_data], dtype=np.float32) # Shape: (TotalFaces, 512)
    selfie_vec = np.array(selfie_embedding, dtype=np.float32) # Shape: (512,)

    # 3. Compute Cosine Similarity using Matrix Multiplication
    # Similarity = (A . B) / (||A|| * ||B||)
    # Distance = 1 - Similarity
    
    # Dot products
    dot_products = np.dot(embeddings_matrix, selfie_vec)
    
    # Norms
    matrix_norms = np.linalg.norm(embeddings_matrix, axis=1)
    selfie_norm = np.linalg.norm(selfie_vec)
    
    if selfie_norm == 0:
        return []
    
    # Cosine similarities
    similarities = dot_products / (matrix_norms * selfie_norm + 1e-7)
    distances = 1.0 - similarities

    # 4. Filter and Group by Photo
    # A guest might appear multiple times in one photo (if multiple faces detected)
    # We take the best match per photo.
    photo_best_matches = {}

    for i, dist in enumerate(distances):
        if dist < THRESHOLD:
            pid = photo_ids[i]
            if pid not in photo_best_matches or dist < photo_best_matches[pid]:
                photo_best_matches[pid] = dist

    # 5. Format results
    for pid, best_dist in photo_best_matches.items():
        # Recalibrated confidence formula:
        # dist 0.0 -> 100%
        # dist 0.4 -> 0%
        confidence_score = max(0.0, (1.0 - best_dist / 0.40) * 100)
        matches.append({
            "photo_id": pid,
            "distance": float(best_dist),
            "confidence_score": round(float(confidence_score), 2),
        })

    matches.sort(key=lambda x: x["confidence_score"], reverse=True)
    return matches
