'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Shield, CheckCircle2 } from 'lucide-react';
import { ThreeFingerprintScene } from './3d/ThreeFingerprintScene';

interface CinematicScannerHeroProps {
  onQuickLogin?: () => void;
  isLoggingIn?: boolean;
}

export function CinematicScannerHero({ onQuickLogin, isLoggingIn }: CinematicScannerHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      width = canvas.width = rect.width;
      height = canvas.height = rect.height;
    };

    window.addEventListener('resize', resize);
    resize();

    class Particle {
      x = 0;
      y = 0;
      size = 1;
      speedY = 0;
      speedX = 0;
      alpha = 0;
      decay = 0;
      color = '#FF7A24';

      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * (width || 800);
        this.y = (height || 600) * (0.3 + Math.random() * 0.7);
        this.size = Math.random() * 1.8 + 0.6;
        this.speedY = -(Math.random() * 0.45 + 0.15);
        this.speedX = (Math.random() - 0.5) * 0.25;
        this.alpha = Math.random() * 0.6 + 0.2;
        this.decay = Math.random() * 0.003 + 0.001;
        const pTypes = ['#FF7A24', '#FFB347', '#FFFFFF', '#55DDF5'];
        this.color = pTypes[Math.floor(Math.random() * pTypes.length)];
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.alpha -= this.decay;
        if (this.alpha <= 0 || this.y < 0) {
          this.reset();
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class LightStreak {
      x = 0;
      y = 0;
      length = 30;
      speedY = 0;
      alpha = 0;
      fade = 0;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = (width || 800) * (0.2 + Math.random() * 0.6);
        this.y = (height || 600) * 0.8 + Math.random() * ((height || 600) * 0.2);
        this.length = Math.random() * 45 + 25;
        this.speedY = -(Math.random() * 1.2 + 0.6);
        this.alpha = Math.random() * 0.4 + 0.1;
        this.fade = Math.random() * 0.005 + 0.002;
      }

      update() {
        this.y += this.speedY;
        this.alpha -= this.fade;
        if (this.alpha <= 0 || this.y < -this.length) {
          this.reset();
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.length);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.3, '#FFB347');
        grad.addColorStop(1, 'transparent');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.stroke();
        ctx.restore();
      }
    }

    const particles: Particle[] = [];
    const lightStreaks: LightStreak[] = [];
    for (let i = 0; i < 35; i++) particles.push(new Particle());
    for (let i = 0; i < 6; i++) lightStreaks.push(new LightStreak());

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (const s of lightStreaks) {
        s.update();
        s.draw();
      }
      for (const p of particles) {
        p.update();
        p.draw();
      }
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <section className="relative w-full min-h-[92vh] flex flex-col justify-between items-center bg-black overflow-hidden select-none border-b border-gray-900/80">
      {/* Radial Backlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,122,36,0.12)_0%,rgba(0,0,0,0.95)_70%,#000000_100%)] pointer-events-none" />

      {/* Forensic Grid Lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          backgroundPosition: 'center bottom',
          maskImage: 'radial-gradient(ellipse at 50% 100%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 100%, black 20%, transparent 80%)',
        }}
      />

      {/* Ambient Molten Bottom Glow */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[650px] max-w-full h-[320px] bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,122,36,0.32)_0%,rgba(255,179,71,0.15)_40%,transparent_75%)] blur-[50px] pointer-events-none" />

      {/* Main Hero Header & Copy */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 pt-12 md:pt-16 text-center flex flex-col items-center">
        {/* Ember-Glass Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-orange-950/40 border border-orange-500/30 text-xs text-orange-200 mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(255,122,36,0.2)]">
          <span className="bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">
            NEW
          </span>
          <span className="font-medium tracking-wide">Digital Trust Intelligence</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        </div>

        {/* Cinematic Headline */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-wide text-white mb-6 uppercase"
          style={{ fontFamily: "'Anta', sans-serif" }}
        >
          <span className="block opacity-95">IN A WORLD OF</span>
          <span className="block opacity-95">FAKE EVERYTHING.</span>
          <span className="block font-medium bg-gradient-to-r from-amber-200 via-orange-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,122,36,0.45)]">
            VERIFY WHAT&apos;S REAL.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
          Investigate digital authenticity through AI-powered forensic analysis, cryptographic verification and intelligent provenance tracking.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-xl">
          <Link
            href="/verification"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-amber-100 hover:shadow-[0_0_25px_rgba(255,179,71,0.6)] hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
            style={{ fontFamily: "'Anta', sans-serif" }}
          >
            <span>START VERIFICATION</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#engines"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-orange-950/30 hover:bg-orange-900/40 border border-orange-500/40 text-orange-200 font-medium text-sm backdrop-blur-md hover:border-orange-400 hover:shadow-[0_0_20px_rgba(255,122,36,0.3)] hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
            style={{ fontFamily: "'Anta', sans-serif" }}
          >
            <span>EXPLORE 7 ENGINES</span>
          </a>

          <a
            href="#judge-pitch"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/30 text-cyan-300 font-medium text-sm backdrop-blur-md hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(85,221,245,0.25)] hover:-translate-y-0.5 transition-all duration-200"
            style={{ fontFamily: "'Anta', sans-serif" }}
          >
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>2-MIN PITCH &amp; DEMO</span>
          </a>

          {onQuickLogin && (
            <button
              onClick={onQuickLogin}
              disabled={isLoggingIn}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 text-xs font-semibold backdrop-blur-md transition-all active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isLoggingIn ? 'Authenticating...' : '1-Click Lead Investigator Login'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Central Forensic Aperture & Canvas Core (Bottom-Anchored) */}
      <div className="relative w-full max-w-4xl h-[280px] sm:h-[320px] flex items-end justify-center pointer-events-none z-10 overflow-hidden">
        {/* Floating Particles Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

        {/* Telemetry HUD Labels */}
        <div className="hidden sm:flex absolute top-4 left-8 items-center gap-1.5 text-[9px] font-mono tracking-wider text-amber-400/80 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_6px_#FF7A24]" />
          FORENSIC ENGINE: READY
        </div>
        <div className="hidden sm:flex absolute top-4 right-8 items-center gap-1.5 text-[9px] font-mono tracking-wider text-amber-400/80 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#55DDF5]" />
          DIGITAL INTEGRITY &bull; 100%
        </div>
        <div className="hidden md:flex absolute bottom-12 left-12 items-center gap-1.5 text-[9px] font-mono tracking-wider text-amber-400/80 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_6px_#FF7A24]" />
          PROVENANCE ANALYSIS ACTIVE
        </div>
        <div className="hidden md:flex absolute bottom-12 right-12 items-center gap-1.5 text-[9px] font-mono tracking-wider text-amber-400/80 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#FFB347]" />
          SHA-256 VERIFICATION
        </div>

        {/* Circular Aperture Stage */}
        <div className="relative w-[480px] sm:w-[560px] h-[480px] sm:h-[560px] -bottom-[260px] sm:-bottom-[300px] rounded-full bg-black border border-orange-500/50 shadow-[0_0_60px_rgba(255,122,36,0.45),inset_0_0_40px_rgba(0,0,0,0.95)] flex items-center justify-center overflow-hidden">
          {/* Real Three.js 3D WebGL Luminous Fingerprint */}
          <ThreeFingerprintScene className="absolute inset-0 z-0 pointer-events-auto" />

          {/* White-Hot Rim */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_14px_#FFFFFF,inset_0_0_28px_#FFB347,inset_0_0_55px_#FF7A24,0_0_20px_#FFFFFF,0_0_40px_#FFB347] pointer-events-none" />

          {/* Molten Upper Arc */}
          <div className="absolute -top-[2px] left-[10%] w-[80%] h-[40%] rounded-t-full border-t-[3px] border-white drop-shadow-[0_0_16px_#FF7A24] pointer-events-none" />

          {/* Laser Scanning Beam */}
          <div
            className="absolute left-[10%] w-[80%] h-[2px] rounded-full bg-gradient-to-r from-transparent via-cyan-300 via-white to-transparent shadow-[0_0_12px_#55DDF5,0_0_8px_#FFFFFF] opacity-80 animate-[pulse_3s_ease-in-out_infinite]"
            style={{ top: '15%' }}
          />

          {/* Biometric & Reticle SVG Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 560 560" fill="none">
            {/* Concentric Reticles */}
            <circle cx="280" cy="280" r="275" stroke="rgba(255, 122, 36, 0.45)" strokeWidth="1.5" strokeDasharray="4 6" />
            <circle cx="280" cy="280" r="255" stroke="rgba(255, 179, 71, 0.25)" strokeWidth="1" />
            <circle cx="280" cy="280" r="235" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" strokeDasharray="12 8 2 8" />
            <circle cx="280" cy="280" r="200" stroke="rgba(255, 122, 36, 0.3)" strokeWidth="1" strokeDasharray="2 4" />
            <circle cx="280" cy="280" r="160" stroke="rgba(85, 221, 245, 0.25)" strokeWidth="1" />
            <circle cx="280" cy="280" r="120" stroke="rgba(255, 122, 36, 0.2)" strokeWidth="1" strokeDasharray="6 6" />

            {/* Cardinal Tech Ticks */}
            <g stroke="rgba(255, 179, 71, 0.4)" strokeWidth="1">
              <line x1="280" y1="10" x2="280" y2="24" />
              <line x1="280" y1="536" x2="280" y2="550" />
              <line x1="10" y1="280" x2="24" y2="280" />
              <line x1="536" y1="280" x2="550" y2="280" />
            </g>

            {/* Digital Fingerprint Geometry */}
            <g stroke="rgba(255, 122, 36, 0.4)" strokeWidth="1.6" strokeLinecap="round" fill="none">
              <ellipse cx="280" cy="250" rx="14" ry="22" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2" />
              <path d="M 280,220 C 265,220 256,235 256,252 C 256,275 270,290 280,300 C 290,290 304,275 304,252 C 304,235 295,220 280,220" />
              <path d="M 280,200 C 250,200 238,225 238,255 C 238,290 262,315 280,330 C 298,315 322,290 322,255 C 322,225 310,200 280,200" strokeDasharray="120 4 30 5" />
              <path d="M 280,180 C 235,180 220,215 220,258 C 220,305 250,338 280,358 C 310,338 340,305 340,258 C 340,215 325,180 280,180" stroke="rgba(255, 179, 71, 0.5)" />
              <path d="M 280,160 C 220,160 200,205 200,260 C 200,320 240,360 280,385 C 320,360 360,320 360,260 C 360,205 340,160 280,160" strokeDasharray="90 8 40 6 70 8" />
              <path d="M 280,140 C 205,140 180,195 180,265 C 180,335 230,380 280,410 C 330,380 380,335 380,265 C 380,195 355,140 280,140" stroke="rgba(85, 221, 245, 0.35)" />
              <circle cx="280" cy="250" r="3" fill="#FFFFFF" />
            </g>
          </svg>
        </div>
      </div>

      {/* Bottom Stage Baseline Line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-500/40 via-white to-transparent" />
    </section>
  );
}
