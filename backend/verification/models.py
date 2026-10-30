from datetime import datetime
from typing import List, Optional, Dict, Any
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
    engine_results: List[EngineResultSummary] = []
    risk_assessment: Optional[RiskSummary] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
