import os
import numpy as np
from typing import Optional, List, Dict, Any
import logging
import cv2
from insightface.app import FaceAnalysis

logger = logging.getLogger(__name__)

# Global singleton for the Face Engine
_engine = None

def get_engine():
    """
    Initialize and return the InsightFace Buffalo_L engine (Singleton).
    Uses SCRFD for detection and ResNet-100 for 512-point embeddings.
    """
    global _engine
    if _engine is None:
        try:
            # name='buffalo_l' includes:
            # - det_10g.onnx (SCRFD detector)
            # - w600k_r100.onnx (ArcFace ResNet-100 recognizer)
            # - plus gender/age/landmark models
            
            # Providers prioritize GPU (CUDA) then CPU
            providers = ['CUDAExecutionProvider', 'CPUExecutionProvider']
            
            _engine = FaceAnalysis(name='buffalo_l', providers=providers)
            
            # Context ID 0 refers to the first GPU. Set to -1 for CPU-only.
            ctx_id = 0 if 'CUDAExecutionProvider' in _engine.models['detection'].session.get_providers() else -1
            
            _engine.prepare(ctx_id=ctx_id, det_size=(640, 640))
            
            device = "GPU (CUDA)" if ctx_id == 0 else "CPU"
            logger.info(f"🚀 AI Engine: InsightFace Buffalo_L initialized on {device}")
        except Exception as e:
            logger.error(f"❌ AI Engine Initialization Failed: {e}")
            raise RuntimeError(f"Could not start AI Engine: {e}")
    return _engine

def l2_normalize(x: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(x)
    if norm == 0:
        return x
    return x / norm

def cosine_distance(a: list, b: list) -> float:
    va = l2_normalize(np.array(a, dtype=np.float32))
    vb = l2_normalize(np.array(b, dtype=np.float32))
    dot = np.dot(va, vb)
    return float(1.0 - dot)

def extract_embedding(image_path: str) -> list:
    """
    Extract a single 512-point embedding from a selfie.
    Uses Buffalo_L (ResNet-100) for maximum precision.
    """
    engine = get_engine()
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Could not read image file.")

    # Run detection and recognition
    faces = engine.get(img)
    
    if not faces:
        raise ValueError("No face detected. Please take a clear, well-lit, front-facing selfie.")

    # For a selfie, we take the largest face (highest detection score or largest bbox)
    # faces are already sorted by some criteria, but let's be explicit
    faces.sort(key=lambda x: (x.bbox[2]-x.bbox[0]) * (x.bbox[3]-x.bbox[1]), reverse=True)
    
    best_face = faces[0]
    if best_face.det_score < 0.60:
        raise ValueError("Face not detected clearly. Please ensure your face is well-lit and not covered.")

    # insightface.Face objects have 'normed_embedding' which is already L2 normalized
    embedding = best_face.normed_embedding.tolist()
    
    logger.info(f"✅ Selfie extracted (Buffalo_L / ResNet-100). Dim: {len(embedding)}")
    return embedding

def extract_all_embeddings(image_path: str) -> List[Dict[str, Any]]:
    """
    Extract 512-point embeddings for ALL faces in a photo.
    Returns: List of {"embedding": list, "bbox": list, "confidence": float}
    """
    engine = get_engine()
    img = cv2.imread(image_path)
    if img is None:
        return []

    faces = engine.get(img)
    results = []
    
    for face in faces:
        # Quality filter
        if face.det_score > 0.35:
            results.append({
                "embedding": face.normed_embedding.tolist(),
                "bbox": face.bbox.astype(int).tolist(),
                "confidence": float(face.det_score)
            })
            
    logger.info(f"📸 Analyzed group photo: Found {len(results)} faces using SCRFD + Buffalo_L")
    return results

def match_selfie_to_event(selfie_embedding: list, event_photos: list) -> list:
    """
    Match selfie against event faces using tiered thresholds for Buffalo_L.
    """
    if not event_photos:
        return []

    # Buffalo_L (ArcFace ResNet-100) Thresholds:
    # < 0.55: Precise match (Verified / Perfect Match)
    # 0.55 - 0.65: Suggested match (Similar Frames)
    THRESHOLD = 0.65
    PRECISION_ZONE = 0.55
    
    face_data = [] # List of (photo_id, embedding)
    for photo in event_photos:
        photo_id = photo["photo_id"]
        for face in photo.get("embeddings", []):
            emb = face.get("embedding")
            if emb is not None:
                face_data.append((photo_id, emb))
    
    if not face_data:
        return []

    photo_ids = [fd[0] for fd in face_data]
    embeddings_matrix = np.array([fd[1] for fd in face_data], dtype=np.float32)
    selfie_vec = np.array(selfie_embedding, dtype=np.float32)

    # Cosine Similarity
    similarities = np.dot(embeddings_matrix, selfie_vec)
    distances = 1.0 - similarities

    photo_best_matches = {}
    for i, dist in enumerate(distances):
        if dist < THRESHOLD:
            pid = photo_ids[i]
            if pid not in photo_best_matches or dist < photo_best_matches[pid]:
                photo_best_matches[pid] = dist

    matches = []
    for pid, best_dist in photo_best_matches.items():
        # Recalibrated confidence mapping for Buffalo_L:
        if best_dist < PRECISION_ZONE:
            # 0.00 -> 100%, PRECISION_ZONE -> 90%
            confidence = (1.0 - (best_dist / PRECISION_ZONE) * 0.1) * 100
        else:
            # PRECISION_ZONE -> 85%, THRESHOLD -> 10%
            confidence = (0.85 - ((best_dist - PRECISION_ZONE) / (THRESHOLD - PRECISION_ZONE)) * 0.75) * 100
            
        matches.append({
            "photo_id": pid,
            "distance": float(best_dist),
            "confidence_score": round(float(confidence), 2),
            "is_suggested": best_dist >= PRECISION_ZONE
        })

    matches.sort(key=lambda x: x["confidence_score"], reverse=True)
    return matches

def cluster_event_faces(face_data: list) -> list:
    """
    Run DBSCAN clustering on Buffalo_L embeddings.
    """
    from sklearn.cluster import DBSCAN

    if len(face_data) < 2:
        return []

    embeddings = np.array([fd["embedding"] for fd in face_data], dtype=np.float32)
    photo_ids  = [fd["photo_id"] for fd in face_data]

    # eps=0.42 is a robust sweet spot for Buffalo_L clustering
    db = DBSCAN(eps=0.42, min_samples=2, metric="cosine", n_jobs=-1)
    labels = db.fit_predict(embeddings)

    clusters_dict: dict = {}
    for i, label in enumerate(labels):
        if label == -1:
            continue
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

    return clusters

def match_selfie_to_clusters(selfie_embedding: list, clusters: list) -> list:
    """
    Compare selfie to cluster centroids.
    """
    if not clusters:
        return []

    THRESHOLD = 0.65
    selfie_vec = l2_normalize(np.array(selfie_embedding, dtype=np.float32))
    centroids  = np.array([c["centroid"] for c in clusters], dtype=np.float32)

    similarities = np.dot(centroids, selfie_vec)
    distances    = 1.0 - similarities

    matches = []
    for i, dist in enumerate(distances):
        if dist < THRESHOLD:
            # Map confidence similarly to match_selfie_to_event
            if dist < 0.55:
                conf = (1.0 - (dist / 0.55) * 0.1) * 100
            else:
                conf = (0.85 - ((dist - 0.55) / (0.65 - 0.55)) * 0.75) * 100
                
            matches.append({
                "photo_ids":        clusters[i]["photo_ids"],
                "distance":         float(dist),
                "confidence_score": round(float(conf), 2),
            })

    matches.sort(key=lambda x: x["confidence_score"], reverse=True)
    return matches
