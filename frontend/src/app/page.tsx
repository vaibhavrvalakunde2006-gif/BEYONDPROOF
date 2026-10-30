"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Fingerprint,
  FileSearch,
  ScanLine,
  LockKeyhole,
  Network,
  ShieldCheck,
  AudioWaveform,
  ArrowUpRight,
  Shield,
  Activity,
  Terminal,
  Radio,
  CheckCircle2,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { soundManager } from "@/lib/soundFx";
import ThreeDCard from "@/components/3d/ThreeDCard";

// Dynamically import the 3D Holodeck Hero with SSR disabled for WebGL
const ForensicHolodeckHero = dynamic(
  () => import("@/components/3d/ForensicHolodeckHero"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] flex flex-col items-center justify-center bg-black/90 text-cyan-400 font-mono text-xs gap-3">
        <div className="w-10 h-10 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        <span>INITIALIZING 3D FORENSIC COMMAND STAGE...</span>
      </div>
    ),
  }
);

const engines = [
  {
    id: "identity",
    num: "01",
    name: "Identity Guardian",
    badge: "BIOMETRIC & MRZ",
    desc: "ICAO 9303 checksum validation, 68-point 3D facial wireframe analysis, and synthetic spoofing detection.",
    icon: Fingerprint,
    color: "#00e5ff",
    href: "/app/engines/identity",
  },
  {
    id: "document",
    num: "02",
    name: "Document Verifier",
    badge: "PDF STRUCTURE & EXIF",
    desc: "Exploded 3D document inspection, font glyph inconsistency analysis, and post-signature modification tracking.",
    icon: FileSearch,
    color: "#10b981",
    href: "/app/engines/document",
  },
  {
    id: "media",
    num: "03",
    name: "Media Truth Engine",
    badge: "SPECTRAL ELA & FREQ",
    desc: "Topological recompression error level heightmap, audio spectrogram diffusion, and generative AI boundary detection.",
    icon: ScanLine,
    color: "#8b5cf6",
    href: "/app/engines/media",
  },
  {
    id: "source",
    num: "04",
    name: "Source Tracker",
    badge: "pHash & C2PA PROVENANCE",
    desc: "Perceptual optical hashing, cryptographic SHA-256 fingerprinting, and decentralized immutable ledger tracking.",
    icon: LockKeyhole,
    color: "#ffb547",
    href: "/app/engines/source",
  },
  {
    id: "trust-graph",
    num: "05",
    name: "Trust Graph Explorer",
    badge: "3D NETWORK TOPOLOGY",
    desc: "Spatial 3D force-directed knowledge graph revealing syndicates, shared metadata signatures, and fraud clusters.",
    icon: Network,
    color: "#38bdf8",
    href: "/app/trust-graph",
  },
  {
    id: "risk",
    num: "06",
    name: "AI Risk Analyzer",
    badge: "BAYESIAN THREAT ENGINE",
    desc: "Multi-signal severity weighting, conflict resolution, uncertainty quantification, and explainable forensic scoring.",
    icon: Activity,
    color: "#ff7a24",
    href: "/app/engines/risk",
  },
  {
    id: "verification",
    num: "07",
    name: "Evidence Workspace",
    badge: "COURT-READY DOSSIER",
    desc: "Unified intake chamber, cryptographic chain-of-custody tracking, and automated certified PDF report generation.",
    icon: AudioWaveform,
    color: "#06b6d4",
    href: "/app/dashboard",
  },
];

export default function Home() {
  const [hoveredEngine, setHoveredEngine] = useState<string | null>(null);

  const handleNavClick = () => {
    soundManager.playBlip();
  };

  return (
    <main className="min-h-screen bg-[#05070b] text-[#edf3fb] selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sleek Tactical Global Topbar */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-[#070a0f]/80 backdrop-blur-md border-b border-white/[0.08] px-6 lg:px-12 flex items-center justify-between">
        <Link
          href="/"
          onClick={handleNavClick}
          className="flex items-center gap-2.5 font-bold tracking-wider text-sm lg:text-base"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
            <Fingerprint className="w-5 h-5" />
          </div>
          <span>
            BEYOND<span className="text-cyan-400">PROOF</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hidden sm:inline-block">
            v2.4 FORENSIC OS
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-gray-400">
          <a
            href="#holodeck"
            onClick={handleNavClick}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>3D Command Holodeck</span>
          </a>
          <a
            href="#engines"
            onClick={handleNavClick}
            className="hover:text-cyan-400 transition-colors"
          >
            Forensic Engines
          </a>
          <a
            href="#pipeline"
            onClick={handleNavClick}
            className="hover:text-cyan-400 transition-colors"
          >
            Evidence Pipeline
          </a>
          <a
            href="#telemetry"
            onClick={handleNavClick}
            className="hover:text-cyan-400 transition-colors"
          >
            Live Telemetry
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            onClick={handleNavClick}
            className="text-xs font-mono text-gray-300 hover:text-white px-3 py-1.5 rounded transition-colors hidden sm:inline-block"
          >
            Sign in
          </Link>
          <Link
            href="/app/dashboard"
            onClick={() => {
              soundManager.playModeSwitch();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-400 text-black font-bold text-xs hover:brightness-110 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all transform hover:-translate-y-0.5"
          >
            <span>Enter Workspace</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero: 3D Forensic Command Holodeck Section */}
      <div id="holodeck" className="pt-16">
        <ForensicHolodeckHero />
      </div>

      {/* Section 1: The 7-Engine 3D Interactive Matrix */}
      <section id="engines" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/[0.08] pb-8">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>THE FORENSIC CORE / 07 MODULAR ENGINES</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Seven Specialized Engines.
              <br />
              <span className="text-cyan-400">One Unified Truth.</span>
            </h2>
          </div>
          <p className="text-gray-400 text-sm max-w-md font-mono leading-relaxed">
            Every file undergoes comprehensive multi-spectral forensic dissection across biometrics, metadata, perceptual frequency, and distributed ledger provenance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {engines.map((eng) => {
            const Icon = eng.icon;
            return (
              <ThreeDCard
                key={eng.id}
                href={eng.href}
                glowColor={eng.color}
                className="p-6 bg-gradient-to-b from-[#0e141f] to-[#080d14]"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-6">
                    <span className="text-gray-500 font-bold">{eng.num} / CORE</span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-semibold border"
                      style={{
                        borderColor: `${eng.color}40`,
                        backgroundColor: `${eng.color}15`,
                        color: eng.color,
                      }}
                    >
                      {eng.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5 group-hover:border-cyan-400/50 group-hover:bg-cyan-500/10 transition-colors">
                    <Icon className="w-6 h-6 text-white group-hover:text-cyan-400 transition-colors" />
                  </div>

                  <h3
                    className="text-xl font-bold mb-3 tracking-wide text-white group-hover:text-cyan-300 transition-colors"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {eng.name}
                  </h3>

                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-6 font-mono">
                    {eng.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-gray-400 group-hover:text-cyan-400 transition-colors">
                  <span>LAUNCH 3D ENGINE</span>
                  <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </ThreeDCard>
            );
          })}
        </div>
      </section>

      {/* Section 2: Real-Time Global Telemetry & Radar Stream */}
      <section id="telemetry" className="py-20 border-y border-white/[0.08] bg-[#070b12]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>CRYPTOGRAPHIC LEDGER & SHADER PIPELINE</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl font-bold"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Live Anomaly Telemetry
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono bg-black/50 border border-white/10 px-4 py-2 rounded-lg text-gray-400">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>STATUS: FASTAPI 8000 STREAMING</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 font-mono">
            <div className="p-5 rounded-xl bg-black/60 border border-white/[0.08]">
              <span className="text-[11px] text-gray-500 uppercase block mb-1">
                EVIDENCE PROCESSED
              </span>
              <span className="text-3xl font-bold text-white block mb-1">1,482</span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 100% SHA-256 Verified
              </span>
            </div>

            <div className="p-5 rounded-xl bg-black/60 border border-white/[0.08]">
              <span className="text-[11px] text-gray-500 uppercase block mb-1">
                DEEPFAKE SYNTHETICS
              </span>
              <span className="text-3xl font-bold text-amber-400 block mb-1">347</span>
              <span className="text-[11px] text-gray-400">
                Flagged via Spectral ELA
              </span>
            </div>

            <div className="p-5 rounded-xl bg-black/60 border border-white/[0.08]">
              <span className="text-[11px] text-gray-500 uppercase block mb-1">
                DOCUMENTS DISSECTED
              </span>
              <span className="text-3xl font-bold text-cyan-400 block mb-1">892</span>
              <span className="text-[11px] text-gray-400">
                PDF & Certified Signatures
              </span>
            </div>

            <div className="p-5 rounded-xl bg-black/60 border border-white/[0.08]">
              <span className="text-[11px] text-gray-500 uppercase block mb-1">
                MEAN ANALYSIS LATENCY
              </span>
              <span className="text-3xl font-bold text-violet-400 block mb-1">
                1.42s
              </span>
              <span className="text-[11px] text-gray-400">
                GPU Accelerated Multi-Engine
              </span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-black/80 border border-cyan-500/20 font-mono text-xs text-gray-300 overflow-x-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 text-gray-500 text-[11px] mb-3">
              <span>TIMESTAMP [UTC]</span>
              <span>FORENSIC ARTIFACT</span>
              <span>ENGINE ROUTE</span>
              <span>SHA-256 DIGEST</span>
              <span>VERDICT</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-1.5 hover:bg-white/[0.02] px-2 rounded">
                <span className="text-gray-500">2026-10-31 00:14:02</span>
                <span className="text-white">FRA_PASSPORT_EXP2028.IMG</span>
                <span className="text-cyan-400">IDENTITY GUARDIAN</span>
                <span className="text-gray-400">9a8b1c4d...a0b3c</span>
                <span className="px-2 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-red-300 font-bold">
                  FORGERY CONFIRMED
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 hover:bg-white/[0.02] px-2 rounded">
                <span className="text-gray-500">2026-10-31 00:13:48</span>
                <span className="text-white">CFO_WIRE_AUTHORIZATION.WAV</span>
                <span className="text-purple-400">MEDIA TRUTH</span>
                <span className="text-gray-400">4f7a2b9c...2d4e6</span>
                <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold">
                  DEEPFAKE SYNTHETIC
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 hover:bg-white/[0.02] px-2 rounded">
                <span className="text-gray-500">2026-10-31 00:12:11</span>
                <span className="text-white">VENDOR_CERTIFICATE_ACME.PDF</span>
                <span className="text-emerald-400">DOCUMENT VERIFIER</span>
                <span className="text-gray-400">e1d2c3b4...1a2b3</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold">
                  AUTHENTIC VALIDATED
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Evidence Pipeline Visualizer */}
      <section id="pipeline" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono uppercase mb-4">
            <span>CHAIN OF CUSTODY INTEGRITY</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            From Ingestion to Courtroom Dossier
          </h2>
          <p className="text-gray-400 text-sm font-mono leading-relaxed">
            Every step is recorded with cryptographic hashing, deterministic reproducibility, and zero human bias.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 font-mono">
          {[
            {
              step: "01",
              title: "INTAKE CHAMBER",
              desc: "Drag files into 3D laser chamber; SHA-256 generated instantly.",
            },
            {
              step: "02",
              title: "METADATA EXTRACTION",
              desc: "EXIF, XMP, ICC profiles, GPS coordinates, and PDF xref streams.",
            },
            {
              step: "03",
              title: "SPECTRAL DISSECTION",
              desc: "Error Level Analysis, DCT frequencies, and waveform diffusion.",
            },
            {
              step: "04",
              title: "CROSS CORRELATION",
              desc: "NetworkX graph synthesis linking identities, hashes, and actors.",
            },
            {
              step: "05",
              title: "BAYESIAN RISK",
              desc: "Probabilistic uncertainty scoring across contradictory indicators.",
            },
            {
              step: "06",
              title: "PDF DOSSIER",
              desc: "Court-ready certified report with digital audit trail.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-5 rounded-xl bg-[#090e17] border border-white/[0.08] flex flex-col justify-between hover:border-cyan-400/50 transition-colors group"
            >
              <div>
                <span className="text-cyan-400 font-bold text-sm block mb-2">
                  {item.step} //
                </span>
                <h4 className="text-white text-xs font-bold uppercase mb-2 group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h4>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 border-t border-white/[0.08] bg-gradient-to-b from-transparent to-[#04060a] text-center px-6">
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Ready to Verify with Certainty?
          </h2>
          <p className="text-gray-400 text-sm font-mono mb-8">
            Step into the BEYONDPROOF 3D Digital Forensics Platform and audit evidence in real time.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/app/investigations/new"
              onClick={() => soundManager.playModeSwitch()}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-black font-bold text-sm hover:brightness-110 shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>Launch Evidence Intake</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/app/dashboard"
              onClick={() => soundManager.playBlip()}
              className="px-6 py-3.5 rounded-xl bg-white/[0.06] border border-white/20 text-white font-bold text-sm hover:bg-white/[0.1] hover:border-cyan-400/50 transition-all flex items-center gap-2 font-mono"
            >
              <span>Command Centre</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Sleek Monospace Footer */}
      <footer className="py-8 px-6 lg:px-12 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-gray-500 gap-4">
        <div className="flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-cyan-400" />
          <span className="text-white font-bold">BEYONDPROOF</span>
          <span>// Beyond Trust. Beyond Doubt.</span>
        </div>
        <div>
          <span>BUILT BY BBC — BUILT BEYOND CODE</span>
        </div>
        <div>
          <span>&copy; 2026 BEYONDPROOF INC. ALL RIGHTS RESERVED.</span>
        </div>
      </footer>
    </main>
  );
}
