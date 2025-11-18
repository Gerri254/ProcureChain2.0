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

  async updateVendor(id: string, data: Partial<Vendor>): Promise<ApiResponse<Vendor>> {
    return this.request(`/api/vendors/${id}`, {
      method: 'PUT',
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

  // Analytics endpoints
  async getSpendingTrends(days: number = 365): Promise<ApiResponse<any[]>> {
    return this.request(`/api/analytics/trends?days=${days}`);
  }

  async getCategoryDistribution(): Promise<ApiResponse<any[]>> {
    return this.request('/api/analytics/categories');
  }

  async getVendorPerformance(limit: number = 10): Promise<ApiResponse<any[]>> {
    return this.request(`/api/analytics/vendors/performance?limit=${limit}`);
  }

  async getAnomalyBreakdown(): Promise<ApiResponse<any>> {
    return this.request('/api/analytics/anomalies/breakdown');
  }

  async getKeyMetrics(): Promise<ApiResponse<any>> {
    return this.request('/api/analytics/metrics');
  }

  async getDepartmentAnalysis(): Promise<ApiResponse<any[]>> {
    return this.request('/api/analytics/departments');
  }

  async getStatusDistribution(): Promise<ApiResponse<any[]>> {
    return this.request('/api/analytics/status/distribution');
  }

  async getProcurementTimeline(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/analytics/timeline/${id}`, {}, false);
  }

  // Question & Answer endpoints
  async getProcurementQuestions(procurementId: string, includePending: boolean = true): Promise<ApiResponse<any[]>> {
    return this.request(`/api/questions/procurement/${procurementId}?include_pending=${includePending}`, {}, false);
  }

  async createQuestion(procurementId: string, data: { question: string; asked_by?: string }): Promise<ApiResponse<any>> {
    return this.request(`/api/questions/procurement/${procurementId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  async answerQuestion(questionId: string, answer: string): Promise<ApiResponse<any>> {
    return this.request(`/api/questions/${questionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
  }

  async upvoteQuestion(questionId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/questions/${questionId}/upvote`, {
      method: 'POST',
    }, false);
  }

  async downvoteQuestion(questionId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/questions/${questionId}/downvote`, {
      method: 'POST',
    }, false);
  }

  async getPendingQuestions(limit: number = 50): Promise<ApiResponse<any[]>> {
    return this.request(`/api/questions/pending?limit=${limit}`);
  }

  async getMyQuestions(): Promise<ApiResponse<any[]>> {
    return this.request('/api/questions/user/my-questions');
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

  // Bid Management endpoints
  async submitBid(procurementId: string, bidData: {
    bid_amount: number;
    currency?: string;
    delivery_timeline: string;
    technical_proposal_file_id?: string;
    technical_proposal_file_name?: string;
    financial_proposal_file_id?: string;
    financial_proposal_file_name?: string;
    bid_bond_file_id?: string;
    bid_bond_file_name?: string;
    bid_bond_amount?: number;
    bid_validity_days?: number;
    remarks?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/api/bids/procurement/${procurementId}`, {
      method: 'POST',
      body: JSON.stringify(bidData),
    });
  }

  async getProcurementBids(procurementId: string, includeDisqualified: boolean = false): Promise<ApiResponse<any[]>> {
    return this.request(`/api/bids/procurement/${procurementId}?include_disqualified=${includeDisqualified}`);
  }

  async getMyBids(): Promise<ApiResponse<any[]>> {
    return this.request('/api/bids/vendor/my-bids');
  }

  async getBidById(bidId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/bids/${bidId}`);
  }

  async evaluateBid(bidId: string, evaluation: {
    technical_score: number;
    financial_score: number;
    comments?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/api/bids/${bidId}/evaluate`, {
      method: 'POST',
      body: JSON.stringify(evaluation),
    });
  }

  async calculateBidScores(procurementId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/api/bids/procurement/${procurementId}/calculate-scores`, {
      method: 'POST',
    });
  }

  async awardBid(bidId: string, awardData: {
    awarded_amount?: number;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/api/bids/${bidId}/award`, {
      method: 'POST',
      body: JSON.stringify(awardData),
    });
  }

  async disqualifyBid(bidId: string, reason: string): Promise<ApiResponse<any>> {
    return this.request(`/api/bids/${bidId}/disqualify`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getBidStatistics(procurementId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/bids/procurement/${procurementId}/statistics`);
  }

  async getBidCount(procurementId: string): Promise<ApiResponse<{ bid_count: number }>> {
    return this.request(`/api/bids/procurement/${procurementId}/count`, {}, false);
  }

  // Report endpoints (whistleblowing)
  async createReport(data: {
    procurement_id: string;
    report_type: string;
    category: string;
    title: string;
    description: string;
    evidence?: string[];
    anonymous?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReports(page: number = 1, perPage: number = 20, filters?: any): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...filters
    });
    return this.request(`/api/reports?${params.toString()}`);
  }

  async getReport(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/reports/${id}`);
  }

  async updateReportStatus(id: string, data: {
    status: string;
    severity?: string;
    resolution?: string;
    assigned_to?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/api/reports/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getReportCount(procurementId: string): Promise<ApiResponse<{ count: number }>> {
    return this.request(`/api/reports/procurement/${procurementId}/count`, {}, false);
  }

  // Comment endpoints
  async createComment(data: {
    procurement_id: string;
    content: string;
    parent_id?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProcurementComments(procurementId: string, page: number = 1): Promise<ApiResponse<any>> {
    return this.request(`/api/comments/procurement/${procurementId}?page=${page}`, {}, false);
  }

  async updateComment(id: string, content: string): Promise<ApiResponse<any>> {
    return this.request(`/api/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deleteComment(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/comments/${id}`, {
      method: 'DELETE',
    });
  }

  async getCommentCount(procurementId: string): Promise<ApiResponse<{ count: number }>> {
    return this.request(`/api/comments/procurement/${procurementId}/count`, {}, false);
  }
}

export const api = new ApiClient();
