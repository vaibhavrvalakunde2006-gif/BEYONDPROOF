"use client";

import React, { useState, useEffect } from "react";
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
  Search,
  Bell,
  Menu,
  X,
  Volume2,
  VolumeX,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { soundManager } from "@/lib/soundFx";

// Dynamically import GlobalForensicBackground for ambient 3D particle dust and cyber grid
const GlobalForensicBackground = dynamic(
  () => import("@/components/3d/GlobalForensicBackground"),
  { ssr: false }
);

const nav = [
  { label: "Overview", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "New Investigation", href: "/app/investigations/new", icon: PlusCircle, isPrimary: true },
  { label: "Identity Guardian", href: "/app/engines/identity", icon: Fingerprint },
  { label: "Document Verifier", href: "/app/engines/document", icon: FileSearch },
  { label: "Media Truth Engine", href: "/app/engines/media", icon: ScanLine },
  { label: "Source Tracker", href: "/app/engines/source", icon: LockKeyhole },
  { label: "3D Trust Graph", href: "/app/trust-graph", icon: Network },
  { label: "AI Risk Analyzer", href: "/app/engines/risk", icon: Activity },
  { label: "Investigation History", href: "/app/history", icon: History },
  { label: "Forensic Reports", href: "/app/reports", icon: FileText },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toUTCString().replace("GMT", "UTC"));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = () => {
    soundManager.playBlip();
    setOpen(false);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
    if (!next) soundManager.playBlip();
  };

  return (
    <div className="min-h-screen bg-[#05070b] text-[#edf3fb] relative flex overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Ambient 3D Cyber Particle Dust Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <GlobalForensicBackground />
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#070b13]/95 backdrop-blur-xl border-r border-white/[0.08] flex flex-col justify-between p-5 z-40 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Brand header */}
          <Link
            href="/"
            onClick={handleNavClick}
            className="flex items-center gap-2.5 mb-8 px-2 font-bold tracking-wider text-sm"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
              <Fingerprint className="w-5 h-5" />
            </div>
            <span>
              BEYOND<span className="text-cyan-400">PROOF</span>
            </span>
          </Link>

          <div className="text-[10px] font-mono tracking-widest text-gray-500 px-3 mb-2 uppercase">
            WORKSPACE FORENSICS
          </div>

          <nav className="space-y-1 font-mono text-xs">
            {nav.map((item) => {
              const Icon = item.icon;
              const isActive = path === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-cyan-500/15 text-cyan-300 border border-cyan-400/50 font-bold shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-cyan-400" : "text-gray-500"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.isPrimary && (
                    <span className="w-4 h-4 rounded-full bg-cyan-400 text-black font-extrabold flex items-center justify-center text-[10px]">
                      +
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar bottom clearance box */}
        <div className="pt-4 border-t border-white/[0.08] font-mono text-xs space-y-3">
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 text-[10px]">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-bold">SECURITY CLEARANCE</span>
            </div>
            <span className="text-gray-400 block">LEVEL 5 FORENSIC EXAMINER</span>
          </div>

          <div className="flex items-center justify-between px-2 text-gray-500 text-[11px]">
            <span>BBC SPECIAL OPS</span>
            <span className="text-cyan-400">v2.4 ONLINE</span>
          </div>
        </div>
      </aside>

      {/* Mobile scrim */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative z-10">
        {/* Topbar HUD */}
        <header className="h-16 border-b border-white/[0.08] bg-[#070b13]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 font-mono text-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray-400 lg:hidden"
            >
              {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2 text-gray-500 text-[11px]">
              <span>BEYONDPROOF</span>
              <span className="text-cyan-400">//</span>
              <span className="text-white font-bold uppercase">
                {path.replace("/app/", "").replace("/", " ") || "OVERVIEW"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {timeStr && (
              <span className="text-gray-500 text-[11px] hidden md:inline-block">
                {timeStr}
              </span>
            )}

            <button
              onClick={toggleMute}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-gray-400 hover:text-cyan-400 transition-colors"
              title="Toggle Audio FX Synthesizer"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span className="text-[10px]">{isMuted ? "MUTED" : "AUDIO ON"}</span>
            </button>

            <Link
              href="/"
              onClick={() => soundManager.playBlip()}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/20 text-[11px] flex items-center gap-1.5 transition-colors"
            >
              <span>3D Holodeck</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
