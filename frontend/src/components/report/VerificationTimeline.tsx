'use client';

import React from 'react';
import { CheckCircle2, Clock, Loader2, AlertCircle, Shield } from 'lucide-react';
import { VerificationRequest } from '@/lib/types';
import { formatDate, cn } from '@/lib/utils';
import EngineStatusBadge from '../engines/EngineStatusBadge';

interface VerificationTimelineProps {
  verification: VerificationRequest;
  className?: string;
}

export default function VerificationTimeline({
  verification,
  className,
}: VerificationTimelineProps) {
  const { engine_results = [], created_at, completed_at, status } = verification;

  return (
    <div className={cn('glass-card p-6', className)}>
      <h3 className="text-base font-semibold text-gray-100 mb-6 flex items-center gap-2">
        <Shield className="w-4 h-4 text-violet-400" />
        Verification Pipeline Timeline
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-800">
        {/* Step 1: Request Created */}
        <div className="relative group">
          <div className="absolute -left-[27px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-gray-950 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-200">
                Verification Pipeline Initialized
              </span>
              <span className="text-xs text-gray-500">{formatDate(created_at)}</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Target file: <span className="font-mono text-gray-300">{verification.file?.filename || verification.file_id}</span>
            </p>
          </div>
        </div>

        {/* Step 2: Engine Invocations */}
        {engine_results.map((engine, index) => {
          const isDone = engine.status === 'completed';
          const isRunning = engine.status === 'running';
          const isFailed = engine.status === 'failed';

          return (
            <div key={engine.id || index} className="relative group">
              <div
                className={cn(
                  'absolute -left-[27px] top-0.5 w-4 h-4 rounded-full border-2 border-gray-950 flex items-center justify-center',
                  isDone
                    ? 'bg-emerald-500'
                    : isRunning
                    ? 'bg-violet-500 animate-ping'
                    : isFailed
                    ? 'bg-red-500'
                    : 'bg-gray-700'
                )}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              <div className="bg-gray-900/60 border border-gray-800/80 rounded-lg p-3">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-200 uppercase tracking-wide">
                    {engine.engine_name.replace(/_/g, ' ')}
                  </span>
                  <EngineStatusBadge status={engine.status} size="sm" />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>
                    {engine.findings?.length || 0} anomaly findings
                  </span>
                  {engine.confidence !== null && (
                    <span className="text-violet-400 font-medium">
                      Confidence: {Math.round(engine.confidence * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Step 3: Synthesis & Assessment */}
        <div className="relative group">
          <div
            className={cn(
              'absolute -left-[27px] top-0.5 w-4 h-4 rounded-full border-2 border-gray-950 flex items-center justify-center',
              status === 'completed'
                ? 'bg-emerald-500'
                : status === 'processing'
                ? 'bg-violet-500'
                : 'bg-gray-700'
            )}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-200">
                Risk Engine Synthesis & Report Generation
              </span>
              {completed_at && (
                <span className="text-xs text-gray-500">{formatDate(completed_at)}</span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {status === 'completed'
                ? 'Overall risk assessed and report certified.'
                : status === 'failed'
                ? 'Pipeline encountered an error during assessment.'
                : 'Aggregating engine scores and building cross-entity Trust Graph...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
