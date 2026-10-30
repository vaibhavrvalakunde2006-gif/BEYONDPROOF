import pytest
from httpx import AsyncClient
from engines.risk.service import classify_risk, aggregate_risk, calculate_engine_score
from database.models import EngineResult


def test_risk_classification_boundaries():
    """Verify threshold boundary classification logic."""
    # Score 0-30: LOW_RISK (when sufficient engines ran)
    assert classify_risk(score=0.0, engines_run=2, engines_total=2) == "low_risk"
    assert classify_risk(score=30.0, engines_run=2, engines_total=2) == "low_risk"

    # Score 31-60: SUSPICIOUS
    assert classify_risk(score=31.0, engines_run=2, engines_total=2) == "suspicious"
    assert classify_risk(score=60.0, engines_run=2, engines_total=2) == "suspicious"

    # Score 61-100: HIGH_RISK
    assert classify_risk(score=61.0, engines_run=2, engines_total=2) == "high_risk"
    assert classify_risk(score=100.0, engines_run=2, engines_total=2) == "high_risk"


def test_unverified_when_no_data_or_insufficient_engines():
    """Verify that 0 engines run or sparse coverage defaults safely to UNVERIFIED."""
    # 0 engines run
    assert classify_risk(score=0.0, engines_run=0, engines_total=3) == "unverified"

    # Fewer than half requested engines completed and low score
    assert classify_risk(score=15.0, engines_run=1, engines_total=4) == "unverified"


def test_risk_scoring_aggregation():
    """Verify normalized weighted risk aggregation across multiple engines."""
    engine_scores = {
        "media_image": 50.0,
        "document": 20.0,
        "source": 10.0,
    }
    weights = {
        "media_image": 0.40,
        "document": 0.40,
        "source": 0.20,
    }
    overall_score, norm_weights = aggregate_risk(engine_scores, weights)
    # Expected: (50*0.4) + (20*0.4) + (10*0.2) = 20 + 8 + 2 = 30.0
    assert overall_score == 30.0
    assert round(sum(norm_weights.values()), 2) == 1.0


def test_engine_score_calculation():
    """Verify finding severities translate correctly into cumulative engine risk scores."""
    result = EngineResult(
        verification_id="v-123",
        engine_name="document",
        status="completed",
        findings=[
            {"code": "F1", "severity": "critical", "description": "Critical forgery indicator"},
            {"code": "F2", "severity": "high", "description": "High manipulation indicator"},
            {"code": "F3", "severity": "low", "description": "Minor irregularity"},
            {"code": "F4", "severity": "info", "description": "Informational note"},
        ],
    )
    # Critical: 40 + High: 25 + Low: 4 + Info: 0 = 69.0
    score, top_finding = calculate_engine_score(result)
    assert score == 69.0
    assert top_finding == "Critical forgery indicator"


@pytest.mark.asyncio
async def test_risk_analyze_endpoint(async_client: AsyncClient, auth_headers):
    """Verify risk analysis API endpoint computes assessment for an existing verification."""
    # Create a verification first via direct upload & verification
    pdf_bytes = b"%PDF-1.4 Minimal PDF %%EOF"
    files = {"file": ("risk_test.pdf", pdf_bytes, "application/pdf")}
    upload_res = await async_client.post("/api/files/upload", files=files, headers=auth_headers)
    file_id = upload_res.json()["id"]

    verif_res = await async_client.post(
        "/api/verification/create",
        json={"file_id": file_id},
        headers=auth_headers,
    )
    assert verif_res.status_code == 201
    v_id = verif_res.json()["id"]

    # Trigger risk analysis endpoint
    risk_res = await async_client.post(
        "/api/risk/analyze",
        json={"verification_id": v_id},
        headers=auth_headers,
    )
    assert risk_res.status_code == 200
    data = risk_res.json()
    assert "overall_score" in data
    assert "risk_category" in data
    assert data["risk_category"] in ["low_risk", "suspicious", "high_risk", "unverified"]
    assert "explanation" in data
