from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.connection import get_db
from database.models import User, UploadedFile, VerificationRequest, EngineResult, FileFingerprint
from auth.dependencies import get_current_active_user
from engines.source.models import (
    FingerprintRegisterRequest,
    FingerprintCompareRequest,
    FingerprintResponse,
    CompareResponse,
    SourceAnalysisResponse,
    SourceFinding,
)
from engines.source.service import (
    register_fingerprint,
    compare_fingerprints,
    check_fingerprint_history,
)

router = APIRouter(prefix="/api/source", tags=["Source Provenance Engine"])


@router.post("/fingerprint", response_model=FingerprintResponse, status_code=status.HTTP_201_CREATED)
async def register_file_fingerprint(
    request: FingerprintRegisterRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Register a file's SHA-256 fingerprint in the platform's immutable registry."""
    file_query = await db.execute(
        select(UploadedFile).where(UploadedFile.id == request.file_id)
    )
    file_record = file_query.scalar_one_or_none()
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Specified file not found.",
        )

    fp = await register_fingerprint(
        file_id=file_record.id,
        sha256=file_record.sha256_hash,
        user_id=current_user.id,
        db=db,
        notes=request.notes,
    )
    return FingerprintResponse.model_validate(fp)


@router.post("/compare", response_model=CompareResponse)
async def compare_files_endpoint(
    request: FingerprintCompareRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Compare two uploaded files using cryptographic hashes and perceptual visual matching."""
    try:
        return await compare_fingerprints(
            file_id_1=request.file_id_1,
            file_id_2=request.file_id_2,
            db=db,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/history/{query}", response_model=List[FingerprintResponse])
async def get_file_fingerprint_history(
    query: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve historical fingerprint registrations by file ID or SHA-256 hash."""
    clean_q = query.strip()
    # 1. Check direct match in FileFingerprint
    fp_q = await db.execute(
        select(FileFingerprint).where(
            (FileFingerprint.sha256 == clean_q) | (FileFingerprint.file_id == clean_q)
        ).order_by(FileFingerprint.registered_at.desc())
    )
    direct_fps = list(fp_q.scalars().all())
    if direct_fps:
        return [FingerprintResponse.model_validate(h) for h in direct_fps]

    # 2. Check UploadedFile
    file_query = await db.execute(
        select(UploadedFile).where(
            (UploadedFile.id == clean_q) | (UploadedFile.sha256_hash == clean_q)
        )
    )
    file_record = file_query.scalar_one_or_none()
    if file_record:
        history = await check_fingerprint_history(file_record.sha256_hash, db)
        return [FingerprintResponse.model_validate(h) for h in history]

    return []


@router.get("/{verification_id}/results", response_model=SourceAnalysisResponse)
async def get_source_results(
    verification_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve source provenance analysis findings for a verification session."""
    v_query = await db.execute(
        select(VerificationRequest).where(VerificationRequest.id == verification_id)
    )
    verification = v_query.scalar_one_or_none()
    if not verification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification request not found.",
        )

    if verification.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    engine_query = await db.execute(
        select(EngineResult).where(
            EngineResult.verification_id == verification_id,
            EngineResult.engine_name == "source",
        )
    )
    engine_result = engine_query.scalar_one_or_none()
    if not engine_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source engine result not found for this verification.",
        )

    findings = [
        SourceFinding(**f) for f in (engine_result.findings or [])
    ] if isinstance(engine_result.findings, list) else []

    file_query = await db.execute(
        select(UploadedFile).where(UploadedFile.id == verification.file_id)
    )
    file_record = file_query.scalar_one_or_none()
    sha256_val = file_record.sha256_hash if file_record else ""

    history = await check_fingerprint_history(sha256_val, db) if sha256_val else []

    return SourceAnalysisResponse(
        verification_id=verification_id,
        status=engine_result.status,
        confidence=engine_result.confidence or 0.90,
        findings=findings,
        sha256=sha256_val,
        historical_matches=[FingerprintResponse.model_validate(h) for h in history],
        error_message=engine_result.error_message,
        completed_at=engine_result.completed_at,
    )
