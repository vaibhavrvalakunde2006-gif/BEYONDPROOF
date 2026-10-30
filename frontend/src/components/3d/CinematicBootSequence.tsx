'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Sparkles, Terminal, CheckCircle2 } from 'lucide-react';

interface CinematicBootSequenceProps {
  onComplete: () => void;
  forceShow?: boolean;
}

export function CinematicBootSequence({ onComplete, forceShow = false }: CinematicBootSequenceProps) {
  const [step, setStep] = useState(0);
  const [telemetryMessage, setTelemetryMessage] = useState('SYSTEM COLD BOOT');
  const [visible, setVisible] = useState(true);

  const finish = useCallback(() => {
    setVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('beyondproof_boot_played', 'true');
    }
    setTimeout(() => {
      onComplete();
    }, 500);
  }, [onComplete]);

  useEffect(() => {
    // Check reduced motion or previous session
    if (typeof window !== 'undefined') {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const alreadyPlayed = sessionStorage.getItem('beyondproof_boot_played');
      if ((alreadyPlayed && !forceShow) || prefersReduced) {
        onComplete();
        setVisible(false);
        return;
      }
    }

    // Timeline schedule
    const t1 = setTimeout(() => {
      setStep(1); // Cyan light beacon
      setTelemetryMessage('INITIALIZING FORENSIC CORE');
    }, 400);

    const t2 = setTimeout(() => {
      setStep(2); // Concentric scanning rings
      setTelemetryMessage('ESTABLISHING SECURE ENVIRONMENT');
    }, 1100);

    const t3 = setTimeout(() => {
      setStep(3); // Biometric fingerprint ridges
      setTelemetryMessage('LOADING ANALYSIS ENGINES [7/7]');
    }, 1800);

    const t4 = setTimeout(() => {
      setStep(4); // Scanning beam & wordmark
      setTelemetryMessage('VERIFYING SYSTEM INTEGRITY: SHA-256 OK');
    }, 2600);

    const t5 = setTimeout(() => {
      setStep(5); // Wordmark & Tagline complete
      setTelemetryMessage('SYSTEM READY • ALL ENGINES OPERATIONAL');
    }, 3400);

    const t6 = setTimeout(() => {
      finish();
    }, 4400);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        finish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [finish, forceShow, onComplete]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="boot-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
        className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center select-none overflow-hidden"
      >
        {/* Background Grid & Ambient Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(0, 229, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 229, 255, 0.08) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            backgroundPosition: 'center center',
          }}
        />

        {/* Top Telemetry & Skip Button */}
        <div className="absolute top-6 left-8 right-8 flex items-center justify-between text-xs font-mono text-cyan-400/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="tracking-widest">BEYONDPROOF FORENSIC BOOT v2.4</span>
          </div>

          <button
            onClick={finish}
            className="px-3 py-1 rounded border border-cyan-500/40 text-[11px] hover:bg-cyan-500/10 text-cyan-300 transition-colors uppercase tracking-wider flex items-center gap-1.5"
          >
            <span>Skip Initialization</span>
            <kbd className="px-1.5 py-0.5 rounded bg-gray-900 border border-gray-700 text-[9px] text-gray-400">
              ESC
            </kbd>
          </button>
        </div>

        {/* Center Visual Staging */}
        <div className="relative flex flex-col items-center justify-center">
          {/* Phase 1: Cyan Point of Light */}
          <AnimatePresence>
            {step >= 1 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative flex items-center justify-center w-64 h-64"
              >
                {/* Central Beacon */}
                <div className="w-3 h-3 rounded-full bg-[#00E5FF] shadow-[0_0_30px_#00E5FF,0_0_60px_#00E5FF]" />

                {/* Phase 2: Concentric Scanning Rings */}
                {step >= 2 && (
                  <>
                    <motion.div
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.8 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-full border border-cyan-400/40 border-dashed animate-[spin_12s_linear_infinite]"
                    />
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1.25, opacity: 0.5 }}
                      transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-full border border-violet-500/30"
                    />
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1.55, opacity: 0.3 }}
                      transition={{ duration: 1.1, delay: 0.2, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-full border border-orange-500/20 border-dotted"
                    />
                  </>
                )}

                {/* Phase 3: Biometric Fingerprint Geometry */}
                {step >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <svg className="w-48 h-48 drop-shadow-[0_0_20px_#00E5FF]" viewBox="0 0 200 200" fill="none">
                      <path
                        d="M100 30 C60 30 40 65 40 100 C40 145 65 170 100 185 C135 170 160 145 160 100 C160 65 140 30 100 30"
                        stroke="#00E5FF"
                        strokeWidth="1.5"
                        strokeDasharray="6 3"
                      />
                      <path
                        d="M100 50 C75 50 60 75 60 100 C60 135 80 155 100 165 C120 155 140 135 140 100 C140 75 125 50 100 50"
                        stroke="#8B5CF6"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M100 70 C85 70 75 85 75 100 C75 120 90 135 100 145 C110 135 125 120 125 100 C125 85 115 70 100 70"
                        stroke="#FFB547"
                        strokeWidth="2"
                      />
                      <ellipse cx="100" cy="100" rx="10" ry="16" stroke="#FFFFFF" strokeWidth="2.5" />
                    </svg>
                  </motion.div>
                )}

                {/* Phase 4: Scanning Laser Line */}
                {step >= 4 && (
                  <motion.div
                    initial={{ y: -80, opacity: 0 }}
                    animate={{ y: 80, opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute w-56 h-[2px] bg-gradient-to-r from-transparent via-[#00E5FF] via-white to-transparent shadow-[0_0_15px_#00E5FF]"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 5: Brand Identity Materialization */}
          <div className="mt-8 text-center min-h-[90px]">
            {step >= 4 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-black shadow-[0_0_15px_rgba(255,255,255,0.7)]">
                    <svg className="w-3.5 h-3.5 fill-black" viewBox="0 0 24 24">
                      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                    </svg>
                  </div>
                  <span
                    className="text-2xl sm:text-3xl font-extrabold tracking-widest text-white uppercase"
                    style={{ fontFamily: "'Anta', sans-serif" }}
                  >
                    BEYOND<span className="text-cyan-400">PROOF</span>
                  </span>
                </div>
              </motion.div>
            )}

            {step >= 5 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-xs sm:text-sm font-mono tracking-widest text-orange-400 uppercase font-semibold"
              >
                BEYOND TRUST. BEYOND DOUBT.
              </motion.p>
            )}
          </div>
        </div>

        {/* Bottom Status / Telemetry Stream */}
        <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-950/80 border border-cyan-500/20 text-xs font-mono text-cyan-300 backdrop-blur-md shadow-[0_0_20px_rgba(0,229,255,0.15)]">
            <Terminal className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="tracking-wider">{telemetryMessage}</span>
          </div>

          {/* Progress bar */}
          <div className="w-56 h-1 bg-gray-900 rounded-full mt-3 overflow-hidden border border-gray-800">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-cyan-500 via-violet-500 to-orange-500 shadow-[0_0_8px_#00E5FF]"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
