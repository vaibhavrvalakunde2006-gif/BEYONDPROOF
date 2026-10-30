from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from database.models import (
    User,
    UploadedFile,
    VerificationRequest,
    RiskAssessment,
    EngineResult,
    AuditLog,
)


async def get_dashboard_stats(db: AsyncSession) -> Dict[str, Any]:
    """Calculate platform-wide aggregate operational metrics and risk distributions."""
    # Total Users
    user_cnt = await db.execute(select(func.count(User.id)))
    total_users = user_cnt.scalar() or 0

    # Total Files & Total Storage Bytes
    files_res = await db.execute(
        select(func.count(UploadedFile.id), func.sum(UploadedFile.file_size))
    )
    total_files, total_storage_bytes = files_res.first()
    total_files = total_files or 0
    total_storage_bytes = total_storage_bytes or 0

    # Total Verifications
    verif_res = await db.execute(select(func.count(VerificationRequest.id)))
    total_verifications = verif_res.scalar() or 0

    # Verification status breakdown
    status_q = await db.execute(
        select(VerificationRequest.status, func.count(VerificationRequest.id)).group_by(
            VerificationRequest.status
        )
    )
    status_breakdown = {row[0]: row[1] for row in status_q.all()}

    # File type breakdown
    type_q = await db.execute(
        select(UploadedFile.file_type, func.count(UploadedFile.id)).group_by(
            UploadedFile.file_type
        )
    )
    file_type_breakdown = {row[0]: row[1] for row in type_q.all()}

    # Risk distribution
    risk_q = await db.execute(
        select(RiskAssessment.risk_category, func.count(RiskAssessment.id)).group_by(
            RiskAssessment.risk_category
        )
    )
    risk_distribution = {
        "low_risk": 0,
        "suspicious": 0,
        "high_risk": 0,
        "unverified": 0,
    }
    for row in risk_q.all():
        if row[0] in risk_distribution:
            risk_distribution[row[0]] = row[1]
        else:
            risk_distribution[row[0]] = row[1]

    return {
        "total_users": total_users,
        "total_files": total_files,
        "total_storage_bytes": total_storage_bytes,
        "total_verifications": total_verifications,
        "verifications_by_status": status_breakdown,
        "files_by_type": file_type_breakdown,
        "risk_distribution": risk_distribution,
    }


async def get_recent_activity(db: AsyncSession, limit: int = 25) -> List[Dict[str, Any]]:
    """Retrieve chronologically recent verification activities across all platform tenants."""
    query = (
        select(
            VerificationRequest.id,
            VerificationRequest.status,
            VerificationRequest.created_at,
            VerificationRequest.completed_at,
            User.email,
            UploadedFile.original_name,
            UploadedFile.file_type,
            RiskAssessment.overall_score,
            RiskAssessment.risk_category,
        )
        .join(User, VerificationRequest.user_id == User.id)
        .join(UploadedFile, VerificationRequest.file_id == UploadedFile.id)
        .outerjoin(RiskAssessment, VerificationRequest.id == RiskAssessment.verification_id)
        .order_by(VerificationRequest.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(query)

    activities = []
    for row in result.all():
        activities.append(
            {
                "verification_id": row[0],
                "status": row[1],
                "created_at": row[2].isoformat() if row[2] else None,
                "completed_at": row[3].isoformat() if row[3] else None,
                "user_email": row[4],
                "file_name": row[5],
                "file_type": row[6],
                "overall_score": row[7],
                "risk_category": row[8] or "unverified",
            }
        )
    return activities


async def get_engine_stats(db: AsyncSession) -> List[Dict[str, Any]]:
    """Calculate per-engine execution volumes, success rates, and average confidence levels."""
    query = (
        select(
            EngineResult.engine_name,
            func.count(EngineResult.id).label("total_runs"),
            func.sum(func.case((EngineResult.status == "completed", 1), else_=0)).label("completed"),
            func.sum(func.case((EngineResult.status == "failed", 1), else_=0)).label("failed"),
            func.avg(EngineResult.confidence).label("avg_confidence"),
        )
        .group_by(EngineResult.engine_name)
    )
    result = await db.execute(query)

    engine_metrics = []
    for row in result.all():
        total = row[1] or 0
        comp = row[2] or 0
        failed = row[3] or 0
        success_rate = round((comp / total) * 100, 1) if total > 0 else 0.0
        avg_conf = round(float(row[4]), 2) if row[4] is not None else 0.85

        engine_metrics.append(
            {
                "engine_name": row[0],
                "total_runs": total,
                "completed": comp,
                "failed": failed,
                "success_rate_percent": success_rate,
                "average_confidence": avg_conf,
            }
        )

    return engine_metrics
