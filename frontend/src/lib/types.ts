export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UploadedFile {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  sha256_hash: string;
  file_type: 'image' | 'video' | 'audio' | 'document' | 'identity';
  created_at: string;
}

export interface VerificationRequest {
  id: string;
  file_id: string;
  file: UploadedFile;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  engines_requested: string[];
  created_at: string;
  completed_at: string | null;
  engine_results: EngineResult[];
  risk_assessment: RiskAssessment | null;
}

export interface EngineResult {
  id: string;
  engine_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  findings: Finding[];
  confidence: number | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  data?: Record<string, any>;
}

export interface Finding {
  code: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string;
  location?: string;
}

export interface RiskAssessment {
  id: string;
  overall_score: number;
  risk_category: 'low_risk' | 'suspicious' | 'unverified' | 'high_risk';
  weights_used: Record<string, number>;
  individual_scores: Record<string, number>;
  explanation: string;
}

export interface TrustGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphNode {
  id: string;
  node_type: string;
  label: string;
  properties: Record<string, any>;
  engine_source: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  evidence: string;
  engine_source: string;
}

export interface DashboardStats {
  total_verifications: number;
  total_files: number;
  risk_distribution: {
    low_risk: number;
    suspicious: number;
    unverified: number;
    high_risk: number;
  };
  recent_verifications: VerificationRequest[];
  engine_stats: Record<string, { total: number; completed: number; failed: number }>;
}

export interface DocumentAnalysisResult {
  file_id: string;
  extracted_text?: string;
  metadata?: {
    author?: string;
    creator?: string;
    creation_date?: string;
    modification_date?: string;
    producer?: string;
    title?: string;
    page_count?: number;
    [key: string]: any;
  };
  font_analysis?: {
    embedded_fonts?: string[];
    anomalous_fonts?: string[];
    is_consistent?: boolean;
    details?: string;
  };
  layout_analysis?: {
    margins_consistent?: boolean;
    alignment_issues?: boolean;
    score?: number;
    details?: string;
  };
  qr_findings?: Array<{
    data: string;
    valid: boolean;
    redirects_to?: string;
  }>;
  digital_signature?: {
    present: boolean;
    valid: boolean;
    signer?: string;
    certificate_issuer?: string;
    timestamp?: string;
  };
  findings: Finding[];
  risk_assessment?: RiskAssessment;
}

export interface MediaAnalysisResult {
  file_id: string;
  media_type: 'image' | 'video' | 'audio';
  ela_image_url?: string;
  metadata?: Record<string, any>;
  hashes?: {
    md5: string;
    sha256: string;
    phash?: string;
    dhash?: string;
  };
  fingerprint?: string;
  keyframes?: string[];
  temporal_analysis?: {
    frame_rate?: number;
    drop_frames?: number;
    inconsistencies?: string[];
  };
  spectrogram_url?: string;
  frequency_analysis?: {
    synthetic_markers_detected?: boolean;
    pitch_anomalies?: string[];
    voice_cloned_probability?: number;
  };
  findings: Finding[];
}

export interface IdentityAnalysisResult {
  file_id: string;
  extracted_faces?: string[];
  ocr_text?: Record<string, string>;
  document_structure?: {
    type: string;
    mrz_valid?: boolean;
    hologram_detected?: boolean;
    barcode_matched?: boolean;
  };
  consistency_checks?: Array<{
    field: string;
    status: 'pass' | 'fail' | 'warn';
    detail: string;
  }>;
  findings: Finding[];
}

export interface SourceComparisonResult {
  similarity_score: number;
  hash_matches: boolean;
  metadata_diff: Record<string, { file1: any; file2: any }>;
  content_diff_summary: string;
  relationship: string;
}
