from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class RiskAnalyzeRequest(BaseModel):
    verification_id: str


class RiskFactor(BaseModel):
    engine_name: str
    score: float = Field(..., ge=0.0, le=100.0)
    weight: float = Field(..., ge=0.0, le=1.0)
    findings_count: int
    top_finding: Optional[str] = None


class RiskAssessmentResponse(BaseModel):
    id: Optional[str] = None
    verification_id: str
    overall_score: float = Field(..., ge=0.0, le=100.0, description="Overall risk index: 0-100")
    risk_category: str = Field(..., description="low_risk, suspicious, unverified, high_risk")
    weights_used: Dict[str, float]
    individual_scores: Dict[str, float]
    factors: List[RiskFactor] = []
    explanation: str
    created_at: datetime

    class Config:
        from_attributes = True
