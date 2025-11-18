export interface User {
  _id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'government_official' | 'auditor' | 'public';
  department?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  last_login?: string;
}

export interface Procurement {
  _id: string;
  tender_number: string;
  title: string;
  description: string;
  category: 'goods' | 'services' | 'works' | 'consultancy' | 'supplies';
  estimated_value: number;
  currency: string;
  status: 'draft' | 'published' | 'evaluation' | 'awarded' | 'completed' | 'cancelled';
  published_date?: string;
  closing_date?: string;
  department: string;
  created_by: string;
  vendor_id?: string;
  awarded_value?: number;
  awarded_date?: string;
  documents: string[];
  ai_metadata?: {
    summary?: string;
    key_requirements?: string[];
    risk_level?: 'low' | 'medium' | 'high';
  };
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  _id: string;
  name: string;
  registration_number: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  country?: string;
  category?: string[];
  business_category?: string; // Backend returns this as comma-separated string
  tax_compliance_status: 'compliant' | 'non_compliant' | 'pending';
  contracts?: VendorContract[];
  performance_score?: number;
  performance_metrics?: {
    total_contracts: number;
    total_value: number;
    completion_rate: number;
    average_rating: number;
  };
  risk_score?: number;
  total_contracts?: number;
  total_value?: number;
  created_at?: string;
}

export interface VendorContract {
  procurement_id: string;
  tender_number: string;
  awarded_date: string;
  contract_value: number;
  status: string;
}

export interface Anomaly {
  _id: string;
  procurement_id: string;
  anomaly_type: 'price' | 'vendor' | 'timeline' | 'document' | 'pattern' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  risk_score: number;
  status: 'flagged' | 'under_review' | 'resolved' | 'false_positive';
  flagged_at: string;
  resolved_at?: string;
}

export interface Statistics {
  total_procurements: number;
  total_value: number;
  by_status: Record<string, number>;
  by_category: Record<string, number>;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}
