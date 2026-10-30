'use client';

import React, { useState } from 'react';
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [reportsList, setReportsList] = useState<CertifiedReport[]>(mockReports);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleGenerateNewReport = () => {
    soundManager.playLaserScan();
    setIsGenerating(true);
    setGenProgress(15);

    const int1 = setTimeout(() => setGenProgress(55), 400);
    const int2 = setTimeout(() => setGenProgress(88), 900);
    const int3 = setTimeout(() => {
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
    <div className="space-y-8 select-none">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>DOCUMENT CENTRE // COURT-ADMISSIBLE DOSSIERS</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Forensic <span className="text-cyan-400">Reports.</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm font-mono mt-1">
            Certify investigation findings into tamper-evident, cryptographic PDF dossiers with chain-of-custody hashes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/history"
            onClick={() => soundManager.playBlip()}
            className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 hover:border-cyan-400/40 text-xs font-mono text-gray-300 hover:text-white flex items-center gap-2 transition-colors"
          >
            <span>Evidence Archive</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleGenerateNewReport}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:brightness-110 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? `SYNTHESIZING... ${genProgress}%` : 'GENERATE CERTIFIED DOSSIER'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar if generating */}
      {isGenerating && (
        <div className="p-5 rounded-2xl bg-[#090e17] border border-cyan-500/40 font-mono text-xs animate-pulse">
          <div className="flex items-center justify-between text-cyan-300 mb-2">
            <span className="font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 animate-spin" />
              <span>CRYPTOGRAPHIC DOSSIER STAMPING IN PROGRESS</span>
            </span>
            <span>{genProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-teal-300 transition-all duration-300"
              style={{ width: `${genProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Hero Banner: 2-Minute Judge Pitch PDF Download */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0a1628] via-[#0b1b33] to-[#07101f] border border-cyan-500/40 shadow-[0_0_40px_rgba(0,229,255,0.15)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,229,255,0.3)] flex-shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-[10px] font-bold">
                RECOMMENDED FOR JUDGES
              </span>
              <span className="text-gray-400 text-xs font-mono">OFFICIAL BRIEF</span>
            </div>
            <h3
              className="text-xl sm:text-2xl font-bold text-white mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              BEYONDPROOF 2-Minute Judge Pitch &amp; Architecture Brief
            </h3>
            <p className="text-xs font-mono text-gray-300 leading-relaxed max-w-xl">
              Complete problem teardown, mathematical 7-engine breakdown, competitor matrix, and business model deck.
            </p>
          </div>
        </div>

        <a
          href="/BEYONDPROOF_2_Minute_Judge_Pitch.pdf"
          download
          onClick={() => soundManager.playSuccessChime()}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 text-black font-mono text-xs font-bold flex items-center gap-2.5 shadow-lg shadow-cyan-500/30 hover:brightness-110 transition-all flex-shrink-0 active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>DOWNLOAD PITCH PDF (890 KB)</span>
        </a>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportsList.map((rep) => (
          <div
            key={rep.id}
            className="p-6 rounded-2xl bg-[#090e17] border border-white/[0.08] hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-4 pb-3 border-b border-white/[0.06]">
                <span className="text-cyan-400 font-bold">{rep.id}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                  {rep.status}
                </span>
              </div>

              <h4
                className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {rep.title}
              </h4>

              <div className="flex items-center gap-4 text-xs font-mono text-gray-400 mb-4">
                <span>CASE: {rep.caseId}</span>
                <span>•</span>
                <span>{rep.pages} PAGES</span>
                <span>•</span>
                <span>{rep.fileSize}</span>
                <span>•</span>
                <span>{rep.date}</span>
              </div>

              {/* Hash */}
              <div className="p-3 rounded-xl bg-black/60 border border-white/[0.06] flex items-center justify-between font-mono text-[11px] text-gray-400 mb-6">
                <span className="truncate mr-2">SHA: {rep.sha256}</span>
                <button
                  onClick={() => handleCopyHash(rep.sha256)}
                  className="text-gray-500 hover:text-cyan-300 transition-colors"
                  title="Copy SHA-256"
                >
                  {copiedHash === rep.sha256 ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>HMAC DIGITALLY SIGNED</span>
              </span>

              <a
                href={rep.downloadUrl}
                download
                onClick={() => soundManager.playBlip()}
                className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-400 hover:bg-cyan-500/10 text-cyan-300 text-xs font-mono font-bold flex items-center gap-2 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD PDF</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
