from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class SourceFinding(BaseModel):
    code: str = Field(..., description="Finding identifier, e.g. SRC_KNOWN_REGISTRY_MATCH, SRC_C2PA_VERIFIED")
    severity: str = Field(..., description="Severity level: info, low, medium, high, critical")
    description: str = Field(..., description="Description of source analysis finding")
    evidence: str = Field(..., description="Cryptographic or metadata proof")
    location: Optional[str] = Field(None, description="Metadata block, header offset, or registry table")


class FingerprintRegisterRequest(BaseModel):
    file_id: str
    notes: Optional[str] = None


class FingerprintCompareRequest(BaseModel):
    file_id_1: str
    file_id_2: str


class FingerprintResponse(BaseModel):
    id: str
    file_id: str
    sha256: str
    registered_by: Optional[str] = None
    notes: Optional[str] = None
    registered_at: datetime

    class Config:
        from_attributes = True


class CompareResponse(BaseModel):
    is_exact_match: bool
    sha256_match: bool
    perceptual_match: Optional[bool] = None
    similarity_score: float = Field(..., ge=0.0, le=1.0)
    file_1_hash: str
    file_2_hash: str
    details: Dict[str, Any] = {}
    relationship: Optional[str] = None
    content_diff_summary: Optional[str] = None
    metadata_diff: Optional[Dict[str, Any]] = None


class ProvenanceInfo(BaseModel):
    source_url: Optional[str] = None
    creation_tool: Optional[str] = None
    modification_history: Optional[List[Dict[str, Any]]] = None
    c2pa_status: Optional[str] = None


class SourceAnalysisResponse(BaseModel):
    verification_id: str
    engine_name: str = "source"
    status: str = Field(..., description="completed, failed, or skipped")
    confidence: float = Field(default=0.90, ge=0.0, le=1.0)
    findings: List[SourceFinding] = []
    sha256: str
    provenance: Optional[ProvenanceInfo] = None
    historical_matches: List[FingerprintResponse] = []
    error_message: Optional[str] = None
    completed_at: Optional[datetime] = None
