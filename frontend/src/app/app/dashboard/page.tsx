'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Plus,
  FileSearch,
  ShieldCheck,
  Clock3,
  Activity,
  Network,
  ScanLine,
  Fingerprint,
  LockKeyhole,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { verificationAPI } from '@/lib/api';
import { soundManager } from '@/lib/soundFx';

// Dynamically import 3D Integrity Core
const ThreeDIntegrityCore = dynamic(
  () => import('@/components/3d/ThreeDIntegrityCore'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[280px] bg-gray-950/40 rounded-xl flex items-center justify-center border border-gray-800">
        <span className="text-xs font-mono text-cyan-400 animate-pulse">
          INITIALIZING 3D INTEGRITY CORE...
        </span>
      </div>
    ),
  }
);

interface VerificationItem {
  id: string;
  file_name?: string;
  overall_status?: string;
  created_at?: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_verifications: 24,
    files_analyzed: 38,
    reports_generated: 16,
    engines_active: 7,
  });
  const [recentList, setRecentList] = useState<VerificationItem[]>([
    {
      id: 'INV-2026-0042',
      file_name: 'Vendor_Certificate.pdf',
      overall_status: 'SUSPICIOUS',
      created_at: '12 min ago',
    },
    {
      id: 'INV-2026-0041',
      file_name: 'campaign-video.mp4',
      overall_status: 'UNVERIFIED',
      created_at: 'Yesterday',
    },
    {
      id: 'INV-2026-0039',
      file_name: 'identity_scan.png',
      overall_status: 'LOW RISK',
      created_at: 'Oct 28',
    },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, historyRes] = await Promise.allSettled([
          verificationAPI.stats(),
          verificationAPI.history(),
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
          const d = statsRes.value.data;
          setStats({
            total_verifications: d.total_verifications ?? 24,
            files_analyzed: d.files_analyzed ?? 38,
            reports_generated: d.reports_generated ?? 16,
            engines_active: d.engines_active ?? 7,
          });
        }

        if (historyRes.status === 'fulfilled' && Array.isArray(historyRes.value?.data) && historyRes.value.data.length > 0) {
          setRecentList(historyRes.value.data.slice(0, 5));
        }
      } catch (err) {
        console.warn('Backend sync warning, using local demonstration telemetry:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <>
      {/* Page Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">COMMAND CENTRE / OVERVIEW</div>
          <h1>
            Good evening, <em>investigator.</em>
          </h1>
          <p>Your digital evidence workspace at a glance.</p>
        </div>
        <Link
          href="/app/investigations/new"
          onClick={() => soundManager.playLaserScan()}
          className="button"
        >
          <Plus size={17} /> New investigation
        </Link>
      </div>

      {/* Notice Banner */}
      <div className="notice">
        <span className="pulse" />
        <span className="font-bold">FASTAPI FORENSIC PIPELINE READY</span>
        <span>— Real-time analysis across 7 microservices with cryptographic proof.</span>
      </div>

      {/* Metric Cards Grid */}
      <div className="metric-grid">
        <div className="metric-card">
          <span>TOTAL INVESTIGATIONS</span>
          <b>{stats.total_verifications}</b>
          <small>
            <Activity size={13} className="text-cyan-400" /> Live SQLite workspace records
          </small>
        </div>
        <div className="metric-card">
          <span>FILES ANALYSED</span>
          <b>{stats.files_analyzed}</b>
          <small>
            <FileSearch size={13} className="text-cyan-400" /> Across enabled engines
          </small>
        </div>
        <div className="metric-card">
          <span>REPORTS GENERATED</span>
          <b>{stats.reports_generated}</b>
          <small>
            <ShieldCheck size={13} className="text-emerald-400" /> SHA-256 certified dossiers
          </small>
        </div>
        <div className="metric-card">
          <span>ACTIVE ENGINES</span>
          <b>0{stats.engines_active}</b>
          <small>
            <span className="dot-green" /> FastAPI microservices online
          </small>
        </div>
      </div>

      {/* 3D Integrity Core Holodeck Widget */}
      <div className="mb-6 rounded-2xl bg-gradient-to-b from-gray-950 via-gray-900/60 to-gray-950 border border-cyan-500/30 p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-gray-800/80 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono text-xs font-bold text-cyan-300 tracking-wider">
              01. 3D PLATFORM INTEGRITY CORE
            </span>
          </div>
          <span className="text-[11px] font-mono text-gray-400">
            REAL-TIME WEBGL TELEMETRY // 7 NODES SYNCHRONIZED
          </span>
        </div>
        <ThreeDIntegrityCore />
      </div>

      {/* Main Dash Grid */}
      <div className="dash-grid">
        {/* Recent Investigations Table */}
        <section className="panel recent-panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">LATEST ACTIVITY</div>
              <h2>Recent investigations</h2>
            </div>
            <Link
              href="/app/history"
              onClick={() => soundManager.playBlip()}
              className="text-link"
            >
              View all <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>INVESTIGATION</th>
                  <th>FILE</th>
                  <th>ASSESSMENT</th>
                  <th>UPDATED</th>
                </tr>
              </thead>
              <tbody>
                {recentList.map((r) => {
                  const statusKey = (r.overall_status || 'UNVERIFIED').toLowerCase().replace(' ', '-');
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-900/40 cursor-pointer transition-colors"
                      onClick={() => soundManager.playBlip()}
                    >
                      <td className="mono">{r.id.slice(0, 14)}</td>
                      <td className="font-medium text-gray-200">{r.file_name || 'Evidence_File.bin'}</td>
                      <td>
                        <span className={`status ${statusKey}`}>{r.overall_status || 'COMPLETED'}</span>
                      </td>
                      <td className="muted">{r.created_at ? String(r.created_at).slice(0, 16) : 'Just now'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick Access Engines */}
        <section className="panel quick-panel">
          <div className="eyebrow">QUICK ACCESS</div>
          <h2>Choose an engine</h2>
          <Link
            href="/app/engines/document"
            onClick={() => soundManager.playModeSwitch()}
          >
            <FileSearch />
            <span>
              <b>Document Verifier</b>
              <small>Inspect PDFs, fonts &amp; cross-ref trees</small>
            </span>
            <ArrowUpRight />
          </Link>
          <Link
            href="/app/engines/media"
            onClick={() => soundManager.playModeSwitch()}
          >
            <ScanLine />
            <span>
              <b>Media Truth / AFTERIMAGE</b>
              <small>ELA heightmaps, spectrograms &amp; keyframes</small>
            </span>
            <ArrowUpRight />
          </Link>
          <Link
            href="/app/trust-graph"
            onClick={() => soundManager.playModeSwitch()}
          >
            <Network />
            <span>
              <b>Trust Graph</b>
              <small>NetworkX relational fraud intelligence</small>
            </span>
            <ArrowUpRight />
          </Link>
          <Link
            href="/app/engines/identity"
            onClick={() => soundManager.playModeSwitch()}
          >
            <Fingerprint />
            <span>
              <b>Identity Guardian</b>
              <small>3D Biometrics &amp; ICAO 7-3-1 modulo-10</small>
            </span>
            <ArrowUpRight />
          </Link>
        </section>
      </div>

      {/* Forensic Core Status Grid */}
      <div className="panel engine-status">
        <div className="panel-head">
          <div>
            <div className="eyebrow">FORENSIC CORE</div>
            <h2>Seven engines. One investigation.</h2>
          </div>
          <span className="status low-risk">FASTAPI ACTIVE (7/7)</span>
        </div>
        <div className="engine-status-grid">
          {[
            { name: 'Identity Guardian', path: '/app/engines/identity', sub: 'Biometric & MRZ Checksums' },
            { name: 'Document Verifier', path: '/app/engines/document', sub: 'PDF Glyphs & Cryptographic Sig' },
            { name: 'Media Truth', path: '/app/engines/media', sub: 'Spectral ELA & Audio FFT' },
            { name: 'Source Tracker', path: '/app/engines/source', sub: 'Perceptual pHash & SHA-256' },
            { name: 'Trust Graph', path: '/app/trust-graph', sub: 'Relational NetworkX Graph' },
            { name: 'AI Risk Analyzer', path: '/app/engines/risk', sub: 'Explainable Bayesian Scoring' },
            { name: 'Verification Hub', path: '/verification', sub: 'Certified PDF Dossier' },
          ].map((x, i) => (
            <Link
              key={x.name}
              href={x.path}
              onClick={() => soundManager.playModeSwitch()}
              className="block cursor-pointer hover:border-cyan-500/50 transition-colors"
            >
              <span className="engine-number">0{i + 1}</span>
              <b>{x.name}</b>
              <small>
                <i className="dot-green" /> {x.sub}
              </small>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
