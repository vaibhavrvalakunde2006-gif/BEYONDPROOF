'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Info, ShieldAlert, CheckCircle } from 'lucide-react';
import { Finding } from '@/lib/types';
import { getSeverityBadgeClass, getSeverityColor, cn } from '@/lib/utils';

interface FindingsListProps {
  findings: Finding[];
  title?: string;
  className?: string;
}

export default function FindingsList({
  findings,
  title = 'Engine Findings & Forensic Indicators',
  className,
}: FindingsListProps) {
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});

  const toggleExpand = (index: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  if (!findings || findings.length === 0) {
    return (
      <div className={cn('glass-card p-6 text-center text-gray-400 text-sm', className)}>
        <p className="flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          No suspicious anomalies or security findings detected.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('glass-card p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-100 flex items-center gap-2">
          <span>{title}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
            {findings.length}
          </span>
        </h3>
      </div>

      <div className="space-y-3">
        {findings.map((finding, idx) => {
          const isExpanded = !!expandedIndices[idx];
          return (
            <div
              key={`${finding.code}-${idx}`}
              className="border border-gray-800/80 rounded-lg p-3.5 bg-gray-950/40 hover:bg-gray-900/60 transition-colors"
            >
              <div
                className="flex items-start justify-between gap-3 cursor-pointer select-none"
                onClick={() => toggleExpand(idx)}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-0.5">{getSeverityIcon(finding.severity)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={cn(
                          'text-xs font-semibold px-2 py-0.5 rounded border uppercase tracking-wider',
                          getSeverityBadgeClass(finding.severity)
                        )}
                      >
                        {finding.severity}
                      </span>
                      <span className="text-xs font-mono text-gray-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                        {finding.code}
                      </span>
                      {finding.location && (
                        <span className="text-xs text-gray-400">
                          loc: {finding.location}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-200 leading-snug">
                      {finding.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-200 p-1 rounded transition-colors"
                  aria-label={isExpanded ? 'Collapse evidence' : 'Expand evidence'}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {isExpanded && finding.evidence && (
                <div className="mt-3 pt-3 border-t border-gray-800 text-xs">
                  <div className="text-gray-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Forensic Evidence:
                  </div>
                  <pre className="p-3 bg-gray-900/90 rounded border border-gray-800 text-gray-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {finding.evidence}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
