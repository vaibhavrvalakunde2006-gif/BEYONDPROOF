"use client";

import React, { useState, useEffect } from "react";
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
  Fingerprint,
  FileText,
  Activity,
  CheckCircle2,
  Share2,
  Radar,
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
      <div className="w-full h-[520px] flex flex-col items-center justify-center bg-black/60 rounded-xl border border-cyan-500/20 text-cyan-400 text-xs gap-3 font-mono">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_15px_rgba(0,229,255,0.4)]" />
        <span
          className="tracking-[0.15em] text-[10px]"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          INITIALIZING 3D SPATIAL TRUST GRAPH ENGINE...
        </span>
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
  const [animateIn, setAnimateIn] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(
    initialNodes[0]
  );
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d");
  const [isAuditing, setIsAuditing] = useState(false);
  const [isExported, setIsExported] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleSelectNode = (node: GraphNode | null) => {
    soundManager.playBlip();
    setSelectedNode(node);
  };

  const handleAuditPath = () => {
    soundManager.playLaserScan();
    setIsAuditing(true);
    setTimeout(() => {
      soundManager.playSuccessChime();
      setIsAuditing(false);
    }, 900);
  };

  const handleExportSubgraph = () => {
    soundManager.playBlip();
    if (selectedNode) {
      navigator.clipboard.writeText(JSON.stringify(selectedNode, null, 2));
      setIsExported(true);
      setTimeout(() => setIsExported(false), 2000);
    }
  };

  const getNodeBadgeClass = (type: string) => {
    switch (type) {
      case "verification":
        return "text-emerald-400 bg-emerald-950/50 border-emerald-500/40";
      case "file":
        return "text-purple-400 bg-purple-950/50 border-purple-500/40";
      case "fingerprint":
        return "text-amber-400 bg-amber-950/50 border-amber-500/40";
      case "finding":
        return "text-red-400 bg-red-950/50 border-red-500/40";
      case "user":
      default:
        return "text-cyan-400 bg-cyan-950/50 border-cyan-500/40";
    }
  };

  return (
    <div
      className={`space-y-6 select-none transition-all duration-700 ${
        animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* ═══════ Forensic Header ═══════ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-white/[0.06]">
        <div>
          <div
            className="flex items-center gap-2 text-[9px] uppercase mb-2 tracking-[0.2em]"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.7)] animate-pulse" />
            <span className="text-cyan-400">RELATIONAL EVIDENCE INTELLIGENCE</span>
            <span className="text-gray-600">//</span>
            <span className="text-gray-400">MULTI-CASE SYNDICATE MAP</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            3D Trust <span className="text-cyan-400">Graph.</span>
          </h1>
          <p
            className="text-gray-400 text-xs sm:text-sm mt-1.5"
            style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.04em', fontSize: 11 }}
          >
            Spatial force-directed network revealing syndicate collusion, spliced document trails, and shared tampering signatures
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setViewMode(viewMode === "3d" ? "2d" : "3d");
              soundManager.playModeSwitch();
            }}
            className="px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-gray-300 hover:text-white hover:border-cyan-400/40 flex items-center gap-2 transition-all font-bold text-[10px]"
            style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em' }}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>MODE: {viewMode.toUpperCase()} VIEW</span>
          </button>
        </div>
      </div>

      {/* ═══════ Live Network Telemetry Strip ═══════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl liquid-glass border border-white/[0.06] hover:border-cyan-400/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[9px] uppercase tracking-[0.15em] text-gray-500"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              ACTIVE NODES
            </span>
            <Network className="w-3.5 h-3.5 text-cyan-400/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {initialNodes.length}
            </span>
            <span
              className="text-[10px] text-cyan-400 flex items-center gap-1"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              TOPOLOGICAL
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl liquid-glass border border-white/[0.06] hover:border-violet-400/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[9px] uppercase tracking-[0.15em] text-gray-500"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              RELATIONAL EDGES
            </span>
            <Share2 className="w-3.5 h-3.5 text-violet-400/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-bold text-violet-400"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {initialEdges.length}
            </span>
            <span
              className="text-[10px] text-violet-400/80"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              CROSS-CORRELATED
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl liquid-glass border border-white/[0.06] hover:border-red-400/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[9px] uppercase tracking-[0.15em] text-gray-500"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              CLUSTER THREAT
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-400/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-bold text-red-400"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              HIGH RISK
            </span>
            <span
              className="text-[10px] text-red-400/80"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              COLLUSION DETECTED
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl liquid-glass border border-white/[0.06] hover:border-emerald-400/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[9px] uppercase tracking-[0.15em] text-gray-500"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              SPATIAL ENGINE
            </span>
            <Radar className="w-3.5 h-3.5 text-emerald-400/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-lg font-bold text-emerald-400 font-mono"
            >
              THREE.JS
            </span>
            <span
              className="text-[10px] text-emerald-400/80"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              FORCE-DIRECTED
            </span>
          </div>
        </div>
      </div>

      {/* ═══════ Main Graph Layout (3:1 Grid) ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* 3D WebGL Graph Viewport (3 Cols) */}
        <div className="lg:col-span-3 rounded-xl liquid-glass border border-cyan-500/25 overflow-hidden shadow-[0_0_50px_rgba(0,229,255,0.08)] p-5 flex flex-col justify-between">
          {/* Top HUD */}
          <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 text-cyan-400">
              <Network className="w-4 h-4 text-cyan-400" />
              <span
                className="text-white font-bold text-xs tracking-wider"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                SPATIAL EVIDENCE SYNDICATE MAP (THREE.JS WEBGL)
              </span>
            </div>
            <span
              className="text-gray-500 text-[9.5px] tracking-wider hidden sm:inline"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              CLICK NODE TO INSPECT • DRAG TO ROTATE 3D PERSPECTIVE
            </span>
          </div>

          {/* Viewport Frame */}
          <div className="relative w-full h-[520px] rounded-lg overflow-hidden bg-black/60 border border-white/[0.04]">
            <ThreeDTrustGraph
              nodes={initialNodes}
              edges={initialEdges}
              selectedNodeId={selectedNode?.id}
              onSelectNode={handleSelectNode}
            />
          </div>

          {/* Bottom HUD Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/[0.04]">
            <div
              className="flex items-center gap-4 text-[9.5px] text-gray-400 tracking-wider"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                Case Master
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.7)]" />
                Evidence File
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
                SHA-256 Hash
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
                Defect Anomaly
              </span>
            </div>
            <span
              className="text-cyan-400 text-[10px] font-bold tracking-wider"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {initialNodes.length} NODES • {initialEdges.length} RELATIONAL EDGES
            </span>
          </div>
        </div>

        {/* Selected Node Inspector (1 Col) */}
        <div className="p-5 sm:p-6 rounded-xl liquid-glass border border-white/[0.06] hover:border-cyan-400/25 transition-all flex flex-col justify-between">
          <div>
            <div className="mb-5 pb-3 border-b border-white/[0.06]">
              <span
                className="text-cyan-400 block mb-1 text-[9px] uppercase tracking-[0.16em] font-bold"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                NODE INSPECTOR // EVIDENCE ENTITY DOSSIER
              </span>
              <h3
                className="text-xl font-bold text-white tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Entity Dossier
              </h3>
            </div>

            {selectedNode ? (
              <div className="space-y-4">
                {/* Node Label & Type */}
                <div className="p-4 rounded-xl bg-black/60 border border-white/[0.06]">
                  <span
                    className="text-gray-500 text-[9px] uppercase tracking-[0.15em] block mb-1.5"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    ENTITY IDENTIFIER
                  </span>
                  <span className="text-white font-bold text-sm block mb-2 font-mono">
                    {selectedNode.label}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[9.5px] font-bold border tracking-wider ${getNodeBadgeClass(
                        selectedNode.node_type
                      )}`}
                      style={{ fontFamily: "'Orbitron', sans-serif" }}
                    >
                      TYPE: {selectedNode.node_type.toUpperCase()}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-[9px] bg-white/[0.03] border border-white/[0.06] text-gray-400 font-mono"
                    >
                      {selectedNode.engine_source}
                    </span>
                  </div>
                </div>

                {/* Cryptographic Attributes */}
                <div className="p-4 rounded-xl bg-black/60 border border-white/[0.06] space-y-2">
                  <span
                    className="text-gray-500 text-[9px] uppercase tracking-[0.15em] block mb-2"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    CRYPTOGRAPHIC ATTRIBUTES
                  </span>
                  {selectedNode.properties &&
                    Object.entries(selectedNode.properties).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between text-xs border-b border-white/[0.04] pb-1.5 font-mono"
                      >
                        <span className="text-gray-400 text-[11px] uppercase mr-2 truncate">
                          {k}:
                        </span>
                        <span className="text-white font-bold text-[11px] truncate max-w-[140px]">
                          {String(v)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Info className="w-8 h-8 text-cyan-400/40 mx-auto mb-2" />
                <p
                  className="text-xs font-mono"
                >
                  Click any node in the 3D graph to inspect its evidence relations.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-white/[0.06] space-y-2.5">
            <button
              onClick={handleAuditPath}
              disabled={isAuditing}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-400 text-black font-bold text-[10px] flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_20px_rgba(0,229,255,0.25)] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] active:scale-95 transition-all"
              style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em' }}
            >
              <Activity className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
              <span>{isAuditing ? 'CALCULATING PATH...' : 'AUDIT CONNECTED PATH'}</span>
            </button>

            <button
              onClick={handleExportSubgraph}
              className="w-full py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-cyan-400/40 text-gray-300 hover:text-white text-[10px] flex items-center justify-center gap-2 transition-all font-bold"
              style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.06em' }}
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isExported ? 'COPIED TO CLIPBOARD' : 'EXPORT SUBGRAPH EVIDENCE'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
