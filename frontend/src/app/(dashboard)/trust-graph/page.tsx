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

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            setGraphData(graphRes.data);
          } catch (gErr: any) {
            console.error('Failed to load trust graph for session', gErr);
            setErrorMessage(gErr?.response?.data?.detail || 'Trust graph generation in progress or unavailable for this file.');
            setGraphData({ nodes: [], edges: [] });
          }
        } else {
          setGraphData({ nodes: [], edges: [] });
        }
      } catch (err: any) {
        console.error('Failed to load verifications for trust graph', err);
        setErrorMessage(err?.response?.data?.detail || 'Failed to retrieve verification sessions.');
        setGraphData({ nodes: [], edges: [] });
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
      setGraphData(res.data);
    } catch (gErr: any) {
      console.error('Failed to load graph', gErr);
      setErrorMessage(gErr?.response?.data?.detail || 'Failed to retrieve graph data for selected session.');
      setGraphData({ nodes: [], edges: [] });
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

      {/* Error banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-amber-200 mb-0.5">Trust Graph Notice</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Empty State when zero verifications exist */}
      {verifications.length === 0 && !loading && (
        <div className="glass-card p-12 text-center space-y-4">
          <Network className="w-12 h-12 text-indigo-400/60 mx-auto" />
          <h3 className="text-base font-bold text-gray-200">No Verification Graph Generated Yet</h3>
          <p className="text-xs text-gray-400 max-w-lg mx-auto leading-relaxed">
            The Trust Graph dynamically connects uploaded files, user authentication sessions, cryptographic fingerprints, and multi-engine security findings into an interactive knowledge topology. Run a file verification to generate your first entity network graph.
          </p>
          <div className="pt-2">
            <Link href="/verification" className="btn-primary py-2.5 px-6 text-xs font-semibold inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Launch Verification Hub</span>
            </Link>
          </div>
        </div>
      )}

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
