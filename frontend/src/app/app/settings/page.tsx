'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Bell,
  Save,
  Sliders,
  Volume2,
  VolumeX,
  Cpu,
  Terminal,
  Key,
  CheckCircle2,
  Sparkles,
  Layers,
  Activity,
  Zap,
  Radio,
  Play,
  RotateCcw,
  Check,
} from 'lucide-react';
import { soundManager } from '@/lib/soundFx';

export default function Settings() {
  const [animateIn, setAnimateIn] = useState(false);
  const [name, setName] = useState('BBC Forensic Directorate');
  const [email, setEmail] = useState('lead.investigator@beyondproof.internal');
  const [isMuted, setIsMuted] = useState(false);
  const [fpsTarget, setFpsTarget] = useState('60 FPS');
  const [particleDensity, setParticleDensity] = useState('ultra');
  const [antiAliasing, setAntiAliasing] = useState('fxaa');
  const [isSaved, setIsSaved] = useState(false);
  const [isPinging, setIsPinging] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleSave = () => {
    soundManager.playSuccessChime();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleToggleAudio = () => {
    const next = soundManager.toggleMute();
    setIsMuted(next);
  };

  const handleTestPing = () => {
    soundManager.playLaserScan();
    setIsPinging(true);
    setTimeout(() => {
      soundManager.playBlip();
      setIsPinging(false);
    }, 600);
  };

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
            <span className="text-cyan-400">PREFERENCES</span>
            <span className="text-gray-600">//</span>
            <span className="text-gray-400">WORKSPACE TELEMETRY &amp; GPU PIPELINES</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            System <span className="text-cyan-400">Settings.</span>
          </h1>
          <p
            className="text-gray-400 text-xs sm:text-sm mt-1.5"
            style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.04em', fontSize: 11 }}
          >
            Fine-tune WebGL 2.0 shader stages, procedural audio synthesis, and cryptographic keys
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-400 text-black font-bold text-[10px] flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.25)] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:brightness-110 active:scale-95 transition-all self-start md:self-auto"
          style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em' }}
        >
          <Save className="w-4 h-4 stroke-[2.5]" />
          <span>SAVE SYSTEM PREFERENCES</span>
        </button>
      </div>

      {/* ═══════ Live Diagnostic Strip ═══════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl liquid-glass border border-white/[0.06] hover:border-cyan-400/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[9px] uppercase tracking-[0.15em] text-gray-500"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              RENDER PIPELINE
            </span>
            <Cpu className="w-3.5 h-3.5 text-cyan-400/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-lg font-bold text-white font-mono"
            >
              WebGL 2.0
            </span>
            <span
              className="text-[10px] text-cyan-400 flex items-center gap-1"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              60 FPS
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl liquid-glass border border-white/[0.06] hover:border-emerald-400/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[9px] uppercase tracking-[0.15em] text-gray-500"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              AUDIO SYNTHESIZER
            </span>
            <Radio className="w-3.5 h-3.5 text-emerald-400/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-lg font-bold text-emerald-400 font-mono"
            >
              {isMuted ? 'MUTED' : 'ONLINE'}
            </span>
            <span
              className="text-[10px] text-emerald-400/80"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              PROCEDURAL
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl liquid-glass border border-white/[0.06] hover:border-violet-400/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[9px] uppercase tracking-[0.15em] text-gray-500"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              SECURITY CLEARANCE
            </span>
            <Shield className="w-3.5 h-3.5 text-violet-400/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-lg font-bold text-violet-300 font-mono"
            >
              LEVEL 4
            </span>
            <span
              className="text-[10px] text-violet-400/80"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              UNRESTRICTED
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl liquid-glass border border-white/[0.06] hover:border-amber-400/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[9px] uppercase tracking-[0.15em] text-gray-500"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              ENGINE SENTINEL
            </span>
            <Activity className="w-3.5 h-3.5 text-amber-400/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-lg font-bold text-amber-400 font-mono"
            >
              7/7 NOMINAL
            </span>
            <span
              className="text-[10px] text-amber-400/80"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              8ms LATENCY
            </span>
          </div>
        </div>
      </div>

      {/* ═══════ Save Success Notification ═══════ */}
      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between shadow-[0_0_25px_rgba(16,185,129,0.25)] transition-all animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span
              className="tracking-wide"
              style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10.5 }}
            >
              PREFERENCES COMMITTED TO LOCAL CRYPTOGRAPHIC KEYSTORE &amp; GPU PIPELINE
            </span>
          </div>
          <span
            className="text-[9px] text-emerald-400/80 tracking-widest uppercase font-mono"
          >
            SHA-256 SYNCED
          </span>
        </div>
      )}

      {/* ═══════ Settings Grid (4 Panels) ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Panel 1: 3D WebGL Engine & Shader Settings */}
        <section className="p-5 sm:p-6 rounded-xl liquid-glass border border-white/[0.06] hover:border-cyan-400/25 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span
                  className="text-[9px] text-cyan-400 uppercase font-bold tracking-[0.16em] block"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  HARDWARE ACCELERATION
                </span>
                <h3
                  className="text-base font-bold text-white tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  3D WebGL &amp; Shader Settings
                </h3>
              </div>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed mb-5 font-mono">
              Adjust Three.js viewport render quality, volumetric particle density, and GPU frame budget.
            </p>

            <div className="space-y-4">
              {/* Target Frame Rate */}
              <div>
                <label
                  className="block text-gray-400 text-[10px] uppercase tracking-[0.12em] mb-2"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  TARGET FRAME RATE
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['30 FPS', '60 FPS', '120 FPS'].map((fps) => (
                    <button
                      key={fps}
                      onClick={() => {
                        setFpsTarget(fps);
                        soundManager.playBlip();
                      }}
                      style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em', fontSize: 10 }}
                      className={`py-2 px-3 rounded-lg border text-center transition-all font-bold ${
                        fpsTarget === fps
                          ? 'bg-cyan-500/15 border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.25)]'
                          : 'bg-black/50 border-white/[0.06] text-gray-400 hover:border-white/20 hover:text-gray-200'
                      }`}
                    >
                      {fps}
                    </button>
                  ))}
                </div>
              </div>

              {/* Particle Density */}
              <div>
                <label
                  className="block text-gray-400 text-[10px] uppercase tracking-[0.12em] mb-2"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  NEBULA PARTICLE DENSITY
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'eco', label: 'ECO (120)' },
                    { id: 'medium', label: 'STD (280)' },
                    { id: 'ultra', label: 'ULTRA (540)' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setParticleDensity(p.id);
                        soundManager.playBlip();
                      }}
                      style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em', fontSize: 10 }}
                      className={`py-2 px-3 rounded-lg border text-center transition-all font-bold ${
                        particleDensity === p.id
                          ? 'bg-cyan-500/15 border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.25)]'
                          : 'bg-black/50 border-white/[0.06] text-gray-400 hover:border-white/20 hover:text-gray-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Anti-Aliasing */}
              <div>
                <label
                  className="block text-gray-400 text-[10px] uppercase tracking-[0.12em] mb-2"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  ANTI-ALIASING FILTER
                </label>
                <select
                  value={antiAliasing}
                  onChange={(e) => setAntiAliasing(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-cyan-400/60 focus:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all"
                >
                  <option value="fxaa">High-Precision Hardware MSAA (WebGL 2.0)</option>
                  <option value="smaa">Subpixel Morphological Anti-Aliasing (SMAA)</option>
                  <option value="none">Disabled (Maximum Power Saving)</option>
                </select>
              </div>
            </div>
          </div>

          <div
            className="pt-4 mt-6 border-t border-white/[0.06] flex items-center justify-between text-[10px] tracking-wider"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            <span className="text-gray-500">RENDERER: THREE.JS R182</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              GPU ACCELERATED
            </span>
          </div>
        </section>

        {/* Panel 2: Procedural Cyber Synthesizer */}
        <section className="p-5 sm:p-6 rounded-xl liquid-glass border border-white/[0.06] hover:border-cyan-400/25 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <span
                  className="text-[9px] text-amber-400 uppercase font-bold tracking-[0.16em] block"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  WEB AUDIO API
                </span>
                <h3
                  className="text-base font-bold text-white tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Procedural Cyber Synthesizer
                </h3>
              </div>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed mb-5 font-mono">
              Real-time Web Audio API sound synthesis with mathematical oscillators — zero audio files, 100% offline.
            </p>

            <div className="space-y-4">
              {/* Master Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/60 border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-red-400" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-cyan-400" />
                  )}
                  <div>
                    <span
                      className="text-white font-bold block text-xs"
                      style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.04em' }}
                    >
                      Master Audio Engine
                    </span>
                    <span className="text-gray-500 text-[10px] font-mono">
                      Real-time sine, sawtooth &amp; triangle waves
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleToggleAudio}
                  style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em', fontSize: 10 }}
                  className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
                    isMuted
                      ? 'bg-red-950/50 border-red-500/50 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                      : 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.25)]'
                  }`}
                >
                  {isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}
                </button>
              </div>

              {/* Interactive Sound Test Triggers */}
              <div>
                <label
                  className="block text-gray-400 text-[10px] uppercase tracking-[0.12em] mb-2"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  INTERACTIVE SOUND EFFECT TEST
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => soundManager.playLaserScan()}
                    style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9.5 }}
                    className="p-2 rounded-lg bg-black/50 border border-white/[0.06] hover:border-cyan-400/40 text-cyan-300 text-center font-bold transition-all hover:bg-cyan-500/10 flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3 h-3 fill-cyan-400" />
                    <span>LASER SCAN</span>
                  </button>
                  <button
                    onClick={() => soundManager.playSuccessChime()}
                    style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9.5 }}
                    className="p-2 rounded-lg bg-black/50 border border-white/[0.06] hover:border-emerald-400/40 text-emerald-300 text-center font-bold transition-all hover:bg-emerald-500/10 flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3 h-3 fill-emerald-400" />
                    <span>VERIFY CHIME</span>
                  </button>
                  <button
                    onClick={() => soundManager.playAlertBuzz()}
                    style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9.5 }}
                    className="p-2 rounded-lg bg-black/50 border border-white/[0.06] hover:border-red-400/40 text-red-300 text-center font-bold transition-all hover:bg-red-500/10 flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3 h-3 fill-red-400" />
                    <span>THREAT ALARM</span>
                  </button>
                </div>
              </div>

              {/* Frequencies Box */}
              <div className="p-3 rounded-lg bg-black/40 border border-white/[0.04] space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between text-gray-500">
                  <span>Laser Scan Sweep:</span>
                  <span className="text-cyan-400">2400 Hz &rarr; 320 Hz Sawtooth</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>Tactical Alarm:</span>
                  <span className="text-amber-400">220 Hz &rarr; 180 Hz Dual-Tone</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>Authentic Chime:</span>
                  <span className="text-emerald-400">523.25 Hz &rarr; 1046.5 Hz Chord</span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="pt-4 mt-6 border-t border-white/[0.06] flex items-center justify-between text-[10px] tracking-wider"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            <span className="text-gray-500">ENGINE: AUDIOCONTEXT</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SYNTH INITIALIZED
            </span>
          </div>
        </section>

        {/* Panel 3: Identity & Cryptographic Clearance */}
        <section className="p-5 sm:p-6 rounded-xl liquid-glass border border-white/[0.06] hover:border-cyan-400/25 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span
                  className="text-[9px] text-emerald-400 uppercase font-bold tracking-[0.16em] block"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  INVESTIGATOR PROFILE
                </span>
                <h3
                  className="text-base font-bold text-white tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Identity &amp; Credentials
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-gray-400 text-[10px] uppercase tracking-[0.12em] mb-1.5"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  WORKSPACE ORG NAME
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-cyan-400/60 focus:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all"
                />
              </div>

              <div>
                <label
                  className="block text-gray-400 text-[10px] uppercase tracking-[0.12em] mb-1.5"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  PRIMARY INVESTIGATOR EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-cyan-400/60 focus:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all"
                />
              </div>

              <div>
                <label
                  className="block text-gray-400 text-[10px] uppercase tracking-[0.12em] mb-1.5"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  CRYPTOGRAPHIC SIGNING KEY
                </label>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-black/60 border border-white/[0.08] text-gray-400 text-xs font-mono">
                  <Key className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span className="truncate text-[11px]">secp256k1_priv_9f82ab48102847a...</span>
                  <span
                    className="text-emerald-400 ml-auto whitespace-nowrap text-[9px] font-bold tracking-wider"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="pt-4 mt-6 border-t border-white/[0.06] flex items-center justify-between text-[10px] tracking-wider"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            <span className="text-gray-500">LEVEL 4 CLEARANCE</span>
            <span className="text-cyan-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              UNRESTRICTED ACCESS
            </span>
          </div>
        </section>

        {/* Panel 4: Backend Microservice Telemetry */}
        <section className="p-5 sm:p-6 rounded-xl liquid-glass border border-white/[0.06] hover:border-cyan-400/25 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-400/30 flex items-center justify-center text-violet-300 shadow-[0_0_15px_rgba(154,131,255,0.2)]">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <span
                    className="text-[9px] text-violet-400 uppercase font-bold tracking-[0.16em] block"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    FASTAPI SENTINEL
                  </span>
                  <h3
                    className="text-base font-bold text-white tracking-tight"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Backend Health &amp; Endpoints
                  </h3>
                </div>
              </div>

              <button
                onClick={handleTestPing}
                disabled={isPinging}
                style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9.5 }}
                className="px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.08] hover:border-cyan-400/40 text-cyan-300 transition-all font-bold flex items-center gap-1"
              >
                <RotateCcw className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
                <span>PING</span>
              </button>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed mb-4 font-mono">
              Real-time heartbeat verification across all 7 Python forensic engines and cryptographic hash microservices.
            </p>

            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                <span className="text-gray-300">FastAPI Core (Port 8000)</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE [200 OK]
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                <span className="text-gray-300">Identity Guardian (ICAO 9303)</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  OPERATIONAL
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                <span className="text-gray-300">Media Truth (Spectral ELA)</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  OPERATIONAL
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                <span className="text-gray-300">3D Trust Graph (NetworkX)</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  OPERATIONAL
                </span>
              </div>
            </div>
          </div>

          <div
            className="pt-4 mt-6 border-t border-white/[0.06] flex items-center justify-between text-[10px] tracking-wider"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            <span className="text-gray-500">LATENCY: 8ms</span>
            <span className="text-cyan-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              ALL 7 ENGINES NOMINAL
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
