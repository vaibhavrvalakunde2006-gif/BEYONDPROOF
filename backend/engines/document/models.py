from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class DocumentFinding(BaseModel):
    code: str = Field(..., description="Machine-readable finding identifier, e.g. DOC_FONT_ANOMALY")
    severity: str = Field(..., description="Severity level: info, low, medium, high, critical")
    description: str = Field(..., description="Human-readable description of the forensic finding")
    evidence: str = Field(..., description="Extracted forensic evidence or anomalous data snippet")
    location: Optional[str] = Field(None, description="Page number, coordinates, or object stream location")


class DocumentAnalysisRequest(BaseModel):
    file_id: str = Field(..., description="Unique ID of the uploaded document to analyze")
    verification_id: Optional[str] = Field(None, description="Existing verification request ID to attach to")


class DocumentMetadataSummary(BaseModel):
    page_count: int = 0
    author: Optional[str] = None
    creator: Optional[str] = None
    producer: Optional[str] = None
    creation_date: Optional[str] = None
    modification_date: Optional[str] = None
    has_signatures: bool = False
    has_qr_codes: bool = False
    qr_data: List[Dict[str, Any]] = []
    font_count: int = 0
    font_families: List[str] = []


class DocumentAnalysisResponse(BaseModel):
    verification_id: str
    file_id: Optional[str] = None
    engine_name: str = "document"
    status: str = Field(..., description="completed, failed, or skipped")
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    findings: List[DocumentFinding] = []
    metadata: Optional[DocumentMetadataSummary] = None
    extracted_text: Optional[str] = None
    fonts: Optional[List[Dict[str, Any]]] = None
    error_message: Optional[str] = None
    completed_at: Optional[datetime] = None


class DocumentReport(BaseModel):
    verification_id: str
    file_id: str
    filename: str
    page_count: int
    fonts: List[Dict[str, Any]]
    has_signatures: bool
    has_qr_codes: bool
    qr_codes: List[Dict[str, Any]]
    metadata: Dict[str, Any]
    findings: List[DocumentFinding]
    raw_text_preview: Optional[str] = None
    analysis_date: datetime
