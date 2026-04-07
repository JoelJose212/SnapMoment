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
    Handles low-quality/laptop camera captures via multi-stage RetinaFace fallback.
    """
    from deepface import DeepFace
    
    # 1. Try RetinaFace with strict detection and alignment (Best)
    try:
        results = DeepFace.represent(
            img_path=image_path,
            model_name="ArcFace",
            detector_backend="retinaface",
            enforce_detection=True,
            align=True,
        )
        if results and len(results) > 0:
            return results[0].get("embedding", [])
    except Exception:
        pass
        
    # 2. Try RetinaFace without alignment (More resilient to blur)
    try:
        results = DeepFace.represent(
            img_path=image_path,
            model_name="ArcFace",
            detector_backend="retinaface",
            enforce_detection=False,
            align=False,
        )
        if results and len(results) > 0:
            logger.info("🚀 AI Engine: Face detected using RetinaFace (Resilient mode).")
            return results[0].get("embedding", [])
    except Exception:
        pass
            
    # 3. Final Alternative: Skip detection entirely (Bulletproof)
    # This uses the whole image to generate the ArcFace embedding.
    # It is the only way to handle extremely low-quality/blurry hardware.
    try:
        logger.warning("🚀 AI Engine: Face not clearly seen. Using deep-analysis on full frame.")
        results = DeepFace.represent(
            img_path=image_path,
            model_name="ArcFace",
            detector_backend="skip",
            align=False,
        )
        if results and len(results) > 0:
            return results[0].get("embedding", [])
    except Exception as e:
        logger.error(f"❌ AI Engine: All methods failed: {e}")
        raise ValueError("Could not analyze the photo. Please check your camera or ensure you are in the frame.")


def extract_all_embeddings(image_path: str) -> list:
    """
    Extract ArcFace embeddings for ALL faces in a group photo.
    Falls back to OpenCV if RetinaFace fails (common in server environments).
    """
    from deepface import DeepFace
    
    # 1. Try RetinaFace (Highest Quality)
    try:
        results = DeepFace.represent(
            img_path=image_path,
            model_name="ArcFace",
            detector_backend="retinaface",
            enforce_detection=False,
            align=True,
        )
        if results and len(results) > 0:
            return results
    except Exception as e:
        logger.warning(f"🚀 AI Engine: RetinaFace failed on group photo: {e}")

    # 2. Try OpenCV (Fastest & Most Resilient fallback)
    try:
        logger.info("🚀 AI Engine: Using OpenCV fallback for group photo indexing.")
        results = DeepFace.represent(
            img_path=image_path,
            model_name="ArcFace",
            detector_backend="opencv",
            enforce_detection=False,
            align=True,
        )
        return results
    except Exception as e:
        logger.error(f"❌ AI Engine: All detectors failed for group photo: {e}")
        return []


def match_selfie_to_event(selfie_embedding: list, event_photos: list) -> list:
    """
    Match selfie embedding against stored face embeddings from event photos.
    event_photos: list of {"photo_id", "embeddings": [{embedding, bbox}]}
    Returns list of matches sorted by confidence descending.
    """
    if not event_photos:
        return []

    THRESHOLD = 0.65 # Optimized for ArcFace matching
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
        confidence_score = max(0.0, (1.0 - best_dist / 0.6) * 100)
        matches.append({
            "photo_id": pid,
            "distance": float(best_dist),
            "confidence_score": round(float(confidence_score), 2),
        })

    matches.sort(key=lambda x: x["confidence_score"], reverse=True)
    return matches
