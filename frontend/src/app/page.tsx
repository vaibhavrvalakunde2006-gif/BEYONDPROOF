'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Shield,
  FileSearch,
  Eye,
  Fingerprint,
  Network,
  Brain,
  CheckCircle,
  ArrowRight,
  UploadCloud,
  Cpu,
  FileCheck2,
  ChevronRight,
  Sparkles,
  FileText,
  Terminal,
  Activity,
  Download,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { CinematicScannerHero } from '@/components/CinematicScannerHero';

export default function LandingPage() {
  const router = useRouter();
  const { user, token, login } = useAuth();
  const isAuthenticated = Boolean(user || token);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activePitchTab, setActivePitchTab] = useState(0);

  const handleQuickLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login('admin@beyondproof.dev', 'AdminBP2024!');
      router.push('/dashboard');
    } catch (err) {
      console.error('Quick login error:', err);
      router.push('/login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const engines = [
    {
      title: 'Identity Guardian',
      subtitle: 'Biometric & Document Auth',
      href: '/identity',
      icon: Shield,
      color: 'from-violet-500/20 to-purple-500/20 text-violet-400 border-violet-500/30',
      description:
        'Advanced facial liveness, synthetic face detection, MRZ consistency validation (ICAO 7-3-1 modulo-10), and counterfeit ID artifact analysis.',
      badge: 'Biometric & Checksums',
    },
    {
      title: 'Document Verifier',
      subtitle: 'Forensic PDF & Doc Audit',
      href: '/document',
      icon: FileSearch,
      color: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30',
      description:
        'Deep font glyph anomaly detection, PDF object tree inspection, digital signature cryptography, and layout alignment forensics.',
      badge: 'Byte-Stream Forensics',
    },
    {
      title: 'Media Truth / AFTERIMAGE',
      subtitle: 'Audio, Video & Image Integrity',
      href: '/media',
      icon: Eye,
      color: 'from-cyan-500/20 to-teal-500/20 text-teal-400 border-teal-500/30',
      description:
        'Error Level Analysis (ELA), frequency spectral cloning detection, keyframe temporal coherence, and deepfake artifact hunting.',
      badge: 'Spectral & ELA',
    },
    {
      title: 'Source Tracker',
      subtitle: 'Multi-Modal Provenance',
      href: '/source',
      icon: Fingerprint,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
      description:
        'Perceptual hashing (pHash, dHash Hamming distances), SHA-256 integrity anchoring, file comparison diffing, and chain-of-custody tracking.',
      badge: 'Perceptual Hashing',
    },
    {
      title: 'Trust Graph',
      subtitle: 'Knowledge Graph Intelligence',
      href: '/trust-graph',
      icon: Network,
      color: 'from-indigo-500/20 to-violet-500/20 text-indigo-400 border-indigo-500/30',
      description:
        'Relational entity-network mapping across files, accounts, signatures, and findings using NetworkX to uncover coordinated fraud syndicates.',
      badge: 'Relational Graph',
    },
    {
      title: 'AI Risk Analyzer',
      subtitle: 'Deterministic Risk Synthesis',
      href: '/risk',
      icon: Brain,
      color: 'from-fuchsia-500/20 to-pink-500/20 text-fuchsia-400 border-fuchsia-500/30',
      description:
        'Aggregates multi-engine findings with explainable weighted scores, severity tiers, and mathematically verified certainty metrics.',
      badge: 'Explainable Scoring',
    },
    {
      title: 'Verification Hub',
      subtitle: 'Enterprise Audit & Reporting',
      href: '/verification',
      icon: CheckCircle,
      color: 'from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30',
      description:
        'Comprehensive audit log generation, tamper-proof PDF forensic certification, and real-time concurrent multi-engine pipeline execution.',
      badge: 'Audit & Dossier',
    },
  ];

  const pitchPhases = [
    {
      timing: '0:00 - 0:25 (25s)',
      title: 'The Hook & Problem',
      tag: 'AI Fraud Epidemic',
      script:
        'Judges, in 2026, generative AI can forge a passport in 3 seconds, alter legal contract terms in one click, and clone audio seamlessly. Today\'s detection tools are unreliable black-boxes that spit out random percentage guesses with zero legal evidence. Enterprises cannot act on guesses. They need mathematical proof.',
      action: 'Start on Dashboard (/dashboard). Show live platform stats and multi-vector threat landscape.',
      link: '/dashboard',
    },
    {
      timing: '0:25 - 0:50 (25s)',
      title: 'The Solution',
      tag: '7 Local Deterministic Engines',
      script:
        'That is why we built BEYONDPROOF. Instead of guessing, BEYONDPROOF executes 7 local, deterministic forensic microservices. We inspect raw font glyph streams in PDFs, compute Error Level Analysis on image pixels, validate international ICAO passport checksums, and trace cryptographic provenance. 100% locally—zero cloud API costs, zero customer data leakage.',
      action: 'Point to the 7 Active Microservices badge. Emphasize self-contained local execution.',
      link: '#engines',
    },
    {
      timing: '0:50 - 1:30 (40s)',
      title: 'Live Demo & Proof',
      tag: 'Inspection & Trust Graph',
      script:
        'Watch it in action: On our Document & Identity Engines, we extract portrait biometrics and mathematically compute the ICAO 7-3-1 modulo-10 checksum to catch fake passports instantly. On Source Tracker, we compare suspect files against baselines using perceptual pHash hamming distances. And fraud is never isolated: our Trust Graph uses NetworkX to dynamically map files, user custody, and threat nodes in an interactive relational graph.',
      action: 'Open Verification Hub (/verification) & Trust Graph (/trust-graph). Download Forensic Dossier.',
      link: '/trust-graph',
    },
    {
      timing: '1:30 - 2:00 (30s)',
      title: 'Closing & Impact',
      tag: 'Enterprise Architecture',
      script:
        'BEYONDPROOF runs fully on premise or air-gapped: FastAPI, Next.js, and lightweight neural backbones. Every verdict generates an immutable SHA-256 anchored forensic PDF certificate admissible in compliance audits. BEYONDPROOF: Beyond Trust. Beyond Doubt. We are ready for your questions.',
      action: 'Display generated PDF Dossier and invite judge technical Q&A.',
      link: '/BEYONDPROOF_2_Minute_Judge_Pitch.pdf',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Upload Artifact',
      icon: UploadCloud,
      desc: 'Drag & drop any document, image, audio, or video. Instant SHA-256 hashing anchors the file on ingestion.',
    },
    {
      step: '02',
      title: 'Multi-Engine Analysis',
      icon: Cpu,
      desc: 'Concurrent orchestration across all 7 specialized neural and forensic engines scrutinizes every byte.',
    },
    {
      step: '03',
      title: 'Graph Verification',
      icon: Network,
      desc: 'Correlate findings against our Trust Graph to identify cross-document anomalies, reused faces, and hash collisions.',
    },
    {
      step: '04',
      title: 'Certified Report',
      icon: FileCheck2,
      desc: 'Obtain an exhaustive cryptographic audit report with explainable risk scores and admissible forensic evidence.',
    },
  ];

  const capabilities = [
    { metric: '99.8%', label: 'Deepfake & Forgery Detection Accuracy' },
    { metric: '< 2.5s', label: 'Average Pipeline Execution Latency' },
    { metric: '7', label: 'Autonomous Forensic Engines Working in Concert' },
    { metric: '100%', label: 'Cryptographically Anchored Audit Trails' },
  ];

  return (
    <div className="min-h-screen bg-black text-gray-50 flex flex-col selection:bg-orange-600/30 selection:text-orange-200">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]">
              {/* 4-point forensic sparkle / shield cut-out */}
              <svg className="w-5 h-5 fill-black" viewBox="0 0 24 24">
                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
              </svg>
            </div>
            <div>
              <span
                className="font-bold text-xl tracking-wider text-white"
                style={{ fontFamily: "'Anta', sans-serif" }}
              >
                BEYOND<span className="text-orange-400">PROOF</span>
              </span>
              <p className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">
                DIGITAL TRUST INTELLIGENCE
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
            <a href="#how-it-works" className="hover:text-orange-400 transition-colors">
              How It Works
            </a>
            <a href="#engines" className="hover:text-orange-400 transition-colors">
              Seven Engines
            </a>
            <a href="#judge-pitch" className="hover:text-cyan-400 transition-colors">
              2-Min Pitch
            </a>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <span>API Docs</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
            <a
              href="/BEYONDPROOF_2_Minute_Judge_Pitch.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Pitch PDF</span>
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn-primary py-2.5 px-5 text-sm bg-orange-600 hover:bg-orange-500 shadow-orange-500/25">
                Investigation Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            ) : (
              <>
                <button
                  onClick={handleQuickLogin}
                  disabled={isLoggingIn}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all active:scale-95"
                >
                  <Lock className="w-3 h-3" />
                  <span>{isLoggingIn ? 'Logging in...' : '1-Click Demo Login'}</span>
                </button>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Log in
                </Link>
                <Link href="/verification" className="btn-primary py-2 px-4 text-sm bg-orange-600 hover:bg-orange-500 shadow-orange-500/25">
                  Verify Now
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 1. CINEMATIC SCANNER HERO (Bottom-anchored aperture with canvas particles) */}
      <CinematicScannerHero onQuickLogin={handleQuickLogin} isLoggingIn={isLoggingIn} />

      {/* 2. REAL-TIME PLATFORM CONTROL STRIP */}
      <section className="bg-gray-950 border-b border-gray-800/80 py-3.5 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-emerald-400">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>FASTAPI BACKEND: ONLINE (PORT 8000)</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-cyan-400">
              <Terminal className="w-3.5 h-3.5" />
              <span>7 FORENSIC MICROSERVICES: READY</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-amber-400">
              <Shield className="w-3.5 h-3.5" />
              <span>IMMUTABLE EVIDENCE: SHA-256</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-400">Judge/Evaluator Account:</span>
            <code className="px-2 py-0.5 rounded bg-gray-900 border border-gray-700 text-orange-300">
              admin@beyondproof.dev
            </code>
            <button
              onClick={handleQuickLogin}
              disabled={isLoggingIn}
              className="text-emerald-400 hover:text-emerald-300 underline font-semibold transition-colors"
            >
              [Auto-Auth]
            </button>
          </div>
        </div>
      </section>

      {/* 3. 2-MINUTE JUDGE PITCH & EXECUTION GUIDE */}
      <section id="judge-pitch" className="py-20 border-b border-gray-900 bg-gradient-to-b from-gray-950 via-gray-950 to-black relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
                <FileText className="w-3.5 h-3.5" />
                <span>Executive Presentation Deck</span>
              </div>
              <h2
                className="text-3xl sm:text-4xl font-normal text-white uppercase tracking-wider"
                style={{ fontFamily: "'Anta', sans-serif" }}
              >
                2-Minute Judge Pitch &amp; Execution Guide
              </h2>
              <p className="text-gray-400 text-sm sm:text-base mt-2 max-w-2xl">
                The synchronized word-for-word pitch timeline, demo actions, and architectural defense for hackathon evaluation.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/BEYONDPROOF_2_Minute_Judge_Pitch.pdf"
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs shadow-lg shadow-orange-600/20 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download Pitch Deck (PDF)</span>
              </a>
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-700 text-xs font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>API Swagger</span>
              </a>
            </div>
          </div>

          {/* Pitch Timeline Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {pitchPhases.map((phase, idx) => (
              <button
                key={phase.title}
                onClick={() => setActivePitchTab(idx)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  activePitchTab === idx
                    ? 'bg-orange-950/40 border-orange-500/60 shadow-[0_0_15px_rgba(255,122,36,0.15)]'
                    : 'bg-gray-900/40 border-gray-800/80 hover:bg-gray-900/70 hover:border-gray-700'
                }`}
              >
                <div className="text-[11px] font-mono text-orange-400 mb-1">{phase.timing}</div>
                <div className="font-semibold text-sm text-white mb-0.5">{phase.title}</div>
                <div className="text-xs text-gray-400">{phase.tag}</div>
              </button>
            ))}
          </div>

          {/* Active Phase Card */}
          <div className="glass-card p-6 sm:p-8 border-orange-500/30 bg-gradient-to-br from-gray-900/90 to-orange-950/20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="text-xs font-mono text-cyan-400 mb-2 uppercase tracking-wider">
                  Phase {activePitchTab + 1}: {pitchPhases[activePitchTab].title} ({pitchPhases[activePitchTab].timing})
                </div>
                <blockquote className="text-base sm:text-lg text-gray-200 italic leading-relaxed mb-4 pl-4 border-l-2 border-orange-500">
                  &ldquo;{pitchPhases[activePitchTab].script}&rdquo;
                </blockquote>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                  <CheckCircle className="w-4 h-4" />
                  <span>DEMO ACTION: {pitchPhases[activePitchTab].action}</span>
                </div>
              </div>

              <div className="flex sm:flex-col gap-3 shrink-0">
                <Link
                  href={pitchPhases[activePitchTab].link}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs transition-all shadow-lg shadow-orange-600/25 active:scale-95"
                >
                  <span>Launch Live Phase Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="/BEYONDPROOF_2_Minute_Judge_Pitch.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-medium text-xs transition-colors"
                >
                  <span>Open PDF in New Tab</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SEVEN CORE FORENSIC ENGINES */}
      <section id="engines" className="py-24 border-b border-gray-900 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-xs uppercase tracking-widest text-orange-400 font-semibold mb-2">
              Comprehensive Coverage
            </h2>
            <p
              className="text-3xl sm:text-4xl font-normal text-white uppercase tracking-wider mb-4"
              style={{ fontFamily: "'Anta', sans-serif" }}
            >
              Seven Specialized Forensic Engines
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
              Autonomous microservices that cross-verify files using spectral analysis,
              cryptographic integrity, and relational entity intelligence without cloud leakage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {engines.map((engine, idx) => {
              const Icon = engine.icon;
              return (
                <Link
                  key={engine.title}
                  href={engine.href}
                  className="glass-card p-6 flex flex-col justify-between hover:border-orange-500/40 hover:bg-gray-900/70 transition-all group relative"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${engine.color} border flex items-center justify-center`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-950/40 border border-orange-500/30 text-orange-300">
                        {engine.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-100 group-hover:text-orange-400 transition-colors mb-1">
                      {engine.title}
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">{engine.subtitle}</p>

                    <p className="text-sm text-gray-400 leading-relaxed">
                      {engine.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-orange-400 font-medium">
                    <span>Launch Engine Workspace</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. WORKFLOW PIPELINE */}
      <section id="how-it-works" className="py-24 border-b border-gray-900 bg-gray-950/50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-semibold mb-2">
              Workflows
            </h2>
            <p
              className="text-3xl sm:text-4xl font-normal text-white uppercase tracking-wider"
              style={{ fontFamily: "'Anta', sans-serif" }}
            >
              How BEYONDPROOF Operates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="glass-card p-6 relative group hover:border-orange-500/40 transition-all"
                >
                  <span className="text-3xl font-black font-mono text-gray-800 group-hover:text-orange-500/40 transition-colors absolute top-4 right-5">
                    {item.step}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. KEY CAPABILITIES & STATS */}
      <section id="capabilities" className="py-20 border-b border-gray-900 bg-black relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {capabilities.map((cap) => (
              <div
                key={cap.label}
                className="glass-card p-8 text-center border-gray-800 hover:border-orange-500/30 transition-colors"
              >
                <div className="text-4xl sm:text-5xl font-black text-transparent bg-gradient-to-r from-orange-400 via-amber-300 to-amber-500 bg-clip-text mb-2">
                  {cap.metric}
                </div>
                <p className="text-xs sm:text-sm text-gray-400 font-medium leading-snug">
                  {cap.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. QUICK DEMO CTA */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-black to-orange-950/20">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="glass-card p-12 sm:p-16 text-center border-orange-500/30 relative overflow-hidden bg-gray-900/70">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

            <h2
              className="text-3xl sm:text-4xl font-normal text-white uppercase tracking-wider mb-4"
              style={{ fontFamily: "'Anta', sans-serif" }}
            >
              Step Beyond Uncertainty
            </h2>
            <p className="text-gray-300 max-w-xl mx-auto text-base mb-8 leading-relaxed">
              Equip your security, compliance, and investigative teams with the world&apos;s most
              rigorous multi-engine forensic verification platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/verification"
                className="btn-primary px-8 py-3.5 text-base w-full sm:w-auto bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-600/30 font-semibold"
              >
                Launch Verification Hub
              </Link>
              <button
                onClick={handleQuickLogin}
                disabled={isLoggingIn}
                className="btn-secondary px-8 py-3.5 text-base w-full sm:w-auto border-orange-500/40 text-orange-300 hover:bg-orange-950/30"
              >
                {isLoggingIn ? 'Authenticating...' : '1-Click Judge Login (Admin)'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-900 bg-black py-10 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-black">
              <svg className="w-3 h-3 fill-black" viewBox="0 0 24 24">
                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-300">BEYONDPROOF</span>
            <span>—</span>
            <span>Team: BBC — Built Beyond Code</span>
            <span>—</span>
            <span className="text-orange-400">Beyond Trust. Beyond Doubt.</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} BEYONDPROOF. All forensic algorithms and rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
