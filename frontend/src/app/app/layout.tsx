'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { soundManager } from '@/lib/soundFx';

const nav = [
  ['Overview', '/app/dashboard', LayoutDashboard],
  ['New investigation', '/app/investigations/new', PlusCircle],
  ['Identity Guardian', '/app/engines/identity', Fingerprint],
  ['Document Verifier', '/app/engines/document', FileSearch],
  ['Media Truth', '/app/engines/media', ScanLine],
  ['Source Tracker', '/app/engines/source', LockKeyhole],
  ['Trust Graph', '/app/trust-graph', Network],
  ['AI Risk Analyzer', '/app/engines/risk', Activity],
  ['Investigation history', '/app/history', History],
  ['Reports', '/app/reports', FileText],
  ['Settings', '/app/settings', Settings],
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleNavClick = () => {
    soundManager.playBlip();
    setOpen(false);
  };

  const handleLogout = () => {
    soundManager.playBlip();
    logout();
    router.push('/login');
  };

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'BB';

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <Link
          href="/"
          onClick={handleNavClick}
          className="side-brand"
        >
          <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(80,217,237,0.2)]">
            <Fingerprint size={18} />
          </span>
          <span>
            BEYOND<em>PROOF</em>
          </span>
        </Link>

        <div className="side-label">FORENSIC WORKSPACE</div>

        <nav>
          {nav.map(([label, href, Icon]) => {
            const isActive = path === href || (href !== '/app/dashboard' && path.startsWith(String(href)));
            return (
              <Link
                key={String(href)}
                href={String(href)}
                onClick={handleNavClick}
                className={`side-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{String(label)}</span>
                {href === '/app/investigations/new' && <b>+</b>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="secure-box">
            <span className="pulse" />
            <span>SECURE WORKSPACE</span>
            <small>FASTAPI FORENSIC PIPELINE</small>
          </div>

          <div className="relative mt-2">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="user-mini w-full text-left rounded-lg hover:bg-gray-900/60 transition-colors p-2 cursor-pointer"
            >
              <div className="avatar">{initials}</div>
              <div className="overflow-hidden">
                <b className="truncate">{user?.full_name || 'BBC Workspace'}</b>
                <small className="truncate">{user?.email || 'admin@beyondproof.dev'}</small>
              </div>
              <ChevronDown size={14} className="text-gray-500" />
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-gray-950 border border-gray-800 rounded-xl p-2 shadow-2xl backdrop-blur-xl z-50">
                <div className="px-3 py-2 border-b border-gray-800/80 mb-1 text-[11px] font-mono text-cyan-400">
                  CLEARANCE: LEVEL 5 (ADMIN)
                </div>
                <Link
                  href="/app/settings"
                  onClick={() => {
                    handleNavClick();
                    setShowUserMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-300 hover:bg-gray-900 hover:text-white transition-colors"
                >
                  <Settings size={14} />
                  <span>Preferences</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-950/30 transition-colors"
                >
                  <LogOut size={14} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {open && <div className="mobile-scrim" onClick={() => setOpen(false)} />}

      {/* Main Workspace Frame */}
      <main className="app-main">
        <header className="app-topbar">
          <button
            className="mobile-menu"
            onClick={() => setOpen(!open)}
            aria-label="Toggle Navigation"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="crumb">
            BEYONDPROOF <span>/</span> {path.replace('/app/', '').replace(/\//g, ' / ').toUpperCase() || 'DASHBOARD'}
          </div>

          <div className="top-actions">
            <div className="search-mini hidden sm:flex">
              <Search size={14} />
              <span>Search evidence &amp; cases</span>
              <kbd>⌘ K</kbd>
            </div>

            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundManager.playBlip()}
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30"
              title="FastAPI Swagger Documentation"
            >
              <span>API: LIVE</span>
              <ExternalLink size={11} />
            </a>

            <button
              className="icon-button"
              aria-label="Notifications"
              onClick={() => soundManager.playBlip()}
            >
              <Bell size={16} />
            </button>

            <div className="avatar">{initials}</div>
          </div>
        </header>

        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}
