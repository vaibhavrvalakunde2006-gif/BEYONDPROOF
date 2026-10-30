'use client';

import React from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-50 relative selection:bg-violet-600/30 selection:text-violet-200">
      {/* Background ambient gradient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-violet-600/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[350px] bg-cyan-600/10 blur-[140px] rounded-full" />
      </div>

      {/* Main Sidebar */}
      <Sidebar />

      {/* Content Area */}
      <main className="flex-1 min-w-0 flex flex-col relative z-10 overflow-y-auto">
        <div className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
