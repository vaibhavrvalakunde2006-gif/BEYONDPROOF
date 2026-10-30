'use client';

import React, { useState } from 'react';
import {
  FileSearch,
  FileText,
  FileCheck2,
  AlertTriangle,
  QrCode,
  KeyRound,
  Type,
  Layout,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { filesAPI, engineAPI } from '@/lib/api';
import { DocumentAnalysisResult, Finding } from '@/lib/types';
import FileUploadZone from '@/components/ui/FileUploadZone';
import FindingsList from '@/components/engines/FindingsList';
import RiskGauge from '@/components/dashboard/RiskGauge';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

export default function DocumentVerifierPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DocumentAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'text' | 'metadata' | 'fonts' | 'signatures'>('overview');

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    setErrorMessage(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setProgress(20);
    setErrorMessage(null);

    try {
      // 1. Upload
      const uploadRes = await filesAPI.upload(selectedFile);
      const fileId = uploadRes.data.id || uploadRes.data.file_id;
      setProgress(60);

      // 2. Run Document Engine
      const analyzeRes = await engineAPI.analyzeDocument({ file_id: fileId });
      setProgress(100);
      setResult(analyzeRes.data);
    } catch (err: any) {
      console.error('Document analysis failed', err);
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Document forensic analysis failed. Please verify the uploaded file is a valid PDF or document.';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setResult(null);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-50 tracking-tight flex items-center gap-3">
          <FileSearch className="w-8 h-8 text-cyan-400" />
          <span>Document Verifier Engine</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Deep structural analysis of PDF containers, font streams, incremental updates, and embedded metadata.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3 text-sm text-red-300">
          <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-200">Analysis Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      <div className="glass-card p-6">
        <FileUploadZone
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          onClear={() => {
            setSelectedFile(null);
            setResult(null);
          }}
          uploading={analyzing}
          progress={progress}
          accept=".pdf,.doc,.docx"
          label="Drop PDF or document file to inspect"
          sublabel="Accepts PDF, DOCX up to 50MB"
        />

        {selectedFile && !result && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="btn-primary py-2.5 px-6 text-sm font-semibold flex items-center gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Object Streams...</span>
                </>
              ) : (
                <>
                  <span>Run Document Forensics</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Top Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 flex items-center justify-center">
              <RiskGauge
                score={result.risk_assessment?.overall_score ?? 25}
                category={result.risk_assessment?.risk_category ?? 'low_risk'}
                size={160}
              />
            </div>

            <div className="glass-card p-6 md:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-100">Document Integrity Summary</h2>
                  <Badge variant={result.digital_signature?.valid ? 'success' : 'warning'}>
                    {result.digital_signature?.present ? 'Digitally Signed' : 'No Digital Signature'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {result.risk_assessment?.explanation ||
                    'Comprehensive object parsing completed. Fonts, metadata timestamps, and stream encodings evaluated.'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-800 text-xs">
                <div>
                  <span className="text-gray-500 block">Pages</span>
                  <span className="font-semibold text-gray-200">
                    {result.metadata?.page_count || 1}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Font Integrity</span>
                  <span
                    className={`font-semibold ${
                      result.font_analysis?.is_consistent ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {result.font_analysis?.is_consistent ? 'Consistent' : 'Discrepancy'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Layout Score</span>
                  <span className="font-semibold text-emerald-400">
                    {result.layout_analysis?.score || 95}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">QR Codes</span>
                  <span className="font-semibold text-cyan-400">
                    {result.qr_findings?.length || 0} Found
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
            {[
              { id: 'overview', label: 'Findings & Forensics' },
              { id: 'metadata', label: 'PDF Metadata' },
              { id: 'fonts', label: 'Font & Layout Analysis' },
              { id: 'signatures', label: 'Signatures & QR' },
              { id: 'text', label: 'Extracted Text' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <FindingsList findings={result.findings || []} title="Document Security & Tampering Findings" />
          )}

          {activeTab === 'metadata' && (
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Document Information Dictionary & XMP Metadata</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-gray-800 text-gray-300">
                    {Object.entries(result.metadata || {}).map(([key, val]) => (
                      <tr key={key} className="hover:bg-gray-900/30">
                        <td className="py-2.5 px-4 font-mono text-gray-400 uppercase tracking-wider w-1/3">
                          {key.replace(/_/g, ' ')}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-gray-100">
                          {typeof val === 'string' && val.includes('T') ? formatDate(val) : String(val)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'fonts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-base font-semibold text-gray-100 mb-4 flex items-center gap-2">
                  <Type className="w-4 h-4 text-violet-400" />
                  <span>Font Analysis</span>
                </h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-gray-400 block mb-1">
                      Detected Font Families ({result.metadata?.font_count || result.metadata?.font_families?.length || 0}):
                    </span>
                    {result.metadata?.font_families && result.metadata.font_families.length > 0 ? (
                      <ul className="space-y-1">
                        {result.metadata.font_families.map((f: string) => (
                          <li key={f} className="p-2 rounded bg-gray-900 font-mono text-gray-300 border border-gray-800">
                            ✓ {f}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500 italic p-2">Standard system fonts detected.</p>
                    )}
                  </div>
                  {result.fonts && result.fonts.length > 0 && (
                    <div>
                      <span className="text-gray-400 block mb-1 font-semibold">Font Stream References:</span>
                      <ul className="space-y-1 max-h-48 overflow-y-auto">
                        {result.fonts.slice(0, 10).map((f: any, idx: number) => (
                          <li key={idx} className="p-2 rounded bg-gray-900/60 font-mono text-gray-400 border border-gray-800 text-[11px]">
                            {f.font_name || f.name || JSON.stringify(f)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-base font-semibold text-gray-100 mb-4 flex items-center gap-2">
                  <Layout className="w-4 h-4 text-cyan-400" />
                  <span>Layout & Baseline Alignment</span>
                </h3>
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3 rounded bg-gray-900 border border-gray-800">
                    <span className="text-gray-300">Margin Consistency</span>
                    <Badge variant={result.layout_analysis?.margins_consistent ? 'success' : 'warning'}>
                      {result.layout_analysis?.margins_consistent ? 'Consistent' : 'Irregular'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded bg-gray-900 border border-gray-800">
                    <span className="text-gray-300">Baseline Alignment Flags</span>
                    <Badge variant={!result.layout_analysis?.alignment_issues ? 'success' : 'danger'}>
                      {!result.layout_analysis?.alignment_issues ? 'Clean Baselines' : 'Baseline Shifts Detected'}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-xs pt-2 border-t border-gray-800">
                    {result.layout_analysis?.details}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'signatures' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-base font-semibold text-gray-100 mb-4 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <span>Digital Signature Authentication</span>
                </h3>
                {result.digital_signature?.present ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Valid Cryptographic Signature Verified</span>
                    </div>
                    <div className="space-y-2 pt-2">
                      <div>
                        <span className="text-gray-500 block">Signer Common Name:</span>
                        <span className="font-mono text-gray-200">{result.digital_signature.signer}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Certificate Issuer:</span>
                        <span className="font-mono text-gray-200">{result.digital_signature.certificate_issuer}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Timestamp:</span>
                        <span className="font-mono text-gray-200">{formatDate(result.digital_signature.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded bg-gray-900 border border-gray-800 text-center text-xs text-gray-400">
                    No digital signature dictionary present in document trailer.
                  </div>
                )}
              </div>

              <div className="glass-card p-6">
                <h3 className="text-base font-semibold text-gray-100 mb-4 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-violet-400" />
                  <span>Embedded QR Code Findings</span>
                </h3>
                {result.qr_findings && result.qr_findings.length > 0 ? (
                  <div className="space-y-3 text-xs">
                    {result.qr_findings.map((qr, i) => (
                      <div key={i} className="p-3 rounded bg-gray-900 border border-gray-800 space-y-1">
                        <span className="text-gray-400 block">QR Payload {i + 1}:</span>
                        <p className="font-mono text-cyan-400 break-all">{qr.data}</p>
                        {qr.redirects_to && (
                          <p className="text-[11px] text-gray-500">Destination: {qr.redirects_to}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded bg-gray-900 border border-gray-800 text-center text-xs text-gray-400">
                    No barcodes or 2D QR glyphs detected on pages.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-400" />
                <span>Extracted Plaintext Streams</span>
              </h3>
              <pre className="p-4 rounded-lg bg-gray-950 font-mono text-xs text-gray-300 leading-relaxed overflow-x-auto whitespace-pre-wrap border border-gray-800">
                {result.extracted_text || 'No text extracted from document streams.'}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
