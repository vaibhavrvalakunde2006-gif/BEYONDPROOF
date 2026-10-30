'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Fingerprint,
  ArrowRight,
  Shield,
  Lock,
  Mail,
  Sparkles,
  CheckCircle,
  Scan,
} from 'lucide-react';
import { soundManager } from '@/lib/soundFx';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState<'idle' | 'scanning' | 'granted'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAuth('analyst@beyondproof.internal');
  };

  const triggerAuth = (targetEmail: string) => {
    soundManager.playLaserScan();
    setIsAuthenticating(true);
    setAuthStep('scanning');

    setTimeout(() => {
      soundManager.playSuccessChime();
      setAuthStep('granted');
      setTimeout(() => {
        router.push('/app/dashboard');
      }, 700);
    }, 1200);
  };

  const handleJudgePass = () => {
    setEmail('lead.investigator@beyondproof.internal');
    setPassword('••••••••••••••••');
    triggerAuth('lead.investigator@beyondproof.internal');
  };

  return (
    <main className="min-h-screen bg-[#05070b] flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Ambient Cybernetic Grid & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,rgba(0,229,255,0.12)_0%,rgba(5,7,11,0.98)_70%)] pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,229,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.2) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top Left Brandmark */}
      <Link
        href="/"
        onClick={() => soundManager.playBlip()}
        className="absolute top-8 left-8 flex items-center gap-2.5 font-bold tracking-wider text-sm lg:text-base text-white hover:opacity-90 transition-opacity"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
          <Fingerprint className="w-5 h-5" />
        </div>
        <span>
          BEYOND<span className="text-cyan-400">PROOF</span>
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          OS v2.4
        </span>
      </Link>

      {/* Auth Card */}
      <div className="relative w-full max-w-md p-8 sm:p-10 rounded-3xl bg-[#0a0f18]/90 border border-cyan-500/30 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,229,255,0.12)] z-10">
        {/* Eyebrow */}
        <div className="flex items-center justify-between text-xs font-mono mb-6">
          <span className="text-cyan-400 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            SECURE ACCESS PORTAL // 01
          </span>
          <span className="text-gray-500">256-BIT TLS</span>
        </div>

        {/* Header */}
        <h1
          className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Welcome <span className="text-cyan-400">Back.</span>
        </h1>
        <p className="text-xs font-mono text-gray-400 mb-8 leading-relaxed">
          Sign in with cryptographic clearance to access active forensic dossiers and engine telemetry.
        </p>

        {/* 1-Click Judge Express Bypass */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleJudgePass}
            disabled={isAuthenticating}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 border border-cyan-400/50 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:shadow-[0_0_30px_rgba(0,229,255,0.35)] group active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>1-CLICK JUDGE PASS (LEAD INVESTIGATOR)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <span className="block text-center text-[10px] font-mono text-gray-500 mt-2">
            Instant bypass for hackathon demonstration &amp; evaluation
          </span>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/[0.08]" />
          <span className="text-[10px] font-mono text-gray-500 uppercase">OR STANDARD SIGN IN</span>
          <div className="flex-1 h-px bg-white/[0.08]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-gray-400 mb-2 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>OFFICIAL EMAIL ADDRESS</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="lead.analyst@beyondproof.internal"
              className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 focus:outline-none text-white text-xs transition-colors placeholder:text-gray-600"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>ENCRYPTED PASSKEY</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••••••"
              className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 focus:outline-none text-white text-xs transition-colors placeholder:text-gray-600"
            />
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-4 ${
              authStep === 'granted'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                : authStep === 'scanning'
                ? 'bg-cyan-600 text-white animate-pulse'
                : 'bg-gradient-to-r from-cyan-500 to-teal-400 text-black hover:brightness-110 shadow-lg shadow-cyan-600/25'
            }`}
          >
            {authStep === 'granted' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>CLEARANCE GRANTED // REDIRECTING...</span>
              </>
            ) : authStep === 'scanning' ? (
              <>
                <Scan className="w-4 h-4 animate-spin" />
                <span>VERIFYING CRYPTOGRAPHIC TOKEN...</span>
              </>
            ) : (
              <>
                <span>AUTHENTICATE SESSION</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-gray-500">
          <span>New investigator?</span>
          <Link
            href="/register"
            onClick={() => soundManager.playBlip()}
            className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
          >
            Register Workspace &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
