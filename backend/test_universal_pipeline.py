import os
import sys
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import fitz  # PyMuPDF
from engines.document.universal_classifier import classify_document, DOCUMENT_CATEGORIES
from engines.document.category_rules import (
    validate_verhoeff,
    validate_document_rules,
    RuleResult,
)
from engines.document.timeline_analyzer import analyze_document_timeline
from engines.document.tampering_localizer import localize_tampering


def test_classifier():
    print("=== 1. Testing Universal Document Classifier ===")

    cases = [
        ("Government of India / Unique Identification Authority of India / Mera Aadhaar", "aadhaar_card"),
        ("INCOME TAX DEPARTMENT GOVT. OF INDIA Permanent Account Number Card PAN", "pan_card"),
        ("HDFC BANK LIMITED Statement of Account Branch Opening Balance Credits Debits Closing Balance", "bank_statement"),
        ("TECH SOLUTIONS PVT LTD PAYSLIP FOR THE MONTH OF OCTOBER 2026 Earnings Basic HRA Gross Pay Deductions Net Pay", "salary_slip"),
        ("UNION OF INDIA DRIVING LICENCE Transport Department Form 7 DL No", "driving_licence"),
        ("REPUBLIC OF INDIA PASSPORT TYPE P P<INDVALAKUNDE<<VAIBHAV<<<<<<<", "passport"),
    ]

    for sample_text, expected_key in cases:
        cat_key, cat_name, conf, signals = classify_document(sample_text)
        assert cat_key == expected_key, f"Expected {expected_key}, got {cat_key}"
        print(f"  [PASS] '{cat_name}' correctly classified ({cat_key}, confidence: {conf:.2f})")


def test_category_rules():
    print("\n=== 2. Testing Specialized Category Rules ===")

    # 1. Aadhaar Verhoeff
    print("Testing Aadhaar Verhoeff...")
    valid_uid = "999941158420"  # Valid Verhoeff checksum
    invalid_uid = "999941158429"  # Altered last digit
    assert validate_verhoeff(valid_uid) is True, "Valid UID should pass Verhoeff"
    assert validate_verhoeff(invalid_uid) is False, "Altered UID must fail Verhoeff"
    print("  [PASS] Aadhaar Verhoeff Checksum correctly caught altered check digit")

    # 2. Aadhaar document rule test
    aadhaar_tampered_text = "Government of India Unique Identification Authority of India UID: 9999 4115 8429"
    aadhaar_results = validate_document_rules("aadhaar_card", aadhaar_tampered_text)
    failed_aadhaar = [r for r in aadhaar_results if not r.passed]
    assert len(failed_aadhaar) > 0
    assert failed_aadhaar[0].rule_id == "AADHAAR_VERHOEFF_CHECKSUM"
    print(f"  [PASS] Aadhaar rule failure logged: {failed_aadhaar[0].details}")

    # 3. PAN 4th Character Check
    print("Testing PAN CBDT 4th Character Entity Validation...")
    # 'D' is not a valid 4th char (valid: P, C, H, F, A, T, B, L, J, G)
    pan_tampered_text = "INCOME TAX DEPARTMENT Permanent Account Number ABCDE1234F"
    pan_results = validate_document_rules("pan_card", pan_tampered_text)
    failed_pan = [r for r in pan_results if not r.passed]
    assert len(failed_pan) > 0
    print(f"  [PASS] PAN rule failure logged: {failed_pan[0].details}")

    # 4. Bank Statement Arithmetic Continuity Check
    print("Testing Bank Statement Arithmetic Continuity...")
    # Opening 150000 + Credits 120000 - Debits 75000 = 195000 != Stated 845210
    bank_tampered_text = """
    HDFC BANK STATEMENT OF ACCOUNT
    Opening Balance: Rs. 150000.00
    Total Credits: Rs. 120000.00
    Total Debits: Rs. 75000.00
    Closing Balance: Rs. 845210.00
    """
    bank_results = validate_document_rules("bank_statement", bank_tampered_text)
    failed_bank = [r for r in bank_results if not r.passed]
    assert len(failed_bank) > 0
    assert failed_bank[0].rule_id == "BANK_ARITHMETIC_MANIPULATION"
    print(f"  [PASS] Bank Statement balance alteration caught: {failed_bank[0].details}")

    # 5. Salary Slip Net Pay Formula Check
    print("Testing Salary Slip Formula...")
    # Gross 120000 - Deductions 15000 = 105000 != Stated 185000
    salary_tampered_text = """
    TECH SOLUTIONS PAYSLIP
    Gross Pay: Rs. 120000.00
    Total Deductions: Rs. 15000.00
    Net Pay: Rs. 185000.00
    """
    salary_results = validate_document_rules("salary_slip", salary_tampered_text)
    failed_salary = [r for r in salary_results if not r.passed]
    assert len(failed_salary) > 0
    assert failed_salary[0].rule_id == "SALARY_MATH_FORGERY"
    print(f"  [PASS] Salary Slip Net Pay alteration caught: {failed_salary[0].details}")


def test_synthetic_pdf_forensic_pipeline():
    print("\n=== 3. Testing Synthetic Document Localizer & Timeline ===")
    test_pdf_dir = Path("./test_specimens")
    test_pdf_dir.mkdir(exist_ok=True)
    pdf_path = test_pdf_dir / "test_tampered_statement.pdf"

    # Create synthetic PDF with PyMuPDF
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)  # A4

    # Add header
    page.insert_text(
        fitz.Point(50, 70),
        "HDFC BANK LIMITED - STATEMENT OF ACCOUNT",
        fontsize=14,
        fontname="helv",
    )
    page.insert_text(
        fitz.Point(50, 110),
        "Account Holder: Rajesh Kumar | Branch: Bangalore MG Road",
        fontsize=10,
        fontname="helv",
    )
    page.insert_text(
        fitz.Point(50, 140),
        "Opening Balance: Rs. 150000.00",
        fontsize=10,
        fontname="helv",
    )
    page.insert_text(
        fitz.Point(50, 170),
        "Total Credits: Rs. 120000.00 | Total Debits: Rs. 75000.00",
        fontsize=10,
        fontname="helv",
    )

    # Insert tampered font jump for Closing Balance
    page.insert_text(
        fitz.Point(50, 220),
        "Closing Balance: ",
        fontsize=10,
        fontname="helv",
    )
    page.insert_text(
        fitz.Point(150, 220),
        "Rs. 845210.00",
        fontsize=16,
        fontname="times-bold",
    )

    # Save document with specific metadata
    doc.set_metadata({
        "producer": "Adobe Acrobat Pro 2024 / Modified via Sejda",
        "creator": "Sejda PDF Editor",
        "creationDate": "D:20261014103000Z",
        "modDate": "D:20261018154500Z",
    })
    doc.save(str(pdf_path))
    doc.close()

    print(f"Generated specimen at: {pdf_path}")

    # 1. Timeline extraction
    timeline = analyze_document_timeline(str(pdf_path), {})
    print(f"  [PASS] Timeline extracted:")
    print(f"         Creation: {timeline.get('creation_date')}")
    print(f"         Modification: {timeline.get('last_modification_date')}")
    print(f"         Reliability: {timeline.get('timestamp_reliability')}")
    print(f"         Footprint: {timeline.get('detected_software_footprint')}")
    assert timeline.get("timestamp_reliability") in ["HIGH", "MODERATE"]
    assert "Sejda" in str(timeline.get("detected_software_footprint"))

    # 2. Localizer & Bounding Box extraction
    rule_results = validate_document_rules("bank_statement", """
        Opening Balance: Rs. 150000.00
        Total Credits: Rs. 120000.00
        Total Debits: Rs. 75000.00
        Closing Balance: Rs. 845210.00
    """)

    regions, annotated_rel = localize_tampering(
        file_path=str(pdf_path),
        output_dir="./uploads/annotated",
        file_id="test_specimen_001",
        rule_results=rule_results,
    )

    print(f"  [PASS] Localizer extracted {len(regions)} suspicious bounding boxes:")
    for r in regions:
        print(f"         -> [{r.severity.upper()}] {r.label} ({r.suspected_change}): bbox={r.bbox}% | {r.explanation}")

    assert len(regions) > 0, "Should detect at least one suspicious region"
    print(f"  [PASS] Annotated preview image generated at: {annotated_rel}")

    # Cleanup test PDF
    try:
        os.remove(str(pdf_path))
        test_pdf_dir.rmdir()
    except Exception:
        pass


if __name__ == "__main__":
    test_classifier()
    test_category_rules()
    test_synthetic_pdf_forensic_pipeline()
    print("\n>>> ALL UNIVERSAL DOCUMENT FORENSIC PIPELINE TESTS PASSED SUCCESSFULLY! <<<")
