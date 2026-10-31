"use client";

import React from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Calculator,
  Fingerprint,
  FileCheck,
} from "lucide-react";

export interface RuleValidationResult {
  category: string;
  category_name: string;
  checks: Array<{
    rule_name: string;
    passed: boolean;
    description: string;
    details: string;
    severity?: "critical" | "high" | "medium" | "low";
  }>;
}

interface CategoryRuleChecklistProps {
  ruleValidation?: RuleValidationResult | null;
}

export default function CategoryRuleChecklist({
  ruleValidation,
}: CategoryRuleChecklistProps) {
  if (!ruleValidation || !ruleValidation.checks || ruleValidation.checks.length === 0) {
    return null;
  }

  const { category_name, checks } = ruleValidation;
  const passedCount = checks.filter((c) => c.passed).length;
  const totalCount = checks.length;
  const allPassed = passedCount === totalCount;

  return (
    <div className="p-5 rounded-2xl liquid-glass border border-white/[0.08] space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.06] gap-2">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-cyan-400" />
          <h4
            className="text-xs uppercase text-white font-semibold tracking-wider font-mono"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {category_name.toUpperCase()} // DETERMINISTIC MATHEMATICAL & SYNTAX AUDIT
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
              allPassed
                ? "bg-emerald-950/70 border-emerald-500/40 text-emerald-300"
                : "bg-rose-950/80 border-rose-500/50 text-rose-300"
            }`}
          >
            {passedCount}/{totalCount} CHECKS PASSED
          </span>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {checks.map((chk, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border transition-all ${
              chk.passed
                ? "bg-emerald-950/15 border-emerald-500/20 text-slate-200"
                : "bg-rose-950/25 border-rose-500/30 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {chk.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="text-xs font-semibold block text-white">
                  {chk.rule_name}
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {chk.description}
                </p>
                {chk.details && (
                  <span
                    className={`text-[10px] font-mono block ${
                      chk.passed ? "text-emerald-400/80" : "text-rose-300"
                    }`}
                  >
                    Detail: {chk.details}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
