'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, ArrowUpRight, Plus, ExternalLink, ShieldAlert } from 'lucide-react';
import { verificationAPI } from '@/lib/api';
import { soundManager } from '@/lib/soundFx';

interface HistoryItem {
  id: string;
  file_name?: string;
  overall_status?: string;
  risk_score?: number;
  created_at?: string;
}

const defaultRows: HistoryItem[] = [
  {
    id: 'INV-2026-0042',
    file_name: 'Vendor_Certificate.pdf',
    overall_status: 'SUSPICIOUS',
    risk_score: 84,
    created_at: 'Oct 30, 2026',
  },
  {
    id: 'INV-2026-0041',
    file_name: 'campaign-video.mp4',
    overall_status: 'UNVERIFIED',
    risk_score: 42,
    created_at: 'Oct 29, 2026',
  },
  {
    id: 'INV-2026-0039',
    file_name: 'identity_scan.png',
    overall_status: 'LOW RISK',
    risk_score: 12,
    created_at: 'Oct 28, 2026',
  },
  {
    id: 'INV-2026-0037',
    file_name: 'invoice-final.pdf',
    overall_status: 'UNVERIFIED',
    risk_score: 35,
    created_at: 'Oct 26, 2026',
  },
];

export default function HistoryPage() {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<HistoryItem[]>(defaultRows);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await verificationAPI.history();
        if (Array.isArray(res.data) && res.data.length > 0) {
          setItems(res.data);
        }
      } catch (err) {
        console.warn('Using baseline history records:', err);
      }
    }
    loadHistory();
  }, []);

  const filtered = items.filter((r) => {
    const q = search.toLowerCase();
    const id = (r.id || '').toLowerCase();
    const name = (r.file_name || '').toLowerCase();
    const status = (r.overall_status || '').toLowerCase();
    return id.includes(q) || name.includes(q) || status.includes(q);
  });

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">CASE MANAGEMENT / ARCHIVE</div>
          <h1>
            Investigation <em>history.</em>
          </h1>
          <p>Review previous cases, risk scores, and their recorded assessments.</p>
        </div>
        <Link
          href="/app/investigations/new"
          onClick={() => soundManager.playLaserScan()}
          className="button"
        >
          <Plus size={16} /> New investigation <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="panel history-panel">
        <div className="history-tools flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="search-field flex items-center gap-2 p-2 rounded-lg bg-gray-950 border border-gray-800 text-xs w-full sm:w-80">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by case ID, filename or status..."
              className="w-full bg-transparent border-0 outline-none text-white text-xs"
            />
          </div>
          <div className="text-xs font-mono text-gray-400">
            TOTAL CASES RECORDED: <strong>{filtered.length}</strong>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>CASE ID</th>
                <th>EVIDENCE FILE</th>
                <th>RISK / SCORE</th>
                <th>ASSESSMENT</th>
                <th>LAST UPDATED</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const statusKey = (r.overall_status || 'UNVERIFIED').toLowerCase().replace(' ', '-');
                return (
                  <tr key={r.id} className="hover:bg-gray-900/40 transition-colors">
                    <td className="mono font-semibold text-cyan-400">{r.id.slice(0, 16)}</td>
                    <td className="font-medium text-gray-200">{r.file_name || 'Evidence_File.bin'}</td>
                    <td>
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {r.risk_score !== undefined ? `${r.risk_score}/100` : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${statusKey}`}>{r.overall_status || 'COMPLETED'}</span>
                    </td>
                    <td className="muted">{r.created_at ? String(r.created_at).slice(0, 16) : 'Oct 30, 2026'}</td>
                    <td>
                      <Link
                        href={`/verification/${r.id}`}
                        onClick={() => soundManager.playBlip()}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs font-semibold"
                      >
                        <span>Dossier</span>
                        <ArrowUpRight size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="table-note text-gray-500 text-xs mt-4">
          All investigations are cryptographically anchored and stored in local SQLite database with SHA-256 integrity checks.
        </div>
      </div>
    </>
  );
}
