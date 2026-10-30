import os
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.models import (
    VerificationRequest,
    UploadedFile,
    EngineResult,
    RiskAssessment,
    User,
    AuditLog,
)
from engines.document.service import full_document_analysis
from engines.media.image_service import full_image_analysis
from engines.media.video_service import full_video_analysis
from engines.media.audio_service import full_audio_analysis
from engines.identity.service import full_identity_analysis
from engines.source.service import full_source_analysis
from engines.trust_graph.service import build_verification_graph
from engines.risk.service import full_risk_analysis
from verification.models import (
    VerificationResponse,
    VerificationDetailResponse,
    EngineResultSummary,
    RiskSummary,
)


def select_default_engines(file_type: str) -> List[str]:
    """Select the optimal set of forensic engines based on detected file classification."""
    t = file_type.lower()
    if t == "image":
        return ["media_image", "source"]
    elif t == "video":
        return ["media_video", "source"]
    elif t == "audio":
        return ["media_audio", "source"]
    elif t == "identity":
        return ["identity", "document", "source"]
    elif t == "document":
        return ["document", "source"]
    else:
        return ["document", "source"]


async def create_verification(
    file_id: str,
    user_id: str,
    engines: Optional[List[str]],
    db: AsyncSession,
) -> VerificationRequest:
    """Initialize a new verification session and persist it."""
    file_q = await db.execute(select(UploadedFile).where(UploadedFile.id == file_id))
    file_record = file_q.scalar_one_or_none()
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target file does not exist.",
        )

    selected_engines = engines if engines and len(engines) > 0 else select_default_engines(file_record.file_type)

    verification = VerificationRequest(
        user_id=user_id,
        file_id=file_id,
        status="pending",
        engines_requested=selected_engines,
        created_at=datetime.now(timezone.utc),
    )
    db.add(verification)

    audit = AuditLog(
        user_id=user_id,
        action="verification_create",
        resource_type="verification",
        resource_id=verification.id,
        details={"file_id": file_id, "engines": selected_engines},
    )
    db.add(audit)

    await db.commit()
    await db.refresh(verification)
    return verification


async def run_verification(verification_id: str, db: AsyncSession) -> VerificationRequest:
    """Execute all requested forensic engines, assemble trust graph, and generate risk assessment."""
    from websocket.manager import manager

    v_q = await db.execute(
        select(VerificationRequest).where(VerificationRequest.id == verification_id)
    )
    verification = v_q.scalar_one_or_none()
    if not verification:
        raise ValueError(f"Verification {verification_id} not found.")

    file_q = await db.execute(
        select(UploadedFile).where(UploadedFile.id == verification.file_id)
    )
    file_record = file_q.scalar_one_or_none()
    if not file_record:
        verification.status = "failed"
        await db.commit()
        raise ValueError("Target file associated with verification was not found.")

    verification.status = "processing"
    await db.commit()
    await manager.send_progress(verification_id, "orchestrator", "processing", 5)

    engines = verification.engines_requested or select_default_engines(file_record.file_type)
    file_path = file_record.storage_path
    total_steps = len(engines) + 2  # engines + graph + risk
    current_step = 0

    try:
        for engine_name in engines:
            current_step += 1
            progress_pct = int((current_step / total_steps) * 90)
            await manager.send_progress(verification_id, engine_name, "running", progress_pct)

            # Skip post-processors handled after loop
            if engine_name in ["trust_graph", "risk_analyzer", "verification_hub"]:
                continue

            try:
                if engine_name in ["media_image", "image"] or (engine_name == "media" and file_record.file_type == "image"):
                    await full_image_analysis(file_path, file_record.id, verification_id, db)
                elif engine_name in ["media_video", "video"] or (engine_name == "media" and file_record.file_type == "video"):
                    await full_video_analysis(file_path, file_record.id, verification_id, db)
                elif engine_name in ["media_audio", "audio"] or (engine_name == "media" and file_record.file_type == "audio"):
                    await full_audio_analysis(file_path, file_record.id, verification_id, db)
                elif engine_name in ["document", "pdf"]:
                    await full_document_analysis(file_path, file_record.id, verification_id, db)
                elif engine_name == "identity":
                    await full_identity_analysis(file_path, file_record.id, verification_id, db)
                elif engine_name == "source":
                    await full_source_analysis(file_path, file_record.id, verification_id, db)
                elif engine_name == "media":
                    # Default media fallback based on MIME/extension
                    if file_record.file_type == "video":
                        await full_video_analysis(file_path, file_record.id, verification_id, db)
                    elif file_record.file_type == "audio":
                        await full_audio_analysis(file_path, file_record.id, verification_id, db)
                    else:
                        await full_image_analysis(file_path, file_record.id, verification_id, db)
            except Exception as eng_err:
                print(f"Warning: Engine '{engine_name}' encountered an error: {eng_err}")
                # Ensure an EngineResult is recorded as failed
                res_q = await db.execute(
                    select(EngineResult).where(
                        EngineResult.verification_id == verification_id,
                        EngineResult.engine_name == engine_name,
                    )
                )
                er = res_q.scalar_one_or_none()
                if not er:
                    er = EngineResult(
                        verification_id=verification_id,
                        engine_name=engine_name,
                        status="failed",
                        error_message=str(eng_err),
                        started_at=datetime.now(timezone.utc),
                        completed_at=datetime.now(timezone.utc),
                    )
                    db.add(er)
                else:
                    er.status = "failed"
                    er.error_message = str(eng_err)
                    er.completed_at = datetime.now(timezone.utc)
                await db.commit()

        # Build Trust Graph
        current_step += 1
        await manager.send_progress(verification_id, "trust_graph", "building", 92)
        try:
            await build_verification_graph(verification_id, db)
        except Exception as g_err:
            print(f"Warning: Trust Graph build warning: {g_err}")

        # Run AI Risk Analyzer
        current_step += 1
        await manager.send_progress(verification_id, "risk_analyzer", "evaluating", 97)
        try:
            await full_risk_analysis(verification_id, db)
        except Exception as r_err:
            print(f"Warning: Risk Analyzer warning: {r_err}")

        verification.status = "completed"
        verification.completed_at = datetime.now(timezone.utc)
        await db.commit()
        await manager.send_progress(verification_id, "complete", "completed", 100)

    except Exception as e:
        verification.status = "failed"
        verification.completed_at = datetime.now(timezone.utc)
        await db.commit()
        await manager.send_progress(verification_id, "error", f"failed: {str(e)}", 100)
        # Return cleanly rather than crashing the HTTP request
        return verification

    await db.refresh(verification)
    return verification


async def get_verification(
    verification_id: str,
    user_id: str,
    role: str,
    db: AsyncSession,
) -> VerificationDetailResponse:
    """Retrieve complete verification results including all engine findings and risk assessment."""
    v_q = await db.execute(
        select(VerificationRequest).where(VerificationRequest.id == verification_id)
    )
    verification = v_q.scalar_one_or_none()
    if not verification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verification not found.")

    if verification.user_id != user_id and role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    file_q = await db.execute(
        select(UploadedFile).where(UploadedFile.id == verification.file_id)
    )
    file_record = file_q.scalar_one_or_none()

    # Load Engine Results
    eng_q = await db.execute(
        select(EngineResult).where(EngineResult.verification_id == verification_id)
    )
    engine_results = list(eng_q.scalars().all())

    engine_summaries = []
    for er in engine_results:
        f_list = er.findings if isinstance(er.findings, list) else []
        engine_summaries.append(
            EngineResultSummary(
                id=er.id,
                engine_name=er.engine_name,
                status=er.status,
                confidence=er.confidence,
                findings_count=len(f_list),
                findings=f_list,
                started_at=er.started_at,
                completed_at=er.completed_at,
                error_message=er.error_message,
            )
        )

    # Load Risk Assessment
    risk_q = await db.execute(
        select(RiskAssessment).where(RiskAssessment.verification_id == verification_id)
    )
    risk = risk_q.scalar_one_or_none()
    risk_summary = None
    if risk:
        from engines.media.laundering_service import evaluate_authenticity_verdict
        from engines.media.models import MediaFinding

        all_eval_findings = []
        has_c2pa = False
        for er in engine_summaries:
            for f in (er.findings or []):
                if isinstance(f, dict):
                    if f.get("code") == "SRC_C2PA_VERIFIED":
                        has_c2pa = True
                    if "code" in f:
                        all_eval_findings.append(
                            MediaFinding(
                                code=f["code"],
                                severity=f.get("severity", "info"),
                                description=f.get("description", ""),
                                evidence=f.get("evidence", ""),
                                location=f.get("location"),
                            )
                        )

        auth_eval = evaluate_authenticity_verdict(all_eval_findings, risk.overall_score, has_c2pa)

        risk_summary = RiskSummary(
            overall_score=risk.overall_score,
            risk_category=risk.risk_category,
            explanation=risk.explanation,
            individual_scores=risk.individual_scores or {},
            authenticity_verdict=auth_eval.get("authenticity_verdict", "NO_TAMPERING_FOUND_UNVERIFIED"),
            authenticity_details=auth_eval,
        )

    return VerificationDetailResponse(
        id=verification.id,
        user_id=verification.user_id,
        file_id=verification.file_id,
        file_name=file_record.original_name if file_record else "Unknown",
        file_type=file_record.file_type if file_record else "Unknown",
        file_size=file_record.file_size if file_record else 0,
        sha256_hash=file_record.sha256_hash if file_record else "",
        status=verification.status,
        engines_requested=verification.engines_requested or [],
        engine_results=engine_summaries,
        risk_assessment=risk_summary,
        created_at=verification.created_at,
        completed_at=verification.completed_at,
    )


async def get_verification_history(
    user_id: Optional[str],
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
) -> List[VerificationResponse]:
    """Retrieve chronological history of past verifications initiated by the user (or all if admin)."""
    query = select(VerificationRequest)
    if user_id:
        query = query.where(VerificationRequest.user_id == user_id)
    query = query.order_by(VerificationRequest.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    verifications = result.scalars().all()
    return [VerificationResponse.model_validate(v) for v in verifications]


async def generate_report_data(verification_id: str, db: AsyncSession) -> Dict[str, Any]:
    """Compile exhaustive dataset required to generate a certified PDF forensic report."""
    v_q = await db.execute(
        select(VerificationRequest).where(VerificationRequest.id == verification_id)
    )
    verification = v_q.scalar_one_or_none()
    if not verification:
        raise ValueError("Verification not found.")

    file_q = await db.execute(
        select(UploadedFile).where(UploadedFile.id == verification.file_id)
    )
    file_record = file_q.scalar_one_or_none()

    eng_q = await db.execute(
        select(EngineResult).where(EngineResult.verification_id == verification_id)
    )
    engine_results = list(eng_q.scalars().all())

    risk_q = await db.execute(
        select(RiskAssessment).where(RiskAssessment.verification_id == verification_id)
    )
    risk = risk_q.scalar_one_or_none()

    all_findings = []
    for er in engine_results:
        f_list = er.findings if isinstance(er.findings, list) else []
        for f in f_list:
            if isinstance(f, dict):
                all_findings.append({**f, "engine": er.engine_name})

    return {
        "verification_id": verification.id,
        "created_at": verification.created_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "completed_at": verification.completed_at.strftime("%Y-%m-%d %H:%M:%S UTC") if verification.completed_at else "N/A",
        "file_name": file_record.original_name if file_record else "Unknown",
        "file_type": file_record.file_type if file_record else "Unknown",
        "file_size": file_record.file_size if file_record else 0,
        "sha256": file_record.sha256_hash if file_record else "Unknown",
        "engines": [
            {
                "name": er.engine_name,
                "status": er.status,
                "confidence": er.confidence or 0.85,
                "findings_count": len(er.findings) if isinstance(er.findings, list) else 0,
            }
            for er in engine_results
        ],
        "findings": all_findings,
        "risk_score": risk.overall_score if risk else 0.0,
        "risk_category": risk.risk_category if risk else "unverified",
        "explanation": risk.explanation if risk else "Verification pending or incomplete.",
    }
