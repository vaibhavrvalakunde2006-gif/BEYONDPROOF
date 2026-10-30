'use client';

import React, { useState } from 'react';
import { User, Shield, Bell, Save, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { soundManager } from '@/lib/soundFx';

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.full_name || 'BBC Workspace');
  const [email, setEmail] = useState(user?.email || 'admin@beyondproof.dev');
  const [saved, setSaved] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSave = () => {
    soundManager.playSuccess();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleToggleSound = () => {
    const isMuted = soundManager.toggleMute();
    setSoundEnabled(!isMuted);
    if (!isMuted) soundManager.playBlip();
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">PREFERENCES / WORKSPACE</div>
          <h1>
            Workspace <em>settings.</em>
          </h1>
          <p>Manage your examiner profile, security policies, and audio preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <section className="panel">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
            <User size={20} />
          </div>
          <div className="eyebrow">PROFILE</div>
          <h2>Account details</h2>
          <p className="text-xs text-gray-400 mb-4">Examiner identity recorded on digital evidence certificates.</p>

          <label className="block text-xs font-semibold text-gray-300 mb-3">
            Workspace name
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
              className="mt-1 block w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-white text-xs outline-none focus:border-cyan-400"
            />
          </label>

          <label className="block text-xs font-semibold text-gray-300 mb-4">
            Email address
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSaved(false);
              }}
              className="mt-1 block w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-white text-xs outline-none focus:border-cyan-400"
            />
          </label>

          <button className="button w-full" onClick={handleSave}>
            <Save size={15} /> Save preferences
          </button>

          {saved && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <CheckCircle size={14} />
              <span>Preferences saved successfully.</span>
            </div>
          )}
        </section>

        {/* Security Card */}
        <section className="panel">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
            <Shield size={20} />
          </div>
          <div className="eyebrow">SECURITY</div>
          <h2>Evidence protection</h2>
          <p className="text-xs text-gray-400 mb-4">
            Production deployment enforces authenticated access, local object storage, and audit logging.
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between py-2 border-b border-gray-800/80">
              <span className="text-gray-400">Secure File Storage</span>
              <b className="text-emerald-400">Local SHA-256 Storage</b>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-800/80">
              <span className="text-gray-400">Authentication</span>
              <b className="text-emerald-400">Argon2id + JWT</b>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-800/80">
              <span className="text-gray-400">Audit Logging</span>
              <b className="text-cyan-400">SQLite Forensic Ledger</b>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-800/80">
              <span className="text-gray-400">Clearance Level</span>
              <b className="text-orange-400">Level 5 (Lead Examiner)</b>
            </div>
          </div>
        </section>

        {/* Notifications & Audio Card */}
        <section className="panel">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4">
            <Bell size={20} />
          </div>
          <div className="eyebrow">AUDIO &amp; TELEMETRY</div>
          <h2>Feedback preferences</h2>
          <p className="text-xs text-gray-400 mb-4">
            Configure procedural Web Audio cues and real-time investigation alerts.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-950 border border-gray-800">
              <div>
                <b className="text-xs text-white block">Procedural Web Audio FX</b>
                <small className="text-[10px] text-gray-400">Tactical sound cues on mode switches &amp; laser scans</small>
              </div>
              <button
                onClick={handleToggleSound}
                className={`p-2 rounded-lg border transition-colors ${
                  soundEnabled
                    ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-400'
                    : 'border-gray-800 bg-gray-900 text-gray-500'
                }`}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-2 border-b border-gray-800/80">
                <span className="text-gray-400">Investigation Alerts</span>
                <b className="text-emerald-400">Active (Real-Time)</b>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800/80">
                <span className="text-gray-400">FastAPI API Docs</span>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 underline"
                >
                  Open Swagger →
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
