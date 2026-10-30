"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowUpRight,
  Plus,
  FileSearch,
  ShieldCheck,
  Clock3,
  Activity,
  Network,
  ScanLine,
  Zap,
  Radio,
  Fingerprint,
  LockKeyhole,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { soundManager } from "@/lib/soundFx";
import ThreeDCard from "@/components/3d/ThreeDCard";

// Dynamically load the 3D Integrity Core for the dashboard
const ThreeDIntegrityCore = dynamic(
  () => import("@/components/3d/ThreeDIntegrityCore"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[460px] flex flex-col items-center justify-center bg-black/60 rounded-2xl border border-cyan-500/20 text-cyan-400 font-mono text-xs gap-3">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        <span>INITIALIZING 3D INTEGRITY CORE & SATELLITE ENGINES...</span>
      </div>
    ),
  }
);

const recentCases = [
  {
    id: "INV-2026-0042",
    file: "Vendor_Certificate.pdf",
    assessment: "SUSPICIOUS",
    riskColor: "text-amber-400 bg-amber-950/50 border-amber-500/40",
    time: "12 min ago",
    sha256: "e1d2c3b4a5f6...",
    engine: "Document Verifier",
  },
  {
    id: "INV-2026-0041",
    file: "campaign-video.mp4",
    assessment: "UNVERIFIED",
    riskColor: "text-gray-300 bg-gray-900 border-gray-700",
    time: "Yesterday",
    sha256: "4f7a2b9c1d6e...",
    engine: "Media Truth Engine",
  },
  {
    id: "INV-2026-0039",
    file: "identity_scan.png",
    assessment: "LOW RISK",
    riskColor: "text-emerald-400 bg-emerald-950/50 border-emerald-500/40",
    time: "Oct 28",
    sha256: "9a8b1c4d7e2f...",
    engine: "Identity Guardian",
  },
  {
    id: "INV-2026-0038",
    file: "executive-audio.wav",
    assessment: "SUSPICIOUS",
    riskColor: "text-amber-400 bg-amber-950/50 border-amber-500/40",
    time: "Oct 27",
    sha256: "3b5c7d9e1f2a...",
    engine: "Media Truth Engine",
  },
];

export default function Dashboard() {
  const [showCoreInfo, setShowCoreInfo] = useState(true);

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>COMMAND CENTRE / MASTER WORKSPACE</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Forensic Command <span className="text-cyan-400">Centre.</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm font-mono mt-1">
            Real-time multi-spectral evidence monitoring and holographic engine telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/trust-graph"
            onClick={() => soundManager.playBlip()}
            className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 hover:border-cyan-400/40 text-xs font-mono text-gray-300 hover:text-white flex items-center gap-2 transition-colors"
          >
            <Network className="w-4 h-4 text-cyan-400" />
            <span>3D Trust Graph</span>
          </Link>

          <Link
            href="/app/investigations/new"
            onClick={() => soundManager.playModeSwitch()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:brightness-110 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Investigation</span>
          </Link>
        </div>
      </div>

      {/* 3D Interactive Integrity Core Stage */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#0a101b] via-[#070b13] to-[#04070d] border border-cyan-500/30 overflow-hidden shadow-[0_0_50px_rgba(0,229,255,0.1)] p-6">
        <div className="flex items-center justify-between mb-4 z-10 relative">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono tracking-wide">
                3D FORENSIC INTEGRITY CORE &amp; ENGINE SATELLITES
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Drag to rotate 3D sphere — Click satellite nodes to open specialized engines
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              CORE SHADER: OPTIMAL
            </span>
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="relative w-full h-[460px] rounded-xl overflow-hidden border border-white/[0.06] bg-black/40">
          <ThreeDIntegrityCore />
        </div>
      </div>

      {/* 1-Click Judge Adversarial Attack Simulator Bar */}
      <div className="p-5 rounded-2xl bg-[#0a111b] border border-orange-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-white font-bold block">ADVERSARIAL ATTACK TEST BENCH</span>
            <span className="text-gray-400 text-[10px]">Inject simulated multi-spectral fraud vectors to stress-test forensic engines</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              soundManager.playLaserScan();
              setTimeout(() => soundManager.playAlertBuzz(), 800);
            }}
            className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-bold transition-all flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span>PASSPORT MRZ FORGERY</span>
          </button>

          <button
            onClick={() => {
              soundManager.playLaserScan();
              setTimeout(() => soundManager.playAlertBuzz(), 800);
            }}
            className="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 font-bold transition-all flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span>SYNTHETIC VOICE DEEPFAKE</span>
          </button>

          <button
            onClick={() => {
              soundManager.playLaserScan();
              setTimeout(() => soundManager.playAlertBuzz(), 800);
            }}
            className="px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 font-bold transition-all flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>SPLICED PDF CONTRACT</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards with 3D Perspective Tilt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <ThreeDCard glowColor="#00e5ff" className="p-5 bg-[#090e17]">
          <span className="text-[11px] text-gray-500 uppercase block mb-1">
            TOTAL INVESTIGATIONS
          </span>
          <span className="text-3xl font-bold text-white block mb-1">24</span>
          <span className="text-[11px] text-cyan-400 flex items-center gap-1.5">
            <Activity className="w-3 h-3" /> Active Case Files
          </span>
        </ThreeDCard>

        <ThreeDCard glowColor="#10b981" className="p-5 bg-[#090e17]">
          <span className="text-[11px] text-gray-500 uppercase block mb-1">
            FILES ANALYSED
          </span>
          <span className="text-3xl font-bold text-white block mb-1">38</span>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1.5">
            <FileSearch className="w-3 h-3" /> Across 7 Forensic Engines
          </span>
        </ThreeDCard>

        <ThreeDCard glowColor="#ffb547" className="p-5 bg-[#090e17]">
          <span className="text-[11px] text-gray-500 uppercase block mb-1">
            REPORTS GENERATED
          </span>
          <span className="text-3xl font-bold text-white block mb-1">16</span>
          <span className="text-[11px] text-amber-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" /> SHA-256 Verified PDFs
          </span>
        </ThreeDCard>

        <ThreeDCard glowColor="#00e5ff" className="p-5 bg-[#090e17]">
          <span className="text-[11px] text-gray-500 uppercase block mb-1">
            ACTIVE 3D ENGINES
          </span>
          <span className="text-3xl font-bold text-white block mb-1">07</span>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            WebGL 2.0 Operational
          </span>
        </ThreeDCard>
      </div>

      {/* Grid: Recent Investigations & Quick Engine Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases Table (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#090e17] border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
              <div>
                <span className="text-cyan-400 text-xs font-mono block mb-1 uppercase tracking-wider">
                  LATEST EVIDENCE LEDGER
                </span>
                <h3
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Recent Investigations
                </h3>
              </div>
              <Link
                href="/app/history"
                onClick={() => soundManager.playBlip()}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <span>View Full Archive</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto font-mono text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 border-b border-white/[0.06] text-[11px]">
                    <th className="pb-3">CASE ID</th>
                    <th className="pb-3">EVIDENCE FILE</th>
                    <th className="pb-3">ENGINE</th>
                    <th className="pb-3">ASSESSMENT</th>
                    <th className="pb-3">UPDATED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {recentCases.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => {
                        soundManager.playBlip();
                      }}
                    >
                      <td className="py-3.5 font-bold text-cyan-400 group-hover:text-cyan-300">
                        {c.id}
                      </td>
                      <td className="py-3.5 text-white">{c.file}</td>
                      <td className="py-3.5 text-gray-400">{c.engine}</td>
                      <td className="py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${c.riskColor}`}
                        >
                          {c.assessment}
                        </span>
                      </td>
                      <td className="py-3.5 text-gray-500">{c.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Launch Engines (1 Col) */}
        <div className="p-6 rounded-2xl bg-[#090e17] border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="mb-6 pb-4 border-b border-white/[0.06]">
              <span className="text-cyan-400 text-xs font-mono block mb-1 uppercase tracking-wider">
                SPECIALIZED DISSECTION
              </span>
              <h3
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Launch 3D Engine
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <Link
                href="/app/engines/identity"
                onClick={() => soundManager.playBlip()}
                className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="text-white font-bold block group-hover:text-cyan-300 transition-colors">
                      Identity Guardian
                    </span>
                    <span className="text-[10px] text-gray-500">
                      68-Point 3D Face Wireframe & MRZ
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
              </Link>

              <Link
                href="/app/engines/document"
                onClick={() => soundManager.playBlip()}
                className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] hover:border-emerald-400/50 hover:bg-emerald-500/10 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <FileSearch className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-white font-bold block group-hover:text-emerald-300 transition-colors">
                      Document Verifier
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Exploded 3D PDF Layers & Signatures
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
              </Link>

              <Link
                href="/app/engines/media"
                onClick={() => soundManager.playBlip()}
                className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] hover:border-purple-400/50 hover:bg-purple-500/10 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <ScanLine className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="text-white font-bold block group-hover:text-purple-300 transition-colors">
                      Media Truth Engine
                    </span>
                    <span className="text-[10px] text-gray-500">
                      3D Spectral ELA Topological Terrain
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
              </Link>

              <Link
                href="/app/trust-graph"
                onClick={() => soundManager.playBlip()}
                className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Network className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="text-white font-bold block group-hover:text-cyan-300 transition-colors">
                      3D Trust Graph
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Spatial Evidence Syndicate Map
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
