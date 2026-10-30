'use client';

import React, { useState } from 'react';
import {
  Fingerprint,
  GitCompare,
  History,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  FileCheck,
  Hash,
  Database,
} from 'lucide-react';
import { filesAPI, engineAPI } from '@/lib/api';
import { SourceComparisonResult } from '@/lib/types';
import dynamic from 'next/dynamic';
import FileUploadZone from '@/components/ui/FileUploadZone';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

const ThreeDProvenanceChain = dynamic(
  () => import('@/components/3d/ThreeDProvenanceChain'),
  { ssr: false }
);

interface FingerprintRecord {
  id: string;
  file_id: string;
  sha256: string;
  registered_by?: string;
  notes?: string;
  registered_at: string;
}

export default function SourceTrackerPage() {
  const [activeTab, setActiveTab] = useState<'compare' | 'lookup'>('compare');

  // Compare state
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<SourceComparisonResult | null>(null);
  const [comparisonError, setComparisonError] = useState<string | null>(null);

  // History / lookup state
  const [searchHash, setSearchHash] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<FingerprintRecord[]>([]);
  const [searched, setSearched] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!file1 || !file2) return;
    setComparing(true);
    setComparisonResult(null);
    setComparisonError(null);

    try {
      const up1 = await filesAPI.upload(file1);
      const up2 = await filesAPI.upload(file2);
      const id1 = up1.data.id || up1.data.file_id;
      const id2 = up2.data.id || up2.data.file_id;

      const compRes = await engineAPI.compareFiles({ file_id_1: id1, file_id_2: id2 });
      const raw = compRes.data;

      const scoreNum = Number(raw.similarity_score ?? 0);
      const scorePct = scoreNum <= 1.0 ? Math.round(scoreNum * 1000) / 10 : Math.round(scoreNum * 10) / 10;

      setComparisonResult({
        similarity_score: scorePct,
        hash_matches: Boolean(raw.sha256_match ?? raw.is_exact_match ?? raw.hash_matches),
        relationship: raw.relationship || (raw.sha256_match ? 'Exact Bitwise Match' : 'Different Files'),
        content_diff_summary:
          raw.content_diff_summary ||
          `Comparison complete. File A hash: ${raw.file_1_hash || 'N/A'}, File B hash: ${raw.file_2_hash || 'N/A'}.`,
        metadata_diff: raw.metadata_diff || {
          'SHA-256': {
            file1: raw.file_1_hash || 'Baseline Hash',
            file2: raw.file_2_hash || 'Derivative Hash',
          },
        },
      });
    } catch (err: any) {
      console.error('File comparison failed', err);
      const msg = err?.response?.data?.detail || err?.message || 'File comparison failed. Please check backend server.';
      setComparisonError(msg);
    } finally {
      setComparing(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchHash.trim()) return;
    setLookupLoading(true);
    setLookupError(null);
    setHistoryRecords([]);
    setSearched(false);

    try {
      const res = await engineAPI.getSourceHistory(searchHash.trim());
      const records: FingerprintRecord[] = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
      setHistoryRecords(records);
      setSearched(true);
    } catch (err: any) {
      console.error('Provenance registry lookup failed', err);
      const msg = err?.response?.data?.detail || err?.message || 'Failed to search provenance registry.';
      setLookupError(msg);
      setSearched(true);
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-50 tracking-tight flex items-center gap-3">
          <Fingerprint className="w-8 h-8 text-amber-400" />
          <span>Source Tracker & Provenance Engine</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Cryptographic chain-of-custody, perceptual hash (pHash) registry lookup, and dual-file forensic comparison.
        </p>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab('compare')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'compare'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
          }`}
        >
          <GitCompare className="w-4 h-4" />
          <span>File Comparison Diff</span>
        </button>

        <button
          onClick={() => setActiveTab('lookup')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'lookup'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Fingerprint Registry Lookup</span>
        </button>
      </div>

      {/* 3D Cryptographic Provenance Chain & Comparator */}
      <ThreeDProvenanceChain
        mode={activeTab === 'compare' ? 'compare' : 'chain'}
        matchPercentage={comparisonResult ? Math.round(comparisonResult.similarity_score * 100) : 94.2}
        hammingDistance={comparisonResult ? Math.round((1 - comparisonResult.similarity_score) * 64) : 4}
      />

      {/* TAB 1: Comparison Tool */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File 1 Upload */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-cyan-400" />
                <span>Primary / Baseline Artifact (File A)</span>
              </h3>
              <FileUploadZone
                onFileSelect={(file) => setFile1(file)}
                selectedFile={file1}
                onClear={() => setFile1(null)}
                label="Select Baseline File A"
                sublabel="Known authentic or earlier version"
              />
            </div>

            {/* File 2 Upload */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-violet-400" />
                <span>Suspect / Derivative Artifact (File B)</span>
              </h3>
              <FileUploadZone
                onFileSelect={(file) => setFile2(file)}
                selectedFile={file2}
                onClear={() => setFile2(null)}
                label="Select Suspect File B"
                sublabel="Questioned or recently received version"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleCompare}
              disabled={!file1 || !file2 || comparing}
              className="btn-primary py-3 px-8 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {comparing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Computing Cross-File Diff...</span>
                </>
              ) : (
                <>
                  <GitCompare className="w-4 h-4" />
                  <span>Compare Artifacts</span>
                </>
              )}
            </button>
          </div>

          {/* Comparison Error Banner */}
          {comparisonError && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-red-200 mb-0.5">Comparison Engine Error</span>
                <span>{comparisonError}</span>
              </div>
            </div>
          )}

          {/* Comparison Result */}
          {comparisonResult && (
            <div className="glass-card p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
                <div>
                  <h3 className="text-base font-bold text-gray-100">Forensic Comparison Verdict</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{comparisonResult.relationship}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                      Similarity Score
                    </span>
                    <span className="text-xl font-extrabold text-cyan-400">
                      {comparisonResult.similarity_score}%
                    </span>
                  </div>
                  <Badge variant={comparisonResult.hash_matches ? 'success' : 'warning'}>
                    {comparisonResult.hash_matches ? 'Exact Bitwise Match' : 'Different Hashes'}
                  </Badge>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-lg bg-gray-900/80 border border-gray-800 text-xs text-gray-300 leading-relaxed">
                <span className="font-semibold text-gray-100 block mb-1">Content Diff Analysis:</span>
                {comparisonResult.content_diff_summary}
              </div>

              {/* Metadata Diff Table */}
              {comparisonResult.metadata_diff && Object.keys(comparisonResult.metadata_diff).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    Metadata & Specification Variance
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-900 text-gray-400 border-b border-gray-800 uppercase font-mono">
                        <tr>
                          <th className="py-2.5 px-4">Attribute</th>
                          <th className="py-2.5 px-4 text-cyan-400">File A (Baseline)</th>
                          <th className="py-2.5 px-4 text-violet-400">File B (Derivative)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800 font-mono text-gray-300">
                        {Object.entries(comparisonResult.metadata_diff).map(([key, diff]) => (
                          <tr key={key} className="hover:bg-gray-900/30">
                            <td className="py-2.5 px-4 text-gray-400">{key}</td>
                            <td className="py-2.5 px-4">{String(diff?.file1 ?? 'N/A')}</td>
                            <td className="py-2.5 px-4">{String(diff?.file2 ?? 'N/A')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Registry Search */}
      {activeTab === 'lookup' && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-gray-100 mb-2">Fingerprint & Provenance Registry</h3>
            <p className="text-xs text-gray-400 mb-6">
              Query the immutable ledger of cryptographic SHA-256 fingerprints and custody anchors.
            </p>

            <form onSubmit={handleLookup} className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Enter file UUID or SHA-256 hash..."
                  value={searchHash}
                  onChange={(e) => setSearchHash(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-4 pr-10 py-3 text-sm text-gray-100 placeholder-gray-500 font-mono focus:outline-none focus:border-violet-500"
                />
              </div>
              <button
                type="submit"
                disabled={lookupLoading || !searchHash.trim()}
                className="btn-primary px-6 py-3 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                {lookupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Lookup</span>
              </button>
            </form>
          </div>

          {lookupError && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-red-200 mb-0.5">Registry Lookup Error</span>
                <span>{lookupError}</span>
              </div>
            </div>
          )}

          {searched && historyRecords.length === 0 && !lookupError && (
            <div className="glass-card p-12 text-center space-y-3">
              <Database className="w-10 h-10 text-gray-600 mx-auto" />
              <h4 className="text-sm font-bold text-gray-300">No Registry Record Found</h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                No cryptographic fingerprint matching &ldquo;<span className="font-mono text-gray-400">{searchHash}</span>&rdquo; has been registered in the platform ledger yet. Files are automatically anchored when verified via the Verification Hub.
              </p>
            </div>
          )}

          {historyRecords.length > 0 && (
            <div className="glass-card p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-800">
                <div>
                  <span className="text-xs text-gray-400 block">Total Ledger Registrations:</span>
                  <span className="text-base font-bold text-cyan-400">
                    {historyRecords.length} Record{historyRecords.length > 1 ? 's' : ''} Found
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  First Seen: <span className="text-gray-200">{formatDate(historyRecords[historyRecords.length - 1].registered_at)}</span>
                </div>
              </div>

              {/* Provenance Chain Timeline */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                  <History className="w-4 h-4 text-violet-400" />
                  <span>Provenance & Registration Custody Chain</span>
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-800">
                  {historyRecords.map((entry, i) => (
                    <div key={entry.id || i} className="relative group">
                      <div className="absolute -left-[27px] top-0.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-gray-950" />
                      <div className="p-4 rounded-lg bg-gray-900/80 border border-gray-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-100 flex items-center gap-2">
                            <Hash className="w-3.5 h-3.5 text-amber-400" />
                            <span>Fingerprint Anchor #{i + 1}</span>
                          </span>
                          <span className="text-[11px] text-gray-400 font-mono">{formatDate(entry.registered_at)}</span>
                        </div>
                        <div className="text-xs font-mono text-gray-300 bg-gray-950 p-2 rounded border border-gray-800/80 break-all">
                          SHA-256: {entry.sha256}
                        </div>
                        {entry.notes && (
                          <p className="text-xs text-gray-300 font-medium">
                            <span className="text-gray-500 font-semibold">Notes: </span>
                            {entry.notes}
                          </p>
                        )}
                        <p className="text-[11px] font-mono text-gray-500">
                          Registered By: {entry.registered_by || 'Verified Analyst'} • File UUID: {entry.file_id}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
