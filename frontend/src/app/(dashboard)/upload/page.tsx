'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { filesAPI, verificationAPI } from '@/lib/api';
import { ThreeDIntakeChamber, InvestigationMode } from '@/components/3d/ThreeDIntakeChamber';

export default function UploadCentrePage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStartVerification = async (mode: InvestigationMode, engines: string[]) => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(20);
    setErrorMessage(null);

    try {
      // 1. Upload File
      setProgress(45);
      const uploadRes = await filesAPI.upload(selectedFile);
      const uploadedData = uploadRes.data;
      const fileId = uploadedData.id || uploadedData.file_id;

      setProgress(80);

      // 2. Create Verification Request with selected engine set
      const verificationRes = await verificationAPI.create({
        file_id: fileId,
        engines: engines,
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
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Forensic Workspace</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-normal text-white uppercase tracking-wider"
            style={{ fontFamily: "'Anta', sans-serif" }}
          >
            Evidence Intake Chamber
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Ingest target documents, images, video, or audio into the 7-engine multi-vector forensic pipeline.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3 text-sm text-red-300">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-200">Execution Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* 3D Intake Chamber */}
      <ThreeDIntakeChamber
        onFileSelect={(file) => {
          setSelectedFile(file);
          setErrorMessage(null);
        }}
        onStartInvestigation={handleStartVerification}
        isLoading={uploading}
        uploadProgress={progress}
      />
    </div>
  );
}
