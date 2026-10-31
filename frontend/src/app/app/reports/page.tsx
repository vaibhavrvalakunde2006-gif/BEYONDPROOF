'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  ArrowUpRight,
  Shield,
  CheckCircle2,
  Lock,
  Sparkles,
  Printer,
  Copy,
  Check,
  Activity,
  FileCheck2,
  Layers,
  FileSearch,
  Scale,
  Zap,
} from 'lucide-react';
import { soundManager } from '@/lib/soundFx';

interface CertifiedReport {
  id: string;
  title: string;
  caseId: string;
  date: string;
  fileSize: string;
  pages: number;
  sha256: string;
  status: 'CERTIFIED COURT-READY' | 'ADMISSIBLE EVIDENCE';
  downloadUrl: string;
}

const mockReports: CertifiedReport[] = [
  {
    id: 'REP-2026-081',
    title: 'Counterfeit Passport MRZ Cryptographic Dissection Report',
    caseId: 'INV-2026-0042',
    date: 'Oct 31, 2026',
    fileSize: '2.4 MB',
    pages: 8,
    sha256: '9a8b1c4d7e2f5a0b3c6d9e1f4a7b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7a0b3c',
    status: 'CERTIFIED COURT-READY',
    downloadUrl: '/BEYONDPROOF_2_Minute_Judge_Pitch.pdf',
  },
  {
    id: 'REP-2026-080',
    title: 'Synthetic Voice Authorization Spectral ELA Topological Audit',
    caseId: 'INV-2026-0041',
    date: 'Oct 30, 2026',
    fileSize: '4.1 MB',
    pages: 14,
    sha256: '4f7a2b9c1d6e8f0a3b5c7d9e1f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a',
    status: 'CERTIFIED COURT-READY',
    downloadUrl: '/BEYONDPROOF_2_Minute_Judge_Pitch.pdf',
  },
  {
    id: 'REP-2026-079',
    title: 'Post-Signature PDF XRef Incremental Revision Proof Dossier',
    caseId: 'INV-2026-0040',
    date: 'Oct 29, 2026',
    fileSize: '1.8 MB',
    pages: 6,
    sha256: 'e1d2c3b4a5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    status: 'ADMISSIBLE EVIDENCE',
    downloadUrl: '/BEYONDPROOF_2_Minute_Judge_Pitch.pdf',
  },
  {
    id: 'REP-2026-078',
    title: 'BEYONDPROOF 2-Minute Executive Pitch & Architecture Brief',
    caseId: 'PITCH-2026-CORE',
    date: 'Oct 28, 2026',
    fileSize: '890 KB',
    pages: 4,
    sha256: '3b5c7d9e1f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a9a8b1c4d7e2f5a0b',
    status: 'CERTIFIED COURT-READY',
    downloadUrl: '/BEYONDPROOF_2_Minute_Judge_Pitch.pdf',
  },
];

export default function Reports() {
  const [animateIn, setAnimateIn] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [reportsList, setReportsList] = useState<CertifiedReport[]>(mockReports);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleGenerateNewReport = () => {
    soundManager.playLaserScan();
    setIsGenerating(true);
    setGenProgress(15);

    setTimeout(() => setGenProgress(55), 400);
    setTimeout(() => setGenProgress(88), 900);
    setTimeout(() => {
      setGenProgress(100);
      soundManager.playSuccessChime();

      const newReport: CertifiedReport = {
        id: `REP-2026-0${82 + reportsList.length - 4}`,
        title: 'Master Forensic Comprehensive Integrity Synthesis Dossier',
        caseId: 'INV-2026-0043',
        date: 'Just Now',
        fileSize: '3.6 MB',
        pages: 12,
        sha256: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
        status: 'CERTIFIED COURT-READY',
        downloadUrl: '/BEYONDPROOF_2_Minute_Judge_Pitch.pdf',
      };

      setReportsList([newReport, ...reportsList]);
      setIsGenerating(false);
      setGenProgress(0);
    }, 1500);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    soundManager.playBlip();
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div
      className={`space-y-6 select-none transition-all duration-700 ${
        animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {/* ═══════ Forensic Header ═══════ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-white/[0.06]">
        <div>
          <div
            className="flex items-center gap-2 text-[9px] uppercase mb-2 tracking-[0.2em]"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.7)] animate-pulse" />
            <span className="text-cyan-400">DOCUMENT CENTRE</span>
            <span className="text-gray-600">//</span>
            <span className="text-gray-400">COURT-ADMISSIBLE FORENSIC DOSSIERS</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Certified Forensic <span className="text-cyan-400">Reports.</span>
          </h1>
          <p
            className="text-gray-400 text-xs sm:text-sm mt-1.5"
            style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.04em', fontSize: 11 }}
          >
            Cryptographically sealed PDF dossiers engineered for judicial review, board arbitration, and insurer audits
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/history"
            onClick={() => soundManager.playBlip()}
            className="px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-cyan-400/30 text-[10px] text-gray-300 hover:text-white flex items-center gap-2 transition-all font-bold"
            style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em' }}
          >
            <span>EVIDENCE ARCHIVE</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
          </Link>

          <button
            onClick={handleGenerateNewReport}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-400 text-black font-bold text-[10px] flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.25)] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em' }}
          >
            <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>
              {isGenerating ? `SYNTHESIZING... ${genProgress}%` : 'GENERATE CERTIFIED DOSSIER'}
            </span>
          </button>
        </div>
      </div>

      {/* ═══════ Live Forensic Telemetry Strip ═══════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl liquid-glass border border-white/[0.06] hover:border-cyan-400/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[9px] uppercase tracking-[0.15em] text-gray-500"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              CERTIFIED DOSSIERS
            </span>
            <FileText className="w-3.5 h-3.5 text-cyan-400/60" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {reportsList.length}
            </span>
            <span
              className="text-[10px] text-cyan-400 flex items-center gap-1"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              COURT-READY
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl liquid-glass border border-white/[0.06] hover:border-emerald-400/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[9px] uppercase tracking-[0.15em] text-gray-500"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              LEGAL ADMISSIBILITY
            </span>
            <Scale className="w-3.5 h-3.5 text-emerald-400/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-bold text-emerald-400"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              100%
            </span>
            <span
              className="text-[10px] text-emerald-400/80"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              ISO 27037 ADHERENT
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl liquid-glass border border-white/[0.06] hover:border-amber-400/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[9px] uppercase tracking-[0.15em] text-gray-500"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              HMAC STAMPING SPEED
            </span>
            <Zap className="w-3.5 h-3.5 text-amber-400/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-bold text-amber-400"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              1.4s
            </span>
            <span
              className="text-[10px] text-amber-400/80"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              HARDWARE MSAA
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl liquid-glass border border-white/[0.06] hover:border-violet-400/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[9px] uppercase tracking-[0.15em] text-gray-500"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              CONSENSUS ANCHOR
            </span>
            <Shield className="w-3.5 h-3.5 text-violet-400/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-xl font-bold text-violet-300"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              ETHEREUM
            </span>
            <span
              className="text-[10px] text-violet-400/80"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              MAINNET V2
            </span>
          </div>
        </div>
      </div>

      {/* ═══════ Progress HUD when generating ═══════ */}
      {isGenerating && (
        <div className="p-5 rounded-xl liquid-glass border border-cyan-500/40 shadow-[0_0_30px_rgba(0,229,255,0.2)] animate-pulse">
          <div className="flex items-center justify-between text-cyan-300 mb-2">
            <span
              className="font-bold flex items-center gap-2 text-[10px] tracking-[0.12em]"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              <Activity className="w-4 h-4 animate-spin text-cyan-400" />
              <span>CRYPTOGRAPHIC DOSSIER STAMPING &amp; CHAIN-OF-CUSTODY WATERMARKING</span>
            </span>
            <span
              className="font-bold text-xs"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {genProgress}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/70 overflow-hidden border border-white/[0.06]">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 transition-all duration-300 shadow-[0_0_12px_rgba(0,229,255,0.8)]"
              style={{ width: `${genProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ═══════ Hero Banner: 2-Minute Judge Pitch PDF Download ═══════ */}
      <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#080c14] via-[#0b1424] to-[#080c14] border border-cyan-500/35 shadow-[0_0_45px_rgba(0,229,255,0.15)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_25px_rgba(0,229,255,0.3)] flex-shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-400/40 text-amber-300 text-[9px] font-bold flex items-center gap-1.5"
                style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                RECOMMENDED FOR HACKATHON JUDGES
              </span>
              <span
                className="text-gray-500 text-[9px] uppercase tracking-wider"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                OFFICIAL BRIEF
              </span>
            </div>
            <h3
              className="text-xl sm:text-2xl font-bold text-white mb-1 tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              BEYONDPROOF 2-Minute Executive Pitch &amp; Architecture Brief
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed max-w-xl font-mono">
              Complete problem teardown, mathematical 7-engine breakdown, competitor matrix, and business model deck.
            </p>
          </div>
        </div>

        <a
          href="/BEYONDPROOF_2_Minute_Judge_Pitch.pdf"
          download
          onClick={() => soundManager.playSuccessChime()}
          className="px-6 py-3.5 rounded-lg bg-gradient-to-r from-cyan-400 to-teal-300 text-black text-[11px] font-bold flex items-center gap-2.5 shadow-[0_0_25px_rgba(0,229,255,0.35)] hover:shadow-[0_0_35px_rgba(0,229,255,0.5)] hover:brightness-110 active:scale-95 transition-all flex-shrink-0"
          style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em' }}
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>DOWNLOAD PITCH PDF (890 KB)</span>
        </a>
      </div>

      {/* ═══════ Reports Grid ═══════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reportsList.map((rep) => (
          <div
            key={rep.id}
            className="p-5 sm:p-6 rounded-xl liquid-glass border border-white/[0.06] hover:border-cyan-400/40 hover:shadow-[0_0_30px_rgba(0,229,255,0.12)] transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Card Top Pill */}
              <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
                  <span
                    className="text-cyan-400 font-bold text-xs tracking-wider"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    {rep.id}
                  </span>
                </div>
                <span
                  className="px-2.5 py-0.5 rounded text-[9px] font-bold border tracking-[0.08em] bg-emerald-950/50 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)] flex items-center gap-1.5"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {rep.status}
                </span>
              </div>

              {/* Title */}
              <h4
                className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-2 leading-snug"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {rep.title}
              </h4>

              {/* Metadata Badges */}
              <div
                className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400 mb-4 tracking-wider"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                <span className="px-2 py-0.5 rounded bg-black/50 border border-white/[0.04] text-cyan-400/90 font-mono">
                  CASE: {rep.caseId}
                </span>
                <span className="px-2 py-0.5 rounded bg-black/50 border border-white/[0.04]">
                  {rep.pages} PAGES
                </span>
                <span className="px-2 py-0.5 rounded bg-black/50 border border-white/[0.04]">
                  {rep.fileSize}
                </span>
                <span className="px-2 py-0.5 rounded bg-black/50 border border-white/[0.04] text-gray-500">
                  {rep.date}
                </span>
              </div>

              {/* SHA-256 Box */}
              <div className="p-3 rounded-lg bg-black/60 border border-white/[0.06] flex items-center justify-between text-xs font-mono text-gray-400 mb-5 group-hover:border-cyan-500/20 transition-colors">
                <span className="truncate mr-2 text-[11px] text-gray-400">
                  <span className="text-cyan-400 font-bold mr-1">SHA:</span>
                  {rep.sha256}
                </span>
                <button
                  onClick={() => handleCopyHash(rep.sha256)}
                  className="p-1 rounded bg-white/[0.03] hover:bg-cyan-500/20 text-gray-500 hover:text-cyan-300 transition-colors flex-shrink-0"
                  title="Copy SHA-256 Hash"
                >
                  {copiedHash === rep.sha256 ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3.5 border-t border-white/[0.06] flex items-center justify-between">
              <span
                className="text-[9.5px] text-gray-500 flex items-center gap-1.5 tracking-[0.1em]"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>HMAC DIGITALLY SIGNED</span>
              </span>

              <a
                href={rep.downloadUrl}
                download
                onClick={() => soundManager.playBlip()}
                className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-cyan-400/50 hover:bg-cyan-500/10 text-cyan-300 text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,229,255,0.1)] hover:shadow-[0_0_20px_rgba(0,229,255,0.25)]"
                style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em' }}
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>DOWNLOAD PDF</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
