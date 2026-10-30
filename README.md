# BEYONDPROOF

### The Universal Digital Trust & Forensic Verification Platform

**Tagline:** Beyond Trust. Beyond Doubt.

**Team:** BBC — Built Beyond Code

---

## Overview

BEYONDPROOF is a unified AI-powered digital trust platform that investigates the authenticity and integrity of digital information. It combines seven forensic analysis engines into one investigation workspace, performing reference-free analysis on uploaded digital content.

The system supports:
- Identity documents
- Certificates & PDF documents
- Images (AFTERIMAGE forensics)
- Videos & audio recordings
- Digital evidence & provenance tracking

### Key Principles
- **Evidence first** — every finding points to a measurable signal
- **Reference-free** — works without an original document
- **Honest uncertainty** — never claims 100% accuracy
- **Explainable results** — every verdict has supporting evidence

---

## Seven Core Engines

| # | Engine | Purpose |
|---|--------|---------|
| 1 | **Identity Guardian** | Identity document verification, OCR, face detection |
| 2 | **Document Verifier** | PDF forensic analysis, font/layout/metadata inspection |
| 3 | **Media Truth (AFTERIMAGE)** | Image ELA, video frame analysis, audio spectrogram |
| 4 | **Source Tracker** | SHA-256 fingerprinting, provenance, file comparison |
| 5 | **Trust Graph** | Evidence relationship visualization (NetworkX + React Flow) |
| 6 | **AI Risk Analyzer** | Weighted multi-engine risk scoring |
| 7 | **Verification Hub** | Central dashboard for all verification activities |

---

## Technology Stack

### Frontend
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Recharts (data visualization)
- React Flow (Trust Graph)
- Lucide React (icons)

### Backend
- Python FastAPI
- SQLAlchemy 2.0 (async)
- SQLite (dev) / PostgreSQL (prod)
- Pydantic v2

### AI/ML & Forensics
- OpenCV (image/video analysis)
- PyMuPDF (PDF parsing)
- Tesseract OCR
- Pillow + NumPy (ELA, pixel analysis)
- imagehash (perceptual hashing)
- piexif (EXIF metadata)
- Librosa (audio analysis)
- NetworkX (graph analysis)
- ReportLab (PDF reports)

### Security
- JWT authentication
- Argon2id password hashing
- Role-based access control
- File validation (MIME, extension, size)
- Audit logging

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Tesseract OCR (`choco install tesseract` on Windows or `brew install tesseract` on macOS)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd BEYONDPROOF
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env (copy from template)
copy .env.example .env  # Windows
# cp .env.example .env  # macOS/Linux

# Start the backend server
python main.py
```

The API will be available at `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local (copy from template)
copy .env.example .env.local  # Windows
# cp .env.example .env.local  # macOS/Linux

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`

---

## Project Structure

```
BEYONDPROOF/
├── backend/
│   ├── main.py                      # FastAPI entry point
│   ├── config.py                    # Environment configuration
│   ├── requirements.txt             # Python dependencies
│   ├── .env.example                 # Environment template
│   ├── auth/                        # Authentication system
│   │   ├── router.py                # Auth API endpoints
│   │   ├── service.py               # JWT + Argon2 auth logic
│   │   ├── dependencies.py          # Auth middleware
│   │   └── schemas.py               # Pydantic auth models
│   ├── database/
│   │   ├── connection.py            # SQLAlchemy async engine
│   │   └── models.py                # All ORM models (11 tables)
│   ├── files/
│   │   ├── router.py                # File upload endpoints
│   │   ├── service.py               # Upload processing
│   │   └── utils.py                 # SHA-256, MIME validation
│   ├── engines/
│   │   ├── document/                # Engine 2: Document Verifier
│   │   ├── media/                   # Engine 3: AFTERIMAGE
│   │   │   ├── image_service.py     # ELA, metadata, noise analysis
│   │   │   ├── video_service.py     # Frame extraction, temporal analysis
│   │   │   └── audio_service.py     # Spectrogram, frequency analysis
│   │   ├── identity/                # Engine 1: Identity Guardian
│   │   ├── source/                  # Engine 4: Source Tracker
│   │   ├── trust_graph/             # Engine 5: Trust Graph
│   │   └── risk/                    # Engine 6: AI Risk Analyzer
│   ├── verification/
│   │   ├── router.py                # Verification endpoints
│   │   ├── service.py               # Engine orchestrator
│   │   └── report_generator.py      # PDF report builder
│   ├── admin/                       # Admin dashboard API
│   ├── websocket/                   # Real-time progress updates
│   └── tests/                       # Pytest test suite
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Landing page
│   │   │   ├── (auth)/              # Login, Register
│   │   │   └── (dashboard)/         # All dashboard pages
│   │   ├── components/
│   │   │   ├── ui/                  # Reusable UI components
│   │   │   ├── layout/              # Sidebar, Dashboard layout
│   │   │   ├── dashboard/           # StatCard, RiskGauge
│   │   │   ├── engines/             # FindingsList, EngineStatusBadge
│   │   │   ├── graph/               # TrustGraphView
│   │   │   └── report/              # VerificationTimeline
│   │   └── lib/
│   │       ├── api.ts               # API client
│   │       ├── auth.tsx             # Auth context
│   │       ├── types.ts             # TypeScript interfaces
│   │       └── utils.ts             # Helpers
│   └── package.json
└── README.md
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, receive JWT |
| GET | `/api/auth/me` | Get current user profile |

### File Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/files/upload` | Upload file for analysis |
| GET | `/api/files/{id}` | Get file details |
| GET | `/api/files/` | List user's files |
| DELETE | `/api/files/{id}` | Delete file |

### Verification
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/verification/create` | Start verification |
| GET | `/api/verification/{id}` | Get full results |
| GET | `/api/verification/history` | List past verifications |
| GET | `/api/verification/{id}/report` | Download PDF report |

### Engine APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/document/analyze` | Document forensic analysis |
| POST | `/api/media/image/analyze` | AFTERIMAGE image analysis |
| POST | `/api/media/video/analyze` | Video analysis |
| POST | `/api/media/audio/analyze` | Audio analysis |
| POST | `/api/identity/analyze` | Identity document analysis |
| POST | `/api/source/fingerprint` | Register file fingerprint |
| POST | `/api/source/compare` | Compare two files |
| GET | `/api/graph/{id}` | Get Trust Graph |
| GET | `/api/risk/{id}/assessment` | Get risk assessment |

### WebSocket
| Endpoint | Description |
|----------|-------------|
| `ws://localhost:8000/ws/verification/{id}` | Real-time analysis progress |

---

## Demo Scenarios

### Demo 1: Document Verification
Upload a certificate PDF → extracts text, analyzes fonts/layout, checks metadata, identifies QR codes, generates forensic report.

### Demo 2: Image Forensics (AFTERIMAGE)
Upload an image → runs ELA analysis, extracts EXIF metadata, generates heatmap, computes perceptual hashes, detects copy-move.

### Demo 3: File Integrity
Upload two versions of a file → compares SHA-256 hashes, shows differences, registers fingerprints in registry.

### Demo 4: Trust Graph
View the relationship network connecting uploaded files, verification events, fingerprints, and findings.

### Demo 5: Full Report
Download a professional PDF report with all findings, risk score, evidence, limitations, and recommended actions.

---

## Risk Classification

| Category | Score Range | Description |
|----------|-----------|-------------|
| **LOW RISK** | 0–30 | No significant suspicious indicators |
| **SUSPICIOUS** | 31–60 | One or more suspicious indicators |
| **HIGH RISK** | 61–100 | Strong evidence of manipulation |
| **UNVERIFIED** | — | Insufficient evidence to assess |

---

## Limitations & Disclaimers

- ELA and compression artifacts are investigative aids, not proof of tampering
- Missing metadata is not proof of manipulation
- A SHA-256 hash proves file equality, not original authorship
- AI model confidence ≠ probability of forgery
- Face similarity is not identity verification
- The system does not claim government-grade identity verification

---

## License

Built for hackathon demonstration purposes.

**BEYONDPROOF — BEYOND TRUST. BEYOND DOUBT.**

**Team BBC — Built Beyond Code**
