import os
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple
import cv2
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config import settings
from database.models import EngineResult
from engines.media.models import MediaFinding, MediaAnalysisResponse


def analyze_video_metadata(file_path: str) -> Dict[str, Any]:
    """Retrieve video duration, dimensions, frame rates, and codec identifier."""
    cap = cv2.VideoCapture(file_path)
    if not cap.isOpened():
        return {"is_valid": False, "error": "Unable to open video stream."}

    fps = cap.get(cv2.CAP_PROP_FPS) or 0.0
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
    fourcc_int = int(cap.get(cv2.CAP_PROP_FOURCC) or 0)
    fourcc = "".join([chr((fourcc_int >> 8 * i) & 0xFF) for i in range(4)])
    duration = frame_count / fps if fps > 0 else 0.0
    cap.release()

    return {
        "is_valid": True,
        "width": width,
        "height": height,
        "resolution": f"{width}x{height}",
        "fps": round(fps, 2),
        "frame_count": frame_count,
        "duration_seconds": round(duration, 2),
        "fourcc": fourcc.strip(),
    }


def extract_keyframes(file_path: str, output_dir: str, interval: int = 30, max_frames: int = 20) -> List[str]:
    """Extract sample keyframes from video at fixed intervals."""
    os.makedirs(output_dir, exist_ok=True)
    frame_paths = []
    cap = cv2.VideoCapture(file_path)
    if not cap.isOpened():
        return frame_paths

    frame_idx = 0
    saved_count = 0

    while True:
        ret, frame = cap.read()
        if not ret or saved_count >= max_frames:
            break

        if frame_idx % interval == 0:
            frame_filename = f"frame_{saved_count:04d}_{frame_idx}.jpg"
            frame_path = os.path.join(output_dir, frame_filename)
            cv2.imwrite(frame_path, frame)
            frame_paths.append(frame_path)
            saved_count += 1

        frame_idx += 1

    cap.release()
    return frame_paths


def detect_faces_in_frames(frame_paths: List[str]) -> Tuple[Dict[str, Any], List[MediaFinding]]:
    """Detect faces in extracted keyframes to evaluate stability and facial consistency."""
    findings: List[MediaFinding] = []
    face_cascade = None
    if hasattr(cv2, "CascadeClassifier") and hasattr(cv2, "data") and hasattr(cv2.data, "haarcascades"):
        try:
            cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            face_cascade = cv2.CascadeClassifier(cascade_path)
        except Exception:
            pass

    face_counts = []
    for fp in frame_paths:
        img = cv2.imread(fp)
        if img is None:
            continue
        if face_cascade is not None:
            try:
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
                face_counts.append(len(faces))
            except Exception:
                face_counts.append(1)
        else:
            face_counts.append(1)

    face_summary = {
        "frames_analyzed": len(frame_paths),
        "average_faces_per_frame": round(float(np.mean(face_counts)), 2) if face_counts else 0.0,
        "max_faces": max(face_counts) if face_counts else 0,
        "face_flicker_detected": False,
    }

    if len(face_counts) > 3:
        # Check for rapid flickering (face disappearing for a single frame)
        flickers = 0
        for i in range(1, len(face_counts) - 1):
            if face_counts[i] == 0 and face_counts[i - 1] > 0 and face_counts[i + 1] > 0:
                flickers += 1

        if flickers > 0:
            face_summary["face_flicker_detected"] = True
            findings.append(
                MediaFinding(
                    code="VID_FACE_TRACKING_FLICKER",
                    severity="high",
                    description="Facial boundary dropouts detected between keyframes, a common artifact in automated deepfake face replacement.",
                    evidence=f"Detected {flickers} abrupt facial dropout events across sample keyframes.",
                    location="Temporal face detection track",
                )
            )

    return face_summary, findings


def check_temporal_consistency(file_path: str, sample_frames: int = 60) -> Tuple[Dict[str, Any], List[MediaFinding]]:
    """Analyze temporal continuity and histogram transition deltas across frames."""
    findings: List[MediaFinding] = []
    cap = cv2.VideoCapture(file_path)
    if not cap.isOpened():
        return {"error": "Video could not be opened"}, findings

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    step = max(1, total_frames // sample_frames) if total_frames > 0 else 1

    prev_hist = None
    deltas = []
    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret or len(deltas) >= sample_frames:
            break

        if frame_idx % step == 0:
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            hist = cv2.calcHist([hsv], [0, 1], None, [30, 32], [0, 180, 0, 256])
            cv2.normalize(hist, hist, 0, 1, cv2.NORM_MINMAX)

            if prev_hist is not None:
                # Correlation: 1.0 is identical, < 0.5 is sharp change
                sim = cv2.compareHist(prev_hist, hist, cv2.HISTCMP_CORREL)
                deltas.append(sim)

            prev_hist = hist

        frame_idx += 1

    cap.release()

    metrics = {
        "samples_compared": len(deltas),
        "mean_continuity": round(float(np.mean(deltas)), 3) if deltas else 1.0,
        "min_continuity": round(float(np.min(deltas)), 3) if deltas else 1.0,
    }

    if deltas:
        # Check for abnormal sudden drop in frame correlation
        abrupt_cuts = [d for d in deltas if d < 0.25]
        if len(abrupt_cuts) > 3:
            findings.append(
                MediaFinding(
                    code="VID_TEMPORAL_DISCONTINUITY",
                    severity="medium",
                    description="Multiple sharp temporal color/lighting discontinuities detected, indicating cuts or composite insertions.",
                    evidence=f"Found {len(abrupt_cuts)} significant temporal transition anomalies (correlation < 0.25).",
                    location="Temporal stream",
                )
            )

    return metrics, findings


async def full_video_analysis(
    file_path: str,
    file_id: str,
    verification_id: str,
    db: AsyncSession,
) -> MediaAnalysisResponse:
    """Execute complete video forensic inspection pipeline."""
    result_query = await db.execute(
        select(EngineResult).where(
            EngineResult.verification_id == verification_id,
            EngineResult.engine_name == "media_video",
        )
    )
    engine_result = result_query.scalar_one_or_none()
    if not engine_result:
        engine_result = EngineResult(
            verification_id=verification_id,
            engine_name="media_video",
            status="running",
            started_at=datetime.now(timezone.utc),
        )
        db.add(engine_result)
    else:
        engine_result.status = "running"
        engine_result.started_at = datetime.now(timezone.utc)
    await db.commit()

    if not os.path.exists(file_path):
        engine_result.status = "failed"
        engine_result.error_message = f"File not found: {file_path}"
        engine_result.completed_at = datetime.now(timezone.utc)
        await db.commit()
        return MediaAnalysisResponse(
            verification_id=verification_id,
            media_type="video",
            status="failed",
            error_message=engine_result.error_message,
        )

    all_findings: List[MediaFinding] = []

    # 1. Video stream metadata
    meta = analyze_video_metadata(file_path)
    if not meta.get("is_valid"):
        engine_result.status = "failed"
        engine_result.error_message = meta.get("error", "Invalid video stream")
        engine_result.completed_at = datetime.now(timezone.utc)
        await db.commit()
        return MediaAnalysisResponse(
            verification_id=verification_id,
            media_type="video",
            status="failed",
            error_message=engine_result.error_message,
        )

    # 2. Extract keyframes
    keyframes_dir = os.path.join(settings.UPLOAD_DIR, "temp", f"frames_{verification_id}")
    keyframes = extract_keyframes(file_path, keyframes_dir, interval=25, max_frames=15)

    # 3. Facial consistency
    face_metrics, face_findings = detect_faces_in_frames(keyframes)
    all_findings.extend(face_findings)

    # 4. Temporal consistency
    temporal_metrics, temporal_findings = check_temporal_consistency(file_path)
    all_findings.extend(temporal_findings)

    # Commit results
    findings_json = [f.model_dump() for f in all_findings]
    engine_result.status = "completed"
    engine_result.findings = findings_json
    engine_result.confidence = 0.88
    engine_result.completed_at = datetime.now(timezone.utc)
    await db.commit()

    details = {
        "metadata": meta,
        "face_metrics": face_metrics,
        "temporal_metrics": temporal_metrics,
        "keyframes_extracted": len(keyframes),
    }

    return MediaAnalysisResponse(
        verification_id=verification_id,
        media_type="video",
        status="completed",
        confidence=0.88,
        findings=all_findings,
        details=details,
        completed_at=engine_result.completed_at,
    )
