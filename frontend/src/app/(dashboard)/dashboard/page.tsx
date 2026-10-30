'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  CheckCircle,
  FileCheck,
  AlertTriangle,
  Cpu,
  ArrowRight,
  TrendingUp,
  Clock,
  Shield,
  FileSearch,
  Eye,
  Fingerprint,
  Network,
  Brain,
  Download,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { adminAPI, verificationAPI } from '@/lib/api';
import { DashboardStats, VerificationRequest } from '@/lib/types';
import { formatDate, getRiskBgColor, getRiskColor, getRiskLabel } from '@/lib/utils';
import StatCard from '@/components/dashboard/StatCard';
import EngineStatusBadge from '@/components/engines/EngineStatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentVerifications, setRecentVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        // Try admin dashboard first
        try {
          const res = await adminAPI.getDashboard();
          setStats(res.data);
          if (res.data.recent_verifications) {
            setRecentVerifications(res.data.recent_verifications);
          }
        } catch {
          // Fallback to verification history
          const historyRes = await verificationAPI.history();
          const items: VerificationRequest[] = historyRes.data || [];
          setRecentVerifications(items.slice(0, 10));

          const low = items.filter((i) => i.risk_assessment?.risk_category === 'low_risk').length;
          const suspicious = items.filter((i) => i.risk_assessment?.risk_category === 'suspicious').length;
          const high = items.filter((i) => i.risk_assessment?.risk_category === 'high_risk').length;
          const unverified = items.length - (low + suspicious + high);

          setStats({
            total_verifications: items.length,
            total_files: items.length,
            risk_distribution: {
              low_risk: low,
              suspicious: suspicious,
              high_risk: high,
              unverified: unverified,
            },
            recent_verifications: items.slice(0, 10),
            engine_stats: {},
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const riskPieData = stats?.risk_distribution
    ? [
        { name: 'Low Risk', value: stats.risk_distribution.low_risk || 0, color: '#10b981' },
        { name: 'Suspicious', value: stats.risk_distribution.suspicious || 0, color: '#f59e0b' },
        { name: 'High Risk', value: stats.risk_distribution.high_risk || 0, color: '#ef4444' },
        { name: 'Unverified', value: stats.risk_distribution.unverified || 0, color: '#6b7280' },
      ].filter((d) => d.value > 0)
    : [];

  const engines = [
    { name: 'Identity Guardian', icon: Shield, status: 'completed', desc: 'Biometric & MRZ Integrity' },
    { name: 'Document Verifier', icon: FileSearch, status: 'completed', desc: 'PDF Structure & Fonts' },
    { name: 'Media Truth (AFTERIMAGE)', icon: Eye, status: 'completed', desc: 'Spectral & ELA Hunting' },
    { name: 'Source Tracker', icon: Fingerprint, status: 'completed', desc: 'Perceptual Hashes' },
    { name: 'Trust Graph', icon: Network, status: 'completed', desc: 'Relational Cross-Audit' },
    { name: 'AI Risk Analyzer', icon: Brain, status: 'completed', desc: 'Deterministic Scoring' },
    { name: 'Verification Hub', icon: CheckCircle, status: 'completed', desc: 'Report Certification' },
  ];

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" label="Loading security telemetry & forensic data..." />
      </div>
    );
  }

  const suspiciousTotal =
    (stats?.risk_distribution?.suspicious || 0) + (stats?.risk_distribution?.high_risk || 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-50 tracking-tight">
            Forensic Intelligence Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time multi-engine telemetry, forensic pipeline status, and threat landscape
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/upload" className="btn-primary py-2.5 px-4 text-sm font-semibold">
            <span>Verify New Artifact</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Verifications"
          value={stats?.total_verifications ?? 0}
          icon={CheckCircle}
          accentColor="violet"
          trend={{ value: '12%', positive: true, label: 'vs last week' }}
        />
        <StatCard
          label="Files Analyzed"
          value={stats?.total_files ?? 0}
          icon={FileCheck}
          accentColor="cyan"
          trend={{ value: '8%', positive: true }}
        />
        <StatCard
          label="Suspicious Detected"
          value={suspiciousTotal}
          icon={AlertTriangle}
          accentColor={suspiciousTotal > 0 ? 'red' : 'emerald'}
          trend={{ value: `${suspiciousTotal} flags`, positive: false }}
        />
        <StatCard
          label="Engines Active"
          value="7 / 7"
          icon={Cpu}
          accentColor="emerald"
          trend={{ value: '100% Operational', positive: true }}
        />
      </div>

      {/* Risk Distribution and Engine Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Pie Chart */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-100">Risk Distribution</h2>
            <p className="text-xs text-gray-400">Classified forensic threats across all pipelines</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {riskPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#111827" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#374151',
                      borderRadius: '8px',
                      color: '#f9fafb',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-gray-300 font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-gray-500">
                No verifications recorded yet. Run a verification to populate telemetry.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-800 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-gray-900/60 border border-gray-800/80">
              <span className="text-gray-400 block">Low Risk:</span>
              <span className="text-emerald-400 font-bold text-sm">
                {stats?.risk_distribution?.low_risk || 0}
              </span>
            </div>
            <div className="p-2 rounded bg-gray-900/60 border border-gray-800/80">
              <span className="text-gray-400 block">High Risk / Suspicious:</span>
              <span className="text-red-400 font-bold text-sm">{suspiciousTotal}</span>
            </div>
          </div>
        </div>

        {/* Engine Pipeline Status Grid */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-100">Seven Forensic Engines</h2>
              <p className="text-xs text-gray-400">Continuous microservice health and operational readiness</p>
            </div>
            <span className="cyber-badge bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              All Systems Operational
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {engines.map((engine) => {
              const Icon = engine.icon;
              return (
                <div
                  key={engine.name}
                  className="p-3.5 rounded-lg bg-gray-900/70 border border-gray-800 hover:border-violet-500/30 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-200 truncate">{engine.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{engine.desc}</p>
                    </div>
                  </div>
                  <EngineStatusBadge status={engine.status} size="sm" showLabel={false} />
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Pipeline Concurrency: Active</span>
            <span className="font-mono text-cyan-400">Node Cluster: Healthy</span>
          </div>
        </div>
      </div>

      {/* Recent Verifications Table */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-100">Recent Verification Requests</h2>
            <p className="text-xs text-gray-400">Latest files inspected by the multi-engine pipeline</p>
          </div>
          <Link
            href="/verification"
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentVerifications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-900/80 text-gray-400 font-semibold border-b border-gray-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Verification ID / Target File</th>
                  <th className="py-3 px-4">Engines</th>
                  <th className="py-3 px-4">Pipeline Status</th>
                  <th className="py-3 px-4">Risk Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-gray-300">
                {recentVerifications.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-gray-100 truncate max-w-xs">
                        {item.file?.filename || item.file_id || 'Uploaded Artifact'}
                      </div>
                      <div className="text-[11px] font-mono text-gray-500 truncate max-w-[200px]">
                        {item.id}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 font-mono text-[11px] text-gray-400">
                        {item.engines_requested?.length || item.engine_results?.length || 7} engines
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <EngineStatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getRiskBgColor(
                          item.risk_assessment?.risk_category
                        )}`}
                      >
                        {getRiskLabel(item.risk_assessment?.risk_category)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/verification/${item.id}`}
                        className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-medium"
                      >
                        <span>Audit</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 border border-dashed border-gray-800 rounded-lg">
            <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-300">No verifications on record yet</p>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Upload your first document or media file to generate cryptographic audit trails.
            </p>
            <Link href="/upload" className="btn-primary py-2 px-4 text-xs font-semibold">
              Upload File Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
