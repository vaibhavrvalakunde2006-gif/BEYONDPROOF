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
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Upload Centre', href: '/upload', icon: Upload },
    { label: 'Identity Guardian', href: '/identity', icon: Shield },
    { label: 'Document Verifier', href: '/document', icon: FileSearch },
    { label: 'Media Truth', href: '/media', icon: Eye },
    { label: 'Source Tracker', href: '/source', icon: Fingerprint },
    { label: 'Trust Graph', href: '/trust-graph', icon: Network },
    { label: 'Risk Analyzer', href: '/risk', icon: Brain },
    { label: 'Verification Hub', href: '/verification', icon: CheckCircle },
  ];

  const secondaryItems = [
    { label: 'Settings', href: '/settings', icon: Settings },
    ...(user?.role === 'admin'
      ? [{ label: 'Admin Console', href: '/admin', icon: Lock }]
      : []),
  ];

  return (
    <>
      {/* Mobile Menu Trigger Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-wider gradient-text">BEYONDPROOF</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-gray-950/95 backdrop-blur-xl border-r border-gray-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo Brand */}
          <div className="p-6 border-b border-gray-800/80 flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 group"
              onClick={() => setMobileOpen(false)}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-wider text-gray-50 group-hover:text-violet-300 transition-colors">
                  BEYOND<span className="text-violet-400">PROOF</span>
                </span>
                <p className="text-[10px] text-cyan-400 tracking-widest font-mono uppercase">
                  FORENSIC CORE
                </p>
              </div>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
              Engines & Verifications
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
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                    isActive
                      ? 'bg-violet-600/15 text-violet-400 border border-violet-500/30 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-violet-400' : 'text-gray-400 group-hover:text-gray-200'
                    )}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_#7c3aed]" />
                  )}
                </Link>
              );
            })}

            <div className="pt-4 pb-2 px-3 text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
              System
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
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                    isActive
                      ? 'bg-violet-600/15 text-violet-400 border border-violet-500/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-violet-400' : 'text-gray-400 group-hover:text-gray-200'
                    )}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_#7c3aed]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-gray-800/80 bg-gray-950">
          <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-gray-900/60 border border-gray-800/60">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-200 truncate">
                {user?.full_name || 'Anonymous User'}
              </p>
              <p className="text-[11px] text-gray-400 truncate font-mono">
                {user?.email || 'user@beyondproof.io'}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
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
