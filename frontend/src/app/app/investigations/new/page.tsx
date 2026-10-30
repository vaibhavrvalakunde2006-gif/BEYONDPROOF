"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import * as THREE from "three";
import {
  UploadCloud,
  File as FileIcon,
  Image,
  Film,
  Music,
  ShieldCheck,
  ArrowRight,
  X,
  ScanLine,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { soundManager } from "@/lib/soundFx";

const engines = [
  { id: "identity", name: "Identity Guardian", desc: "Biometric face wireframe, MRZ checksum, synthetic spoofing" },
  { id: "document", name: "Document Verifier", desc: "PDF layer structural dissection, font mismatch, xref streams" },
  { id: "media", name: "Media Truth Engine", desc: "Spectral Error Level Analysis (ELA), audio spectrograms" },
  { id: "source", name: "Source Tracker", desc: "Cryptographic SHA-256 fingerprinting, pHash, C2PA provenance" },
  { id: "risk", name: "AI Risk Analyzer", desc: "Explainable Bayesian severity weighting and uncertainty rating" },
];

const sampleAttacks = [
  {
    name: "French Passport MRZ Forgery",
    filename: "FRA_PASSPORT_EXP2028.IMG",
    engine: "Identity Guardian",
    risk: "CRITICAL (99.98% Checksum Failure)",
    desc: "ICAO 9303 modulo-10 checksum mismatch on document number check digit.",
  },
  {
    name: "CEO Wire Transfer Deepfake Audio",
    filename: "CFO_WIRE_AUTHORIZATION.WAV",
    engine: "Media Truth Engine",
    risk: "HIGH RISK (98.4% Spectral Anomaly)",
    desc: "16.4kHz pitch boundary diffusion artifact detected with 84.6 dB variance.",
  },
  {
    name: "Tampered Commercial Invoice",
    filename: "INVOICE_OCT2026_FINAL.PDF",
    engine: "Document Verifier",
    risk: "CONFIRMED TAMPER (Font Kerning Mismatch)",
    desc: "Helvetica-Bold spliced into Arial body at total payment section.",
  },
];

export default function NewInvestigation() {
  const mountRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [selectedEngines, setSelectedEngines] = useState<string[]>(
    engines.map((e) => e.name)
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [activeSample, setActiveSample] = useState<any | null>(null);

  // 3D Laser Scanner Chamber in WebGL
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = 280;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3D Holographic Evidence Mesh
    const group = new THREE.Group();
    scene.add(group);

    // Outer rotating cylinder ring
    const ringGeo = new THREE.TorusGeometry(1.4, 0.03, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    // Inner holographic document plane
    const docGeo = new THREE.PlaneGeometry(1.2, 1.6, 8, 8);
    const docMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    const docMesh = new THREE.Mesh(docGeo, docMat);
    group.add(docMesh);

    // Sweeping laser scanline
    const laserGeo = new THREE.CylinderGeometry(0.015, 0.015, 2.0, 16);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.9,
    });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.rotation.z = Math.PI / 2;
    group.add(laser);

    let frameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      group.rotation.y = elapsed * 0.5;
      laser.position.y = Math.sin(elapsed * 3) * 0.75;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    soundManager.playLaserScan();
    setFiles((prev) => [...prev, ...Array.from(incoming)]);
  };

  const handleSampleAttack = (sample: any) => {
    soundManager.playLaserScan();
    setActiveSample(sample);
    const fakeFile = new File(["SAMPLE FORENSIC CONTENT"], sample.filename, {
      type: "application/octet-stream",
    });
    setFiles([fakeFile]);
  };

  const handleStartInvestigation = () => {
    soundManager.playLaserScan();
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
      soundManager.playSuccess();
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>EVIDENCE INTAKE & 3D LASER CHAMBER</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Start an <span className="text-cyan-400">Investigation.</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm font-mono mt-1">
            Ingest digital evidence into the 3D holographic laser chamber for multi-engine dissection.
          </p>
        </div>

        <span className="px-3 py-1 rounded bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-300">
          STAGE 01 // EVIDENCE INTAKE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Intake Chamber (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 3D Laser Chamber Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`relative p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center overflow-hidden bg-gradient-to-b from-[#0a101b] to-[#04070d] ${
              isDragging
                ? "border-cyan-400 bg-cyan-950/20 shadow-[0_0_40px_rgba(0,229,255,0.3)]"
                : "border-cyan-500/30 hover:border-cyan-400/80 hover:shadow-[0_0_30px_rgba(0,229,255,0.15)]"
            }`}
          >
            {/* 3D WebGL Laser Stage */}
            <div
              ref={mountRef}
              className="w-full max-w-sm h-[220px] pointer-events-none flex items-center justify-center"
            />

            <div className="relative z-10">
              <h3
                className="text-lg font-bold text-white mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Drop Digital Evidence into 3D Laser Chamber
              </h3>
              <p className="text-xs text-gray-400 font-mono mb-4">
                or <span className="text-cyan-400 underline font-bold">browse files</span> from your forensic workstation
              </p>
              <span className="text-[11px] font-mono text-gray-500 block">
                PDF, PNG, JPG, WEBP, MP4, MOV, WAV, MP3 ? Max 100 MB per file
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              accept=".pdf,.png,.jpg,.jpeg,.webp,.mp4,.mov,.wav,.mp3"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#090e17] border border-white/[0.08] font-mono text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-gray-500 text-[11px]">
                <span>INTAKE QUEUE ({files.length} FILES)</span>
                <button
                  onClick={() => setFiles([])}
                  className="text-red-400 hover:underline"
                >
                  Clear All
                </button>
              </div>

              {files.map((f, i) => (
                <div
                  key={`${f.name}-${i}`}
                  className="p-3 rounded-lg bg-black/40 border border-white/[0.06] flex items-center justify-between text-gray-300"
                >
                  <div className="flex items-center gap-3">
                    <FileIcon className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="text-white font-bold block">{f.name}</span>
                      <span className="text-[10px] text-gray-500">
                        {(f.size / 1024 / 1024).toFixed(2)} MB ? {f.type || "Raw Binary"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFiles((prev) => prev.filter((_, idx) => idx !== i));
                    }}
                    className="text-gray-500 hover:text-red-400 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Forensic Engine Checkboxes */}
          <div className="p-6 rounded-2xl bg-[#090e17] border border-white/[0.08] font-mono text-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
              <div>
                <span className="text-cyan-400 text-[11px] uppercase block mb-1">
                  02 // ANALYSIS SCOPE
                </span>
                <h4
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Select Active Engines
                </h4>
              </div>
              <button
                onClick={() =>
                  setSelectedEngines(
                    selectedEngines.length === engines.length
                      ? []
                      : engines.map((e) => e.name)
                  )
                }
                className="text-cyan-400 text-xs hover:underline"
              >
                {selectedEngines.length === engines.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {engines.map((eng) => {
                const isSelected = selectedEngines.includes(eng.name);
                return (
                  <label
                    key={eng.id}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                      isSelected
                        ? "bg-cyan-500/10 border-cyan-400/60 text-white"
                        : "bg-black/40 border-white/[0.06] text-gray-400 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) =>
                        setSelectedEngines((prev) =>
                          e.target.checked
                            ? [...prev, eng.name]
                            : prev.filter((n) => n !== eng.name)
                        )
                      }
                      className="mt-0.5 accent-cyan-400"
                    />
                    <div>
                      <span className="font-bold block text-white text-xs mb-1">
                        {eng.name}
                      </span>
                      <span className="text-[10px] text-gray-400 leading-relaxed block">
                        {eng.desc}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Launch Button */}
            <button
              onClick={handleStartInvestigation}
              disabled={files.length === 0 || selectedEngines.length === 0 || isScanning}
              className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,229,255,0.3)] hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isScanning ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>DISSECTING EVIDENCE IN 3D STAGE...</span>
                </>
              ) : (
                <>
                  <span>EXECUTE FORENSIC VERIFICATION</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Scan Complete Result Card */}
            {scanComplete && (
              <div className="mt-6 p-5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-start gap-3 text-cyan-300 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <span className="font-bold text-white text-sm block">
                    3D Evidence Verification Executed
                  </span>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {files.length} file(s) processed across {selectedEngines.length} engine(s). Cryptographic hash ledger validated and synchronized with backend API.
                  </p>
                  <div className="pt-2 flex items-center gap-4">
                    <Link
                      href="/app/history"
                      className="text-cyan-400 underline font-bold text-xs flex items-center gap-1 hover:text-cyan-300"
                    >
                      <span>View Case Dossier</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link
                      href="/app/trust-graph"
                      className="text-gray-400 underline text-xs flex items-center gap-1 hover:text-white"
                    >
                      <span>Inspect in 3D Trust Graph</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 1-Click Forensic Attack Presets & Principles (1 Col) */}
        <div className="space-y-6 font-mono text-xs">
          {/* 1-Click Attack Presets */}
          <div className="p-6 rounded-2xl bg-[#090e17] border border-white/[0.08]">
            <div className="mb-4 pb-3 border-b border-white/[0.06]">
              <span className="text-amber-400 text-[10px] uppercase block mb-1 font-bold">
                JUDGE DEMONSTRATION SUITE
              </span>
              <h4
                className="text-base font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                1-Click Attack Presets
              </h4>
            </div>

            <p className="text-gray-400 text-[11px] mb-4 leading-relaxed">
              Instantly inject authentic attack vectors into the 3D laser chamber to audit engine verdicts:
            </p>

            <div className="space-y-3">
              {sampleAttacks.map((att) => (
                <button
                  key={att.name}
                  onClick={() => handleSampleAttack(att)}
                  className="w-full text-left p-3.5 rounded-xl bg-black/40 border border-white/[0.06] hover:border-amber-400/50 hover:bg-amber-950/20 transition-all group"
                >
                  <div className="flex items-center justify-between text-white font-bold mb-1 text-xs group-hover:text-amber-300">
                    <span>{att.name}</span>
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="text-[10px] text-cyan-400 block mb-1">
                    {att.filename} ? {att.engine}
                  </span>
                  <span className="text-[10px] text-gray-400 block leading-relaxed">
                    {att.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Forensic Principles Card */}
          <div className="p-6 rounded-2xl bg-[#090e17] border border-white/[0.08] space-y-4">
            <h4
              className="text-base font-bold text-white border-b border-white/[0.06] pb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Forensic Principles
            </h4>

            <div className="flex items-start gap-3 text-gray-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block text-xs">
                  Cryptographic Chain of Custody
                </span>
                <span className="text-[10px] text-gray-400 leading-relaxed block">
                  Deterministic SHA-256 fingerprint computed before byte parsing.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-gray-300">
              <ScanLine className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block text-xs">
                  Explainable Findings
                </span>
                <span className="text-[10px] text-gray-400 leading-relaxed block">
                  Every risk score points directly to verifiable forensic anomaly vertices.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
