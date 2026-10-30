import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('beyondproof_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Add response error interceptor for 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('beyondproof_token');
      // Only redirect if not already on login or register pages
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register') && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; full_name: string }) =>
    api.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  getProfile: () => api.get('/api/auth/me'),
  updateProfile: (data: { full_name?: string; password?: string }) => api.put('/api/auth/me', data),
};

// Files API
export const filesAPI = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  get: (fileId: string) => api.get(`/api/files/${fileId}`),
  list: () => api.get('/api/files'),
  delete: (fileId: string) => api.delete(`/api/files/${fileId}`),
};

// Verification API
export const verificationAPI = {
  create: (data: { file_id: string; engines?: string[] }) =>
    api.post('/api/verification/create', data),
  get: (id: string) => api.get(`/api/verification/${id}`),
  history: () => api.get('/api/verification/history'),
  stats: () => api.get('/api/verification/dashboard/stats'),
  downloadReport: (id: string) =>
    api.get(`/api/verification/${id}/report`, { responseType: 'blob' }),
};

// Engine APIs
export const engineAPI = {
  analyzeDocument: (data: { file_id: string }) => api.post('/api/document/analyze', data),
  analyzeImage: (data: { file_id: string }) => api.post('/api/media/image/analyze', data),
  analyzeVideo: (data: { file_id: string }) => api.post('/api/media/video/analyze', data),
  analyzeAudio: (data: { file_id: string }) => api.post('/api/media/audio/analyze', data),
  analyzeIdentity: (data: { file_id: string }) => api.post('/api/identity/analyze', data),
  getSourceHistory: (query: string) => api.get(`/api/source/history/${encodeURIComponent(query)}`),
  compareFiles: (data: { file_id_1: string; file_id_2: string }) => api.post('/api/source/compare', data),
  getGraph: (verificationId: string) => api.get(`/api/graph/${verificationId}`),
  getRisk: (verificationId: string) => api.get(`/api/risk/${verificationId}/assessment`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getUsers: () => api.get('/api/admin/users'),
  getActivity: () => api.get('/api/admin/activity'),
  getEngines: () => api.get('/api/admin/engines'),
};

// Investigation & Analysis API (matches suggested starter integration)
export const investigationAPI = {
  list: (params?: { skip?: number; limit?: number }) => api.get('/api/investigations', { params }),
  create: (data: { file_id: string; engines?: string[] }) => api.post('/api/investigations', data),
  get: (id: string) => api.get(`/api/investigations/${id}`),
};

export const analysisAPI = {
  start: (id: string) => api.post(`/api/analysis/${id}/start`),
  getStatus: (id: string) => api.get(`/api/analysis/${id}/status`),
  getResults: (id: string) => api.get(`/api/analysis/${id}/results`),
  getTrustGraph: (id: string) => api.get(`/api/trust-graph/${id}`),
  generateReport: (id: string) =>
    api.get(`/api/reports/${id}/generate`, { responseType: 'blob' }),
};
