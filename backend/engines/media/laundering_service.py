"""Laundered Fakes and Lying Metadata Forensic Service.

Detects laundering attacks:
1. Screen re-photography (Moiré interference patterns via 2D FFT harmonic peak analysis).
2. Screenshot laundering (display resolution fingerprinting, synthetic edge sharpness, P3/sRGB profiles).
3. Cross-modal validation (EXIF metadata vs physical pixel reality):
   - Claimed camera sensor native resolution & aspect ratio vs pixel dimensions.
   - Claimed camera hardware ISP quantization tables vs software (IJG/PIL) tables.
   - Claimed wide optical aperture (f/1.4) vs physical depth of field (DoF).
   - Claimed high sensor ISO (ISO 6400) vs physical sensor shot noise.
4. Authenticity evaluation:
   - Enforces the core rule: "Absence of tampering evidence != Verified Genuine".
"""

import os
import math
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import cv2
from PIL import Image

from engines.media.models import MediaFinding

# Standard IJG (Independent JPEG Group) Base Luminance Quantization Table (Quality 50)
STANDARD_IJG_Q50_LUM = [
    16, 11, 10, 16, 24, 40, 51, 61,
    12, 12, 14, 19, 26, 58, 60, 55,
    14, 13, 16, 24, 40, 57, 69, 56,
    14, 17, 22, 29, 51, 87, 80, 62,
    18, 22, 37, 56, 68, 109, 103, 77,
    24, 35, 55, 64, 81, 104, 113, 92,
    49, 64, 78, 87, 103, 121, 120, 101,
    72, 92, 95, 98, 112, 100, 103, 99
]
STANDARD_IJG_Q75_LUM = STANDARD_IJG_Q50_LUM

# Known Camera Sensor Specifications (Model substring -> (sensor_w, sensor_h, native_mp, native_ratio))
KNOWN_CAMERA_SPECS: Dict[str, Dict[str, Any]] = {
    "eos 5d": {"name": "Canon EOS 5D Series", "w": 6720, "h": 4480, "mp": 30.4, "ratio": 1.50, "hardware_isp": "DIGIC"},
    "eos r": {"name": "Canon EOS R Series", "w": 6720, "h": 4480, "mp": 30.3, "ratio": 1.50, "hardware_isp": "DIGIC"},
    "nikon d850": {"name": "Nikon D850", "w": 8256, "h": 5504, "mp": 45.7, "ratio": 1.50, "hardware_isp": "EXPEED"},
    "nikon z": {"name": "Nikon Z Series", "w": 8256, "h": 5504, "mp": 45.7, "ratio": 1.50, "hardware_isp": "EXPEED"},
    "alpha 7": {"name": "Sony Alpha 7 Series", "w": 9504, "h": 6336, "mp": 61.0, "ratio": 1.50, "hardware_isp": "BIONZ"},
    "ilce-7": {"name": "Sony ILCE-7 Series", "w": 7952, "h": 5304, "mp": 42.4, "ratio": 1.50, "hardware_isp": "BIONZ"},
    "fujifilm x": {"name": "Fujifilm X Series", "w": 6240, "h": 4160, "mp": 26.1, "ratio": 1.50, "hardware_isp": "X-Processor"},
    "leica": {"name": "Leica M/Q Series", "w": 8368, "h": 5584, "mp": 47.0, "ratio": 1.50, "hardware_isp": "Maestro"},
}

# Standard Mobile and Desktop Screen Resolutions (Width, Height, Device Label)
KNOWN_SCREEN_RESOLUTIONS: List[Tuple[int, int, str]] = [
    # Mobile Screens (Portrait)
    (1170, 2532, "Apple iPhone 12 / 13 / 14 Pro"),
    (1284, 2778, "Apple iPhone 12 / 13 / 14 Pro Max"),
    (1179, 2556, "Apple iPhone 15 / 16 Pro"),
    (1290, 2796, "Apple iPhone 14 / 15 / 16 Pro Max"),
    (1080, 2400, "Samsung Galaxy / Android FHD+ (20:9)"),
    (1440, 3200, "Samsung Galaxy QHD+ (20:9)"),
    (1080, 2340, "Android 19.5:9 Display"),
    (750, 1334, "Apple iPhone 7 / 8 / SE"),
    (828, 1792, "Apple iPhone 11 / XR"),
    (1242, 2688, "Apple iPhone XS Max / 11 Pro Max"),
    # Mobile Screens (Landscape)
    (2532, 1170, "Apple iPhone Pro (Landscape)"),
    (2796, 1290, "Apple iPhone Pro Max (Landscape)"),
    (2400, 1080, "Android FHD+ (Landscape)"),
    # Desktop & Laptop Displays
    (1920, 1080, "Full HD 1080p Desktop/Monitor"),
    (2560, 1440, "QHD 1440p Desktop/Monitor"),
    (3840, 2160, "4K UHD Desktop/Monitor"),
    (2880, 1800, "MacBook Pro 15-inch Retina"),
    (3024, 1964, "MacBook Pro 14-inch Liquid Retina"),
    (3456, 2234, "MacBook Pro 16-inch Liquid Retina"),
]


def detect_screen_recapture_moire(file_path: str) -> Tuple[Dict[str, Any], List[MediaFinding]]:
    """Detect screen re-photography Moiré patterns using 2D FFT magnitude spectrum harmonic peak analysis.

    When an optical sensor photographs an LCD/OLED display, spatial aliasing between
    the display subpixel grid and the camera Bayer mosaic array produces periodic 2D
    interference waves (Moiré). In 2D Fourier space, these manifest as sharp harmonic
    peaks located off the primary DC and cardinal frequency axes.
    """
    findings: List[MediaFinding] = []
    metrics: Dict[str, Any] = {
        "moire_detected": False,
        "peak_energy_score": 0.0,
        "harmonic_peak_count": 0,
        "spectral_entropy": 0.0,
    }

    try:
        img = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return metrics, findings

        # Standardize size for consistent frequency resolution
        target_size = 512
        resized = cv2.resize(img, (target_size, target_size), interpolation=cv2.INTER_AREA)

        # Apply 2D Hanning window to prevent edge leakage in FFT
        hanning_1d = np.hanning(target_size)
        hanning_2d = np.outer(hanning_1d, hanning_1d)
        windowed = (resized.astype(np.float32) - 128.0) * hanning_2d

        # 2D Fast Fourier Transform
        f_transform = np.fft.fft2(windowed)
        f_shift = np.fft.fftshift(f_transform)
        magnitude = np.log1p(np.abs(f_shift))

        cy, cx = target_size // 2, target_size // 2

        # Create high-pass radial mask: ignore low frequencies (natural image content)
        y, x = np.ogrid[:target_size, :target_size]
        dist_from_center = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        high_pass_mask = (dist_from_center >= 35) & (dist_from_center <= 220)

        # Mask out cardinal axes (horizontal & vertical central bands contain boundary steps)
        axis_exclusion = 4
        off_axis_mask = (np.abs(x - cx) > axis_exclusion) & (np.abs(y - cy) > axis_exclusion)
        eval_mask = high_pass_mask & off_axis_mask

        eval_magnitudes = magnitude[eval_mask]
        if len(eval_magnitudes) == 0:
            return metrics, findings

        # Robust statistics via Median and Median Absolute Deviation (MAD)
        median_mag = float(np.median(eval_magnitudes))
        mad = float(np.median(np.abs(eval_magnitudes - median_mag)))
        robust_std = mad * 1.4826 + 1e-6

        # Identify prominent local peaks in the 2D spectrum
        z_scores = np.zeros_like(magnitude)
        z_scores[eval_mask] = (magnitude[eval_mask] - median_mag) / robust_std

        # Dilate to find strict local maxima
        local_max = cv2.dilate(z_scores, np.ones((5, 5), np.uint8))
        peak_locations = (z_scores == local_max) & (z_scores > 4.2) & eval_mask

        num_peaks = int(np.sum(peak_locations))
        max_z_score = float(np.max(z_scores[eval_mask])) if num_peaks > 0 else 0.0

        # Spectral entropy across the high-pass ring
        norm_mag = eval_magnitudes / (np.sum(eval_magnitudes) + 1e-12)
        entropy = float(-np.sum(norm_mag * np.log2(norm_mag + 1e-12)))

        metrics["peak_energy_score"] = round(max_z_score, 2)
        metrics["harmonic_peak_count"] = num_peaks
        metrics["spectral_entropy"] = round(entropy, 3)

        # Screen re-photography produces at least 4 conjugate/harmonic grid peaks
        if num_peaks >= 4 and max_z_score >= 4.2:
            metrics["moire_detected"] = True
            findings.append(
                MediaFinding(
                    code="IMG_MOIRE_RECAPTURE_DETECTED",
                    severity="high",
                    description=(
                        "Screen re-photography Moiré pattern detected. 2D FFT magnitude spectrum reveals "
                        "harmonic lattice frequency spikes characteristic of an LCD/OLED display subpixel grid "
                        "re-photographed by a physical lens."
                    ),
                    evidence=(
                        f"2D FFT harmonic peak z-score: {max_z_score:.2f} (Threshold 4.20). "
                        f"Detected {num_peaks} off-axis lattice peaks with high-frequency spectral entropy {entropy:.2f}."
                    ),
                    location="2D Fourier magnitude spectrum (off-axis harmonic band)",
                )
            )

    except Exception as e:
        metrics["error"] = str(e)

    return metrics, findings


def detect_screenshot_laundering(
    file_path: str,
    metadata: Dict[str, Any],
) -> Tuple[Dict[str, Any], List[MediaFinding]]:
    """Detect screenshot laundering used to scrub AI generation traces and EXIF markers.

    Evaluates:
    - Standard mobile and desktop screen resolutions (iPhone 1170x2532, 1290x2796, FHD+ 1080x2400, Retina).
    - Mobile screen aspect ratios (19.5:9, 20:9).
    - Synthetic edge boundaries (uniform 0-variance letterbox rows or navigation bars).
    - Display DPI (72 or 144 DPI) and PNG screen capture signatures.
    """
    findings: List[MediaFinding] = []
    metrics: Dict[str, Any] = {
        "screenshot_detected": False,
        "matched_device": None,
        "aspect_ratio": 0.0,
        "synthetic_edge_bars": False,
    }

    try:
        with Image.open(file_path) as img:
            w, h = img.size
            dpi = img.info.get("dpi", (72, 72))
            dpi_x = dpi[0] if isinstance(dpi, tuple) else dpi
            format_name = (img.format or "").upper()

        aspect_ratio = round(max(w, h) / max(min(w, h), 1), 3)
        metrics["aspect_ratio"] = aspect_ratio
        metrics["dimensions"] = f"{w}x{h}"

        # 1. Exact Screen Dimension Matching
        matched_device = None
        for screen_w, screen_h, label in KNOWN_SCREEN_RESOLUTIONS:
            if (w == screen_w and h == screen_h) or (w == screen_h and h == screen_w):
                matched_device = label
                break

        # 2. Aspect Ratio Matching for Mobile Screens
        is_mobile_ratio = False
        mobile_ratio_label = None
        if 2.15 <= aspect_ratio <= 2.18:
            is_mobile_ratio = True
            mobile_ratio_label = "Modern Smartphone Display (19.5:9 aspect ratio, e.g. iPhone / Pixel)"
        elif 2.21 <= aspect_ratio <= 2.24:
            is_mobile_ratio = True
            mobile_ratio_label = "Tall Smartphone Display (20:9 aspect ratio, e.g. Samsung Galaxy)"

        # 3. Synthetic Edge / Letterbox Bar Inspection
        cv_img = cv2.imread(file_path)
        synthetic_bars = False
        if cv_img is not None and cv_img.shape[0] > 100:
            # Check top 25 rows and bottom 25 rows for solid color or zero-variance bars
            top_strip = cv_img[:25, :, :]
            bottom_strip = cv_img[-25:, :, :]
            top_var = np.var(top_strip)
            bottom_var = np.var(bottom_strip)

            if top_var < 5.0 or bottom_var < 5.0:
                synthetic_bars = True
                metrics["synthetic_edge_bars"] = True

        # Synthesize screenshot laundering determination
        if matched_device:
            metrics["screenshot_detected"] = True
            metrics["matched_device"] = matched_device
            findings.append(
                MediaFinding(
                    code="IMG_SCREENSHOT_LAUNDERING_DETECTED",
                    severity="high",
                    description=(
                        f"Screenshot laundering detected: Exact resolution matches {matched_device}. "
                        "Attackers frequently screenshot synthetic images to scrub generative metadata, "
                        "watermarks, and frequency residual artifacts."
                    ),
                    evidence=(
                        f"Dimensions {w}x{h} match hardware profile: {matched_device}. "
                        f"Display DPI: {dpi_x}, Format: {format_name}."
                    ),
                    location="Image geometry & container header",
                )
            )
        elif is_mobile_ratio and synthetic_bars:
            metrics["screenshot_detected"] = True
            metrics["matched_device"] = mobile_ratio_label
            findings.append(
                MediaFinding(
                    code="IMG_SCREENSHOT_LAUNDERING_DETECTED",
                    severity="medium",
                    description=(
                        f"Screenshot laundering suspected: Aspect ratio and edge boundaries match {mobile_ratio_label}."
                    ),
                    evidence=(
                        f"Aspect ratio {aspect_ratio}:1 with solid synthetic boundary bars (variance: "
                        f"top={top_var:.1f}, bottom={bottom_var:.1f})."
                    ),
                    location="Perimeter boundary raster",
                )
            )

    except Exception as e:
        metrics["error"] = str(e)

    return metrics, findings


def validate_metadata_against_image_physics(
    file_path: str,
    metadata: Dict[str, Any],
) -> Tuple[Dict[str, Any], List[MediaFinding]]:
    """Cross-Modal Validation: Verify whether claimed EXIF metadata agrees with physical image reality.

    Checks:
    1. Sensor Resolution & Aspect Ratio: Claims professional 3:2 DSLR, but is square 1:1 (AI) or screenshot.
    2. Quantization Tables vs Camera ISP: Claims DSLR hardware, but uses standard software (IJG/PIL) tables.
    3. Claimed Aperture vs Optical Depth of Field: Claims f/1.4 wide aperture, but has uniform infinite sharpness.
    4. Claimed High ISO vs Sensor Shot Noise: Claims ISO 6400, but has zero noise variance (smooth AI render).
    """
    findings: List[MediaFinding] = []
    evaluations: Dict[str, Any] = {
        "claimed_camera": None,
        "sensor_resolution_check": "passed",
        "quantization_check": "passed",
        "aperture_dof_check": "passed",
        "iso_noise_check": "passed",
    }

    try:
        # Load EXIF tags
        camera_make = str(metadata.get("camera_make") or "").strip()
        camera_model = str(metadata.get("camera_model") or "").strip()
        claimed_camera = f"{camera_make} {camera_model}".strip()
        evaluations["claimed_camera"] = claimed_camera or "None"

        # Read image dimensions and quantization
        with Image.open(file_path) as pil_img:
            img_w, img_h = pil_img.size
            q_tables = getattr(pil_img, "quantization", None)

        cv_img = cv2.imread(file_path)
        if cv_img is None:
            return evaluations, findings

        # -------------------------------------------------------------
        # CHECK 1: Sensor Resolution & Aspect Ratio Physical Mismatch
        # -------------------------------------------------------------
        if claimed_camera:
            camera_lower = claimed_camera.lower()
            matched_spec = None
            for key, spec in KNOWN_CAMERA_SPECS.items():
                if key in camera_lower:
                    matched_spec = spec
                    break

            if matched_spec:
                actual_ratio = max(img_w, img_h) / max(min(img_w, img_h), 1)
                actual_mp = (img_w * img_h) / 1_000_000.0

                # 1:1 Square (common in diffusion generators, but also valid user crops)
                is_square = abs(actual_ratio - 1.0) < 0.05
                is_screenshot_ratio = actual_ratio > 1.85

                if is_square:
                    evaluations["sensor_resolution_check"] = "flagged_crop"
                    findings.append(
                        MediaFinding(
                            code="METADATA_ASPECT_RATIO_NON_NATIVE",
                            severity="medium",
                            description=(
                                f"Non-native sensor aspect ratio: EXIF claims native '{claimed_camera}' (native 3:2 sensor, {matched_spec['mp']} MP), "
                                f"but file is 1:1 square ({img_w}x{img_h}). While square dimensions alone do not prove forgery (due to legitimate user cropping), "
                                f"absence of in-camera digital crop EXIF tags warrants corroborating analysis via quantization tables and noise variance."
                            ),
                            evidence=(
                                f"Claimed hardware: {matched_spec['name']} ({matched_spec['w']}x{matched_spec['h']}, 3:2 native). "
                                f"Measured file: {img_w}x{img_h} (1:1 aspect ratio, {actual_mp:.2f} MP). Requires corroboration."
                            ),
                            location="EXIF Camera Model vs Pixel Dimensions",
                        )
                    )
                elif is_screenshot_ratio:
                    evaluations["sensor_resolution_check"] = "failed"
                    findings.append(
                        MediaFinding(
                            code="METADATA_PHYSICAL_RESOLUTION_MISMATCH",
                            severity="critical",
                            description=(
                                f"Physical sensor contradiction: EXIF claims DSLR '{claimed_camera}', but dimensions "
                                f"({img_w}x{img_h}) match a mobile or display screen aspect ratio ({actual_ratio:.2f}:1)."
                            ),
                            evidence=(
                                f"Claimed sensor ratio {matched_spec['ratio']}:1 vs Actual ratio {actual_ratio:.2f}:1."
                            ),
                            location="EXIF Camera Model vs Pixel Dimensions",
                        )
                    )

        # -------------------------------------------------------------
        # CHECK 2: Quantization Matrix vs Camera Hardware ISP
        # -------------------------------------------------------------
        if claimed_camera and q_tables and 0 in q_tables:
            table_0 = np.array(list(q_tables[0]), dtype=float)
            q50_arr = np.array(STANDARD_IJG_Q50_LUM, dtype=float)

            # In IJG standard software encoders (PIL, libjpeg, OpenCV, web generators),
            # any quality setting scales STANDARD_IJG_Q50_LUM uniformly (ratio std < 0.08).
            # Hardware camera ISPs (Canon DIGIC, Sony BIONZ, Nikon EXPEED) use custom psycho-visual tables (ratio std > 0.25).
            ratios = table_0 / q50_arr
            ratio_std = float(np.std(ratios))
            ratio_mean = float(np.mean(ratios))

            if ratio_std < 0.08:
                evaluations["quantization_check"] = "failed"
                findings.append(
                    MediaFinding(
                        code="METADATA_QUANTIZATION_HARDWARE_MISMATCH",
                        severity="high",
                        description=(
                            f"Lying metadata detected: Claimed camera '{claimed_camera}' utilizes proprietary hardware "
                            "ISP quantization tables, but this file was compressed using standard Independent JPEG Group (IJG) "
                            "or PIL software quantization tables. Proves software creation or re-encoding."
                        ),
                        evidence=(
                            f"DQT Table 0 matches Standard IJG Software matrix (Ratio std: {ratio_std:.4f}, Mean scale: {ratio_mean:.2f}). "
                            f"Hardware camera ISP was not used to produce this JPEG stream."
                        ),
                        location="JPEG DQT Marker vs EXIF Camera Make/Model",
                    )
                )

        # -------------------------------------------------------------
        # CHECK 3: Claimed Optical Aperture vs Physical Depth of Field (DoF)
        # -------------------------------------------------------------
        # Parse aperture (FNumber) from EXIF
        f_number = None
        try:
            import piexif
            exif_dict = piexif.load(file_path)
            exif_ifd = exif_dict.get("Exif", {})
            fnum_raw = exif_ifd.get(piexif.ExifIFD.FNumber)
            if fnum_raw and isinstance(fnum_raw, tuple) and len(fnum_raw) == 2 and fnum_raw[1] > 0:
                f_number = fnum_raw[0] / fnum_raw[1]
        except Exception:
            pass

        # Check for wide aperture (e.g. f/1.2, f/1.4, f/1.8, f/2.0)
        if f_number and f_number <= 2.0:
            gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
            h, w = gray.shape

            # Compute regional Laplacian sharpness
            margin_h, margin_w = int(h * 0.25), int(w * 0.25)
            center_patch = gray[margin_h : h - margin_h, margin_w : w - margin_w]
            corners = [
                gray[:margin_h, :margin_w],  # Top-left
                gray[:margin_h, w - margin_w :],  # Top-right
                gray[h - margin_h :, :margin_w],  # Bottom-left
                gray[h - margin_h :, w - margin_w :],  # Bottom-right
            ]

            var_center = float(cv2.Laplacian(center_patch, cv2.CV_64F).var())
            corner_vars = [float(cv2.Laplacian(c, cv2.CV_64F).var()) for c in corners]
            mean_corner_var = float(np.mean(corner_vars))

            ratio = mean_corner_var / (var_center + 1e-6)
            evaluations["aperture_dof_metrics"] = {
                "f_number": f_number,
                "center_sharpness": round(var_center, 1),
                "corner_sharpness": round(mean_corner_var, 1),
                "sharpness_ratio": round(ratio, 2),
            }

            # A wide aperture (f/1.4) physically mandates optical defocus / bokeh away from the plane of focus.
            # If all 4 corners exhibit razor-sharp edge gradients comparable to the center, it contradicts optical physics.
            if var_center > 150.0 and mean_corner_var > 150.0 and ratio > 0.85:
                evaluations["aperture_dof_check"] = "failed"
                findings.append(
                    MediaFinding(
                        code="METADATA_OPTICAL_DOF_MISMATCH",
                        severity="high",
                        description=(
                            f"Optical physics contradiction: EXIF specifies ultra-wide aperture f/{f_number:.1f}, "
                            "which physically produces shallow depth of field (defocused background / optical bokeh). "
                            "However, pixel analysis reveals uniform edge sharpness across all 4 corners and center."
                        ),
                        evidence=(
                            f"Claimed aperture: f/{f_number:.1f}. Center Laplacian sharpness: {var_center:.1f}, "
                            f"Periphery corner sharpness: {mean_corner_var:.1f} (Uniformity ratio: {ratio:.2f})."
                        ),
                        location="EXIF FNumber vs Spatial Gradient Sharpness",
                    )
                )

        # -------------------------------------------------------------
        # CHECK 4: Claimed High ISO vs Residual Sensor Shot Noise
        # -------------------------------------------------------------
        # Parse ISO from EXIF
        iso_val = None
        try:
            import piexif
            exif_dict = piexif.load(file_path)
            exif_ifd = exif_dict.get("Exif", {})
            iso_raw = exif_ifd.get(piexif.ExifIFD.ISOSpeedRatings)
            if isinstance(iso_raw, (int, float)):
                iso_val = int(iso_raw)
            elif isinstance(iso_raw, tuple) and len(iso_raw) > 0:
                iso_val = int(iso_raw[0])
        except Exception:
            pass

        if iso_val and iso_val >= 3200:
            gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
            # Find smooth flat patches using local standard deviation filter
            denoised = cv2.GaussianBlur(gray, (5, 5), 0)
            noise_residual = np.abs(gray.astype(np.float32) - denoised.astype(np.float32))

            # Select the smoothest 10% patches to evaluate sensor photon noise
            flat_mask = cv2.Sobel(denoised, cv2.CV_64F, 1, 1, ksize=3)
            flat_threshold = np.percentile(np.abs(flat_mask), 25)
            flat_pixels = noise_residual[np.abs(flat_mask) < flat_threshold]

            residual_std = float(np.std(flat_pixels)) if len(flat_pixels) > 100 else 0.0
            evaluations["iso_noise_metrics"] = {
                "claimed_iso": iso_val,
                "residual_noise_std": round(residual_std, 3),
            }

            # At ISO 3200-6400, CMOS sensors physically exhibit noticeable photon shot noise (std > 1.2).
            # Smooth synthetic AI diffusion models exhibit hyper-clean surfaces with near-zero noise.
            if residual_std < 0.40:
                evaluations["iso_noise_check"] = "failed"
                findings.append(
                    MediaFinding(
                        code="METADATA_SENSOR_ISO_NOISE_MISMATCH",
                        severity="critical",
                        description=(
                            f"Sensor physics contradiction: EXIF specifies high sensitivity ISO {iso_val}, "
                            "which physically produces noticeable photon shot noise and sensor read noise. "
                            "Pixel analysis reveals a hyper-smooth synthetic texture with near-zero noise variance."
                        ),
                        evidence=(
                            f"Claimed ISO: {iso_val}. Measured flat patch noise std: {residual_std:.3f} "
                            "(Expected physical sensor noise: > 1.20)."
                        ),
                        location="EXIF ISOSpeedRatings vs Residual Photon Shot Noise",
                    )
                )

    except Exception as e:
        evaluations["error"] = str(e)

    return evaluations, findings


def evaluate_authenticity_verdict(
    findings: List[MediaFinding],
    risk_score: float,
    has_cryptographic_origin: bool = False,
) -> Dict[str, Any]:
    """Evaluate comprehensive authenticity status according to the core forensic rule:
    'Absence of detectable tampering != Verified Genuine'.

    Verdicts:
    1. VERIFIED_GENUINE: Score <= 30 AND Cryptographic C2PA / hardware anchor verified.
    2. NO_TAMPERING_FOUND_UNVERIFIED: Score <= 30 BUT NO cryptographic origin exists.
    3. LAUNDERED_SUSPECT: Screen re-photography Moiré or screenshot laundering detected.
    4. METADATA_FORGERY_DETECTED: Physical contradiction between EXIF and image pixels.
    5. HIGH_RISK_FORGERY: AI synthesis, copy-move, or splicing detected.
    """
    finding_codes = {f.code for f in findings}

    # Check for metadata forgery
    metadata_forgery_codes = {
        "METADATA_PHYSICAL_RESOLUTION_MISMATCH",
        "METADATA_QUANTIZATION_HARDWARE_MISMATCH",
        "METADATA_OPTICAL_DOF_MISMATCH",
        "METADATA_SENSOR_ISO_NOISE_MISMATCH",
    }
    has_metadata_forgery = bool(finding_codes.intersection(metadata_forgery_codes))

    # Check for laundering
    laundering_codes = {
        "IMG_MOIRE_RECAPTURE_DETECTED",
        "IMG_SCREENSHOT_LAUNDERING_DETECTED",
    }
    has_laundering = bool(finding_codes.intersection(laundering_codes))

    # Check for direct synthesis / manipulation
    forgery_codes = {
        "IMG_COPY_MOVE_DETECTED",
        "IMG_SOFTWARE_EDIT_DETECTED",
        "IMG_ELA_ANOMALY",
    }
    has_forgery = bool(finding_codes.intersection(forgery_codes))

    if has_metadata_forgery:
        verdict = "METADATA_FORGERY_DETECTED"
        badge_color = "red"
        title = "Lying Metadata & Physical Contradiction"
        warning = (
            "CRITICAL ALERT: File metadata directly contradicts physical optical and sensor reality. "
            "EXIF tags were forged or injected onto an unrelated or synthetic digital asset."
        )
    elif has_laundering:
        verdict = "LAUNDERED_SUSPECT"
        badge_color = "amber"
        title = "Laundered Asset Suspect"
        warning = (
            "FORENSIC WARNING: Screen re-photography or screenshot laundering detected. "
            "Attacker likely re-captured a synthetic image to wipe away digital traces and generative artifacts."
        )
    elif has_forgery or risk_score > 60.0:
        verdict = "HIGH_RISK_FORGERY"
        badge_color = "red"
        title = "Tampered / Synthetic Artifact"
        warning = "High forensic risk: Structural manipulation or synthetic generation artifacts detected."
    elif risk_score <= 30.0 and has_cryptographic_origin:
        verdict = "VERIFIED_GENUINE"
        badge_color = "emerald"
        title = "Cryptographically Verified Genuine"
        warning = "Verified authentic: Valid C2PA provenance manifest and untampered cryptographic hardware anchor."
    else:
        # THE CORE HACKATHON RULE: Score is low, NO tampering found, but NO cryptographic proof!
        verdict = "NO_TAMPERING_FOUND_UNVERIFIED"
        badge_color = "yellow"
        title = "Unverified Origin (No Tampering Found)"
        warning = (
            "CRITICAL FORENSIC NOTICE: Absence of detectable tampering artifacts does NOT constitute evidence of "
            "authenticity. This digital asset lacks verifiable C2PA cryptographic provenance or hardware secure-enclave "
            "signatures. An attacker may have laundered a synthetic fake via screenshot or re-compression to scrub digital traces."
        )

    return {
        "authenticity_verdict": verdict,
        "verdict_title": title,
        "badge_color": badge_color,
        "forensic_warning": warning,
        "has_cryptographic_origin": has_cryptographic_origin,
        "laundering_detected": has_laundering,
        "metadata_forgery_detected": has_metadata_forgery,
    }
