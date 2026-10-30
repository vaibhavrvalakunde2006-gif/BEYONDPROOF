from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class IdentityFinding(BaseModel):
    code: str = Field(..., description="Finding identifier, e.g. ID_MRZ_CHECKSUM_FAIL, ID_FACE_NOT_FOUND")
    severity: str = Field(..., description="Severity level: info, low, medium, high, critical")
    description: str = Field(..., description="Detailed description of identity check finding")
    evidence: str = Field(..., description="Evidence, extracted values, or mismatch details")
    location: Optional[str] = Field(None, description="Document zone, MRZ line, or photo region")


class IdentityAnalysisRequest(BaseModel):
    file_id: str
    verification_id: Optional[str] = None


class FaceCompareRequest(BaseModel):
    face1_file_id: str
    face2_file_id: str


class FaceCompareResponse(BaseModel):
    similarity_score: float = Field(..., ge=0.0, le=1.0)
    is_match: bool
    confidence: float
    details: Dict[str, Any] = {}


class IdentityAnalysisResponse(BaseModel):
    verification_id: str
    engine_name: str = "identity"
    status: str = Field(..., description="completed, failed, or skipped")
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    findings: List[IdentityFinding] = []
    face_detected: bool = False
    face_count: int = 0
    structure_valid: bool = False
    extracted_fields: Dict[str, Any] = {}
    error_message: Optional[str] = None
    completed_at: Optional[datetime] = None
