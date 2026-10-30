"use client";

import React, { useState } from "react";
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
  UploadCloud,
  Info,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
} from "lucide-react";
import { soundManager } from "@/lib/soundFx";

// Dynamically import the 5 specialized 3D WebGL Engine Visualizers
const ThreeDFaceMesh = dynamic(
  () => import("@/components/3d/ThreeDFaceMesh"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[420px] flex items-center justify-center bg-black/40 text-cyan-400 font-mono text-xs">
        LOADING 3D BIOMETRIC MESH...
      </div>
    ),
  }
);

const ThreeDDocumentStack = dynamic(
  () => import("@/components/3d/ThreeDDocumentStack"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[420px] flex items-center justify-center bg-black/40 text-emerald-400 font-mono text-xs">
        LOADING 3D EXPLODED DOCUMENT STACK...
      </div>
    ),
  }
);

const ThreeDMediaTerrain = dynamic(
  () => import("@/components/3d/ThreeDMediaTerrain"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[420px] flex items-center justify-center bg-black/40 text-purple-400 font-mono text-xs">
        LOADING 3D SPECTRAL ELA TOPOLOGY...
      </div>
    ),
  }
);

const ThreeDProvenanceChain = dynamic(
  () => import("@/components/3d/ThreeDProvenanceChain"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[420px] flex items-center justify-center bg-black/40 text-amber-400 font-mono text-xs">
        LOADING 3D PROVENANCE CHAIN...
      </div>
    ),
  }
);

const ThreeDRiskPolyhedron = dynamic(
  () => import("@/components/3d/ThreeDRiskPolyhedron"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[420px] flex items-center justify-center bg-black/40 text-orange-400 font-mono text-xs">
        LOADING 3D THREAT POLYHEDRON...
      </div>
    ),
  }
);

const engineConfig: Record<string, any> = {
  identity: {
    name: "Identity Guardian",
    tag: "BIOMETRIC & MRZ VALIDATION",
    desc: "Investigate identity documents, passports, and biometrics for physical and digital tampering indicators.",
    color: "#00e5ff",
    icon: Fingerprint,
    capabilities: [
      "ICAO 9303 modulo-10 MRZ checksum validation",
      "68-point 3D facial landmark spatial wireframe",
      "Synthetic face mask & deepfake spoofing heatmaps",
      "Font geometry and microprint resolution verification",
    ],
    sampleArtifact: "FRA_PASSPORT_EXP2028.IMG",
    verdict: "FORGERY CONFIRMED (MRZ Checksum 8 vs 7)",
    component: ThreeDFaceMesh,
  },
  document: {
    name: "Document Verifier",
    tag: "PDF FORENSICS & XREF STREAMS",
    desc: "Inspect certificates, contracts, and legal documents for structural, visual, and metadata anomalies.",
    color: "#10b981",
    icon: FileSearch,
    capabilities: [
      "Exploded 3D PDF layer structural dissection",
      "Cross-reference (xref) stream incremental revision detection",
      "Font glyph mismatch and kerning anomaly extraction",
      "Cryptographic X.509 signature & QR hash validation",
    ],
    sampleArtifact: "MASTER_SERVICES_AGREEMENT.PDF",
    verdict: "CONTRACT SPLICED (Post-Signature Byte Overwrite)",
    component: ThreeDDocumentStack,
  },
  media: {
    name: "Media Truth Engine",
    tag: "SPECTRAL ERROR LEVEL ANALYSIS",
    desc: "Dissect images, video, and audio recordings for generative AI artifacts, compression mismatches, and synthetic waveforms.",
    color: "#8b5cf6",
    icon: ScanLine,
    capabilities: [
      "3D topological Error Level Analysis (ELA) heightmap",
      "Audio spectrogram pitch boundary diffusion detector",
      "Video temporal frame-to-frame optical flow consistency",
      "Diffusion model latent noise distribution scoring",
    ],
    sampleArtifact: "CFO_WIRE_AUTHORIZATION.WAV",
    verdict: "DEEPFAKE SYNTHETIC (16.4kHz Boundary Anomaly)",
    component: ThreeDMediaTerrain,
  },
  source: {
    name: "Source Tracker",
    tag: "pHash & PROVENANCE CHAIN",
    desc: "Inspect cryptographic integrity, perceptual hash distance, and C2PA verifiable digital provenance manifests.",
    color: "#ffb547",
    icon: LockKeyhole,
    capabilities: [
      "Deterministic SHA-256 fingerprint generation",
      "Perceptual DCT optical hashing (pHash) similarity",
      "Decentralized immutable ledger timestamping",
      "C2PA Content Credentials cryptographic manifest parser",
    ],
    sampleArtifact: "ASSET_PROVENANCE_LOG.C2PA",
    verdict: "PROVENANCE TAMPERED (Manifest Signature Broken)",
    component: ThreeDProvenanceChain,
  },
  risk: {
    name: "AI Risk Analyzer",
    tag: "BAYESIAN THREAT ENGINE",
    desc: "Combine cross-engine forensic findings into an explainable, evidence-backed Bayesian risk assessment.",
    color: "#ff7a24",
    icon: Activity,
    capabilities: [
      "Multi-signal Bayesian severity weighting",
      "Conflicting evidence resolution & consensus modeling",
      "Evidence coverage and uncertainty quantification",
      "Court-ready explainable forensic risk narrative",
    ],
    sampleArtifact: "CROSS_ENGINE_SYNTHESIS.JSON",
    verdict: "HIGH RISK CRITICAL (Score: 89.4/100)",
    component: ThreeDRiskPolyhedron,
  },
};

export default function EnginePage() {
  const { engine } = useParams();
  const engineKey = String(engine).toLowerCase();
  const current = engineConfig[engineKey] || engineConfig.document;
  const Visualizer = current.component;
  const Icon = current.icon;

  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

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
    <div className="space-y-8">
      {/* Top Engine Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-white/[0.08] font-mono text-xs">
        {[
          { id: "identity", label: "01. IDENTITY GUARDIAN" },
          { id: "document", label: "02. DOCUMENT VERIFIER" },
          { id: "media", label: "03. MEDIA TRUTH" },
          { id: "source", label: "04. SOURCE TRACKER" },
          { id: "risk", label: "05. RISK ANALYZER" },
        ].map((tab) => (
          <Link
            key={tab.id}
            href={`/app/engines/${tab.id}`}
            onClick={() => soundManager.playBlip()}
            className={`px-3.5 py-1.5 rounded-lg border transition-all ${
              engineKey === tab.id
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                : "bg-black/40 text-gray-400 border-white/[0.08] hover:text-white hover:border-white/20"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Engine Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase mb-2">
            <span
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: current.color }}
            />
            <span style={{ color: current.color }}>{current.tag}</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span>{current.name}</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm font-mono mt-1 max-w-2xl">
            {current.desc}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunDiagnostic}
            disabled={isRunningTest}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:brightness-110 transition-all disabled:opacity-50"
          >
            {isRunningTest ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning 3D Artifact...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Run Diagnostic Test</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 3D Engine Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D WebGL Canvas (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-b from-[#0a101b] via-[#070b13] to-[#04070d] border border-cyan-500/30 overflow-hidden shadow-[0_0_50px_rgba(0,229,255,0.1)] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs font-mono">
                <Icon className="w-4 h-4" style={{ color: current.color }} />
                <span className="text-white font-bold">
                  3D INTERACTIVE WEBGL DISSECTION VIEWPORT
                </span>
              </div>
              <span className="text-[11px] font-mono text-gray-400">
                DRAG TO ORBIT ? SCROLL TO ZOOM
              </span>
            </div>

            <div className="relative w-full h-[440px] rounded-xl overflow-hidden bg-black/60 border border-white/[0.06]">
              <Visualizer />
            </div>
          </div>

          {testResult && (
            <div className="mt-4 p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 font-mono text-xs flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2 text-cyan-300">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>DIAGNOSTIC VERDICT:</span>
                <span className="font-bold text-white">{testResult}</span>
              </div>
              <Link
                href="/app/investigations/new"
                className="text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Upload to verify</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Engine Capability Specifications (1 Col) */}
        <div className="p-6 rounded-2xl bg-[#090e17] border border-white/[0.08] flex flex-col justify-between font-mono text-xs">
          <div>
            <div className="mb-6 pb-4 border-b border-white/[0.06]">
              <span className="text-cyan-400 block mb-1 uppercase tracking-wider text-[11px]">
                CAPABILITY MATRIX
              </span>
              <h3
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Core Specifications
              </h3>
            </div>

            <div className="space-y-3 mb-6">
              {current.capabilities.map((cap: string, i: number) => (
                <div
                  key={cap}
                  className="p-3 rounded-lg bg-black/40 border border-white/[0.06] flex items-start gap-2.5 text-gray-300"
                >
                  <span className="text-cyan-400 font-bold">0{i + 1}.</span>
                  <span className="text-[11px] leading-relaxed">{cap}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-black/60 border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-gray-500 text-[11px]">
                <span>SAMPLE ARTIFACT:</span>
                <span className="text-white font-bold">{current.sampleArtifact}</span>
              </div>
              <div className="flex items-center justify-between text-gray-500 text-[11px]">
                <span>SHADER TARGET:</span>
                <span className="text-cyan-400 font-bold">WebGL 2.0 GLSL</span>
              </div>
              <div className="flex items-center justify-between text-gray-500 text-[11px]">
                <span>INTEGRATION:</span>
                <span className="text-emerald-400 font-bold">FastAPI Port 8000</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.06]">
            <Link
              href="/app/investigations/new"
              onClick={() => soundManager.playModeSwitch()}
              className="w-full py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all hover:border-cyan-400/50"
            >
              <span>Ingest Evidence For This Engine</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
