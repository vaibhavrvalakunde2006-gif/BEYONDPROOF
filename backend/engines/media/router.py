import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config import settings
from database.connection import get_db
from database.models import User, UploadedFile, VerificationRequest, EngineResult
from auth.dependencies import get_current_active_user
from engines.media.models import (
    ImageAnalysisRequest,
    VideoAnalysisRequest,
    AudioAnalysisRequest,
    MediaAnalysisResponse,
    MediaFinding,
)
from engines.media.image_service import full_image_analysis
from engines.media.video_service import full_video_analysis
from engines.media.audio_service import full_audio_analysis

router = APIRouter(prefix="/api/media", tags=["Media Forensics Engine"])


async def _get_or_create_verification(
    file_id: str,
    verification_id: str | None,
    engine_name: str,
    current_user: User,
    db: AsyncSession,
) -> tuple[UploadedFile, str]:
    file_query = await db.execute(
        select(UploadedFile).where(UploadedFile.id == file_id)
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
        v_id = verification.id
    else:
        verification = VerificationRequest(
            user_id=current_user.id,
            file_id=file_record.id,
            status="processing",
            engines_requested=[engine_name],
        )
        db.add(verification)
        await db.commit()
        await db.refresh(verification)
        v_id = verification.id

    return file_record, v_id


@router.post("/image/analyze", response_model=MediaAnalysisResponse)
async def analyze_image_endpoint(
    request: ImageAnalysisRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Trigger AFTERIMAGE image forensic analysis pipeline."""
    file_record, v_id = await _get_or_create_verification(
        request.file_id, request.verification_id, "media_image", current_user, db
    )
    return await full_image_analysis(
        file_path=file_record.storage_path,
        file_id=file_record.id,
        verification_id=v_id,
        db=db,
    )


@router.post("/video/analyze", response_model=MediaAnalysisResponse)
async def analyze_video_endpoint(
    request: VideoAnalysisRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Trigger video forensic and temporal continuity analysis."""
    file_record, v_id = await _get_or_create_verification(
        request.file_id, request.verification_id, "media_video", current_user, db
    )
    return await full_video_analysis(
        file_path=file_record.storage_path,
        file_id=file_record.id,
        verification_id=v_id,
        db=db,
    )


@router.post("/audio/analyze", response_model=MediaAnalysisResponse)
async def analyze_audio_endpoint(
    request: AudioAnalysisRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Trigger audio acoustic and vocoder anomaly inspection."""
    file_record, v_id = await _get_or_create_verification(
        request.file_id, request.verification_id, "media_audio", current_user, db
    )
    return await full_audio_analysis(
        file_path=file_record.storage_path,
        file_id=file_record.id,
        verification_id=v_id,
        db=db,
    )


@router.get("/{verification_id}/results", response_model=MediaAnalysisResponse)
async def get_media_results(
    verification_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve forensic findings for image, video, or audio verifications."""
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

    # Search for any media engine result
    engine_query = await db.execute(
        select(EngineResult).where(
            EngineResult.verification_id == verification_id,
            EngineResult.engine_name.in_(["media_image", "media_video", "media_audio", "media"]),
        )
    )
    engine_result = engine_query.scalar_one_or_none()
    if not engine_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No media engine results available for this verification.",
        )

    media_type = "image"
    if "video" in engine_result.engine_name:
        media_type = "video"
    elif "audio" in engine_result.engine_name:
        media_type = "audio"

    findings = [
        MediaFinding(**f) for f in (engine_result.findings or [])
    ] if isinstance(engine_result.findings, list) else []

    ela_path = None
    if media_type == "image":
        potential_ela = os.path.join(settings.UPLOAD_DIR, "analyzed", f"ela_{verification_id}.jpg")
        if os.path.exists(potential_ela):
            ela_path = f"/uploads/analyzed/ela_{verification_id}.jpg"

    return MediaAnalysisResponse(
        verification_id=verification_id,
        media_type=media_type,
        status=engine_result.status,
        confidence=engine_result.confidence or 0.88,
        findings=findings,
        ela_image_path=ela_path,
        error_message=engine_result.error_message,
        completed_at=engine_result.completed_at,
    )


@router.get("/{verification_id}/ela")
async def get_ela_image(
    verification_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Download the Error Level Analysis (ELA) heatmap visualization file."""
    ela_filename = f"ela_{verification_id}.jpg"
    ela_path = os.path.join(settings.UPLOAD_DIR, "analyzed", ela_filename)

    if not os.path.exists(ela_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ELA heatmap image not found for this verification session.",
        )

    return FileResponse(ela_path, media_type="image/jpeg", filename=ela_filename)
