# BEYONDPROOF

### The Universal Digital Trust & Forensic Verification Platform

**Tagline:** Beyond Trust. Beyond Doubt.  
**Team:** BBC — Built Beyond Code  

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016%20(Turbopack)-black.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![Three.js](https://img.shields.io/badge/3D-Three.js%20WebGL-049EF4.svg?logo=three.js&logoColor=white)](https://threejs.org)
[![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.14-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tests](https://img.shields.io/badge/Tests-25%2F25%20Passing-brightgreen.svg)]()

---

## Overview

**BEYONDPROOF** is an evidence-first, reference-free digital trust platform that investigates the authenticity and integrity of digital information. It unites seven forensic microservices and two specialized breakthrough engines into a unified cyberdeck investigation suite:

1. **Universal AI-Powered Document Forensics**: Full-spectrum tampering analysis that automatically classifies any document type, evaluates domain-specific rules (Verhoeff checksums, CBDT codes, arithmetic ledger continuity), localizes edits with bounding boxes, and reconstructs chronological modification timelines.
2. **Hackathon Hurdle Resolution (Laundered Fakes & Lying Metadata Shield)**: Breakthrough physics and 2D FFT spectral analysis that halts screen re-photography, screenshot laundering, and synthetic AI images injected with forged DSLR EXIF metadata.
3. **Cyber Holodeck 3D Design System**: Bespoke, immersive WebGL interface with interactive 3D visualizations for each forensic domain, HUD telemetry wings, Orbitron typography, and real-time synthesized audio feedback.

---

## Core Pillars & Principles

- **Evidence First**: Every flag is backed by measurable mathematical or optical signals—no black-box guesswork.
- **Reference-Free Forensics**: Verifies integrity without requiring access to an original master file.
- **Explainability Quintet**: Explains **WHAT** was edited, **WHERE** it was changed, **HOW** it was manipulated, **WHEN** it was modified, and **WHY** it is suspicious.
- **Honest Uncertainty & True Verdict Taxonomy**: Avoids dangerous binary classification; separates genuine cryptographic origins from unverified files and malicious laundering.

---

## Breakthrough Capabilities

### 1. Universal Document Forensics & Tampering Localization
- **Automatic Multi-Category Classifier**: Intelligently identifies document types including **Aadhaar Cards, PAN Cards, Passports, Driving Licences, Voter IDs, Educational Certificates, Marks Cards, Bank Statements, Salary Slips, Medical Certificates, and Income Certificates** across PDF, JPG, JPEG, and PNG formats.
- **Domain-Specific Validation Rules**:
  - **Aadhaar**: Verhoeff modulo-10 algorithmic checksum validation to catch altered identification digits.
  - **PAN**: Central Board of Direct Taxes (CBDT) 4th-character entity category code validation and alphanumeric formatting.
  - **Bank Statements**: Mathematical line-item continuity (Opening Balance + Credits − Debits = Closing Balance).
  - **Salary Slips**: Legal accounting formula consistency (Gross Pay − Deductions = Net Pay).
  - **Passports**: ICAO 9303 Doc 9303 Machine Readable Zone (MRZ) format and composite check-digit checks.
- **Visual Tampering Localization**: Pinpoints edited areas with normalized percentage bounding boxes (`[x, y, w, h]%`) displayed on an interactive document viewer with reticles, severity badges, and field-level modification deltas.
- **Chronological Revision Pass Timeline**:
  - Reconstructs document history by parsing PDF incremental update trailers (`%%EOF` passes).
  - Detects XMP metadata versus trailer `Info` dictionary timestamp desynchronization.
  - Scores **Timestamp Reliability** (**HIGH**, **MODERATE**, **UNRELIABLE / TAMPERED**, or **UNKNOWN**).

---

### 2. Hackathon Hurdle: Laundered Fakes & Lying Metadata Shield
Attackers evade traditional forensics by screenshotting or photographing synthetic media on a monitor, or by injecting genuine DSLR camera EXIF headers into generated images. BEYONDPROOF neutralizes this hurdle via:

1. **2D FFT Spectral Moire Lattice Detection**: Identifies screen re-photography by analyzing 2D Fast Fourier Transform high-frequency harmonic energy peaks and spectral entropy caused by physical monitor subpixel grids.
2. **Device Hardware Profile Matching**: Detects screenshot laundering by matching exact resolutions and aspect ratios against known smartphone, tablet, and desktop display profiles.
3. **Cross-Modal Optical Physics Validation**:
   - **Sensor Resolution vs. Aspect Ratio**: Flags when EXIF claims a 3:2 DSLR sensor (e.g. Canon EOS 5D) but the image is a 1:1 square diffusion render or mobile screenshot ratio.
   - **Quantization Tables (DQT) vs. Camera ISP**: Identifies images claiming hardware camera origins whose JPEG Discrete Cosine Transform quantization tables match standard software compressors (IJG/PIL).
   - **Aperture vs. Depth of Field (DoF)**: Detects optical impossibilities, such as EXIF claiming a wide-aperture $f/1.4$ lens while both foreground and background exhibit infinite focal sharpness.
   - **Claimed ISO vs. Sensor Shot Noise**: Flags claimed high ISO values (e.g., ISO 6400) that exhibit zero photon noise variance due to synthetic smoothing.
4. **5-Tier True Verdict Taxonomy**:
   - `VERIFIED_GENUINE`: Verified cryptographic signature / C2PA origin.
   - `NO_TAMPERING_DETECTED`: No forensic anomalies found (Unverified origin).
   - `LAUNDERED_SUSPECT`: Screen re-photography or screenshot laundering detected.
   - `METADATA_FORGERY_DETECTED`: Cross-modal optical physics contradict EXIF claims.
   - `ALTERED_COMPOSITE`: High-confidence splice, copy-move, or local manipulation.

---

### 3. Cyber Holodeck 3D Experience
- **Interactive Three.js Visualizers**:
  - `ThreeDFaceMesh`: 68-point biometric facial topography wireframe for Identity Guardian.
  - `ThreeDDocumentStack`: Multi-layer PDF stream and xref revision visualizer.
  - `ThreeDMediaTerrain`: 3D Error Level Analysis (ELA) elevation map visualizing compression discrepancy peaks.
  - `ThreeDProvenanceChain`: Cryptographic SHA-256 block-graph provenance chain.
  - `ThreeDRiskPolyhedron`: Bayesian risk polyhedron reacting to threat vector distributions.
- **Cyberdeck Maximize Mode**: Expand any 3D viewport into an edge-to-edge inspection workstation.
- **Bespoke HUD & Audio Synthesis**: Monospaced Orbitron indicators, glowing reticle borders, and Web Audio API synthesized sonic feedback (`soundManager`).

---

## Seven Core Microservices

| # | Engine | Core Focus | Key Algorithms & Outputs |
|---|--------|------------|--------------------------|
| 1 | **Identity Guardian** | Identity Documents & Biometrics | Verhoeff check, CBDT entity check, MRZ parser, 68-point facial mesh |
| 2 | **Document Verifier** | Universal Document Forensics | PDF xref streams, trailer passes, font catalog, layout consistency |
| 3 | **Media Truth (AFTERIMAGE)** | Spectral & Optical Forensics | 2D FFT Moire, cross-modal physics, ELA, copy-move, noise variance |
| 4 | **Source Tracker** | Provenance & Fingerprinting | Perceptual hashes (pHash/dHash/aHash), SHA-256 integrity, ledger |
| 5 | **Trust Graph** | Evidence Correlation Network | NetworkX + React Flow directed bipartite investigation graph |
| 6 | **AI Risk Analyzer** | Multi-Engine Bayesian Risk Engine | Multi-vector weighted anomaly aggregation, verdict categorization |
| 7 | **Verification Hub** | Investigation Orchestration | Asynchronous job queues, real-time WebSocket progress, PDF exports |

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16.4+ (Turbopack, App Router)
- **UI & 3D**: React 18, Three.js, @types/three, Framer Motion, Lucide React
- **Graphing & Flow**: @xyflow/react (React Flow), Recharts
- **Typography & Styling**: Tailwind CSS, Orbitron, Space Grotesk, JetBrains Mono
- **Audio**: Web Audio API Sound FX Synthesizer

### Backend
- **Framework**: Python FastAPI (Async architecture)
- **Database & ORM**: SQLAlchemy 2.0 (asyncio), SQLite (dev) / PostgreSQL (prod)
- **Data Validation**: Pydantic v2
- **Authentication**: JWT Bearer tokens, Argon2id password hashing, Judge Quick-Pass

### Forensics & Computer Vision
- **Computer Vision**: OpenCV (cv2), Pillow (PIL), NumPy
- **PDF Forensics**: PyMuPDF (`fitz`), ReportLab
- **Optical & Spectral**: 2D Fast Fourier Transform (`np.fft.fft2`), ELA residual analysis
- **Metadata Forensics**: `piexif`, ExifTool-compliant binary parsers
- **Graph Mathematics**: NetworkX bipartite entity-evidence mapping

---

## Quick Start Guide

### Prerequisites
- Python 3.10+ (Tested through Python 3.14)
- Node.js 18+ (Node.js 20+ recommended)
- Tesseract OCR (Optional for scanned image OCR)

### 1. Clone & Setup
```bash
git clone https://github.com/vaibhavrvalakunde2006-gif/BEYONDPROOF.git
cd BEYONDPROOF
```

### 2. Backend Installation & Startup
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

### 3. Frontend Installation & Startup
```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
- Web Application: `http://localhost:3000`

---

## Verification & Testing Suite

Execute the automated test suites to verify backend engines and frontend builds:

```bash
# 1. Run full backend pytest suite (25/25 tests)
python -m pytest backend/tests

# 2. Run universal document forensics pipeline test
python backend/test_universal_pipeline.py

# 3. Typecheck frontend
cd frontend
npx tsc --noEmit

# 4. Build frontend production bundle
npm run build
```

---

## Judge Demonstration & Quick Pass

For hackathon evaluators and demo sessions:
1. **Instant Demo Access**: Click **"Judge Quick Pass"** on the login page or call `POST /api/auth/judge-pass` to receive an instant evaluator JWT without registration.
2. **Specimen Demos**:
   - **Document Specimen**: Upload any tampered Bank Statement or Aadhaar specimen to see the interactive bounding box localizer, rule validation, and revision pass timeline.
   - **Hurdle Specimen**: Navigate to the homepage or **Media Truth Engine** to run the live **Laundered Fakes Shield** benchmark against simulated 2D FFT Moire screen photographs and DSLR EXIF injection attacks.
3. **Downloadable Forensic Report**: Download the comprehensive forensic PDF audit dossier with full cryptographic hashes, evidence breakdown, and recommendations.

---

## License

Built for hackathon demonstration purposes.

**BEYONDPROOF — BEYOND TRUST. BEYOND DOUBT.**  
**Team BBC — Built Beyond Code**
