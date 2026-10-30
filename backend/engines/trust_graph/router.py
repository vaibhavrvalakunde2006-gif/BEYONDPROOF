from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.connection import get_db
from database.models import User, VerificationRequest, TrustGraphNode, TrustGraphEdge
from auth.dependencies import get_current_active_user
from engines.trust_graph.models import GraphResponse, GraphNodeModel, GraphEdgeModel
from engines.trust_graph.service import get_graph, build_verification_graph

router = APIRouter(prefix="/api/graph", tags=["Trust Graph Engine"])


async def _verify_access(verification_id: str, current_user: User, db: AsyncSession):
    v_query = await db.execute(
        select(VerificationRequest).where(VerificationRequest.id == verification_id)
    )
    verification = v_query.scalar_one_or_none()
    if not verification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification request not found.",
        )
    if verification.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied.",
        )
    return verification


@router.get("/{verification_id}", response_model=GraphResponse)
async def get_verification_graph_endpoint(
    verification_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve complete Trust Knowledge Graph topology including nodes, edges, and pattern findings."""
    await _verify_access(verification_id, current_user, db)
    graph = await get_graph(verification_id, db)
    if not graph.nodes:
        # Build if not previously generated
        graph = await build_verification_graph(verification_id, db)
    return graph


@router.get("/{verification_id}/nodes", response_model=List[GraphNodeModel])
async def get_graph_nodes_endpoint(
    verification_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all nodes for a specific verification graph."""
    await _verify_access(verification_id, current_user, db)
    nodes_q = await db.execute(
        select(TrustGraphNode).where(TrustGraphNode.verification_id == verification_id)
    )
    nodes = list(nodes_q.scalars().all())
    return [GraphNodeModel.model_validate(n) for n in nodes]


@router.get("/{verification_id}/edges", response_model=List[GraphEdgeModel])
async def get_graph_edges_endpoint(
    verification_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all relationship edges for a specific verification graph."""
    await _verify_access(verification_id, current_user, db)
    nodes_q = await db.execute(
        select(TrustGraphNode.id).where(TrustGraphNode.verification_id == verification_id)
    )
    node_ids = list(nodes_q.scalars().all())
    if not node_ids:
        return []

    edges_q = await db.execute(
        select(TrustGraphEdge).where(
            (TrustGraphEdge.source_node_id.in_(node_ids)) | (TrustGraphEdge.target_node_id.in_(node_ids))
        )
    )
    edges = list(edges_q.scalars().all())
    return [GraphEdgeModel.model_validate(e) for e in edges]
