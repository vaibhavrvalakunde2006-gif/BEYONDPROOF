'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, File as FileIcon, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatBytes, cn } from '@/lib/utils';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeBytes?: number;
  selectedFile?: File | null;
  onClear?: () => void;
  uploading?: boolean;
  progress?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

export default function FileUploadZone({
  onFileSelect,
  accept,
  maxSizeBytes = 100 * 1024 * 1024, // 100MB default
  selectedFile,
  onClear,
  uploading = false,
  progress = 0,
  label = 'Drag & drop your file here, or browse',
  sublabel = 'Supports images, documents, audio, and video files up to 100MB',
  className,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = (file: File) => {
    setError(null);
    if (maxSizeBytes && file.size > maxSizeBytes) {
      setError(`File size exceeds limit (${formatBytes(maxSizeBytes)})`);
      return;
    }
    if (accept) {
      const allowedTypes = accept.split(',').map((t) => t.trim().toLowerCase());
      const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
      const matches = allowedTypes.some((type) => {
        if (type.startsWith('.')) {
          return fileExt === type;
        }
        if (type.endsWith('/*')) {
          const base = type.replace('/*', '');
          return file.type.startsWith(base);
        }
        return file.type === type;
      });
      if (!matches) {
        setError(`File type not supported. Accepted types: ${accept}`);
        return;
      }
    }
    onFileSelect(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('w-full', className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept={accept}
        className="hidden"
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerSelect}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center',
            isDragging
              ? 'border-violet-500 bg-violet-950/20 shadow-lg shadow-violet-500/10 scale-[1.01]'
              : 'border-gray-800 bg-gray-900/30 hover:border-gray-700 hover:bg-gray-900/50'
          )}
        >
          <div className="w-14 h-14 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4 transition-transform group-hover:scale-110">
            <UploadCloud className="w-7 h-7" />
          </div>
          <p className="text-base font-semibold text-gray-200 mb-1">{label}</p>
          <p className="text-xs text-gray-400 max-w-sm mb-4">{sublabel}</p>
          <button
            type="button"
            className="btn-secondary text-xs px-4 py-2 pointer-events-none"
          >
            Browse Files
          </button>
        </div>
      ) : (
        <div className="glass-card p-5 border-violet-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 flex-shrink-0">
                <FileIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-100 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-400">
                  {formatBytes(selectedFile.size)} • {selectedFile.type || 'Unknown MIME'}
                </p>
              </div>
            </div>
            {!uploading && onClear && (
              <button
                type="button"
                onClick={onClear}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {uploading && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5 font-medium">
                <span className="flex items-center gap-1.5 text-violet-400">
                  Uploading and hashing...
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-950/20 border border-red-500/20 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
