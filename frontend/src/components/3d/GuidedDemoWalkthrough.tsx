'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  FileCheck,
  FileWarning,
  Eye,
  Shield,
  Network,
  Download,
  CheckCircle2,
  HelpCircle,
  Play,
  RotateCcw,
} from 'lucide-react';

interface Scenario {
  id: string;
  title: string;
  category: string;
  badge: string;
  status: 'clean' | 'suspicious' | 'critical';
  description: string;
  route: string;
  expectedFindings: string[];
}

export function GuidedDemoWalkthrough() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedScenario, setSelectedScenario] = useState<string>('scenario-2');

  const steps = [
    {
      num: 1,
      title: 'Upload Evidence',
      desc: 'Drag & drop or load sample artifacts into the 3D Intake Chamber.',
      actionRoute: '/upload',
    },
    {
      num: 2,
      title: 'Select Engines',
      desc: 'Choose from 7 autonomous microservices (Identity, Document, Media, etc.).',
      actionRoute: '/upload',
    },
    {
      num: 3,
      title: 'Start Investigation',
      desc: 'Execute concurrent background analysis with zero cloud data leakage.',
      actionRoute: '/verification',
    },
    {
      num: 4,
      title: 'Watch Analysis',
      desc: 'Observe live deterministic signal extraction and telemetry streams.',
      actionRoute: '/verification',
    },
    {
      num: 5,
      title: 'Inspect Findings',
      desc: 'Deep-dive into font anomalies, ELA maps, and biometric checksums.',
      actionRoute: '/document',
    },
    {
      num: 6,
      title: 'Explore Trust Graph',
      desc: 'Trace cross-file syndicates, shared faces, and hash collisions in 3D.',
      actionRoute: '/trust-graph',
    },
    {
      num: 7,
      title: 'Generate Dossier',
      desc: 'Export a tamper-proof cryptographic PDF report for legal audit.',
      actionRoute: '/verification',
    },
  ];

  const scenarios: Scenario[] = [
    {
      id: 'scenario-1',
      title: 'Clean Banking Statement',
      category: 'Document Verifier',
      badge: 'Normal Document',
      status: 'clean',
      description: 'Standard authentic PDF with uniform font metrics and intact timestamp hashes.',
      route: '/document',
      expectedFindings: ['Font metrics uniform', 'PDF trailer intact', 'Low Risk Score: 0.08'],
    },
    {
      id: 'scenario-2',
      title: 'Counterfeit Passport (MRZ Anomaly)',
      category: 'Identity Guardian',
      badge: 'Suspicious Alteration',
      status: 'critical',
      description: 'Synthetic travel ID with mathematically invalid ICAO 7-3-1 modulo-10 checksum.',
      route: '/identity',
      expectedFindings: ['MRZ Checksum Failure', 'Face Liveness Inconsistency', 'Critical Risk: 0.88'],
    },
    {
      id: 'scenario-3',
      title: 'Synthetic Deepfake Portrait',
      category: 'Media Truth / AFTERIMAGE',
      badge: 'Manipulated Image',
      status: 'suspicious',
      description: 'AI-generated executive face exhibiting high-frequency Fourier spectral cloning artifacts.',
      route: '/media',
      expectedFindings: ['ELA Compression Residuals', 'Frequency Domain Artifacts', 'Suspicious: 0.76'],
    },
    {
      id: 'scenario-4',
      title: 'Contract PDF Font Discrepancy',
      category: 'Document Verifier',
      badge: 'Font Stream Alteration',
      status: 'suspicious',
      description: 'Legal agreement where payout amount clause was replaced in an un-embedded Helvetica stream.',
      route: '/document',
      expectedFindings: ['Inconsistent Font Glyphs', 'Modified PDF Stream', 'Suspicious: 0.72'],
    },
    {
      id: 'scenario-5',
      title: 'File Integrity & Hash Provenance',
      category: 'Source Tracker',
      badge: 'Provenance Comparison',
      status: 'clean',
      description: 'Perceptual hashing (pHash) comparison detecting near-duplicate image tampering.',
      route: '/source',
      expectedFindings: ['pHash Hamming Distance: 3', 'SHA-256 Anchored', 'Verified Baseline'],
    },
    {
      id: 'scenario-6',
      title: 'Coordinated Syndicate Ring',
      category: 'Trust Graph',
      badge: 'Entity Correlation',
      status: 'critical',
      description: 'NetworkX graph uncovering a criminal ring sharing the same forged face across 4 accounts.',
      route: '/trust-graph',
      expectedFindings: ['Cross-file entity match', 'Reused biometric node', 'Syndicate Flagged'],
    },
    {
      id: 'scenario-7',
      title: 'Certified Court Forensic Report',
      category: 'Verification Hub',
      badge: 'Admissible Dossier',
      status: 'clean',
      description: 'Exhaustive cryptographic PDF certificate with explainable multi-engine evidence.',
      route: '/verification',
      expectedFindings: ['Immutable SHA-256 anchor', 'All 7 engines compiled', 'Downloadable PDF'],
    },
  ];

  const handleLaunchScenario = (s: Scenario) => {
    router.push(s.route);
  };

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      const next = currentStep + 1;
      setCurrentStep(next);
      router.push(steps[next - 1].actionRoute);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      router.push(steps[prev - 1].actionRoute);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-600 via-violet-600 to-orange-600 text-white font-medium text-xs shadow-[0_0_25px_rgba(0,229,255,0.4)] hover:scale-105 active:scale-95 transition-all group"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="font-bold tracking-wider font-mono">JUDGE DEMO MODE</span>
          <span className="bg-black/40 px-2 py-0.5 rounded-full text-[10px] font-mono text-cyan-200">
            7 Scenarios
          </span>
        </button>
      )}

      {/* Floating Demo Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-lg bg-[#0B0D12]/95 border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_40px_rgba(0,229,255,0.3)] backdrop-blur-2xl overflow-hidden flex flex-col text-gray-100 max-h-[85vh]">
          {/* Header */}
          <div className="p-4 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Judge Walkthrough &amp; Demonstration</span>
                  <span className="text-[10px] font-mono bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.2 rounded">
                    SAMPLE EVIDENCE
                  </span>
                </h3>
                <p className="text-[10px] text-gray-400 font-mono">
                  BEYONDPROOF Forensic Verification Assistant
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto space-y-5">
            {/* 7-Step Interactive Pipeline Guide */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStep === 1}
                    className="p-1 rounded bg-gray-800 text-gray-400 hover:text-white disabled:opacity-40"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={currentStep === steps.length}
                    className="p-1 rounded bg-gray-800 text-gray-400 hover:text-white disabled:opacity-40"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 text-xs">
                <p className="text-gray-300 leading-relaxed mb-2">
                  {steps[currentStep - 1].desc}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-orange-400">
                    Active View: {steps[currentStep - 1].actionRoute}
                  </span>
                  <button
                    onClick={() => router.push(steps[currentStep - 1].actionRoute)}
                    className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Go to Step &rarr;</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 7 Preset Demonstration Scenarios */}
            <div>
              <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Select 1-Click Forensic Scenario</span>
                <span className="text-[10px] text-cyan-400">7 Pre-Loaded</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {scenarios.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedScenario(s.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedScenario === s.id
                        ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                        : 'bg-gray-900/50 border-gray-800 hover:bg-gray-900 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        {s.status === 'clean' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {s.status === 'suspicious' && <FileWarning className="w-3.5 h-3.5 text-amber-400" />}
                        {s.status === 'critical' && <FileWarning className="w-3.5 h-3.5 text-red-400" />}
                        <span>{s.title}</span>
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-cyan-300">
                        {s.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-400 mb-2 leading-relaxed">{s.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-800/80">
                      <div className="flex flex-wrap gap-1">
                        {s.expectedFindings.map((f) => (
                          <span
                            key={f}
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-gray-300 border border-gray-800"
                          >
                            {f}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchScenario(s);
                        }}
                        className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-[10px] flex items-center gap-1 shrink-0 ml-2"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Pitch Deck Download */}
            <div className="p-3 rounded-xl bg-orange-950/20 border border-orange-500/30 flex items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-orange-200">2-Minute Judge Pitch PDF</div>
                <div className="text-[10px] text-gray-400 font-mono">
                  Full 120s script, architecture &amp; Q&amp;A defense
                </div>
              </div>
              <a
                href="/BEYONDPROOF_2_Minute_Judge_Pitch.pdf"
                download
                className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium text-[11px] flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
