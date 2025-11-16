import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: any) =>
    api.post('/auth/register', data),

  logout: () =>
    api.post('/auth/logout'),

  getCurrentUser: () =>
    api.get('/auth/me'),

  updateProfile: (data: any) =>
    api.put('/auth/me', data),
};

// Procurement API
export const procurementAPI = {
  getPublic: (page = 1, limit = 20) =>
    api.get(`/procurement/public?page=${page}&limit=${limit}`),

  getAll: (params?: any) =>
    api.get('/procurement', { params }),

  getById: (id: string) =>
    api.get(`/procurement/${id}`),

  getPublicById: (id: string) =>
    api.get(`/procurement/public/${id}`),

  create: (data: any) =>
    api.post('/procurement', data),

  update: (id: string, data: any) =>
    api.put(`/procurement/${id}`, data),

  delete: (id: string) =>
    api.delete(`/procurement/${id}`),

  getStatistics: () =>
    api.get('/procurement/statistics'),
};

// Document API
export const documentAPI = {
  upload: (formData: FormData) =>
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getMetadata: (id: string) =>
    api.get(`/documents/${id}`),

  download: (id: string) =>
    api.get(`/documents/${id}/download`, { responseType: 'blob' }),

  delete: (id: string) =>
    api.delete(`/documents/${id}`),

  getProcurementDocs: (procurementId: string) =>
    api.get(`/documents/procurement/${procurementId}`),

  getParsedData: (id: string) =>
    api.get(`/documents/${id}/parse`),
};

// Anomaly API
export const anomalyAPI = {
  analyze: (procurementId: string) =>
    api.post(`/analysis/anomaly/${procurementId}`),

  getAll: (params?: any) =>
    api.get('/analysis/anomalies', { params }),

  getById: (id: string) =>
    api.get(`/analysis/anomalies/${id}`),

  resolve: (id: string, data: any) =>
    api.patch(`/analysis/anomalies/${id}/resolve`, data),

  getHighRisk: (minRiskScore = 70, limit = 50) =>
    api.get(`/analysis/anomalies/high-risk?min_risk_score=${minRiskScore}&limit=${limit}`),

  getProcurementAnomalies: (procurementId: string) =>
    api.get(`/analysis/anomalies/procurement/${procurementId}`),

  getStatistics: () =>
    api.get('/analysis/anomalies/statistics'),

  analyzeVendorPatterns: (vendorId: string) =>
    api.post(`/analysis/vendor/${vendorId}/patterns`),
};

// Vendor API
export const vendorAPI = {
  getPublic: (page = 1, limit = 20) =>
    api.get(`/vendors/public?page=${page}&limit=${limit}`),

  getAll: (params?: any) =>
    api.get('/vendors', { params }),

  getById: (id: string) =>
    api.get(`/vendors/${id}`),

  create: (data: any) =>
    api.post('/vendors', data),

  update: (id: string, data: any) =>
    api.put(`/vendors/${id}`, data),

  delete: (id: string) =>
    api.delete(`/vendors/${id}`),

  getTop: (limit = 10) =>
    api.get(`/vendors/top?limit=${limit}`),
};
