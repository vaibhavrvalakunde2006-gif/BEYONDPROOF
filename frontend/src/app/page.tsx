'use client';

import React from 'react';
import Link from 'next/link';
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
  FileSpreadsheet,
  Lock,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function LandingPage() {
  const { user, token } = useAuth();
  const isAuthenticated = Boolean(user || token);

  const engines = [
    {
      title: 'Identity Guardian',
      subtitle: 'Biometric & Document Auth',
      icon: Shield,
      color: 'from-violet-500/20 to-purple-500/20 text-violet-400 border-violet-500/30',
      description:
        'Advanced facial liveness, synthetic face detection, MRZ consistency validation, and counterfeit ID artifact analysis.',
    },
    {
      title: 'Document Verifier',
      subtitle: 'Forensic PDF & Doc Audit',
      icon: FileSearch,
      color: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30',
      description:
        'Deep font anomaly detection, PDF object tree inspection, digital signature cryptography, and layout alignment forensics.',
    },
    {
      title: 'Media Truth / AFTERIMAGE',
      subtitle: 'Audio, Video & Image Integrity',
      icon: Eye,
      color: 'from-cyan-500/20 to-teal-500/20 text-teal-400 border-teal-500/30',
      description:
        'Error Level Analysis (ELA), frequency spectral cloning detection, keyframe temporal coherence, and deepfake artifact hunting.',
    },
    {
      title: 'Source Tracker',
      subtitle: 'Multi-Modal Provenance',
      icon: Fingerprint,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
      description:
        'Perceptual hashing (pHash, dHash), SHA-256 integrity anchoring, file comparison diffing, and chain-of-custody tracking.',
    },
    {
      title: 'Trust Graph',
      subtitle: 'Knowledge Graph Intelligence',
      icon: Network,
      color: 'from-indigo-500/20 to-violet-500/20 text-indigo-400 border-indigo-500/30',
      description:
        'Entity-relationship network mapping across files, accounts, signatures, and findings to uncover coordinated manipulation syndicates.',
    },
    {
      title: 'AI Risk Analyzer',
      subtitle: 'Deterministic Risk Synthesis',
      icon: Brain,
      color: 'from-fuchsia-500/20 to-pink-500/20 text-fuchsia-400 border-fuchsia-500/30',
      description:
        'Aggregates multi-engine findings with explainable weighted scores, severity tiers, and verifiable certainty metrics.',
    },
    {
      title: 'Verification Hub',
      subtitle: 'Enterprise Audit & Reporting',
      icon: CheckCircle,
      color: 'from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30',
      description:
        'Comprehensive audit log generation, tamper-proof PDF certification, and real-time multi-engine pipeline execution.',
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
    <div className="min-h-screen bg-gray-950 text-gray-50 flex flex-col selection:bg-violet-600/30 selection:text-violet-200">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-wider text-gray-50">
                BEYOND<span className="text-violet-400">PROOF</span>
              </span>
              <p className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">
                CYBER FORENSICS
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-300">
            <a href="#how-it-works" className="hover:text-violet-400 transition-colors">
              How It Works
            </a>
            <a href="#engines" className="hover:text-violet-400 transition-colors">
              Engines
            </a>
            <a href="#capabilities" className="hover:text-violet-400 transition-colors">
              Capabilities
            </a>
            <a
              href="/hero.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Cinematic Hero
            </a>
            <a
              href="/BEYONDPROOF_2_Minute_Judge_Pitch.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Judge Pitch PDF
            </a>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn-primary py-2.5 px-5 text-sm">
                Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Log in
                </Link>
                <Link href="/register" className="btn-primary py-2 px-5 text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-cyan-500/15 blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Multi-Engine Deepfake & Forensic Verification Architecture
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6">
              <span className="block text-gray-100">BEYONDPROOF</span>
              <span className="gradient-text">Beyond Trust. Beyond Doubt.</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-10">
              The premier cyber forensic verification platform combining synthetic media
              detection, document forgery analysis, biometric liveness validation, and
              entity trust graph intelligence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={isAuthenticated ? '/dashboard' : '/register'}
                className="btn-primary w-full sm:w-auto text-base px-8 py-3.5 group shadow-xl shadow-violet-600/25"
              >
                <span>Launch Forensic Hub</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#engines"
                className="btn-secondary w-full sm:w-auto text-base px-8 py-3.5"
              >
                Explore 7 Engines
              </a>
              <a
                href="/hero.html"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium text-base transition-colors"
              >
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>Cinematic Scanner</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 border-t border-gray-900 bg-gray-950/50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-semibold mb-2">
              Workflows
            </h2>
            <p className="text-3xl sm:text-4xl font-bold text-gray-100">
              How BEYONDPROOF Operates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="glass-card p-6 relative group hover:border-violet-500/40 transition-all"
                >
                  <span className="text-3xl font-black font-mono text-gray-800 group-hover:text-violet-500/40 transition-colors absolute top-4 right-5">
                    {item.step}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Seven Engines Section */}
      <section id="engines" className="py-24 border-t border-gray-900 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-2">
              Comprehensive Coverage
            </h2>
            <p className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4">
              Seven Specialized Forensic Engines
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
              Autonomous microservices that cross-verify files using spectral analysis,
              cryptographic integrity, and relational entity intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {engines.map((engine, idx) => {
              const Icon = engine.icon;
              return (
                <motion.div
                  key={engine.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="glass-card p-6 flex flex-col justify-between hover:border-violet-500/40 transition-all group"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${engine.color} border flex items-center justify-center`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-100 group-hover:text-violet-300 transition-colors">
                          {engine.title}
                        </h3>
                        <p className="text-xs text-gray-400">{engine.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {engine.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-violet-400 font-medium">
                    <span>Engine Active</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Capabilities & Stats */}
      <section id="capabilities" className="py-24 border-t border-gray-900 bg-gray-950/60 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {capabilities.map((cap, idx) => (
              <motion.div
                key={cap.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="glass-card p-8 text-center border-gray-800"
              >
                <div className="text-4xl sm:text-5xl font-black gradient-text mb-2">
                  {cap.metric}
                </div>
                <p className="text-xs sm:text-sm text-gray-400 font-medium leading-snug">
                  {cap.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="glass-card p-12 sm:p-16 text-center border-violet-500/30 relative overflow-hidden bg-gradient-to-b from-gray-900/90 to-violet-950/20">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

            <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4">
              Step Beyond Uncertainty Today
            </h2>
            <p className="text-gray-300 max-w-xl mx-auto text-base mb-8 leading-relaxed">
              Equip your security, compliance, and investigative teams with the world's most
              rigorous multi-engine forensic verification platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="btn-primary px-8 py-3.5 text-base w-full sm:w-auto shadow-lg shadow-violet-600/30"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="btn-secondary px-8 py-3.5 text-base w-full sm:w-auto"
              >
                Sign In to Console
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-900 bg-gray-950 py-10 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-gray-300">BEYONDPROOF</span>
            <span>—</span>
            <span>Team: BBC — Built Beyond Code</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} BEYONDPROOF. All forensic algorithms and rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
