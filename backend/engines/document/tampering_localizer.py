"""
BeyondProof - Element-Level Tampering Localizer & Bounding Box Extractor
Identifies WHAT was edited, WHERE it was altered (normalized 0-100% coordinates),
and HOW it was manipulated (font splicing, vector whiteout, recompression ELA,
arithmetic manipulation, pasted signatures, or misaligned stamps).
"""

import os
import io
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import cv2
from PIL import Image, ImageChops, ImageEnhance
import fitz  # PyMuPDF


class SuspiciousRegion:
    def __init__(
        self,
        id: str,
        label: str,
        suspected_change: str,  # "MODIFIED", "ADDED", "REPLACED", "FONT_SPLICED", "ARITHMETIC_MANIPULATION", "OVERLAY"
        explanation: str,
        severity: str,          # "critical", "high", "medium", "low"
        bbox: List[float],      # [x, y, width, height] normalized percentage (0.0 to 100.0)
        page: int = 1,
        evidence: str = "",
    ):
        self.id = id
        self.label = label
        self.suspected_change = suspected_change
        self.explanation = explanation
        self.severity = severity
        self.bbox = bbox
        self.page = page
        self.evidence = evidence

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "label": self.label,
            "suspected_change": self.suspected_change,
            "explanation": self.explanation,
            "severity": self.severity,
            "bbox": self.bbox,
            "page": self.page,
            "evidence": self.evidence,
        }


def localize_tampering(
    file_path: str,
    output_dir: str = "./uploads/annotated",
    file_id: str = "temp",
    rule_results: List[Any] = None,
) -> Tuple[List[SuspiciousRegion], Optional[str]]:
    """
    Perform deep element-level inspection on the document file.
    Returns: (list of SuspiciousRegion, relative_path_to_annotated_preview_image)
    """
    regions: List[SuspiciousRegion] = []
    region_counter = 1

    is_pdf = file_path.lower().endswith(".pdf")
    page_width, page_height = 800, 1100

    # 1. First, incorporate any bounding boxes from document-specific rule failures (e.g. failed math, invalid PAN char, Verhoeff checksum)
    if rule_results:
        for r in rule_results:
            if not r.passed and r.bbox:
                regions.append(
                    SuspiciousRegion(
                        id=f"REG-RULE-{region_counter}",
                        label=r.field_name or r.rule_name,
                        suspected_change="MODIFIED" if r.severity in ["critical", "high"] else "INCONSISTENCY",
                        explanation=r.details,
                        severity=r.severity,
                        bbox=r.bbox,
                        page=1,
                        evidence=r.evidence,
                    )
                )
                region_counter += 1

    # 2. PDF Vector and Structural Font Splicing Inspection
    if is_pdf:
        try:
            doc = fitz.open(file_path)
            if len(doc) > 0:
                page = doc[0]
                rect = page.rect
                page_width = rect.width or 800
                page_height = rect.height or 1100

                # Extract spans for font and baseline analysis
                page_dict = page.get_text("dict")
                blocks = page_dict.get("blocks", [])

                for b_idx, block in enumerate(blocks):
                    if block.get("type") == 0:  # text block
                        lines = block.get("lines", [])
                        for l_idx, line in enumerate(lines):
                            spans = line.get("spans", [])
                            if len(spans) > 1:
                                # Compare fonts across spans in the same line
                                base_font = spans[0].get("font", "")
                                base_size = spans[0].get("size", 12.0)

                                for s_idx in range(1, len(spans)):
                                    curr_span = spans[s_idx]
                                    curr_font = curr_span.get("font", "")
                                    curr_size = curr_span.get("size", 12.0)
                                    curr_text = curr_span.get("text", "").strip()

                                    # Font mismatch or size jump within the same line indicates spliced text
                                    font_mismatch = curr_font and base_font and (curr_font != base_font) and not ("Bold" in curr_font and "Bold" in base_font)
                                    size_mismatch = abs(curr_size - base_size) > 2.0

                                    if (font_mismatch or size_mismatch) and len(curr_text) > 1:
                                        s_bbox = curr_span.get("bbox", [0, 0, 10, 10])
                                        x_pct = round((s_bbox[0] / page_width) * 100.0, 2)
                                        y_pct = round((s_bbox[1] / page_height) * 100.0, 2)
                                        w_pct = round(((s_bbox[2] - s_bbox[0]) / page_width) * 100.0, 2)
                                        h_pct = round(((s_bbox[3] - s_bbox[1]) / page_height) * 100.0, 2)

                                        # Avoid tiny spaces
                                        if w_pct > 1.5 and h_pct > 0.5:
                                            regions.append(
                                                SuspiciousRegion(
                                                    id=f"REG-FONT-{region_counter}",
                                                    label=f"Spliced Text: '{curr_text[:20]}'",
                                                    suspected_change="FONT_SPLICED",
                                                    explanation=f"Font typography mismatch! Line base font is '{base_font}' ({base_size:.1f}pt), but this segment is rendered in '{curr_font}' ({curr_size:.1f}pt). Indicates cut-and-paste text insertion.",
                                                    severity="high",
                                                    bbox=[x_pct, y_pct, w_pct, h_pct],
                                                    page=1,
                                                    evidence=f"Text: '{curr_text}', Font: {curr_font} vs {base_font}",
                                                )
                                            )
                                            region_counter += 1

                # Inspect vector drawings for whiteout / cover boxes
                drawings = page.get_drawings()
                for draw in drawings:
                    # Check for solid fill rectangles covering content
                    fill = draw.get("fill")
                    r_rect = draw.get("rect")
                    if fill and r_rect:
                        # If fill is white or near-white (1, 1, 1) and size is non-trivial
                        is_white = (isinstance(fill, (list, tuple)) and len(fill) >= 3 and fill[0] > 0.95 and fill[1] > 0.95 and fill[2] > 0.95)
                        if is_white and r_rect.width > 20 and r_rect.height > 8:
                            x_pct = round((r_rect.x0 / page_width) * 100.0, 2)
                            y_pct = round((r_rect.y0 / page_height) * 100.0, 2)
                            w_pct = round((r_rect.width / page_width) * 100.0, 2)
                            h_pct = round((r_rect.height / page_height) * 100.0, 2)

                            regions.append(
                                SuspiciousRegion(
                                    id=f"REG-WHITEOUT-{region_counter}",
                                    label="Whiteout Cover-up Box",
                                    suspected_change="OVERLAY",
                                    explanation="Solid white vector rectangle detected obscuring background text or objects.",
                                    severity="high",
                                    bbox=[x_pct, y_pct, w_pct, h_pct],
                                    page=1,
                                    evidence=f"Vector box size: {r_rect.width:.1f} x {r_rect.height:.1f} pt",
                                )
                            )
                            region_counter += 1

            doc.close()
        except Exception as e:
            print("PDF vector localization notice:", e)

    # 3. Computer Vision & Error Level Analysis (ELA) for Raster Images & Rendered PDF Pages
    try:
        cv_img = None
        if is_pdf:
            doc = fitz.open(file_path)
            if len(doc) > 0:
                pix = doc[0].get_pixmap(dpi=150)
                arr = np.frombuffer(pix.samples, dtype=np.uint8).reshape((pix.height, pix.width, pix.n))
                cv_img = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR if pix.n >= 3 else cv2.COLOR_GRAY2BGR)
                page_height, page_width = cv_img.shape[:2]
            doc.close()
        else:
            cv_img = cv2.imread(file_path)
            if cv_img is not None:
                page_height, page_width = cv_img.shape[:2]

        if cv_img is not None:
            # Perform localized ELA to find recompression anomalies
            pil_orig = Image.fromarray(cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB))
            buf = io.BytesIO()
            pil_orig.save(buf, "JPEG", quality=92)
            buf.seek(0)
            pil_resaved = Image.open(buf)
            diff = ImageChops.difference(pil_orig, pil_resaved)
            diff_arr = np.array(diff, dtype=np.float32)
            gray_diff = cv2.cvtColor(diff_arr, cv2.COLOR_RGB2GRAY)

            mean_val = np.mean(gray_diff)
            std_val = np.std(gray_diff)
            thresh_val = mean_val + (2.8 * std_val)

            _, mask = cv2.threshold(gray_diff, max(thresh_val, 25), 255, cv2.THRESH_BINARY)
            mask = mask.astype(np.uint8)

            # Morphological dilation to group adjacent pixel spikes into regions
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 15))
            dilated = cv2.dilate(mask, kernel, iterations=2)
            contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            for cnt in contours:
                x, y, w, h = cv2.boundingRect(cnt)
                area = w * h
                total_area = page_width * page_height

                # Focus on significant localized anomalies (0.5% to 20% of image area)
                if (area / total_area) > 0.003 and (area / total_area) < 0.25:
                    x_pct = round((x / page_width) * 100.0, 2)
                    y_pct = round((y / page_height) * 100.0, 2)
                    w_pct = round((w / page_width) * 100.0, 2)
                    h_pct = round((h / page_height) * 100.0, 2)

                    # Check if already covered by an existing region
                    overlapping = any(
                        abs(r.bbox[0] - x_pct) < 6.0 and abs(r.bbox[1] - y_pct) < 6.0
                        for r in regions
                    )
                    if not overlapping:
                        regions.append(
                            SuspiciousRegion(
                                id=f"REG-ELA-{region_counter}",
                                label="Compression Discontinuity Patch",
                                suspected_change="REPLACED",
                                explanation="Error Level Analysis (ELA) recompression variance spike! This localized zone has different compression history than surrounding document background, indicating a pasted photo, modified date, or spliced text block.",
                                severity="high",
                                bbox=[x_pct, y_pct, w_pct, h_pct],
                                page=1,
                                evidence=f"Localized ELA residual exceeds baseline by {std_val:.1f} sigma.",
                            )
                        )
                        region_counter += 1

    except Exception as e:
        print("CV ELA localization notice:", e)

    # 4. Generate Annotated Page Preview Image with High-Contrast Forensic Overlays
    annotated_rel_path = None
    try:
        if cv_img is not None:
            annotated_bgr = cv_img.copy()
            h_img, w_img = annotated_bgr.shape[:2]

            for reg in regions:
                x0 = int((reg.bbox[0] / 100.0) * w_img)
                y0 = int((reg.bbox[1] / 100.0) * h_img)
                w0 = int((reg.bbox[2] / 100.0) * w_img)
                h0 = int((reg.bbox[3] / 100.0) * h_img)
                x1 = min(w_img - 1, x0 + w0)
                y1 = min(h_img - 1, y0 + h0)

                # Color based on severity
                if reg.severity == "critical":
                    box_color = (40, 40, 230)      # Crimson Red
                    fill_color = (30, 30, 180)
                elif reg.severity == "high":
                    box_color = (20, 140, 240)     # Amber / Orange
                    fill_color = (15, 110, 200)
                else:
                    box_color = (220, 200, 0)      # Cyan
                    fill_color = (180, 160, 0)

                # Semi-transparent overlay box
                overlay = annotated_bgr.copy()
                cv2.rectangle(overlay, (x0, y0), (x1, y1), fill_color, -1)
                cv2.addWeighted(overlay, 0.25, annotated_bgr, 0.75, 0, annotated_bgr)

                # Crisp bounding box border
                cv2.rectangle(annotated_bgr, (x0, y0), (x1, y1), box_color, 2)

                # Corner crosshair tactical accents
                cross_len = min(12, max(4, w0 // 4, h0 // 4))
                cv2.line(annotated_bgr, (x0, y0), (x0 + cross_len, y0), (255, 255, 255), 2)
                cv2.line(annotated_bgr, (x0, y0), (x0, y0 + cross_len), (255, 255, 255), 2)
                cv2.line(annotated_bgr, (x1, y1), (x1 - cross_len, y1), (255, 255, 255), 2)
                cv2.line(annotated_bgr, (x1, y1), (x1, y1 - cross_len), (255, 255, 255), 2)

                # Numbered badge tag
                badge_text = f"[{reg.id}] {reg.label[:18]}"
                cv2.putText(
                    annotated_bgr,
                    badge_text,
                    (max(5, x0), max(18, y0 - 6)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.45,
                    box_color,
                    1,
                    cv2.LINE_AA,
                )

            os.makedirs(output_dir, exist_ok=True)
            out_filename = f"annotated_{file_id}.jpg"
            out_full_path = os.path.join(output_dir, out_filename)
            cv2.imwrite(out_full_path, annotated_bgr, [cv2.IMWRITE_JPEG_QUALITY, 90])
            annotated_rel_path = f"/uploads/annotated/{out_filename}"
    except Exception as e:
        print("Annotated image rendering notice:", e)

    return regions, annotated_rel_path
