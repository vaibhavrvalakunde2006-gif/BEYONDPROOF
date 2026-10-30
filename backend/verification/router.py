import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database.connection import get_db
from database.models import User
from auth.dependencies import get_current_active_user
from verification.models import (
    VerificationCreateRequest,
    VerificationResponse,
    VerificationDetailResponse,
)
from verification.service import (
    create_verification,
    run_verification,
    get_verification,
    get_verification_history,
    generate_report_data,
)
from verification.report_generator import generate_pdf_report

router = APIRouter(prefix="/api/verification", tags=["Verification Orchestrator"])


@router.post("/create", response_model=VerificationDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_and_run_verification(
    request: VerificationCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a verification request and execute the full forensic pipeline."""
    verif = await create_verification(
        file_id=request.file_id,
        user_id=current_user.id,
        engines=request.engines,
        db=db,
    )

    # Run verification pipeline synchronously to return full results
    await run_verification(verification_id=verif.id, db=db)

    return await get_verification(
        verification_id=verif.id,
        user_id=current_user.id,
        role=current_user.role,
        db=db,
    )


@router.get("/history", response_model=List[VerificationResponse])
async def list_verification_history(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List historical verification requests for the authenticated user."""
    return await get_verification_history(
        user_id=current_user.id,
        db=db,
        skip=skip,
        limit=limit,
    )


@router.get("/{verification_id}", response_model=VerificationDetailResponse)
async def get_verification_detail(
    verification_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve complete multi-engine forensic results and risk score."""
    return await get_verification(
        verification_id=verification_id,
        user_id=current_user.id,
        role=current_user.role,
        db=db,
    )


@router.get("/{verification_id}/report")
async def download_pdf_report(
    verification_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate and download certified BeyondProof PDF forensic report."""
    # Verify access
    await get_verification(
        verification_id=verification_id,
        user_id=current_user.id,
        role=current_user.role,
        db=db,
    )

    report_filename = f"beyondproof_report_{verification_id}.pdf"
    report_output_path = os.path.join(settings.UPLOAD_DIR, "reports", report_filename)

    # Compile data and generate PDF
    report_data = await generate_report_data(verification_id=verification_id, db=db)
    generate_pdf_report(report_data, report_output_path)

    if not os.path.exists(report_output_path):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate forensic PDF report.",
        )

    return FileResponse(
        report_output_path,
        media_type="application/pdf",
        filename=report_filename,
    )
