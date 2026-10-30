import io
import pytest
from httpx import AsyncClient
from PIL import Image
from files.utils import compute_sha256


@pytest.mark.asyncio
async def test_upload_valid_pdf(async_client: AsyncClient, auth_headers):
    """Verify successful upload and categorization of a valid PDF document."""
    pdf_content = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n150\n%%EOF"
    files = {"file": ("contract.pdf", io.BytesIO(pdf_content), "application/pdf")}

    response = await async_client.post("/api/files/upload", files=files, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["original_name"] == "contract.pdf"
    assert data["file_type"] == "document"
    assert len(data["sha256_hash"]) == 64


@pytest.mark.asyncio
async def test_upload_valid_image(async_client: AsyncClient, auth_headers):
    """Verify successful upload of a JPEG image."""
    img = Image.new("RGB", (64, 64), color="red")
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG")
    buffer.seek(0)

    files = {"file": ("evidence.jpg", buffer, "image/jpeg")}
    response = await async_client.post("/api/files/upload", files=files, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["original_name"] == "evidence.jpg"
    assert data["file_type"] == "image"


@pytest.mark.asyncio
async def test_reject_invalid_file_type(async_client: AsyncClient, auth_headers):
    """Verify that unsupported or dangerous file extensions are rejected with 400 Bad Request."""
    bad_content = b"MZ\x90\x00\x03\x00\x00\x00"
    files = {"file": ("malware.exe", io.BytesIO(bad_content), "application/x-msdownload")}

    response = await async_client.post("/api/files/upload", files=files, headers=auth_headers)
    assert response.status_code == 400
    assert "not permitted" in response.json()["detail"]


@pytest.mark.asyncio
async def test_sha256_computation(tmp_path):
    """Verify cryptographic SHA-256 computation utility."""
    sample_file = tmp_path / "test_hash.txt"
    sample_file.write_bytes(b"BEYONDPROOF_FORENSIC_INTEGRITY")
    computed = compute_sha256(str(sample_file))
    # Known SHA-256 for "BEYONDPROOF_FORENSIC_INTEGRITY"
    import hashlib
    expected = hashlib.sha256(b"BEYONDPROOF_FORENSIC_INTEGRITY").hexdigest()
    assert computed == expected


@pytest.mark.asyncio
async def test_file_retrieval(async_client: AsyncClient, auth_headers):
    """Verify that an uploaded file can be queried by ID."""
    pdf_content = b"%PDF-1.4 sample content %%EOF"
    files = {"file": ("retrieval_test.pdf", io.BytesIO(pdf_content), "application/pdf")}
    upload_res = await async_client.post("/api/files/upload", files=files, headers=auth_headers)
    file_id = upload_res.json()["id"]

    get_res = await async_client.get(f"/api/files/{file_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == file_id
    assert get_res.json()["original_name"] == "retrieval_test.pdf"
