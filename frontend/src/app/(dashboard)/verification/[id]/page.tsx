'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShieldCheck,
  FileText,
  Download,
  ArrowLeft,
  Calendar,
  HardDrive,
  Hash,
  Shield,
  FileSearch,
  Eye,
  Fingerprint,
  Network,
  Brain,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { verificationAPI, engineAPI } from '@/lib/api';
import { VerificationRequest, EngineResult, TrustGraphData } from '@/lib/types';
import { formatDate, formatBytes, getRiskBgColor, getRiskColor, getRiskLabel } from '@/lib/utils';
import RiskGauge from '@/components/dashboard/RiskGauge';
import FindingsList from '@/components/engines/FindingsList';
import EngineStatusBadge from '@/components/engines/EngineStatusBadge';
import VerificationTimeline from '@/components/report/VerificationTimeline';
import TrustGraphView from '@/components/graph/TrustGraphView';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Badge from '@/components/ui/Badge';

export default function VerificationReportPage() {
  const params = useParams();
  const id = params?.id as string;

  const [verification, setVerification] = useState<VerificationRequest | null>(null);
  const [graphData, setGraphData] = useState<TrustGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeEngineTab, setActiveEngineTab] = useState<string>('');

  useEffect(() => {
    async function loadReport() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await verificationAPI.get(id);
        const verifData: VerificationRequest = res.data;
        setVerification(verifData);

        if (verifData.engine_results && verifData.engine_results.length > 0) {
          setActiveEngineTab(verifData.engine_results[0].engine_name);
        }

        try {
          const graphRes = await engineAPI.getGraph(id);
          setGraphData(graphRes.data);
        } catch {
          // Fallback minimal graph
          setGraphData({
            nodes: [
              {
                id: 'node-f1',
                node_type: 'file',
                label: verifData.file?.filename || 'Evidence File',
                properties: { sha256: verifData.file?.sha256_hash },
                engine_source: 'Ingestion Hub',
              },
              {
                id: 'node-v1',
                node_type: 'verification',
                label: id,
                properties: { status: verifData.status },
                engine_source: 'Verification Hub',
              },
            ],
            edges: [
              {
                id: 'edge-1',
                source: 'node-f1',
                target: 'node-v1',
                relationship: 'AUDITED_IN',
                evidence: 'SHA-256 anchored trace',
                engine_source: 'Verification Hub',
              },
            ],
          });
        }
      } catch (err: any) {
        console.error('Failed to load verification report', err);
        setVerification(null);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [id]);

  const handleDownloadReport = async () => {
    try {
      const res = await verificationAPI.downloadReport(id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `beyondproof-report-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download report error', err);
      alert('Failed to download PDF audit report. Ensure the verification pipeline has completed.');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" label="Reconstructing forensic audit trail & engine telemetry..." />
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Verification report not found.</p>
        <Link href="/verification" className="btn-primary mt-4 inline-flex">
          Return to Hub
        </Link>
      </div>
    );
  }

  const activeResult = verification.engine_results?.find(
    (r) => r.engine_name === activeEngineTab
  );

  return (
    <div className="space-y-8">
      {/* Back and Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/verification"
            className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-50 tracking-tight font-mono">
                {verification.id}
              </h1>
              <EngineStatusBadge status={verification.status} size="sm" />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Certified Multi-Engine Forensic Analysis Dossier
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadReport}
          className="btn-primary py-2.5 px-5 text-sm font-semibold flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Certified PDF</span>
        </button>
      </div>

      {/* Target File Information & Risk Score Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Gauge Card */}
        <div className="glass-card p-6 flex flex-col items-center justify-center">
          <RiskGauge
            score={verification.risk_assessment?.overall_score ?? 50}
            category={verification.risk_assessment?.risk_category ?? 'suspicious'}
            size={180}
          />
        </div>

        {/* File Metadata Card */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Target Artifact Metadata
              </span>
              <Badge variant="cyan">{verification.file?.file_type?.toUpperCase() || 'FILE'}</Badge>
            </div>
            <h2 className="text-lg font-bold text-gray-100 truncate mb-1">
              {verification.file?.filename || verification.file_id}
            </h2>
            <div className="space-y-2 mt-4 text-xs font-mono">
              <div className="flex items-center gap-2 text-gray-400">
                <Hash className="w-4 h-4 text-violet-400 flex-shrink-0" />
                <span className="text-gray-500">SHA-256:</span>
                <span className="text-gray-200 truncate select-all">
                  {verification.file?.sha256_hash || 'Uncomputed'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Size: {formatBytes(verification.file?.file_size || 0)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Ingested: {formatDate(verification.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800 text-xs text-gray-400">
            Pipeline Verdict:{' '}
            <span
              className={`font-semibold ${getRiskColor(
                verification.risk_assessment?.risk_category
              )}`}
            >
              {getRiskLabel(verification.risk_assessment?.risk_category)}
            </span>
          </div>
        </div>
      </div>

      {/* Engine Results Tabs */}
      <div className="glass-card p-6 space-y-6">
        <div>
          <h2 className="text-base font-bold text-gray-100 mb-1">Forensic Engine Results</h2>
          <p className="text-xs text-gray-400">
            Select an engine to examine extracted forensic indicators and algorithmic confidence
          </p>
        </div>

        {/* Engine Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-800">
          {verification.engine_results?.map((eng) => (
            <button
              key={eng.engine_name}
              onClick={() => setActiveEngineTab(eng.engine_name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeEngineTab === eng.engine_name
                  ? 'bg-violet-600/25 text-violet-300 border border-violet-500/40'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
              }`}
            >
              <span className="capitalize">{eng.engine_name.replace(/_/g, ' ')}</span>
              <EngineStatusBadge status={eng.status} size="sm" showLabel={false} />
            </button>
          ))}
        </div>

        {/* Tab Detail View */}
        {activeResult ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-900/70 border border-gray-800">
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-mono">
                  Engine Microservice:
                </span>
                <span className="text-sm font-bold text-gray-100 capitalize">
                  {activeResult.engine_name.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {activeResult.confidence !== null && (
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-mono">
                      Algorithmic Confidence:
                    </span>
                    <span className="text-base font-mono font-bold text-violet-400">
                      {Math.round(activeResult.confidence * 100)}%
                    </span>
                  </div>
                )}
                <EngineStatusBadge status={activeResult.status} />
              </div>
            </div>

            {/* Findings List */}
            <FindingsList
              findings={activeResult.findings || []}
              title={`${activeResult.engine_name.replace(/_/g, ' ')} Detections`}
            />
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-gray-500">
            Select an engine tab above to view detailed telemetry.
          </div>
        )}
      </div>

      {/* Verification Timeline & Mini Trust Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VerificationTimeline verification={verification} />

        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                <Network className="w-4 h-4 text-cyan-400" />
                <span>Entity Trust Graph Association</span>
              </h3>
              <Link
                href="/trust-graph"
                className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1"
              >
                <span>Full Graph</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Topology connecting artifact hashes to previous verifications and findings.
            </p>
          </div>

          <div className="h-64 rounded-xl overflow-hidden border border-gray-800">
            <TrustGraphView
              nodes={graphData?.nodes || []}
              edges={graphData?.edges || []}
              height={256}
            />
          </div>
        </div>
      </div>

      {/* Disclaimers & Legal Notice */}
      <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-xs text-gray-400 leading-relaxed">
        <p className="font-semibold text-gray-300 flex items-center gap-1.5 mb-1">
          <Info className="w-4 h-4 text-cyan-400" />
          Cryptographic Admissibility Notice
        </p>
        <p>
          This verification record is cryptographically timestamped and anchored to the BEYONDPROOF ledger. All analysis performed maintains non-destructive file preservation and complies with digital forensic chain-of-custody protocols.
        </p>
      </div>
    </div>
  );
}
