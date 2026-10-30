import React from 'react';
import { Check, X, Minus, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EngineStatusBadgeProps {
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export default function EngineStatusBadge({
  status,
  size = 'md',
  showLabel = true,
  className,
}: EngineStatusBadgeProps) {
  const normalized = status?.toLowerCase() || 'pending';

  const config = {
    pending: {
      label: 'Pending',
      bg: 'bg-gray-800/80 text-gray-400 border-gray-700 animate-pulse',
      icon: Clock,
      iconClass: 'w-3.5 h-3.5',
    },
    running: {
      label: 'Analyzing',
      bg: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
      icon: Loader2,
      iconClass: 'w-3.5 h-3.5 animate-spin',
    },
    completed: {
      label: 'Completed',
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: Check,
      iconClass: 'w-3.5 h-3.5 stroke-[3]',
    },
    failed: {
      label: 'Failed',
      bg: 'bg-red-500/10 text-red-400 border-red-500/20',
      icon: X,
      iconClass: 'w-3.5 h-3.5 stroke-[3]',
    },
    skipped: {
      label: 'Skipped',
      bg: 'bg-gray-800/40 text-gray-500 border-gray-800',
      icon: Minus,
      iconClass: 'w-3.5 h-3.5',
    },
  }[normalized] || {
    label: normalized,
    bg: 'bg-gray-800 text-gray-400 border-gray-700',
    icon: Clock,
    iconClass: 'w-3.5 h-3.5',
  };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        config.bg,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      <Icon className={config.iconClass} />
      {showLabel && <span className="capitalize">{config.label}</span>}
    </span>
  );
}
