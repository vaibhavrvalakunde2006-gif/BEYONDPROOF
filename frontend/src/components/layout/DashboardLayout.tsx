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
        <div className="border-b border-gray-800/80 bg-gray-950/80 backdrop-blur-xl px-6 py-2.5 flex items-center justify-between text-xs text-gray-400 font-mono sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block shadow-sm shadow-cyan-400" />
              <span className="text-cyan-400 font-bold tracking-wider">CORE: ONLINE</span>
            </span>
            <span className="text-gray-700 hidden sm:inline">|</span>
            {/* Live Waveform Frequency Visualizer */}
            <div className="hidden md:flex items-center gap-1 text-[10px] text-gray-500">
              <span className="mr-1">TELEMETRY:</span>
              <span className="w-1 h-3 bg-cyan-400/80 rounded-full animate-pulse" />
              <span className="w-1 h-5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="w-1 h-2 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="w-1 h-4 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              <span className="w-1 h-3 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
              <span className="w-1 h-5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.25s' }} />
            </div>
            <span className="text-gray-700 hidden md:inline">|</span>
            <span className="hidden lg:inline text-gray-500">PIPELINE: 7 ENGINES NOMINAL</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-cyan-300 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-800/40 font-semibold shadow-sm shadow-cyan-950">
              WEBGL2 GPU ACTIVE
            </span>
            <span className="text-orange-400/90 bg-orange-950/40 px-2.5 py-0.5 rounded-full border border-orange-800/40 hidden sm:inline font-semibold">
              ZERO-TRUST IMMUTABLE
            </span>
          </div>
        </div>

        <div className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
