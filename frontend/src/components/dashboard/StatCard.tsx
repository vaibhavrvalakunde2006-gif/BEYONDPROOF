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
        'glass-card p-6 flex flex-col justify-between transition-all duration-300 group',
        styles.glow,
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-400 tracking-wide">{label}</span>
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105',
            styles.bg,
            styles.border,
            styles.text
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-3xl font-bold tracking-tight text-gray-50">{value}</span>
        {trend && (
          <div
            className={cn(
              'flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border',
              trend.positive
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : 'text-red-400 bg-red-500/10 border-red-500/20'
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
