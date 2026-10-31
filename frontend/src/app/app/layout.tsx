"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Fingerprint,
  LayoutDashboard,
  PlusCircle,
  FileSearch,
  ScanLine,
  LockKeyhole,
  Network,
  Activity,
  History,
  FileText,
  Settings,
  Menu,
  X,
  Volume2,
  VolumeX,
  ExternalLink,
  Shield,
  ChevronRight,
} from "lucide-react";
import { soundManager } from "@/lib/soundFx";

const GlobalForensicBackground = dynamic(
  () => import("@/components/3d/GlobalForensicBackground"),
  { ssr: false }
);

const navSections = [
  {
    label: "WORKSPACE",
    items: [
      { label: "Command Center", href: "/app/dashboard", icon: LayoutDashboard },
      { label: "New Ingestion", href: "/app/investigations/new", icon: PlusCircle, isPrimary: true },
    ],
  },
  {
    label: "FORENSIC ENGINES",
    items: [
      { label: "Identity Guardian", href: "/app/engines/identity", icon: Fingerprint },
      { label: "Document Verifier", href: "/app/engines/document", icon: FileSearch },
      { label: "Media Truth Engine", href: "/app/engines/media", icon: ScanLine },
      { label: "Source Tracker", href: "/app/engines/source", icon: LockKeyhole },
      { label: "AI Risk Analyzer", href: "/app/engines/risk", icon: Activity },
    ],
  },
  {
    label: "INTELLIGENCE & AUDIT",
    items: [
      { label: "3D Knowledge Graph", href: "/app/trust-graph", icon: Network },
      { label: "Evidence Ledger", href: "/app/history", icon: History },
      { label: "Court Dossiers", href: "/app/reports", icon: FileText },
      { label: "Engine Configuration", href: "/app/settings", icon: Settings },
    ],
  },
];

export default function EliteAppLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [timeStr, setTimeStr] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toUTCString().replace("GMT", "UTC"));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = useCallback(() => {
    soundManager.playBlip();
    setOpen(false);
  }, []);

  const toggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
    if (!next) soundManager.playBlip();
  }, [isMuted]);

  const currentPage = navSections
    .flatMap((s) => s.items)
    .find((item) => path === item.href)?.label || 
    path.replace("/app/", "").replace("/", " ").toUpperCase() || "OVERVIEW";

  return (
    <div className="min-h-screen text-[#94a3b8] relative flex overflow-x-hidden selection:bg-cyan-500/20 selection:text-white">
      {/* Precision 3D Coordinate Grid & Liquid Aurora Wave */}
      <GlobalForensicBackground />

      {/* Dynamic Ambient Aurora Orbs */}
      <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-cyan-500/15 blur-[130px] pointer-events-none z-0" />
      <div className="fixed top-[30%] right-[-150px] w-[600px] h-[600px] rounded-full bg-purple-600/15 blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-[-100px] left-[25%] w-[550px] h-[550px] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none z-0" />

      {/* ═════════════════════════════════════════════════════════════════
          INSTITUTIONAL LIQUID GLASS SIDEBAR
          ═════════════════════════════════════════════════════════════════ */}
      <aside
        className={`fixed top-0 bottom-0 left-0 ${sidebarCollapsed ? "w-[72px]" : "w-[260px]"} bg-[#080d1a]/80 backdrop-blur-2xl border-r border-white/[0.1] shadow-2xl flex flex-col z-40 transition-all duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-white/[0.08] flex items-center justify-between">
          <Link
            href="/"
            onClick={handleNavClick}
            className="flex items-center gap-3 text-white font-bold tracking-tight"
          >
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-white shrink-0">
              <Shield className="w-4 h-4 text-cyan-400" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-[14px] font-bold tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                BEYOND<span className="text-cyan-400">PROOF</span>
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-6">
          {navSections.map((section) => (
            <div key={section.label}>
              {!sidebarCollapsed && (
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 mb-2 font-medium">
                  {section.label}
                </div>
              )}
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = path === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleNavClick}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`group flex items-center ${sidebarCollapsed ? "justify-center px-2" : "px-3"} py-2 rounded-lg transition-all text-[12px] font-medium ${
                        isActive
                          ? "bg-white/[0.08] text-white border border-white/[0.12] shadow-sm"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                        }`}
                      />
                      
                      {!sidebarCollapsed && (
                        <>
                          <span className="ml-3 tracking-tight">
                            {item.label}
                          </span>
                          {item.isPrimary && (
                            <span className="ml-auto px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-mono text-[9px]">
                              NEW
                            </span>
                          )}
                          {isActive && (
                            <ChevronRight className="ml-auto w-3.5 h-3.5 text-slate-400" />
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/[0.07] space-y-3">
          {!sidebarCollapsed && (
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06] text-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-300 text-[11px]">
                  Institutional Clearance
                </span>
              </div>
              <span className="text-slate-500 text-[10px] block font-mono">Lead Forensic Auditor</span>
            </div>
          )}

          <button
            onClick={() => {
              setSidebarCollapsed(!sidebarCollapsed);
              soundManager.playBlip();
            }}
            className="hidden lg:flex w-full items-center justify-center py-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/[0.04] transition-all text-xs"
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${sidebarCollapsed ? "" : "rotate-180"}`} />
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* ═════════════════════════════════════════════════════════════════
          MAIN VIEWPORT & TOPBAR
          ═════════════════════════════════════════════════════════════════ */}
      <div className={`flex-1 ${sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"} flex flex-col min-h-screen relative z-10 transition-all duration-300`}>
        
        {/* Topbar */}
        <header className="h-16 px-6 lg:px-10 border-b border-white/[0.09] bg-[#070b18]/70 backdrop-blur-xl shadow-lg flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-400 lg:hidden hover:text-white"
            >
              {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="text-slate-500">Workspace</span>
              <span className="text-slate-600">/</span>
              <span className="text-white font-semibold">{currentPage}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {timeStr && (
              <span className="text-slate-500 text-[11px] hidden md:inline-block font-mono tabular-nums">
                {timeStr}
              </span>
            )}

            <button
              onClick={toggleMute}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white text-xs transition-colors"
              title="Toggle Audio Feedback"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-slate-400" />}
              <span className="text-[10px] hidden sm:inline font-mono">
                {isMuted ? "MUTED" : "AUDIO ON"}
              </span>
            </button>

            <Link
              href="/"
              onClick={() => soundManager.playBlip()}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs flex items-center gap-1.5 transition-colors font-medium"
            >
              <span>3D Chamber</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
