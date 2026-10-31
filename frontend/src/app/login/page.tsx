'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Shield,
  Lock,
  Mail,
  Sparkles,
  CheckCircle,
  Scan,
} from 'lucide-react';
import { soundManager } from '@/lib/soundFx';

export default function EliteLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState<'idle' | 'scanning' | 'granted'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAuth();
  };

  const triggerAuth = () => {
    soundManager.playLaserScan();
    setIsAuthenticating(true);
    setAuthStep('scanning');

    setTimeout(() => {
      soundManager.playSuccessChime();
      setAuthStep('granted');
      setTimeout(() => {
        router.push('/app/dashboard');
      }, 600);
    }, 1000);
  };

  const handleJudgePass = () => {
    setEmail('lead.investigator@beyondproof.internal');
    setPassword('••••••••••••••••');
    triggerAuth();
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Dynamic Ambient Aurora Orbs */}
      <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-cyan-500/15 blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full bg-purple-600/15 blur-[150px] pointer-events-none z-0" />

      {/* Brand Top Left */}
      <Link
        href="/"
        onClick={() => soundManager.playBlip()}
        className="absolute top-8 left-8 flex items-center gap-3 text-white font-bold z-20"
      >
        <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-white">
          <Shield className="w-4 h-4 text-cyan-400" />
        </div>
        <span className="text-[14px] font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          BEYOND<span className="text-cyan-400">PROOF</span>
        </span>
      </Link>

      {/* Institutional Liquid Glass Auth Card */}
      <div className="relative w-full max-w-md z-10">
        <div className="p-8 sm:p-10 rounded-2xl pro-panel space-y-6">
          
          <div>
            <div className="badge-clean badge-cyan mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>SECURE ACCESS PORTAL</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Sign in to Workspace
            </h1>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Authenticate session credentials to access active evidence dossiers.
            </p>
          </div>

          {/* 1-Click Judge Pass */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleJudgePass}
              disabled={isAuthenticating}
              className="w-full py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.15] text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm group cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>1-Click Lead Auditor Pass (For Judges)</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <span className="block text-center text-[10px] text-slate-500 font-mono">
              Direct express bypass for hackathon demonstration
            </span>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">
              OR CREDENTIAL LOGIN
            </span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-slate-300 mb-1.5 text-[11px] font-medium">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="auditor@beyondproof.internal"
                className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/[0.1] focus:border-cyan-400/60 focus:outline-none text-white text-xs transition-colors placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 text-[11px] font-medium">
                Passkey
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/[0.1] focus:border-cyan-400/60 focus:outline-none text-white text-xs transition-colors placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className={`w-full py-2.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all mt-4 ${
                authStep === 'granted'
                  ? 'bg-emerald-500 text-black'
                  : authStep === 'scanning'
                  ? 'bg-cyan-500 text-black'
                  : 'btn-primary w-full'
              }`}
            >
              {authStep === 'granted' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Access Granted</span>
                </>
              ) : authStep === 'scanning' ? (
                <>
                  <Scan className="w-4 h-4 animate-spin" />
                  <span>Verifying Keyring...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
            <span>Need key credentials?</span>
            <Link
              href="/register"
              onClick={() => soundManager.playBlip()}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Provision Keyring &rarr;
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
