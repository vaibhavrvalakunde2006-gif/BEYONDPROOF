'use client';

import React, { useState } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = (hash: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    soundManager.playBlip();
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredCases = mockCases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.file.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.engine.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'ALL') return matchesSearch;
    return matchesSearch && c.assessment === filterStatus;
  });

  return (
    <div className="space-y-8 select-none">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>CASE MANAGEMENT // EVIDENCE ARCHIVE</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Investigation <span className="text-cyan-400">History.</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm font-mono mt-1">
            Immutable cryptographic ledger of all ingested files, mathematical scores, and court-admissible verdicts.
          </p>
        </div>

        <Link
          href="/app/investigations/new"
          onClick={() => soundManager.playModeSwitch()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:brightness-110 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Investigation</span>
        </Link>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#090e17] p-4 rounded-2xl border border-white/[0.08]">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Case ID, file, or engine..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto font-mono text-xs">
          {['ALL', 'HIGH RISK', 'SUSPICIOUS', 'AUTHENTIC'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status);
                soundManager.playBlip();
              }}
              className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                  : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/20'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Evidence Table */}
      <div className="rounded-2xl bg-[#090e17] border border-white/[0.08] overflow-hidden shadow-xl">
        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 border-b border-white/[0.08] text-[11px] bg-black/40">
                <th className="py-4 px-6">CASE ID</th>
                <th className="py-4 px-6">EVIDENCE FILE</th>
                <th className="py-4 px-6">ENGINE ROUTE</th>
                <th className="py-4 px-6">ASSESSMENT</th>
                <th className="py-4 px-6">SHA-256 FINGERPRINT</th>
                <th className="py-4 px-6">TIMESTAMP</th>
                <th className="py-4 px-6 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredCases.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => {
                    setSelectedCase(c);
                    soundManager.playBlip();
                  }}
                  className="hover:bg-cyan-500/[0.04] transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-6 font-bold text-cyan-400 group-hover:text-cyan-300">
                    {c.id}
                  </td>
                  <td className="py-4 px-6 text-white font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                    <span>{c.file}</span>
                  </td>
                  <td className="py-4 px-6 text-gray-300">{c.engine}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                        c.assessment === 'HIGH RISK'
                          ? 'text-red-400 bg-red-950/60 border-red-500/40'
                          : c.assessment === 'SUSPICIOUS'
                          ? 'text-amber-400 bg-amber-950/60 border-amber-500/40'
                          : 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40'
                      }`}
                    >
                      {c.verdict}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[120px] font-mono text-[11px]">
                        {c.sha256}
                      </span>
                      <button
                        onClick={(e) => handleCopyHash(c.sha256, e)}
                        className="text-gray-500 hover:text-cyan-300 transition-colors"
                        title="Copy SHA-256 hash"
                      >
                        {copiedHash === c.sha256 ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-500 text-[11px]">{c.time}</td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCase(c);
                        soundManager.playBlip();
                      }}
                      className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-cyan-400 hover:text-cyan-300 text-gray-400 text-[11px] font-bold transition-all"
                    >
                      INSPECT
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Dossier Drawer Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[#090e17] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(0,229,255,0.2)] font-mono text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">EVIDENCE DOSSIER</span>
                  <span className="text-white font-bold text-base">{selectedCase.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black/50 border border-white/[0.08] flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-[10px] block mb-1">ARTIFACT FILENAME</span>
                  <span className="text-white font-bold text-sm">{selectedCase.file}</span>
                </div>
                <span
                  className={`px-3 py-1 rounded text-xs font-bold border ${
                    selectedCase.assessment === 'HIGH RISK'
                      ? 'text-red-400 bg-red-950/60 border-red-500/40'
                      : selectedCase.assessment === 'SUSPICIOUS'
                      ? 'text-amber-400 bg-amber-950/60 border-amber-500/40'
                      : 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40'
                  }`}
                >
                  {selectedCase.verdict}
                </span>
              </div>

              <div>
                <span className="text-gray-500 text-[10px] block mb-1">DETERMINISTIC CONFIDENCE SCORE</span>
                <span className="text-cyan-300 font-bold text-sm">{selectedCase.confidence}</span>
              </div>

              <div>
                <span className="text-gray-500 text-[10px] block mb-1">FORENSIC BREAKDOWN &amp; EVIDENCE</span>
                <p className="text-gray-300 leading-relaxed bg-black/40 p-3.5 rounded-xl border border-white/[0.06]">
                  {selectedCase.details}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-gray-500 text-[10px] block mb-1">PRIMARY DISSECTION ENGINE</span>
                  <span className="text-white">{selectedCase.engine}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block mb-1">PREVAILING INVESTIGATOR</span>
                  <span className="text-white">{selectedCase.investigator}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-gray-500 text-[10px] block mb-1">SHA-256 IMMUTABLE LEDGER HASH</span>
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-cyan-500/20 text-cyan-400 text-[11px] font-mono">
                  <span className="truncate mr-2">{selectedCase.sha256}</span>
                  <button
                    onClick={(e) => handleCopyHash(selectedCase.sha256, e)}
                    className="flex items-center gap-1 text-gray-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-[10px] text-gray-500">CHAIN OF CUSTODY VERIFIED</span>
              <div className="flex items-center gap-3">
                <a
                  href="/BEYONDPROOF_2_Minute_Judge_Pitch.pdf"
                  download
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-bold hover:bg-cyan-500/30 transition-all flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>EXPORT DOSSIER PDF</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
