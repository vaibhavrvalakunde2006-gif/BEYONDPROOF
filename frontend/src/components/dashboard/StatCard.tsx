import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string | number;
    positive?: boolean;
    label?: string;
  };
  accentColor?: 'violet' | 'cyan' | 'emerald' | 'amber' | 'red';
  className?: string;
}

const colorStyles = {
  violet: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    glow: 'group-hover:border-violet-500/40',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    text: 'text-cyan-400',
    glow: 'group-hover:border-cyan-500/40',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    glow: 'group-hover:border-emerald-500/40',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    glow: 'group-hover:border-amber-500/40',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
    glow: 'group-hover:border-red-500/40',
  },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accentColor = 'violet',
  className,
}: StatCardProps) {
  const styles = colorStyles[accentColor];

  return (
    <div
      className={cn(
        'relative bg-gradient-to-b from-gray-950 via-gray-900/60 to-gray-950 border border-gray-800/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group hover:shadow-xl backdrop-blur-xl',
        styles.glow,
        className
      )}
    >
      {/* Subtle corner tech tick */}
      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-gray-800 group-hover:bg-cyan-400 transition-colors" />

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">{label}</span>
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110 shadow-sm',
            styles.bg,
            styles.border,
            styles.text
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-white font-mono">{value}</span>
        {trend && (
          <div
            className={cn(
              'flex items-center text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md border',
              trend.positive
                ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
                : 'text-red-400 bg-red-950/60 border-red-500/30'
            )}
          >
            {trend.positive ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            <span>{trend.value}</span>
            {trend.label && <span className="ml-1 opacity-70">{trend.label}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
