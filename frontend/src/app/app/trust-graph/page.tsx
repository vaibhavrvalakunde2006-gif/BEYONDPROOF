"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Network,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Info,
  Search,
  Layers,
  Sparkles,
  ArrowUpRight,
  Shield,
  FileCheck,
  AlertTriangle,
} from "lucide-react";
import { soundManager } from "@/lib/soundFx";
import { GraphNode, GraphEdge } from "@/lib/types";

// Dynamically import ThreeDTrustGraph with SSR disabled
const ThreeDTrustGraph = dynamic(
  () =>
    import("@/components/3d/ThreeDTrustGraph").then(
      (mod) => mod.ThreeDTrustGraph
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[550px] flex flex-col items-center justify-center bg-black/60 rounded-xl border border-cyan-500/20 text-cyan-400 font-mono text-xs gap-3">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        <span>INITIALIZING 3D SPATIAL TRUST GRAPH...</span>
      </div>
    ),
  }
);

const initialNodes: GraphNode[] = [
  {
    id: "node-case-1",
    label: "Investigation INV-2026-0042",
    node_type: "verification",
    engine_source: "forensic_core",
    properties: {
      status: "ACTIVE_AUDIT",
      risk_score: 87.2,
      assigned_examiner: "BBC Forensic Special Ops",
    },
  },
  {
    id: "node-doc-1",
    label: "Vendor_Certificate.pdf",
    node_type: "file",
    engine_source: "document_verifier",
    properties: {
      mime_type: "application/pdf",
      file_size: "2.4 MB",
      hash: "e1d2c3b4a5f6...",
    },
  },
  {
    id: "node-hash-1",
    label: "SHA-256 Digest Match",
    node_type: "fingerprint",
    engine_source: "source_tracker",
    properties: {
      algorithm: "SHA-256",
      consensus_ledger: "ETHEREUM_PROVENANCE_V2",
      block: 19842104,
    },
  },
  {
    id: "node-source-1",
    label: "Issuer Metadata (Acme CA)",
    node_type: "user",
    engine_source: "source_tracker",
    properties: {
      organization: "Acme Corp Global",
      cert_status: "REVOCATION_DETECTED",
      country: "FRA",
    },
  },
  {
    id: "node-finding-1",
    label: "OCR Font Mismatch Anomaly",
    node_type: "finding",
    engine_source: "document_verifier",
    properties: {
      engine: "Document Verifier",
      confidence: "99.4% Font Discrepancy",
      anomaly: "Helvetica-Bold spliced into Arial body",
    },
  },
  {
    id: "node-finding-2",
    label: "Synthetic Voice Pitch Spike",
    node_type: "finding",
    engine_source: "media_truth",
    properties: {
      engine: "Media Truth Engine",
      confidence: "98.2% Synthetic Diffusion",
      anomaly: "16.4 kHz boundary artifact",
    },
  },
];

const initialEdges: GraphEdge[] = [
  {
    id: "edge-1",
    source: "node-case-1",
    target: "node-doc-1",
    relationship: "EVIDENCE_CONTAINED",
    evidence: "Direct intake upload",
    engine_source: "forensic_core",
  },
  {
    id: "edge-2",
    source: "node-doc-1",
    target: "node-hash-1",
    relationship: "CRYPTOGRAPHIC_FINGERPRINT",
    evidence: "SHA-256 hash match",
    engine_source: "source_tracker",
  },
  {
    id: "edge-3",
    source: "node-doc-1",
    target: "node-source-1",
    relationship: "ISSUED_BY_ENTITY",
    evidence: "X.509 cert metadata",
    engine_source: "source_tracker",
  },
  {
    id: "edge-4",
    source: "node-doc-1",
    target: "node-finding-1",
    relationship: "ENGINE_DEFECT_DETECTED",
    evidence: "Font kerning variance",
    engine_source: "document_verifier",
  },
  {
    id: "edge-5",
    source: "node-case-1",
    target: "node-finding-2",
    relationship: "CORRELATED_THREAT",
    evidence: "Audio track anomaly",
    engine_source: "media_truth",
  },
];

export default function TrustGraph() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(
    initialNodes[0]
  );
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d");

  const handleSelectNode = (node: GraphNode | null) => {
    soundManager.playBlip();
    setSelectedNode(node);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>RELATIONAL EVIDENCE INTELLIGENCE</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            3D Trust <span className="text-cyan-400">Graph.</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm font-mono mt-1">
            Spatial network visualization mapping multi-case syndicates, shared tampering signatures, and cryptographic fingerprints.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => {
              setViewMode(viewMode === "3d" ? "2d" : "3d");
              soundManager.playModeSwitch();
            }}
            className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/[0.1] text-gray-300 hover:text-white hover:border-cyan-400/50 flex items-center gap-2 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>MODE: {viewMode.toUpperCase()} VIEW</span>
          </button>
        </div>
      </div>

      {/* Main Graph Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 3D WebGL Graph Viewport (3 Cols) */}
        <div className="lg:col-span-3 rounded-2xl bg-gradient-to-b from-[#0a101b] via-[#070b13] to-[#04070d] border border-cyan-500/30 overflow-hidden shadow-[0_0_50px_rgba(0,229,255,0.1)] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06] text-xs font-mono">
            <div className="flex items-center gap-2 text-cyan-400">
              <Network className="w-4 h-4" />
              <span className="text-white font-bold">
                SPATIAL KNOWLEDGE NETWORK (THREE.JS WEBGL)
              </span>
            </div>
            <span className="text-gray-500 text-[11px]">
              CLICK NODE TO INSPECT ? DRAG TO ROTATE 3D PERSPECTIVE
            </span>
          </div>

          <div className="relative w-full h-[520px] rounded-xl overflow-hidden bg-black/60 border border-white/[0.06]">
            <ThreeDTrustGraph
              nodes={initialNodes}
              edges={initialEdges}
              selectedNodeId={selectedNode?.id}
              onSelectNode={handleSelectNode}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-gray-400 pt-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Case Master
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Evidence File
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> SHA-256 Hash
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Defect Anomaly
              </span>
            </div>
            <span className="text-cyan-400">
              {initialNodes.length} Nodes ? {initialEdges.length} Edges Rendered
            </span>
          </div>
        </div>

        {/* Selected Node Inspector (1 Col) */}
        <div className="p-6 rounded-2xl bg-[#090e17] border border-white/[0.08] flex flex-col justify-between font-mono text-xs">
          <div>
            <div className="mb-6 pb-4 border-b border-white/[0.06]">
              <span className="text-cyan-400 block mb-1 uppercase tracking-wider text-[11px]">
                NODE INSPECTOR
              </span>
              <h3
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Entity Dossier
              </h3>
            </div>

            {selectedNode ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-black/50 border border-white/[0.08]">
                  <span className="text-gray-500 text-[10px] uppercase block mb-1">
                    ENTITY LABEL
                  </span>
                  <span className="text-white font-bold text-sm block mb-2">
                    {selectedNode.label}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
                    TYPE: {selectedNode.node_type.toUpperCase()}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-black/50 border border-white/[0.08] space-y-2.5">
                  <span className="text-gray-500 text-[10px] uppercase block mb-2">
                    CRYPTOGRAPHIC ATTRIBUTES
                  </span>
                  {selectedNode.properties &&
                    Object.entries(selectedNode.properties).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between text-[11px] border-b border-white/[0.04] pb-1.5"
                      >
                        <span className="text-gray-400 uppercase">{k}:</span>
                        <span className="text-white font-bold">
                          {String(v)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Info className="w-8 h-8 text-cyan-400/40 mx-auto mb-2" />
                <p>Click any node in the 3D graph to inspect its evidence relations.</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.06]">
            <button
              onClick={() => {
                soundManager.playLaserScan();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-black font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all"
            >
              <span>Audit Connected Path</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
