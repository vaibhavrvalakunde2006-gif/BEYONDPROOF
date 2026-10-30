from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from database.models import User
from auth.dependencies import get_current_active_user
from files.service import save_upload, get_file, delete_file, list_files

router = APIRouter(prefix="/api/files", tags=["Files"])


class FileResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    original_name: str
    mime_type: str
    file_size: int
    sha256_hash: str
    storage_path: str
    file_type: str
    created_at: datetime

    class Config:
        from_attributes = True


class FileDeleteResponse(BaseModel):
    success: bool
    file_id: str
    message: str


@router.post("/upload", response_model=FileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    category: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a file to the platform with type and size validation."""
    file_record = await save_upload(
        file=file,
        user_id=current_user.id,
        db=db,
        designated_category=category,
    )
    return FileResponse.model_validate(file_record)


@router.get("", response_model=List[FileResponse])
@router.get("/", response_model=List[FileResponse])
async def get_user_files(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List all uploaded files belonging to the authenticated user."""
    files = await list_files(user_id=current_user.id, db=db, skip=skip, limit=limit)
    return [FileResponse.model_validate(f) for f in files]


@router.get("/{file_id}", response_model=FileResponse)
async def get_file_info(
    file_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve metadata information for a specific file."""
    file_record = await get_file(file_id=file_id, current_user=current_user, db=db)
    return FileResponse.model_validate(file_record)


@router.delete("/{file_id}", response_model=FileDeleteResponse)
async def remove_file(
    file_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an uploaded file and its metadata."""
    await delete_file(file_id=file_id, current_user=current_user, db=db)
    return FileDeleteResponse(
        success=True,
        file_id=file_id,
        message="File successfully deleted.",
    )
