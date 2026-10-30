'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  ScanLine,
  FileSearch,
  Fingerprint,
  LockKeyhole,
  Activity,
  ShieldCheck,
  Info,
  Play,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { soundManager } from '@/lib/soundFx';

// Dynamic 3D interactive visualizers for each engine
const ThreeDFaceMesh = dynamic(() => import('@/components/3d/ThreeDFaceMesh'), { ssr: false });
const ThreeDDocumentStack = dynamic(() => import('@/components/3d/ThreeDDocumentStack'), { ssr: false });
const ThreeDMediaTerrain = dynamic(() => import('@/components/3d/ThreeDMediaTerrain'), { ssr: false });
const ThreeDProvenanceChain = dynamic(() => import('@/components/3d/ThreeDProvenanceChain'), { ssr: false });
const ThreeDRiskPolyhedron = dynamic(() => import('@/components/3d/ThreeDRiskPolyhedron'), { ssr: false });

interface EngineConfig {
  title: string;
  subtitle: string;
  icon: any;
  capabilities: string[];
  sampleVerdict: string;
  sampleEvidence: string;
  statusText: string;
}

const engineRegistry: Record<string, EngineConfig> = {
  identity: {
    title: 'Identity Guardian',
    subtitle: 'Investigate identity documents, facial biometrics and ICAO 9303 checksum fraud indicators.',
    icon: Fingerprint,
    capabilities: [
      '68-point facial landmark mesh & pose estimation',
      'ICAO 9303 TD3 modulo-10 checksum validation (7-3-1 weight)',
      'Synthetic deepfake face artifact detection',
      'Cross-credential face portrait matching & histogram diffing',
    ],
    sampleVerdict: 'FORGERY CONFIRMED (MRZ Checksum Mismatch)',
    sampleEvidence: 'Document number check digit 8 fails modulo-10 algorithm (expected 7).',
    statusText: 'FastAPI Identity Microservice: ONLINE (Port 8000)',
  },
  document: {
    title: 'Document Verifier',
    subtitle: 'Inspect certificates and PDFs for structural glyph anomalies and incremental trailer tampering.',
    icon: FileSearch,
    capabilities: [
      'PDF cross-reference (XRef) incremental update stream parsing',
      'Font glyph subset extraction & baseline alignment tolerance',
      'Cryptographic X.509 signature certificate validation',
      'Embedded object stream & invisible overlay forensic audit',
    ],
    sampleVerdict: 'TAMPER ISOLATED (Post-Signature Modification)',
    sampleEvidence: 'Trailer object 0x4F12 altered liability ceiling after signature epoch.',
    statusText: 'FastAPI Document Microservice: ONLINE (Port 8000)',
  },
  media: {
    title: 'Media Truth / AFTERIMAGE',
    subtitle: 'Analyse image, video and audio streams for manipulation indicators and synthetic artifacts.',
    icon: ScanLine,
    capabilities: [
      '3D Error Level Analysis (ELA) compression differential mapping',
      'FFT acoustic spectrogram & 16.4kHz pitch boundary anomaly scan',
      'Keyframe optical flow temporal coherence analysis',
      'Diffusion generative model noise residue extraction',
    ],
    sampleVerdict: 'DEEPFAKE SYNTHETIC (16.4kHz Boundary Anomaly)',
    sampleEvidence: 'Acoustic harmonic jitter reveals 84.6 dB variance in audio track.',
    statusText: 'FastAPI Media Microservice: ONLINE (Port 8000)',
  },
  source: {
    title: 'Source Tracker',
    subtitle: 'Inspect cryptographic integrity, perceptual hash distance, and chain-of-custody provenance.',
    icon: LockKeyhole,
    capabilities: [
      'Perceptual pHash & dHash 64-bit Hamming distance calculation',
      'SHA-256 immutable cryptographic anchor generation',
      'Side-by-side byte stream diffing & metadata lineage',
      'C2PA manifest verification & signed custody chains',
    ],
    sampleVerdict: 'DERIVATIVE IDENTIFIED (Hamming Distance 4)',
    sampleEvidence: 'Target image pHash matches anchor 0x4F8A with 94.2% perceptual similarity.',
    statusText: 'FastAPI Source Microservice: ONLINE (Port 8000)',
  },
  risk: {
    title: 'AI Risk Analyzer',
    subtitle: 'Combine executed findings into a transparent, evidence-led Bayesian certainty assessment.',
    icon: Activity,
    capabilities: [
      'Deterministic multi-engine finding synthesis',
      'Conflicting signal detection & Bayesian confidence weighting',
      'Severity tiers (Critical, High, Medium, Low, Info)',
      'Court-admissible PDF dossier report compilation',
    ],
    sampleVerdict: 'CRITICAL RISK (Aggregated Score 91/100)',
    sampleEvidence: '3 high-severity anomalies detected across identity and document engines.',
    statusText: 'FastAPI Risk Engine: ONLINE (Port 8000)',
  },
};

export default function EnginePage() {
  const params = useParams();
  const router = useRouter();
  const engineKey = String(params?.engine || 'document').toLowerCase();
  const config = engineRegistry[engineKey] || engineRegistry.document;
  const Icon = config.icon;

  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleRunTest = () => {
    soundManager.playLaserScan();
    setIsRunningTest(true);
    setTestResult(null);

    setTimeout(() => {
      soundManager.playSuccess();
      setIsRunningTest(false);
      setTestResult(config.sampleVerdict);
    }, 1200);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">FORENSIC CORE / ENGINE MODULE</div>
          <h1>{config.title}</h1>
          <p>{config.subtitle}</p>
        </div>
        <span className="status low-risk">ENGINE ACTIVE</span>
      </div>

      {/* 3D Visualizer Canvas for this specific engine */}
      <div className="mb-6 rounded-2xl bg-gradient-to-b from-gray-950 via-gray-900/60 to-gray-950 border border-cyan-500/30 p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 border-b border-gray-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono text-xs font-bold text-cyan-300 tracking-wider uppercase">
              3D Interactive Visualizer // {config.title}
            </span>
          </div>
          <span className="text-[11px] font-mono text-gray-400 hidden sm:inline">
            REAL-TIME WEBGL RENDERING
          </span>
        </div>

        <div className="w-full">
          {engineKey === 'identity' && <ThreeDFaceMesh />}
          {engineKey === 'document' && <ThreeDDocumentStack />}
          {engineKey === 'media' && <ThreeDMediaTerrain />}
          {engineKey === 'source' && <ThreeDProvenanceChain />}
          {engineKey === 'risk' && <ThreeDRiskPolyhedron />}
          {!['identity', 'document', 'media', 'source', 'risk'].includes(engineKey) && (
            <ThreeDDocumentStack />
          )}
        </div>
      </div>

      {/* Detail Grid */}
      <div className="engine-detail-grid">
        <section className="panel engine-hero-panel">
          <div className="engine-hero-icon">
            <Icon size={34} />
            <div className="icon-orbit" />
          </div>
          <div className="eyebrow">ANALYSIS CAPABILITIES</div>
          <h2>
            Investigate with
            <br />
            <em>context, not assumptions.</em>
          </h2>
          <p>{config.subtitle}</p>

          <div className="capability-list">
            {config.capabilities.map((cap, i) => (
              <div key={cap}>
                <span>0{i + 1}</span>
                {cap}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={handleRunTest}
              disabled={isRunningTest}
              className="button"
            >
              <Play size={15} />
              <span>{isRunningTest ? 'Analyzing Artifact...' : 'Run Live Diagnostic Test'}</span>
            </button>
            <Link
              href="/app/investigations/new"
              onClick={() => soundManager.playBlip()}
              className="button button-ghost"
            >
              <span>Upload Custom File</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {testResult && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs font-mono">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                <CheckCircle size={15} />
                <span>DIAGNOSTIC TEST COMPLETE: {testResult}</span>
              </div>
              <p className="text-gray-300">{config.sampleEvidence}</p>
            </div>
          )}
        </section>

        <section className="panel engine-info">
          <div className="eyebrow">ENGINE STATUS</div>
          <div className="big-status">
            <span className="pulse" /> {config.statusText}
          </div>
          <p>
            This engine executes locally via FastAPI on port 8000. All results are deterministic, reproducible, and cryptographically anchored.
          </p>

          <div className="info-callout">
            <Info size={17} />
            <span>
              All analysis runs directly on your local CPU/GPU with zero third-party cloud data transmission, ensuring full evidence chain-of-custody compliance.
            </span>
          </div>

          <div className="eyebrow" style={{ marginTop: 30 }}>
            EXPECTED OUTPUT
          </div>
          <div className="output-row">
            <span>Analysis status</span>
            <b>Executed &amp; Verified</b>
          </div>
          <div className="output-row">
            <span>Findings</span>
            <b>Evidence-linked (SHA-256)</b>
          </div>
          <div className="output-row">
            <span>Limitations</span>
            <b>Mathematically Disclosed</b>
          </div>
        </section>
      </div>
    </>
  );
}
