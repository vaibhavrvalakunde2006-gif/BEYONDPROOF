import os
import uuid
import aiofiles
from typing import List, Optional
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config import settings
from database.models import UploadedFile, User, AuditLog
from files.utils import compute_sha256, validate_file_type, MAX_FILE_SIZES, get_file_category


async def save_upload(
    file: UploadFile,
    user_id: str,
    db: AsyncSession,
    designated_category: Optional[str] = None,
) -> UploadedFile:
    """Save an uploaded file to disk, compute hash, and store metadata in database."""
    original_filename = file.filename or "uploaded_file"
    content_type = file.content_type or "application/octet-stream"

    # Validate file type and extension
    is_valid, category, error_msg = validate_file_type(
        original_filename, content_type, designated_category
    )
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)

    # Determine unique storage filename and path
    unique_prefix = uuid.uuid4().hex
    clean_filename = f"{unique_prefix}_{os.path.basename(original_filename)}"
    destination_path = os.path.join(settings.UPLOAD_DIR, clean_filename)

    # Check size limits while streaming to disk
    max_size = MAX_FILE_SIZES.get(category, settings.MAX_FILE_SIZE)
    total_size = 0

    try:
        async with aiofiles.open(destination_path, "wb") as out_file:
            while chunk := await file.read(1024 * 64):  # 64 KB chunks
                total_size += len(chunk)
                if total_size > max_size:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds maximum allowed size of {max_size // (1024 * 1024)} MB for category '{category}'.",
                    )
                await out_file.write(chunk)
    except Exception as e:
        if os.path.exists(destination_path):
            os.remove(destination_path)
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}",
        )

    # Compute SHA-256 hash
    sha256_hash = compute_sha256(destination_path)

    # Create UploadedFile record
    file_record = UploadedFile(
        user_id=user_id,
        filename=clean_filename,
        original_name=original_filename,
        mime_type=content_type,
        file_size=total_size,
        sha256_hash=sha256_hash,
        storage_path=destination_path,
        file_type=category,
    )
    db.add(file_record)

    # Record audit log
    audit = AuditLog(
        user_id=user_id,
        action="file_upload",
        resource_type="file",
        resource_id=file_record.id,
        details={
            "filename": original_filename,
            "category": category,
            "sha256": sha256_hash,
            "size": total_size,
        },
    )
    db.add(audit)

    await db.commit()
    await db.refresh(file_record)
    return file_record


async def get_file(file_id: str, current_user: User, db: AsyncSession) -> UploadedFile:
    """Retrieve an uploaded file record, ensuring user ownership or admin privileges."""
    result = await db.execute(select(UploadedFile).where(UploadedFile.id == file_id))
    file_record = result.scalar_one_or_none()

    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File record not found.",
        )

    if file_record.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this file.",
        )

    return file_record


async def delete_file(file_id: str, current_user: User, db: AsyncSession) -> bool:
    """Delete physical file from storage and remove record from database."""
    file_record = await get_file(file_id, current_user, db)

    # Remove file from disk if it exists
    if os.path.exists(file_record.storage_path):
        try:
            os.remove(file_record.storage_path)
        except OSError:
            pass

    # Create audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="file_delete",
        resource_type="file",
        resource_id=file_id,
        details={"original_name": file_record.original_name, "sha256": file_record.sha256_hash},
    )
    db.add(audit)

    await db.delete(file_record)
    await db.commit()
    return True


async def list_files(
    user_id: str, db: AsyncSession, skip: int = 0, limit: int = 100
) -> List[UploadedFile]:
    """List uploaded files for a specific user with pagination."""
    query = (
        select(UploadedFile)
        .where(UploadedFile.user_id == user_id)
        .order_by(UploadedFile.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    return list(result.scalars().all())
