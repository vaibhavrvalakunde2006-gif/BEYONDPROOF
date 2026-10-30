"""Unit and integration tests for Laundered Fakes and Lying Metadata detection."""

import os
import tempfile
import numpy as np
import cv2
from PIL import Image
import piexif
import pytest

from engines.media.laundering_service import (
    detect_screen_recapture_moire,
    detect_screenshot_laundering,
    validate_metadata_against_image_physics,
    evaluate_authenticity_verdict,
    STANDARD_IJG_Q75_LUM,
)
from engines.media.models import MediaFinding


def test_authenticity_verdict_absence_of_tampering_not_genuine():
    """CRITICAL HACKATHON RULE: Score 0-30 with NO evidence of tampering must NEVER be certified genuine without cryptographic proof."""
    findings = []
    # Test 1: Low risk, no findings, NO C2PA
    verdict_unverified = evaluate_authenticity_verdict(findings, risk_score=5.0, has_cryptographic_origin=False)
    assert verdict_unverified["authenticity_verdict"] == "NO_TAMPERING_FOUND_UNVERIFIED"
    assert "NOT constitute evidence of authenticity" in verdict_unverified["forensic_warning"]
    assert verdict_unverified["badge_color"] == "yellow"

    # Test 2: Low risk, no findings, WITH C2PA cryptographic provenance
    verdict_genuine = evaluate_authenticity_verdict(findings, risk_score=5.0, has_cryptographic_origin=True)
    assert verdict_genuine["authenticity_verdict"] == "VERIFIED_GENUINE"
    assert verdict_genuine["badge_color"] == "emerald"


def test_authenticity_verdict_forgery_and_laundering_priorities():
    """Verify that metadata forgery and laundering supersede clean absence-of-tampering."""
    # Metadata forgery
    mf = [
        MediaFinding(
            code="METADATA_PHYSICAL_RESOLUTION_MISMATCH",
            severity="critical",
            description="Resolution contradicts sensor",
            evidence="1024x1024 vs 30.4MP",
        )
    ]
    res_mf = evaluate_authenticity_verdict(mf, risk_score=20.0, has_cryptographic_origin=False)
    assert res_mf["authenticity_verdict"] == "METADATA_FORGERY_DETECTED"
    assert res_mf["badge_color"] == "red"

    # Laundering
    ml = [
        MediaFinding(
            code="IMG_MOIRE_RECAPTURE_DETECTED",
            severity="high",
            description="Screen recapture detected",
            evidence="2D FFT harmonic peaks",
        )
    ]
    res_ml = evaluate_authenticity_verdict(ml, risk_score=25.0, has_cryptographic_origin=False)
    assert res_ml["authenticity_verdict"] == "LAUNDERED_SUSPECT"
    assert res_ml["badge_color"] == "amber"


def test_screenshot_laundering_iphone_resolution():
    """Verify exact device resolution detection (e.g. iPhone 12/13/14 Pro 1170x2532)."""
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        # Create image with iPhone 13 Pro dimensions: 1170 x 2532
        img = np.zeros((2532, 1170, 3), dtype=np.uint8)
        cv2.imwrite(tmp_path, img)

        metrics, findings = detect_screenshot_laundering(tmp_path, {})
        assert metrics["screenshot_detected"] is True
        assert "Apple iPhone" in str(metrics["matched_device"])
        assert any(f.code == "IMG_SCREENSHOT_LAUNDERING_DETECTED" for f in findings)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def test_cross_modal_sensor_resolution_mismatch():
    """Verify detection when EXIF claims professional DSLR (Canon EOS 5D) but image is AI square 1024x1024."""
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        # 1024x1024 square image (typical Midjourney/DALL-E)
        img = np.full((1024, 1024, 3), 128, dtype=np.uint8)
        cv2.imwrite(tmp_path, img)

        metadata = {
            "camera_make": "Canon",
            "camera_model": "Canon EOS 5D Mark IV",
        }

        evals, findings = validate_metadata_against_image_physics(tmp_path, metadata)
        assert evals["sensor_resolution_check"] == "failed"
        assert any(f.code == "METADATA_PHYSICAL_RESOLUTION_MISMATCH" for f in findings)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def test_cross_modal_quantization_software_mismatch():
    """Verify detection when EXIF claims DSLR camera but JPEG DQT table matches standard IJG software."""
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        # PIL default JPEG save uses Standard IJG tables
        pil_img = Image.new("RGB", (6720 // 4, 4480 // 4), color=(100, 150, 200))
        pil_img.save(tmp_path, "JPEG", quality=75)

        metadata = {
            "camera_make": "Canon",
            "camera_model": "Canon EOS 5D Mark IV",
        }

        evals, findings = validate_metadata_against_image_physics(tmp_path, metadata)
        assert evals["quantization_check"] == "failed"
        assert any(f.code == "METADATA_QUANTIZATION_HARDWARE_MISMATCH" for f in findings)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def test_cross_modal_aperture_vs_infinite_depth_of_field():
    """Verify detection when EXIF claims f/1.4 wide aperture but entire image has uniform edge sharpness."""
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        # Create sharp checkerboard pattern uniformly across center and corners
        w, h = 600, 400
        grid = np.zeros((h, w), dtype=np.uint8)
        grid[::8, :] = 255
        grid[:, ::8] = 255

        # Embed EXIF with FNumber = 1.4 (14/10)
        exif_dict = {
            "0th": {piexif.ImageIFD.Make: b"Sony", piexif.ImageIFD.Model: b"Alpha 7R"},
            "Exif": {piexif.ExifIFD.FNumber: (14, 10)},
        }
        exif_bytes = piexif.dump(exif_dict)
        Image.fromarray(grid).save(tmp_path, "JPEG", exif=exif_bytes)

        metadata = {"camera_make": "Sony", "camera_model": "Alpha 7R"}
        evals, findings = validate_metadata_against_image_physics(tmp_path, metadata)
        assert evals["aperture_dof_check"] == "failed"
        assert any(f.code == "METADATA_OPTICAL_DOF_MISMATCH" for f in findings)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def test_cross_modal_high_iso_vs_zero_shot_noise():
    """Verify detection when EXIF claims ISO 6400 but image exhibits hyper-smooth AI texture with zero noise."""
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        # Perfectly smooth uniform patch (0 sensor noise)
        smooth = np.full((400, 400), 140, dtype=np.uint8)

        # Embed EXIF with ISO = 6400
        exif_dict = {
            "0th": {piexif.ImageIFD.Make: b"Canon", piexif.ImageIFD.Model: b"EOS R5"},
            "Exif": {piexif.ExifIFD.ISOSpeedRatings: 6400},
        }
        exif_bytes = piexif.dump(exif_dict)
        Image.fromarray(smooth).save(tmp_path, "JPEG", exif=exif_bytes)

        metadata = {"camera_make": "Canon", "camera_model": "EOS R5"}
        evals, findings = validate_metadata_against_image_physics(tmp_path, metadata)
        assert evals["iso_noise_check"] == "failed"
        assert any(f.code == "METADATA_SENSOR_ISO_NOISE_MISMATCH" for f in findings)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
