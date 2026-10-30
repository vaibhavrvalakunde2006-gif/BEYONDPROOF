from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, computed_field


class GraphNodeModel(BaseModel):
    id: str
    verification_id: str
    node_type: str = Field(..., description="file, user, verification, fingerprint, source, finding")
    label: str
    properties: Optional[Dict[str, Any]] = None
    engine_source: str
    created_at: datetime

    class Config:
        from_attributes = True


class GraphEdgeModel(BaseModel):
    id: str
    source_node_id: str
    target_node_id: str
    relationship: str = Field(..., alias="relation_type", description="uploaded_by, verified_by, fingerprint_of, has_finding, derived_from")
    evidence: Optional[str] = None
    engine_source: str
    created_at: datetime

    @computed_field
    def source(self) -> str:
        return self.source_node_id

    @computed_field
    def target(self) -> str:
        return self.target_node_id

    class Config:
        from_attributes = True
        populate_by_name = True


class PatternFinding(BaseModel):
    pattern_type: str
    severity: str
    description: str
    involved_node_ids: List[str] = []


class GraphResponse(BaseModel):
    verification_id: str
    nodes: List[GraphNodeModel]
    edges: List[GraphEdgeModel]
    suspicious_patterns: List[PatternFinding] = []
    summary: Dict[str, Any] = {}
