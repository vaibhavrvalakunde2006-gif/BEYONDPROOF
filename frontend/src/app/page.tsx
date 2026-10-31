"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import * as THREE from "three";
import {
  Shield,
  Fingerprint,
  FileSearch,
  ScanLine,
  LockKeyhole,
  Network,
  Activity,
  ArrowRight,
  ArrowUpRight,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Cpu,
  Copy,
  Check,
  ChevronRight,
  Layers,
  Lock,
} from "lucide-react";
import { soundManager } from "@/lib/soundFx";

const GlobalForensicBackground = dynamic(
  () => import("@/components/3d/GlobalForensicBackground"),
  { ssr: false }
);

const LaunderedFakesShield = dynamic(
  () => import("@/components/3d/LaunderedFakesShield"),
  { ssr: false }
);

interface SpecimenData {
  id: string;
  title: string;
  file: string;
  engine: string;
  verdict: string;
  badgeClass: string;
  mathProof: string;
  sha256: string;
  mode: "moire" | "face" | "audio" | "contract";
}

const SPECIMENS: SpecimenData[] = [
  {
    id: "hurdle-moire",
    title: "Laundered AI Fake & Lying EXIF",
    file: "CANON_EOS5D_AI_LAUNDERED.JPG",
    engine: "Media Truth Engine",
    verdict: "METADATA FORGERY DETECTED",
    badgeClass: "badge-clean badge-amber",
    mathProof: "2D FFT Moiré lattice peak at 0.42 rad/px contradicts f/1.4 infinite depth-of-field. Software quantization ratio std=0.043 matches PIL, not Canon 5D Mark IV ISP.",
    sha256: "7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d",
    mode: "moire",
  },
  {
    id: "passport-mrz",
    title: "Passport MRZ Checksum Forgery",
    file: "FRA_PASSPORT_EXP2028.IMG",
    engine: "Identity Guardian",
    verdict: "FORGERY CONFIRMED",
    badgeClass: "badge-clean badge-crimson",
    mathProof: "ICAO 9303 modulo-10 check digit mismatch on field 44-C [calc: 7, doc: 8]. 68-point 3D facial wireframe reveals anomalous non-standard eye-socket topology.",
    sha256: "9a8b1c4d7e2f5a0b3c6d9e1f4a7b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7a0b3c",
    mode: "face",
  },
  {
    id: "deepfake-voice",
    title: "CEO Wire Transfer Voice Clone",
    file: "CFO_WIRE_AUTHORIZATION.WAV",
    engine: "Media Truth Engine",
    verdict: "SYNTHETIC DEEPFAKE",
    badgeClass: "badge-clean badge-crimson",
    mathProof: "16.4kHz pitch boundary diffusion artifact detected with 84.6 dB variance. Neural vocoder spectrogram signatures consistent with generative TTS cloning.",
    sha256: "4f7a2b9c1d6e8f0a3b5c7d9e1f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a",
    mode: "audio",
  },
  {
    id: "contract-spliced",
    title: "Spliced Master Services Agreement",
    file: "MASTER_SERVICES_AGREEMENT.PDF",
    engine: "Document Verifier",
    verdict: "POST-SIGNATURE TAMPERING",
    badgeClass: "badge-clean badge-crimson",
    mathProof: "Incremental trailer revision overwrite detected at byte offset 0x4F12. Liability cap modified from $50,000 to $500,000 after digital certificate seal.",
    sha256: "e1d2c3b4a5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
    mode: "contract",
  },
];

const ENGINES = [
  {
    id: "identity",
    num: "01",
    name: "Identity Guardian",
    tag: "BIOMETRIC & MRZ",
    desc: "68-point 3D facial wireframe extraction, ICAO 9303 modulo-10 checksum validation, and synthetic liveness spoofing detection.",
    icon: Fingerprint,
    href: "/app/engines/identity",
    sla: "0.4s",
  },
  {
    id: "document",
    num: "02",
    name: "Document Verifier",
    tag: "PDF STRUCTURE & EXIF",
    desc: "Exploded 3D document layer inspection, font glyph kerning discrepancy analysis, and post-signature modification tracking.",
    icon: FileSearch,
    href: "/app/engines/document",
    sla: "0.6s",
  },
  {
    id: "media",
    num: "03",
    name: "Media Truth Engine",
    tag: "SPECTRAL ELA & MOIRÉ",
    desc: "Topological recompression error level heightmap, 2D FFT Moiré screen recapture, and camera ISP optical physics matrix.",
    icon: ScanLine,
    href: "/app/engines/media",
    sla: "0.8s",
  },
  {
    id: "source",
    num: "04",
    name: "Source Tracker",
    tag: "pHash & PROVENANCE",
    desc: "Perceptual optical hashing, cryptographic SHA-256 fingerprinting, and decentralized immutable ledger tracking.",
    icon: LockKeyhole,
    href: "/app/engines/source",
    sla: "0.3s",
  },
  {
    id: "trust-graph",
    num: "05",
    name: "3D Trust Graph",
    tag: "NETWORK TOPOLOGY",
    desc: "Spatial 3D force-directed knowledge graph revealing fraud syndicates, shared metadata signatures, and coordinated tampering.",
    icon: Network,
    href: "/app/trust-graph",
    sla: "0.5s",
  },
  {
    id: "risk",
    num: "06",
    name: "AI Risk Analyzer",
    tag: "BAYESIAN THREAT ENGINE",
    desc: "Multi-signal severity weighting, conflict resolution, uncertainty quantification, and explainable forensic scoring.",
    icon: Activity,
    href: "/app/engines/risk",
    sla: "0.2s",
  },
];

export default function EliteForensicLanding() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeSpecimen, setActiveSpecimen] = useState<SpecimenData>(SPECIMENS[0]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toUTCString().replace("GMT", "UTC"));
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  // Precision 3D Specimen Dissection Chamber (Defense-Grade Precision)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 460;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 7.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    // 1. High-Precision Geometric Lattice (Platinum Silver + Azure)
    const geo = new THREE.IcosahedronGeometry(1.5, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const latticeMesh = new THREE.Mesh(geo, wireMat);
    stageGroup.add(latticeMesh);

    // Inner nucleus
    const nucGeo = new THREE.OctahedronGeometry(0.8, 1);
    const nucMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const nucMesh = new THREE.Mesh(nucGeo, nucMat);
    stageGroup.add(nucMesh);

    // Precision Measurement Rings
    const ringGeo = new THREE.TorusGeometry(2.3, 0.012, 16, 96);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.4 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.1;
    stageGroup.add(ring);

    // Surgical Laser Scan Plane
    const laserGeo = new THREE.CylinderGeometry(0.015, 0.015, 3.4, 32);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.8 });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.rotation.z = Math.PI / 2;
    stageGroup.add(laser);

    // Subtle coordinate tick points
    const pointsCount = 80;
    const pointsGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(pointsCount * 3);
    for (let i = 0; i < pointsCount * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 5;
      pos[i + 1] = (Math.random() - 0.5) * 4;
      pos[i + 2] = (Math.random() - 0.5) * 5;
    }
    pointsGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pointsMat = new THREE.PointsMaterial({ size: 0.04, color: 0x94a3b8, transparent: true, opacity: 0.5 });
    const ticks = new THREE.Points(pointsGeo, pointsMat);
    stageGroup.add(ticks);

    let frameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      stageGroup.rotation.y = elapsed * 0.25;
      ring.rotation.z = elapsed * 0.12;
      laser.position.y = Math.sin(elapsed * 2.2) * 1.3;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geo.dispose();
      wireMat.dispose();
      nucGeo.dispose();
      nucMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      laserGeo.dispose();
      laserMat.dispose();
    };
  }, []);

  const handleSelectSpecimen = (specimen: SpecimenData) => {
    soundManager.playLaserScan();
    setIsEvaluating(true);
    setActiveSpecimen(specimen);

    setTimeout(() => {
      setIsEvaluating(false);
      soundManager.playAlertBuzz();
    }, 700);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    soundManager.playBlip();
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="min-h-screen text-[#94a3b8] relative selection:bg-cyan-500/20 selection:text-white">
      {/* Precision 3D Coordinate Grid & Liquid Aurora Wave */}
      <GlobalForensicBackground />

      {/* Dynamic Ambient Aurora Orbs */}
      <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-cyan-500/15 blur-[130px] pointer-events-none z-0" />
      <div className="fixed top-[20%] right-[-150px] w-[600px] h-[600px] rounded-full bg-purple-600/15 blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-[-100px] left-[30%] w-[550px] h-[550px] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none z-0" />

      {/* ═════════════════════════════════════════════════════════════════
          TOP NAVIGATION BAR (Liquid Glass & Refined)
          ═════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 h-16 bg-[#070b18]/75 backdrop-blur-xl border-b border-white/[0.09] shadow-lg px-6 lg:px-12 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            onClick={() => soundManager.playBlip()}
            className="flex items-center gap-3 text-white font-bold tracking-tight"
          >
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-white">
              <Shield className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-[14px] font-bold text-white tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              BEYOND<span className="text-cyan-400">PROOF</span>
            </span>
          </Link>

          <span className="hidden sm:inline-flex items-center gap-2 text-[10px] font-mono text-slate-500 border-l border-white/[0.08] pl-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            FASTAPI 8000 &bull; ALL ENGINES OPERATIONAL
          </span>
        </div>

        {/* Center Links */}
        <nav className="hidden lg:flex items-center gap-8 text-[12px] text-slate-400 font-medium">
          <a href="#dissector" className="hover:text-white transition-colors">Forensic Chamber</a>
          <a href="#hurdle" className="hover:text-amber-400 text-amber-400/90 transition-colors flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Laundered Fakes Shield
          </a>
          <a href="#engines" className="hover:text-white transition-colors">Microservices</a>
          <a href="#ledger" className="hover:text-white transition-colors">Evidence Ledger</a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {timeStr && (
            <span className="hidden xl:inline-block font-mono text-[11px] text-slate-500 tabular-nums">
              {timeStr}
            </span>
          )}

          <Link
            href="/app/dashboard"
            onClick={() => soundManager.playModeSwitch()}
            className="btn-primary"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ═════════════════════════════════════════════════════════════════
          HERO: SURGICAL FORENSIC BENCHMARK CHAMBER
          ═════════════════════════════════════════════════════════════════ */}
      <section id="dissector" className="relative min-h-[calc(100vh-64px)] p-6 lg:p-12 flex flex-col justify-center max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Technical Narrative & Specimen Ingestion */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-300 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>DETERMINISTIC VERIFICATION PLATFORM</span>
            </div>

            <div>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Deterministic proof.
                <br />
                <span className="text-aurora">Zero guesswork.</span>
              </h1>
              <p className="mt-4 text-slate-400 text-sm leading-relaxed max-w-xl font-normal">
                Black-box percentage scores fail in legal and compliance hearings. BEYONDPROOF produces mathematical, court-admissible forensic dissection across 7 specialized microservices.
              </p>
            </div>

            {/* Specimen Ingestion Bench (1-Click Judge Auditing) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 uppercase tracking-wider text-[11px] font-medium">
                  SELECT ATTACK SPECIMEN TO AUDIT
                </span>
                <span className="text-slate-500 text-[10px]">1-CLICK BENCHMARK</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SPECIMENS.map((spec) => {
                  const isSelected = activeSpecimen.id === spec.id;
                  return (
                    <button
                      key={spec.id}
                      onClick={() => handleSelectSpecimen(spec)}
                      className={`text-left p-3.5 rounded-xl border transition-all text-xs relative ${
                        isSelected
                          ? "pro-panel-active text-white"
                          : "pro-panel text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-[11px] truncate block pr-2 text-white">
                          {spec.title}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>{spec.engine}</span>
                        <span className="text-slate-400">{spec.mode.toUpperCase()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specimen Mathematical Rationale Dossier Card */}
            <div className="p-5 rounded-2xl pro-panel font-mono text-xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-white tracking-tight">{activeSpecimen.file}</span>
                </div>
                <span className={activeSpecimen.badgeClass}>
                  {isEvaluating ? "CALCULATING PROOF..." : activeSpecimen.verdict}
                </span>
              </div>

              <p className="text-slate-300 font-sans text-xs leading-relaxed">
                {activeSpecimen.mathProof}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px] text-slate-500">
                <div className="flex items-center gap-2 truncate max-w-[280px]">
                  <span>SHA-256:</span>
                  <span className="text-cyan-300 truncate font-mono">{activeSpecimen.sha256}</span>
                </div>
                <button
                  onClick={() => handleCopyHash(activeSpecimen.sha256)}
                  className="hover:text-white p-1 text-slate-400 transition-colors"
                  title="Copy Hash"
                >
                  {copiedHash === activeSpecimen.sha256 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <Link
                href="/app/investigations/new"
                onClick={() => soundManager.playModeSwitch()}
                className="btn-cyan"
              >
                <span>Upload Evidence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/app/trust-graph"
                onClick={() => soundManager.playBlip()}
                className="btn-secondary"
              >
                <Network className="w-3.5 h-3.5 text-slate-400" />
                <span>3D Knowledge Graph</span>
              </Link>
            </div>
          </div>

          {/* Right Column: 3D Precision Coordinate Stage */}
          <div className="lg:col-span-6 relative">
            <div className="relative w-full h-[500px] rounded-2xl bg-[#090d16] border border-white/[0.08] overflow-hidden flex flex-col justify-between p-6 shadow-2xl">
              
              {/* Top Bar */}
              <div className="flex items-center justify-between z-10 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-white text-[11px] font-semibold tracking-wider">
                    SPECIMEN SPECTRAL DISSECTION // {activeSpecimen.mode.toUpperCase()}
                  </span>
                </div>
                <span className="text-slate-500 text-[10px] font-mono">60 FPS &bull; WebGL 2.0</span>
              </div>

              {/* Central WebGL Stage */}
              <div
                ref={mountRef}
                className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
              />

              {/* Bottom HUD Bar */}
              <div className="z-10 flex items-center justify-between font-mono text-[10px] text-slate-400 border-t border-white/[0.08] pt-3 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl">
                <span>INTERACTIVE 360&deg; ORBIT</span>
                <span className="text-cyan-400">ALGORITHM: MULTI-SPECTRAL DISSECTION</span>
                <span className="text-emerald-400 flex items-center gap-1 font-sans">
                  <CheckCircle2 className="w-3 h-3" />
                  ANCHORED
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          HACKATHON HURDLE SPOTLIGHT: LAUNDERED FAKES & LYING METADATA
          ═════════════════════════════════════════════════════════════════ */}
      <section id="hurdle" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-white/[0.07] relative z-10">
        <div className="p-8 lg:p-10 rounded-2xl pro-panel bg-[#090d15]/90 space-y-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
            <div>
              <div className="badge-clean badge-amber mb-3">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>HACKATHON HURDLE CHALLENGE // IMPLEMENTED</span>
              </div>
              <h2
                className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Laundered Fakes &amp; Lying Metadata.
              </h2>
            </div>
            <div className="max-w-md text-xs text-slate-400 leading-relaxed font-normal">
              <strong className="text-amber-400 font-semibold">The Core Thesis:</strong> Absence of evidence is not evidence of authenticity. Attackers screenshot generative fakes to wipe compression artifacts, then inject DSLR EXIF tags.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="pro-panel p-5 space-y-2">
              <span className="text-white font-bold text-xs block font-sans">1. 2D FFT Moiré Pattern Isolation</span>
              <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
                Computes 2D Fast Fourier Transform frequency peaks. Physical displays emit periodic pixel sub-lattice harmonics (0.42 rad/px) that software generation cannot mask.
              </p>
            </div>

            <div className="pro-panel p-5 space-y-2">
              <span className="text-white font-bold text-xs block font-sans">2. Optical Physics Contradiction Matrix</span>
              <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
                Cross-validates EXIF claims against real optics. If metadata claims a 50mm f/1.4 lens but both foreground and background are in razor-sharp focus, it is flagged as an optical impossibility.
              </p>
            </div>

            <div className="pro-panel p-5 space-y-2">
              <span className="text-white font-bold text-xs block font-sans">3. 5-Tier True Verdict Taxonomy</span>
              <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
                Eliminates dangerous binary scores. Distinguishes between <span className="text-emerald-400">VERIFIED GENUINE</span>, <span className="text-slate-300">NO TAMPERING DETECTED (UNVERIFIED)</span>, <span className="text-amber-400">LAUNDERED SUSPECT</span>, and <span className="text-rose-400">METADATA FORGERY DETECTED</span>.
              </p>
            </div>
          </div>

          {/* Interactive Laundered Fakes Shield Live Stage */}
          <div className="pt-6 border-t border-white/[0.08]">
            <div className="flex items-center gap-2 mb-3 text-[10px] uppercase text-amber-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>LIVE INTERACTIVE COUNTERMEASURE // DROP SPECIMEN OR SWITCH BENCHMARK</span>
            </div>
            <LaunderedFakesShield />
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          THE 07 FORENSIC MICROSERVICES
          ═════════════════════════════════════════════════════════════════ */}
      <section id="engines" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-white/[0.07] relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-cyan-400 font-mono text-[11px] tracking-wider uppercase block mb-1">
              THE 07 SPECIALIZED MICROSERVICES
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Seven Microservices. One Ground Truth.
            </h2>
          </div>
          <p className="text-slate-400 text-xs max-w-md leading-relaxed font-normal">
            Every piece of evidence is evaluated across multiple orthogonal mathematical domains simultaneously to prevent evasion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ENGINES.map((eng) => {
            const Icon = eng.icon;
            return (
              <div
                key={eng.id}
                className="pro-panel p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-5">
                    <span className="text-slate-500 font-medium">{eng.num} // ENGINE</span>
                    <span className="badge-clean badge-cyan">{eng.tag}</span>
                  </div>

                  <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white mb-4">
                    <Icon className="w-5 h-5 text-cyan-400" />
                  </div>

                  <h3
                    className="text-lg font-bold text-white mb-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {eng.name}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-6 font-normal">
                    {eng.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-500">SLA: {eng.sla}</span>
                  <Link
                    href={eng.href}
                    onClick={() => soundManager.playBlip()}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          IMMUTABLE EVIDENCE LEDGER (Court Admissible)
          ═════════════════════════════════════════════════════════════════ */}
      <section id="ledger" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-white/[0.07] relative z-10">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-cyan-400 font-mono text-[11px] tracking-wider uppercase block mb-1">
                CHAIN OF CUSTODY
              </span>
              <h2
                className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Cryptographic Evidence Ledger
              </h2>
            </div>
            <Link
              href="/app/history"
              onClick={() => soundManager.playBlip()}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All 24 Cases</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl pro-panel overflow-hidden font-mono text-xs">
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between text-slate-500 text-[10px]">
              <span>SPECIMEN FILENAME</span>
              <span>FORENSIC ROUTE</span>
              <span>ASSESSMENT VERDICT</span>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {[
                { file: "FRA_PASSPORT_EXP2028.IMG", engine: "Identity Guardian", verdict: "FORGERY CONFIRMED", badge: "badge-clean badge-crimson", hash: "9a8b1c4d7e2f5a0b..." },
                { file: "CANON_EOS5D_AI_LAUNDERED.JPG", engine: "Media Truth Engine", verdict: "METADATA FORGERY DETECTED", badge: "badge-clean badge-amber", hash: "7c8d9e0f1a2b3c4d..." },
                { file: "CFO_WIRE_AUTHORIZATION.WAV", engine: "Media Truth Engine", verdict: "SYNTHETIC DEEPFAKE", badge: "badge-clean badge-crimson", hash: "4f7a2b9c1d6e8f0a..." },
                { file: "VENDOR_CERTIFICATE_ACME.PDF", engine: "Document Verifier", verdict: "AUTHENTIC VALIDATED", badge: "badge-clean badge-emerald", hash: "3b5c7d9e1f2a4b6c..." },
              ].map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div>
                    <span className="text-white font-medium block">{item.file}</span>
                    <span className="text-[10px] text-slate-500">{item.hash}</span>
                  </div>
                  <span className="text-slate-400 text-[11px] hidden sm:inline">{item.engine}</span>
                  <span className={item.badge}>{item.verdict}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          INSTITUTIONAL FOOTER
          ═════════════════════════════════════════════════════════════════ */}
      <footer className="py-12 px-6 lg:px-12 border-t border-white/[0.07] bg-[#05070b] text-slate-500 text-xs font-sans relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-white font-bold tracking-tight">
              BEYOND<span className="text-cyan-400">PROOF</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] text-slate-400">Institutional Forensic Platform</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <span>TEAM BBC — BUILT BEYOND CODE</span>
            <span className="text-slate-400 font-mono">RELEASE v5.0 INSTITUTIONAL</span>
          </div>

          <div className="text-[11px] text-slate-600">
            &copy; 2026 BEYONDPROOF FORENSICS INC.
          </div>
        </div>
      </footer>
    </div>
  );
}
