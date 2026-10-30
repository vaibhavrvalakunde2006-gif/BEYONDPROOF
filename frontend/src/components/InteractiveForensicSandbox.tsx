'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Terminal, ShieldAlert, CheckCircle, ArrowRight, Play, Copy, RefreshCw, Cpu, Sparkles } from 'lucide-react';

interface Scenario {
  id: string;
  title: string;
  tag: string;
  category: 'Identity' | 'Media' | 'Document';
  color: string;
  description: string;
  targetFile: string;
  sha256: string;
  logs: Array<{ text: string; type: 'info' | 'warn' | 'error' | 'success' }>;
  verdict: {
    status: 'FORGERY CONFIRMED' | 'SYNTHETIC DETECTED' | 'TAMPER ISOLATED';
    confidence: string;
    riskCategory: 'high_risk' | 'suspicious';
  };
}

export function InteractiveForensicSandbox() {
  const scenarios: Scenario[] = [
    {
      id: 'mrz-forgery',
      title: 'Passport MRZ Checksum Forgery',
      tag: 'ICAO 9303 Modulo-10',
      category: 'Identity',
      color: 'text-violet-400 border-violet-500/40 bg-violet-950/30',
      description: 'Synthetic travel document altered to bypass automated border gates by spoofing passport number check digits.',
      targetFile: 'FRA_PASSPORT_EXP_2028.IMG',
      sha256: '9a8b1c4d7e2f5a0b3c6d9e1f4a7b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7a0b3c',
      logs: [
        { text: '[INGESTION] Parsing ICAO 9303 TD3 Machine Readable Zone (MRZ)...', type: 'info' },
        { text: '[OPTICAL] Extracted MRZ Line 2: P<FRADUPONT<<JEAN<<<<<<<<<<<<<<<1234567897FRA', type: 'info' },
        { text: '[ALGORITHM] Computing weighted 7-3-1 modulo-10 checksum across Document Number...', type: 'info' },
        { text: '[MISMATCH] Expected Check Digit: [8] | Read Check Digit: [7]', type: 'error' },
        { text: '[ANOMALY] Mathematical checksum failed! Document number artificially forged.', type: 'error' },
        { text: '[SYNTHESIS] Identity Guardian Engine: FORGERY_CONFIRMED (Zero Trust Rule Triggered)', type: 'warn' },
      ],
      verdict: {
        status: 'FORGERY CONFIRMED',
        confidence: '99.98% MATHEMATICAL CERTAINTY',
        riskCategory: 'high_risk',
      },
    },
    {
      id: 'deepfake-audio',
      title: 'Synthesized Voice Clone & Glitch',
      tag: 'AFTERIMAGE Spectral ELA',
      category: 'Media',
      color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30',
      description: 'AI-generated executive audio note created via diffusion voice synthesis to authorize fraudulent wire transfer.',
      targetFile: 'CFO_WIRE_AUTHORIZATION.WAV',
      sha256: '4f7a2b9c1d6e8f0a3b5c7d9e1f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a',
      logs: [
        { text: '[INGESTION] Generating fast Fourier transform (FFT) spectrogram 0Hz - 22kHz...', type: 'info' },
        { text: '[SPECTRAL] Acoustic harmonic jitter evaluated across 14 temporal speech segments...', type: 'info' },
        { text: '[ANOMALY] Unnatural phase coherence detected at 16.4kHz pitch boundary.', type: 'warn' },
        { text: '[ELA HUNTING] Diffusion neural noise floor artifacts isolated at frames 240-310.', type: 'error' },
        { text: '[SYNTHETIC] Synthetic acoustic cloned signature confirmed with 84.6 dB variance.', type: 'error' },
        { text: '[SYNTHESIS] Media Truth Engine: DEEPFAKE_SYNTHETIC_CONFIRMED', type: 'warn' },
      ],
      verdict: {
        status: 'SYNTHETIC DETECTED',
        confidence: '98.4% ANOMALY CONFIDENCE',
        riskCategory: 'high_risk',
      },
    },
    {
      id: 'contract-alteration',
      title: 'Contract Liability Clause Splicing',
      tag: 'PDF XRef Stream Exploit',
      category: 'Document',
      color: 'text-amber-400 border-amber-500/40 bg-amber-950/30',
      description: 'Vendor liability clause altered post-execution using incremental PDF trailer revision overwriting.',
      targetFile: 'MASTER_SERVICES_AGREEMENT_V3.PDF',
      sha256: 'e1d2c3b4a5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
      logs: [
        { text: '[INGESTION] Parsing raw PDF cross-reference (XRef) object stream tree...', type: 'info' },
        { text: '[XREF AUDIT] 2 incremental trailer updates detected after original signature epoch.', type: 'warn' },
        { text: '[FONT EXTRACTION] Page 14 Paragraph 3 uses non-embedded subset font [F01_Modified].', type: 'warn' },
        { text: '[GLYPH BASELINE] Character vertical alignment delta exceeds 0.84pt tolerance.', type: 'error' },
        { text: '[TAMPER] Section 8.2 liability ceiling modified from $5,000,000 to $50,000.', type: 'error' },
        { text: '[SYNTHESIS] Document Verifier Engine: POST_SIGNATURE_TAMPER_IDENTIFIED', type: 'warn' },
      ],
      verdict: {
        status: 'TAMPER ISOLATED',
        confidence: '100% OBJECT-STREAM PROOF',
        riskCategory: 'high_risk',
      },
    },
  ];

  const [activeScenario, setActiveScenario] = useState<Scenario>(scenarios[0]);
  const [copied, setCopied] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(activeScenario.sha256);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-gray-950 via-gray-900/60 to-gray-950 border border-cyan-500/30 p-6 backdrop-blur-xl shadow-2xl shadow-cyan-950/30 relative overflow-hidden">
      {/* Reticle Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800/80 pb-4 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400 tracking-wider">
                LIVE FORENSIC REASONING TERMINAL
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                ACTIVE PIPELINE
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Select an adversarial vector to stream deterministic multi-engine verification proof in real time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-gray-400 hidden md:inline">
            ZERO-TRUST VERIFICATION
          </span>
        </div>
      </div>

      {/* Scenario Selector Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {scenarios.map((sc) => {
          const isSelected = sc.id === activeScenario.id;
          return (
            <button
              key={sc.id}
              onClick={() => setActiveScenario(sc)}
              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'border-cyan-400/80 bg-gray-900 shadow-lg shadow-cyan-950/60'
                  : 'border-gray-800 bg-gray-950/60 hover:border-gray-700 hover:bg-gray-900/40 text-gray-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${sc.color}`}>
                  {sc.category} Forensics
                </span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                )}
              </div>
              <div className="font-bold text-sm text-gray-100 mb-1">{sc.title}</div>
              <div className="text-[11px] text-gray-400 line-clamp-2">{sc.description}</div>
            </button>
          );
        })}
      </div>

      {/* Live Terminal Screen */}
      <div className="rounded-xl bg-black border border-gray-800/90 p-4 font-mono text-xs overflow-hidden shadow-2xl">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-3 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="text-gray-400 ml-2 font-semibold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>target://{activeScenario.targetFile}</span>
            </span>
          </div>

          <button
            onClick={handleCopyHash}
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-cyan-300 transition-colors"
          >
            <Copy className="w-3 h-3" />
            <span>{copied ? 'Copied Hash!' : 'Copy SHA-256'}</span>
          </button>
        </div>

        {/* SHA-256 Telemetry Line */}
        <div className="mb-3 px-3 py-1.5 rounded bg-gray-950 border border-gray-900 flex items-center justify-between text-[11px] text-gray-500">
          <span className="truncate max-w-lg">SHA-256: {activeScenario.sha256}</span>
          <span className="text-emerald-400 font-semibold flex-shrink-0">ANCHORED</span>
        </div>

        {/* Streaming Logs */}
        <div className="space-y-1.5 py-1">
          {activeScenario.logs.map((log, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 leading-relaxed ${
                log.type === 'error'
                  ? 'text-red-400 font-bold bg-red-950/20 px-2 py-0.5 rounded'
                  : log.type === 'warn'
                  ? 'text-amber-300'
                  : log.type === 'success'
                  ? 'text-emerald-400'
                  : 'text-gray-300'
              }`}
            >
              <span className="text-gray-600 select-none">›</span>
              <span>{log.text}</span>
            </div>
          ))}
        </div>

        {/* Verdict Badge Banner */}
        <div className="mt-4 pt-3 border-t border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-950/80 -mx-4 -mb-4 p-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
            <div>
              <div className="text-sm font-bold text-red-400 tracking-wider">
                {activeScenario.verdict.status}
              </div>
              <div className="text-[11px] text-gray-400">
                {activeScenario.verdict.confidence}
              </div>
            </div>
          </div>

          <Link
            href="/verification"
            className="btn-primary py-2 px-4 text-xs font-semibold flex items-center gap-2"
          >
            <span>Launch Complete Forensic Dossier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
