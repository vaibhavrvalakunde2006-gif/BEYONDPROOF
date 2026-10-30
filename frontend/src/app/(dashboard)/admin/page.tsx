'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Users,
  ShieldCheck,
  Activity,
  Cpu,
  UserCheck,
  AlertOctagon,
  ArrowRight,
  ShieldAlert,
  HardDrive,
  Database,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { useAuth } from '@/lib/auth';
import { adminAPI } from '@/lib/api';
import { User, DashboardStats } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import StatCard from '@/components/dashboard/StatCard';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [adminError, setAdminError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAdminData() {
      if (!user) return;
      if (user.role !== 'admin') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setAdminError(null);
        const [dashRes, usersRes] = await Promise.allSettled([
          adminAPI.getDashboard(),
          adminAPI.getUsers(),
        ]);

        if (dashRes.status === 'fulfilled') {
          setStats(dashRes.value.data);
        } else {
          console.error('Failed to load admin dashboard stats', dashRes.reason);
          setAdminError('Failed to fetch platform dashboard telemetry.');
          setStats({
            total_verifications: 0,
            total_files: 0,
            risk_distribution: { low_risk: 0, suspicious: 0, high_risk: 0, unverified: 0 },
            recent_verifications: [],
            engine_stats: {},
          });
        }

        if (usersRes.status === 'fulfilled') {
          setUsers(usersRes.value.data || []);
        } else {
          console.error('Failed to load user directory', usersRes.reason);
          setUsers([]);
        }
      } catch (err: any) {
        console.error('Admin telemetry query error', err);
        setAdminError(err?.message || 'Failed to load administrative console.');
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, [user]);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" label="Loading administrator console and user directory..." />
      </div>
    );
  }

  // Role guard: render access required screen if not admin
  if (user && user.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-gray-100">Administrator Access Required</h1>
        <p className="text-xs text-gray-400 leading-relaxed">
          The Operations Console is reserved for privileged platform administrators. Your current account (<span className="font-mono text-gray-300">{user.email}</span>) holds the standard <span className="text-cyan-400 font-semibold">{user.role.toUpperCase()}</span> role.
        </p>
        <div className="pt-2">
          <Link href="/dashboard" className="btn-primary py-2.5 px-6 text-xs font-semibold inline-flex items-center gap-2">
            <span>Return to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Engine usage bar chart data
  const engineChartData = stats?.engine_stats
    ? Object.entries(stats.engine_stats).map(([name, stat]) => ({
        engine: name,
        runs: stat.total,
        completed: stat.completed,
      }))
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-2">
          <Lock className="w-3.5 h-3.5" />
          <span>Privileged Security Administration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-50 tracking-tight">
          Admin Operations & Tenant Telemetry
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Cluster health, engine throughput distribution, user access permissions, and audit activity.
        </p>
      </div>

      {adminError && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-amber-200 mb-0.5">Telemetry Notice</span>
            <span>{adminError}</span>
          </div>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Registered Users"
          value={users.length}
          icon={Users}
          accentColor="cyan"
        />
        <StatCard
          label="Total Pipelines Run"
          value={stats?.total_verifications ?? 0}
          icon={Activity}
          accentColor="violet"
        />
        <StatCard
          label="Total Files Ingested"
          value={stats?.total_files ?? 0}
          icon={HardDrive}
          accentColor="emerald"
        />
        <StatCard
          label="High Risk Quarantined"
          value={stats?.risk_distribution?.high_risk ?? 0}
          icon={ShieldAlert}
          accentColor="red"
        />
      </div>

      {/* Engine Usage Stats Chart */}
      <div className="glass-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-100">Engine Execution Workload</h2>
            <p className="text-xs text-gray-400">Total pipeline invocations processed per forensic microservice</p>
          </div>
          <Badge variant="cyan">7 Active Microservices</Badge>
        </div>

        {engineChartData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engineChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="engine" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#374151',
                    borderRadius: '8px',
                    color: '#f9fafb',
                    fontSize: '12px',
                  }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <Bar dataKey="runs" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-xs text-gray-500">
            No engine telemetry invocations recorded yet. Ingest and verify files to view workload distribution.
          </div>
        )}
      </div>

      {/* User Management Table */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-100">User Account Directory</h2>
            <p className="text-xs text-gray-400">All registered analysts and cryptographic signing identities</p>
          </div>
          <span className="text-xs font-mono text-gray-400">{users.length} Active Accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-900/90 text-gray-400 font-semibold uppercase tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Name / ID</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-300">
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-100">{u.full_name || 'Unnamed Analyst'}</div>
                      <div className="text-[10px] font-mono text-gray-500">{u.id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-300">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={u.role === 'admin' ? 'violet' : 'default'} size="sm">
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={u.is_active ? 'success' : 'danger'} size="sm">
                        {u.is_active ? 'ACTIVE' : 'SUSPENDED'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 whitespace-nowrap">
                      {formatDate(u.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 font-medium">
                    No registered user accounts found in tenant directory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
