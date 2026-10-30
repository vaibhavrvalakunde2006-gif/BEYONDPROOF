import hashlib
import os
from typing import Dict, List, Tuple

ALLOWED_EXTENSIONS: Dict[str, List[str]] = {
    "image": ["jpg", "jpeg", "png", "webp", "bmp", "tiff", "gif"],
    "video": ["mp4", "avi", "mov", "mkv", "webm"],
    "audio": ["mp3", "wav", "flac", "aac", "ogg", "m4a"],
    "document": ["pdf", "docx", "doc", "txt"],
    "identity": ["jpg", "jpeg", "png", "pdf", "webp", "tiff"],
}

ALLOWED_MIME_TYPES: Dict[str, List[str]] = {
    "image": [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/bmp",
        "image/tiff",
        "image/gif",
    ],
    "video": [
        "video/mp4",
        "video/x-msvideo",
        "video/quicktime",
        "video/x-matroska",
        "video/webm",
    ],
    "audio": [
        "audio/mpeg",
        "audio/wav",
        "audio/x-wav",
        "audio/flac",
        "audio/aac",
        "audio/ogg",
        "audio/mp4",
        "audio/x-m4a",
    ],
    "document": [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/plain",
    ],
    "identity": [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/tiff",
        "application/pdf",
    ],
}

MAX_FILE_SIZES: Dict[str, int] = {
    "image": 30 * 1024 * 1024,      # 30 MB
    "video": 100 * 1024 * 1024,     # 100 MB
    "audio": 50 * 1024 * 1024,      # 50 MB
    "document": 50 * 1024 * 1024,   # 50 MB
    "identity": 30 * 1024 * 1024,   # 30 MB
}


def compute_sha256(file_path: str) -> str:
    """Calculate the SHA-256 cryptographic hash of a file."""
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def get_file_extension(filename: str) -> str:
    """Extract lowercase file extension without dot."""
    if "." in filename:
        return filename.rsplit(".", 1)[1].lower()
    return ""


def get_file_category(mime_type: str, filename: str) -> str:
    """Determine the file category based on MIME type and extension."""
    ext = get_file_extension(filename)
    mime = mime_type.lower() if mime_type else ""

    # Check MIME type prefixes first
    if mime.startswith("image/"):
        return "image"
    if mime.startswith("video/"):
        return "video"
    if mime.startswith("audio/"):
        return "audio"
    if mime == "application/pdf" or "document" in mime or "text/" in mime:
        return "document"

    # Fallback to file extension mapping
    for category, extensions in ALLOWED_EXTENSIONS.items():
        if ext in extensions:
            return category

    return "document"


def validate_file_type(filename: str, content_type: str, designated_category: str = None) -> Tuple[bool, str, str]:
    """
    Validate whether the uploaded file matches allowed extensions and MIME types.
    Returns: (is_valid, category, error_message)
    """
    ext = get_file_extension(filename)
    category = designated_category or get_file_category(content_type, filename)

    if category not in ALLOWED_EXTENSIONS:
        return False, "", f"Unsupported file category: '{category}'"

    valid_extensions = ALLOWED_EXTENSIONS[category]
    if ext not in valid_extensions:
        return False, category, f"File extension '.{ext}' is not permitted for category '{category}'"

    return True, category, ""
