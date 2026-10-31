"use client";

import React, { useState, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Eye,
  AlertTriangle,
  Info,
  CheckCircle2,
  Maximize2,
  Crosshair,
} from "lucide-react";
import { soundManager } from "@/lib/soundFx";

export interface SuspiciousRegion {
  id: string;
  page: number;
  label: string;
  bbox: [number, number, number, number]; // [x, y, width, height] in percentages (0-100)
  severity: "critical" | "high" | "medium" | "low" | "info";
  suspected_change: string;
  explanation: string;
  evidence: string;
}

interface UniversalDocumentViewerProps {
  documentUrl?: string | null;
  annotatedUrl?: string | null;
  regions?: SuspiciousRegion[];
  documentCategory?: string;
  documentCategoryName?: string;
  selectedRegionId?: string | null;
  onSelectRegion?: (regionId: string | null) => void;
}

export default function UniversalDocumentViewer({
  documentUrl,
  annotatedUrl,
  regions = [],
  documentCategory,
  documentCategoryName,
  selectedRegionId,
  onSelectRegion,
}: UniversalDocumentViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [showOverlays, setShowOverlays] = useState(true);
  const [useAnnotatedLayer, setUseAnnotatedLayer] = useState(false);
  const [hoveredRegion, setHoveredRegion] = useState<SuspiciousRegion | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeRegions = regions || [];

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.75));
  const handleResetZoom = () => setZoom(1);

  // Fallback backend URL prefix if relative path is provided
  const getFullUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:") || url.startsWith("data:")) {
      return url;
    }
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    return `http://localhost:8000${cleanPath}`;
  };

  const currentDisplayUrl = useAnnotatedLayer && annotatedUrl
    ? getFullUrl(annotatedUrl)
    : getFullUrl(documentUrl);

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "critical":
        return {
          border: "border-rose-500",
          bg: "bg-rose-500/15",
          badge: "bg-rose-950/80 text-rose-300 border-rose-500/40",
          glow: "shadow-[0_0_15px_rgba(244,63,94,0.5)]",
          label: "CRITICAL TAMPER",
        };
      case "high":
        return {
          border: "border-amber-500",
          bg: "bg-amber-500/15",
          badge: "bg-amber-950/80 text-amber-300 border-amber-500/40",
          glow: "shadow-[0_0_15px_rgba(245,158,11,0.5)]",
          label: "HIGH SUSPICION",
        };
      case "medium":
        return {
          border: "border-yellow-400",
          bg: "bg-yellow-400/10",
          badge: "bg-yellow-950/80 text-yellow-300 border-yellow-400/40",
          glow: "shadow-[0_0_12px_rgba(234,179,8,0.4)]",
          label: "ANOMALY",
        };
      default:
        return {
          border: "border-cyan-400",
          bg: "bg-cyan-400/10",
          badge: "bg-cyan-950/80 text-cyan-300 border-cyan-400/40",
          glow: "shadow-[0_0_10px_rgba(0,229,255,0.4)]",
          label: "VERIFIED FIELD",
        };
    }
  };

  return (
    <div className="relative rounded-2xl liquid-glass border border-white/[0.08] overflow-hidden flex flex-col shadow-2xl">
      {/* HUD Header Toolbar */}
      <div className="px-4 py-3 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Crosshair className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span
            className="text-xs uppercase text-white font-semibold tracking-wider font-mono"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            FORENSIC OPTICAL LOCALIZER
          </span>
          {documentCategoryName && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-cyan-950/60 border border-cyan-400/30 text-cyan-300">
              {documentCategoryName}
            </span>
          )}
          <span className="text-[10px] text-slate-400 font-mono">
            ({activeRegions.length} Detected Regions)
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {annotatedUrl && (
            <button
              onClick={() => setUseAnnotatedLayer((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                useAnnotatedLayer
                  ? "bg-rose-950/80 border border-rose-500/50 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                  : "bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-white"
              }`}
              title="Toggle Heatmap / Annotated ELA Layer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{useAnnotatedLayer ? "Heatmap On" : "Show ELA Heatmap"}</span>
            </button>
          )}

          <button
            onClick={() => setShowOverlays((prev) => !prev)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
              showOverlays
                ? "bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                : "bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-white"
            }`}
            title="Toggle Bounding Boxes"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Overlays ({showOverlays ? "On" : "Off"})</span>
          </button>

          <div className="flex items-center bg-black/50 border border-white/[0.08] rounded-lg p-0.5">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.75}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[10px] font-mono text-cyan-400">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 2.5}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Viewport Canvas Stage */}
      <div
        ref={containerRef}
        className="relative w-full min-h-[420px] max-h-[620px] overflow-auto bg-[#040810] flex items-center justify-center p-4 scrollbar-thin scrollbar-thumb-cyan-950 scrollbar-track-transparent select-none"
      >
        {currentDisplayUrl ? (
          <div
            className="relative transition-transform duration-200 origin-center inline-block shadow-2xl rounded-lg overflow-hidden border border-white/[0.05]"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* Base Document Image */}
            <img
              src={currentDisplayUrl}
              alt="Forensic Specimen Document"
              className="max-w-full h-auto block select-none pointer-events-none"
              style={{ maxHeight: "560px" }}
              onError={(e) => {
                // If local path fails, show a clean fallback canvas
                (e.target as HTMLElement).style.display = "none";
              }}
            />

            {/* Interactive Bounding Boxes Overlay */}
            {showOverlays &&
              activeRegions.map((region) => {
                const colors = getSeverityColor(region.severity);
                const isSelected = selectedRegionId === region.id;
                const isHovered = hoveredRegion?.id === region.id;

                const [x, y, w, h] = region.bbox;

                return (
                  <div
                    key={region.id}
                    onClick={() => onSelectRegion?.(isSelected ? null : region.id)}
                    onMouseEnter={() => setHoveredRegion(region)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${w}%`,
                      height: `${h}%`,
                    }}
                    className={`absolute cursor-pointer border-2 transition-all duration-200 z-20 ${
                      colors.border
                    } ${colors.bg} ${
                      isSelected || isHovered
                        ? `ring-2 ring-white/80 ${colors.glow} scale-[1.02]`
                        : "hover:scale-[1.01]"
                    }`}
                  >
                    {/* Corner Reticle Marks */}
                    <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_4px_#fff]" />
                    <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_4px_#fff]" />
                    <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_4px_#fff]" />
                    <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_4px_#fff]" />

                    {/* Tag Badge */}
                    <div className="absolute -top-5 left-0 z-30 pointer-events-none">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider border whitespace-nowrap ${colors.badge}`}
                      >
                        {region.label}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : activeRegions.length > 0 ? (
          <div
            className="relative transition-transform duration-200 origin-center inline-block shadow-2xl rounded-lg overflow-hidden border border-white/[0.1] bg-slate-900/60 w-[500px] h-[360px]"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* Synthetic Specimen Background Canvas */}
            <div className="absolute inset-0 p-5 flex flex-col justify-between select-none pointer-events-none opacity-40">
              <div className="flex items-center justify-between border-b border-white/20 pb-3">
                <div className="space-y-1">
                  <div className="h-3 w-32 bg-cyan-400/30 rounded" />
                  <div className="h-2 w-48 bg-slate-600/40 rounded" />
                </div>
                <div className="h-8 w-16 bg-white/10 rounded border border-white/10" />
              </div>
              <div className="space-y-3 py-4">
                <div className="h-2 w-full bg-slate-700/20 rounded" />
                <div className="h-2 w-4/5 bg-slate-700/20 rounded" />
                <div className="h-2 w-5/6 bg-slate-700/20 rounded" />
                <div className="h-2 w-3/4 bg-slate-700/20 rounded" />
                <div className="h-2 w-2/3 bg-slate-700/20 rounded" />
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[9px] font-mono text-slate-500">
                <span>SPECIMEN CONTAINER STREAM</span>
                <span>{documentCategoryName || "EVIDENCE SPECIMEN"}</span>
              </div>
            </div>

            {/* Interactive Bounding Boxes Overlay */}
            {showOverlays &&
              activeRegions.map((region) => {
                const colors = getSeverityColor(region.severity);
                const isSelected = selectedRegionId === region.id;
                const isHovered = hoveredRegion?.id === region.id;
                const [x, y, w, h] = region.bbox;

                return (
                  <div
                    key={region.id}
                    onClick={() => {
                      onSelectRegion?.(region.id);
                      soundManager.playBeep();
                    }}
                    onMouseEnter={() => setHoveredRegion(region)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${w}%`,
                      height: `${h}%`,
                    }}
                    className={`absolute cursor-pointer border-2 transition-all duration-150 ${colors.border} ${colors.bg} ${
                      isSelected || isHovered
                        ? `ring-2 ring-white/80 ${colors.glow} scale-[1.02]`
                        : "hover:scale-[1.01]"
                    }`}
                  >
                    {/* Corner Reticle Marks */}
                    <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_4px_#fff]" />
                    <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_4px_#fff]" />
                    <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_4px_#fff]" />
                    <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_4px_#fff]" />

                    {/* Tag Badge */}
                    <div className="absolute -top-5 left-0 z-30 pointer-events-none">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider border whitespace-nowrap ${colors.badge}`}
                      >
                        {region.label}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          /* Empty / Ingesting State */
          <div className="p-8 text-center text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-full bg-cyan-950/40 border border-cyan-400/20 flex items-center justify-center mx-auto text-cyan-400 animate-pulse">
              <Crosshair className="w-6 h-6" />
            </div>
            <p className="text-xs font-mono">
              Upload a document to project bounding box coordinates onto the optical canvas.
            </p>
          </div>
        )}
      </div>

      {/* Floating Detailed HUD Tooltip for Hovered / Selected Region */}
      {(hoveredRegion || (selectedRegionId && activeRegions.find((r) => r.id === selectedRegionId))) && (
        <div className="p-3.5 bg-black/90 border-t border-cyan-500/30 backdrop-blur-md animate-fadeIn">
          {(() => {
            const active =
              hoveredRegion || activeRegions.find((r) => r.id === selectedRegionId)!;
            const colors = getSeverityColor(active.severity);
            return (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${colors.badge}`}
                    >
                      {active.suspected_change || "SUSPECT REGION"}
                    </span>
                    <span className="text-white font-semibold">{active.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      (Page {active.page})
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {active.explanation}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono text-cyan-300 max-w-sm truncate shrink-0">
                  <span className="text-slate-400 block text-[9px] uppercase">
                    Forensic Proof:
                  </span>
                  <span>{active.evidence}</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
