import os
import wave
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import cv2
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config import settings
from database.models import EngineResult
from engines.media.models import MediaFinding, MediaAnalysisResponse


def analyze_audio_metadata(file_path: str) -> Dict[str, Any]:
    """Extract audio sample rates, channel topology, and duration."""
    meta = {
        "duration_seconds": 0.0,
        "sample_rate": 0,
        "channels": 0,
        "format": "Unknown",
        "is_valid": False,
    }

    # First attempt soundfile
    try:
        import soundfile as sf
        info = sf.info(file_path)
        meta["duration_seconds"] = round(info.duration, 2)
        meta["sample_rate"] = info.samplerate
        meta["channels"] = info.channels
        meta["format"] = info.format
        meta["subtype"] = info.subtype
        meta["is_valid"] = True
        return meta
    except Exception:
        pass

    # Fallback to standard wave module
    try:
        with wave.open(file_path, "rb") as wf:
            n_channels = wf.getnchannels()
            sampwidth = wf.getsampwidth()
            framerate = wf.getframerate()
            n_frames = wf.getnframes()
            duration = n_frames / float(framerate) if framerate > 0 else 0.0

            meta["duration_seconds"] = round(duration, 2)
            meta["sample_rate"] = framerate
            meta["channels"] = n_channels
            meta["format"] = f"WAV (PCM {sampwidth * 8}-bit)"
            meta["is_valid"] = True
            return meta
    except Exception:
        meta["error"] = "Audio file header could not be parsed."
        return meta


def generate_spectrogram(file_path: str, output_path: str) -> Tuple[bool, Optional[str]]:
    """Generate audio spectrogram visualization using librosa or numpy FFT fallback."""
    try:
        import librosa
        y, sr = librosa.load(file_path, sr=22050, duration=30)
        # Compute Short-Time Fourier Transform
        s = np.abs(librosa.stft(y, n_fft=1024, hop_length=512))
        s_db = librosa.amplitude_to_db(s, ref=np.max)

        # Normalize to 0-255 grayscale
        norm = cv2.normalize(s_db, None, 0, 255, cv2.NORM_MINMAX)
        norm_uint8 = np.uint8(norm)
        # Invert so high energy is bright
        heatmap = cv2.applyColorMap(norm_uint8, cv2.COLORMAP_VIRIDIS)
        # Flip vertically so 0 Hz is at bottom
        heatmap = cv2.flip(heatmap, 0)

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        cv2.imwrite(output_path, heatmap)
        return True, None
    except ImportError:
        return False, "librosa library is not installed; spectrogram rendering skipped."
    except Exception as e:
        return False, f"Spectrogram generation failed: {str(e)}"


def detect_anomalies(file_path: str) -> Tuple[Dict[str, Any], List[MediaFinding]]:
    """Inspect frequency envelope for spectral cutoffs or vocoder artifacts typical of synthesized speech."""
    findings: List[MediaFinding] = []
    metrics = {"spectral_cutoff_khz": None, "zero_crossing_rate_mean": 0.0}

    try:
        import librosa
        y, sr = librosa.load(file_path, sr=None, duration=45)
        if len(y) == 0:
            return metrics, findings

        # Spectral Centroid & Rolloff
        rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr, roll_percent=0.85)
        mean_rolloff = float(np.mean(rolloff))
        metrics["spectral_cutoff_khz"] = round(mean_rolloff / 1000.0, 2)

        # Zero crossing rate
        zcr = librosa.feature.zero_crossing_rate(y)
        metrics["zero_crossing_rate_mean"] = round(float(np.mean(zcr)), 4)

        # Synthetic speech / deepfake audio often has strict frequency cutoffs (e.g. at 4kHz or 8kHz)
        if sr >= 22050 and mean_rolloff < 4500:
            findings.append(
                MediaFinding(
                    code="AUD_SPECTRAL_CUTOFF_LOW",
                    severity="high",
                    description="Unusual brick-wall spectral rolloff detected below 4.5 kHz, characteristic of neural vocoder downsampling in AI voice clones.",
                    evidence=f"Mean spectral rolloff at {mean_rolloff / 1000.0:.2f} kHz despite sample rate {sr} Hz.",
                    location="Frequency spectrum (0-8 kHz)",
                )
            )

        # Detect unnatural digital silence
        energy = librosa.feature.rms(y=y)
        silent_frames = np.sum(energy < 1e-4)
        total_frames = energy.shape[1]
        silence_ratio = silent_frames / total_frames if total_frames > 0 else 0

        if silence_ratio > 0.40:
            findings.append(
                MediaFinding(
                    code="AUD_HIGH_SILENCE_RATIO",
                    severity="low",
                    description="Elevated proportion of dead silence observed in recording.",
                    evidence=f"{silence_ratio * 100:.1f}% of sample contains zero acoustic energy.",
                    location="RMS energy track",
                )
            )

    except ImportError:
        findings.append(
            MediaFinding(
                code="AUD_LIBROSA_SKIPPED",
                severity="info",
                description="Advanced spectral analysis skipped: librosa is not available in environment.",
                evidence="Optional audio processing dependency missing.",
                location="Spectral analyzer",
            )
        )
    except Exception as e:
        findings.append(
            MediaFinding(
                code="AUD_ANALYSIS_ERROR",
                severity="info",
                description="Audio signal analysis encountered an error.",
                evidence=str(e),
                location="Audio pipeline",
            )
        )

    return metrics, findings


async def full_audio_analysis(
    file_path: str,
    file_id: str,
    verification_id: str,
    db: AsyncSession,
) -> MediaAnalysisResponse:
    """Execute complete audio forensic pipeline."""
    result_query = await db.execute(
        select(EngineResult).where(
            EngineResult.verification_id == verification_id,
            EngineResult.engine_name == "media_audio",
        )
    )
    engine_result = result_query.scalar_one_or_none()
    if not engine_result:
        engine_result = EngineResult(
            verification_id=verification_id,
            engine_name="media_audio",
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
            media_type="audio",
            status="failed",
            error_message=engine_result.error_message,
        )

    all_findings: List[MediaFinding] = []

    # 1. Metadata
    meta = analyze_audio_metadata(file_path)
    if not meta.get("is_valid"):
        engine_result.status = "failed"
        engine_result.error_message = meta.get("error", "Invalid audio container.")
        engine_result.completed_at = datetime.now(timezone.utc)
        await db.commit()
        return MediaAnalysisResponse(
            verification_id=verification_id,
            media_type="audio",
            status="failed",
            error_message=engine_result.error_message,
        )

    # 2. Spectrogram generation
    spec_filename = f"spec_{verification_id}.jpg"
    spec_path = os.path.join(settings.UPLOAD_DIR, "analyzed", spec_filename)
    spec_ok, spec_err = generate_spectrogram(file_path, spec_path)
    spec_rel_path = f"/uploads/analyzed/{spec_filename}" if spec_ok else None

    # 3. Frequency anomaly analysis
    anom_metrics, anom_findings = detect_anomalies(file_path)
    all_findings.extend(anom_findings)

    # Commit results
    findings_json = [f.model_dump() for f in all_findings]
    engine_result.status = "completed"
    engine_result.findings = findings_json
    engine_result.confidence = 0.85
    engine_result.completed_at = datetime.now(timezone.utc)
    await db.commit()

    details = {
        "metadata": meta,
        "spectral_metrics": anom_metrics,
        "spectrogram_available": spec_ok,
    }

    return MediaAnalysisResponse(
        verification_id=verification_id,
        media_type="audio",
        status="completed",
        confidence=0.85,
        findings=all_findings,
        details=details,
        ela_image_path=spec_rel_path,
        completed_at=engine_result.completed_at,
    )
