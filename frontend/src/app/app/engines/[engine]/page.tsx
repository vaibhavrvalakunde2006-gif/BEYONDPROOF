"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowUpRight,
  ScanLine,
  FileSearch,
  Fingerprint,
  LockKeyhole,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  Cpu,
  Zap,
  Terminal,
  Shield,
  CheckCircle2,
  Gauge,
  Eye,
} from "lucide-react";
import { soundManager } from "@/lib/soundFx";

// ═══════════════════════════════════════════════════════════════════════════════
// Dynamically import the 5 specialized 3D WebGL Engine Visualizers
// ═══════════════════════════════════════════════════════════════════════════════

const ThreeDFaceMesh = dynamic(
  () => import("@/components/3d/ThreeDFaceMesh"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[440px] flex flex-col items-center justify-center bg-black/60 rounded-xl border border-cyan-500/20 text-cyan-400 gap-3">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        <span
          className="text-xs"
          style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, letterSpacing: "0.18em" }}
        >
          INITIALIZING 3D BIOMETRIC MESH...
        </span>
      </div>
    ),
  }
);

const ThreeDDocumentStack = dynamic(
  () => import("@/components/3d/ThreeDDocumentStack"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[440px] flex flex-col items-center justify-center bg-black/60 rounded-xl border border-emerald-500/20 text-emerald-400 gap-3">
        <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
        <span
          className="text-xs"
          style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, letterSpacing: "0.18em" }}
        >
          INITIALIZING 3D EXPLODED PDF STACK...
        </span>
      </div>
    ),
  }
);

const ThreeDMediaTerrain = dynamic(
  () => import("@/components/3d/ThreeDMediaTerrain"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[440px] flex flex-col items-center justify-center bg-black/60 rounded-xl border border-violet-500/20 text-violet-400 gap-3">
        <div className="w-8 h-8 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
        <span
          className="text-xs"
          style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, letterSpacing: "0.18em" }}
        >
          INITIALIZING 3D SPECTRAL ELA TOPOLOGY...
        </span>
      </div>
    ),
  }
);

const ThreeDProvenanceChain = dynamic(
  () => import("@/components/3d/ThreeDProvenanceChain"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[440px] flex flex-col items-center justify-center bg-black/60 rounded-xl border border-amber-500/20 text-amber-400 gap-3">
        <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
        <span
          className="text-xs"
          style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, letterSpacing: "0.18em" }}
        >
          INITIALIZING 3D PROVENANCE CHAIN...
        </span>
      </div>
    ),
  }
);

const ThreeDRiskPolyhedron = dynamic(
  () => import("@/components/3d/ThreeDRiskPolyhedron"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[440px] flex flex-col items-center justify-center bg-black/60 rounded-xl border border-orange-500/20 text-orange-400 gap-3">
        <div className="w-8 h-8 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
        <span
          className="text-xs"
          style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, letterSpacing: "0.18em" }}
        >
          INITIALIZING 3D THREAT POLYHEDRON...
        </span>
      </div>
    ),
  }
);

const LaunderedFakesShield = dynamic(
  () => import("@/components/3d/LaunderedFakesShield"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-48 flex flex-col items-center justify-center liquid-glass border border-violet-500/20 rounded-xl text-violet-400 gap-2">
        <div className="w-6 h-6 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
        <span
          className="text-xs"
          style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, letterSpacing: "0.15em" }}
        >
          LOADING LAUNDERED FAKES & LYING METADATA SHIELD...
        </span>
      </div>
    ),
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// Engine Configurations
// ═══════════════════════════════════════════════════════════════════════════════

interface EngineConfig {
  id: string;
  engineCode: string;
  name: string;
  tag: string;
  desc: string;
  color: string;
  glowColor: string;
  gradientBg: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  capabilities: string[];
  sampleArtifact: string;
  verdict: string;
  confidence: string;
  latency: string;
  pipelineStep: string;
  component: React.ComponentType<any>;
}

const engineConfig: Record<string, EngineConfig> = {
  identity: {
    id: "identity",
    engineCode: "ENG-01",
    name: "Identity Guardian",
    tag: "BIOMETRIC & MRZ VALIDATION",
    desc: "Investigate identity documents, passports, and biometrics for physical and digital tampering indicators.",
    color: "#00e5ff",
    glowColor: "rgba(0, 229, 255, 0.28)",
    gradientBg: "from-cyan-950/25 via-[#080c14] to-[#030508]",
    icon: Fingerprint,
    capabilities: [
      "ICAO 9303 modulo-10 MRZ checksum validation",
      "68-point 3D facial landmark spatial wireframe",
      "Synthetic face mask & deepfake spoofing heatmaps",
      "Font geometry and microprint resolution verification",
    ],
    sampleArtifact: "FRA_PASSPORT_EXP2028.IMG",
    verdict: "FORGERY CONFIRMED (MRZ Checksum 8 vs 7)",
    confidence: "94.2%",
    latency: "28ms",
    pipelineStep: "Biometric & Optical MRZ Layer",
    component: ThreeDFaceMesh,
  },
  document: {
    id: "document",
    engineCode: "ENG-02",
    name: "Document Verifier",
    tag: "PDF FORENSICS & XREF STREAMS",
    desc: "Inspect certificates, contracts, and legal documents for structural, visual, and metadata anomalies.",
    color: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.28)",
    gradientBg: "from-emerald-950/25 via-[#080c14] to-[#030508]",
    icon: FileSearch,
    capabilities: [
      "Exploded 3D PDF layer structural dissection",
      "Cross-reference (xref) stream incremental revision detection",
      "Font glyph mismatch and kerning anomaly extraction",
      "Cryptographic X.509 signature & QR hash validation",
    ],
    sampleArtifact: "MASTER_SERVICES_AGREEMENT.PDF",
    verdict: "CONTRACT SPLICED (Post-Signature Byte Overwrite)",
    confidence: "97.8%",
    latency: "42ms",
    pipelineStep: "Document Object Tree & Cryptography",
    component: ThreeDDocumentStack,
  },
  media: {
    id: "media",
    engineCode: "ENG-03",
    name: "Media Truth Engine",
    tag: "SPECTRAL ELA & LAUNDERED FAKE SHIELD",
    desc: "Dissect images, video, and audio recordings for generative AI artifacts, screen re-photography Moiré patterns, and cross-modal EXIF metadata forgery.",
    color: "#8b5cf6",
    glowColor: "rgba(139, 92, 246, 0.28)",
    gradientBg: "from-violet-950/25 via-[#080c14] to-[#030508]",
    icon: ScanLine,
    capabilities: [
      "2D FFT Moiré screen re-photography periodic lattice detector",
      "Cross-modal EXIF vs physical reality validator (aperture, ISO, sensor)",
      "Standard IJG vs camera hardware ISP quantization matrix parser",
      "Authenticity engine enforcing 'Absence of tampering != Verified Genuine'",
      "3D topological Error Level Analysis (ELA) heightmap",
    ],
    sampleArtifact: "CANON_EOS5D_AI_LAUNDERED.JPG",
    verdict: "METADATA FORGERY DETECTED & LAUNDERED SUSPECT",
    confidence: "91.5%",
    latency: "65ms",
    pipelineStep: "Spectral Frequency & Sensor Physics",
    component: ThreeDMediaTerrain,
  },
  source: {
    id: "source",
    engineCode: "ENG-04",
    name: "Source Tracker",
    tag: "pHash & PROVENANCE CHAIN",
    desc: "Inspect cryptographic integrity, perceptual hash distance, and C2PA verifiable digital provenance manifests.",
    color: "#ffb547",
    glowColor: "rgba(255, 181, 71, 0.28)",
    gradientBg: "from-amber-950/25 via-[#080c14] to-[#030508]",
    icon: LockKeyhole,
    capabilities: [
      "Deterministic SHA-256 fingerprint generation",
      "Perceptual DCT optical hashing (pHash) similarity",
      "Decentralized immutable ledger timestamping",
      "C2PA Content Credentials cryptographic manifest parser",
    ],
    sampleArtifact: "ASSET_PROVENANCE_LOG.C2PA",
    verdict: "PROVENANCE TAMPERED (Manifest Signature Broken)",
    confidence: "99.1%",
    latency: "19ms",
    pipelineStep: "Cryptographic Provenance & Manifest Ledger",
    component: ThreeDProvenanceChain,
  },
  risk: {
    id: "risk",
    engineCode: "ENG-05",
    name: "AI Risk Analyzer",
    tag: "BAYESIAN THREAT ENGINE",
    desc: "Combine cross-engine forensic findings into an explainable, evidence-backed Bayesian risk assessment.",
    color: "#ff7a24",
    glowColor: "rgba(255, 122, 36, 0.28)",
    gradientBg: "from-orange-950/25 via-[#080c14] to-[#030508]",
    icon: Activity,
    capabilities: [
      "Multi-signal Bayesian severity weighting",
      "Conflicting evidence resolution & consensus modeling",
      "Evidence coverage and uncertainty quantification",
      "Court-ready explainable forensic risk narrative",
    ],
    sampleArtifact: "CROSS_ENGINE_SYNTHESIS.JSON",
    verdict: "HIGH RISK CRITICAL (Score: 89.4/100)",
    confidence: "89.4%",
    latency: "34ms",
    pipelineStep: "Cross-Engine Bayesian Consensus",
    component: ThreeDRiskPolyhedron,
  },
};

const navigationTabs = [
  { id: "identity", code: "01", label: "IDENTITY GUARDIAN", icon: Fingerprint, color: "#00e5ff" },
  { id: "document", code: "02", label: "DOCUMENT VERIFIER", icon: FileSearch, color: "#10b981" },
  { id: "media", code: "03", label: "MEDIA TRUTH", icon: ScanLine, color: "#8b5cf6" },
  { id: "source", code: "04", label: "SOURCE TRACKER", icon: LockKeyhole, color: "#ffb547" },
  { id: "risk", code: "05", label: "RISK ANALYZER", icon: Activity, color: "#ff7a24" },
];

export default function EnginePage() {
  const { engine } = useParams();
  const engineKey = String(engine).toLowerCase();
  const current = engineConfig[engineKey] || engineConfig.document;
  const Visualizer = current.component;
  const Icon = current.icon;

  const [animateIn, setAnimateIn] = useState(false);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleRunDiagnostic = () => {
    soundManager.playLaserScan();
    setIsRunningTest(true);
    setTestResult(null);

    setTimeout(() => {
      setIsRunningTest(false);
      setTestResult(current.verdict);
      soundManager.playSuccess();
    }, 1800);
  };

  return (
    <div
      className={`space-y-6 transition-all duration-700 ${
        animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          Top Engine Navigation Tabs
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-white/[0.06]">
        {navigationTabs.map((tab) => {
          const isActive = engineKey === tab.id;
          const TabIcon = tab.icon;
          return (
            <Link
              key={tab.id}
              href={`/app/engines/${tab.id}`}
              onClick={() => soundManager.playBlip()}
              className={`group px-4 py-2 rounded-full border transition-all duration-300 flex items-center gap-2 ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 text-white shadow-lg font-bold border-cyan-400/60"
                  : "bg-white/[0.04] text-gray-400 border-white/[0.08] hover:text-white hover:border-white/20 hover:bg-white/[0.08]"
              }`}
              style={
                isActive
                  ? {
                      borderColor: `${tab.color}70`,
                      boxShadow: `0 0 16px ${tab.color}25`,
                    }
                  : undefined
              }
            >
              <span
                className="text-[10px] font-bold"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  color: isActive ? tab.color : "#6b7280",
                  letterSpacing: "0.1em",
                }}
              >
                {tab.code}
              </span>
              <TabIcon
                className="w-3.5 h-3.5 transition-colors"
                style={{ color: isActive ? tab.color : "#9ca3af" }}
              />
              <span
                className="text-[11px] tracking-wider"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  letterSpacing: "0.12em",
                  color: isActive ? "#ffffff" : undefined,
                }}
              >
                {tab.label}
              </span>
              {isActive && (
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse ml-0.5"
                  style={{ backgroundColor: tab.color }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          Engine Hero Panel with Subtle Gradient Background
      ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className={`relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-br ${current.gradientBg} p-6 sm:p-7 transition-all duration-300 hover:border-white/[0.1]`}
      >
        {/* Subtle decorative background ambient glow */}
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: current.color }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            {/* Status & Taxonomy Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/40 border border-white/[0.08]"
                style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, letterSpacing: "0.15em" }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: current.color, boxShadow: `0 0 10px ${current.color}` }}
                />
                <span style={{ color: current.color }}>{current.engineCode}</span>
                <span className="text-gray-500">/</span>
                <span className="text-gray-300">{current.tag}</span>
              </div>

              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, letterSpacing: "0.15em" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>ONLINE [99.98%]</span>
              </div>

              <div
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-gray-400"
                style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, letterSpacing: "0.12em" }}
              >
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span>WEBGL 2.0 GLSL 3.0</span>
              </div>
            </div>

            {/* Engine Title */}
            <div className="flex items-center gap-3.5 pt-1">
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center bg-black/50 border shrink-0 transition-transform hover:scale-105"
                style={{
                  borderColor: `${current.color}40`,
                  boxShadow: `0 0 18px ${current.color}20`,
                }}
              >
                <Icon className="w-6 h-6" style={{ color: current.color }} />
              </div>
              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {current.name}
              </h1>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
              {current.desc}
            </p>

            {/* Live Telemetry Micro-Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-gray-400">
              <div className="flex items-center gap-1.5">
                <span
                  className="text-gray-500 uppercase text-[9px]"
                  style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.1em" }}
                >
                  PIPELINE:
                </span>
                <span className="text-gray-200 font-medium">{current.pipelineStep}</span>
              </div>
              <span className="text-gray-700">•</span>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-gray-500 uppercase text-[9px]"
                  style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.1em" }}
                >
                  LATENCY:
                </span>
                <span className="text-emerald-400 font-mono">{current.latency}</span>
              </div>
              <span className="text-gray-700">•</span>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-gray-500 uppercase text-[9px]"
                  style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.1em" }}
                >
                  CONFIDENCE:
                </span>
                <span className="text-cyan-400 font-mono font-bold">{current.confidence}</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={handleRunDiagnostic}
              disabled={isRunningTest}
              className="px-5 py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 text-black shadow-lg"
              style={{
                backgroundColor: current.color,
                boxShadow: `0 0 24px ${current.glowColor}`,
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: "0.08em",
              }}
            >
              {isRunningTest ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin text-black" />
                  <span>EXECUTING SCAN...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black text-black" />
                  <span>RUN DIAGNOSTIC</span>
                </>
              )}
            </button>

            <Link
              href="/app/investigations/new"
              onClick={() => soundManager.playModeSwitch()}
              className="px-4 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-cyan-400/40 text-gray-300 hover:text-white text-xs flex items-center justify-center gap-2 transition-all duration-300"
              style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.06em", fontSize: 10 }}
            >
              <span>NEW INVESTIGATION</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          Main Grid: 3D Visualizer Viewport + Capabilities Specification Matrix
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── 3D WebGL Canvas Viewport (2 Cols) ─── */}
        <div
          className="lg:col-span-2 rounded-xl liquid-glass border flex flex-col justify-between overflow-hidden p-5 sm:p-6 transition-all duration-300"
          style={{
            borderColor: `${current.color}45`,
            boxShadow: `0 0 35px ${current.glowColor}`,
          }}
        >
          <div>
            {/* Viewport Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: current.color }}
                />
                <span
                  className="text-white text-xs font-bold"
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    letterSpacing: "0.14em",
                  }}
                >
                  3D INTERACTIVE WEBGL DISSECTION VIEWPORT
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] text-gray-400 px-2.5 py-1 rounded bg-black/40 border border-white/[0.06]"
                  style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.1em" }}
                >
                  ORBIT: DRAG • ZOOM: SCROLL
                </span>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

            {/* Viewport Canvas Frame with Prominent Border */}
            <div className="relative w-full h-[440px] rounded-xl overflow-hidden bg-[#030508] border border-white/[0.08] shadow-inner">
              {/* Corner reticle marks */}
              <div className="absolute top-2 left-2 z-10 w-2.5 h-2.5 border-t border-l border-cyan-400/60 pointer-events-none" />
              <div className="absolute top-2 right-2 z-10 w-2.5 h-2.5 border-t border-r border-cyan-400/60 pointer-events-none" />
              <div className="absolute bottom-2 left-2 z-10 w-2.5 h-2.5 border-b border-l border-cyan-400/60 pointer-events-none" />
              <div className="absolute bottom-2 right-2 z-10 w-2.5 h-2.5 border-b border-r border-cyan-400/60 pointer-events-none" />

              {/* Engine Watermark / Shader Tag */}
              <div
                className="absolute bottom-3 right-3 z-10 px-2 py-0.5 rounded bg-black/70 border border-white/[0.08] text-[9px] text-gray-400 pointer-events-none select-none"
                style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.12em" }}
              >
                SHADER: GLSL_V2 // 60 FPS
              </div>

              {/* 3D WebGL Canvas */}
              <Visualizer />
            </div>
          </div>

          {/* Diagnostic Result Callout */}
          {testResult && (
            <div
              className="mt-5 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{
                backgroundColor: `${current.color}10`,
                borderColor: `${current.color}60`,
                boxShadow: `0 0 20px ${current.color}20`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${current.color}25` }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: current.color }} />
                </div>
                <div>
                  <div
                    className="text-[10px] font-bold"
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      letterSpacing: "0.15em",
                      color: current.color,
                    }}
                  >
                    DIAGNOSTIC VERDICT CAPTURED
                  </div>
                  <div className="text-white text-xs sm:text-sm font-semibold tracking-wide">
                    {testResult}
                  </div>
                </div>
              </div>

              <Link
                href="/app/investigations/new"
                onClick={() => soundManager.playModeSwitch()}
                className="px-4 py-2 rounded-lg bg-black/60 hover:bg-black/90 border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto shrink-0"
                style={{
                  borderColor: `${current.color}60`,
                  color: current.color,
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.06em",
                }}
              >
                <span>VERIFY IN LIVE CASE</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* ─── Engine Capability Matrix & Specifications (1 Col) ─── */}
        <div className="p-6 rounded-3xl liquid-glass border border-white/[0.08] flex flex-col justify-between space-y-6">
          <div>
            {/* Header */}
            <div className="mb-5 pb-4 border-b border-white/[0.06]">
              <span
                className="text-[10px] font-bold block mb-1 uppercase tracking-widest"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  letterSpacing: "0.18em",
                  color: current.color,
                }}
              >
                CAPABILITY MATRIX
              </span>
              <h3
                className="text-xl font-bold text-white tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Core Specifications
              </h3>
            </div>

            {/* Redesigned Capabilities List with High Hierarchy */}
            <div className="space-y-2.5 mb-6">
              {current.capabilities.map((cap: string, i: number) => (
                <div
                  key={cap}
                  className="group p-3 rounded-lg bg-[#030508] border border-white/[0.05] hover:border-white/[0.15] transition-all duration-200 flex items-start gap-3"
                >
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      backgroundColor: `${current.color}15`,
                      color: current.color,
                      border: `1px solid ${current.color}35`,
                    }}
                  >
                    0{i + 1}
                  </div>
                  <span className="text-gray-300 text-xs leading-relaxed group-hover:text-white transition-colors">
                    {cap}
                  </span>
                </div>
              ))}
            </div>

            {/* Runtime Execution Parameters */}
            <div className="p-4 rounded-lg bg-[#030508] border border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span
                  className="text-gray-400 text-[10px] uppercase"
                  style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.1em" }}
                >
                  SAMPLE ARTIFACT:
                </span>
                <span className="text-white font-mono text-[11px] font-bold truncate max-w-[170px]">
                  {current.sampleArtifact}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span
                  className="text-gray-400 text-[10px] uppercase"
                  style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.1em" }}
                >
                  SHADER TARGET:
                </span>
                <span
                  className="font-mono text-[11px] font-bold"
                  style={{ color: current.color }}
                >
                  WebGL 2.0 GLSL ES
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span
                  className="text-gray-400 text-[10px] uppercase"
                  style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.1em" }}
                >
                  FASTAPI ENDPOINT:
                </span>
                <span className="text-emerald-400 font-mono text-[11px] font-bold">
                  Port 8000 (Active)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span
                  className="text-gray-400 text-[10px] uppercase"
                  style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.1em" }}
                >
                  CLASSIFICATION:
                </span>
                <span className="text-gray-300 font-mono text-[11px]">
                  Court-Admissible EAL4+
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-white/[0.06]">
            <Link
              href="/app/investigations/new"
              onClick={() => soundManager.playModeSwitch()}
              className="w-full py-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] hover:border-cyan-400/50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-sm"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: "0.08em",
              }}
            >
              <span>INGEST EVIDENCE FOR THIS ENGINE</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          Laundered Fakes & Lying Metadata Shield Widget (Media Engine)
      ═══════════════════════════════════════════════════════════════════════ */}
      {engineKey === "media" && (
        <div className="mt-8 transition-all duration-500">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
            <span
              className="text-[10px] text-violet-400 uppercase font-bold"
              style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.18em" }}
            >
              INTEGRATED DEFENSE SUBSYSTEM // MEDIA TRUTH ENGINE
            </span>
          </div>
          <LaunderedFakesShield />
        </div>
      )}
    </div>
  );
}
