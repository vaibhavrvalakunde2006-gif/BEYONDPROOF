'use client';

import dynamic from 'next/dynamic';
import Sidebar from './Sidebar';

const GlobalForensicBackground = dynamic(
  () => import('@/components/3d/GlobalForensicBackground'),
  { ssr: false }
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-50 relative selection:bg-violet-600/30 selection:text-violet-200">
      {/* 3D WebGL Persistent Forensic Horizon Background */}
      <GlobalForensicBackground />

      {/* Ambient gradient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-violet-600/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[350px] bg-cyan-600/10 blur-[140px] rounded-full" />
      </div>

      {/* Main Sidebar */}
      <Sidebar />

      {/* Content Area */}
      <main className="flex-1 min-w-0 flex flex-col relative z-10 overflow-y-auto">
        {/* Top HUD Telemetry Bar */}
        <div className="border-b border-gray-800/60 bg-gray-950/60 backdrop-blur-md px-6 py-2 flex items-center justify-between text-xs text-gray-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
              <span className="text-cyan-400 font-semibold tracking-wider">FORENSIC CORE: ONLINE</span>
            </span>
            <span className="text-gray-700 hidden sm:inline">|</span>
            <span className="hidden sm:inline text-gray-500">ENGINE SUITE: 7/7 ACTIVE</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-violet-400/80 bg-violet-950/40 px-2 py-0.5 rounded border border-violet-800/40">
              WEBGL2 ACCELERATED
            </span>
            <span className="text-gray-500 hidden md:inline">SESSION: ZERO-TRUST SHA-256</span>
          </div>
        </div>

        <div className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
