from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class MediaFinding(BaseModel):
    code: str = Field(..., description="Finding code, e.g. IMG_ELA_ANOMALY, VID_TEMPORAL_CUT, AUD_SPECTRAL_JUMP")
    severity: str = Field(..., description="Severity level: info, low, medium, high, critical")
    description: str = Field(..., description="Forensic finding summary")
    evidence: str = Field(..., description="Detailed forensic metrics or numeric evidence")
    location: Optional[str] = Field(None, description="Spatial coordinates, frame timestamp, or audio offset")


class ImageAnalysisRequest(BaseModel):
    file_id: str
    verification_id: Optional[str] = None


class VideoAnalysisRequest(BaseModel):
    file_id: str
    verification_id: Optional[str] = None


class AudioAnalysisRequest(BaseModel):
    file_id: str
    verification_id: Optional[str] = None


class MediaAnalysisResponse(BaseModel):
    verification_id: str
    media_type: str = Field(..., description="image, video, or audio")
    engine_name: str = "media"
    status: str = Field(..., description="completed, failed, or skipped")
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    findings: List[MediaFinding] = []
    details: Optional[Dict[str, Any]] = None
    ela_image_path: Optional[str] = None
    error_message: Optional[str] = None
    completed_at: Optional[datetime] = None
