import os
import html
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)


def generate_pdf_report(verification_data: Dict[str, Any], output_path: str) -> str:
    """Generate a high-grade, professional forensic PDF report using ReportLab."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Document setup
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    story = []
    styles = getSampleStyleSheet()

    # Custom palette
    navy = colors.HexColor("#0F172A")
    cyan = colors.HexColor("#0284C7")
    slate = colors.HexColor("#475569")
    light_bg = colors.HexColor("#F8FAFC")
    border_color = colors.HexColor("#CBD5E1")

    # Typography styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontSize=20,
        leading=24,
        textColor=navy,
        fontName="Helvetica-Bold",
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        "DocSubTitle",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        textColor=cyan,
        fontName="Helvetica-Bold",
        spaceAfter=12,
    )
    section_h1 = ParagraphStyle(
        "SectionH1",
        parent=styles["Heading2"],
        fontSize=12,
        leading=16,
        textColor=navy,
        fontName="Helvetica-Bold",
        spaceBefore=10,
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["Normal"],
        fontSize=9,
        leading=13,
        textColor=slate,
        fontName="Helvetica",
    )
    meta_label = ParagraphStyle(
        "MetaLabel",
        parent=styles["Normal"],
        fontSize=8,
        leading=11,
        textColor=slate,
        fontName="Helvetica-Bold",
    )
    meta_val = ParagraphStyle(
        "MetaVal",
        parent=styles["Normal"],
        fontSize=8,
        leading=11,
        textColor=navy,
        fontName="Helvetica",
    )

    # 1. Header Banner
    story.append(Paragraph("BEYONDPROOF™ FORENSIC AUDIT REPORT", title_style))
    story.append(
        Paragraph("UNIVERSAL DIGITAL TRUST & CONTENT AUTHENTICITY VERIFICATION", subtitle_style)
    )
    story.append(HRFlowable(width="100%", thickness=1.5, color=cyan, spaceAfter=10))

    # 2. Audit Session Information
    v_id = verification_data.get("verification_id", "N/A")
    created = verification_data.get("created_at", "N/A")
    completed = verification_data.get("completed_at", "N/A")

    audit_meta = [
        [
            Paragraph("Verification ID:", meta_label),
            Paragraph(v_id, meta_val),
            Paragraph("Created At:", meta_label),
            Paragraph(created, meta_val),
        ],
        [
            Paragraph("Audit Scope:", meta_label),
            Paragraph("Multi-Engine Forensic Deep Scan", meta_val),
            Paragraph("Completed At:", meta_label),
            Paragraph(completed, meta_val),
        ],
    ]
    t_meta = Table(audit_meta, colWidths=[90, 180, 80, 190])
    t_meta.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), light_bg),
                ("BOX", (0, 0), (-1, -1), 0.5, border_color),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(t_meta)
    story.append(Spacer(1, 10))

    # 3. File Asset Attributes
    story.append(Paragraph("TARGET ASSET PROFILE", section_h1))
    f_name = html.escape(str(verification_data.get("file_name", "Unknown")))
    f_type = str(verification_data.get("file_type", "Unknown")).upper()
    f_size = f"{verification_data.get('file_size', 0):,} bytes"
    f_hash = verification_data.get("sha256", "N/A")

    file_rows = [
        [Paragraph("File Name:", meta_label), Paragraph(f_name, meta_val)],
        [Paragraph("Asset Classification:", meta_label), Paragraph(f_type, meta_val)],
        [Paragraph("Physical Size:", meta_label), Paragraph(f_size, meta_val)],
        [Paragraph("SHA-256 Digest:", meta_label), Paragraph(f"<font name='Courier'>{f_hash}</font>", meta_val)],
    ]
    t_file = Table(file_rows, colWidths=[120, 420])
    t_file.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, border_color),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(t_file)
    story.append(Spacer(1, 10))

    # 4. Risk Assessment & Verdict
    story.append(Paragraph("EXECUTIVE VERDICT & RISK CLASSIFICATION", section_h1))
    risk_score = verification_data.get("risk_score", 0.0)
    risk_cat = str(verification_data.get("risk_category", "UNVERIFIED")).upper().replace("_", " ")

    verdict_color = colors.HexColor("#16A34A")  # green
    if "SUSPICIOUS" in risk_cat:
        verdict_color = colors.HexColor("#D97706")  # amber
    elif "HIGH" in risk_cat:
        verdict_color = colors.HexColor("#DC2626")  # red
    elif "UNVERIFIED" in risk_cat:
        verdict_color = colors.HexColor("#64748B")  # slate

    verdict_table_data = [
        [
            Paragraph(f"<b>RISK CLASSIFICATION</b><br/><font size=16><b>{risk_cat}</b></font>", ParagraphStyle("VLabel", parent=styles["Normal"], textColor=verdict_color, alignment=1)),
            Paragraph(f"<b>RISK SCORE</b><br/><font size=18><b>{risk_score}/100</b></font>", ParagraphStyle("VScore", parent=styles["Normal"], textColor=navy, alignment=1)),
        ]
    ]
    t_verdict = Table(verdict_table_data, colWidths=[270, 270])
    t_verdict.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), light_bg),
                ("BOX", (0, 0), (-1, -1), 1, verdict_color),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(t_verdict)
    story.append(Spacer(1, 6))

    explanation = html.escape(str(verification_data.get("explanation", "No narrative available.")))
    story.append(Paragraph(f"<b>Evaluation Rationale:</b> {explanation}", body_style))
    story.append(Spacer(1, 10))

    # 5. Engine Execution Matrix
    story.append(Paragraph("FORENSIC ENGINES AUDIT MATRIX", section_h1))
    engines = verification_data.get("engines", [])
    eng_headers = [
        Paragraph("<b>Engine</b>", meta_label),
        Paragraph("<b>Status</b>", meta_label),
        Paragraph("<b>Confidence</b>", meta_label),
        Paragraph("<b>Findings Count</b>", meta_label),
    ]
    eng_rows = [eng_headers]
    for eng in engines:
        eng_rows.append(
            [
                Paragraph(eng.get("name", "").replace("_", " ").title(), meta_val),
                Paragraph(eng.get("status", "").upper(), meta_val),
                Paragraph(f"{eng.get('confidence', 0.85) * 100:.0f}%", meta_val),
                Paragraph(str(eng.get("findings_count", 0)), meta_val),
            ]
        )

    t_eng = Table(eng_rows, colWidths=[180, 120, 120, 120])
    t_eng.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), light_bg),
                ("GRID", (0, 0), (-1, -1), 0.5, border_color),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(t_eng)
    story.append(Spacer(1, 10))

    # 6. Detailed Findings Log
    findings = verification_data.get("findings", [])
    if findings:
        story.append(Paragraph(f"DETAILED FORENSIC FINDINGS ({len(findings)} OBSERVATIONS)", section_h1))
        f_headers = [
            Paragraph("<b>Severity</b>", meta_label),
            Paragraph("<b>Code</b>", meta_label),
            Paragraph("<b>Description & Evidence</b>", meta_label),
            Paragraph("<b>Engine / Loc</b>", meta_label),
        ]
        f_rows = [f_headers]

        sev_colors = {
            "critical": "#DC2626",
            "high": "#EA580C",
            "medium": "#D97706",
            "low": "#2563EB",
            "info": "#475569",
        }

        for f in findings[:25]:  # show up to 25 primary findings
            sev = str(f.get("severity", "info")).lower()
            hex_c = sev_colors.get(sev, "#475569")
            sev_p = Paragraph(f"<font color='{hex_c}'><b>{sev.upper()}</b></font>", meta_label)
            code_safe = html.escape(str(f.get('code', '')))
            code_p = Paragraph(f"<b>{code_safe}</b>", meta_val)
            desc_safe = html.escape(str(f.get('description', '')))
            ev_safe = html.escape(str(f.get('evidence', '')))
            desc_text = f"{desc_safe}<br/><font color='#64748B' size=7>Evidence: {ev_safe}</font>"
            desc_p = Paragraph(desc_text, meta_val)
            loc_safe = html.escape(str(f.get('location', '') or ''))
            eng_safe = html.escape(str(f.get('engine', '') or ''))
            loc_text = f"{eng_safe}<br/>{loc_safe}"
            loc_p = Paragraph(loc_text, meta_val)

            f_rows.append([sev_p, code_p, desc_p, loc_p])

        t_find = Table(f_rows, colWidths=[65, 120, 245, 110])
        t_find.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), light_bg),
                    ("GRID", (0, 0), (-1, -1), 0.5, border_color),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ]
            )
        )
        story.append(t_find)
        story.append(Spacer(1, 10))

    # 7. Disclaimers and Limitations
    story.append(
        KeepTogether(
            [
                Paragraph("METHODOLOGICAL LIMITATIONS & LEGAL DISCLAIMER", section_h1),
                Paragraph(
                    "BeyondProof platform forensic evaluations are probabilistic and based upon state-of-the-art "
                    "signal processing, computer vision, error level analysis, and metadata reconstruction. "
                    "Findings do not constitute absolute judicial proof of forgery or authenticity. "
                    "Recompression, social media transmission, or format conversion can alter forensic markers. "
                    "Always corroborate automated verification with verified chain-of-custody documentation.",
                    body_style,
                ),
                Spacer(1, 6),
                Paragraph(
                    "<b>Recommended Next Steps:</b> If marked Suspicious or High Risk, isolate original camera/device "
                    "source media, inspect cryptographic C2PA manifests, and request raw uncompressed source files.",
                    body_style,
                ),
            ]
        )
    )

    doc.build(story)
    return output_path
