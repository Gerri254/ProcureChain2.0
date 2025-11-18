import type {
  ApiResponse,
  LoginResponse,
  PaginatedResponse,
  Procurement,
  Vendor,
  Anomaly,
  Statistics,
  User
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth = true
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(includeAuth),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false);

    if (response.success && response.data) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    department?: string;
    phone?: string;
  }): Promise<ApiResponse<User>> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, false);
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request('/api/auth/me');
  }

  // Procurement endpoints
  async getPublicProcurements(page = 1, perPage = 20): Promise<ApiResponse<PaginatedResponse<Procurement>>> {
    const response = await this.request<any>(`/api/procurement/public?page=${page}&limit=${perPage}`, {}, false);
    // Map 'results' to 'items' for frontend consistency
    if (response.data && response.data.results) {
      response.data.items = response.data.results;
    }
    return response;
  }

  async getProcurementById(id: string, isPublic = false): Promise<ApiResponse<Procurement>> {
    const endpoint = isPublic ? `/api/procurement/public/${id}` : `/api/procurement/${id}`;
    return this.request(endpoint, {}, !isPublic);
  }

  async getProcurements(page = 1, perPage = 20): Promise<ApiResponse<PaginatedResponse<Procurement>>> {
    const response = await this.request<any>(`/api/procurement?page=${page}&limit=${perPage}`);
    // Map 'results' to 'items' for frontend consistency
    if (response.data && response.data.results) {
      response.data.items = response.data.results;
    }
    return response;
  }

  async createProcurement(data: Partial<Procurement>): Promise<ApiResponse<Procurement>> {
    return this.request('/api/procurement', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProcurement(id: string, data: Partial<Procurement>): Promise<ApiResponse<Procurement>> {
    return this.request(`/api/procurement/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProcurement(id: string): Promise<ApiResponse<void>> {
    return this.request(`/api/procurement/${id}`, { method: 'DELETE' });
  }

  async getProcurementStatistics(): Promise<ApiResponse<Statistics>> {
    return this.request('/api/procurement/statistics');
  }

  // Vendor endpoints
  async getPublicVendors(page = 1, perPage = 20): Promise<ApiResponse<PaginatedResponse<Vendor>>> {
    const response = await this.request<any>(`/api/vendors/public?page=${page}&limit=${perPage}`, {}, false);
    // Map 'results' to 'items' for frontend consistency
    if (response.data && response.data.results) {
      response.data.items = response.data.results;
    }
    return response;
  }

  async getVendors(page = 1, perPage = 20): Promise<ApiResponse<PaginatedResponse<Vendor>>> {
    const response = await this.request<any>(`/api/vendors?page=${page}&limit=${perPage}`);
    // Map 'results' to 'items' for frontend consistency
    if (response.data && response.data.results) {
      response.data.items = response.data.results;
    }
    return response;
  }

  async getVendorById(id: string): Promise<ApiResponse<Vendor>> {
    return this.request(`/api/vendors/${id}`);
  }

  async createVendor(data: Partial<Vendor>): Promise<ApiResponse<Vendor>> {
    return this.request('/api/vendors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTopVendors(): Promise<ApiResponse<Vendor[]>> {
    return this.request('/api/vendors/top');
  }

  // Anomaly endpoints
  async analyzeProcurement(id: string): Promise<ApiResponse<Anomaly[]>> {
    return this.request(`/api/analysis/anomaly/${id}`, { method: 'POST' });
  }

  async getAnomalies(page = 1, perPage = 20): Promise<ApiResponse<PaginatedResponse<Anomaly>>> {
    return this.request(`/api/analysis/anomalies?page=${page}&per_page=${perPage}`);
  }

  async getHighRiskAnomalies(): Promise<ApiResponse<Anomaly[]>> {
    return this.request('/api/analysis/anomalies/high-risk');
  }

  async resolveAnomaly(id: string, notes: string): Promise<ApiResponse<Anomaly>> {
    return this.request(`/api/analysis/anomalies/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ resolution_notes: notes }),
    });
  }

  // Document endpoints
  async uploadDocument(file: File, procurementId: string): Promise<ApiResponse<{ document_id: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('procurement_id', procurementId);

    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    return response.json();
  }

  async downloadDocument(id: string): Promise<Blob> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/documents/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.blob();
  }
}

export const api = new ApiClient();
