'use client';

import React, { useState } from 'react';
import { Network, ZoomIn, ZoomOut, RotateCcw, Info, Shield, Layers } from 'lucide-react';
import dynamic from 'next/dynamic';
import { soundManager } from '@/lib/soundFx';
import { GraphNode as TGraphNode, GraphEdge as TGraphEdge } from '@/lib/types';

// Dynamic 3D Trust Graph WebGL visualizer
const ThreeDTrustGraph = dynamic(
  () => import('@/components/3d/ThreeDTrustGraph').then((m) => m.ThreeDTrustGraph),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[480px] bg-black/40 rounded-xl flex items-center justify-center border border-gray-800">
        <span className="text-xs font-mono text-cyan-400 animate-pulse">
          INITIALIZING 3D WEBGL TRUST GRAPH...
        </span>
      </div>
    ),
  }
);

interface DisplayNode {
  id: string;
  name: string;
  type: string;
  description: string;
  details: string;
}

const sampleDisplayNodes: DisplayNode[] = [
  {
    id: 'CASE_0042',
    name: 'Investigation INV-2026-0042',
    type: 'CASE',
    description: 'Active root investigation into corporate procurement tampering and counterfeit ID submission.',
    details: 'Initiated 2026-10-30T14:22:00Z by Lead Investigator (Clearance L5).',
  },
  {
    id: 'DOC_CERT',
    name: 'Vendor_Certificate.pdf',
    type: 'DOCUMENT',
    description: 'Target evidence file containing suspected non-embedded subset font modifications in clause 8.2.',
    details: 'SHA-256: 9a8b1c4d7e2f5a0b3c6d9e1f4a7b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7a0b3c',
  },
  {
    id: 'HASH_SHA256',
    name: 'SHA-256 Fingerprint Anchor',
    type: 'HASH',
    description: 'Cryptographic immutable digest anchored at block height 841,209.',
    details: 'Verified byte stream integrity match against custody register.',
  },
  {
    id: 'SOURCE_ISSUER',
    name: 'Issuer Metadata Authority',
    type: 'SOURCE',
    description: 'Origin certificate authority and issuing timestamp server verification.',
    details: 'Signer certificate expired 14 days prior to document timestamp epoch.',
  },
  {
    id: 'FINDING_XREF',
    name: 'OCR & Glyph Anomaly Node',
    type: 'FINDING',
    description: 'Post-signature incremental trailer revision overwrite isolated at byte offset 0x4F12.',
    details: 'Deterministic severity rating: HIGH (Score: 88/100).',
  },
];

const sampleGraphNodes: TGraphNode[] = sampleDisplayNodes.map((d) => ({
  id: d.id,
  node_type: d.type,
  label: d.name,
  properties: { description: d.description, details: d.details },
  engine_source: 'trust_graph',
}));

const sampleGraphEdges: TGraphEdge[] = [
  { id: 'e1', source: 'CASE_0042', target: 'DOC_CERT', relationship: 'INSPECTED_FILE', evidence: 'Primary file input', engine_source: 'orchestrator' },
  { id: 'e2', source: 'DOC_CERT', target: 'HASH_SHA256', relationship: 'COMPUTED_DIGEST', evidence: 'SHA-256 match', engine_source: 'source' },
  { id: 'e3', source: 'DOC_CERT', target: 'SOURCE_ISSUER', relationship: 'DECLARED_AUTHORITY', evidence: 'X.509 metadata', engine_source: 'source' },
  { id: 'e4', source: 'DOC_CERT', target: 'FINDING_XREF', relationship: 'TAMPER_ISOLATED', evidence: 'Trailer overwrite', engine_source: 'document' },
];

export default function TrustGraph() {
  const [activeNodeId, setActiveNodeId] = useState<string>('CASE_0042');
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  const selectedNode = sampleDisplayNodes.find((n) => n.id === activeNodeId) || sampleDisplayNodes[0];

  const handleSelectNode = (id: string) => {
    soundManager.playBlip();
    setActiveNodeId(id);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">EVIDENCE RELATIONSHIPS / GRAPH EXPLORER</div>
          <h1>
            Trust <em>Graph.</em>
          </h1>
          <p>Explore how multi-modal evidence items connect across investigations.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playModeSwitch();
              setViewMode(viewMode === '3d' ? '2d' : '3d');
            }}
            className="button button-small"
          >
            <Layers size={14} />
            <span>Switch to {viewMode === '3d' ? '2D Map' : '3D WebGL'}</span>
          </button>
          <span className="status low-risk">NETWORKX ACTIVE</span>
        </div>
      </div>

      <div className="graph-layout">
        {/* Main Canvas Area */}
        <section className="panel graph-panel">
          <div className="graph-toolbar">
            <span>
              <Network size={16} /> INVESTIGATION 0042 / KNOWLEDGE GRAPH TOPOLOGY
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-cyan-400">
                MODE: {viewMode.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="p-4 bg-black">
            {viewMode === '3d' ? (
              <ThreeDTrustGraph
                nodes={sampleGraphNodes}
                edges={sampleGraphEdges}
                onSelectNode={(node) => handleSelectNode(node?.id || 'CASE_0042')}
                selectedNodeId={activeNodeId}
              />
            ) : (
              <div className="h-[460px] relative overflow-hidden bg-gradient-to-b from-gray-950 to-black rounded-xl p-6 border border-gray-800 flex flex-col justify-between">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {sampleDisplayNodes.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleSelectNode(n.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        activeNodeId === n.id
                          ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_15px_rgba(80,217,237,0.2)]'
                          : 'border-gray-800 bg-gray-900/60 hover:border-gray-700'
                      }`}
                    >
                      <span className="text-[9px] font-mono text-cyan-400 block mb-1">
                        {n.type}
                      </span>
                      <b className="text-xs text-white block">{n.name}</b>
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-gray-950/80 border border-gray-800 rounded-lg text-xs font-mono text-gray-400 flex items-center justify-between">
                  <span>NETWORKX RELATIONAL TOPOLOGY: 5 VERTICES // 4 DIRECTED EDGES</span>
                  <span className="text-emerald-400">ISOLATED CYCLES: 0</span>
                </div>
              </div>
            )}
          </div>

          <div className="graph-foot flex items-center justify-between">
            <span>Interactive knowledge graph — click any node to inspect connected forensic signals.</span>
            <div className="flex gap-3 text-[10px] font-mono">
              <span className="text-cyan-400">● CASE</span>
              <span className="text-violet-400">● DOCUMENT</span>
              <span className="text-amber-400">● HASH</span>
              <span className="text-emerald-400">● SOURCE</span>
            </div>
          </div>
        </section>

        {/* Selected Node Inspector */}
        <aside className="panel graph-inspector">
          <div className="eyebrow">SELECTED NODE</div>
          <div className="inspector-symbol">
            <Network size={22} />
          </div>
          <h2>{selectedNode.name}</h2>
          <span className="status low-risk mb-3 inline-block">{selectedNode.type}</span>
          <p className="text-xs text-gray-300 leading-relaxed mb-4">{selectedNode.description}</p>

          <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 font-mono text-[11px] text-gray-400 mb-4">
            <div className="text-cyan-400 font-bold mb-1">TECHNICAL PROVENANCE:</div>
            <div>{selectedNode.details}</div>
          </div>

          <div className="info-callout">
            <Info size={16} />
            <span>
              All edge connections are mathematically computed using entity correlation, SHA-256 collisions, and perceptual pHash distances.
            </span>
          </div>
        </aside>
      </div>
    </>
  );
}
