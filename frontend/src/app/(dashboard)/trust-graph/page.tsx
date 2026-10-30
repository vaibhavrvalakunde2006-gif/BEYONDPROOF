'use client';

import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { verificationAPI, engineAPI } from '@/lib/api';
import { GraphNode, GraphEdge, TrustGraphData, VerificationRequest } from '@/lib/types';
import TrustGraphView from '@/components/graph/TrustGraphView';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function TrustGraphPage() {
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [selectedVerificationId, setSelectedVerificationId] = useState<string>('');
  const [graphData, setGraphData] = useState<TrustGraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(true);

  // Default rich graph when no verifications or backend is connecting
  const mockGraph: TrustGraphData = {
    nodes: [
      {
        id: 'node-file-1',
        node_type: 'file',
        label: 'passport_scan_v1.pdf',
        properties: { sha256: '9f86d081884c7d659a2feaa0c55ad015', size: '2.4 MB', mime: 'application/pdf' },
        engine_source: 'Document Verifier',
      },
      {
        id: 'node-user-1',
        node_type: 'user',
        label: 'john.doe@enterprise.com',
        properties: { role: 'analyst', ip: '192.168.1.104', organization: 'CyberForensics Unit' },
        engine_source: 'Auth Core',
      },
      {
        id: 'node-verif-1',
        node_type: 'verification',
        label: 'VERIF-2024-8841',
        properties: { score: 78, status: 'completed', category: 'high_risk' },
        engine_source: 'Verification Hub',
      },
      {
        id: 'node-fp-1',
        node_type: 'fingerprint',
        label: 'FP-SHA-992014',
        properties: { pHash: '0xb4c3f81e72a1900d', dHash: '0x12a9d82e118944cc' },
        engine_source: 'Source Tracker',
      },
      {
        id: 'node-finding-1',
        node_type: 'finding',
        label: 'Font Subset Anomaly',
        properties: { severity: 'high', code: 'DOC_FONT_TAMPER', confidence: 0.92 },
        engine_source: 'Document Verifier',
      },
      {
        id: 'node-finding-2',
        node_type: 'finding',
        label: 'Synthetic Portrait Halo',
        properties: { severity: 'critical', code: 'ID_PORTRAIT_BLENDING', confidence: 0.95 },
        engine_source: 'Identity Guardian',
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'node-user-1',
        target: 'node-file-1',
        relationship: 'UPLOADED_BY',
        evidence: 'User authenticated session log',
        engine_source: 'Ingestion Hub',
      },
      {
        id: 'edge-2',
        source: 'node-file-1',
        target: 'node-verif-1',
        relationship: 'VERIFIED_UNDER',
        evidence: 'Pipeline task batch #4401',
        engine_source: 'Verification Hub',
      },
      {
        id: 'edge-3',
        source: 'node-file-1',
        target: 'node-fp-1',
        relationship: 'ANCHORED_TO',
        evidence: 'Cryptographic hash registry',
        engine_source: 'Source Tracker',
      },
      {
        id: 'edge-4',
        source: 'node-verif-1',
        target: 'node-finding-1',
        relationship: 'FLAGGED_ANOMALY',
        evidence: 'Glyph subset mismatch in trailer stream',
        engine_source: 'Document Verifier',
      },
      {
        id: 'edge-5',
        source: 'node-verif-1',
        target: 'node-finding-2',
        relationship: 'DETECTED_MANIPULATION',
        evidence: 'Facial boundary standard deviation drop',
        engine_source: 'Identity Guardian',
      },
    ],
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await verificationAPI.history();
        const list: VerificationRequest[] = res.data || [];
        setVerifications(list);

        if (list.length > 0) {
          const firstId = list[0].id;
          setSelectedVerificationId(firstId);
          try {
            const graphRes = await engineAPI.getGraph(firstId);
            setGraphData(graphRes.data);
          } catch {
            setGraphData(mockGraph);
          }
        } else {
          setGraphData(mockGraph);
        }
      } catch {
        setGraphData(mockGraph);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectVerification = async (id: string) => {
    setSelectedVerificationId(id);
    setSelectedNode(null);
    try {
      const res = await engineAPI.getGraph(id);
      setGraphData(res.data);
    } catch {
      setGraphData(mockGraph);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-50 tracking-tight flex items-center gap-3">
            <Network className="w-8 h-8 text-indigo-400" />
            <span>Trust Graph Intelligence</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Relational entity-network tracing files, users, fingerprints, and forensic anomaly nodes.
          </p>
        </div>

        {/* Verification Selector */}
        {verifications.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Context:</span>
            <select
              value={selectedVerificationId}
              onChange={(e) => handleSelectVerification(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-xs text-gray-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-violet-500"
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

      {/* Legend Bar */}
      <div className="glass-card p-3 flex flex-wrap items-center gap-4 text-xs text-gray-300">
        <span className="font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
          Entity Node Types:
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-violet-500" />
          <span>File Artifact</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-cyan-500" />
          <span>User / Identity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Verification Pipeline</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Fingerprint Registry</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Security Finding</span>
        </div>
      </div>

      {/* Main Graph View & Node Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {loading ? (
            <div className="h-[550px] glass-card flex items-center justify-center">
              <LoadingSpinner size="lg" label="Computing network layout..." />
            </div>
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
                  <span className="text-[11px] font-mono text-gray-500">
                    {selectedNode.engine_source}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-100 break-words">
                  {selectedNode.label}
                </h3>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Properties & Attributes
                </h4>
                <div className="space-y-2">
                  {Object.entries(selectedNode.properties || {}).map(([key, val]) => (
                    <div key={key} className="p-2.5 rounded bg-gray-900 border border-gray-800 text-xs">
                      <span className="text-gray-500 font-mono block text-[10px] uppercase">
                        {key}
                      </span>
                      <span className="font-mono text-gray-200 break-all">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800 text-[11px] text-gray-400">
                Click other nodes in the canvas to inspect entity links.
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 px-4">
              <Info className="w-8 h-8 text-gray-600 mb-2" />
              <p className="text-sm font-semibold text-gray-200">No Node Selected</p>
              <p className="text-xs text-gray-500 mt-1">
                Click any file, user, verification, or finding node in the graph canvas to inspect its cryptographic properties and relational links.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-800 text-[10px] text-gray-500 font-mono text-center">
            INTERACTIVE GRAPH CORE • ZOOM & PAN ENABLED
          </div>
        </div>
      </div>
    </div>
  );
}
