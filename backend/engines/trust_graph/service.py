from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple, Optional
import networkx as nx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from database.models import (
    VerificationRequest,
    UploadedFile,
    User,
    EngineResult,
    ProvenanceRecord,
    FileFingerprint,
    TrustGraphNode,
    TrustGraphEdge,
)
from engines.trust_graph.models import (
    GraphNodeModel,
    GraphEdgeModel,
    PatternFinding,
    GraphResponse,
)


async def create_node(
    verification_id: str,
    node_type: str,
    label: str,
    properties: Optional[Dict[str, Any]],
    engine_source: str,
    db: AsyncSession,
) -> TrustGraphNode:
    """Create and persist a Trust Graph node in the database."""
    node = TrustGraphNode(
        verification_id=verification_id,
        node_type=node_type,
        label=label,
        properties=properties or {},
        engine_source=engine_source,
        created_at=datetime.now(timezone.utc),
    )
    db.add(node)
    await db.commit()
    await db.refresh(node)
    return node


async def create_edge(
    source_id: str,
    target_id: str,
    relationship: str,
    evidence: Optional[str],
    engine_source: str,
    db: AsyncSession,
) -> TrustGraphEdge:
    """Create and persist a directed relationship edge between two graph nodes."""
    edge = TrustGraphEdge(
        source_node_id=source_id,
        target_node_id=target_id,
        relation_type=relationship,
        evidence=evidence,
        engine_source=engine_source,
        created_at=datetime.now(timezone.utc),
    )
    db.add(edge)
    await db.commit()
    await db.refresh(edge)
    return edge


async def build_verification_graph(
    verification_id: str,
    db: AsyncSession,
) -> GraphResponse:
    """Construct an interconnected Trust Knowledge Graph from all verification entities and forensic findings."""
    # Delete existing nodes and edges for this verification session to avoid duplicates
    existing_nodes_q = await db.execute(
        select(TrustGraphNode).where(TrustGraphNode.verification_id == verification_id)
    )
    existing_nodes = existing_nodes_q.scalars().all()
    if existing_nodes:
        node_ids = [n.id for n in existing_nodes]
        await db.execute(
            delete(TrustGraphEdge).where(
                (TrustGraphEdge.source_node_id.in_(node_ids)) | (TrustGraphEdge.target_node_id.in_(node_ids))
            )
        )
        await db.execute(
            delete(TrustGraphNode).where(TrustGraphNode.verification_id == verification_id)
        )
        await db.commit()

    # Load verification, file, user, and engine results
    v_query = await db.execute(
        select(VerificationRequest).where(VerificationRequest.id == verification_id)
    )
    verification = v_query.scalar_one_or_none()
    if not verification:
        raise ValueError(f"Verification {verification_id} not found.")

    file_query = await db.execute(
        select(UploadedFile).where(UploadedFile.id == verification.file_id)
    )
    file_record = file_query.scalar_one_or_none()

    user_query = await db.execute(
        select(User).where(User.id == verification.user_id)
    )
    user_record = user_query.scalar_one_or_none()

    results_query = await db.execute(
        select(EngineResult).where(EngineResult.verification_id == verification_id)
    )
    engine_results = results_query.scalars().all()

    # 1. User Node
    user_label = user_record.email if user_record else "Unknown User"
    user_node = await create_node(
        verification_id=verification_id,
        node_type="user",
        label=user_label,
        properties={"email": user_label, "role": user_record.role if user_record else "user"},
        engine_source="system",
        db=db,
    )

    # 2. File Node
    file_label = file_record.original_name if file_record else "Target File"
    file_node = await create_node(
        verification_id=verification_id,
        node_type="file",
        label=file_label,
        properties={
            "mime_type": file_record.mime_type if file_record else "",
            "file_size": file_record.file_size if file_record else 0,
            "sha256": file_record.sha256_hash if file_record else "",
            "file_type": file_record.file_type if file_record else "",
        },
        engine_source="system",
        db=db,
    )

    # Edge: File -> User (uploaded_by)
    await create_edge(
        source_id=file_node.id,
        target_id=user_node.id,
        relationship="uploaded_by",
        evidence=f"File uploaded by account {user_label}",
        engine_source="system",
        db=db,
    )

    # 3. Verification Request Node
    verif_node = await create_node(
        verification_id=verification_id,
        node_type="verification",
        label=f"Audit Session {verification_id[:8]}",
        properties={"status": verification.status, "engines": verification.engines_requested},
        engine_source="system",
        db=db,
    )

    # Edge: Verification -> File (verified_by)
    await create_edge(
        source_id=verif_node.id,
        target_id=file_node.id,
        relationship="verified_by",
        evidence="Active verification inspection target",
        engine_source="system",
        db=db,
    )

    # 4. Fingerprint Node
    if file_record:
        fp_node = await create_node(
            verification_id=verification_id,
            node_type="fingerprint",
            label=f"SHA-256: {file_record.sha256_hash[:12]}...",
            properties={"sha256": file_record.sha256_hash},
            engine_source="source",
            db=db,
        )
        await create_edge(
            source_id=fp_node.id,
            target_id=file_node.id,
            relationship="fingerprint_of",
            evidence="Cryptographic content identity match",
            engine_source="source",
            db=db,
        )

    # 5. Provenance Source Node (if present)
    if file_record:
        prov_q = await db.execute(
            select(ProvenanceRecord).where(ProvenanceRecord.file_id == file_record.id)
        )
        prov = prov_q.scalar_one_or_none()
        if prov and (prov.creation_tool or prov.c2pa_status):
            src_node = await create_node(
                verification_id=verification_id,
                node_type="source",
                label=prov.creation_tool or "Provenance Record",
                properties={"c2pa": prov.c2pa_status, "tool": prov.creation_tool},
                engine_source="source",
                db=db,
            )
            await create_edge(
                source_id=file_node.id,
                target_id=src_node.id,
                relationship="derived_from",
                evidence=f"Metadata indicates origin: {prov.creation_tool or prov.c2pa_status}",
                engine_source="source",
                db=db,
            )

    # 6. Finding Nodes from Engine Results
    for res in engine_results:
        findings = res.findings if isinstance(res.findings, list) else []
        for finding in findings:
            if isinstance(finding, dict):
                code = finding.get("code", "FINDING")
                severity = finding.get("severity", "info")
                desc = finding.get("description", "")
                evidence = finding.get("evidence", "")

                finding_node = await create_node(
                    verification_id=verification_id,
                    node_type="finding",
                    label=f"[{severity.upper()}] {code}",
                    properties={"code": code, "severity": severity, "description": desc, "evidence": evidence},
                    engine_source=res.engine_name,
                    db=db,
                )
                await create_edge(
                    source_id=file_node.id,
                    target_id=finding_node.id,
                    relationship="has_finding",
                    evidence=desc,
                    engine_source=res.engine_name,
                    db=db,
                )

    return await get_graph(verification_id, db)


async def get_graph(verification_id: str, db: AsyncSession) -> GraphResponse:
    """Retrieve all nodes, edges, and suspicious topological patterns for a verification graph."""
    nodes_q = await db.execute(
        select(TrustGraphNode).where(TrustGraphNode.verification_id == verification_id)
    )
    nodes = list(nodes_q.scalars().all())

    node_ids = [n.id for n in nodes]
    edges: List[TrustGraphEdge] = []
    if node_ids:
        edges_q = await db.execute(
            select(TrustGraphEdge).where(
                (TrustGraphEdge.source_node_id.in_(node_ids)) | (TrustGraphEdge.target_node_id.in_(node_ids))
            )
        )
        edges = list(edges_q.scalars().all())

    suspicious_patterns = await find_suspicious_patterns(verification_id, db)

    summary = {
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "node_breakdown": {},
    }
    for n in nodes:
        summary["node_breakdown"][n.node_type] = summary["node_breakdown"].get(n.node_type, 0) + 1

    return GraphResponse(
        verification_id=verification_id,
        nodes=[GraphNodeModel.model_validate(n) for n in nodes],
        edges=[GraphEdgeModel.model_validate(e) for e in edges],
        suspicious_patterns=suspicious_patterns,
        summary=summary,
    )


async def find_suspicious_patterns(verification_id: str, db: AsyncSession) -> List[PatternFinding]:
    """Analyze graph topology with NetworkX to detect anomalies, dense finding clusters, or conflicting provenance."""
    patterns: List[PatternFinding] = []

    nodes_q = await db.execute(
        select(TrustGraphNode).where(TrustGraphNode.verification_id == verification_id)
    )
    nodes = list(nodes_q.scalars().all())
    if not nodes:
        return patterns

    node_map = {n.id: n for n in nodes}
    node_ids = list(node_map.keys())

    edges_q = await db.execute(
        select(TrustGraphEdge).where(TrustGraphEdge.source_node_id.in_(node_ids))
    )
    edges = list(edges_q.scalars().all())

    # Build NetworkX DiGraph
    G = nx.DiGraph()
    for n in nodes:
        G.add_node(n.id, node_type=n.node_type, label=n.label, properties=n.properties or {})

    for e in edges:
        G.add_edge(e.source_node_id, e.target_node_id, relationship=e.relation_type)

    # 1. High-severity finding cluster check
    finding_nodes = [
        n for n in nodes
        if n.node_type == "finding" and (n.properties or {}).get("severity") in ["high", "critical"]
    ]
    if len(finding_nodes) >= 2:
        patterns.append(
            PatternFinding(
                pattern_type="HIGH_SEVERITY_FINDING_CLUSTER",
                severity="high",
                description=f"Multiple high or critical forensic anomalies converge on this target asset ({len(finding_nodes)} flags).",
                involved_node_ids=[n.id for n in finding_nodes],
            )
        )

    # 2. Check for editing software source nodes
    source_nodes = [n for n in nodes if n.node_type == "source"]
    for sn in source_nodes:
        tool_str = str((sn.properties or {}).get("tool") or "").lower()
        if any(tool in tool_str for tool in ["photoshop", "gimp", "canva", "pdftk", "illustrator"]):
            patterns.append(
                PatternFinding(
                    pattern_type="MANIPULATION_SOFTWARE_SOURCE",
                    severity="medium",
                    description=f"Asset provenance links directly to raster manipulation software: '{tool_str}'.",
                    involved_node_ids=[sn.id],
                )
            )

    return patterns
