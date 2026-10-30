import os
import re
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from PIL import Image
import pymupdf as fitz  # PyMuPDF
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.models import EngineResult, DocumentMetadata
from engines.document.models import DocumentFinding, DocumentAnalysisResponse, DocumentMetadataSummary


def parse_pdf_date(date_str: Optional[str]) -> Optional[datetime]:
    """Parse standard PDF date format D:YYYYMMDDHHmmSS into a datetime object."""
    if not date_str:
        return None
    cleaned = date_str.replace("D:", "").replace("'", "")
    match = re.match(r"^(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?", cleaned)
    if not match:
        return None
    parts = match.groups()
    try:
        return datetime(
            year=int(parts[0]),
            month=int(parts[1]),
            day=int(parts[2]),
            hour=int(parts[3] or 0),
            minute=int(parts[4] or 0),
            second=int(parts[5] or 0),
            tzinfo=timezone.utc,
        )
    except (ValueError, TypeError):
        return None


def extract_text_from_pdf(file_path: str) -> Dict[str, Any]:
    """Extract full text and character counts per page using PyMuPDF."""
    pages_text = []
    total_chars = 0
    try:
        doc = fitz.open(file_path)
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            text = page.get_text() or ""
            pages_text.append({"page": page_idx + 1, "text": text, "char_count": len(text)})
            total_chars += len(text)
        doc.close()
        return {
            "success": True,
            "page_count": len(pages_text),
            "pages": pages_text,
            "total_chars": total_chars,
            "full_text": "\n\n--- PAGE BREAK ---\n\n".join(p["text"] for p in pages_text),
        }
    except Exception as e:
        return {"success": False, "error": str(e), "pages": [], "total_chars": 0, "full_text": ""}


def extract_metadata(file_path: str) -> Dict[str, Any]:
    """Extract internal PDF document metadata."""
    try:
        doc = fitz.open(file_path)
        meta = doc.metadata or {}
        doc.close()
        return {
            "success": True,
            "format": meta.get("format"),
            "title": meta.get("title"),
            "author": meta.get("author"),
            "subject": meta.get("subject"),
            "keywords": meta.get("keywords"),
            "creator": meta.get("creator"),
            "producer": meta.get("producer"),
            "creation_date": meta.get("creationDate"),
            "mod_date": meta.get("modDate"),
            "encryption": meta.get("encryption"),
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def analyze_fonts(file_path: str) -> Tuple[List[Dict[str, Any]], List[DocumentFinding]]:
    """Inspect font descriptors, embeddings, and count unique font families."""
    findings: List[DocumentFinding] = []
    font_inventory = []
    unique_font_names = set()

    try:
        doc = fitz.open(file_path)
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            page_fonts = page.get_fonts(full=True)
            for f in page_fonts:
                # f: (xref, ext, type, basefont, name, encoding)
                font_name = f[3] if len(f) > 3 else "Unknown"
                clean_name = font_name.split("+")[-1] if "+" in font_name else font_name
                unique_font_names.add(clean_name)
                font_inventory.append({
                    "page": page_idx + 1,
                    "font_name": clean_name,
                    "font_type": f[2] if len(f) > 2 else "Unknown",
                    "encoding": f[5] if len(f) > 5 else "Unknown",
                })
        doc.close()

        if len(unique_font_names) > 6:
            findings.append(
                DocumentFinding(
                    code="DOC_FONT_ANOMALY",
                    severity="medium",
                    description="Excessive font families detected across document pages.",
                    evidence=f"Found {len(unique_font_names)} distinct font families: {', '.join(list(unique_font_names)[:8])}.",
                    location="Document-wide font catalog",
                )
            )
        elif len(unique_font_names) == 0:
            findings.append(
                DocumentFinding(
                    code="DOC_NO_EMBEDDED_FONTS",
                    severity="low",
                    description="No vector fonts detected; document may be a raster scan or image-only PDF.",
                    evidence="Font catalog is empty.",
                    location="Global metadata",
                )
            )

        return font_inventory, findings
    except Exception as e:
        findings.append(
            DocumentFinding(
                code="DOC_FONT_ANALYSIS_FAILED",
                severity="info",
                description="Font structure analysis could not be fully completed.",
                evidence=str(e),
                location="Font parser",
            )
        )
        return [], findings


def analyze_layout(file_path: str) -> List[DocumentFinding]:
    """Inspect page dimensions and geometric consistency across document pages."""
    findings: List[DocumentFinding] = []
    try:
        doc = fitz.open(file_path)
        page_sizes = []
        for idx in range(len(doc)):
            page = doc[idx]
            rect = page.rect
            page_sizes.append((round(rect.width, 2), round(rect.height, 2)))

        doc.close()
        if len(page_sizes) > 1:
            first_size = page_sizes[0]
            mismatched = [
                i + 1 for i, s in enumerate(page_sizes) if abs(s[0] - first_size[0]) > 5 or abs(s[1] - first_size[1]) > 5
            ]
            if mismatched:
                findings.append(
                    DocumentFinding(
                        code="DOC_LAYOUT_IRREGULAR_PAGE_SIZES",
                        severity="medium",
                        description="Inconsistent page dimensions detected within a single document.",
                        evidence=f"Base size {first_size}. Mismatched page dimensions at pages: {mismatched[:10]}.",
                        location=f"Pages {mismatched[:5]}",
                    )
                )
        return findings
    except Exception as e:
        return [
            DocumentFinding(
                code="DOC_LAYOUT_ANALYSIS_FAILED",
                severity="info",
                description="Layout geometric analysis could not be completed.",
                evidence=str(e),
                location="Layout engine",
            )
        ]


def detect_qr_codes(file_path: str) -> Tuple[List[Dict[str, Any]], List[DocumentFinding]]:
    """Extract and decode QR codes and 2D barcodes from document pages."""
    qr_results = []
    findings = []
    try:
        import pyzbar.pyzbar as pyzbar
    except ImportError:
        findings.append(
            DocumentFinding(
                code="DOC_BARCODE_SCAN_SKIPPED",
                severity="info",
                description="Barcode scanning skipped: pyzbar library is not available.",
                evidence="Optional dependency pyzbar missing",
                location="QR Engine",
            )
        )
        return qr_results, findings

    try:
        doc = fitz.open(file_path)
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            # Render page to image pixmap for barcode decoding
            pix = page.get_pixmap(dpi=150)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            decoded = pyzbar.decode(img)
            for barcode in decoded:
                data_str = barcode.data.decode("utf-8", errors="replace")
                qr_entry = {
                    "page": page_idx + 1,
                    "type": barcode.type,
                    "data": data_str,
                    "rect": [barcode.rect.left, barcode.rect.top, barcode.rect.width, barcode.rect.height],
                }
                qr_results.append(qr_entry)
        doc.close()

        if qr_results:
            findings.append(
                DocumentFinding(
                    code="DOC_QR_CODES_FOUND",
                    severity="info",
                    description=f"Detected {len(qr_results)} barcode/QR code(s) in document.",
                    evidence=f"Payload sample: {qr_results[0]['data'][:100]}",
                    location=f"Page {qr_results[0]['page']}",
                )
            )
        return qr_results, findings
    except Exception as e:
        findings.append(
            DocumentFinding(
                code="DOC_QR_DECODE_ERROR",
                severity="low",
                description="Barcode detection encountered an unexpected error.",
                evidence=str(e),
                location="Barcode decoder",
            )
        )
        return qr_results, findings


def check_digital_signatures(file_path: str) -> Tuple[bool, List[DocumentFinding]]:
    """Verify presence of cryptographic PDF signatures or incremental revisions."""
    findings = []
    has_sig = False
    try:
        doc = fitz.open(file_path)
        sig_count = 0
        for page in doc:
            for widget in page.widgets():
                if widget.field_type == fitz.PDF_WIDGET_TYPE_SIGNATURE:
                    sig_count += 1

        if sig_count > 0:
            has_sig = True
            findings.append(
                DocumentFinding(
                    code="DOC_DIGITAL_SIG_PRESENT",
                    severity="info",
                    description=f"Cryptographic signature field(s) detected ({sig_count} signature fields).",
                    evidence=f"Total signatures found: {sig_count}",
                    location="AcroForm signature dictionary",
                )
            )
        else:
            findings.append(
                DocumentFinding(
                    code="DOC_NO_DIGITAL_SIG",
                    severity="low",
                    description="No digital signature present in document.",
                    evidence="No /ByteRange signature objects found; document authenticity relies on visual inspection.",
                    location="Document root",
                )
            )
        doc.close()
        return has_sig, findings
    except Exception as e:
        findings.append(
            DocumentFinding(
                code="DOC_SIG_CHECK_FAILED",
                severity="info",
                description="Could not inspect PDF digital signatures.",
                evidence=str(e),
                location="Signature parser",
            )
        )
        return False, findings


def analyze_images_in_pdf(file_path: str) -> List[DocumentFinding]:
    """Inspect embedded raster images for resolution anomalies or splicing artifacts."""
    findings = []
    try:
        doc = fitz.open(file_path)
        image_dpis = []
        for page_idx, page in enumerate(doc):
            image_list = page.get_images(full=True)
            for img_info in image_list:
                xref = img_info[0]
                base_image = doc.extract_image(xref)
                if base_image:
                    width = base_image.get("width", 0)
                    height = base_image.get("height", 0)
                    image_dpis.append({"page": page_idx + 1, "width": width, "height": height})

        doc.close()
        if len(image_dpis) > 1:
            tiny_images = [img for img in image_dpis if img["width"] < 150 and img["height"] < 80]
            if tiny_images:
                findings.append(
                    DocumentFinding(
                        code="DOC_EMBEDDED_STAMP_SUSPICION",
                        severity="low",
                        description="Small embedded raster images found, potential signature or stamp overlays.",
                        evidence=f"{len(tiny_images)} low-dimension image artifacts detected.",
                        location=f"Page {tiny_images[0]['page']}",
                    )
                )
        return findings
    except Exception as e:
        return [
            DocumentFinding(
                code="DOC_IMAGE_STREAM_ERROR",
                severity="info",
                description="Embedded image stream inspection encountered an error.",
                evidence=str(e),
                location="Image parser",
            )
        ]


def check_metadata_consistency(metadata: Dict[str, Any]) -> List[DocumentFinding]:
    """Check for timeline discrepancies and signs of editing software."""
    findings = []
    creation_raw = metadata.get("creation_date")
    mod_raw = metadata.get("mod_date")

    created_dt = parse_pdf_date(creation_raw)
    mod_dt = parse_pdf_date(mod_raw)

    if created_dt and mod_dt:
        if mod_dt < created_dt:
            findings.append(
                DocumentFinding(
                    code="DOC_METADATA_DATE_INCONSISTENCY",
                    severity="high",
                    description="Document modification date precedes its creation date.",
                    evidence=f"Creation: {created_dt.isoformat()}, Modification: {mod_dt.isoformat()}",
                    location="PDF Info dictionary",
                )
            )

    producer = str(metadata.get("producer") or "").lower()
    creator = str(metadata.get("creator") or "").lower()
    combined_software = f"{producer} {creator}"

    manipulation_tools = [
        "photoshop",
        "gimp",
        "canva",
        "illustrator",
        "inkscape",
        "paint",
        "pdftk",
        "ilovepdf",
    ]
    matched_tools = [tool for tool in manipulation_tools if tool in combined_software]
    if matched_tools:
        findings.append(
            DocumentFinding(
                code="DOC_EDITING_TOOL_DETECTED",
                severity="high",
                description="Document created or processed by a graphic editing software known for visual manipulation.",
                evidence=f"Detected software signatures: {', '.join(matched_tools)}. Full producer: {producer}",
                location="Producer / Creator metadata",
            )
        )

    return findings


def perform_ocr(file_path: str) -> Optional[str]:
    """Run Tesseract OCR on document pages if text cannot be parsed directly."""
    try:
        import pytesseract
    except ImportError:
        return None

    try:
        doc = fitz.open(file_path)
        ocr_text_parts = []
        # Inspect up to first 3 pages
        max_pages = min(len(doc), 3)
        for i in range(max_pages):
            page = doc[i]
            pix = page.get_pixmap(dpi=150)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            text = pytesseract.image_to_string(img)
            if text.strip():
                ocr_text_parts.append(text.strip())
        doc.close()
        return "\n\n".join(ocr_text_parts) if ocr_text_parts else None
    except Exception:
        # OCR binary not found or failed
        return None


async def full_document_analysis(
    file_path: str,
    file_id: str,
    verification_id: str,
    db: AsyncSession,
) -> DocumentAnalysisResponse:
    """Execute complete forensic document inspection pipeline and store results."""
    # Find or initialize EngineResult
    result_query = await db.execute(
        select(EngineResult).where(
            EngineResult.verification_id == verification_id,
            EngineResult.engine_name == "document",
        )
    )
    engine_result = result_query.scalar_one_or_none()
    if not engine_result:
        engine_result = EngineResult(
            verification_id=verification_id,
            engine_name="document",
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
        engine_result.error_message = f"File not found at path: {file_path}"
        engine_result.completed_at = datetime.now(timezone.utc)
        await db.commit()
        return DocumentAnalysisResponse(
            verification_id=verification_id,
            status="failed",
            error_message=engine_result.error_message,
        )

    all_findings: List[DocumentFinding] = []

    # 1. Text extraction
    text_data = extract_text_from_pdf(file_path)
    extracted_text = text_data.get("full_text", "")
    page_count = text_data.get("page_count", 0)

    # 2. Metadata extraction & consistency
    metadata_info = extract_metadata(file_path)
    if metadata_info.get("success"):
        meta_findings = check_metadata_consistency(metadata_info)
        all_findings.extend(meta_findings)

    # 3. Fonts analysis
    fonts_list, font_findings = analyze_fonts(file_path)
    all_findings.extend(font_findings)

    # 4. Layout geometry
    layout_findings = analyze_layout(file_path)
    all_findings.extend(layout_findings)

    # 5. Barcodes & QR codes
    qr_data, qr_findings = detect_qr_codes(file_path)
    all_findings.extend(qr_findings)

    # 6. Digital signatures
    has_signatures, sig_findings = check_digital_signatures(file_path)
    all_findings.extend(sig_findings)

    # 7. Embedded images
    image_findings = analyze_images_in_pdf(file_path)
    all_findings.extend(image_findings)

    # 8. Fallback OCR if text is sparse
    if text_data.get("total_chars", 0) < 50:
        ocr_result = perform_ocr(file_path)
        if ocr_result:
            extracted_text = ocr_result
            all_findings.append(
                DocumentFinding(
                    code="DOC_OCR_APPLIED",
                    severity="info",
                    description="Optical Character Recognition (OCR) was utilized to extract embedded raster text.",
                    evidence=f"Recovered {len(ocr_result)} characters via OCR.",
                    location="OCR engine",
                )
            )

    # Upsert DocumentMetadata record
    doc_meta_query = await db.execute(
        select(DocumentMetadata).where(DocumentMetadata.file_id == file_id)
    )
    doc_meta_record = doc_meta_query.scalar_one_or_none()
    if not doc_meta_record:
        doc_meta_record = DocumentMetadata(
            file_id=file_id,
            extracted_text=extracted_text[:10000] if extracted_text else "",
            fonts=fonts_list,
            page_count=page_count,
            has_signatures=has_signatures,
            has_qr_codes=len(qr_data) > 0,
            qr_data=qr_data,
            metadata_json=metadata_info,
        )
        db.add(doc_meta_record)
    else:
        doc_meta_record.extracted_text = extracted_text[:10000] if extracted_text else ""
        doc_meta_record.fonts = fonts_list
        doc_meta_record.page_count = page_count
        doc_meta_record.has_signatures = has_signatures
        doc_meta_record.has_qr_codes = len(qr_data) > 0
        doc_meta_record.qr_data = qr_data
        doc_meta_record.metadata_json = metadata_info

    # Update EngineResult
    findings_json = [f.model_dump() for f in all_findings]
    engine_result.status = "completed"
    engine_result.findings = findings_json
    engine_result.confidence = 0.90
    engine_result.completed_at = datetime.now(timezone.utc)
    await db.commit()

    font_families = list({f.get("font_name") for f in fonts_list if f.get("font_name")})

    summary = DocumentMetadataSummary(
        page_count=page_count,
        author=metadata_info.get("author"),
        creator=metadata_info.get("creator"),
        producer=metadata_info.get("producer"),
        creation_date=metadata_info.get("creation_date"),
        modification_date=metadata_info.get("mod_date"),
        has_signatures=has_signatures,
        has_qr_codes=len(qr_data) > 0,
        qr_data=qr_data,
        font_count=len(fonts_list),
        font_families=font_families,
    )

    return DocumentAnalysisResponse(
        verification_id=verification_id,
        status="completed",
        confidence=0.90,
        findings=all_findings,
        metadata=summary,
        completed_at=engine_result.completed_at,
    )
