'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Upload,
  Shield,
  FileSearch,
  Eye,
  Fingerprint,
  Network,
  Brain,
  CheckCircle,
  Clock,
  Settings,
  Lock,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, code: '00' },
    { label: 'Upload Centre', href: '/upload', icon: Upload, code: 'IN' },
    { label: 'Identity Guardian', href: '/identity', icon: Shield, code: '01' },
    { label: 'Document Verifier', href: '/document', icon: FileSearch, code: '02' },
    { label: 'Media Truth', href: '/media', icon: Eye, code: '03' },
    { label: 'Source Tracker', href: '/source', icon: Fingerprint, code: '04' },
    { label: 'Trust Graph', href: '/trust-graph', icon: Network, code: '05' },
    { label: 'Risk Analyzer', href: '/risk', icon: Brain, code: '06' },
    { label: 'Verification Hub', href: '/verification', icon: CheckCircle, code: '07' },
  ];

  const secondaryItems = [
    { label: 'Settings', href: '/settings', icon: Settings, code: 'CFG' },
    ...(user?.role === 'admin'
      ? [{ label: 'Admin Console', href: '/admin', icon: Lock, code: 'ADM' }]
      : []),
  ];

  return (
    <>
      {/* Mobile Menu Trigger Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-gray-950 border-b border-gray-800 sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-wider font-mono text-white">BEYOND<span className="text-orange-400">PROOF</span></span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-gray-950/95 backdrop-blur-2xl border-r border-gray-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo Brand */}
          <div className="p-5 border-b border-gray-800/80 flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 group"
              onClick={() => setMobileOpen(false)}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-violet-600 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-wider text-gray-50 group-hover:text-cyan-300 transition-colors font-mono">
                  BEYOND<span className="text-orange-400">PROOF</span>
                </span>
                <p className="text-[9px] text-cyan-400 tracking-widest font-mono uppercase">
                  DEFENSE LAB // V2.0
                </p>
              </div>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-mono font-semibold tracking-widest text-gray-500 uppercase flex items-center justify-between">
              <span>FORENSIC ENGINES</span>
              <span className="text-cyan-400 font-bold">7/7</span>
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative',
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/40 shadow-sm shadow-cyan-500/10'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60 border border-transparent'
                  )}
                >
                  <span
                    className={cn(
                      'text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors',
                      isActive
                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'bg-gray-900 text-gray-600 group-hover:text-gray-400'
                    )}
                  >
                    {item.code}
                  </span>
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-gray-200'
                    )}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF] animate-pulse" />
                  )}
                </Link>
              );
            })}

            <div className="pt-3 pb-1.5 px-3 text-[10px] font-mono font-semibold tracking-widest text-gray-500 uppercase">
              PLATFORM SYSTEM
            </div>

            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all group',
                    isActive
                      ? 'bg-violet-600/15 text-violet-300 border border-violet-500/40'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60 border border-transparent'
                  )}
                >
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-900 text-gray-600">
                    {item.code}
                  </span>
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-violet-400' : 'text-gray-400 group-hover:text-gray-200'
                    )}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Investigator Profile Card & Logout */}
        <div className="p-3 border-t border-gray-800/80 bg-gray-950">
          <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800/80 flex items-center justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  CLEARANCE L5
                </span>
              </div>
              <p className="text-xs font-bold text-gray-100 truncate">
                {user?.full_name || 'Lead Investigator'}
              </p>
              <p className="text-[10px] text-gray-500 truncate font-mono">
                {user?.email || 'admin@beyondproof.dev'}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
