import io
import pytest
import fitz
from httpx import AsyncClient
from engines.document.service import extract_text_from_pdf, extract_metadata


def create_sample_pdf_bytes(text: str = "BeyondProof Document Analysis Test") -> bytes:
    """Generate a valid PDF document with embedded text and metadata in memory."""
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), text)
    doc.set_metadata({
        "title": "Forensic Inspection Report",
        "author": "Forensic Auditor",
        "producer": "BeyondProof Test Engine",
    })
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes


@pytest.mark.asyncio
async def test_document_metadata_and_text_extraction(tmp_path):
    """Verify core document text and metadata extraction functions directly."""
    pdf_path = tmp_path / "test_doc.pdf"
    content = create_sample_pdf_bytes("Authentic Statement of Verification")
    pdf_path.write_bytes(content)

    # 1. Test Text Extraction
    text_data = extract_text_from_pdf(str(pdf_path))
    assert text_data["success"] is True
    assert text_data["page_count"] == 1
    assert "Authentic Statement of Verification" in text_data["full_text"]

    # 2. Test Metadata Extraction
    meta = extract_metadata(str(pdf_path))
    assert meta["success"] is True
    assert meta["title"] == "Forensic Inspection Report"
    assert meta["author"] == "Forensic Auditor"
    assert meta["producer"] == "BeyondProof Test Engine"


@pytest.mark.asyncio
async def test_document_analysis_endpoint(async_client: AsyncClient, auth_headers):
    """Verify document analysis API endpoint runs complete forensic pipeline."""
    pdf_bytes = create_sample_pdf_bytes("Confidential Agreement Document 2026")
    files = {"file": ("test_audit.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    upload_res = await async_client.post("/api/files/upload", files=files, headers=auth_headers)
    assert upload_res.status_code == 201
    file_id = upload_res.json()["id"]

    # Trigger document forensic analysis
    analyze_res = await async_client.post(
        "/api/document/analyze",
        json={"file_id": file_id},
        headers=auth_headers,
    )
    assert analyze_res.status_code == 200
    data = analyze_res.json()
    assert data["status"] == "completed"
    assert data["engine_name"] == "document"
    assert "verification_id" in data
    assert isinstance(data["findings"], list)
