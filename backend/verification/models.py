from datetime import datetime
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field


class VerificationCreateRequest(BaseModel):
    file_id: str
    engines: Optional[List[str]] = Field(
        None,
        description="Optional list of engines to run. If omitted, engines are selected automatically based on file type.",
    )


class EngineResultSummary(BaseModel):
    id: str
    engine_name: str
    status: str
    confidence: Optional[float] = None
    findings_count: int = 0
    findings: Optional[List[Dict[str, Any]]] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


class RiskSummary(BaseModel):
    overall_score: float
    risk_category: str
    explanation: str
    individual_scores: Dict[str, float] = {}
    authenticity_verdict: Optional[str] = "NO_TAMPERING_FOUND_UNVERIFIED"
    authenticity_details: Optional[Dict[str, Any]] = None


class VerificationResponse(BaseModel):
    id: str
    user_id: str
    file_id: str
    status: str
    engines_requested: List[str] = []
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class VerificationDetailResponse(BaseModel):
    id: str
    user_id: str
    file_id: str
    file_name: str
    file_type: str
    file_size: int
    sha256_hash: str
    status: str
    engines_requested: List[str]
    document_category: Optional[str] = None
    document_category_name: Optional[str] = None
    suspected_fields: Optional[List[Dict[str, Any]]] = None
    suspicious_regions: Optional[List[Dict[str, Any]]] = None
    editing_timeline: Optional[Dict[str, Any]] = None
    rule_validation: Optional[Union[Dict[str, Any], List[Dict[str, Any]]]] = None
    annotated_image_url: Optional[str] = None
    engine_results: List[EngineResultSummary] = []
    risk_assessment: Optional[RiskSummary] = None
    moire_metrics: Optional[Dict[str, Any]] = None
    cross_modal_validation: Optional[Dict[str, Any]] = None
    screenshot_metrics: Optional[Dict[str, Any]] = None
    authenticity: Optional[Dict[str, Any]] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
