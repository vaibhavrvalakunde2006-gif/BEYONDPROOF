'use client';

import React from 'react';
import { getRiskColor, getRiskLabel, cn } from '@/lib/utils';

interface RiskGaugeProps {
  score: number; // 0 to 100
  category?: 'low_risk' | 'suspicious' | 'unverified' | 'high_risk' | string;
  size?: number;
  strokeWidth?: number;
  showDetails?: boolean;
  className?: string;
}

export default function RiskGauge({
  score,
  category,
  size = 180,
  strokeWidth = 14,
  showDetails = true,
  className,
}: RiskGaugeProps) {
  // Normalize score
  const safeScore = Math.max(0, Math.min(100, Math.round(score || 0)));
  const inferredCategory = category || (
    safeScore < 25 ? 'low_risk' :
    safeScore < 60 ? 'suspicious' :
    safeScore < 80 ? 'high_risk' : 'high_risk'
  );

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // We can make an open arc or a full circle. Full circle with offset:
  const strokeDashoffset = circumference - (circumference * safeScore) / 100;

  const getStrokeColor = (cat: string) => {
    switch (cat) {
      case 'low_risk':
        return '#10b981'; // emerald-500
      case 'suspicious':
        return '#f59e0b'; // amber-500
      case 'high_risk':
        return '#ef4444'; // red-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  const strokeColor = getStrokeColor(inferredCategory);
  const colorClass = getRiskColor(inferredCategory);
  const label = getRiskLabel(inferredCategory);

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 origin-center"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1f2937"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${strokeColor}66)`,
            }}
          />
        </svg>

        {/* Center score info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold tracking-tight text-gray-50">
            {safeScore}
          </span>
          <span className="text-xs uppercase font-medium tracking-wider text-gray-400">
            / 100 Risk
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 text-center">
          <span
            className={cn(
              'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border',
              category === 'low_risk'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : category === 'suspicious'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : category === 'high_risk'
                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
            )}
          >
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
