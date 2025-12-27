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

  // Procurement Event endpoints
  async createProcurementEvent(procurementId: string, data: {
    event_type: string;
    title: string;
    description: string;
    scheduled_date?: string;
    files?: any[];
    findings?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/events', {
      method: 'POST',
      body: JSON.stringify({
        procurement_id: procurementId,
        ...data
      }),
    });
  }

  async getProcurementEvents(procurementId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/api/events/procurement/${procurementId}`, {}, false);
  }

  async getEvent(eventId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/events/${eventId}`, {}, false);
  }

  async updateEventStatus(eventId: string, data: {
    status: string;
    findings?: string;
    files?: any[];
  }): Promise<ApiResponse<any>> {
    return this.request(`/api/events/${eventId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async addEventNote(eventId: string, text: string): Promise<ApiResponse<any>> {
    return this.request(`/api/events/${eventId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async deleteEvent(eventId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/events/${eventId}`, {
      method: 'DELETE',
    });
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

  // AI endpoints
  async getAIStatus(): Promise<ApiResponse<{ available: boolean; message: string }>> {
    return this.request('/api/ai/status', {}, false);
  }

  async explainProcurement(procurementId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/ai/explain-procurement/${procurementId}`, {}, false);
  }

  async analyzeAnomaly(anomalyId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/ai/analyze-anomaly/${anomalyId}`);
  }

  async verifyVendor(vendorData: any): Promise<ApiResponse<any>> {
    return this.request('/api/ai/verify-vendor', {
      method: 'POST',
      body: JSON.stringify(vendorData),
    });
  }

  async suggestProcurementImprovements(procurementId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/ai/suggest-improvements/${procurementId}`);
  }

  // Vendor endpoints
  async createVendor(data: any): Promise<ApiResponse<any>> {
    return this.request('/api/vendors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getVendors(page = 1, perPage = 20, search = ''): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ page: page.toString(), limit: perPage.toString() });
    if (search) params.append('search', search);
    return this.request(`/api/vendors?${params.toString()}`);
  }

  async getVendor(vendorId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/vendors/${vendorId}`, {}, false);
  }

  async updateVendor(vendorId: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/api/vendors/${vendorId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVendor(vendorId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/vendors/${vendorId}`, {
      method: 'DELETE',
    });
  }

  // ========== SkillChain Assessment Endpoints ==========

  // Create new assessment
  async createAssessment(data: {
    skill: string;
    difficulty_level: string;
    challenge_id?: string;
  }): Promise<ApiResponse<{ assessment_id: string }>> {
    return this.request('/api/assessments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get specific assessment
  async getAssessment(assessmentId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/assessments/${assessmentId}`);
  }

  // Submit code for assessment
  async submitAssessmentCode(
    assessmentId: string,
    data: {
      code_submitted: string;
      time_taken_seconds?: number;
      challenge_data?: {
        prompt: string;
        test_cases: Array<{ input: string; expected_output: string }>;
      };
    }
  ): Promise<ApiResponse<any>> {
    return this.request(`/api/assessments/${assessmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get user's assessments
  async getMyAssessments(status?: string): Promise<ApiResponse<{
    total: number;
    assessments: any[];
  }>> {
    const queryParam = status ? `?status=${status}` : '';
    return this.request(`/api/assessments/my-assessments${queryParam}`);
  }

  // Get user's verified skills
  async getMySkills(): Promise<ApiResponse<any[]>> {
    return this.request('/api/assessments/my-skills');
  }

  // Get skill statistics
  async getSkillStatistics(skill: string): Promise<ApiResponse<any>> {
    return this.request(`/api/assessments/statistics/${skill}`);
  }

  // Get leaderboard
  async getLeaderboard(skill?: string): Promise<ApiResponse<any[]>> {
    const queryParam = skill ? `?skill=${skill}` : '';
    return this.request(`/api/assessments/leaderboard${queryParam}`);
  }

  // Get all assessments (admin)
  async getAllAssessments(page = 1, perPage = 20): Promise<ApiResponse<any>> {
    return this.request(`/api/assessments?page=${page}&limit=${perPage}`);
  }

  // ========== SkillChain Profile Endpoints ==========

  // Get my profile
  async getMyProfile(): Promise<ApiResponse<any>> {
    return this.request('/api/profiles/me');
  }

  // Update my profile
  async updateMyProfile(data: any): Promise<ApiResponse<any>> {
    return this.request('/api/profiles/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Get user profile (public)
  async getUserProfile(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/profiles/${userId}`, {}, false);
  }

  // Get user's verified skills (public)
  async getUserSkills(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/profiles/${userId}/skills`, {}, false);
  }

  // Search learners (employers only)
  async searchLearners(params: {
    skills?: string[];
    min_score?: number;
    experience_level?: string;
    location?: string;
    looking_for_job?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();

    if (params.skills) {
      params.skills.forEach(skill => queryParams.append('skills', skill));
    }
    if (params.min_score) queryParams.append('min_score', params.min_score.toString());
    if (params.experience_level) queryParams.append('experience_level', params.experience_level);
    if (params.location) queryParams.append('location', params.location);
    if (params.looking_for_job !== undefined) queryParams.append('looking_for_job', params.looking_for_job.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    return this.request(`/api/profiles/search/learners?${queryParams.toString()}`);
  }

  // Get profile completeness
  async getProfileCompleteness(): Promise<ApiResponse<any>> {
    return this.request('/api/profiles/completeness');
  }

  // Get platform stats
  async getPlatformStats(): Promise<ApiResponse<any>> {
    return this.request('/api/profiles/stats', {}, false);
  }

  // ========== CHALLENGE ENDPOINTS ==========

  // Get challenges with optional filters
  async getChallenges(params?: {
    skill?: string;
    difficulty_level?: string;
    challenge_type?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<{
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
    challenges: any[];
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.skill) queryParams.append('skill', params.skill);
    if (params?.difficulty_level) queryParams.append('difficulty_level', params.difficulty_level);
    if (params?.challenge_type) queryParams.append('challenge_type', params.challenge_type);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

    const query = queryParams.toString();
    return this.request(`/api/challenges${query ? `?${query}` : ''}`, {}, false);
  }

  // Get single challenge by ID
  async getChallenge(challengeId: string, includeAnswers = false): Promise<ApiResponse<any>> {
    const query = includeAnswers ? '?include_answers=true' : '';
    return this.request(`/api/challenges/${challengeId}${query}`, {}, false);
  }

  // Get random challenge for assessment
  async getRandomChallenge(skill: string, difficulty_level: string): Promise<ApiResponse<any>> {
    return this.request(
      `/api/challenges/random?skill=${skill}&difficulty_level=${difficulty_level}`,
      {},
      false
    );
  }

  // Search challenges
  async searchChallenges(searchTerm: string, page = 1, perPage = 20): Promise<ApiResponse<any>> {
    return this.request(
      `/api/challenges/search?q=${encodeURIComponent(searchTerm)}&page=${page}&per_page=${perPage}`,
      {},
      false
    );
  }

  // Get challenge statistics
  async getChallengeStats(): Promise<ApiResponse<any>> {
    return this.request('/api/challenges/stats', {}, false);
  }

  // Create challenge (admin only)
  async createChallenge(data: any): Promise<ApiResponse<{ challenge_id: string }>> {
    return this.request('/api/challenges', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Update challenge (admin only)
  async updateChallenge(challengeId: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/api/challenges/${challengeId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Delete challenge (admin only)
  async deleteChallenge(challengeId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/challenges/${challengeId}`, {
      method: 'DELETE'
    });
  }

  // Get full challenge with answers (admin only)
  async getFullChallenge(challengeId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/challenges/${challengeId}/full`);
  }
}

export const api = new ApiClient();
