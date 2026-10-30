'use client';

import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  NodeProps,
  Edge,
  Node,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FileCode, User, CheckCircle2, Fingerprint, AlertTriangle, ShieldCheck } from 'lucide-react';
import { GraphNode, GraphEdge } from '@/lib/types';

// Custom node component for File
function FileNode({ data }: NodeProps) {
  return (
    <div className="px-4 py-2.5 rounded-xl bg-gray-900 border-2 border-violet-500/80 shadow-lg shadow-violet-500/20 text-xs text-gray-100 min-w-[140px]">
      <Handle type="target" position={Position.Top} className="!bg-violet-400 !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-400">
          <FileCode className="w-4 h-4" />
        </div>
        <div className="truncate">
          <div className="font-semibold text-violet-200 truncate">{data.label as string}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">{data.node_type as string || 'File'}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-violet-400 !w-2 !h-2" />
    </div>
  );
}

// Custom node component for User
function UserNode({ data }: NodeProps) {
  return (
    <div className="px-4 py-2.5 rounded-xl bg-gray-900 border-2 border-cyan-500/80 shadow-lg shadow-cyan-500/20 text-xs text-gray-100 min-w-[140px]">
      <Handle type="target" position={Position.Top} className="!bg-cyan-400 !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
          <User className="w-4 h-4" />
        </div>
        <div className="truncate">
          <div className="font-semibold text-cyan-200 truncate">{data.label as string}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">User Account</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-400 !w-2 !h-2" />
    </div>
  );
}

// Custom node component for Verification
function VerificationNode({ data }: NodeProps) {
  return (
    <div className="px-4 py-2.5 rounded-xl bg-gray-900 border-2 border-emerald-500/80 shadow-lg shadow-emerald-500/20 text-xs text-gray-100 min-w-[140px]">
      <Handle type="target" position={Position.Top} className="!bg-emerald-400 !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="truncate">
          <div className="font-semibold text-emerald-200 truncate">{data.label as string}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Verification</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-400 !w-2 !h-2" />
    </div>
  );
}

// Custom node component for Fingerprint
function FingerprintNode({ data }: NodeProps) {
  return (
    <div className="px-4 py-2.5 rounded-xl bg-gray-900 border-2 border-amber-500/80 shadow-lg shadow-amber-500/20 text-xs text-gray-100 min-w-[140px]">
      <Handle type="target" position={Position.Top} className="!bg-amber-400 !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
          <Fingerprint className="w-4 h-4" />
        </div>
        <div className="truncate">
          <div className="font-semibold text-amber-200 truncate">{data.label as string}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Provenance / Hash</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-amber-400 !w-2 !h-2" />
    </div>
  );
}

// Custom node component for Finding
function FindingNode({ data }: NodeProps) {
  return (
    <div className="px-4 py-2.5 rounded-xl bg-gray-900 border-2 border-red-500/80 shadow-lg shadow-red-500/20 text-xs text-gray-100 min-w-[140px]">
      <Handle type="target" position={Position.Top} className="!bg-red-400 !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="truncate">
          <div className="font-semibold text-red-200 truncate">{data.label as string}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Anomaly Finding</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-red-400 !w-2 !h-2" />
    </div>
  );
}

interface TrustGraphViewProps {
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  onNodeClick?: (node: GraphNode) => void;
  height?: string | number;
}

export default function TrustGraphView({
  nodes = [],
  edges = [],
  onNodeClick,
  height = 500,
}: TrustGraphViewProps) {
  const nodeTypes = useMemo(
    () => ({
      file: FileNode,
      user: UserNode,
      verification: VerificationNode,
      fingerprint: FingerprintNode,
      finding: FindingNode,
      default: FileNode,
    }),
    []
  );

  // Convert GraphNode[] to ReactFlow Node[]
  const flowNodes: Node[] = useMemo(() => {
    if (!nodes || nodes.length === 0) return [];
    
    // Auto-layout simple grid/ring coordinates if position not present
    return nodes.map((n, i) => {
      const typeKey = (n.node_type || 'file').toLowerCase();
      // arrange in circle or grid
      const count = nodes.length;
      const angle = (i / count) * 2 * Math.PI;
      const radius = 180 + Math.floor(i / 6) * 70;
      const x = 350 + radius * Math.cos(angle);
      const y = 250 + radius * Math.sin(angle);

      return {
        id: n.id,
        type: ['file', 'user', 'verification', 'fingerprint', 'finding'].includes(typeKey)
          ? typeKey
          : 'default',
        position: { x, y },
        data: {
          ...n,
          label: n.label,
          node_type: n.node_type,
          raw: n,
        },
      };
    });
  }, [nodes]);

  // Convert GraphEdge[] to ReactFlow Edge[]
  const flowEdges: Edge[] = useMemo(() => {
    if (!edges || edges.length === 0) return [];
    return edges.map((e, idx) => ({
      id: e.id || `edge-${idx}`,
      source: e.source,
      target: e.target,
      label: e.relationship,
      animated: true,
      style: { stroke: '#4b5563', strokeWidth: 1.5 },
      labelStyle: { fill: '#9ca3af', fontSize: 10, fontWeight: 500 },
      labelBgStyle: { fill: '#111827', fillOpacity: 0.85 },
      labelBgPadding: [6, 4] as [number, number],
      labelBgBorderRadius: 4,
    }));
  }, [edges]);

  return (
    <div
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
      className="w-full rounded-xl overflow-hidden border border-gray-800 bg-gray-950 relative"
    >
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => {
          if (onNodeClick && node.data?.raw) {
            onNodeClick(node.data.raw as GraphNode);
          }
        }}
        fitView
        attributionPosition="bottom-right"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#374151" />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'file':
                return '#7c3aed';
              case 'user':
                return '#06b6d4';
              case 'verification':
                return '#10b981';
              case 'fingerprint':
                return '#f59e0b';
              case 'finding':
                return '#ef4444';
              default:
                return '#9ca3af';
            }
          }}
          maskColor="rgba(3, 7, 18, 0.7)"
        />
      </ReactFlow>
    </div>
  );
}
