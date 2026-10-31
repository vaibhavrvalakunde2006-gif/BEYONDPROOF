"use client";

import React from "react";
import {
  Clock,
  ShieldCheck,
  AlertOctagon,
  HelpCircle,
  AlertTriangle,
  History,
  FileCode,
  Sparkles,
} from "lucide-react";

export interface TimelineData {
  creation_date?: string | null;
  last_modification_date?: string | null;
  date_discrepancy_seconds?: number;
  revision_passes?: number;
  detected_software_footprint?: string | null;
  is_date_tampered?: boolean;
  timestamp_reliability?: "HIGH" | "MODERATE" | "SUSPECT" | "UNKNOWN";
  reliability_explanation?: string;
}

interface ForensicTimelineProps {
  timeline?: TimelineData | null;
}

export default function ForensicTimeline({ timeline }: ForensicTimelineProps) {
  if (!timeline) {
    return (
      <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] text-center text-xs text-slate-400 font-mono">
        <Clock className="w-5 h-5 mx-auto mb-1 text-slate-500 animate-spin" />
        No chronological metadata recorded for this specimen.
      </div>
    );
  }

  const {
    creation_date = "Unknown / Metadata Absent",
    last_modification_date = "Unknown / Metadata Absent",
    revision_passes = 1,
    detected_software_footprint,
    timestamp_reliability = "UNKNOWN",
    reliability_explanation,
    is_date_tampered,
  } = timeline;

  const getReliabilityBadge = (rel: string) => {
    switch (rel) {
      case "HIGH":
        return {
          icon: ShieldCheck,
          label: "HIGH RELIABILITY",
          badgeClass: "bg-emerald-950/70 border-emerald-500/40 text-emerald-300",
          desc: "Creation & modification timestamps are internally consistent with xref streams.",
        };
      case "MODERATE":
        return {
          icon: Clock,
          label: "MODERATE RELIABILITY",
          badgeClass: "bg-cyan-950/70 border-cyan-500/40 text-cyan-300",
          desc: "Single timestamp extracted; document shows standard generation metadata.",
        };
      case "SUSPECT":
        return {
          icon: AlertOctagon,
          label: "SUSPECT / DATE COLLISION",
          badgeClass: "bg-rose-950/80 border-rose-500/50 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]",
          desc: "Chronological paradox detected (e.g., Modification preceded Creation, or post-dated future).",
        };
      default:
        return {
          icon: HelpCircle,
          label: "UNKNOWN / METADATA SCRUBBED",
          badgeClass: "bg-slate-800/80 border-slate-600/40 text-slate-300",
          desc: "Timestamps intentionally scrubbed or stripped by privacy/export tool. Zero dates fabricated.",
        };
    }
  };

  const badgeConfig = getReliabilityBadge(timestamp_reliability);
  const BadgeIcon = badgeConfig.icon;

  return (
    <div className="p-5 rounded-2xl liquid-glass border border-white/[0.08] space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.06] gap-2">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h4
            className="text-xs uppercase text-white font-semibold tracking-wider font-mono"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            CHRONOLOGICAL PROVENANCE & EDITING TIMELINE
          </h4>
        </div>

        {/* Reliability Pill */}
        <div
          className={`px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold flex items-center gap-1.5 self-start sm:self-auto ${badgeConfig.badgeClass}`}
        >
          <BadgeIcon className="w-3.5 h-3.5 shrink-0" />
          <span>{badgeConfig.label}</span>
        </div>
      </div>

      {/* Timeline Steps / Milestones */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-amber-500 before:to-rose-500">
        {/* Step 1: Initial Creation */}
        <div className="relative group">
          <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-cyan-500 border-2 border-black ring-2 ring-cyan-400/30" />
          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-0.5">
            <span className="text-[9px] text-cyan-400 uppercase font-mono block">
              01 // Initial Creation Stamp
            </span>
            <span className="text-xs text-white font-mono font-medium block">
              {creation_date}
            </span>
            <span className="text-[10px] text-slate-400 block font-sans">
              Recorded `/CreationDate` or `DateTimeOriginal` marker in object dictionary.
            </span>
          </div>
        </div>

        {/* Step 2: Incremental Updates / Post-Creation Revisions */}
        <div className="relative group">
          <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-black ring-2 ring-amber-400/30" />
          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-0.5">
            <span className="text-[9px] text-amber-400 uppercase font-mono block">
              02 // Modification Passes & Revision Count
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white font-mono font-medium">
                {last_modification_date}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 text-[9px] font-mono">
                {revision_passes} Revision{revision_passes > 1 ? "s" : ""}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block font-sans">
              {revision_passes > 1
                ? `Detected ${revision_passes} sequential %%EOF trailers appended post-creation.`
                : "Clean single-pass document serialization structure."}
            </span>
          </div>
        </div>

        {/* Step 3: Software Footprint & Tamper Vector */}
        {detected_software_footprint && (
          <div className="relative group">
            <div
              className={`absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-black ${
                is_date_tampered ? "bg-rose-500 ring-2 ring-rose-400/30" : "bg-cyan-500 ring-2 ring-cyan-400/30"
              }`}
            />
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-0.5">
              <span className="text-[9px] text-rose-400 uppercase font-mono block">
                03 // Modifying Software Footprint
              </span>
              <span className="text-xs text-white font-mono font-medium block">
                {detected_software_footprint}
              </span>
              <span className="text-[10px] text-slate-400 block font-sans">
                Extracted from Producer / Creator / XMP Toolkit metadata stream.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Reliability Rationale & Strict Integrity Notice */}
      <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="text-cyan-300 font-semibold block text-[11px] uppercase tracking-wide font-mono">
            Forensic Integrity Policy:
          </span>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {reliability_explanation || badgeConfig.desc}
          </p>
        </div>
      </div>
    </div>
  );
}
