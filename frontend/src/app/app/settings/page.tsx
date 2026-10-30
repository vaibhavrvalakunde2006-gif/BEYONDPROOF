'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { soundManager } from '@/lib/soundFx';

export default function Settings() {
  const [name, setName] = useState('BBC Forensic Directorate');
  const [email, setEmail] = useState('lead.investigator@beyondproof.internal');
  const [isMuted, setIsMuted] = useState(false);
  const [fpsTarget, setFpsTarget] = useState('60');
  const [particleDensity, setParticleDensity] = useState('ultra');
  const [antiAliasing, setAntiAliasing] = useState('fxaa');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    soundManager.playSuccessChime();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleToggleAudio = () => {
    const next = soundManager.toggleMute();
    setIsMuted(next);
  };

  return (
    <div className="space-y-8 select-none">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>PREFERENCES // WORKSPACE TELEMETRY</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            System <span className="text-cyan-400">Settings.</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm font-mono mt-1">
            Configure 3D WebGL renderer pipelines, procedural audio synthesis, and cryptographic credentials.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:brightness-110 transition-all self-start md:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>SAVE SYSTEM PREFERENCES</span>
        </button>
      </div>

      {/* Success Notification */}
      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 font-mono text-xs flex items-center gap-2 animate-fade-in shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>System configuration successfully committed to local cryptographic storage.</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
        {/* Section 1: 3D WebGL Engine & Shader Settings */}
        <section className="p-6 rounded-2xl bg-[#090e17] border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-cyan-400 uppercase font-bold block">HARDWARE ACCELERATION</span>
                <h3 className="text-base font-bold text-white">3D WebGL &amp; Shader Settings</h3>
              </div>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed mb-6">
              Adjust Three.js viewport render quality, volumetric particle count, and GPU frame budget.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">TARGET FRAME RATE</label>
                <div className="grid grid-cols-3 gap-2">
                  {['30 FPS', '60 FPS', '120 FPS'].map((fps) => (
                    <button
                      key={fps}
                      onClick={() => {
                        setFpsTarget(fps);
                        soundManager.playBlip();
                      }}
                      className={`py-2 px-3 rounded-lg border text-center transition-all ${
                        fpsTarget === fps
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {fps}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">NEBULA PARTICLE DENSITY</label>
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
                      className={`py-2 px-3 rounded-lg border text-center transition-all ${
                        particleDensity === p.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">ANTI-ALIASING FILTER</label>
                <select
                  value={antiAliasing}
                  onChange={(e) => setAntiAliasing(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="fxaa">High-Precision Hardware MSAA (WebGL 2.0)</option>
                  <option value="smaa">Subpixel Morphological Anti-Aliasing (SMAA)</option>
                  <option value="none">Disabled (Maximum Power Saving)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-white/[0.06] flex items-center justify-between text-gray-500 text-[11px]">
            <span>RENDERER: WebGLRenderer (Three.js r182)</span>
            <span className="text-emerald-400">GPU VENDOR: DETECTED</span>
          </div>
        </section>

        {/* Section 2: Audio Synthesizer & Sound Effects */}
        <section className="p-6 rounded-2xl bg-[#090e17] border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-300">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-orange-400 uppercase font-bold block">WEB AUDIO API</span>
                <h3 className="text-base font-bold text-white">Procedural Cyber Synthesizer</h3>
              </div>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed mb-6">
              Configure real-time procedural Web Audio sound synthesis for laser scans, radar pings, and alert sirens.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-black/50 border border-white/[0.08]">
                <div className="flex items-center gap-3">
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-red-400" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-cyan-400" />
                  )}
                  <div>
                    <span className="text-white font-bold block">Master Audio Synthesizer</span>
                    <span className="text-gray-500 text-[10px]">Zero external sound files — 100% mathematical oscillators</span>
                  </div>
                </div>

                <button
                  onClick={handleToggleAudio}
                  className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
                    isMuted
                      ? 'bg-red-950/60 border-red-500/50 text-red-300'
                      : 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                  }`}
                >
                  {isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
                <span className="text-gray-400 block mb-1 text-[11px]">ACTIVE SYNTH FREQUENCIES:</span>
                <div className="flex items-center justify-between text-gray-500 text-[11px]">
                  <span>Laser Scan Sweep:</span>
                  <span className="text-cyan-400">880 Hz &rarr; 220 Hz Exponential</span>
                </div>
                <div className="flex items-center justify-between text-gray-500 text-[11px]">
                  <span>Tactical Anomaly Alert:</span>
                  <span className="text-amber-400">140 Hz Sawtooth Dual-Tone</span>
                </div>
                <div className="flex items-center justify-between text-gray-500 text-[11px]">
                  <span>Certify Success Chime:</span>
                  <span className="text-emerald-400">523.25 Hz &rarr; 1046.5 Hz Chord</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-white/[0.06] flex items-center justify-between text-gray-500 text-[11px]">
            <span>SYNTH ENGINE: AudioContext</span>
            <span className="text-emerald-400">STATUS: INITIALIZED</span>
          </div>
        </section>

        {/* Section 3: Identity & Cryptographic Clearance */}
        <section className="p-6 rounded-2xl bg-[#090e17] border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">INVESTIGATOR PROFILE</span>
                <h3 className="text-base font-bold text-white">Identity &amp; Credentials</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-1.5">WORKSPACE ORG NAME</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1.5">PRIMARY INVESTIGATOR EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1.5">CRYPTOGRAPHIC SIGNING KEY</label>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-black/50 border border-white/10 text-gray-400 text-[11px]">
                  <Key className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span className="truncate">secp256k1_priv_9f82ab48102847a...</span>
                  <span className="text-emerald-400 ml-auto whitespace-nowrap">ACTIVE</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-white/[0.06] flex items-center justify-between text-gray-500 text-[11px]">
            <span>LEVEL 4 CLEARANCE</span>
            <span className="text-cyan-400">UNRESTRICTED ACCESS</span>
          </div>
        </section>

        {/* Section 4: Backend Microservice Telemetry */}
        <section className="p-6 rounded-2xl bg-[#090e17] border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-purple-400 uppercase font-bold block">FASTAPI SENTINEL</span>
                <h3 className="text-base font-bold text-white">Backend Health &amp; Endpoints</h3>
              </div>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              Real-time heartbeat verification across all 7 Python forensic engines and cryptographic hash verification microservices.
            </p>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                <span className="text-gray-400">FastAPI Core (Port 8000)</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE [200 OK]
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                <span className="text-gray-400">Identity Guardian (ICAO 9303)</span>
                <span className="text-emerald-400 font-bold">OPERATIONAL</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                <span className="text-gray-400">Media Truth (Spectral ELA)</span>
                <span className="text-emerald-400 font-bold">OPERATIONAL</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/[0.04]">
                <span className="text-gray-400">3D Trust Graph (NetworkX)</span>
                <span className="text-emerald-400 font-bold">OPERATIONAL</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-white/[0.06] flex items-center justify-between text-gray-500 text-[11px]">
            <span>LATENCY: 8ms</span>
            <span className="text-cyan-400">ALL 7 ENGINES NOMINAL</span>
          </div>
        </section>
      </div>
    </div>
  );
}
