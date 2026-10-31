'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ArrowUpRight,
  Plus,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  FileText,
  Fingerprint,
  Calendar,
  Layers,
  Activity,
  X,
  ExternalLink,
  Download,
  Hash,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Sparkles,
} from 'lucide-react';
import { soundManager } from '@/lib/soundFx';

interface CaseRecord {
  id: string;
  file: string;
  fileType: 'DOCUMENT' | 'AUDIO' | 'IMAGE' | 'IDENTITY';
  engine: string;
  assessment: 'HIGH RISK' | 'SUSPICIOUS' | 'AUTHENTIC' | 'PENDING';
  verdict: string;
  time: string;
  sha256: string;
  confidence: string;
  details: string;
  investigator: string;
}

const mockCases: CaseRecord[] = [
  {
    id: 'INV-2026-0042',
    file: 'FRA_PASSPORT_EXP2028.IMG',
    fileType: 'IDENTITY',
    engine: 'Identity Guardian',
    assessment: 'HIGH RISK',
    verdict: 'FORGERY CONFIRMED',
    time: '12 min ago',
    sha256: '9a8b1c4d7e2f5a0b3c6d9e1f4a7b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7a0b3c',
    confidence: '99.98% Mathematical Certainty',
    details: 'ICAO 9303 modulo-10 checksum mismatch on document number check digit [8 vs 7]. 3D facial wireframe reveals anomalous non-standard eye socket depth topology.',
    investigator: 'Dr. Morgan Vance (Chief Cryptographer)',
  },
  {
    id: 'INV-2026-0041',
    file: 'CFO_WIRE_AUTHORIZATION.WAV',
    fileType: 'AUDIO',
    engine: 'Media Truth Engine',
    assessment: 'HIGH RISK',
    verdict: 'DEEPFAKE SYNTHETIC',
    time: '48 min ago',
    sha256: '4f7a2b9c1d6e8f0a3b5c7d9e1f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a',
    confidence: '98.40% Spectral Anomaly',
    details: '16.4kHz pitch boundary diffusion artifact detected with 84.6 dB variance. Neural vocoder spectrogram signatures consistent with generative TTS cloning.',
    investigator: 'Analyst K. Chen (Acoustic Forensics)',
  },
  {
    id: 'INV-2026-0040',
    file: 'MASTER_SERVICES_AGREEMENT.PDF',
    fileType: 'DOCUMENT',
    engine: 'Document Verifier',
    assessment: 'SUSPICIOUS',
    verdict: 'CONTRACT SPLICED',
    time: '2 hours ago',
    sha256: 'e1d2c3b4a5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    confidence: '100% XRef Stream Proof',
    details: 'Post-signature incremental trailer revision overwrite detected at byte offset 0x4F12. Liability cap modified from $50,000 to $500,000 after digital signing.',
    investigator: 'Lead Counsel R. Sterling',
  },
  {
    id: 'INV-2026-0039',
    file: 'VENDOR_CERTIFICATE_ACME.PDF',
    fileType: 'DOCUMENT',
    engine: 'Document Verifier',
    assessment: 'AUTHENTIC',
    verdict: 'AUTHENTIC VALIDATED',
    time: 'Yesterday',
    sha256: '3b5c7d9e1f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a9a8b1c4d7e2f5a0b',
    confidence: '100% Signature Verified',
    details: 'Cryptographic X.509 certificate hierarchy validated against EU Trusted List. Zero byte alterations detected in document streams.',
    investigator: 'Automated Continuous Sentinel',
  },
  {
    id: 'INV-2026-0038',
    file: 'EXECUTIVE_TOWN_HALL.MP4',
    fileType: 'IMAGE',
    engine: 'Media Truth Engine',
    assessment: 'AUTHENTIC',
    verdict: 'AUTHENTIC VALIDATED',
    time: 'Oct 28, 2026',
    sha256: '8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a9a8b1c4d7e2f5a0b3c6d9e1f4a7b2c5d',
    confidence: '99.2% Natural Optical Coherence',
    details: 'Consistent double-quantization JPEG grid, natural lighting shadows, and continuous camera sensor PRNU noise fingerprint confirmed.',
    investigator: 'Analyst K. Chen (Acoustic Forensics)',
  },
];

export default function History() {
  const [animateIn, setAnimateIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleCopyHash = (hash: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    soundManager.playBlip();
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleOpenCase = (c: CaseRecord) => {
    soundManager.playLaserScan();
    setSelectedCase(c);
  };

  const filteredCases = mockCases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.file.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.engine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.verdict.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'ALL') return matchesSearch;
    return matchesSearch && c.assessment === filterStatus;
  });

  const highRiskCount = mockCases.filter((c) => c.assessment === 'HIGH RISK').length;
  const suspiciousCount = mockCases.filter((c) => c.assessment === 'SUSPICIOUS').length;
  const authenticCount = mockCases.filter((c) => c.assessment === 'AUTHENTIC').length;

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
            <span className="text-cyan-400">CASE MANAGEMENT</span>
            <span className="text-gray-600">//</span>
            <span className="text-gray-400">IMMUTABLE EVIDENCE LEDGER</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Investigation <span className="text-cyan-400">History.</span>
          </h1>
          <p
            className="text-gray-400 text-xs sm:text-sm mt-1.5"
            style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.04em', fontSize: 11 }}
          >
            Cryptographic audit trails, deterministic risk scores, and court-admissible forensic verdicts
          </p>
        </div>

        <Link
          href="/app/investigations/new"
          onClick={() => soundManager.playModeSwitch()}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-400 text-black font-bold text-[11px] flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.25)] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:brightness-110 active:scale-95 transition-all self-start md:self-auto"
          style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em' }}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>NEW INVESTIGATION</span>
        </Link>
      </div>

      {/* ═══════ Live Forensic Telemetry Strip ═══════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl liquid-glass border border-white/[0.06] hover:border-cyan-400/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[9px] uppercase tracking-[0.15em] text-gray-500"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              ARCHIVED CASES
            </span>
            <Layers className="w-3.5 h-3.5 text-cyan-400/60" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {mockCases.length}
            </span>
            <span
              className="text-[10px] text-cyan-400 flex items-center gap-1"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              100% ANCHORED
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl liquid-glass border border-white/[0.06] hover:border-red-400/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[9px] uppercase tracking-[0.15em] text-gray-500"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              CRITICAL FORGERIES
            </span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-400/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-bold text-red-400"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {highRiskCount}
            </span>
            <span
              className="text-[10px] text-red-400/80"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              QUARANTINED
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl liquid-glass border border-white/[0.06] hover:border-amber-400/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[9px] uppercase tracking-[0.15em] text-gray-500"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              SUSPICIOUS TAMPERING
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-bold text-amber-400"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {suspiciousCount}
            </span>
            <span
              className="text-[10px] text-amber-400/80"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              FLAGGED AUDIT
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl liquid-glass border border-white/[0.06] hover:border-emerald-400/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[9px] uppercase tracking-[0.15em] text-gray-500"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              AUTHENTIC VERIFIED
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-bold text-emerald-400"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {authenticCount}
            </span>
            <span
              className="text-[10px] text-emerald-400/80"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              HASH MATCHED
            </span>
          </div>
        </div>
      </div>

      {/* ═══════ Search & Status Filters ═══════ */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 liquid-glass p-3.5 rounded-xl border border-white/[0.06]">
        {/* Search Input */}
        <div className="relative w-full sm:w-88">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Case ID, evidence file, or engine..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-black/60 border border-white/[0.06] text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-400/50 focus:shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all font-mono"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'ALL EVIDENCE' },
            { id: 'HIGH RISK', label: 'HIGH RISK' },
            { id: 'SUSPICIOUS', label: 'SUSPICIOUS' },
            { id: 'AUTHENTIC', label: 'AUTHENTIC' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setFilterStatus(item.id);
                soundManager.playBlip();
              }}
              style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em', fontSize: 10 }}
              className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap uppercase font-bold ${
                filterStatus === item.id
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/60 shadow-[0_0_15px_rgba(0,229,255,0.25)]'
                  : 'bg-black/40 text-gray-400 border-white/[0.06] hover:border-white/20 hover:text-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════ Evidence Table ═══════ */}
      <div className="rounded-xl liquid-glass border border-white/[0.06] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className="text-gray-500 border-b border-white/[0.06] bg-black/40 uppercase tracking-[0.14em]"
                style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9.5 }}
              >
                <th className="py-3.5 px-5">CASE IDENTIFIER</th>
                <th className="py-3.5 px-5">EVIDENCE ARTIFACT</th>
                <th className="py-3.5 px-5">FORENSIC ROUTE</th>
                <th className="py-3.5 px-5">ASSESSMENT VERDICT</th>
                <th className="py-3.5 px-5">SHA-256 HASH</th>
                <th className="py-3.5 px-5">TIMESTAMP</th>
                <th className="py-3.5 px-5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <Activity className="w-6 h-6 mx-auto mb-2 text-gray-600 animate-pulse" />
                    <span
                      className="text-[11px] uppercase tracking-wider block"
                      style={{ fontFamily: "'Orbitron', sans-serif" }}
                    >
                      NO EVIDENCE RECORDS MATCHING QUERY
                    </span>
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => handleOpenCase(c)}
                    className="hover:bg-cyan-500/[0.03] transition-colors cursor-pointer group"
                  >
                    {/* Case ID */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 group-hover:bg-cyan-400 group-hover:shadow-[0_0_8px_rgba(0,229,255,0.8)] transition-all" />
                        <span
                          className="font-bold text-cyan-400 group-hover:text-cyan-300 text-[11px]"
                          style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.05em' }}
                        >
                          {c.id}
                        </span>
                      </div>
                    </td>

                    {/* Evidence File */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-gray-400 group-hover:border-cyan-400/30 group-hover:text-cyan-400 transition-all">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-white font-medium text-xs font-mono block">
                            {c.file}
                          </span>
                          <span
                            className="text-[9px] text-gray-500 uppercase tracking-wider block"
                            style={{ fontFamily: "'Orbitron', sans-serif" }}
                          >
                            TYPE: {c.fileType}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Engine Route */}
                    <td className="py-4 px-5 text-gray-300 text-xs">
                      <span className="font-mono text-[11px] text-gray-300">{c.engine}</span>
                    </td>

                    {/* Assessment */}
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9.5px] font-bold border tracking-[0.06em] ${
                          c.assessment === 'HIGH RISK'
                            ? 'text-red-400 bg-red-950/50 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                            : c.assessment === 'SUSPICIOUS'
                            ? 'text-amber-400 bg-amber-950/50 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                            : 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        }`}
                        style={{ fontFamily: "'Orbitron', sans-serif" }}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            c.assessment === 'HIGH RISK'
                              ? 'bg-red-400 animate-pulse'
                              : c.assessment === 'SUSPICIOUS'
                              ? 'bg-amber-400 animate-pulse'
                              : 'bg-emerald-400 animate-pulse'
                          }`}
                        />
                        {c.verdict}
                      </span>
                    </td>

                    {/* SHA-256 */}
                    <td className="py-4 px-5 text-gray-400">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-gray-400 truncate max-w-[120px]">
                          {c.sha256}
                        </span>
                        <button
                          onClick={(e) => handleCopyHash(c.sha256, e)}
                          className="p-1 rounded bg-white/[0.03] hover:bg-cyan-500/20 text-gray-500 hover:text-cyan-300 transition-colors"
                          title="Copy SHA-256 hash"
                        >
                          {copiedHash === c.sha256 ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-4 px-5 text-gray-500 font-mono text-[11px]">
                      {c.time}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCase(c);
                        }}
                        style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em', fontSize: 10 }}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:text-cyan-300 text-gray-400 transition-all font-bold"
                      >
                        INSPECT
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════ Case Dossier Modal Drawer ═══════ */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl liquid-glass border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_20px_80px_rgba(0,242,254,0.25)]">
            {/* Modal Top Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div
                    className="text-[9px] text-gray-500 uppercase tracking-[0.16em]"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    EVIDENCE DOSSIER // IMMUTABLE LEDGER
                  </div>
                  <span
                    className="text-white font-bold text-lg"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {selectedCase.id}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedCase(null)}
                className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:text-white text-gray-400 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4">
              {/* Artifact & Verdict Box */}
              <div className="p-4 rounded-xl bg-black/60 border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span
                    className="text-gray-500 text-[9px] uppercase tracking-[0.15em] block mb-1"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    ARTIFACT FILENAME
                  </span>
                  <span className="text-white font-bold font-mono text-sm block">
                    {selectedCase.file}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border tracking-[0.08em] ${
                    selectedCase.assessment === 'HIGH RISK'
                      ? 'text-red-400 bg-red-950/60 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                      : selectedCase.assessment === 'SUSPICIOUS'
                      ? 'text-amber-400 bg-amber-950/60 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : 'text-emerald-400 bg-emerald-950/60 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                  }`}
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      selectedCase.assessment === 'HIGH RISK'
                        ? 'bg-red-400 animate-pulse'
                        : selectedCase.assessment === 'SUSPICIOUS'
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-emerald-400 animate-pulse'
                    }`}
                  />
                  {selectedCase.verdict}
                </span>
              </div>

              {/* Confidence Score */}
              <div>
                <span
                  className="text-gray-500 text-[9px] uppercase tracking-[0.15em] block mb-1"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  DETERMINISTIC CONFIDENCE SCORE
                </span>
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                  <span
                    className="text-cyan-300 font-bold text-sm"
                    style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.04em' }}
                  >
                    {selectedCase.confidence}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    REPRODUCIBLE
                  </span>
                </div>
              </div>

              {/* Forensic Details */}
              <div>
                <span
                  className="text-gray-500 text-[9px] uppercase tracking-[0.15em] block mb-1"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  FORENSIC BREAKDOWN &amp; EVIDENCE DISSECTION
                </span>
                <p className="text-gray-300 text-xs leading-relaxed bg-black/50 p-3.5 rounded-xl border border-white/[0.06] font-mono">
                  {selectedCase.details}
                </p>
              </div>

              {/* Route & Investigator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                  <span
                    className="text-gray-500 text-[9px] uppercase tracking-[0.15em] block mb-1"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    PRIMARY DISSECTION ENGINE
                  </span>
                  <span className="text-white text-xs font-mono font-medium block">
                    {selectedCase.engine}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                  <span
                    className="text-gray-500 text-[9px] uppercase tracking-[0.15em] block mb-1"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    PREVAILING EXAMINER
                  </span>
                  <span className="text-white text-xs font-mono font-medium block">
                    {selectedCase.investigator}
                  </span>
                </div>
              </div>

              {/* SHA-256 Ledger Hash */}
              <div className="pt-1">
                <span
                  className="text-gray-500 text-[9px] uppercase tracking-[0.15em] block mb-1"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  SHA-256 IMMUTABLE LEDGER HASH
                </span>
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/70 border border-cyan-500/25 text-cyan-400 text-xs font-mono">
                  <span className="truncate mr-2 text-[11px]">{selectedCase.sha256}</span>
                  <button
                    onClick={(e) => handleCopyHash(selectedCase.sha256, e)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.04] hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300 transition-colors text-[10px]"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    {copiedHash === selectedCase.sha256 ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>COPY</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-5 mt-5 border-t border-white/[0.06] flex items-center justify-between">
              <span
                className="text-[9px] text-gray-500 tracking-[0.15em] flex items-center gap-1.5"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                CHAIN OF CUSTODY VERIFIED
              </span>
              <a
                href="/BEYONDPROOF_2_Minute_Judge_Pitch.pdf"
                download
                onClick={() => soundManager.playSuccess()}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-400 text-black font-bold text-[10px] hover:brightness-110 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all flex items-center gap-2"
                style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em' }}
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>EXPORT DOSSIER PDF</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
