import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'glass-card p-12 text-center flex flex-col items-center justify-center border-dashed border-gray-800',
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-gray-800/60 border border-gray-700/50 flex items-center justify-center text-gray-400 mb-4 shadow-inner">
        <Icon className="w-8 h-8 text-violet-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-100 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 max-w-sm mb-6">{description}</p>
      {action && (
        action.href ? (
          <a href={action.href} className="btn-primary text-sm py-2 px-5">
            {action.label}
          </a>
        ) : (
          <button onClick={action.onClick} className="btn-primary text-sm py-2 px-5">
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
