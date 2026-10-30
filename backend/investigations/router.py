import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config import settings
from database.connection import get_db
from database.models import User, VerificationRequest
from auth.dependencies import get_current_active_user
from verification.models import (
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
from engines.trust_graph.service import get_graph, build_verification_graph
from engines.trust_graph.models import GraphResponse

router = APIRouter(tags=["Investigations & Analysis"])


class InvestigationCreateBody(BaseModel):
    file_id: str
    engines: Optional[List[str]] = None


# 1. /api/investigations (List and Create)
@router.get("/api/investigations", response_model=List[VerificationResponse])
async def list_investigations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List historical investigations for the authenticated user."""
    return await get_verification_history(
        user_id=current_user.id,
        db=db,
        skip=skip,
        limit=limit,
    )


@router.post("/api/investigations", response_model=VerificationDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_investigation(
    body: InvestigationCreateBody,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new investigation and trigger execution across selected engines."""
    verif = await create_verification(
        file_id=body.file_id,
        user_id=current_user.id,
        engines=body.engines,
        db=db,
    )
    await run_verification(verification_id=verif.id, db=db)
    return await get_verification(
        verification_id=verif.id,
        user_id=current_user.id,
        role=current_user.role,
        db=db,
    )


@router.get("/api/investigations/{investigation_id}", response_model=VerificationDetailResponse)
async def get_investigation_by_id(
    investigation_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full details, engine findings, and risk scores for an investigation."""
    return await get_verification(
        verification_id=investigation_id,
        user_id=current_user.id,
        role=current_user.role,
        db=db,
    )


# 2. /api/analysis/{id}/start, /status, /results
@router.post("/api/analysis/{investigation_id}/start")
async def start_analysis(
    investigation_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Trigger background or immediate analysis processing on an investigation."""
    v = await get_verification(investigation_id, current_user.id, current_user.role, db)
    await run_verification(verification_id=investigation_id, db=db)
    return {
        "investigation_id": investigation_id,
        "status": "processing",
        "message": "Analysis pipeline successfully engaged.",
    }


@router.get("/api/analysis/{investigation_id}/status")
async def get_analysis_status(
    investigation_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Check processing status of an investigation."""
    v = await get_verification(investigation_id, current_user.id, current_user.role, db)
    return {
        "investigation_id": investigation_id,
        "status": v.status,
        "completed": v.status in ("completed", "failed"),
        "error_message": v.error_message,
    }


@router.get("/api/analysis/{investigation_id}/results", response_model=VerificationDetailResponse)
async def get_analysis_results(
    investigation_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve comprehensive executed forensic findings."""
    return await get_verification(
        verification_id=investigation_id,
        user_id=current_user.id,
        role=current_user.role,
        db=db,
    )


# 3. /api/trust-graph/{investigation_id}
@router.get("/api/trust-graph/{investigation_id}", response_model=GraphResponse)
async def get_trust_graph_alias(
    investigation_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve or build the Trust Knowledge Graph for the given investigation."""
    v_query = await db.execute(
        select(VerificationRequest).where(VerificationRequest.id == investigation_id)
    )
    verification = v_query.scalar_one_or_none()
    if not verification:
        raise HTTPException(status_code=404, detail="Investigation not found.")
    if verification.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied.")

    graph = await get_graph(investigation_id, db)
    if not graph.nodes:
        graph = await build_verification_graph(investigation_id, db)
    return graph


# 4. /api/reports/{investigation_id}/generate
@router.get("/api/reports/{investigation_id}/generate")
@router.post("/api/reports/{investigation_id}/generate")
async def generate_and_download_report(
    investigation_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate certified BeyondProof PDF forensic report and stream directly."""
    await get_verification(investigation_id, current_user.id, current_user.role, db)

    report_filename = f"beyondproof_report_{investigation_id}.pdf"
    report_output_path = os.path.join(settings.UPLOAD_DIR, "reports", report_filename)

    report_data = await generate_report_data(verification_id=investigation_id, db=db)
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
