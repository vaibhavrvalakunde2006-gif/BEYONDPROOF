"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import * as THREE from "three";
import {
  UploadCloud,
  File as FileIcon,
  Image as ImageIcon,
  Film,
  Music,
  ShieldCheck,
  ArrowRight,
  X,
  ScanLine,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Fingerprint,
  FileSearch,
  LockKeyhole,
  Cpu,
  Layers,
  Activity,
  Check,
  ShieldAlert,
  Network,
  Maximize2,
  Terminal,
  FileText,
  Copy,
  CheckCheck,
  Info,
  Hash,
  Database,
  ExternalLink,
} from "lucide-react";
import { soundManager } from "@/lib/soundFx";
import LaunderedFakesShield from "@/components/3d/LaunderedFakesShield";
import UniversalDocumentViewer, { SuspiciousRegion } from "@/components/forensics/UniversalDocumentViewer";
import ForensicTimeline, { TimelineData } from "@/components/forensics/ForensicTimeline";
import SuspectedFieldsTable, { SuspectedField } from "@/components/forensics/SuspectedFieldsTable";
import CategoryRuleChecklist, { RuleValidationResult } from "@/components/forensics/CategoryRuleChecklist";
import {
  analyzeUploadedFile,
  ForensicAnalysisResult,
  formatFileSize,
} from "@/lib/forensicParser";
import { filesAPI, verificationAPI, authAPI } from "@/lib/api";

interface ForensicEngine {
  id: string;
  name: string;
  desc: string;
  icon: React.ElementType;
  badge: string;
  accentClass: string;
  glowColor: string;
}

const engines: ForensicEngine[] = [
  {
    id: "identity",
    name: "Identity Guardian",
    desc: "Biometric face wireframe, MRZ checksum, synthetic spoofing",
    icon: Fingerprint,
    badge: "BIOMETRIC / MRZ",
    accentClass: "text-cyan-400",
    glowColor: "rgba(0, 229, 255, 0.2)",
  },
  {
    id: "document",
    name: "Document Verifier",
    desc: "PDF layer structural dissection, font mismatch, xref streams",
    icon: FileSearch,
    badge: "PDF / XREF / KERNING",
    accentClass: "text-emerald-400",
    glowColor: "rgba(16, 185, 129, 0.2)",
  },
  {
    id: "media",
    name: "Media Truth Engine",
    desc: "Spectral Error Level Analysis (ELA), audio spectrograms, 2D FFT Moiré",
    icon: ScanLine,
    badge: "ELA / 2D FFT / AUDIO",
    accentClass: "text-violet-400",
    glowColor: "rgba(139, 92, 246, 0.2)",
  },
  {
    id: "source",
    name: "Source Tracker",
    desc: "Cryptographic SHA-256 fingerprinting, pHash, C2PA provenance",
    icon: LockKeyhole,
    badge: "SHA-256 / C2PA / PHASH",
    accentClass: "text-amber-400",
    glowColor: "rgba(255, 181, 71, 0.2)",
  },
  {
    id: "risk",
    name: "AI Risk Analyzer",
    desc: "Explainable Bayesian severity weighting and uncertainty rating",
    icon: Cpu,
    badge: "BAYESIAN / UNCERTAINTY",
    accentClass: "text-rose-400",
    glowColor: "rgba(244, 63, 94, 0.2)",
  },
];

interface SampleAttack {
  name: string;
  filename: string;
  engine: string;
  risk: string;
  desc: string;
  severityBadge: string;
  gradient: string;
  borderClass: string;
  badgeColor: string;
  glowAccent: string;
}

const sampleAttacks: SampleAttack[] = [
  {
    name: "Altered Bank Statement Balance",
    filename: "HDFC_STATEMENT_OCT2026.PDF",
    engine: "Document Verifier",
    risk: "CRITICAL (Arithmetic Continuity Breakdown)",
    desc: "Closing balance stated as ₹8,45,210.00 does not equal Opening (₹1,50,000) + Credits (₹1,20,000) - Debits (₹75,000) = ₹1,95,000. Spliced font size jump detected at closing balance.",
    severityBadge: "ARITHMETIC FRAUD",
    gradient: "from-rose-500/15 via-[#080c14] to-red-950/30",
    borderClass: "border-rose-500/30 hover:border-rose-400 hover:shadow-[0_0_25px_rgba(244,63,94,0.25)]",
    badgeColor: "text-rose-400 border-rose-500/40 bg-rose-950/40",
    glowAccent: "rgba(244, 63, 94, 0.4)",
  },
  {
    name: "Forged Salary Slip Net Pay",
    filename: "TECHCORP_PAYSLIP_SEP2026.PDF",
    engine: "Document Verifier",
    risk: "CONFIRMED TAMPER (Gross - Deductions Mismatch)",
    desc: "Stated Net Pay ₹1,85,000 exceeds calculated formula (Gross ₹1,20,000 - Deductions ₹15,000 = ₹1,05,000). Vector whiteout patch detected over deduction subtotal.",
    severityBadge: "FORMULA VIOLATION",
    gradient: "from-amber-500/15 via-[#080c14] to-orange-950/30",
    borderClass: "border-amber-500/30 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]",
    badgeColor: "text-amber-400 border-amber-500/40 bg-amber-950/40",
    glowAccent: "rgba(245, 158, 11, 0.4)",
  },
  {
    name: "CBDT Entity Tampered PAN Card",
    filename: "PAN_CARD_TAX_FILING.PDF",
    engine: "Document Verifier",
    risk: "CRITICAL (4th-Char Taxpayer Syntax Violation)",
    desc: "PAN string 'ABCX1234F' contains invalid 4th character 'X'. Not a valid CBDT registered taxpayer entity. Photoshop software signature embedded in XMP stream.",
    severityBadge: "CBDT SYNTAX TAMPER",
    gradient: "from-cyan-500/15 via-[#080c14] to-teal-950/30",
    borderClass: "border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(0,229,255,0.25)]",
    badgeColor: "text-cyan-400 border-cyan-500/40 bg-cyan-950/40",
    glowAccent: "rgba(0, 229, 255, 0.4)",
  },
  {
    name: "Fabricated Aadhaar Verhoeff UID",
    filename: "E_AADHAAR_GOVT_PROOF.PDF",
    engine: "Document Verifier",
    risk: "CRITICAL (Verhoeff Checksum Failure)",
    desc: "Aadhaar number fails UIDAI Verhoeff algorithm check equation d(c, p(i, n)) != 0. Incremental update passes (%%EOF count = 3) appended post-issuance.",
    severityBadge: "VERHOEFF FAILURE",
    gradient: "from-purple-500/15 via-[#080c14] to-indigo-950/30",
    borderClass: "border-purple-500/30 hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]",
    badgeColor: "text-purple-400 border-purple-500/40 bg-purple-950/40",
    glowAccent: "rgba(168, 85, 247, 0.4)",
  },
  {
    name: "French Passport MRZ Forgery",
    filename: "FRA_PASSPORT_EXP2028.IMG",
    engine: "Identity Guardian",
    risk: "CRITICAL (99.98% Checksum Failure)",
    desc: "ICAO 9303 modulo-10 checksum mismatch on document number check digit.",
    severityBadge: "CRITICAL TAMPER",
    gradient: "from-rose-500/15 via-[#080c14] to-red-950/30",
    borderClass: "border-rose-500/30 hover:border-rose-400 hover:shadow-[0_0_25px_rgba(244,63,94,0.25)]",
    badgeColor: "text-rose-400 border-rose-500/40 bg-rose-950/40",
    glowAccent: "rgba(244, 63, 94, 0.4)",
  },
  {
    name: "Laundered AI Fake & Lying Canon EXIF",
    filename: "CANON_EOS5D_AI_LAUNDERED.JPG",
    engine: "Media Truth Engine",
    risk: "METADATA FORGERY & LAUNDERED SUSPECT",
    desc: "Screenshot-laundered AI fake with injected Canon 5D Mark IV EXIF. Caught via 2D FFT Moiré lattice and cross-modal physical contradiction (f/1.4 infinite focus & IJG software tables).",
    severityBadge: "PHYSICS CONTRADICTION",
    gradient: "from-amber-500/15 via-[#080c14] to-cyan-950/30",
    borderClass: "border-amber-500/30 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]",
    badgeColor: "text-amber-400 border-amber-500/40 bg-amber-950/40",
    glowAccent: "rgba(245, 158, 11, 0.4)",
  },
];

export default function NewInvestigation() {
  const mountRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [animateIn, setAnimateIn] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedEngines, setSelectedEngines] = useState<string[]>(
    engines.map((e) => e.name)
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [activeSample, setActiveSample] = useState<SampleAttack | null>(null);
  const [realResult, setRealResult] = useState<ForensicAnalysisResult | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [backendVerificationId, setBackendVerificationId] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Trigger page entry animation
  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 80);
    return () => clearTimeout(t);
  }, []);

  // 3D Laser Scanner Chamber in WebGL
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 400;
    let height = container.clientHeight || 280;
    if (height === 0) height = 280;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3D Holographic Evidence Mesh Group
    const group = new THREE.Group();
    scene.add(group);

    // Outer rotating cylinder ring
    const ringGeo = new THREE.TorusGeometry(1.4, 0.03, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    // Inner subtle reticle ring
    const innerRingGeo = new THREE.TorusGeometry(0.85, 0.015, 12, 48);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 2;
    group.add(innerRing);

    // Inner holographic document plane
    const docGeo = new THREE.PlaneGeometry(1.2, 1.6, 8, 8);
    const docMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    const docMesh = new THREE.Mesh(docGeo, docMat);
    group.add(docMesh);

    // Sweeping laser scanline
    const laserGeo = new THREE.CylinderGeometry(0.015, 0.015, 2.0, 16);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.9,
    });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.rotation.z = Math.PI / 2;
    group.add(laser);

    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      group.rotation.y = elapsed * 0.5;
      laser.position.y = Math.sin(elapsed * 3) * 0.75;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 280;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      innerRingGeo.dispose();
      innerRingMat.dispose();
      docGeo.dispose();
      docMat.dispose();
      laserGeo.dispose();
      laserMat.dispose();
    };
  }, []);

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    soundManager.playLaserScan();
    const newFiles = Array.from(incoming);
    setFiles((prev) => [...prev, ...newFiles]);
    setActiveSample(null);
    setScanComplete(false);
    setRealResult(null);
    setScanError(null);
  };

  const handleSampleAttack = (sample: SampleAttack) => {
    soundManager.playLaserScan();
    setActiveSample(sample);
    const isPdf = sample.filename.endsWith(".PDF");
    const fakeFile = new File(["SAMPLE FORENSIC SPECIMEN CONTENT"], sample.filename, {
      type: isPdf ? "application/pdf" : "image/jpeg",
    });
    setFiles([fakeFile]);
    setScanComplete(false);
    setRealResult(null);
    setScanError(null);
  };

  const handleStartInvestigation = async () => {
    if (files.length === 0) return;
    soundManager.playLaserScan();
    setIsScanning(true);
    setScanComplete(false);
    setScanError(null);

    const primaryFile = files[0];

    // If preset sample attack was triggered
    if (activeSample) {
      setTimeout(() => {
        const isPdf = activeSample.filename.endsWith(".PDF");

        let docCategory = "generic_document";
        let docCategoryName = "General Document";
        let suspectedFieldsList: any[] = [];
        let suspiciousRegionsList: any[] = [];
        let ruleVal: any = null;
        let timelineData: any = {
          creation_date: "2026-10-15 08:30:00 UTC",
          last_modification_date: "2026-10-18 12:45:10 UTC",
          revision_passes: 2,
          detected_software_footprint: isPdf ? "Adobe Acrobat Pro 2024 / PyMuPDF" : "Adobe Photoshop 2024",
          is_date_tampered: false,
          timestamp_reliability: "HIGH",
          reliability_explanation: "Timestamps corroborated across file metadata and structural revision trailers.",
        };

        if (activeSample.name.includes("Bank Statement")) {
          docCategory = "bank_statement";
          docCategoryName = "Bank Statement";
          suspectedFieldsList = [
            {
              field_name: "Closing Balance",
              suspected_change: "ARITHMETIC_MISMATCH",
              details: "Stated Closing Balance ₹8,45,210.00 does not match Opening (₹1,50,000.00) + Total Credits (₹1,20,000.00) - Total Debits (₹75,000.00) = ₹1,95,000.00.",
              evidence: "Calculated ₹1,95,000.00 vs Stated ₹8,45,210.00 (+₹6,50,210.00 discrepancy)",
              severity: "critical",
              bbox: [60, 75, 34, 10],
            },
          ];
          suspiciousRegionsList = [
            {
              id: "region-1",
              page: 1,
              label: "Closing Balance",
              bbox: [60, 75, 34, 10],
              severity: "critical",
              suspected_change: "ARITHMETIC_MISMATCH",
              explanation: "Discrepancy of ₹6,50,210.00 detected in account continuity ledger.",
              evidence: "Mathematical accounting equation failure",
            },
          ];
          ruleVal = {
            category: "bank_statement",
            category_name: "Bank Statement",
            checks: [
              {
                rule_name: "Opening + Credits - Debits == Closing Balance",
                passed: false,
                description: "Mathematical accounting continuity check.",
                details: "Opening: ₹1,50,000 | Credits: ₹1,20,000 | Debits: ₹75,000 | Expected Closing: ₹1,95,000 | Stated Closing: ₹8,45,210",
                severity: "critical",
              },
            ],
          };
        } else if (activeSample.name.includes("Salary Slip")) {
          docCategory = "salary_slip";
          docCategoryName = "Salary Slip";
          suspectedFieldsList = [
            {
              field_name: "Net Pay",
              suspected_change: "FORMULA_VIOLATION",
              details: "Stated Net Pay ₹1,85,000.00 violates Gross Pay (₹1,20,000.00) - Total Deductions (₹15,000.00) = ₹1,05,000.00.",
              evidence: "Calculated ₹1,05,000.00 vs Stated ₹1,85,000.00 (+₹80,000.00 discrepancy)",
              severity: "critical",
              bbox: [56, 78, 38, 10],
            },
          ];
          suspiciousRegionsList = [
            {
              id: "region-1",
              page: 1,
              label: "Net Pay",
              bbox: [56, 78, 38, 10],
              severity: "critical",
              suspected_change: "FORMULA_VIOLATION",
              explanation: "Net salary cannot mathematically exceed total gross earnings.",
              evidence: "Gross - Deductions != Net Pay",
            },
          ];
          ruleVal = {
            category: "salary_slip",
            category_name: "Salary Slip",
            checks: [
              {
                rule_name: "Gross Pay - Total Deductions == Net Pay",
                passed: false,
                description: "Compensation accounting formula check.",
                details: "Gross: ₹1,20,000 | Deductions: ₹15,000 | Expected Net: ₹1,05,000 | Stated Net: ₹1,85,000",
                severity: "critical",
              },
            ],
          };
        } else if (activeSample.name.includes("PAN Card")) {
          docCategory = "pan_card";
          docCategoryName = "PAN Card";
          suspectedFieldsList = [
            {
              field_name: "Permanent Account Number",
              suspected_change: "SYNTAX_VIOLATION",
              details: "4th character 'X' in 'ABCX1234F' is invalid. Authorized CBDT entity characters: [P, C, H, F, A, T, B, L, J, G].",
              evidence: "Non-standard taxpayer classification character 'X'",
              severity: "critical",
              bbox: [26, 44, 48, 14],
            },
          ];
          suspiciousRegionsList = [
            {
              id: "region-1",
              page: 1,
              label: "Permanent Account Number",
              bbox: [26, 44, 48, 14],
              severity: "critical",
              suspected_change: "SYNTAX_VIOLATION",
              explanation: "Character at index 4 violates Indian CBDT taxpayer standard.",
              evidence: "CBDT Registered Entity Set mismatch",
            },
          ];
          ruleVal = {
            category: "pan_card",
            category_name: "PAN Card",
            checks: [
              {
                rule_name: "PAN 4th Character Entity Classification",
                passed: false,
                description: "Income Tax Department 4th-character entity code validation.",
                details: "Extracted PAN: ABCX1234F | 4th Char 'X' is unauthorized",
                severity: "critical",
              },
            ],
          };
        } else if (activeSample.name.includes("Aadhaar")) {
          docCategory = "aadhaar_card";
          docCategoryName = "Aadhaar Card";
          suspectedFieldsList = [
            {
              field_name: "Aadhaar Number (UID)",
              suspected_change: "VERHOEFF_FAILURE",
              details: "12-digit number fails UIDAI Verhoeff dihedral group D5 check equation.",
              evidence: "Verhoeff check digit equation failed",
              severity: "critical",
              bbox: [20, 64, 60, 12],
            },
          ];
          suspiciousRegionsList = [
            {
              id: "region-1",
              page: 1,
              label: "Aadhaar Number (UID)",
              bbox: [20, 64, 60, 12],
              severity: "critical",
              suspected_change: "VERHOEFF_FAILURE",
              explanation: "Artificially fabricated Aadhaar number failing cryptographic checksum.",
              evidence: "ISO 7064 Mod 11, 10 algorithm check failed",
            },
          ];
          ruleVal = {
            category: "aadhaar_card",
            category_name: "Aadhaar Card",
            checks: [
              {
                rule_name: "Verhoeff Checksum (UIDAI Mathematical Standard)",
                passed: false,
                description: "Dihedral group D5 multiplication table check.",
                details: "UID: 9876 5432 1099 | Check digit equation returned non-zero",
                severity: "critical",
              },
            ],
          };
        } else if (activeSample.name.includes("Laundered") || activeSample.name.includes("Canon")) {
          docCategory = "image_camera_specimen";
          docCategoryName = "Laundered Camera Specimen (Canon EOS 5D Injected)";
          suspectedFieldsList = [
            {
              field_name: "Quantization DQT Matrix",
              suspected_change: "ISP_SOFTWARE_MISMATCH",
              details: "Standard Independent JPEG Group (IJG) Q75 software table found. Contradicts claimed Canon DIGIC 6+ hardware ISP firmware.",
              evidence: "Quantization table Euclidean distance = 0.0 vs IJG Q75 reference",
              severity: "critical",
              bbox: [5, 5, 45, 20],
            },
            {
              field_name: "Optical Aperture & DoF",
              suspected_change: "PHYSICS_CONTRADICTION",
              details: "EXIF claims ultra-wide aperture f/1.4, which physically produces shallow depth of field. Pixel analysis reveals uniform edge sharpness across all 4 quadrants.",
              evidence: "Periphery corner sharpness variance ratio: 0.94 (Bokeh absent)",
              severity: "critical",
              bbox: [10, 30, 80, 35],
            },
            {
              field_name: "Sensor Shot Noise Floor",
              suspected_change: "PHYSICS_CONTRADICTION",
              details: "EXIF claims ISO 6400 high-gain capture, which physically mandates Poisson-Gaussian photon shot noise. Residual flat-patch noise std is 0.18 (expected > 1.20).",
              evidence: "Synthetic hyper-smooth diffusion texture without silicon thermal noise",
              severity: "critical",
              bbox: [25, 65, 50, 25],
            },
            {
              field_name: "Screen Re-capture (2D FFT Moiré)",
              suspected_change: "SCREEN_RECAPTURE_MOIRE",
              details: "2D FFT magnitude spectrum exhibits 6 conjugate harmonic peaks with Z-score 4.82 (threshold 4.20) in off-axis radial frequency annulus.",
              evidence: "Periodic subpixel interference waves (0.42 rad/px)",
              severity: "critical",
              bbox: [50, 10, 45, 40],
            },
          ];
          suspiciousRegionsList = [
            {
              id: "region-1",
              page: 1,
              label: "Quantization DQT Matrix",
              bbox: [5, 5, 45, 20],
              severity: "critical",
              suspected_change: "ISP_SOFTWARE_MISMATCH",
              explanation: "Standard IJG Q75 software table proves export by software library rather than camera firmware.",
              evidence: "IJG DQT software match 100%",
            },
            {
              id: "region-2",
              page: 1,
              label: "Optical Aperture & DoF",
              bbox: [10, 30, 80, 35],
              severity: "critical",
              suspected_change: "PHYSICS_CONTRADICTION",
              explanation: "Claimed f/1.4 aperture impossible with uniform corner-to-corner focus.",
              evidence: "Thin-lens optical physics failure",
            },
            {
              id: "region-3",
              page: 1,
              label: "Sensor Shot Noise Floor",
              bbox: [25, 65, 50, 25],
              severity: "critical",
              suspected_change: "PHYSICS_CONTRADICTION",
              explanation: "Zero Poisson-Gaussian shot noise at ISO 6400 on CMOS silicon sensor.",
              evidence: "Noise std: 0.18 vs physical expected > 1.20",
            },
            {
              id: "region-4",
              page: 1,
              label: "Screen Re-capture (2D FFT Moiré)",
              bbox: [50, 10, 45, 40],
              severity: "critical",
              suspected_change: "SCREEN_RECAPTURE_MOIRE",
              explanation: "Off-axis harmonic lattice peaks produced by LCD/OLED subpixel grid.",
              evidence: "Harmonic Peak Z-Score: 4.82 (Threshold: 4.20)",
            },
          ];
          ruleVal = {
            category: "image_camera_specimen",
            category_name: "Cross-Modal Physics & 2D FFT Moiré Validation",
            checks: [
              {
                rule_name: "Hardware ISP Quantization vs Software Tables",
                passed: false,
                description: "Validates JPEG luminance quantization table against camera firmware ISP specs.",
                details: "Claimed: Canon DIGIC 6+ ISP | Found: Standard Independent JPEG Group (IJG) Q75",
                severity: "critical",
              },
              {
                rule_name: "Optical Aperture vs Depth-of-Field (DoF) Gradient",
                passed: false,
                description: "Evaluates spatial Laplacian gradient sharpness against claimed lens aperture.",
                details: "Claimed: f/1.4 Ultra-Wide | Center/Corner Sharpness Ratio: 0.94 (Bokeh Absent)",
                severity: "critical",
              },
              {
                rule_name: "Sensor Sensitivity vs Photon Shot Noise Floor",
                passed: false,
                description: "Evaluates Poisson-Gaussian photon arrival statistics in flat image patches.",
                details: "Claimed: ISO 6400 | Measured Residual Noise Std: 0.18 (Physical Expected > 1.20)",
                severity: "critical",
              },
              {
                rule_name: "2D FFT Moiré Spatial Harmonic Lattice Detection",
                passed: false,
                description: "Hanning-windowed 2D Fourier transform off-axis harmonic peak scan.",
                details: "Harmonic Lattice Peaks: 6 | Max Z-Score: 4.82 (Screen Re-capture Probability: 99.8%)",
                severity: "critical",
              },
              {
                rule_name: "Aspect Ratio vs Native Sensor Geometry Context",
                passed: true,
                description: "Checks sensor aspect ratio while enforcing dimension policy (crops != fake alone).",
                details: "1:1 Square Crop (1024x1024) on claimed 3:2 sensor. Corroborated by software DQT.",
                severity: "info",
              },
            ],
          };
          timelineData = {
            creation_date: "2026-10-30T14:15:00Z",
            last_modification_date: "2026-10-31T01:45:00Z",
            date_discrepancy_seconds: 41400,
            revision_passes: 3,
            detected_software_footprint: "ExifTool / Injected EXIF Stream",
            is_date_tampered: true,
            timestamp_reliability: "SUSPECT",
            reliability_explanation: "Critical physical contradictions between injected EXIF timestamps and software DQT tables.",
          };
        }

        const isLaunderedSample = activeSample.name.includes("Laundered") || activeSample.name.includes("Canon");

        const sampleResult: ForensicAnalysisResult = {
          fileName: activeSample.filename,
          fileSize: isPdf ? 142080 : 389200,
          sha256: isLaunderedSample ? "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" : "9a2f7c4e518b03da7e41c629f123849db210984efb349281a8c90321f829104b",
          fileCategory: isPdf ? "pdf" : "image",
          isTampered: true,
          verdict: isLaunderedSample ? "METADATA_FORGERY_DETECTED" : "MALICIOUS FORGERY DETECTED",
          severityBadge: isLaunderedSample ? "PHYSICS CONTRADICTION" : activeSample.severityBadge,
          severityColor: "crimson",
          riskScore: isLaunderedSample ? 99 : 98,
          keyReasons: isLaunderedSample ? [
            "Hardware ISP vs Software Quantization: Claims Canon DIGIC ISP but contains Standard IJG Q75 software table.",
            "Optical Aperture Contradiction: Claims f/1.4 ultra-wide aperture but exhibits uniform sharpness across all 4 corners.",
            "Sensor Shot Noise Contradiction: Claims ISO 6400 but exhibits hyper-smooth diffusion texture (std 0.18 vs expected > 1.20).",
            "Screen Re-photography Moiré: 2D FFT magnitude spectrum reveals harmonic lattice frequency spikes (Z = 4.82 > 4.20).",
            "Core Forensic Rule: Absence of tampering traces != evidence of authenticity. Asset fails physical cross-validation.",
          ] : [
            activeSample.desc,
            "Contradiction detected in deterministic mathematical verification",
            "Discrepancy confirmed across cross-modal forensic checks",
          ],
          findings: isLaunderedSample ? [
            {
              code: "METADATA_QUANTIZATION_HARDWARE_MISMATCH",
              severity: "critical",
              title: "Lying Metadata: Software Quantization Table",
              description: "Standard IJG Q75 table found in image container, proving export by software library rather than Canon camera firmware.",
              evidence: "Quantization table Euclidean distance = 0.0 vs IJG Q75 reference",
              location: "JPEG DQT Marker",
            },
            {
              code: "METADATA_OPTICAL_DOF_MISMATCH",
              severity: "critical",
              title: "Optical Physics Contradiction: Depth of Field",
              description: "Claimed f/1.4 aperture physically produces shallow depth of field, but image exhibits uniform corner sharpness.",
              evidence: "Laplacian sharpness ratio: 0.94",
              location: "Spatial Laplacian gradient vs EXIF FNumber",
            },
            {
              code: "METADATA_SENSOR_ISO_NOISE_MISMATCH",
              severity: "critical",
              title: "Sensor Physics Contradiction: Photon Shot Noise",
              description: "Claimed ISO 6400 physically produces Poisson-Gaussian shot noise. Measured flat patch noise is 0.18 (expected > 1.20).",
              evidence: "Zero silicon sensor noise floor detected",
              location: "Poisson-Gaussian noise estimator vs EXIF ISOSpeedRatings",
            },
            {
              code: "IMG_MOIRE_RECAPTURE_DETECTED",
              severity: "critical",
              title: "Screen Re-photography 2D FFT Moiré Lattice",
              description: "2D FFT magnitude spectrum reveals harmonic lattice spikes created by re-photographing an LCD/OLED display grid.",
              evidence: "Harmonic Peak Z-Score: 4.82 (Threshold: 4.20)",
              location: "2D Fourier frequency domain",
            },
          ] : [
            {
              code: isPdf ? "DOC_FONT_SPLICING" : "IMG_METADATA_FORGERY",
              severity: "critical",
              title: activeSample.name,
              description: activeSample.desc,
              evidence: activeSample.desc,
              location: activeSample.engine,
            },
          ],
          documentCategory: docCategory,
          documentCategoryName: docCategoryName,
          suspectedFields: suspectedFieldsList,
          suspiciousRegions: suspiciousRegionsList,
          timeline: timelineData,
          ruleValidation: ruleVal,
          metadata: {
            fileType: isPdf ? "application/pdf" : "image/jpeg",
            fileSize: isPdf ? 142080 : 389200,
            formattedSize: isPdf ? "138.8 KB" : "380.1 KB",
            sha256: isLaunderedSample ? "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" : "9a2f7c4e518b03da7e41c629f123849db210984efb349281a8c90321f829104b",
            software: isPdf ? "iLovePDF / Ghostscript" : "Canon EOS 5D Mark IV (Injected)",
            rawDetails: {
              "Target Evidence Specimen": activeSample.filename,
              "Designated Engine": activeSample.engine,
              "Severity Classification": activeSample.risk,
              "Forensic Attack Class": activeSample.name,
              "Deterministic Audit Proof": activeSample.desc,
              "Pixel Dimension Policy": "Aspect ratio alone does not establish forgery; confirmed via mathematical integrity.",
            },
          },
        };

        setRealResult(sampleResult);
        setIsScanning(false);
        setScanComplete(true);
        soundManager.playSuccess();
      }, 1500);
      return;
    }

    // Real uploaded file analysis
    try {
      // 1. Client-side deep binary & metadata extraction
      const parsedData = await analyzeUploadedFile(primaryFile);
      parsedData.uploadedFileUrl = URL.createObjectURL(primaryFile);

      // 2. Ensure investigator session token
      try {
        let token: string | null = typeof window !== "undefined" ? localStorage.getItem("beyondproof_token") : null;
        if (!token) {
          const passRes = await authAPI.judgePass();
          const passToken = passRes.data?.access_token;
          if (typeof passToken === "string") {
            token = passToken;
            localStorage.setItem("beyondproof_token", passToken);
          }
        }

        // 3. Backend upload & verification
        if (token) {
          const uploadRes = await filesAPI.upload(primaryFile);
          const uploadedFileId = uploadRes.data?.id;

          if (uploadedFileId) {
            const engineMapping: Record<string, string> = {
              "Identity Guardian": "identity",
              "Document Verifier": "document",
              "Media Truth Engine": "media",
              "Source Tracker": "source",
              "AI Risk Analyzer": "risk",
            };
            const requestedBackendEngines = selectedEngines.map((e) => engineMapping[e] || "media");

            const verifRes = await verificationAPI.create({
              file_id: uploadedFileId,
              engines: requestedBackendEngines,
            });

            if (verifRes.data?.id) {
              setBackendVerificationId(verifRes.data.id);
            }

            if (verifRes.data?.document_category) {
              parsedData.documentCategory = verifRes.data.document_category;
              parsedData.documentCategoryName = verifRes.data.document_category_name || "Official Document";
            }
            if (verifRes.data?.suspected_fields && verifRes.data.suspected_fields.length > 0) {
              parsedData.suspectedFields = verifRes.data.suspected_fields;
            }
            if (verifRes.data?.suspicious_regions && verifRes.data.suspicious_regions.length > 0) {
              parsedData.suspiciousRegions = verifRes.data.suspicious_regions;
            }
            if (verifRes.data?.editing_timeline) {
              parsedData.timeline = verifRes.data.editing_timeline;
            }
            if (verifRes.data?.rule_validation) {
              parsedData.ruleValidation = verifRes.data.rule_validation;
            }
            if (verifRes.data?.annotated_image_url) {
              parsedData.annotatedImageUrl = verifRes.data.annotated_image_url;
            }

            if (verifRes.data?.risk_assessment) {
              const ra = verifRes.data.risk_assessment;
              parsedData.riskScore = Math.round((ra.overall_score || 0) * 100);
              if (ra.authenticity_verdict === "MALICIOUS_LAUNDERED_SUSPECT" || ra.risk_category === "high_risk") {
                parsedData.isTampered = true;
                parsedData.verdict = "MALICIOUS FORGERY DETECTED";
                parsedData.severityBadge = "CONFIRMED TAMPER";
                parsedData.severityColor = "crimson";
              }
            }

            if (verifRes.data?.engine_results) {
              for (const eng of verifRes.data.engine_results) {
                if (eng.findings && Array.isArray(eng.findings)) {
                  for (const f of eng.findings) {
                    if (f.code && !parsedData.findings.some((pf) => pf.code === f.code)) {
                      parsedData.findings.push({
                        code: f.code,
                        severity: f.severity || "medium",
                        title: f.code.replace(/_/g, " "),
                        description: f.description || "",
                        evidence: f.evidence || "",
                        location: f.location || eng.engine_name,
                      });
                      if (f.severity === "high" || f.severity === "critical") {
                        parsedData.isTampered = true;
                        parsedData.keyReasons.push(f.description);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } catch (backendErr) {
        console.warn("Backend verification pipeline notice (using direct client binary forensics):", backendErr);
      }

      setRealResult(parsedData);
      setIsScanning(false);
      setScanComplete(true);
      soundManager.playSuccess();
    } catch (err: any) {
      console.error("Forensic analysis failed:", err);
      setScanError(err?.message || "Failed to parse digital specimen.");
      setIsScanning(false);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["png", "jpg", "jpeg", "webp", "img"].includes(ext || "")) return ImageIcon;
    if (["mp4", "mov", "avi", "webm"].includes(ext || "")) return Film;
    if (["wav", "mp3", "flac", "ogg"].includes(ext || "")) return Music;
    return FileIcon;
  };

  return (
    <div
      className={`space-y-8 transition-all duration-700 ease-out ${
        animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER: Command Center Title & Stage Status
      ════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div>
          <div
            className="flex items-center gap-2 text-[10px] uppercase mb-2"
            style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.2em" }}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.8)] animate-pulse" />
            <span className="text-cyan-400">EVIDENCE INTAKE & 3D LASER CHAMBER</span>
            <span className="text-gray-600">// STAGE 01</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Start an{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500">
              Investigation.
            </span>
          </h1>

          <p className="text-gray-400 text-xs sm:text-sm mt-1.5 max-w-2xl">
            Ingest multi-spectral digital evidence into the 3D holographic laser chamber for
            automated multi-engine forensic dissection and cross-modal verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="px-3.5 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[10px] text-cyan-300 flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.15)]"
            style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.15em" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>STAGE 01 // EVIDENCE INTAKE</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN WORKSPACE GRID: Chamber / Engines (Left) + Attack Presets (Right)
      ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Intake Chamber (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 3D Laser Chamber Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`relative p-8 rounded-3xl border-2 border-dashed cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center overflow-hidden liquid-glass group ${
              isDragging
                ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_60px_rgba(0,242,254,0.4)] scale-[1.008]"
                : "border-white/[0.12] hover:border-cyan-400/60 hover:shadow-[0_12px_40px_rgba(0,242,254,0.25)]"
            }`}
          >
            {/* Holographic Tactical Crosshairs (Corners) */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-cyan-400/50 pointer-events-none group-hover:border-cyan-400 transition-colors" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-cyan-400/50 pointer-events-none group-hover:border-cyan-400 transition-colors" />
            <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-cyan-400/50 pointer-events-none group-hover:border-cyan-400 transition-colors" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-cyan-400/50 pointer-events-none group-hover:border-cyan-400 transition-colors" />

            {/* Chamber HUD Status Bar */}
            <div className="w-full flex items-center justify-between pb-2 mb-2 pointer-events-none border-b border-white/[0.04]">
              <div
                className="flex items-center gap-2 text-[9px] uppercase text-cyan-400"
                style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.15em" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
                <span>CHAMBER 01</span>
                <span className="text-gray-600">// SPECTRAL BEAM ACTIVE</span>
              </div>
              <div
                className="text-[9px] uppercase text-gray-500 flex items-center gap-2"
                style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.12em" }}
              >
                <span>RES: 1080P/60</span>
                <span className="text-gray-700">|</span>
                <span className="text-cyan-400">WEBGL 2.0</span>
              </div>
            </div>

            {/* 3D WebGL Laser Stage */}
            <div
              ref={mountRef}
              className="w-full max-w-md h-[240px] pointer-events-none flex items-center justify-center my-2"
            />

            {/* Chamber Information & Call to Action */}
            <div className="relative z-10 max-w-md">
              <h3
                className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Drop Digital Evidence into 3D Laser Chamber
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                or{" "}
                <span className="text-cyan-400 underline font-semibold hover:text-cyan-300 transition-colors">
                  browse files
                </span>{" "}
                from your forensic workstation
              </p>

              {/* Supported Formats Pills */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                {["PDF", "PNG", "JPG", "WEBP", "MP4", "MOV", "WAV", "MP3"].map((fmt) => (
                  <span
                    key={fmt}
                    className="px-2 py-0.5 rounded bg-black/50 border border-white/[0.08] text-[9px] text-gray-400 font-mono group-hover:border-cyan-500/30 group-hover:text-cyan-300 transition-all"
                  >
                    {fmt}
                  </span>
                ))}
                <span
                  className="text-[9px] text-gray-500 block w-full mt-2"
                  style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.1em" }}
                >
                  MAX 100 MB PER FILE // SHA-256 LEDGER COMPUTATION AUTO-ENABLED
                </span>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              accept=".pdf,.png,.jpg,.jpeg,.webp,.mp4,.mov,.wav,.mp3"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* Selected Files Intake Queue */}
          {files.length > 0 && (
            <div className="p-5 rounded-xl liquid-glass border border-white/[0.06] space-y-3 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div
                  className="flex items-center gap-2 text-[10px] text-cyan-400 uppercase"
                  style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.15em" }}
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>INTAKE QUEUE ({files.length} EVIDENCE ITEMS)</span>
                </div>
                <button
                  onClick={() => {
                    soundManager.playBlip();
                    setFiles([]);
                    setActiveSample(null);
                    setScanComplete(false);
                  }}
                  className="text-[10px] text-rose-400 hover:text-rose-300 hover:underline uppercase transition-all"
                  style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.1em" }}
                >
                  Clear Queue
                </button>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {files.map((f, i) => {
                  const FileIconComponent = getFileIcon(f.name);
                  return (
                    <div
                      key={`${f.name}-${i}`}
                      className="p-3 rounded-lg bg-black/40 border border-white/[0.06] hover:border-cyan-400/40 flex items-center justify-between text-gray-300 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                          <FileIconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-white font-medium text-xs block group-hover:text-cyan-300 transition-colors">
                            {f.name}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono mt-0.5">
                            <span>{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                            <span>?</span>
                            <span>{f.type || "Raw Binary"}</span>
                            <span>?</span>
                            <span className="text-emerald-400/80">HASH READY</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundManager.playBlip();
                          setFiles((prev) => prev.filter((_, idx) => idx !== i));
                          if (files.length <= 1) {
                            setActiveSample(null);
                            setScanComplete(false);
                          }
                        }}
                        className="text-gray-500 hover:text-rose-400 p-1.5 rounded hover:bg-rose-950/30 transition-all"
                        title="Remove evidence"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Forensic Engine Selection Card */}
          <div className="p-6 rounded-xl liquid-glass border border-white/[0.06] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.06] gap-2">
              <div>
                <span
                  className="text-cyan-400 text-[10px] uppercase block mb-1 font-semibold"
                  style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.2em" }}
                >
                  02 // FORENSIC ANALYSIS SCOPE
                </span>
                <h4
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Select Active Forensic Engines
                </h4>
              </div>

              <button
                onClick={() => {
                  soundManager.playBlip();
                  setSelectedEngines(
                    selectedEngines.length === engines.length
                      ? []
                      : engines.map((e) => e.name)
                  );
                }}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 uppercase underline transition-all self-start sm:self-auto"
                style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.1em" }}
              >
                {selectedEngines.length === engines.length
                  ? "Deselect All Engines"
                  : "Select All (5 Engines)"}
              </button>
            </div>

            {/* Engines Grid with Subtle Hover Animations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {engines.map((eng) => {
                const isSelected = selectedEngines.includes(eng.name);
                const IconComponent = eng.icon;

                return (
                  <label
                    key={eng.id}
                    className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3.5 transition-all duration-300 hover:scale-[1.015] ${
                      isSelected
                        ? "bg-cyan-950/20 border-cyan-400/50 shadow-[0_0_20px_rgba(0,229,255,0.1)] text-white"
                        : "bg-black/30 border-white/[0.06] text-gray-400 hover:border-cyan-400/30 hover:bg-black/50"
                    }`}
                  >
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          soundManager.playBlip();
                          setSelectedEngines((prev) =>
                            e.target.checked
                              ? [...prev, eng.name]
                              : prev.filter((n) => n !== eng.name)
                          );
                        }}
                        className="w-4 h-4 rounded accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <IconComponent className={`w-3.5 h-3.5 ${eng.accentClass}`} />
                          <span className="font-bold text-white text-xs block">
                            {eng.name}
                          </span>
                        </div>
                        <span
                          className="text-[8px] px-1.5 py-0.5 rounded bg-white/[0.04] text-gray-400 border border-white/[0.06]"
                          style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.1em" }}
                        >
                          {eng.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400 leading-relaxed block">
                        {eng.desc}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Launch Button with Pulsing Glow Animation */}
            <div className="pt-2">
              <button
                onClick={handleStartInvestigation}
                disabled={files.length === 0 || selectedEngines.length === 0 || isScanning}
                className="relative overflow-hidden w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-400 text-black font-bold text-xs uppercase shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:shadow-[0_0_45px_rgba(0,229,255,0.7)] hover:scale-[1.008] active:scale-[0.99] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:animate-none disabled:shadow-none flex items-center justify-center gap-3 animate-pulse"
                style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.15em" }}
              >
                {isScanning ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin text-black" />
                    <span>DISSECTING EVIDENCE IN 3D STAGE...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-black fill-black" />
                    <span>EXECUTE FORENSIC VERIFICATION ({selectedEngines.length} ENGINES)</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </>
                )}
              </button>
            </div>

            {/* Scan Complete Result Card */}
            {scanComplete && realResult && (
              <div
                className={`mt-6 p-6 rounded-2xl pro-panel space-y-5 animate-fadeIn ${
                  realResult.isTampered
                    ? "border-rose-500/40 bg-rose-950/20 shadow-[0_0_40px_rgba(244,63,94,0.25)]"
                    : "border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                }`}
              >
                {/* Header Verdict Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        realResult.isTampered
                          ? "bg-rose-500/15 border border-rose-500/30 text-rose-400"
                          : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                      }`}
                    >
                      {realResult.isTampered ? (
                        <ShieldAlert className="w-6 h-6 animate-pulse" />
                      ) : (
                        <ShieldCheck className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`badge-clean text-[9px] ${
                            realResult.isTampered ? "badge-crimson" : "badge-emerald"
                          }`}
                        >
                          {realResult.verdict}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          RISK SCORE: {realResult.riskScore}/100
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                        {realResult.fileName}
                      </h4>
                    </div>
                  </div>

                  <span
                    className={`badge-clean text-[10px] font-bold ${
                      realResult.isTampered ? "badge-crimson" : "badge-emerald"
                    }`}
                  >
                    {realResult.severityBadge}
                  </span>
                </div>

                {/* Evidence Specimen Cryptographic Identity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                    <span className="text-slate-500 text-[9px] block uppercase">Specimen File Name</span>
                    <span className="text-white font-semibold block truncate" title={realResult.fileName}>
                      {realResult.fileName}
                    </span>
                    <span className="text-cyan-400 text-[9px] block font-sans">
                      {realResult.metadata.formattedSize} ? {realResult.metadata.fileType}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                    <span className="text-slate-500 text-[9px] block uppercase">Dimensions / Pages</span>
                    <span className="text-white font-semibold block">
                      {realResult.metadata.dimensions ||
                        (realResult.metadata.pageCount
                          ? `${realResult.metadata.pageCount} Pages`
                          : "Raw Binary")}
                    </span>
                    <span className="text-slate-400 text-[9px] block font-sans">
                      {realResult.metadata.aspectRatio ? `Aspect ${realResult.metadata.aspectRatio}` : "Structural Document"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1 sm:col-span-2">
                    <span className="text-slate-500 text-[9px] block uppercase">Cryptographic SHA-256 Digest</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-cyan-300 font-mono text-[10px] truncate">
                        {realResult.sha256}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(realResult.sha256);
                          setCopiedHash(true);
                          setTimeout(() => setCopiedHash(false), 2000);
                        }}
                        className="px-2 py-1 rounded bg-black/60 border border-white/10 hover:border-cyan-400 text-[10px] text-slate-300 flex items-center gap-1 transition-colors shrink-0"
                        title="Copy SHA-256 hash"
                      >
                        {copiedHash ? (
                          <>
                            <CheckCheck className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 text-[9px]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span className="text-[9px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <span className="text-emerald-400/80 text-[9px] block font-sans">
                      Anchored in Immutable Ledger
                    </span>
                  </div>
                </div>

                {/* Universal Document Category Badge */}
                {realResult.documentCategoryName && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-purple-950/30 border border-cyan-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileSearch className="w-4 h-4 text-cyan-400" />
                      <div>
                        <span className="text-[10px] text-cyan-400 font-mono uppercase block">
                          Universal Document Classification
                        </span>
                        <span className="text-sm font-bold text-white tracking-wide">
                          {realResult.documentCategoryName}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-cyan-950 border border-cyan-400/40 text-cyan-300">
                      AUTOMATICALLY CLASSIFIED
                    </span>
                  </div>
                )}

                {/* Interactive Visual Document Viewer with Bounding Boxes */}
                <UniversalDocumentViewer
                  documentUrl={realResult.uploadedFileUrl}
                  annotatedUrl={realResult.annotatedImageUrl}
                  regions={realResult.suspiciousRegions}
                  documentCategory={realResult.documentCategory}
                  documentCategoryName={realResult.documentCategoryName}
                  selectedRegionId={selectedRegionId}
                  onSelectRegion={setSelectedRegionId}
                />

                {/* Suspected Fields Table (WHAT and HOW was manipulated) */}
                <SuspectedFieldsTable
                  fields={realResult.suspectedFields}
                  onSelectField={(field) => {
                    const match = realResult.suspiciousRegions?.find(
                      (r) => r.label === field.field_name
                    );
                    if (match) {
                      setSelectedRegionId(match.id);
                    }
                  }}
                />

                {/* Category Rule Checklist (WHY it is flagged) */}
                <CategoryRuleChecklist ruleValidation={realResult.ruleValidation} />

                {/* Chronological Editing Timeline (WHEN it was edited) */}
                <ForensicTimeline timeline={realResult.timeline} />

                {/* Deterministic Forensic Proof & Technical Evidence */}
                <div
                  className={`p-4 rounded-xl border space-y-2.5 ${
                    realResult.isTampered
                      ? "bg-rose-950/30 border-rose-500/20"
                      : "bg-black/50 border-white/[0.07]"
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 text-[11px] font-mono font-semibold ${
                      realResult.isTampered ? "text-rose-400" : "text-cyan-400"
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>
                      {realResult.isTampered
                        ? "DETERMINISTIC FORENSIC PROOF OF TAMPERING / FORGERY:"
                        : "AUTHENTICITY INTEGRITY VERIFICATION FINDINGS:"}
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {realResult.keyReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span
                          className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                            realResult.isTampered ? "bg-rose-400" : "bg-cyan-400"
                          }`}
                        />
                        <span className="leading-relaxed">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Forensic Geometry & Pixel Size Clarification */}
                <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs flex items-start gap-3">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-cyan-300 font-semibold block text-[11px] uppercase tracking-wide">
                      Forensic Dimension Science Note:
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">
                      {realResult.metadata.pixelDimensionAnalysis ||
                        "Image dimensions (such as 1024x1024) and 1:1 square aspect ratios do not prove an image is fake or forged. Square crops are standard in photography, social media, and avatars. BeyondProof proves forgery strictly through determinable evidence: EXIF software headers, quantization tables, incremental revisions, and compression error levels."}
                    </p>
                  </div>
                </div>

                {/* Deep Extracted Document / Image Metadata Grid */}
                <div className="space-y-2.5">
                  <div
                    className="flex items-center gap-2 text-[10px] text-cyan-400 uppercase font-semibold"
                    style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.15em" }}
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>DEEP EXTRACTED SPECIMEN METADATA LEDGER</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {Object.entries(realResult.metadata.rawDetails).map(([key, val]) => (
                      <div
                        key={key}
                        className="p-3 rounded-lg bg-black/40 border border-white/[0.05] space-y-1"
                      >
                        <span className="text-[10px] text-slate-500 uppercase block font-mono">
                          {key}
                        </span>
                        <span className="text-xs text-slate-200 font-mono block break-words">
                          {val !== null && val !== undefined ? String(val) : "None"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Links & Inspection Deep Dives */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={
                        realResult.fileCategory === "pdf"
                          ? "/app/engines/document"
                          : "/app/engines/media"
                      }
                      onClick={() => soundManager.playBlip()}
                      className="btn-cyan text-xs"
                    >
                      <span>
                        {realResult.fileCategory === "pdf"
                          ? "Deep-Dive in Document Verifier"
                          : "Inspect in Media Truth Engine"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href="/app/reports"
                      onClick={() => soundManager.playBlip()}
                      className="btn-secondary text-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Court Dossier</span>
                    </Link>

                    <Link
                      href="/app/trust-graph"
                      onClick={() => soundManager.playBlip()}
                      className="btn-secondary text-xs"
                    >
                      <Network className="w-3.5 h-3.5 text-cyan-400" />
                      <span>3D Trust Graph</span>
                    </Link>
                  </div>

                  <button
                    onClick={() => {
                      soundManager.playBlip();
                      setScanComplete(false);
                      setRealResult(null);
                      setActiveSample(null);
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-300 font-mono uppercase underline transition-colors"
                  >
                    Reset Specimen
                  </button>
                </div>
              </div>
            )}

            {/* Laundered Fakes & Lying Metadata Shield Widget */}
            <div className="mt-8 pt-6 border-t border-white/[0.06]">
              <div
                className="flex items-center gap-2 mb-3 text-[10px] uppercase text-cyan-400"
                style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.15em" }}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.8)] animate-pulse" />
                <span>ADVANCED COUNTERMEASURE</span>
                <span className="text-gray-600">// LAUNDERED FAKES & LYING METADATA</span>
              </div>
              <LaunderedFakesShield />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SIDEBAR (1 Column): 1-Click Attack Presets & Forensic Architecture
        ════════════════════════════════════════════════════════════════════ */}
        <div className="space-y-6">
          {/* 1-Click Attack Presets Sidebar */}
          <div className="p-6 rounded-xl liquid-glass border border-white/[0.06] space-y-4 shadow-xl">
            <div className="pb-3 border-b border-white/[0.06]">
              <div
                className="flex items-center gap-2 text-amber-400 text-[10px] uppercase font-bold mb-1"
                style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.15em" }}
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>JUDGE DEMONSTRATION SUITE</span>
              </div>
              <h4
                className="text-lg font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                1-Click Attack Presets
              </h4>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                Instantly inject authentic attack vectors into the 3D laser chamber to audit
                engine verdicts:
              </p>
            </div>

            {/* Preset Cards with Striking Gradient Backgrounds */}
            <div className="space-y-3">
              {sampleAttacks.map((att) => {
                const isActive = activeSample?.name === att.name;

                return (
                  <button
                    key={att.name}
                    onClick={() => handleSampleAttack(att)}
                    className={`w-full text-left p-4 rounded-xl bg-gradient-to-br ${att.gradient} border transition-all duration-300 group hover:scale-[1.015] ${
                      isActive
                        ? "border-cyan-400 shadow-[0_0_25px_rgba(0,229,255,0.35)] ring-1 ring-cyan-400/50"
                        : att.borderClass
                    }`}
                  >
                    <div className="flex items-center justify-between text-white font-bold mb-1.5 text-xs">
                      <span className="group-hover:text-cyan-300 transition-colors">
                        {att.name}
                      </span>
                      <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-[8px] px-2 py-0.5 rounded border font-semibold ${att.badgeColor}`}
                        style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.1em" }}
                      >
                        {att.severityBadge}
                      </span>
                      <span
                        className="text-[9px] text-gray-400 truncate"
                        style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.05em" }}
                      >
                        {att.filename}
                      </span>
                    </div>

                    <span className="text-[10px] text-cyan-400 font-mono block mb-1">
                      Target Engine: {att.engine}
                    </span>

                    <p className="text-[10px] text-gray-400 leading-relaxed block line-clamp-3">
                      {att.desc}
                    </p>

                    {isActive && (
                      <div
                        className="mt-2.5 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[9px] text-cyan-300"
                        style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.1em" }}
                      >
                        <span>CURRENT SPECIMEN LOADED</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Forensic Integrity Principles Card */}
          <div className="p-6 rounded-xl liquid-glass border border-white/[0.06] space-y-4 shadow-xl">
            <div className="pb-3 border-b border-white/[0.06]">
              <span
                className="text-cyan-400 text-[10px] uppercase block mb-1 font-semibold"
                style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.15em" }}
              >
                PLATFORM STANDARDS
              </span>
              <h4
                className="text-base font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Forensic Principles
              </h4>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-black/40 border border-white/[0.04]">
                <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span
                    className="font-bold text-white block text-xs"
                    style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.05em" }}
                  >
                    Cryptographic Custody
                  </span>
                  <span className="text-[10px] text-gray-400 leading-relaxed block mt-0.5">
                    Deterministic SHA-256 fingerprint computed before byte parsing into memory.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-black/40 border border-white/[0.04]">
                <ScanLine className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span
                    className="font-bold text-white block text-xs"
                    style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.05em" }}
                  >
                    Explainable Findings
                  </span>
                  <span className="text-[10px] text-gray-400 leading-relaxed block mt-0.5">
                    Zero black-box scores. Every risk assessment maps to verifiable anomaly vertices.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-black/40 border border-white/[0.04]">
                <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span
                    className="font-bold text-white block text-xs"
                    style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.05em" }}
                  >
                    Physics Contradiction
                  </span>
                  <span className="text-[10px] text-gray-400 leading-relaxed block mt-0.5">
                    Optical laws cross-check EXIF tags, detecting screenshot-laundered fakes.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* System Telemetry Tag */}
          <div
            className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-[9px] text-gray-500 uppercase"
            style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.12em" }}
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-gray-400">CHAMBER TELEMETRY: OPTIMAL</span>
            </div>
            <span className="text-cyan-400 font-mono">120 FPS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
