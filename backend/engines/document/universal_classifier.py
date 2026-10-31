"""
BeyondProof - Universal Document Type Classifier
Automatically classifies uploaded documents into specialized legal, financial,
academic, identity, or administrative document categories using multi-signal analysis:
textual patterns, keywords, regular expressions, structural layout, and headers.
"""

import re
from typing import Dict, Any, List, Tuple


DOCUMENT_CATEGORIES = {
    "aadhaar_card": "Aadhaar Card",
    "pan_card": "PAN Card",
    "driving_licence": "Driving Licence",
    "passport": "Passport",
    "voter_id": "Voter ID Card (EPIC)",
    "bank_statement": "Bank Account Statement",
    "salary_slip": "Salary Slip / Payslip",
    "marks_card": "Marks Card / Academic Transcript",
    "educational_certificate": "Educational Degree / Certificate",
    "medical_certificate": "Medical Certificate / Prescription",
    "income_certificate": "Income / Revenue Certificate",
    "invoice": "Commercial Invoice / Tax Receipt",
    "legal_contract": "Legal Contract / Agreement",
    "generic_document": "Standard Digital Document",
}


def classify_document(text: str, metadata: Dict[str, Any] = None) -> Tuple[str, str, float, List[str]]:
    """
    Classify the document into a specific category based on text content and metadata.
    Returns: (category_key, category_name, confidence, matched_signals)
    """
    if not text:
        text = ""

    upper_text = text.upper()
    meta_str = " ".join(str(v) for v in (metadata or {}).values()).upper()
    combined = f"{upper_text} {meta_str}"

    scores: Dict[str, Tuple[float, List[str]]] = {}

    def add_score(cat: str, points: float, signal: str):
        if cat not in scores:
            scores[cat] = (0.0, [])
        curr_score, curr_signals = scores[cat]
        scores[cat] = (curr_score + points, curr_signals + [signal])

    # 1. Aadhaar Card
    if "UNIQUE IDENTIFICATION AUTHORITY OF INDIA" in combined or "UIDAI" in combined:
        add_score("aadhaar_card", 40.0, "UIDAI Authority header detected")
    if "GOVERNMENT OF INDIA" in combined and ("AADHAAR" in combined or "ADHAAR" in combined):
        add_score("aadhaar_card", 35.0, "Government of India + Aadhaar keyword")
    if "MERA AADHAAR" in combined or "MY AADHAAR" in combined:
        add_score("aadhaar_card", 30.0, "'Mera Aadhaar' official tagline")
    if re.search(r"\b\d{4}\s+\d{4}\s+\d{4}\b", combined):
        add_score("aadhaar_card", 25.0, "12-digit spaced 4-4-4 number pattern")
    if "VID :" in combined or "ENROLMENT NO" in combined:
        add_score("aadhaar_card", 20.0, "Aadhaar enrolment/VID markers")

    # 2. PAN Card
    if "INCOME TAX DEPARTMENT" in combined or "INCOMETAX" in combined:
        add_score("pan_card", 40.0, "Income Tax Department header")
    if "PERMANENT ACCOUNT NUMBER" in combined or "PAN CARD" in combined:
        add_score("pan_card", 35.0, "Permanent Account Number descriptor")
    if re.search(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", combined):
        add_score("pan_card", 35.0, "Standard 10-character PAN alphanumeric syntax (AAAAA9999A)")
    if "FATHER'S NAME" in combined and "INCOME" in combined:
        add_score("pan_card", 15.0, "Father's name field with income tax context")

    # 3. Driving Licence
    if "DRIVING LICENCE" in combined or "DRIVING LICENSE" in combined:
        add_score("driving_licence", 40.0, "Driving Licence official title")
    if "TRANSPORT DEPARTMENT" in combined or "SARATHI" in combined or "PARIVAHAN" in combined:
        add_score("driving_licence", 30.0, "Transport Department / Sarathi / Parivahan system token")
    if re.search(r"\b(DL|MH|KA|TN|UP|GJ|WB|AP|TS|KL|RJ|MP|HR|PB|BR|JH|OD|CH|JK|UK|GA|AS|TR|ML|MZ|NL|SK|HP|MN|AR|DD|DN|PY|AN|LD|LA)[0-9]{2}\s*[-/ ]?[0-9]{4,11}\b", combined):
        add_score("driving_licence", 35.0, "Indian state code DL registration number syntax")
    if "LMV" in combined or "MCWG" in combined or "HMV" in combined or "TRANS" in combined:
        add_score("driving_licence", 20.0, "Vehicle authorization categories (LMV/MCWG/HMV)")

    # 4. Passport
    if "PASSPORT" in combined and ("REPUBLIC OF INDIA" in combined or "COUNTRY CODE" in combined or "TYPE P" in combined):
        add_score("passport", 45.0, "Passport header & Country Code")
    if re.search(r"P<[A-Z]{3}", combined) or re.search(r"\b[A-Z][0-9]{7}\b", combined):
        add_score("passport", 35.0, "ICAO 9303 Type P Machine Readable Zone or 8-char passport number")
    if "NATIONALITY" in combined and "PLACE OF BIRTH" in combined and "DATE OF EXPIRY" in combined:
        add_score("passport", 25.0, "Standard ICAO identity descriptor fields")

    # 5. Voter ID
    if "ELECTION COMMISSION OF INDIA" in combined or "BHARAT NIRVACHAN AAYOG" in combined:
        add_score("voter_id", 45.0, "Election Commission of India header")
    if "ELECTOR PHOTO IDENTITY CARD" in combined or "VOTER ID" in combined:
        add_score("voter_id", 35.0, "Elector Photo Identity Card title")
    if re.search(r"\b[A-Z]{3}[0-9]{7}\b", combined):
        add_score("voter_id", 30.0, "Standard 10-char EPIC number syntax (AAA9999999)")

    # 6. Bank Statement
    if ("STATEMENT OF ACCOUNT" in combined or "ACCOUNT STATEMENT" in combined or "TRANSACTION DETAILS" in combined):
        add_score("bank_statement", 35.0, "Account Statement title")
    bank_names = ["HDFC BANK", "STATE BANK OF INDIA", "SBI", "ICICI BANK", "AXIS BANK", "KOTAK", "CITIBANK", "CHASE", "BANK OF AMERICA", "WELLS FARGO", "PUNJAB NATIONAL BANK", "CANARA BANK", "UNION BANK", "BARCLAYS"]
    for b in bank_names:
        if b in combined:
            add_score("bank_statement", 20.0, f"Recognized financial institution: {b}")
            break
    if ("OPENING BALANCE" in combined or "CLOSING BALANCE" in combined) and ("WITHDRAWAL" in combined or "DEPOSIT" in combined or "DEBIT" in combined or "CREDIT" in combined):
        add_score("bank_statement", 35.0, "Financial ledger balance & credit/debit structure")
    if "ACCOUNT NUMBER" in combined or "A/C NO" in combined or "IFSC" in combined or "IBAN" in combined:
        add_score("bank_statement", 20.0, "Account numbering & routing identifiers (IFSC/IBAN)")

    # 7. Salary Slip / Payslip
    if "PAYSLIP" in combined or "SALARY SLIP" in combined or "PAY SLIP" in combined:
        add_score("salary_slip", 40.0, "Payslip / Salary Slip header")
    if "EARNINGS" in combined and "DEDUCTIONS" in combined:
        add_score("salary_slip", 35.0, "Earnings and Deductions dual-column structure")
    if ("BASIC" in combined or "BASIC SALARY" in combined) and ("HRA" in combined or "ALLOWANCE" in combined):
        add_score("salary_slip", 25.0, "Salary components: Basic & HRA")
    if "NET PAY" in combined or "NET SALARY" in combined or "TAKE HOME" in combined or "GROSS EARNINGS" in combined:
        add_score("salary_slip", 25.0, "Net pay & gross earnings identifiers")

    # 8. Marks Card / Academic Transcript
    if "STATEMENT OF MARKS" in combined or "MARKS CARD" in combined or "GRADE SHEET" in combined or "ACADEMIC TRANSCRIPT" in combined:
        add_score("marks_card", 40.0, "Marks Card / Academic Transcript title")
    if ("MAX MARKS" in combined or "MAXIMUM MARKS" in combined) and ("MARKS OBTAINED" in combined or "OBTAINED MARKS" in combined or "CREDITS" in combined):
        add_score("marks_card", 35.0, "Subject marks scoring metrics (Max vs Obtained)")
    if "SEMESTER" in combined or "SGPA" in combined or "CGPA" in combined or "PERCENTAGE" in combined:
        add_score("marks_card", 25.0, "Academic grading parameters (CGPA/SGPA/Semester)")

    # 9. Educational Certificate / Degree
    if ("DEGREE" in combined or "DIPLOMA" in combined or "CERTIFICATE OF" in combined) and ("CONFERRED UPON" in combined or "HAS BEEN ADMITTED TO" in combined or "THIS IS TO CERTIFY THAT" in combined):
        add_score("educational_certificate", 40.0, "Degree conferral declaration text")
    if "UNIVERSITY" in combined or "INSTITUTE OF TECHNOLOGY" in combined or "COLLEGE" in combined:
        add_score("educational_certificate", 15.0, "Higher education institutional entity")
    if "VICE CHANCELLOR" in combined or "REGISTRAR" in combined or "DEAN" in combined:
        add_score("educational_certificate", 20.0, "Academic executive signatories (Vice Chancellor/Registrar)")

    # 10. Medical Certificate
    if "MEDICAL CERTIFICATE" in combined or "FITNESS CERTIFICATE" in combined or "DOCTOR'S PRESCRIPTION" in combined:
        add_score("medical_certificate", 45.0, "Medical / Fitness certificate title")
    if "M.B.B.S" in combined or "M.D." in combined or "REG. NO." in combined or "CLINIC" in combined or "HOSPITAL" in combined:
        add_score("medical_certificate", 25.0, "Medical practitioner credentials & clinic markers")
    if "DIAGNOSIS" in combined or "PATIENT NAME" in combined or "REST FOR" in combined or "MEDICALLY FIT" in combined:
        add_score("medical_certificate", 20.0, "Clinical examination findings & fit declaration")

    # 11. Income Certificate
    if "INCOME CERTIFICATE" in combined or "CERTIFICATE OF INCOME" in combined:
        add_score("income_certificate", 45.0, "Income Certificate header")
    if "TAHSILDAR" in combined or "REVENUE DEPARTMENT" in combined or "TALUK" in combined or "DISTRICT MAGISTRATE" in combined:
        add_score("income_certificate", 30.0, "State Revenue Department / Tahsildar authority")
    if "ANNUAL INCOME" in combined or "FAMILY INCOME" in combined or "RUPEES" in combined:
        add_score("income_certificate", 20.0, "Annual income declaration figures")

    # 12. Commercial Invoice
    if "INVOICE" in combined or "TAX INVOICE" in combined or "BILL TO" in combined:
        add_score("invoice", 30.0, "Tax Invoice declaration")
    if "GSTIN" in combined or "SUBTOTAL" in combined or "TOTAL AMOUNT" in combined or "ITEM DESCRIPTION" in combined:
        add_score("invoice", 25.0, "Commercial billing table parameters (GSTIN/Subtotal)")

    # 13. Legal Contract / Agreement
    if "AGREEMENT" in combined or "CONTRACT" in combined or "MEMORANDUM OF UNDERSTANDING" in combined:
        add_score("legal_contract", 30.0, "Contractual agreement title")
    if "PARTY OF THE FIRST PART" in combined or "WHEREAS" in combined or "IN WITNESS WHEREOF" in combined:
        add_score("legal_contract", 35.0, "Legal contractual preamble clauses")

    if not scores:
        return "generic_document", DOCUMENT_CATEGORIES["generic_document"], 0.60, ["Standard layout analysis"]

    best_cat, (best_score, best_signals) = max(scores.items(), key=lambda item: item[1][0])

    if best_score < 25.0:
        return "generic_document", DOCUMENT_CATEGORIES["generic_document"], 0.65, ["Insufficient category markers; processed as generic document"]

    confidence = min(0.98, round(0.50 + (best_score / 150.0), 2))
    return best_cat, DOCUMENT_CATEGORIES.get(best_cat, "Generic Document"), confidence, best_signals
