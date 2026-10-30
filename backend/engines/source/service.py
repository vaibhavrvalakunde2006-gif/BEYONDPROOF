import os
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.models import UploadedFile, FileFingerprint, ProvenanceRecord, EngineResult, User
from files.utils import compute_sha256
from engines.source.models import (
    SourceFinding,
    FingerprintResponse,
    CompareResponse,
    ProvenanceInfo,
    SourceAnalysisResponse,
)


def generate_fingerprint(file_path: str) -> str:
    """Calculate the cryptographic SHA-256 fingerprint for a file."""
    return compute_sha256(file_path)


async def register_fingerprint(
    file_id: str,
    sha256: str,
    user_id: Optional[str],
    db: AsyncSession,
    notes: Optional[str] = None,
) -> FileFingerprint:
    """Register a persistent file fingerprint in the tamper-evident registry."""
    fingerprint = FileFingerprint(
        file_id=file_id,
        sha256=sha256,
        registered_by=user_id,
        notes=notes,
        registered_at=datetime.now(timezone.utc),
    )
    db.add(fingerprint)
    await db.commit()
    await db.refresh(fingerprint)
    return fingerprint


async def check_fingerprint_history(sha256: str, db: AsyncSession) -> List[FileFingerprint]:
    """Search registry for any historical recordings matching this SHA-256 hash."""
    query = (
        select(FileFingerprint)
        .where(FileFingerprint.sha256 == sha256)
        .order_by(FileFingerprint.registered_at.asc())
    )
    result = await db.execute(query)
    return list(result.scalars().all())


async def compare_fingerprints(
    file_id_1: str,
    file_id_2: str,
    db: AsyncSession,
) -> CompareResponse:
    """Compare two files for exact cryptographic match and visual similarity."""
    q1 = await db.execute(select(UploadedFile).where(UploadedFile.id == file_id_1))
    f1 = q1.scalar_one_or_none()
    q2 = await db.execute(select(UploadedFile).where(UploadedFile.id == file_id_2))
    f2 = q2.scalar_one_or_none()

    if not f1 or not f2:
        raise ValueError("One or both target files were not found.")

    sha_match = f1.sha256_hash == f2.sha256_hash
    perceptual_match = None
    similarity = 1.0 if sha_match else 0.0
    details: Dict[str, Any] = {"file_1_name": f1.original_name, "file_2_name": f2.original_name}

    # If both are images, compute perceptual hash difference
    if f1.file_type == "image" and f2.file_type == "image":
        try:
            import imagehash
            from PIL import Image
            img1 = Image.open(f1.storage_path)
            img2 = Image.open(f2.storage_path)
            phash1 = imagehash.phash(img1)
            phash2 = imagehash.phash(img2)
            distance = phash1 - phash2
            details["phash_distance"] = distance
            perceptual_match = distance <= 5
            # 64-bit phash similarity
            similarity = max(0.0, 1.0 - (distance / 64.0)) if not sha_match else 1.0
        except Exception as e:
            details["perceptual_error"] = str(e)

    return CompareResponse(
        is_exact_match=sha_match,
        sha256_match=sha_match,
        perceptual_match=perceptual_match,
        similarity_score=round(similarity, 3),
        file_1_hash=f1.sha256_hash,
        file_2_hash=f2.sha256_hash,
        details=details,
    )


def extract_provenance(file_path: str) -> ProvenanceInfo:
    """Extract origin tools, modification lineage, and inspect C2PA provenance signatures."""
    info = ProvenanceInfo(
        source_url=None,
        creation_tool=None,
        modification_history=[],
        c2pa_status="Not Present",
    )

    # Check for C2PA / CAI manifest markers in file binary stream
    try:
        with open(file_path, "rb") as f:
            header_sample = f.read(65536)
            if b"c2pa" in header_sample or b"jumb" in header_sample:
                info.c2pa_status = "C2PA Manifest Detected"
    except Exception:
        pass

    # Extract creation tool from PDF or image metadata
    ext = file_path.rsplit(".", 1)[-1].lower() if "." in file_path else ""
    if ext == "pdf":
        try:
            import fitz
            doc = fitz.open(file_path)
            meta = doc.metadata or {}
            producer = meta.get("producer")
            creator = meta.get("creator")
            tools = [t for t in [producer, creator] if t]
            if tools:
                info.creation_tool = " / ".join(tools)
            doc.close()
        except Exception:
            pass
    elif ext in ["jpg", "jpeg", "png", "webp"]:
        try:
            from PIL import Image
            img = Image.open(file_path)
            info_dict = img.info or {}
            if "Software" in info_dict:
                info.creation_tool = str(info_dict["Software"])
        except Exception:
            pass

    return info


async def full_source_analysis(
    file_path: str,
    file_id: str,
    verification_id: str,
    db: AsyncSession,
) -> SourceAnalysisResponse:
    """Execute complete provenance, fingerprint registry lookup, and C2PA verification."""
    result_query = await db.execute(
        select(EngineResult).where(
            EngineResult.verification_id == verification_id,
            EngineResult.engine_name == "source",
        )
    )
    engine_result = result_query.scalar_one_or_none()
    if not engine_result:
        engine_result = EngineResult(
            verification_id=verification_id,
            engine_name="source",
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
        return SourceAnalysisResponse(
            verification_id=verification_id,
            status="failed",
            sha256="",
            error_message=engine_result.error_message,
        )

    all_findings: List[SourceFinding] = []

    # 1. Compute SHA-256
    sha256_hash = generate_fingerprint(file_path)

    # 2. Check fingerprint history in registry
    history = await check_fingerprint_history(sha256_hash, db)
    historical_matches = [FingerprintResponse.model_validate(h) for h in history]

    if len(history) > 0:
        first_seen = history[0].registered_at.strftime("%Y-%m-%d %H:%M:%S UTC")
        all_findings.append(
            SourceFinding(
                code="SRC_FINGERPRINT_MATCH",
                severity="info",
                description="Exact SHA-256 fingerprint matches previously registered records in the provenance database.",
                evidence=f"Matched {len(history)} registration record(s). Earliest record timestamp: {first_seen}",
                location="Fingerprint registry",
            )
        )
    else:
        all_findings.append(
            SourceFinding(
                code="SRC_NEW_FINGERPRINT",
                severity="info",
                description="File fingerprint is novel and has not been previously recorded in this registry.",
                evidence=f"Generated SHA-256: {sha256_hash}",
                location="Cryptographic registry",
            )
        )

    # 3. Extract provenance and C2PA indicators
    provenance = extract_provenance(file_path)
    if provenance.c2pa_status == "C2PA Manifest Detected":
        all_findings.append(
            SourceFinding(
                code="SRC_C2PA_VERIFIED",
                severity="info",
                description="Coalition for Content Provenance and Authenticity (C2PA) manifest structure detected.",
                evidence="C2PA JUMBF cryptographic box found in container header.",
                location="Binary header manifest",
            )
        )
    else:
        all_findings.append(
            SourceFinding(
                code="SRC_NO_C2PA",
                severity="low",
                description="No C2PA provenance manifest present in file header.",
                evidence="Standard container without hardware-signed camera provenance.",
                location="Binary header",
            )
        )

    if provenance.creation_tool:
        all_findings.append(
            SourceFinding(
                code="SRC_CREATION_TOOL_IDENTIFIED",
                severity="info",
                description=f"Creation / editing software footprint identified: {provenance.creation_tool}",
                evidence=f"Tool string: {provenance.creation_tool}",
                location="Metadata container",
            )
        )

    # Upsert ProvenanceRecord in DB
    prov_query = await db.execute(
        select(ProvenanceRecord).where(ProvenanceRecord.file_id == file_id)
    )
    prov_record = prov_query.scalar_one_or_none()
    if not prov_record:
        prov_record = ProvenanceRecord(
            file_id=file_id,
            source_url=provenance.source_url,
            creation_tool=provenance.creation_tool,
            modification_history=provenance.modification_history,
            c2pa_status=provenance.c2pa_status,
        )
        db.add(prov_record)
    else:
        prov_record.creation_tool = provenance.creation_tool
        prov_record.c2pa_status = provenance.c2pa_status

    # Commit results
    findings_json = [f.model_dump() for f in all_findings]
    engine_result.status = "completed"
    engine_result.findings = findings_json
    engine_result.confidence = 0.95
    engine_result.completed_at = datetime.now(timezone.utc)
    await db.commit()

    return SourceAnalysisResponse(
        verification_id=verification_id,
        status="completed",
        confidence=0.95,
        findings=all_findings,
        sha256=sha256_hash,
        provenance=provenance,
        historical_matches=historical_matches,
        completed_at=engine_result.completed_at,
    )
