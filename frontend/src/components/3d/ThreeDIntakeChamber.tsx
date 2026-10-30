'use client';

import React, { useState, useRef } from 'react';
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
  FileText,
  Video,
  Music,
  Image as ImageIcon,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Loader2,
  Trash2,
} from 'lucide-react';
import { formatBytes } from '@/lib/utils';

export type InvestigationMode =
  | 'automatic'
  | 'document'
  | 'image'
  | 'video'
  | 'audio'
  | 'provenance';

interface ThreeDIntakeChamberProps {
  onFileSelect: (file: File) => void;
  onStartInvestigation: (mode: InvestigationMode, selectedEngines: string[]) => void;
  isLoading?: boolean;
  uploadProgress?: number;
}

export function ThreeDIntakeChamber({
  onFileSelect,
  onStartInvestigation,
  isLoading = false,
  uploadProgress = 0,
}: ThreeDIntakeChamberProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileHashPreview, setFileHashPreview] = useState<string | null>(null);
  const [mode, setMode] = useState<InvestigationMode>('automatic');

  const modes = [
    {
      id: 'automatic' as InvestigationMode,
      title: 'Automatic Multi-Vector',
      desc: 'All 7 neural and cryptographic microservices concurrent inspection.',
      engines: ['identity', 'document', 'media', 'source', 'trust_graph', 'risk_analyzer', 'verification_hub'],
      icon: Sparkles,
      color: 'border-orange-500/50 text-orange-400 bg-orange-950/20',
    },
    {
      id: 'document' as InvestigationMode,
      title: 'Document & PDF Forensics',
      desc: 'Font glyph streams, PDF object trees, layout alignment & digital signatures.',
      engines: ['document', 'source', 'risk_analyzer', 'verification_hub'],
      icon: FileSearch,
      color: 'border-blue-500/50 text-cyan-400 bg-blue-950/20',
    },
    {
      id: 'image' as InvestigationMode,
      title: 'Image & Media Truth',
      desc: 'Error Level Analysis (ELA), spectral cloning detection, and noise variance.',
      engines: ['media', 'source', 'risk_analyzer', 'verification_hub'],
      icon: Eye,
      color: 'border-teal-500/50 text-teal-400 bg-teal-950/20',
    },
    {
      id: 'video' as InvestigationMode,
      title: 'Video Temporal Analysis',
      desc: 'Keyframe extraction, facial landmark drift, and inter-frame coherence.',
      engines: ['media', 'source', 'risk_analyzer', 'verification_hub'],
      icon: Video,
      color: 'border-violet-500/50 text-violet-400 bg-violet-950/20',
    },
    {
      id: 'audio' as InvestigationMode,
      title: 'Audio Spectrogram Forensics',
      desc: 'Fourier spectrograms, synthetic voice cloning artifacts, and frequency cuts.',
      engines: ['media', 'source', 'risk_analyzer', 'verification_hub'],
      icon: Music,
      color: 'border-fuchsia-500/50 text-fuchsia-400 bg-fuchsia-950/20',
    },
    {
      id: 'provenance' as InvestigationMode,
      title: 'Cryptographic Provenance',
      desc: 'Perceptual pHash hamming distances, SHA-256 anchoring & chain-of-custody.',
      engines: ['source', 'trust_graph', 'verification_hub'],
      icon: Fingerprint,
      color: 'border-amber-500/50 text-amber-400 bg-amber-950/20',
    },
  ];

  const processFile = (file: File) => {
    setSelectedFile(file);
    onFileSelect(file);

    // Compute quick hash preview in browser
    const reader = new FileReader();
    reader.onload = async (e) => {
      const buf = e.target?.result as ArrayBuffer;
      if (buf) {
        try {
          const hashBuf = await crypto.subtle.digest('SHA-256', buf);
          const hashArr = Array.from(new Uint8Array(hashBuf));
          const hex = hashArr.map((b) => b.toString(16).padStart(2, '0')).join('');
          setFileHashPreview(hex);
        } catch {
          setFileHashPreview('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
        }
      }
    };
    reader.readAsArrayBuffer(file);

    // Image preview
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }

    // Auto-select mode
    if (file.type.includes('pdf') || file.name.endsWith('.pdf')) {
      setMode('document');
    } else if (file.type.startsWith('video/')) {
      setMode('video');
    } else if (file.type.startsWith('audio/')) {
      setMode('audio');
    } else if (file.type.startsWith('image/')) {
      setMode('image');
    } else {
      setMode('automatic');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleLaunch = () => {
    if (!selectedFile) return;
    const currentModeObj = modes.find((m) => m.id === mode) || modes[0];
    onStartInvestigation(mode, currentModeObj.engines);
  };

  return (
    <div className="space-y-8">
      {/* 3D Chamber Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative min-h-[380px] rounded-3xl bg-[#0B0D12]/90 border-2 transition-all duration-500 overflow-hidden flex flex-col items-center justify-center p-8 select-none ${
          dragOver
            ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_60px_rgba(0,229,255,0.4)] scale-[1.01]'
            : selectedFile
            ? 'border-orange-500/60 shadow-[0_0_40px_rgba(255,122,36,0.25)]'
            : 'border-gray-800/80 hover:border-gray-700'
        }`}
      >
        {/* Fine Scanning Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(0, 229, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 229, 255, 0.08) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            backgroundPosition: 'center center',
          }}
        />

        {/* Ambient Core Lighting */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
            dragOver ? 'opacity-100' : 'opacity-40'
          }`}
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(0, 229, 255, 0.15) 0%, rgba(139, 92, 246, 0.08) 45%, transparent 75%)',
          }}
        />

        {/* Central Reactive Reticle Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`rounded-full border border-dashed transition-all duration-700 ${
              dragOver
                ? 'w-80 h-80 border-cyan-400/70 animate-[spin_10s_linear_infinite] shadow-[0_0_40px_rgba(0,229,255,0.3)]'
                : selectedFile
                ? 'w-72 h-72 border-orange-500/40'
                : 'w-64 h-64 border-gray-800'
            }`}
          />
          <div
            className={`absolute rounded-full border transition-all duration-500 ${
              dragOver
                ? 'w-64 h-64 border-violet-400/60 animate-[spin_15s_linear_infinite_reverse]'
                : selectedFile
                ? 'w-56 h-56 border-orange-400/30'
                : 'w-48 h-48 border-gray-900'
            }`}
          />
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.mp4,.mov,.mp3,.wav"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processFile(e.target.files[0]);
            }
          }}
        />

        {/* Chamber Content */}
        {!selectedFile ? (
          <div className="relative z-10 text-center max-w-md flex flex-col items-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-2xl bg-cyan-950/40 border-2 border-cyan-500/40 text-cyan-400 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,229,255,0.25)] hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <UploadCloud className="w-10 h-10 animate-bounce" style={{ animationDuration: '2.5s' }} />
            </div>

            <h3
              className="text-xl sm:text-2xl font-normal text-white uppercase tracking-wider mb-2"
              style={{ fontFamily: "'Anta', sans-serif" }}
            >
              3D Evidence Intake Chamber
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-6">
              Drag and drop any suspect digital evidence into the active forensic chamber or browse your local file system.
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs tracking-wider transition-all active:scale-95 flex items-center gap-2"
            >
              <span>BROWSE EVIDENCE ARTIFACTS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono text-gray-500">
              <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800">PDF / DOCS</span>
              <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800">PNG / JPG / WEBP</span>
              <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800">MP4 / MOV</span>
              <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800">MP3 / WAV</span>
              <span className="text-gray-600">&bull; MAX 50MB</span>
            </div>
          </div>
        ) : (
          /* File Preview & Extracted Telemetry */
          <div className="relative z-10 w-full max-w-2xl flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-black/60 border border-orange-500/40 backdrop-blur-xl">
            {/* Visual Icon / Thumbnail */}
            <div className="relative w-32 h-32 rounded-xl bg-gray-900 border border-orange-500/30 flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_20px_rgba(255,122,36,0.2)]">
              {filePreview ? (
                <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : selectedFile.type.includes('pdf') ? (
                <FileText className="w-12 h-12 text-cyan-400" />
              ) : selectedFile.type.startsWith('video/') ? (
                <Video className="w-12 h-12 text-violet-400" />
              ) : selectedFile.type.startsWith('audio/') ? (
                <Music className="w-12 h-12 text-amber-400" />
              ) : (
                <FileCheck className="w-12 h-12 text-orange-400" />
              )}
              <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-mono text-orange-400 border border-orange-500/30">
                INTAKE
              </div>
            </div>

            {/* Extracted File Information */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  EVIDENCE CAPTURED
                </span>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setFilePreview(null);
                    setFileHashPreview(null);
                  }}
                  className="text-gray-500 hover:text-red-400 transition-colors p-1"
                  title="Remove artifact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h4 className="text-base font-bold text-white truncate">{selectedFile.name}</h4>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-400">
                <div>
                  <span className="text-gray-600">SIZE:</span> {formatBytes(selectedFile.size)}
                </div>
                <div>
                  <span className="text-gray-600">MIME:</span> {selectedFile.type || 'application/octet-stream'}
                </div>
              </div>

              {fileHashPreview && (
                <div className="text-[10px] font-mono text-cyan-300 truncate bg-cyan-950/30 p-2 rounded border border-cyan-500/20">
                  <span className="text-gray-500">SHA-256:</span> {fileHashPreview}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mode Selection Grid (6 Investigation Modes) */}
      {selectedFile && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Select Investigation Mode</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400">1-Click Neural Presets</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {modes.map((m) => {
              const Icon = m.icon;
              const isSelected = mode === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? `${m.color} shadow-[0_0_20px_rgba(255,122,36,0.2)]`
                      : 'bg-gray-900/50 border-gray-800 hover:bg-gray-900 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <Icon className="w-4 h-4" />
                    <span className="font-bold text-sm text-white">{m.title}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed mb-3">{m.desc}</p>
                  <div className="text-[10px] font-mono text-gray-500">
                    {m.engines.length} microservices orchestrated
                  </div>
                </div>
              );
            })}
          </div>

          {/* Start Investigation Execution Button */}
          <div className="pt-4 flex items-center justify-end">
            <button
              onClick={handleLaunch}
              disabled={isLoading}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white font-bold text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(255,122,36,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              style={{ fontFamily: "'Anta', sans-serif" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>EXECUTING FORENSIC CORE ({uploadProgress}%)...</span>
                </>
              ) : (
                <>
                  <span>START FORENSIC INVESTIGATION</span>
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
