import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getRiskColor(category: string | undefined): string {
  switch (category) {
    case 'low_risk':
      return 'text-emerald-400';
    case 'suspicious':
      return 'text-amber-400';
    case 'high_risk':
      return 'text-red-400';
    case 'unverified':
      return 'text-gray-400';
    default:
      return 'text-gray-400';
  }
}

export function getRiskBgColor(category: string | undefined): string {
  switch (category) {
    case 'low_risk':
      return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    case 'suspicious':
      return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    case 'high_risk':
      return 'bg-red-500/10 border-red-500/20 text-red-400';
    case 'unverified':
      return 'bg-gray-500/10 border-gray-500/20 text-gray-400';
    default:
      return 'bg-gray-500/10 border-gray-500/20 text-gray-400';
  }
}

export function getRiskLabel(category: string | undefined): string {
  switch (category) {
    case 'low_risk':
      return 'Low Risk';
    case 'suspicious':
      return 'Suspicious';
    case 'high_risk':
      return 'High Risk';
    case 'unverified':
      return 'Unverified';
    default:
      return 'Unknown';
  }
}

export function getSeverityColor(severity: string | undefined): string {
  switch (severity) {
    case 'info':
      return 'text-blue-400';
    case 'low':
      return 'text-emerald-400';
    case 'medium':
      return 'text-amber-400';
    case 'high':
      return 'text-orange-400';
    case 'critical':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

export function getSeverityBadgeClass(severity: string | undefined): string {
  switch (severity) {
    case 'info':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'low':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'medium':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'high':
      return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    case 'critical':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
}
