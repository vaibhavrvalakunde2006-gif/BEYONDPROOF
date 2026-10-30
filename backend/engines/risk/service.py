from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.models import VerificationRequest, EngineResult, RiskAssessment
from engines.risk.models import RiskAssessmentResponse, RiskFactor

DEFAULT_WEIGHTS: Dict[str, float] = {
    "media": 0.35,
    "media_image": 0.35,
    "media_video": 0.35,
    "media_audio": 0.30,
    "document": 0.25,
    "identity": 0.30,
    "source": 0.20,
    "provenance": 0.20,
}

SEVERITY_SCORES: Dict[str, float] = {
    "critical": 40.0,
    "high": 25.0,
    "medium": 12.0,
    "low": 4.0,
    "info": 0.0,
}


def calculate_engine_score(engine_result: EngineResult) -> Tuple[float, Optional[str]]:
    """Convert forensic findings from an engine run into a normalized 0-100 risk score."""
    if engine_result.status != "completed":
        return 0.0, None

    findings = engine_result.findings if isinstance(engine_result.findings, list) else []
    total_score = 0.0
    top_finding = None
    highest_severity_val = -1

    severity_rank = {"info": 0, "low": 1, "medium": 2, "high": 3, "critical": 4}

    for f in findings:
        if isinstance(f, dict):
            sev = str(f.get("severity", "info")).lower()
            pts = SEVERITY_SCORES.get(sev, 0.0)
            total_score += pts

            rank = severity_rank.get(sev, 0)
            if rank > highest_severity_val:
                highest_severity_val = rank
                top_finding = f.get("description")

    # Score bounded between 0 and 100
    normalized_score = min(100.0, round(total_score, 1))
    return normalized_score, top_finding


def aggregate_risk(
    engine_scores: Dict[str, float],
    weights: Dict[str, float] = None,
) -> Tuple[float, Dict[str, float]]:
    """Compute normalized weighted aggregate risk score from all completed engines."""
    weights = weights or DEFAULT_WEIGHTS
    applicable_weights = {}

    for engine, score in engine_scores.items():
        weight = weights.get(engine, 0.20)
        applicable_weights[engine] = weight

    total_weight = sum(applicable_weights.values())
    if total_weight == 0:
        return 0.0, {}

    normalized_weights = {
        engine: w / total_weight for engine, w in applicable_weights.items()
    }

    overall_score = sum(
        engine_scores[engine] * normalized_weights[engine]
        for engine in engine_scores
    )

    return round(overall_score, 1), normalized_weights


def classify_risk(score: float, engines_run: int, engines_total: int) -> str:
    """Classify risk category based on aggregate score and evidence sufficiency."""
    if engines_run == 0:
        return "unverified"

    # If fewer than half of requested engines ran and score is low, data is insufficient to certify
    if engines_total > 1 and engines_run < (engines_total / 2.0) and score <= 30.0:
        return "unverified"

    if score <= 30.0:
        return "low_risk"
    elif score <= 60.0:
        return "suspicious"
    else:
        return "high_risk"


def generate_explanation(
    individual_scores: Dict[str, float],
    overall_score: float,
    category: str,
    engines_run: int,
    engines_total: int,
    authenticity_info: Optional[Dict[str, Any]] = None,
) -> str:
    """Generate a legally sound forensic rationale explaining the risk classification and authenticity status."""
    narrative_parts = []

    if engines_run == 0:
        return (
            "Verification inconclusive: No forensic analysis engines have executed. "
            "Asset authenticity remains unverified. Please trigger analysis engines to assess authenticity."
        )

    # Specific forensic alerts based on laundering or metadata forgery
    verdict = (authenticity_info or {}).get("authenticity_verdict")

    if verdict == "METADATA_FORGERY_DETECTED":
        narrative_parts.append(
            f"CRITICAL FORENSIC CONTRADICTION (Score: {overall_score}/100). "
            "Lying metadata detected: File EXIF headers directly contradict physical optical and sensor reality "
            "(sensor native aspect ratio mismatch, software quantization tables on claimed DSLR hardware, "
            "or uniform infinite depth-of-field on claimed f/1.4 wide aperture). Metadata was forged."
        )
    elif verdict == "LAUNDERED_SUSPECT":
        narrative_parts.append(
            f"LAUNDERED ASSET SUSPECT (Score: {overall_score}/100). "
            "Forensic laundering detected: 2D FFT harmonic lattice spikes (screen re-photography Moiré pattern) "
            "or exact mobile/desktop display screen capture geometry identified. "
            "The asset appears to have been re-photographed or screenshotted to wipe synthetic generation traces."
        )
    elif category == "unverified":
        narrative_parts.append(
            f"Asset status is UNVERIFIED. Only {engines_run} of {engines_total} requested analysis engines "
            f"were completed, representing insufficient forensic coverage to conclude authenticity."
        )
    elif category == "low_risk":
        has_crypto = (authenticity_info or {}).get("has_cryptographic_origin", False)
        if has_crypto:
            narrative_parts.append(
                f"Asset assessed as VERIFIED GENUINE (Score: {overall_score}/100). "
                f"Forensic inspection across {engines_run} engine(s) found zero tampering artifacts, "
                "and cryptographic C2PA provenance / hardware enclave signature was verified."
            )
        else:
            narrative_parts.append(
                f"Asset assessed as LOW RISK (Score: {overall_score}/100) — UNVERIFIED PROVENANCE. "
                f"Forensic inspection across {engines_run} engine(s) yielded no active signs of tampering or synthesis. "
                "CRITICAL FORENSIC DISTINCTION: Absence of evidence is NOT evidence of authenticity. "
                "Without cryptographic C2PA provenance or raw hardware sensor verification, the asset cannot be certified genuine, "
                "as laundering attacks (re-photography, screenshotting) intentionally eliminate digital tampering traces."
            )
    elif category == "suspicious":
        narrative_parts.append(
            f"Asset assessed as SUSPICIOUS (Composite Score: {overall_score}/100). "
            f"Forensic indicators suggest localized modifications, metadata inconsistencies, or compression variances "
            f"warranting manual expert review."
        )
    else:  # high_risk
        narrative_parts.append(
            f"Asset assessed as HIGH RISK (Composite Score: {overall_score}/100). "
            f"Substantial forensic evidence indicates synthetic generation, cloning/copy-move manipulation, "
            f"or fraudulent credential alteration."
        )

    # Add engine specific highlights
    engine_details = []
    for eng, sc in individual_scores.items():
        clean_eng = eng.replace("_", " ").title()
        engine_details.append(f"{clean_eng}: {sc}/100")

    if engine_details:
        narrative_parts.append(f"Engine breakdowns: {', '.join(engine_details)}.")

    # Forensic disclaimer
    narrative_parts.append(
        "Disclaimer: Forensic scores reflect algorithmic probability and signal analysis at the time of review. "
        "No digital forensic method claims 100% certainty. Results should be considered alongside chain-of-custody evidence."
    )

    return " ".join(narrative_parts)


async def full_risk_analysis(
    verification_id: str,
    db: AsyncSession,
) -> RiskAssessmentResponse:
    """Perform holistic risk aggregation, classification, and explanation generation."""
    # Fetch verification and results
    v_query = await db.execute(
        select(VerificationRequest).where(VerificationRequest.id == verification_id)
    )
    verification = v_query.scalar_one_or_none()
    if not verification:
        raise ValueError(f"Verification {verification_id} not found.")

    results_query = await db.execute(
        select(EngineResult).where(EngineResult.verification_id == verification_id)
    )
    engine_results = list(results_query.scalars().all())

    requested_engines = verification.engines_requested or []
    engines_total = max(len(requested_engines), len(engine_results), 1)

    completed_results = [r for r in engine_results if r.status == "completed"]
    engines_run = len(completed_results)

    individual_scores: Dict[str, float] = {}
    factors: List[RiskFactor] = []
    all_findings_list: List[Dict[str, Any]] = []

    for res in completed_results:
        sc, top_finding = calculate_engine_score(res)
        individual_scores[res.engine_name] = sc
        findings = res.findings if isinstance(res.findings, list) else []
        all_findings_list.extend(findings)
        findings_count = len(findings)

        factors.append(
            RiskFactor(
                engine_name=res.engine_name,
                score=sc,
                weight=DEFAULT_WEIGHTS.get(res.engine_name, 0.20),
                findings_count=findings_count,
                top_finding=top_finding,
            )
        )

    overall_score, normalized_weights = aggregate_risk(individual_scores)
    category = classify_risk(overall_score, engines_run, engines_total)

    # Check for C2PA cryptographic provenance and laundering findings
    has_crypto_origin = any(
        f.get("code") == "SRC_C2PA_VERIFIED"
        for f in all_findings_list if isinstance(f, dict)
    )
    has_metadata_forgery = any(
        isinstance(f, dict) and f.get("code") in {
            "METADATA_PHYSICAL_RESOLUTION_MISMATCH",
            "METADATA_QUANTIZATION_HARDWARE_MISMATCH",
            "METADATA_OPTICAL_DOF_MISMATCH",
            "METADATA_SENSOR_ISO_NOISE_MISMATCH",
        }
        for f in all_findings_list
    )
    has_laundering = any(
        isinstance(f, dict) and f.get("code") in {
            "IMG_MOIRE_RECAPTURE_DETECTED",
            "IMG_SCREENSHOT_LAUNDERING_DETECTED",
        }
        for f in all_findings_list
    )

    # Elevate category if metadata forgery was discovered
    if has_metadata_forgery and category in ["low_risk", "suspicious"]:
        category = "high_risk"
    elif has_laundering and category == "low_risk":
        category = "suspicious"

    from engines.media.laundering_service import evaluate_authenticity_verdict
    # Convert finding dicts to lightweight objects for evaluator if needed
    from engines.media.models import MediaFinding
    eval_findings = []
    for f in all_findings_list:
        if isinstance(f, dict) and "code" in f and "severity" in f:
            eval_findings.append(
                MediaFinding(
                    code=f["code"],
                    severity=f.get("severity", "info"),
                    description=f.get("description", ""),
                    evidence=f.get("evidence", ""),
                    location=f.get("location"),
                )
            )

    authenticity_info = evaluate_authenticity_verdict(
        eval_findings, overall_score, has_crypto_origin
    )

    explanation = generate_explanation(
        individual_scores, overall_score, category, engines_run, engines_total, authenticity_info
    )

    # Upsert RiskAssessment record
    risk_q = await db.execute(
        select(RiskAssessment).where(RiskAssessment.verification_id == verification_id)
    )
    risk_record = risk_q.scalar_one_or_none()

    now = datetime.now(timezone.utc)
    if not risk_record:
        risk_record = RiskAssessment(
            verification_id=verification_id,
            overall_score=overall_score,
            risk_category=category,
            weights_used=normalized_weights,
            individual_scores=individual_scores,
            explanation=explanation,
            created_at=now,
        )
        db.add(risk_record)
    else:
        risk_record.overall_score = overall_score
        risk_record.risk_category = category
        risk_record.weights_used = normalized_weights
        risk_record.individual_scores = individual_scores
        risk_record.explanation = explanation

    await db.commit()
    await db.refresh(risk_record)

    return RiskAssessmentResponse(
        id=risk_record.id,
        verification_id=verification_id,
        overall_score=overall_score,
        risk_category=category,
        authenticity_verdict=authenticity_info.get("authenticity_verdict", "NO_TAMPERING_FOUND_UNVERIFIED"),
        authenticity_details=authenticity_info,
        weights_used=normalized_weights,
        individual_scores=individual_scores,
        factors=factors,
        explanation=explanation,
        created_at=risk_record.created_at,
    )
