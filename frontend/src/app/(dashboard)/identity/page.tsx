'use client';

import React, { useState } from 'react';
import {
  Shield,
  UserCheck,
  CreditCard,
  Scan,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { filesAPI, engineAPI } from '@/lib/api';
import { IdentityAnalysisResult, Finding } from '@/lib/types';
import FileUploadZone from '@/components/ui/FileUploadZone';
import FindingsList from '@/components/engines/FindingsList';
import Badge from '@/components/ui/Badge';

export default function IdentityGuardianPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<IdentityAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      // 2. Identity Engine
      const analyzeRes = await engineAPI.analyzeIdentity({ file_id: fileId });
      setProgress(100);
      const data = analyzeRes.data;
      const normalized = {
        file_id: fileId,
        face_detected: data.face_detected,
        face_count: data.face_count || 0,
        structure_valid: data.structure_valid,
        extracted_fields: data.extracted_fields || {},
        ocr_text: data.extracted_fields || {},
        findings: data.findings || [],
        confidence: data.confidence,
        status: data.status,
      };
      setResult(normalized);
    } catch (err: any) {
      console.error('Identity engine API error', err);
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Identity analysis failed. Please verify the file is an image or identity document.';
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
          <Shield className="w-8 h-8 text-violet-400" />
          <span>Identity Guardian Engine</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Biometric face extraction, ICAO 9303 MRZ verification, synthetic face detection, and ID document forensics.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3 text-sm text-red-300">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-200">Identity Analysis Error</p>
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
          accept="image/*,.pdf"
          label="Upload Identity Document (Passport, Driver License, National ID)"
          sublabel="Accepts High-res Images (PNG, JPG) or PDF scans up to 50MB"
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
                  <span>Verifying MRZ & Biometrics...</span>
                </>
              ) : (
                <>
                  <span>Run Identity Guardian</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          {/* Top Overview: Face & Structure */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Extracted Face */}
            <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-4 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-violet-400" />
                <span>Biometric Portrait Detection</span>
              </h3>

              <div className="w-32 h-40 rounded-xl bg-gray-950 border-2 border-violet-500/40 overflow-hidden flex flex-col items-center justify-center mb-3 shadow-lg shadow-violet-500/10">
                {result.face_detected ? (
                  <div className="text-center p-3">
                    <UserCheck className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                    <span className="text-xs font-mono font-bold text-gray-200">Face Detected</span>
                  </div>
                ) : (
                  <div className="text-center p-3">
                    <UserCheck className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <span className="text-[11px] font-mono text-gray-500">No Portrait Located</span>
                  </div>
                )}
              </div>

              <span
                className={`cyber-badge ${
                  result.face_detected
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {result.face_detected ? `${result.face_count} Face(s) Found` : 'No Faces Detected'}
              </span>
            </div>

            {/* Document Security Structure */}
            <div className="glass-card p-6 md:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-cyan-400" />
                    <span>Document Architecture & Security Features</span>
                  </h3>
                  <Badge variant={result.structure_valid ? 'success' : 'warning'}>
                    {result.structure_valid ? 'Standard ID Geometry' : 'Non-Standard Geometry'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                  <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                    <span className="text-gray-400 text-xs block">Biometric Faces:</span>
                    <span
                      className={`font-semibold text-sm ${
                        result.face_detected ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {result.face_detected ? `${result.face_count} Detected` : 'None'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                    <span className="text-gray-400 text-xs block">Physical Aspect Ratio:</span>
                    <span className={`font-semibold text-sm ${result.structure_valid ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {result.structure_valid ? 'ISO ID-1 / ID-3' : 'Custom Ratio'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                    <span className="text-gray-400 text-xs block">Extracted Fields:</span>
                    <span className="font-semibold text-sm text-cyan-400">
                      {Object.keys(result.extracted_fields || {}).length} Fields
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800 text-xs text-gray-400">
                Tamper Status:{' '}
                <span
                  className={
                    result.findings?.length > 0
                      ? 'text-amber-400 font-semibold'
                      : 'text-emerald-400 font-semibold'
                  }
                >
                  {result.findings?.length > 0
                    ? `${result.findings.length} Forensic Finding(s) Logged`
                    : 'Clean — No Anomaly Flags'}
                </span>
              </div>
            </div>
          </div>

          {/* Consistency Checks */}
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-gray-100 mb-4 flex items-center gap-2">
              <Scan className="w-4 h-4 text-emerald-400" />
              <span>Multi-Zone Consistency Checks</span>
            </h3>

            <div className="space-y-3">
              {result.consistency_checks?.map((check, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-lg bg-gray-900/70 border border-gray-800 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    {check.status === 'pass' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    ) : check.status === 'warn' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-gray-200">{check.field}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{check.detail}</p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      check.status === 'pass'
                        ? 'success'
                        : check.status === 'warn'
                        ? 'warning'
                        : 'danger'
                    }
                    size="sm"
                  >
                    {check.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* OCR Field Extraction */}
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-gray-100 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-violet-400" />
              <span>Extracted OCR & MRZ Fields</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(result.ocr_text || {}).map(([key, val]) => (
                <div key={key} className="p-3 rounded bg-gray-900/80 border border-gray-800">
                  <span className="text-[10px] text-gray-500 font-mono block uppercase">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono text-xs font-semibold text-gray-200 break-all">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Findings */}
          <FindingsList findings={result.findings || []} title="Identity Document Security Findings" />
        </div>
      )}
    </div>
  );
}
