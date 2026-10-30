from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.connection import get_db
from database.models import User, UploadedFile, VerificationRequest, EngineResult
from auth.dependencies import get_current_active_user
from engines.document.models import DocumentAnalysisRequest, DocumentAnalysisResponse, DocumentFinding
from engines.document.service import full_document_analysis

router = APIRouter(prefix="/api/document", tags=["Document Forensics Engine"])


@router.post("/analyze", response_model=DocumentAnalysisResponse)
async def analyze_document(
    request: DocumentAnalysisRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Trigger deep document forensic analysis for an uploaded document."""
    # Verify file ownership or admin
    file_query = await db.execute(
        select(UploadedFile).where(UploadedFile.id == request.file_id)
    )
    file_record = file_query.scalar_one_or_none()
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Specified file not found.",
        )

    if file_record.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to requested file.",
        )

    # Get or create VerificationRequest
    verification_id = request.verification_id
    if verification_id:
        v_query = await db.execute(
            select(VerificationRequest).where(VerificationRequest.id == verification_id)
        )
        verification = v_query.scalar_one_or_none()
        if not verification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Verification request not found.",
            )
    else:
        verification = VerificationRequest(
            user_id=current_user.id,
            file_id=file_record.id,
            status="processing",
            engines_requested=["document"],
        )
        db.add(verification)
        await db.commit()
        await db.refresh(verification)
        verification_id = verification.id

    # Execute forensic analysis
    result = await full_document_analysis(
        file_path=file_record.storage_path,
        file_id=file_record.id,
        verification_id=verification_id,
        db=db,
    )
    return result


@router.get("/{verification_id}/results", response_model=DocumentAnalysisResponse)
async def get_document_results(
    verification_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve document forensic findings for a specific verification session."""
    # Verify verification exists and user has access
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
            EngineResult.engine_name == "document",
        )
    )
    engine_result = engine_query.scalar_one_or_none()
    if not engine_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document engine result not found for this verification.",
        )

    findings = [
        DocumentFinding(**f) for f in (engine_result.findings or [])
    ] if isinstance(engine_result.findings, list) else []

    return DocumentAnalysisResponse(
        verification_id=verification_id,
        status=engine_result.status,
        confidence=engine_result.confidence or 0.85,
        findings=findings,
        error_message=engine_result.error_message,
        completed_at=engine_result.completed_at,
    )
