from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.connection import get_db
from database.models import User, UploadedFile, VerificationRequest, EngineResult
from auth.dependencies import get_current_active_user
from engines.identity.models import (
    IdentityAnalysisRequest,
    IdentityAnalysisResponse,
    IdentityFinding,
    FaceCompareRequest,
    FaceCompareResponse,
)
from engines.identity.service import full_identity_analysis, compare_faces

router = APIRouter(prefix="/api/identity", tags=["Identity Forensics Engine"])


@router.post("/analyze", response_model=IdentityAnalysisResponse)
async def analyze_identity(
    request: IdentityAnalysisRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Trigger complete identity document forensic analysis."""
    file_query = await db.execute(
        select(UploadedFile).where(UploadedFile.id == request.file_id)
    )
    file_record = file_query.scalar_one_or_none()
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Specified identity credential file not found.",
        )

    if file_record.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to requested file.",
        )

    verification_id = request.verification_id
    if verification_id:
        v_query = await db.execute(
            select(VerificationRequest).where(VerificationRequest.id == verification_id)
        )
        verification = v_query.scalar_one_or_none()
        if not verification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Verification session not found.",
            )
    else:
        verification = VerificationRequest(
            user_id=current_user.id,
            file_id=file_record.id,
            status="processing",
            engines_requested=["identity"],
        )
        db.add(verification)
        await db.commit()
        await db.refresh(verification)
        verification_id = verification.id

    return await full_identity_analysis(
        file_path=file_record.storage_path,
        file_id=file_record.id,
        verification_id=verification_id,
        db=db,
    )


@router.get("/{verification_id}/results", response_model=IdentityAnalysisResponse)
async def get_identity_results(
    verification_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve identity analysis findings for a specific verification session."""
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
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied.",
        )

    engine_query = await db.execute(
        select(EngineResult).where(
            EngineResult.verification_id == verification_id,
            EngineResult.engine_name == "identity",
        )
    )
    engine_result = engine_query.scalar_one_or_none()
    if not engine_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Identity engine result not found for this verification.",
        )

    findings = [
        IdentityFinding(**f) for f in (engine_result.findings or [])
    ] if isinstance(engine_result.findings, list) else []

    return IdentityAnalysisResponse(
        verification_id=verification_id,
        status=engine_result.status,
        confidence=engine_result.confidence or 0.85,
        findings=findings,
        error_message=engine_result.error_message,
        completed_at=engine_result.completed_at,
    )


@router.post("/compare-faces", response_model=FaceCompareResponse)
async def compare_two_faces(
    request: FaceCompareRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Compare two facial portrait files for match similarity."""
    f1_query = await db.execute(select(UploadedFile).where(UploadedFile.id == request.face1_file_id))
    f1 = f1_query.scalar_one_or_none()
    f2_query = await db.execute(select(UploadedFile).where(UploadedFile.id == request.face2_file_id))
    f2 = f2_query.scalar_one_or_none()

    if not f1 or not f2:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or both face image files were not found.",
        )

    score, is_match, details = compare_faces(f1.storage_path, f2.storage_path)
    return FaceCompareResponse(
        similarity_score=score,
        is_match=is_match,
        confidence=0.88,
        details=details,
    )
