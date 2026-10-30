from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.connection import get_db
from database.models import User, VerificationRequest, RiskAssessment
from auth.dependencies import get_current_active_user
from engines.risk.models import RiskAnalyzeRequest, RiskAssessmentResponse
from engines.risk.service import full_risk_analysis

router = APIRouter(prefix="/api/risk", tags=["AI Risk Analyzer"])


@router.post("/analyze", response_model=RiskAssessmentResponse)
async def analyze_risk_endpoint(
    request: RiskAnalyzeRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Compute holistic multi-engine risk assessment for a verification session."""
    v_query = await db.execute(
        select(VerificationRequest).where(VerificationRequest.id == request.verification_id)
    )
    verification = v_query.scalar_one_or_none()
    if not verification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification session not found.",
        )

    if verification.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    return await full_risk_analysis(verification_id=verification.id, db=db)


@router.get("/{verification_id}/assessment", response_model=RiskAssessmentResponse)
async def get_risk_assessment_endpoint(
    verification_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve computed risk assessment score, category, and explanation."""
    v_query = await db.execute(
        select(VerificationRequest).where(VerificationRequest.id == verification_id)
    )
    verification = v_query.scalar_one_or_none()
    if not verification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verification session not found.")

    if verification.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    risk_q = await db.execute(
        select(RiskAssessment).where(RiskAssessment.verification_id == verification_id)
    )
    risk_record = risk_q.scalar_one_or_none()

    if not risk_record:
        # Compute on the fly if not yet recorded
        return await full_risk_analysis(verification_id=verification_id, db=db)

    return RiskAssessmentResponse(
        id=risk_record.id,
        verification_id=verification_id,
        overall_score=risk_record.overall_score,
        risk_category=risk_record.risk_category,
        weights_used=risk_record.weights_used or {},
        individual_scores=risk_record.individual_scores or {},
        explanation=risk_record.explanation,
        created_at=risk_record.created_at,
    )
