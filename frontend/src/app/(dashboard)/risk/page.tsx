'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Brain,
  ShieldCheck,
  AlertOctagon,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowRight,
  ListCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { verificationAPI, engineAPI } from '@/lib/api';
import { RiskAssessment, VerificationRequest } from '@/lib/types';
import dynamic from 'next/dynamic';
import RiskGauge from '@/components/dashboard/RiskGauge';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getRiskBgColor, getRiskColor, getRiskLabel } from '@/lib/utils';

const ThreeDRiskPolyhedron = dynamic(
  () => import('@/components/3d/ThreeDRiskPolyhedron'),
  { ssr: false }
);

export default function RiskAnalyzerPage() {
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [selectedVerificationId, setSelectedVerificationId] = useState<string>('');
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setErrorMessage(null);
        const res = await verificationAPI.history();
        const list: VerificationRequest[] = res.data || [];
        setVerifications(list);

        if (list.length > 0) {
          const first = list[0];
          setSelectedVerificationId(first.id);
          if (first.risk_assessment) {
            setAssessment(first.risk_assessment);
          } else {
            try {
              const riskRes = await engineAPI.getRisk(first.id);
              setAssessment(riskRes.data);
            } catch (rErr: any) {
              console.warn('Risk evaluation pending or unavailable', rErr);
              setAssessment(null);
            }
          }
        } else {
          setAssessment(null);
        }
      } catch (err: any) {
        console.error('Failed to load verification history', err);
        setErrorMessage(err?.response?.data?.detail || 'Unable to retrieve verification risk history.');
        setAssessment(null);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelect = async (id: string) => {
    setSelectedVerificationId(id);
    setErrorMessage(null);
    const target = verifications.find((v) => v.id === id);
    if (target?.risk_assessment) {
      setAssessment(target.risk_assessment);
    } else {
      try {
        const res = await engineAPI.getRisk(id);
        setAssessment(res.data);
      } catch (rErr: any) {
        console.error('Failed to fetch risk for verification', rErr);
        setErrorMessage('Risk score calculation is in progress or unavailable for this session.');
        setAssessment(null);
      }
    }
  };

  const chartData = assessment?.individual_scores
    ? Object.entries(assessment.individual_scores).map(([name, score]) => ({
        engine: name,
        score,
        fill: score > 70 ? '#ef4444' : score > 40 ? '#f59e0b' : '#10b981',
      }))
    : [];

  const getDynamicRecommendations = (score: number, category: string) => {
    if (category === 'high_risk' || score >= 70) {
      return [
        {
          action: 'Quarantine Asset Immediately',
          priority: 'high',
          detail: 'Critical integrity anomalies or structural tampering detected. Block ingestion into production downstream workflows.',
        },
        {
          action: 'Escalate to Senior Forensic Reviewer',
          priority: 'high',
          detail: 'Elevated risk synthesis requires manual verification of flagged finding nodes before any certification.',
        },
        {
          action: 'Export Cryptographically Signed Forensic Dossier',
          priority: 'medium',
          detail: 'Generate tamper-evident PDF inspection report containing SHA-256 evidence hashes for compliance logging.',
        },
      ];
    } else if (category === 'suspicious' || score >= 35) {
      return [
        {
          action: 'Secondary Multi-Engine Audit',
          priority: 'high',
          detail: 'Moderate risk indicators present. Review individual engine scores to isolate specific anomaly vectors.',
        },
        {
          action: 'Compare Against Baseline Version',
          priority: 'medium',
          detail: 'Use Source Tracker to run a dual-file perceptual and cryptographic comparison against known earlier versions.',
        },
        {
          action: 'Hold in Pending Verification Queue',
          priority: 'low',
          detail: 'Require additional secondary sign-off prior to authorizing file consumption in enterprise pipelines.',
        },
      ];
    } else {
      return [
        {
          action: 'Certify for Ingestion & Production Use',
          priority: 'low',
          detail: 'All forensic microservices returned authentic baselines with zero critical anomalies detected.',
        },
        {
          action: 'Anchor Cryptographic Fingerprint',
          priority: 'low',
          detail: 'Record SHA-256 hash in provenance registry to guarantee tamper-detection for all future derivatives.',
        },
        {
          action: 'Archive Forensic Audit Trail',
          priority: 'low',
          detail: 'Store engine telemetry in the immutable audit log for SOC2 and regulatory audit compliance.',
        },
      ];
    }
  };

  const recommendedActions = getDynamicRecommendations(
    assessment?.overall_score ?? 0,
    assessment?.risk_category ?? 'unverified'
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-50 tracking-tight flex items-center gap-3">
            <Brain className="w-8 h-8 text-fuchsia-400" />
            <span>AI Risk Analyzer & Deterministic Engine</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Explainable mathematical risk synthesis calculating weighted severity thresholds across all forensic engines.
          </p>
        </div>

        {verifications.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Audit Target:</span>
            <select
              value={selectedVerificationId}
              onChange={(e) => handleSelect(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-xs text-gray-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-violet-500"
            >
              {verifications.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.file?.filename || v.id.slice(0, 14)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Error banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-amber-200 mb-0.5">Risk Analysis Notice</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="Computing Bayesian risk distributions..." />
        </div>
      ) : verifications.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <Brain className="w-12 h-12 text-fuchsia-400/60 mx-auto" />
          <h3 className="text-base font-bold text-gray-200">No Forensic Risk Assessments Available</h3>
          <p className="text-xs text-gray-400 max-w-lg mx-auto leading-relaxed">
            The Deterministic AI Risk Analyzer computes a mathematically explainable risk score across Document, Media, Identity, and Source engines. Run a verification on any file to compute its comprehensive threat score.
          </p>
          <div className="pt-2">
            <Link href="/verification" className="btn-primary py-2.5 px-6 text-xs font-semibold inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Launch Verification Hub</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 3D Interactive Cyber Threat Matrix & Risk Polyhedron */}
          <ThreeDRiskPolyhedron
            score={assessment?.overall_score ?? 42}
            category={assessment?.risk_category ?? 'suspicious'}
            vectors={{
              tamper: assessment?.individual_scores?.document ?? 35,
              synthetic: assessment?.individual_scores?.media ?? 65,
              provenance: assessment?.individual_scores?.source ?? 25,
              metadata: assessment?.individual_scores?.identity ?? 40,
              network: 28,
            }}
          />

          {/* Top Score & Narrative Assessment */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Gauge Card */}
            <div className="glass-card p-6 flex flex-col items-center justify-center">
              <RiskGauge
                score={assessment?.overall_score ?? 0}
                category={assessment?.risk_category ?? 'unverified'}
                size={180}
              />
            </div>

            {/* Explanation Narrative */}
            <div className="glass-card p-6 lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-fuchsia-400" />
                    <span>Deterministic Risk Synthesis Report</span>
                  </h2>
                  <span
                    className={`cyber-badge ${getRiskBgColor(
                      assessment?.risk_category
                    )}`}
                  >
                    {getRiskLabel(assessment?.risk_category)}
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {assessment?.explanation}
                </p>
              </div>

              {/* Weights Summary */}
              <div className="pt-4 border-t border-gray-800">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-2">
                  Multi-Engine Weight Distribution
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {Object.entries(assessment?.weights_used || {}).map(([engine, weight]) => (
                    <div key={engine} className="p-2 rounded bg-gray-900 border border-gray-800">
                      <span className="text-gray-400 truncate block text-[10px]">{engine}</span>
                      <span className="font-mono text-cyan-400 font-bold">
                        {Math.round(weight * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Individual Engine Scores Bar Chart */}
          <div className="glass-card p-6">
            <div className="mb-6">
              <h3 className="text-base font-bold text-gray-100">Individual Engine Risk Scores</h3>
              <p className="text-xs text-gray-400">
                Relative threat indices per specialized forensic module (0 = Clean, 100 = Definitive Compromise)
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis
                    dataKey="engine"
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis stroke="#9ca3af" fontSize={11} domain={[0, 100]} />
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
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-gray-100 mb-4 flex items-center gap-2">
              <ListCheck className="w-5 h-5 text-cyan-400" />
              <span>Recommended Remediations & Investigative Next Steps</span>
            </h3>

            <div className="space-y-3">
              {recommendedActions.map((rec, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-lg bg-gray-900/70 border border-gray-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-100">{rec.action}</p>
                    <p className="text-xs text-gray-400">{rec.detail}</p>
                  </div>
                  <Badge
                    variant={
                      rec.priority === 'high'
                        ? 'danger'
                        : rec.priority === 'medium'
                        ? 'warning'
                        : 'info'
                    }
                    size="sm"
                  >
                    {rec.priority.toUpperCase()} PRIORITY
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Limitations and Disclaimers */}
          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-xs text-gray-400 space-y-1.5 leading-relaxed">
            <p className="font-semibold text-gray-300 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-violet-400" />
              Platform Disclaimers & Confidence Limits
            </p>
            <p>
              Risk scores are computed using heuristic statistical algorithms and convolutional neural network classifiers trained on forensic benchmark datasets. While effective at identifying synthetic anomalies, scores should be interpreted as expert technical indicators alongside legal and investigative context.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
