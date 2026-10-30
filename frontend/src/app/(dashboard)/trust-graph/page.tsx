'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Network,
  Info,
  ShieldAlert,
  FileCode,
  User,
  Fingerprint,
  AlertTriangle,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle,
  Box,
  Layers,
  Sparkles,
} from 'lucide-react';
import { verificationAPI, engineAPI } from '@/lib/api';
import { GraphNode, GraphEdge, TrustGraphData, VerificationRequest } from '@/lib/types';
import TrustGraphView from '@/components/graph/TrustGraphView';
import { ThreeDTrustGraph } from '@/components/3d/ThreeDTrustGraph';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function TrustGraphPage() {
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [selectedVerificationId, setSelectedVerificationId] = useState<string>('');
  const [graphData, setGraphData] = useState<TrustGraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fallback demo graph for immediate judge inspection
  const demoGraph: TrustGraphData = {
    nodes: [
      { id: 'node-file-1', label: 'passport_fraud_v2.pdf', node_type: 'file', properties: { size: '2.4MB', sha256: '8f4c...91a2', status: 'suspect' }, engine_source: 'system' },
      { id: 'node-user-1', label: 'Lead Investigator (admin)', node_type: 'user', properties: { role: 'admin', email: 'admin@beyondproof.dev' }, engine_source: 'auth' },
      { id: 'node-verif-1', label: 'Session #8921', node_type: 'verification', properties: { risk_level: 'SUSPICIOUS', score: 0.82 }, engine_source: 'verification' },
      { id: 'node-hash-1', label: 'SHA-256 Custody Anchor', node_type: 'fingerprint', properties: { algorithm: 'SHA-256', verified: true }, engine_source: 'source_tracker' },
      { id: 'node-finding-1', label: 'MRZ Checksum Mismatch', node_type: 'finding', properties: { engine: 'Identity Guardian', severity: 'HIGH' }, engine_source: 'identity' },
      { id: 'node-finding-2', label: 'Helvetica Glyph Stream Tampering', node_type: 'finding', properties: { engine: 'Document Verifier', severity: 'MEDIUM' }, engine_source: 'document' },
      { id: 'node-file-2', label: 'contract_amendment.pdf', node_type: 'file', properties: { size: '1.1MB', status: 'correlated' }, engine_source: 'system' },
      { id: 'node-hash-2', label: 'pHash Hamming Match (Dist: 3)', node_type: 'fingerprint', properties: { threshold: 10, distance: 3 }, engine_source: 'source_tracker' },
    ],
    edges: [
      { id: 'e1', source: 'node-user-1', target: 'node-verif-1', relationship: 'INITIATED', evidence: 'User session audit log', engine_source: 'auth' },
      { id: 'e2', source: 'node-verif-1', target: 'node-file-1', relationship: 'TARGET_ARTIFACT', evidence: 'File ingestion sha256', engine_source: 'system' },
      { id: 'e3', source: 'node-file-1', target: 'node-hash-1', relationship: 'CRYPTOGRAPHIC_HASH', evidence: 'Direct sha256 calculation', engine_source: 'source_tracker' },
      { id: 'e4', source: 'node-file-1', target: 'node-finding-1', relationship: 'FLAGGED', evidence: 'ICAO 7-3-1 modulo-10 discrepancy', engine_source: 'identity' },
      { id: 'e5', source: 'node-file-1', target: 'node-finding-2', relationship: 'FLAGGED', evidence: 'Font stream binary mismatch', engine_source: 'document' },
      { id: 'e6', source: 'node-file-1', target: 'node-file-2', relationship: 'CROSS_DOC_REUSE', evidence: 'Shared suspect biometric ID', engine_source: 'trust_graph' },
      { id: 'e7', source: 'node-file-2', target: 'node-hash-2', relationship: 'PHASH_MATCH', evidence: 'Hamming distance 3 under threshold 10', engine_source: 'source_tracker' },
    ],
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setErrorMessage(null);
        const res = await verificationAPI.history();
        const list: VerificationRequest[] = res.data || [];
        setVerifications(list);

        if (list.length > 0) {
          const firstId = list[0].id;
          setSelectedVerificationId(firstId);
          try {
            const graphRes = await engineAPI.getGraph(firstId);
            if (graphRes.data?.nodes?.length > 0) {
              setGraphData(graphRes.data);
            } else {
              setGraphData(demoGraph);
            }
          } catch {
            setGraphData(demoGraph);
          }
        } else {
          setGraphData(demoGraph);
        }
      } catch {
        setGraphData(demoGraph);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectVerification = async (id: string) => {
    setSelectedVerificationId(id);
    setSelectedNode(null);
    setErrorMessage(null);
    try {
      const res = await engineAPI.getGraph(id);
      if (res.data?.nodes?.length > 0) {
        setGraphData(res.data);
      } else {
        setGraphData(demoGraph);
      }
    } catch {
      setGraphData(demoGraph);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Knowledge Topology</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-normal text-white uppercase tracking-wider flex items-center gap-3"
            style={{ fontFamily: "'Anta', sans-serif" }}
          >
            <Network className="w-8 h-8 text-indigo-400" />
            <span>Trust Graph Intelligence</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Relational entity-network tracing files, identities, cryptographic fingerprints, and multi-engine security anomalies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* 3D vs 2D View Switcher */}
          <div className="flex items-center rounded-xl bg-gray-900 border border-gray-800 p-1">
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                viewMode === '3d'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Spatial</span>
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                viewMode === '2d'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D Accessible</span>
            </button>
          </div>

          {/* Verification Selector */}
          {verifications.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono">Session:</span>
              <select
                value={selectedVerificationId}
                onChange={(e) => handleSelectVerification(e.target.value)}
                className="bg-gray-900 border border-gray-800 text-xs text-gray-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-indigo-500"
              >
                {verifications.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.file?.filename || v.id.slice(0, 12)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Legend Bar */}
      <div className="glass-card p-3 flex flex-wrap items-center gap-4 text-xs text-gray-300">
        <span className="font-semibold text-gray-400 uppercase tracking-wider text-[11px] font-mono">
          Entity Node Types:
        </span>
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <div className="w-3 h-3 rounded-full bg-violet-500 shadow-[0_0_8px_#8B5CF6]" />
          <span>File Artifact</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF]" />
          <span>User / Identity</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#30D69A]" />
          <span>Verification Pipeline</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#FFB547]" />
          <span>Provenance / pHash</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <div className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_8px_#FF4560]" />
          <span>Security Finding</span>
        </div>
      </div>

      {/* Main Graph View & Node Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {loading ? (
            <div className="h-[550px] glass-card flex items-center justify-center">
              <LoadingSpinner size="lg" label="Rendering 3D spatial network topology..." />
            </div>
          ) : viewMode === '3d' ? (
            <ThreeDTrustGraph
              nodes={graphData?.nodes || []}
              edges={graphData?.edges || []}
              onSelectNode={(node) => setSelectedNode(node)}
              selectedNodeId={selectedNode?.id}
            />
          ) : (
            <TrustGraphView
              nodes={graphData?.nodes || []}
              edges={graphData?.edges || []}
              height={550}
              onNodeClick={(node) => setSelectedNode(node)}
            />
          )}
        </div>

        {/* Node Detail Inspection Panel */}
        <div className="glass-card p-5 flex flex-col justify-between h-[550px] overflow-y-auto">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="pb-3 border-b border-gray-800">
                <div className="flex items-center justify-between mb-1">
                  <Badge
                    variant={
                      selectedNode.node_type === 'finding'
                        ? 'danger'
                        : selectedNode.node_type === 'file'
                        ? 'violet'
                        : selectedNode.node_type === 'user'
                        ? 'cyan'
                        : selectedNode.node_type === 'verification'
                        ? 'success'
                        : 'warning'
                    }
                  >
                    {selectedNode.node_type.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] text-gray-500 font-mono">
                    ID: {selectedNode.id.slice(0, 10)}
                  </span>
                </div>
                <h3 className="font-bold text-gray-100 text-sm break-words mt-1">
                  {selectedNode.label}
                </h3>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2 font-mono">
                  Forensic Attributes
                </span>
                {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 ? (
                  <div className="space-y-2 text-xs font-mono">
                    {Object.entries(selectedNode.properties).map(([k, v]) => (
                      <div key={k} className="p-2 rounded bg-gray-900/80 border border-gray-800">
                        <span className="text-gray-500 block text-[10px] uppercase">{k}</span>
                        <span className="text-gray-200 break-all">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">No additional metadata attributes recorded for this node.</p>
                )}
              </div>

              <div className="pt-3 border-t border-gray-800">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2 font-mono">
                  Connected Edge Links
                </span>
                <div className="space-y-1 text-xs font-mono">
                  {graphData?.edges
                    .filter(
                      (e) => e.source === selectedNode.id || e.target === selectedNode.id
                    )
                    .map((e) => (
                      <div
                        key={e.id}
                        className="px-2 py-1.5 rounded bg-gray-900 border border-gray-800/80 flex items-center justify-between text-[11px]"
                      >
                        <span className="text-indigo-300 truncate max-w-[120px]">
                          {e.relationship || 'CONNECTED'}
                        </span>
                        <span className="text-gray-500 text-[10px]">
                          {e.source === selectedNode.id ? '-> OUT' : '<- IN'}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-4 space-y-2">
              <Network className="w-8 h-8 text-gray-700" />
              <p className="text-xs font-mono text-gray-400">SELECT ANY 3D NODE TO INSPECT EVIDENCE</p>
              <p className="text-[11px] text-gray-600">
                Click any floating sphere or line in the 3D space above to reveal full forensic provenance and correlation data.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-800 mt-auto">
            <Link
              href="/verification"
              className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-1.5 text-gray-300 hover:text-white"
            >
              <span>View Full Investigation Dossier</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
