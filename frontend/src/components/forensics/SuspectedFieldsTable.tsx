"use client";

import React from "react";
import {
  FileWarning,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Target,
  ArrowRight,
} from "lucide-react";

export interface SuspectedField {
  field_name: string;
  suspected_change?: string;
  details?: string;
  evidence?: string;
  severity?: "critical" | "high" | "medium" | "low" | "info";
  bbox?: [number, number, number, number];
}

interface SuspectedFieldsTableProps {
  fields?: SuspectedField[];
  onSelectField?: (field: SuspectedField) => void;
}

export default function SuspectedFieldsTable({
  fields = [],
  onSelectField,
}: SuspectedFieldsTableProps) {
  if (!fields || fields.length === 0) {
    return (
      <div className="p-6 rounded-2xl liquid-glass border border-white/[0.08] text-center space-y-2">
        <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
        <h4 className="text-sm font-semibold text-white">No Suspected Field Anomalies</h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          All document fields match category formatting standards, mathematical formulas, and font topologies.
        </p>
      </div>
    );
  }

  const getSeverityBadge = (sev?: string) => {
    switch (sev) {
      case "critical":
        return "bg-rose-950/80 border-rose-500/50 text-rose-300";
      case "high":
        return "bg-amber-950/80 border-amber-500/50 text-amber-300";
      case "medium":
        return "bg-yellow-950/80 border-yellow-500/50 text-yellow-300";
      default:
        return "bg-cyan-950/80 border-cyan-500/50 text-cyan-300";
    }
  };

  return (
    <div className="p-5 rounded-2xl liquid-glass border border-white/[0.08] space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <FileWarning className="w-4 h-4 text-rose-400" />
          <h4
            className="text-xs uppercase text-white font-semibold tracking-wider font-mono"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            SUSPECTED MODIFIED / REPLACED FIELDS ({fields.length})
          </h4>
        </div>
        <span className="text-[10px] text-rose-400 font-mono">
          EVIDENCE-BACKED
        </span>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-cyan-950 scrollbar-track-transparent">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] text-[10px] text-slate-400 font-mono uppercase">
              <th className="py-2.5 px-3">Field Name</th>
              <th className="py-2.5 px-3">Suspected Change</th>
              <th className="py-2.5 px-3">Forensic Finding & Rationale</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3 text-right">Canvas Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {fields.map((f, i) => (
              <tr
                key={i}
                className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                onClick={() => onSelectField?.(f)}
              >
                {/* Field Name */}
                <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                    <span>{f.field_name}</span>
                  </div>
                </td>

                {/* Suspected Change */}
                <td className="py-3 px-3 font-mono text-[11px] text-amber-300 whitespace-nowrap">
                  {f.suspected_change || "MODIFIED"}
                </td>

                {/* Details & Proof */}
                <td className="py-3 px-3 text-slate-300 max-w-xs">
                  <p className="line-clamp-2 leading-relaxed text-[11px]">
                    {f.details}
                  </p>
                  {f.evidence && (
                    <span className="text-[10px] text-cyan-400/90 font-mono block mt-0.5 truncate">
                      Proof: {f.evidence}
                    </span>
                  )}
                </td>

                {/* Severity */}
                <td className="py-3 px-3 whitespace-nowrap">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${getSeverityBadge(
                      f.severity
                    )}`}
                  >
                    {f.severity || "high"}
                  </span>
                </td>

                {/* Action */}
                <td className="py-3 px-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectField?.(f);
                    }}
                    className="px-2 py-1 rounded bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-400/30 text-[10px] font-mono text-cyan-300 flex items-center gap-1 ml-auto transition-all"
                  >
                    <Target className="w-3 h-3 text-cyan-400" />
                    <span>Locate</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
