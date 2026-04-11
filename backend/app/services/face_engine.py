import os
# Force DeepFace to use tf-keras (Keras 2 compatibility) instead of Keras 3.x
# Required for TF 2.16+ where Keras was split into a separate package.
os.environ.setdefault("TF_KERAS", "1")

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
    
    # Try high-accuracy retinaface first, fall back to opencv if it fails
    for detector in ["retinaface", "opencv"]:
        try:
            results = DeepFace.represent(
                img_path=image_path,
                model_name="ArcFace",
                detector_backend=detector,
                enforce_detection=True,  # Only accept a clearly detected face
                align=True,
            )
            if results and len(results) > 0:
                face = results[0]
                # Reject very low confidence detections
                if face.get("face_confidence", 1.0) < 0.75 and detector == "opencv":
                    raise ValueError("Face not detected clearly. Please take a well-lit, front-facing selfie.")
                emb = face.get("embedding", [])
                logger.info(f"✅ Selfie extracted with {detector} (confidence: {face.get('face_confidence', '?'):.2f})")
                return l2_normalize(np.array(emb, dtype=np.float32)).tolist()
        except ValueError:
            raise
        except Exception as e:
            logger.warning(f"⚠️ Selfie extraction failed with {detector}: {e}")
            if detector == "opencv":
                raise ValueError("Face not detected. Please take a clear, well-lit selfie.")
            # If retinaface failed, try opencv next iteration
            continue


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
    # 0.40 = Inclusive matching (Tiered: <0.34=Precise, 0.34-0.40=Suggested).
    # ArcFace paper recommends 0.25-0.35 for production hide precision.
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
        # Recalibrated confidence formula (normalized to 0.34 baseline):
        # dist 0.0  -> 100%
        # dist 0.34 -> 0%  (precision boundary)
        confidence_score = max(0.0, (1.0 - best_dist / 0.34) * 100)
        matches.append({
            "photo_id": pid,
            "distance": float(best_dist),
            "confidence_score": round(float(confidence_score), 2),
        })

    matches.sort(key=lambda x: x["confidence_score"], reverse=True)
    return matches


def cluster_event_faces(face_data: list) -> list:
    """
    Run DBSCAN clustering on all face embeddings from an event.
    Args:
        face_data: list of {"photo_id": str, "embedding": list[float]}
    Returns:
        list of clusters: [{"cluster_label": int, "centroid": list[float], "photo_ids": list, "face_count": int}]
        Noise points (label=-1) are excluded — they represent lone/unmatched faces.
    """
    from sklearn.cluster import DBSCAN

    if len(face_data) < 2:
        logger.info("Not enough faces for clustering (need >= 2). Skipping.")
        return []

    embeddings = np.array([fd["embedding"] for fd in face_data], dtype=np.float32)
    photo_ids  = [fd["photo_id"] for fd in face_data]

    # eps=0.40 matches our inclusive match threshold
    db = DBSCAN(eps=0.40, min_samples=2, metric="cosine", n_jobs=-1)
    labels = db.fit_predict(embeddings)

    clusters_dict: dict = {}
    for i, label in enumerate(labels):
        if label == -1:
            continue  # noise
        if label not in clusters_dict:
            clusters_dict[label] = {"embeddings": [], "photo_ids": set()}
        clusters_dict[label]["embeddings"].append(embeddings[i])
        clusters_dict[label]["photo_ids"].add(photo_ids[i])

    clusters = []
    for label, data in clusters_dict.items():
        emb_stack = np.array(data["embeddings"], dtype=np.float32)
        centroid = l2_normalize(emb_stack.mean(axis=0))
        clusters.append({
            "cluster_label": int(label),
            "centroid": centroid.tolist(),
            "photo_ids": list(data["photo_ids"]),
            "face_count": len(data["embeddings"]),
        })

    n_noise = int(np.sum(labels == -1))
    logger.info(f"Clustering complete: {len(clusters)} person-clusters, {n_noise} noise faces skipped.")
    return clusters


def match_selfie_to_clusters(selfie_embedding: list, clusters: list) -> list:
    """
    Fast O(k) centroid match — compare selfie to cluster centroids only.
    Args:
        selfie_embedding: 512-dim ArcFace embedding
        clusters: from cluster_event_faces()
    Returns:
        list of {"photo_ids": list, "distance": float, "confidence_score": float}
    """
    if not clusters:
        return []

    THRESHOLD = 0.40
    selfie_vec = l2_normalize(np.array(selfie_embedding, dtype=np.float32))
    centroids  = np.array([c["centroid"] for c in clusters], dtype=np.float32)

    dots     = np.dot(centroids, selfie_vec)
    c_norms  = np.linalg.norm(centroids, axis=1)
    s_norm   = np.linalg.norm(selfie_vec)
    if s_norm == 0:
        return []

    similarities = dots / (c_norms * s_norm + 1e-7)
    distances    = 1.0 - similarities

    matches = []
    for i, dist in enumerate(distances):
        if dist < THRESHOLD:
            confidence = max(0.0, (1.0 - dist / THRESHOLD) * 100)
            matches.append({
                "photo_ids":        clusters[i]["photo_ids"],
                "distance":         float(dist),
                "confidence_score": round(float(confidence), 2),
            })

    matches.sort(key=lambda x: x["confidence_score"], reverse=True)
    logger.info(f"Cluster match: {len(matches)} clusters matched.")
    return matches
