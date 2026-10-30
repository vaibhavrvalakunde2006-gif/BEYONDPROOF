from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.connection import get_db
from database.models import User
from auth.dependencies import get_admin_user
from auth.schemas import UserResponse
from admin.service import get_dashboard_stats, get_recent_activity, get_engine_stats

router = APIRouter(prefix="/api/admin", tags=["Platform Administration"])


@router.get("/dashboard", response_model=Dict[str, Any])
async def get_admin_dashboard(
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve platform-wide telemetry, user totals, and forensic risk distributions."""
    return await get_dashboard_stats(db=db)


@router.get("/users", response_model=List[UserResponse])
async def list_all_users(
    skip: int = 0,
    limit: int = 100,
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List all registered users across the platform."""
    query = select(User).order_by(User.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    users = result.scalars().all()
    return [UserResponse.model_validate(u) for u in users]


@router.get("/activity", response_model=List[Dict[str, Any]])
async def get_system_activity(
    limit: int = 25,
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve chronologically recent verification events across all platform users."""
    return await get_recent_activity(db=db, limit=limit)


@router.get("/engines", response_model=List[Dict[str, Any]])
async def get_engine_telemetry(
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve operational telemetry and reliability metrics for forensic engines."""
    return await get_engine_stats(db=db)
