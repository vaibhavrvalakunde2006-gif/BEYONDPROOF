'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  Search,
  Filter,
  Download,
  ArrowRight,
  Clock,
  ShieldAlert,
  FileCheck,
  FileText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { verificationAPI } from '@/lib/api';
import { VerificationRequest } from '@/lib/types';
import { formatDate, getRiskBgColor, getRiskColor, getRiskLabel } from '@/lib/utils';
import dynamic from 'next/dynamic';
import EngineStatusBadge from '@/components/engines/EngineStatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const ThreeDEvidenceChamber = dynamic(
  () => import('@/components/3d/ThreeDEvidenceChamber'),
  { ssr: false }
);

export default function VerificationHubPage() {
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const res = await verificationAPI.history();
        setVerifications(res.data || []);
      } catch (err: any) {
        console.error('Failed to load verification history', err);
        setVerifications([]);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const handleDownloadReport = async (id: string, filename: string) => {
    try {
      const res = await verificationAPI.downloadReport(id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `beyondproof-audit-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download report error', err);
      alert('Failed to download PDF audit report. Please ensure the verification is complete.');
    }
  };

  const filtered = verifications.filter((v) => {
    const matchesSearch =
      v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.file?.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.file?.sha256_hash?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchesRisk =
      riskFilter === 'all' || v.risk_assessment?.risk_category === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-50 tracking-tight flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
            <span>Verification Hub & Audit Ledger</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Complete cryptographic audit trail of all inspected files, threat verdicts, and certified PDF reports.
          </p>
        </div>

        <Link href="/upload" className="btn-primary py-2.5 px-5 text-sm font-semibold">
          <span>New Verification</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Link>
      </div>

      {/* 3D Holographic Evidence Vault */}
      <ThreeDEvidenceChamber
        verdict={verifications[0]?.risk_assessment?.risk_category ?? 'low_risk'}
        sha256={verifications[0]?.file?.sha256_hash ?? 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
        filename={verifications[0]?.file?.filename ?? 'master_evidence_vault.bin'}
        confidence={97.8}
      />

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by file name, SHA-256, or verification ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-gray-900 border border-gray-800 text-xs text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Pipeline Statuses</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setPage(1);
              }}
              className="bg-gray-900 border border-gray-800 text-xs text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Risk Categories</option>
              <option value="low_risk">Low Risk</option>
              <option value="suspicious">Suspicious</option>
              <option value="high_risk">High Risk</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="Retrieving cryptographic verification logs..." />
        </div>
      ) : paginated.length > 0 ? (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-900/90 text-gray-400 font-semibold uppercase tracking-wider border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">Verification ID</th>
                  <th className="py-3 px-4">Target File</th>
                  <th className="py-3 px-4">Pipeline Status</th>
                  <th className="py-3 px-4">Risk Verdict</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/80 text-gray-300">
                {paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-gray-300">
                      {item.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-100 truncate max-w-xs">
                        {item.file?.filename || item.file_id}
                      </div>
                      <div className="text-[10px] font-mono text-gray-500 truncate max-w-[200px]">
                        {item.file?.sha256_hash ? `${item.file.sha256_hash.slice(0, 16)}...` : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <EngineStatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getRiskBgColor(
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
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/verification/${item.id}`}
                          className="p-1.5 rounded-lg bg-gray-800/80 text-gray-300 hover:text-white hover:bg-violet-600 transition-colors"
                          title="View Detailed Report"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDownloadReport(item.id, item.file?.filename || 'audit')}
                          className="p-1.5 rounded-lg bg-gray-800/80 text-gray-300 hover:text-cyan-300 hover:bg-gray-700 transition-colors"
                          title="Download Certified PDF Report"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
              <span>
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of{' '}
                {filtered.length} entries
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-1.5 rounded border border-gray-800 disabled:opacity-30 hover:bg-gray-900"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-gray-200">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded border border-gray-800 disabled:opacity-30 hover:bg-gray-900"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No verification records match your filters"
          description="Try clearing your search query or upload a new file to initiate forensic processing."
          action={{
            label: 'Upload New File',
            href: '/upload',
          }}
        />
      )}
    </div>
  );
}
