import uuid
from datetime import datetime
from typing import Optional, List, Any
from sqlalchemy import (
    String,
    Integer,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    JSON,
    func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database.connection import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="user", nullable=False)  # "user" | "admin"
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    files: Mapped[List["UploadedFile"]] = relationship(
        "UploadedFile", back_populates="user", cascade="all, delete-orphan"
    )
    verifications: Mapped[List["VerificationRequest"]] = relationship(
        "VerificationRequest", back_populates="user", cascade="all, delete-orphan"
    )
    audit_logs: Mapped[List["AuditLog"]] = relationship(
        "AuditLog", back_populates="user"
    )


class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    original_name: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    sha256_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    storage_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)  # image/video/audio/document/identity
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="files")
    verifications: Mapped[List["VerificationRequest"]] = relationship(
        "VerificationRequest", back_populates="file", cascade="all, delete-orphan"
    )
    document_metadata: Mapped[Optional["DocumentMetadata"]] = relationship(
        "DocumentMetadata", back_populates="file", uselist=False, cascade="all, delete-orphan"
    )
    fingerprints: Mapped[List["FileFingerprint"]] = relationship(
        "FileFingerprint", back_populates="file", cascade="all, delete-orphan"
    )
    provenance_records: Mapped[List["ProvenanceRecord"]] = relationship(
        "ProvenanceRecord", back_populates="file", cascade="all, delete-orphan"
    )


class VerificationRequest(Base):
    __tablename__ = "verification_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    file_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("uploaded_files.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(
        String(50), default="pending", nullable=False
    )  # pending / processing / completed / failed
    engines_requested: Mapped[Any] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="verifications")
    file: Mapped["UploadedFile"] = relationship("UploadedFile", back_populates="verifications")
    engine_results: Mapped[List["EngineResult"]] = relationship(
        "EngineResult", back_populates="verification", cascade="all, delete-orphan"
    )
    risk_assessment: Mapped[Optional["RiskAssessment"]] = relationship(
        "RiskAssessment", back_populates="verification", uselist=False, cascade="all, delete-orphan"
    )
    graph_nodes: Mapped[List["TrustGraphNode"]] = relationship(
        "TrustGraphNode", back_populates="verification", cascade="all, delete-orphan"
    )


class EngineResult(Base):
    __tablename__ = "engine_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    verification_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("verification_requests.id", ondelete="CASCADE"), nullable=False, index=True
    )
    engine_name: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="pending", nullable=False
    )  # pending / running / completed / failed / skipped
    findings: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    verification: Mapped["VerificationRequest"] = relationship(
        "VerificationRequest", back_populates="engine_results"
    )


class DocumentMetadata(Base):
    __tablename__ = "document_metadata"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    file_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("uploaded_files.id", ondelete="CASCADE"), nullable=False, index=True, unique=True
    )
    extracted_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    fonts: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    page_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    has_signatures: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_qr_codes: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    qr_data: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    metadata_json: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)

    # Relationships
    file: Mapped["UploadedFile"] = relationship("UploadedFile", back_populates="document_metadata")


class FileFingerprint(Base):
    __tablename__ = "file_fingerprints"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    file_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("uploaded_files.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sha256: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    registered_by: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    registered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)

    # Relationships
    file: Mapped["UploadedFile"] = relationship("UploadedFile", back_populates="fingerprints")


class ProvenanceRecord(Base):
    __tablename__ = "provenance_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    file_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("uploaded_files.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    creation_tool: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    modification_history: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    c2pa_status: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)

    # Relationships
    file: Mapped["UploadedFile"] = relationship("UploadedFile", back_populates="provenance_records")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    verification_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("verification_requests.id", ondelete="CASCADE"), nullable=False, index=True, unique=True
    )
    overall_score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_category: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # low_risk / suspicious / unverified / high_risk
    weights_used: Mapped[Any] = mapped_column(JSON, nullable=False)
    individual_scores: Mapped[Any] = mapped_column(JSON, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)

    # Relationships
    verification: Mapped["VerificationRequest"] = relationship(
        "VerificationRequest", back_populates="risk_assessment"
    )


class TrustGraphNode(Base):
    __tablename__ = "trust_graph_nodes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    verification_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("verification_requests.id", ondelete="CASCADE"), nullable=False, index=True
    )
    node_type: Mapped[str] = mapped_column(String(50), nullable=False)  # file, user, verification, finding, etc.
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    properties: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    engine_source: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)

    # Relationships
    verification: Mapped["VerificationRequest"] = relationship(
        "VerificationRequest", back_populates="graph_nodes"
    )
    outgoing_edges: Mapped[List["TrustGraphEdge"]] = relationship(
        "TrustGraphEdge",
        foreign_keys="TrustGraphEdge.source_node_id",
        back_populates="source_node",
        cascade="all, delete-orphan",
    )
    incoming_edges: Mapped[List["TrustGraphEdge"]] = relationship(
        "TrustGraphEdge",
        foreign_keys="TrustGraphEdge.target_node_id",
        back_populates="target_node",
        cascade="all, delete-orphan",
    )


class TrustGraphEdge(Base):
    __tablename__ = "trust_graph_edges"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    source_node_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("trust_graph_nodes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    target_node_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("trust_graph_nodes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    relation_type: Mapped[str] = mapped_column(String(100), nullable=False)
    evidence: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    engine_source: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)

    # Relationships
    source_node: Mapped["TrustGraphNode"] = relationship(
        "TrustGraphNode", foreign_keys="[TrustGraphEdge.source_node_id]", back_populates="outgoing_edges"
    )
    target_node: Mapped["TrustGraphNode"] = relationship(
        "TrustGraphNode", foreign_keys="[TrustGraphEdge.target_node_id]", back_populates="incoming_edges"
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    details: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)

    # Relationships
    user: Mapped[Optional["User"]] = relationship("User", back_populates="audit_logs")
