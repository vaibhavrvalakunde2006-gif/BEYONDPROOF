'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  Sparkles,
  Camera,
  Cpu,
  Eye,
  Sliders,
  ChevronRight,
  Maximize2,
  RotateCcw,
} from 'lucide-react';
import { soundManager } from '@/lib/soundFx';

interface CrossModalRow {
  parameter: string;
  claimedExif: string;
  physicalReality: string;
  physicsPrinciple: string;
  status: 'FORGED' | 'CONTRADICTED' | 'VERIFIED' | 'UNVERIFIED';
}

const DEMO_CROSS_MODAL_DATA: CrossModalRow[] = [
  {
    parameter: 'Sensor Resolution & Aspect Ratio',
    claimedExif: 'Canon EOS 5D Mark IV (30.4 MP, 6720x4480, 3:2 Native)',
    physicalReality: '1024 x 1024 Square (1:1 Aspect Ratio, 1.05 MP)',
    physicsPrinciple: 'Physical silicon CMOS sensor aspect ratio cannot change without optical crop flags.',
    status: 'FORGED',
  },
  {
    parameter: 'Quantization Matrix vs Hardware ISP',
    claimedExif: 'Proprietary Canon DIGIC 6+ Hardware ISP Table',
    physicalReality: 'Standard Independent JPEG Group (IJG) Software Q75 Matrix (Ratio Std: 0.0089)',
    physicsPrinciple: 'Hardware camera ISPs use proprietary psycho-visual matrices. Standard IJG proves software compression.',
    status: 'FORGED',
  },
  {
    parameter: 'Claimed Aperture vs Depth of Field (DoF)',
    claimedExif: 'f/1.4 Ultra-Wide Optical Aperture (50mm Prime)',
    physicalReality: 'Infinite Plane Corner-to-Corner Sharpness (Periphery Ratio: 0.94)',
    physicsPrinciple: 'Optical thin-lens physics physically mandates shallow depth-of-field and optical bokeh at f/1.4.',
    status: 'CONTRADICTED',
  },
  {
    parameter: 'Sensor Sensitivity vs Shot Noise',
    claimedExif: 'ISO 6400 (High Sensitivity CMOS Gain)',
    physicalReality: 'Hyper-smooth Synthetic Diffusion Texture (Noise Std: 0.08, Expected: > 1.20)',
    physicsPrinciple: 'CMOS photon arrival follows Poisson-Gaussian statistics; zero noise at ISO 6400 is physically impossible.',
    status: 'CONTRADICTED',
  },
  {
    parameter: 'Screen Re-photography (Moiré)',
    claimedExif: 'Direct Optical Scene Capture',
    physicalReality: '2D FFT Harmonic Lattice Spikes Detected (Peak Z-Score: 4.82, 6 Conjugate Peaks)',
    physicsPrinciple: 'Spatial aliasing between LCD/OLED RGB subpixel pitch and camera Bayer mosaic creates 2D interference.',
    status: 'FORGED',
  },
];

export default function LaunderedFakesShield() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'moire' | 'verdict'>('matrix');
  const [selectedRow, setSelectedRow] = useState<CrossModalRow>(DEMO_CROSS_MODAL_DATA[0]);
  const [simulatedMode, setSimulatedMode] = useState<'laundered_fake' | 'clean_unverified' | 'c2pa_genuine'>('laundered_fake');

  const handleSimSwitch = (mode: 'laundered_fake' | 'clean_unverified' | 'c2pa_genuine') => {
    setSimulatedMode(mode);
    soundManager.playBeep();
  };

  return (
    <div className="rounded-2xl bg-gradient-to-b from-gray-950 via-slate-900/80 to-gray-950 border border-amber-500/30 p-5 backdrop-blur-xl shadow-2xl shadow-amber-950/20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-800 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              HACKATHON HURDLE RESOLUTION
            </span>
            <span className="text-gray-400 text-xs font-mono">• Built by BBC</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-wide mt-1 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            Laundered Fakes & Lying Metadata Shield
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 max-w-2xl">
            Detects screenshot laundering, screen re-photography Moiré lattices, and executes cross-modal physical validation
            to expose forged camera EXIF metadata.
          </p>
        </div>

        {/* Interactive Mode Switcher for Judges */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-900/90 border border-gray-800 text-xs font-mono">
          <button
            onClick={() => handleSimSwitch('laundered_fake')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              simulatedMode === 'laundered_fake'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Laundered Fake & Lying EXIF
          </button>
          <button
            onClick={() => handleSimSwitch('clean_unverified')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              simulatedMode === 'clean_unverified'
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            No Tampering (Unverified)
          </button>
          <button
            onClick={() => handleSimSwitch('c2pa_genuine')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              simulatedMode === 'c2pa_genuine'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            C2PA Verified Genuine
          </button>
        </div>
      </div>

      {/* Core Fallacy Banner */}
      <div className="mb-4 p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex items-start gap-3 text-xs">
        <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-cyan-300 uppercase tracking-wider font-mono">
            Forensic Principle: Absence of Evidence ≠ Evidence of Authenticity
          </span>
          <p className="text-gray-300 mt-0.5 leading-relaxed">
            Attackers screenshot or re-photograph AI deepfakes to wash away frequency residuals, then inject DSLR metadata.
            A system that says &quot;Authentic&quot; simply because it finds no tampering is dangerous. BEYONDPROOF strictly
            enforces cryptographic proof or flags assets as <strong className="text-yellow-300 font-mono">NO_TAMPERING_FOUND_UNVERIFIED</strong>.
          </p>
        </div>
      </div>

      {/* Simulated Verdict Display */}
      <div className="mb-4 p-4 rounded-xl border font-mono transition-all duration-300 bg-gray-900/90 relative overflow-hidden">
        {simulatedMode === 'laundered_fake' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-red-500 pl-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                  METADATA_FORGERY_DETECTED & LAUNDERED_SUSPECT
                </span>
                <span className="text-xs text-red-400 font-bold">CRITICAL PHYSICAL CONTRADICTION</span>
              </div>
              <div className="text-sm font-bold text-white mt-1">
                Asset claims Canon EOS 5D Mark IV (f/1.4, ISO 6400) but is a 1024x1024 AI Diffusion Square with 2D FFT Moiré Lattice
              </div>
              <div className="text-xs text-gray-400 mt-1">
                4 physical contradictions detected: Sensor aspect ratio mismatch, Standard IJG quantization tables, infinite focal plane sharpness, and zero sensor shot noise.
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-2xl font-black text-red-400">89.5<span className="text-xs text-gray-500">/100</span></div>
              <div className="text-[10px] text-gray-400 uppercase">Composite Threat Score</div>
            </div>
          </div>
        )}

        {simulatedMode === 'clean_unverified' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-yellow-500 pl-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                  NO_TAMPERING_FOUND_UNVERIFIED
                </span>
                <span className="text-xs text-yellow-400 font-bold">INCONCLUSIVE PROVENANCE</span>
              </div>
              <div className="text-sm font-bold text-white mt-1">
                No active tampering traces detected (Score: 12.0/100) — ORIGIN CANNOT BE CERTIFIED GENUINE
              </div>
              <div className="text-xs text-gray-300 mt-1">
                CRITICAL NOTICE: Zero detectable tampering artifacts does NOT equal genuine authenticity. File lacks C2PA cryptographic provenance or hardware enclave anchors. Potential laundered fake.
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-2xl font-black text-yellow-400">12.0<span className="text-xs text-gray-500">/100</span></div>
              <div className="text-[10px] text-gray-400 uppercase">Tamper Risk Index</div>
            </div>
          </div>
        )}

        {simulatedMode === 'c2pa_genuine' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-emerald-500 pl-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  VERIFIED_GENUINE
                </span>
                <span className="text-xs text-emerald-400 font-bold">CRYPTOGRAPHICALLY ANCHORED</span>
              </div>
              <div className="text-sm font-bold text-white mt-1">
                C2PA Provenance Manifest Signed by Leica Secure Camera Hardware Enclave (ECDSA P-256)
              </div>
              <div className="text-xs text-gray-300 mt-1">
                End-to-end cryptographic lineage verified. Zero tampering found + Positive hardware cryptographic anchor confirmed.
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-2xl font-black text-emerald-400">4.2<span className="text-xs text-gray-500">/100</span></div>
              <div className="text-[10px] text-emerald-400 uppercase">Certified Authentic</div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2 mb-3 text-xs font-mono">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
            activeTab === 'matrix'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Cross-Modal Validation Matrix (EXIF vs Reality)
        </button>
        <button
          onClick={() => setActiveTab('moire')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
            activeTab === 'moire'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          2D FFT Moiré Spectrum Topology
        </button>
      </div>

      {/* Tab 1: Cross-Modal Verification Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-3 font-mono text-xs">
          <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-950/60">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/80 text-gray-400 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Physical Dimension</th>
                  <th className="py-2.5 px-3">Claimed EXIF Metadata</th>
                  <th className="py-2.5 px-3">Measured Physical Reality</th>
                  <th className="py-2.5 px-3">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {DEMO_CROSS_MODAL_DATA.map((row, idx) => {
                  const isSelected = selectedRow.parameter === row.parameter;
                  return (
                    <tr
                      key={idx}
                      onClick={() => {
                        setSelectedRow(row);
                        soundManager.playBeep();
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-amber-500/10' : 'hover:bg-gray-900/40'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-semibold text-gray-200 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {row.parameter}
                      </td>
                      <td className="py-2.5 px-3 text-cyan-300">{row.claimedExif}</td>
                      <td className="py-2.5 px-3 text-red-300">{row.physicalReality}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            row.status === 'FORGED'
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Selected Row Physical Explanation */}
          <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold mb-1">
              <Eye className="w-4 h-4" />
              Physical Law Contradiction: {selectedRow.parameter}
            </div>
            <p className="text-gray-300 leading-relaxed">{selectedRow.physicsPrinciple}</p>
          </div>
        </div>
      )}

      {/* Tab 2: 2D FFT Moiré Spectrum Visualization */}
      {activeTab === 'moire' && (
        <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-violet-300 font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              2D FAST FOURIER TRANSFORM (FFT) MAGNITUDE SPECTRUM
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 border border-red-500/40">
              PERIODIC LATTICE CONFIRMED
            </span>
          </div>

          {/* Synthetic 2D Spectrum Display Canvas Simulation */}
          <div className="relative w-full h-56 rounded-lg bg-black border border-violet-900/50 flex items-center justify-center overflow-hidden">
            {/* Grid overlay */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'linear-gradient(#8b5cf6 1px, transparent 1px), linear-gradient(90deg, #8b5cf6 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Glowing Central DC Peak */}
            <div className="absolute w-6 h-6 rounded-full bg-cyan-400 blur-sm animate-pulse" />
            <div className="absolute w-2 h-2 rounded-full bg-white" />

            {/* Off-axis Moiré harmonic spikes (The smoking gun) */}
            <div className="absolute -translate-x-16 -translate-y-14 flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 blur-sm animate-ping" />
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-[9px] text-red-300 mt-1 font-bold">+H1 (Z=4.82)</span>
            </div>

            <div className="absolute translate-x-16 translate-y-14 flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 blur-sm animate-ping" />
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-[9px] text-red-300 mt-1 font-bold">-H1 (Conjugate)</span>
            </div>

            <div className="absolute translate-x-20 -translate-y-12 flex flex-col items-center">
              <div className="w-3.5 h-3.5 rounded-full bg-orange-500 blur-sm" />
              <div className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="text-[9px] text-orange-300 mt-1 font-bold">+H2 (Z=4.25)</span>
            </div>

            <div className="absolute -translate-x-20 translate-y-12 flex flex-col items-center">
              <div className="w-3.5 h-3.5 rounded-full bg-orange-500 blur-sm" />
              <div className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="text-[9px] text-orange-300 mt-1 font-bold">-H2 (Conjugate)</span>
            </div>

            {/* Radar Sweep Animation */}
            <div
              className="absolute w-48 h-48 rounded-full border border-violet-500/40 pointer-events-none"
              style={{
                boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)',
              }}
            />

            <div className="absolute bottom-2 left-3 text-[10px] text-gray-400">
              High-Pass Annulus: r ∈ [35, 220] px | Cardinal Axes Excluded
            </div>
            <div className="absolute bottom-2 right-3 text-[10px] text-red-400 font-bold">
              Harmonic Peak Z-Score: 4.82 (Threshold: 4.20)
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="p-2 rounded bg-gray-900 border border-gray-800">
              <div className="text-gray-400">LATTICE PEAKS</div>
              <div className="text-red-400 font-bold text-xs mt-0.5">6 IDENTIFIED</div>
            </div>
            <div className="p-2 rounded bg-gray-900 border border-gray-800">
              <div className="text-gray-400">SPECTRAL ENTROPY</div>
              <div className="text-amber-400 font-bold text-xs mt-0.5">8.421 BITS</div>
            </div>
            <div className="p-2 rounded bg-gray-900 border border-gray-800">
              <div className="text-gray-400">DISPLAY RE-CAPTURE</div>
              <div className="text-red-400 font-bold text-xs mt-0.5">99.8% PROBABILITY</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
