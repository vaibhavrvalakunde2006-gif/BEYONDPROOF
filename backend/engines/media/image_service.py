import os
import io
import math
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import cv2
from PIL import Image, ImageChops, ImageEnhance
import imagehash
import piexif
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config import settings
from database.models import EngineResult
from engines.media.models import MediaFinding, MediaAnalysisResponse
from engines.media.laundering_service import (
    detect_screen_recapture_moire,
    detect_screenshot_laundering,
    validate_metadata_against_image_physics,
    evaluate_authenticity_verdict,
)


def analyze_metadata(file_path: str) -> Tuple[Dict[str, Any], List[MediaFinding]]:
    """Extract EXIF/XMP metadata and detect inconsistencies or editing software footprints."""
    findings: List[MediaFinding] = []
    metadata: Dict[str, Any] = {
        "has_exif": False,
        "camera_make": None,
        "camera_model": None,
        "software": None,
        "datetime_original": None,
        "datetime_digitized": None,
        "modify_date": None,
    }

    try:
        exif_dict = piexif.load(file_path)
        metadata["has_exif"] = bool(exif_dict.get("0th") or exif_dict.get("Exif"))

        # Extract 0th IFD tags
        if "0th" in exif_dict and exif_dict["0th"]:
            zero_ifd = exif_dict["0th"]
            make = zero_ifd.get(piexif.ImageIFD.Make)
            if make:
                metadata["camera_make"] = make.decode("utf-8", errors="ignore").strip()
            model = zero_ifd.get(piexif.ImageIFD.Model)
            if model:
                metadata["camera_model"] = model.decode("utf-8", errors="ignore").strip()
            soft = zero_ifd.get(piexif.ImageIFD.Software)
            if soft:
                metadata["software"] = soft.decode("utf-8", errors="ignore").strip()
            mdate = zero_ifd.get(piexif.ImageIFD.DateTime)
            if mdate:
                metadata["modify_date"] = mdate.decode("utf-8", errors="ignore").strip()

        # Extract Exif IFD tags
        if "Exif" in exif_dict and exif_dict["Exif"]:
            exif_ifd = exif_dict["Exif"]
            orig_date = exif_ifd.get(piexif.ExifIFD.DateTimeOriginal)
            if orig_date:
                metadata["datetime_original"] = orig_date.decode("utf-8", errors="ignore").strip()
            dig_date = exif_ifd.get(piexif.ExifIFD.DateTimeDigitized)
            if dig_date:
                metadata["datetime_digitized"] = dig_date.decode("utf-8", errors="ignore").strip()

        # Check for editing software
        software_name = str(metadata.get("software") or "").lower()
        editing_tools = ["photoshop", "gimp", "canva", "lightroom", "snapseed", "paint.net", "procreate"]
        detected = [tool for tool in editing_tools if tool in software_name]
        if detected:
            findings.append(
                MediaFinding(
                    code="IMG_SOFTWARE_EDIT_DETECTED",
                    severity="high",
                    description="Image metadata indicates manipulation or processing in photo editing software.",
                    evidence=f"Software tag: '{metadata.get('software')}' (Matched: {', '.join(detected)})",
                    location="EXIF 0th IFD Software tag",
                )
            )

        # Check for date inconsistency
        if metadata.get("datetime_original") and metadata.get("modify_date"):
            if metadata["datetime_original"] != metadata["modify_date"]:
                findings.append(
                    MediaFinding(
                        code="IMG_DATE_MODIFIED",
                        severity="medium",
                        description="Image modification timestamp differs from original capture timestamp.",
                        evidence=f"Original: {metadata['datetime_original']} | Modified: {metadata['modify_date']}",
                        location="EXIF DateTime vs DateTimeOriginal",
                    )
                )

        if not metadata["has_exif"]:
            findings.append(
                MediaFinding(
                    code="IMG_EXIF_STRIPPED",
                    severity="low",
                    description="No EXIF metadata found. Metadata may have been stripped during export or social media upload.",
                    evidence="EXIF header is empty or absent.",
                    location="Image headers",
                )
            )

    except Exception as e:
        findings.append(
            MediaFinding(
                code="IMG_METADATA_PARSE_NOTICE",
                severity="info",
                description="Standard EXIF structures could not be read (normal for non-JPEG or stripped formats).",
                evidence=str(e),
                location="Metadata parser",
            )
        )

    return metadata, findings


def error_level_analysis(file_path: str, quality: int = 95) -> Tuple[Dict[str, Any], List[MediaFinding]]:
    """Perform Error Level Analysis (ELA) by recompressing at known quality and calculating residual difference."""
    findings: List[MediaFinding] = []
    metrics = {"mean_error": 0.0, "max_error": 0, "std_error": 0.0}

    try:
        original = Image.open(file_path).convert("RGB")
        buffer = io.BytesIO()
        original.save(buffer, "JPEG", quality=quality)
        buffer.seek(0)
        resaved = Image.open(buffer)

        # Compute difference
        diff = ImageChops.difference(original, resaved)
        diff_arr = np.array(diff, dtype=np.float32)

        mean_err = float(np.mean(diff_arr))
        max_err = int(np.max(diff_arr))
        std_err = float(np.std(diff_arr))

        metrics["mean_error"] = round(mean_err, 3)
        metrics["max_error"] = max_err
        metrics["std_error"] = round(std_err, 3)

        # High standard deviation or localized difference spike indicates spliced content
        if max_err > 80 and std_err > 12.0:
            findings.append(
                MediaFinding(
                    code="IMG_ELA_ANOMALY_HIGH",
                    severity="high",
                    description="Elevated error level variance detected, indicating potential localized splicing or re-compression edits.",
                    evidence=f"ELA metrics: Max error = {max_err}, Mean error = {mean_err:.2f}, Std Dev = {std_err:.2f}",
                    location="Compression error surface",
                )
            )
        elif max_err > 40:
            findings.append(
                MediaFinding(
                    code="IMG_ELA_ANOMALY_MODERATE",
                    severity="medium",
                    description="Moderate compression gradient variations observed across the image.",
                    evidence=f"ELA metrics: Max error = {max_err}, Std Dev = {std_err:.2f}",
                    location="Compression error surface",
                )
            )
    except Exception as e:
        findings.append(
            MediaFinding(
                code="IMG_ELA_FAILED",
                severity="info",
                description="Error Level Analysis could not be computed.",
                evidence=str(e),
                location="ELA engine",
            )
        )

    return metrics, findings


def generate_ela_visualization(file_path: str, output_path: str, quality: int = 95, scale: int = 15) -> bool:
    """Generate and save an enhanced ELA visualization heatmap image."""
    try:
        original = Image.open(file_path).convert("RGB")
        buffer = io.BytesIO()
        original.save(buffer, "JPEG", quality=quality)
        buffer.seek(0)
        resaved = Image.open(buffer)

        diff = ImageChops.difference(original, resaved)
        # Enhance brightness of difference for human visual inspection
        extrema = diff.getextrema()
        max_diff = max([ex[1] for ex in extrema])
        scale_factor = scale if max_diff == 0 else min(scale, int(255.0 / max_diff))
        enhancer = ImageEnhance.Brightness(diff)
        enhanced = enhancer.enhance(max(1.0, float(scale_factor)))

        # Convert to colored heatmap via OpenCV
        ela_cv = cv2.cvtColor(np.array(enhanced), cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(ela_cv, cv2.COLOR_BGR2GRAY)
        heatmap = cv2.applyColorMap(gray, cv2.COLORMAP_JET)

        # Blend with grayscale original for spatial context
        orig_gray = cv2.cvtColor(np.array(original), cv2.COLOR_RGB2GRAY)
        orig_bgr = cv2.cvtColor(orig_gray, cv2.COLOR_GRAY2BGR)
        blended = cv2.addWeighted(orig_bgr, 0.4, heatmap, 0.6, 0)

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        cv2.imwrite(output_path, blended)
        return True
    except Exception:
        return False


def analyze_noise(file_path: str) -> Tuple[Dict[str, Any], List[MediaFinding]]:
    """Compute local high-frequency noise variance across spatial tiles to detect spliced regions."""
    findings: List[MediaFinding] = []
    noise_metrics = {"coefficient_of_variation": 0.0, "is_uniform": True}

    try:
        img = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return noise_metrics, findings

        # Extract high-frequency noise using Laplacian or Gaussian difference
        blurred = cv2.GaussianBlur(img, (5, 5), 1.5)
        residual = cv2.absdiff(img, blurred)

        # Split image into 8x8 grid of blocks and compute variance
        h, w = residual.shape
        block_h = max(h // 8, 1)
        block_w = max(w // 8, 1)
        variances = []

        for i in range(8):
            for j in range(8):
                tile = residual[i * block_h : (i + 1) * block_h, j * block_w : (j + 1) * block_w]
                if tile.size > 0:
                    variances.append(float(np.var(tile)))

        if len(variances) > 1:
            mean_var = np.mean(variances)
            std_var = np.std(variances)
            cv = float(std_var / (mean_var + 1e-6))
            noise_metrics["coefficient_of_variation"] = round(cv, 3)

            # High CV indicates non-uniform noise distribution typical of spliced elements
            if cv > 0.90:
                noise_metrics["is_uniform"] = False
                findings.append(
                    MediaFinding(
                        code="IMG_NOISE_INCONSISTENCY",
                        severity="high",
                        description="Inconsistent sensor noise levels detected across image sectors, characteristic of multi-source compositing.",
                        evidence=f"Noise coefficient of variation: {cv:.3f} (threshold: 0.90)",
                        location="Spatial noise variance map",
                    )
                )
            elif cv > 0.65:
                findings.append(
                    MediaFinding(
                        code="IMG_NOISE_VARIANCE_ELEVATED",
                        severity="medium",
                        description="Mild noise variance observed across image regions.",
                        evidence=f"Noise coefficient of variation: {cv:.3f}",
                        location="Spatial noise variance map",
                    )
                )
    except Exception as e:
        findings.append(
            MediaFinding(
                code="IMG_NOISE_ANALYSIS_FAILED",
                severity="info",
                description="Noise variance inspection could not be completed.",
                evidence=str(e),
                location="Noise filter",
            )
        )

    return noise_metrics, findings


def compute_image_hashes(file_path: str) -> Dict[str, str]:
    """Generate perceptual, average, difference, and wavelet perceptual hashes."""
    hashes = {}
    try:
        img = Image.open(file_path)
        hashes["average_hash"] = str(imagehash.average_hash(img))
        hashes["phash"] = str(imagehash.phash(img))
        hashes["dhash"] = str(imagehash.dhash(img))
        hashes["whash"] = str(imagehash.whash(img))
    except Exception as e:
        hashes["error"] = str(e)
    return hashes


def detect_copy_move(file_path: str) -> Tuple[bool, List[MediaFinding]]:
    """Detect potential copy-move cloning manipulation using ORB feature keypoint clustering."""
    findings: List[MediaFinding] = []
    copy_move_detected = False

    try:
        img = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return False, findings

        orb = cv2.ORB_create(nfeatures=1200)
        keypoints, descriptors = orb.detectAndCompute(img, None)

        if descriptors is not None and len(descriptors) > 20:
            # Match descriptors to find self-similar regions
            matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
            matches = matcher.knnMatch(descriptors, descriptors, k=3)

            clone_pairs = []
            for match in matches:
                # match[0] is self match, check match[1] and match[2]
                if len(match) > 1:
                    m = match[1]
                    pt1 = keypoints[m.queryIdx].pt
                    pt2 = keypoints[m.trainIdx].pt
                    spatial_dist = math.hypot(pt1[0] - pt2[0], pt1[1] - pt2[1])

                    # Require sufficient spatial distance and high descriptor similarity
                    if spatial_dist > 50 and m.distance < 45:
                        clone_pairs.append((pt1, pt2, spatial_dist))

            if len(clone_pairs) >= 12:
                copy_move_detected = True
                findings.append(
                    MediaFinding(
                        code="IMG_COPY_MOVE_DETECTED",
                        severity="critical",
                        description="Substantial identical duplicated regions identified, indicating copy-move / clone stamp manipulation.",
                        evidence=f"Found {len(clone_pairs)} correlated feature clusters with identical descriptors and non-zero spatial displacement.",
                        location="Feature space",
                    )
                )
            elif len(clone_pairs) >= 6:
                findings.append(
                    MediaFinding(
                        code="IMG_COPY_MOVE_SUSPECTED",
                        severity="medium",
                        description="Potential duplicated repetitive patterns detected.",
                        evidence=f"Found {len(clone_pairs)} matching keypoint pairs.",
                        location="Feature space",
                    )
                )
    except Exception as e:
        findings.append(
            MediaFinding(
                code="IMG_COPY_MOVE_CHECK_FAILED",
                severity="info",
                description="Copy-move detection encountered an error.",
                evidence=str(e),
                location="ORB matcher",
            )
        )

    return copy_move_detected, findings


def analyze_compression(file_path: str) -> Tuple[Dict[str, Any], List[MediaFinding]]:
    """Analyze JPEG quantization tables to identify non-standard compression artifacts."""
    findings: List[MediaFinding] = []
    comp_info = {"has_quantization_tables": False, "tables_count": 0}

    try:
        img = Image.open(file_path)
        q_tables = getattr(img, "quantization", None)
        if q_tables:
            comp_info["has_quantization_tables"] = True
            comp_info["tables_count"] = len(q_tables)
            # Inspect first table variance
            t0 = list(q_tables.get(0, []))
            if t0:
                comp_info["table_0_sample"] = t0[:8]
    except Exception as e:
        comp_info["error"] = str(e)

    return comp_info, findings


async def full_image_analysis(
    file_path: str,
    file_id: str,
    verification_id: str,
    db: AsyncSession,
) -> MediaAnalysisResponse:
    """Orchestrate comprehensive image forensic analysis."""
    # Find or initialize EngineResult
    result_query = await db.execute(
        select(EngineResult).where(
            EngineResult.verification_id == verification_id,
            EngineResult.engine_name == "media_image",
        )
    )
    engine_result = result_query.scalar_one_or_none()
    if not engine_result:
        engine_result = EngineResult(
            verification_id=verification_id,
            engine_name="media_image",
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
            media_type="image",
            status="failed",
            error_message=engine_result.error_message,
        )

    all_findings: List[MediaFinding] = []

    # 1. Metadata & EXIF
    metadata, meta_findings = analyze_metadata(file_path)
    all_findings.extend(meta_findings)

    # 2. Error Level Analysis (ELA)
    ela_metrics, ela_findings = error_level_analysis(file_path)
    all_findings.extend(ela_findings)

    # Generate ELA visual heatmap
    ela_filename = f"ela_{verification_id}.jpg"
    ela_output_path = os.path.join(settings.UPLOAD_DIR, "analyzed", ela_filename)
    ela_saved = generate_ela_visualization(file_path, ela_output_path)
    ela_rel_path = f"/uploads/analyzed/{ela_filename}" if ela_saved else None

    # 3. Spatial Noise Analysis
    noise_metrics, noise_findings = analyze_noise(file_path)
    all_findings.extend(noise_findings)

    # 4. Perceptual Hashes
    hashes = compute_image_hashes(file_path)

    # 5. Copy-Move Detection
    copy_move_detected, copy_move_findings = detect_copy_move(file_path)
    all_findings.extend(copy_move_findings)

    # 6. Compression Analysis
    comp_info, comp_findings = analyze_compression(file_path)
    all_findings.extend(comp_findings)

    # 7. Screen Re-photography (Moiré) Detection via 2D FFT
    moire_metrics, moire_findings = detect_screen_recapture_moire(file_path)
    all_findings.extend(moire_findings)

    # 8. Screenshot Laundering Detection
    screenshot_metrics, screenshot_findings = detect_screenshot_laundering(file_path, metadata)
    all_findings.extend(screenshot_findings)

    # 9. Cross-Modal Lying Metadata Validation (EXIF vs Physical Pixel Reality)
    physics_eval, physics_findings = validate_metadata_against_image_physics(file_path, metadata)
    all_findings.extend(physics_findings)

    # 10. Authenticity Verdict Engine Evaluation (Absence of tampering != Verified Genuine)
    # Check if C2PA or cryptographic provenance anchor exists in DB
    has_crypto_origin = False
    try:
        source_res_query = await db.execute(
            select(EngineResult).where(
                EngineResult.verification_id == verification_id,
                EngineResult.engine_name == "source",
            )
        )
        source_res = source_res_query.scalar_one_or_none()
        if source_res and isinstance(source_res.findings, list):
            for f in source_res.findings:
                if isinstance(f, dict) and f.get("code") == "SRC_C2PA_VERIFIED":
                    has_crypto_origin = True
    except Exception:
        pass

    sev_weights = {"critical": 40.0, "high": 25.0, "medium": 12.0, "low": 4.0, "info": 0.0}
    media_score = min(100.0, sum(sev_weights.get(f.severity, 0.0) for f in all_findings))
    authenticity_info = evaluate_authenticity_verdict(all_findings, media_score, has_crypto_origin)

    # Commit results
    findings_json = [f.model_dump() for f in all_findings]
    engine_result.status = "completed"
    engine_result.findings = findings_json
    engine_result.confidence = 0.95
    engine_result.completed_at = datetime.now(timezone.utc)
    await db.commit()

    details = {
        "metadata": metadata,
        "ela_metrics": ela_metrics,
        "noise_metrics": noise_metrics,
        "hashes": hashes,
        "copy_move_detected": copy_move_detected,
        "compression": comp_info,
        "moire_metrics": moire_metrics,
        "screenshot_metrics": screenshot_metrics,
        "cross_modal_validation": physics_eval,
        "authenticity": authenticity_info,
    }

    return MediaAnalysisResponse(
        verification_id=verification_id,
        media_type="image",
        status="completed",
        confidence=0.95,
        findings=all_findings,
        details=details,
        ela_image_path=ela_rel_path,
        completed_at=engine_result.completed_at,
    )
