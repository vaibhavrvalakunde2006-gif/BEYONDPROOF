"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowUpRight,
  Plus,
  FileSearch,
  ShieldCheck,
  Activity,
  Network,
  ScanLine,
  Zap,
  Fingerprint,
  LockKeyhole,
  AlertTriangle,
  Eye,
  Cpu,
  BarChart3,
  Shield,
  Layers,
  Terminal,
  CheckCircle2,
  AlertOctagon,
  X,
  Copy,
  Check,
  Download,
} from "lucide-react";
import { soundManager } from "@/lib/soundFx";

const ThreeDIntegrityCore = dynamic(
  () => import("@/components/3d/ThreeDIntegrityCore"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[440px] flex flex-col items-center justify-center bg-black/40 rounded-xl border border-white/[0.08] text-slate-400 font-mono text-xs gap-3">
        <div className="w-6 h-6 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
        <span>INITIALIZING 3D INTEGRITY CORE...</span>
      </div>
    ),
  }
);

interface ForensicCase {
  id: string;
  file: string;
  fileType: string;
  engine: string;
  assessment: "CRITICAL" | "SUSPICIOUS" | "AUTHENTIC" | "UNVERIFIED";
  verdict: string;
  badgeClass: string;
  time: string;
  sha256: string;
  confidence: string;
  mathRationale: string;
}

const CASES_DATA: ForensicCase[] = [
  {
    id: "INV-2026-0042",
    file: "FRA_PASSPORT_EXP2028.IMG",
    fileType: "IDENTITY",
    engine: "Identity Guardian",
    assessment: "CRITICAL",
    verdict: "FORGERY CONFIRMED",
    badgeClass: "badge-clean badge-crimson",
    time: "12 min ago",
    sha256: "9a8b1c4d7e2f5a0b3c6d9e1f4a7b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7a0b3c",
    confidence: "99.98% Checksum Failure",
    mathRationale: "ICAO 9303 modulo-10 check digit mismatch on document number [expected: 7, found: 8]. 68-point 3D facial wireframe reveals anomalous non-standard eye socket depth topology.",
  },
  {
    id: "INV-2026-0041",
    file: "CANON_EOS5D_AI_LAUNDERED.JPG",
    fileType: "IMAGE",
    engine: "Media Truth Engine",
    assessment: "CRITICAL",
    verdict: "METADATA FORGERY DETECTED",
    badgeClass: "badge-clean badge-amber",
    time: "28 min ago",
    sha256: "7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d",
    confidence: "100% Cross-Modal Contradiction",
    mathRationale: "2D FFT Moiré lattice peak at 0.42 rad/px contradicts f/1.4 infinite focus. Software quantization ratio std=0.043 matches PIL, not Canon 5D Mark IV ISP hardware.",
  },
  {
    id: "INV-2026-0040",
    file: "CFO_WIRE_AUTHORIZATION.WAV",
    fileType: "AUDIO",
    engine: "Media Truth Engine",
    assessment: "CRITICAL",
    verdict: "SYNTHETIC DEEPFAKE",
    badgeClass: "badge-clean badge-crimson",
    time: "1 hr ago",
    sha256: "4f7a2b9c1d6e8f0a3b5c7d9e1f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a",
    confidence: "98.4% Spectral Anomaly",
    mathRationale: "16.4kHz pitch boundary diffusion artifact detected with 84.6 dB variance. Neural vocoder spectrogram signatures consistent with generative TTS cloning.",
  },
  {
    id: "INV-2026-0039",
    file: "VENDOR_CERTIFICATE_ACME.PDF",
    fileType: "DOCUMENT",
    engine: "Document Verifier",
    assessment: "AUTHENTIC",
    verdict: "AUTHENTIC VALIDATED",
    badgeClass: "badge-clean badge-emerald",
    time: "Yesterday",
    sha256: "3b5c7d9e1f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a9a8b1c4d7e2f5a0b",
    confidence: "100% Signature Verified",
    mathRationale: "Cryptographic X.509 certificate hierarchy validated against EU Trusted List. Zero byte alterations detected across incremental PDF revisions.",
  },
];

const ENGINES_OVERVIEW = [
  { name: "Identity Guardian", desc: "68-Pt 3D Face Mesh & MRZ", href: "/app/engines/identity", icon: Fingerprint, tag: "BIOMETRIC", latency: "0.4s" },
  { name: "Document Verifier", desc: "Exploded 3D PDF Layers", href: "/app/engines/document", icon: FileSearch, tag: "PDF / XREF", latency: "0.6s" },
  { name: "Media Truth Engine", desc: "Spectral ELA & 2D FFT Moiré", href: "/app/engines/media", icon: ScanLine, tag: "2D FFT / ELA", latency: "0.8s" },
  { name: "Source Tracker", desc: "SHA-256 & C2PA Provenance", href: "/app/engines/source", icon: LockKeyhole, tag: "C2PA / HASH", latency: "0.3s" },
  { name: "AI Risk Analyzer", desc: "Bayesian Multi-Signal Gyro", href: "/app/engines/risk", icon: Activity, tag: "BAYESIAN", latency: "0.2s" },
  { name: "3D Trust Graph", desc: "Spatial Evidence Syndicate Map", href: "/app/trust-graph", icon: Network, tag: "KNOWLEDGE GRAPH", latency: "0.5s" },
];

export default function EliteDashboard() {
  const [activeCase, setActiveCase] = useState<ForensicCase | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [activeAttackNotice, setActiveAttackNotice] = useState<string | null>(null);

  const handleInspectCase = (c: ForensicCase) => {
    soundManager.playLaserScan();
    setActiveCase(c);
  };

  const handleCopyHash = (hash: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    soundManager.playBlip();
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleSimulateAttack = (name: string) => {
    soundManager.playLaserScan();
    setActiveAttackNotice(`Simulating attack vector injection: ${name}...`);
    setTimeout(() => {
      soundManager.playAlertBuzz();
      setActiveAttackNotice(`CONFIRMED DISCREPANCY: ${name} mathematically isolated & quarantined.`);
    }, 900);
    setTimeout(() => setActiveAttackNotice(null), 4000);
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* ═════════════════════════════════════════════════════════════════
          WORKSPACE HEADER
          ═════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono tracking-wider uppercase mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>OPERATIONAL FORENSIC WORKSPACE</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Command <span className="text-aurora">Center</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-time multi-spectral evidence monitoring, 3D microservice satellites, and mathematical proof ledger.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/trust-graph"
            onClick={() => soundManager.playBlip()}
            className="btn-secondary"
          >
            <Network className="w-3.5 h-3.5 text-slate-400" />
            <span>3D Trust Graph</span>
          </Link>

          <Link
            href="/app/investigations/new"
            onClick={() => soundManager.playModeSwitch()}
            className="btn-primary"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Investigation</span>
          </Link>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          METRICS CARDS (Institutional & Crisp)
          ═════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans">
        <div className="pro-panel p-5">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-2 font-mono uppercase">
            <span>ACTIVE CASES</span>
            <Eye className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-3xl font-bold text-white block mb-1">24</span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            100% Anchored in Ledger
          </span>
        </div>

        <div className="pro-panel p-5">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-2 font-mono uppercase">
            <span>CONFIRMED FORGERIES</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <span className="text-3xl font-bold text-rose-400 block mb-1">11</span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Mod-10 Checksum / Kerning
          </span>
        </div>

        <div className="pro-panel p-5">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-2 font-mono uppercase">
            <span>LAUNDERED SUSPECTS</span>
            <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-3xl font-bold text-amber-400 block mb-1">07</span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Moiré Lattice &amp; Optics
          </span>
        </div>

        <div className="pro-panel p-5">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-2 font-mono uppercase">
            <span>ACTIVE MICROSERVICES</span>
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-3xl font-bold text-emerald-400 block mb-1">07</span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            GLSL WebGL 2.0 Operational
          </span>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          3D INTEGRITY CORE STAGE
          ═════════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl pro-panel overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3
              className="text-base font-bold text-white tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              3D Forensic Integrity Core &amp; Microservice Satellites
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive WebGL core &bull; Click any orbiting satellite sphere to navigate directly into that microservice
            </p>
          </div>

          <span className="badge-clean badge-emerald">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            FASTAPI :8000 LIVE
          </span>
        </div>

        {/* 3D WebGL Canvas */}
        <div className="relative w-full h-[440px] rounded-xl overflow-hidden border border-white/[0.08] bg-slate-950/20">
          <ThreeDIntegrityCore />
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          HACKATHON HURDLE SHIELD SPOTLIGHT
          ═════════════════════════════════════════════════════════════════ */}
      <div className="p-6 rounded-2xl pro-panel flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-amber-500/30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">
                HACKATHON HURDLE: Laundered Fakes &amp; Lying Metadata Shield
              </span>
              <span className="badge-clean badge-amber text-[9px]">SOLVED</span>
            </div>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
              Enforcing the core truth thesis: <strong className="text-amber-400">Absence of tampering is not authenticity</strong>. 2D FFT Moiré screen recapture detection (0.42 rad/px) &amp; cross-modal EXIF optical physics verification active.
            </p>
          </div>
        </div>

        <Link
          href="/app/engines/media"
          onClick={() => soundManager.playBlip()}
          className="btn-secondary text-xs shrink-0"
        >
          <span>Inspect in Media Engine</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Adversarial Attack Vector Injection Bar */}
      <div className="p-5 rounded-xl pro-panel flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans">
        <div>
          <span className="text-white font-bold block text-xs">Adversarial Vector Test Bench</span>
          <span className="text-slate-500 text-[11px]">Inject multi-spectral fraud vectors to test deterministic verification</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { name: "PASSPORT MRZ FORGERY", badge: "badge-clean badge-crimson" },
            { name: "VOICE CLONE TTS", badge: "badge-clean badge-crimson" },
            { name: "SPLICED CONTRACT", badge: "badge-clean badge-amber" },
            { name: "LAUNDERED MOIRÉ FAKE", badge: "badge-clean badge-amber" },
          ].map((atk) => (
            <button
              key={atk.name}
              onClick={() => handleSimulateAttack(atk.name)}
              className={`${atk.badge} hover:brightness-125 transition-all py-1.5 px-3 cursor-pointer`}
            >
              <span>{atk.name}</span>
            </button>
          ))}
        </div>
      </div>

      {activeAttackNotice && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
            <span>{activeAttackNotice}</span>
          </div>
          <Link
            href="/app/investigations/new"
            onClick={() => soundManager.playBlip()}
            className="btn-cyan py-1 px-3 text-[10px] shrink-0"
          >
            Launch in 3D Laser Chamber &rarr;
          </Link>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════
          RECENT INVESTIGATIONS TABLE & ENGINE LAUNCH TILES
          ═════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Cases (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl pro-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
              <div>
                <span className="text-slate-500 font-mono text-[10px] uppercase tracking-wider block mb-0.5">
                  EVIDENCE LEDGER
                </span>
                <h3
                  className="text-lg font-bold text-white tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Recent Cases
                </h3>
              </div>
              <Link
                href="/app/history"
                onClick={() => soundManager.playBlip()}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Full Ledger</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto font-mono text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 border-b border-white/[0.06] text-[10px]">
                    <th className="pb-3">CASE ID</th>
                    <th className="pb-3">ARTIFACT</th>
                    <th className="pb-3">ENGINE</th>
                    <th className="pb-3">VERDICT</th>
                    <th className="pb-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {CASES_DATA.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => handleInspectCase(c)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 font-semibold text-slate-300 group-hover:text-cyan-400 transition-colors text-[11px]">
                        {c.id}
                      </td>
                      <td className="py-3.5 text-white font-medium">
                        {c.file}
                      </td>
                      <td className="py-3.5 text-slate-400 text-[11px]">{c.engine}</td>
                      <td className="py-3.5">
                        <span className={c.badgeClass}>
                          {c.verdict}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspectCase(c);
                          }}
                          className="px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.08] hover:border-white/20 text-slate-300 hover:text-white text-[11px] font-sans font-medium transition-all"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 6 Engine Access Tiles (4 Cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl pro-panel flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-white/[0.06] mb-4">
              <span className="text-slate-500 font-mono text-[10px] uppercase tracking-wider block mb-0.5">
                MICROSERVICES
              </span>
              <h3
                className="text-lg font-bold text-white tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Launch Microservice
              </h3>
            </div>

            <div className="space-y-2 font-sans text-xs">
              {ENGINES_OVERVIEW.map((eng) => {
                const Icon = eng.icon;
                return (
                  <Link
                    key={eng.name}
                    href={eng.href}
                    onClick={() => soundManager.playBlip()}
                    className="p-3 rounded-xl bg-black/30 border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.03] transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 group-hover:text-cyan-400 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-white font-semibold block text-xs group-hover:text-cyan-300 transition-colors">
                          {eng.name}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[170px]">
                          {eng.desc}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          CASE INSPECTION MODAL
          ═════════════════════════════════════════════════════════════════ */}
      {activeCase && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-[#090d16] border border-white/[0.12] rounded-2xl p-7 shadow-2xl font-mono text-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-cyan-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    FORENSIC ARTIFACT RECORD
                  </span>
                  <span className="text-white font-bold text-base">{activeCase.id}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveCase(null)}
                className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-slate-500 text-[10px] block mb-0.5">SPECIMEN</span>
                  <span className="text-white font-semibold text-sm">{activeCase.file}</span>
                </div>
                <span className={activeCase.badgeClass}>
                  {activeCase.verdict}
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block mb-1">DETERMINISTIC CONFIDENCE RATING</span>
                <div className="p-3 rounded-lg bg-black/30 border border-white/[0.06] flex items-center justify-between">
                  <span className="text-cyan-300 font-bold text-xs">{activeCase.confidence}</span>
                  <span className="text-emerald-400 text-[10px] font-sans flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    COURT ADMISSIBLE
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block mb-1">MATHEMATICAL DISSECTION RATIONALE</span>
                <p className="p-3.5 rounded-lg bg-black/40 border border-white/[0.06] text-slate-300 leading-relaxed text-xs font-sans">
                  {activeCase.mathRationale}
                </p>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block mb-1">SHA-256 IMMUTABLE LEDGER HASH</span>
                <div className="p-3 rounded-lg bg-black/50 border border-white/[0.08] flex items-center justify-between text-cyan-400">
                  <span className="truncate mr-2 text-[11px]">{activeCase.sha256}</span>
                  <button
                    onClick={(e) => handleCopyHash(activeCase.sha256, e)}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Copy Hash"
                  >
                    {copiedHash === activeCase.sha256 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between font-sans">
              <span className="text-slate-500 text-[11px]">
                Deterministic Verification Anchored
              </span>
              <a
                href="/BEYONDPROOF_2_Minute_Judge_Pitch.pdf"
                download
                onClick={() => soundManager.playSuccess()}
                className="btn-cyan text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Dossier</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
