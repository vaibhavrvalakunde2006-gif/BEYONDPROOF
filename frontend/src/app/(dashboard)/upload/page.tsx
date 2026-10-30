'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  FileCheck,
  Shield,
  FileSearch,
  Eye,
  Fingerprint,
  Network,
  Brain,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Info,
} from 'lucide-react';
import { filesAPI, verificationAPI } from '@/lib/api';
import FileUploadZone from '@/components/ui/FileUploadZone';
import { formatBytes } from '@/lib/utils';

export default function UploadCentrePage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available engines
  const allEngines = [
    { id: 'identity', name: 'Identity Guardian', icon: Shield, desc: 'Facial liveness, MRZ & ID anomaly detection', defaultFor: ['image'] },
    { id: 'document', name: 'Document Verifier', icon: FileSearch, desc: 'Font forensics, layout tampering, signatures', defaultFor: ['document'] },
    { id: 'media', name: 'Media Truth / AFTERIMAGE', icon: Eye, desc: 'ELA, keyframes, spectrogram synthesis', defaultFor: ['image', 'video', 'audio'] },
    { id: 'source', name: 'Source Tracker', icon: Fingerprint, desc: 'Perceptual hashing, provenance matching', defaultFor: ['image', 'video', 'audio', 'document'] },
    { id: 'trust_graph', name: 'Trust Graph', icon: Network, desc: 'Entity-relationship correlation network', defaultFor: ['all'] },
    { id: 'risk_analyzer', name: 'AI Risk Analyzer', icon: Brain, desc: 'Multi-engine weighted risk calculation', defaultFor: ['all'] },
    { id: 'verification_hub', name: 'Verification Hub', icon: CheckCircle, desc: 'Audit trail logging and certification', defaultFor: ['all'] },
  ];

  const [selectedEngines, setSelectedEngines] = useState<string[]>([
    'identity',
    'document',
    'media',
    'source',
    'trust_graph',
    'risk_analyzer',
    'verification_hub',
  ]);

  const detectFileType = (file: File): 'image' | 'video' | 'audio' | 'document' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.includes('pdf') || file.type.includes('word') || file.name.endsWith('.pdf') || file.name.endsWith('.docx')) {
      return 'document';
    }
    return 'other';
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);

    // Auto-select relevant engines
    const type = detectFileType(file);
    const relevant = allEngines
      .filter((e) => e.defaultFor.includes('all') || e.defaultFor.includes(type))
      .map((e) => e.id);
    setSelectedEngines(relevant);
  };

  const toggleEngine = (id: string) => {
    setSelectedEngines((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleStartVerification = async () => {
    if (!selectedFile) return;
    if (selectedEngines.length === 0) {
      setErrorMessage('Please select at least one verification engine to run.');
      return;
    }

    setUploading(true);
    setProgress(15);
    setErrorMessage(null);

    try {
      // 1. Upload File
      setProgress(40);
      const uploadRes = await filesAPI.upload(selectedFile);
      const uploadedData = uploadRes.data;
      const fileId = uploadedData.id || uploadedData.file_id;

      setProgress(75);

      // 2. Create Verification Request
      const verificationRes = await verificationAPI.create({
        file_id: fileId,
        engines: selectedEngines,
      });

      setProgress(100);
      const verificationId = verificationRes.data.id || verificationRes.data.verification_id;

      // 3. Redirect to Detailed Report
      router.push(`/verification/${verificationId}`);
    } catch (err: any) {
      console.error('Upload or verification initiation failed', err);
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Failed to process file and initiate verification. Ensure the backend server is reachable.';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-50 tracking-tight">
          Forensic Upload & Inspection Centre
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Ingest target media or documents into the multi-engine forensic pipeline for autonomous analysis.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3 text-sm text-red-300">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-200">Execution Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Upload Area */}
      <div className="glass-card p-6 sm:p-8">
        <FileUploadZone
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          onClear={() => {
            setSelectedFile(null);
            setProgress(0);
          }}
          uploading={uploading}
          progress={progress}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          label="Drag & drop evidence artifact here, or click to browse"
          sublabel="Supports PDF, Images (PNG, JPG, WEBP), Audio (WAV, MP3), and Video (MP4, MKV) up to 100MB"
        />

        {/* Supported Types & Size Info */}
        <div className="mt-6 pt-6 border-t border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-400" />
            <span>Hashing: Instant SHA-256</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Max File Size: 100MB</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Zero-Knowledge Pipeline</span>
          </div>
        </div>
      </div>

      {/* Engine Selection (Visible once file is selected) */}
      {selectedFile && (
        <div className="glass-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-100">Configure Analysis Pipeline</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Target engines automatically selected for {detectFileType(selectedFile).toUpperCase()} artifact
              </p>
            </div>
            <div className="text-xs font-mono text-gray-400">
              {selectedEngines.length} / {allEngines.length} Engines Armed
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {allEngines.map((engine) => {
              const Icon = engine.icon;
              const isChecked = selectedEngines.includes(engine.id);

              return (
                <div
                  key={engine.id}
                  onClick={() => !uploading && toggleEngine(engine.id)}
                  className={`p-4 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-3.5 ${
                    isChecked
                      ? 'bg-violet-950/20 border-violet-500/40 shadow-sm'
                      : 'bg-gray-900/40 border-gray-800 hover:border-gray-700 opacity-60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    disabled={uploading}
                    className="mt-1 h-4 w-4 rounded border-gray-700 text-violet-600 focus:ring-violet-500 bg-gray-900"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-violet-400" />
                      <span className="text-sm font-semibold text-gray-100">{engine.name}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 leading-snug">{engine.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-400 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Results will automatically generate a tamper-evident audit report.</span>
            </div>

            <button
              onClick={handleStartVerification}
              disabled={uploading || selectedEngines.length === 0}
              className="btn-primary w-full sm:w-auto px-8 py-3 text-sm font-semibold flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executing Pipeline ({progress}%)...</span>
                </>
              ) : (
                <>
                  <span>Start Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
