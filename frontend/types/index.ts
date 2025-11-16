// User types
export interface User {
  _id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'procurement_officer' | 'auditor' | 'public';
  department?: string;
  permissions: string[];
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  last_login?: string;
}

// Procurement types
export interface Procurement {
  _id: string;
  tender_number?: string;
  title: string;
  description: string;
  category: 'infrastructure' | 'supplies' | 'services' | 'consultancy' | 'works' | 'goods' | 'equipment' | 'other';
  estimated_value: number;
  currency: string;
  status: 'draft' | 'published' | 'awarded' | 'cancelled' | 'completed';
  published_date?: string;
  deadline?: string;
  eligibility_criteria?: string[];
  evaluation_criteria?: string[];
  required_documents?: string[];
  contact_info?: {
    department: string;
    email: string;
    phone: string;
  };
  awarded_vendor_id?: string;
  awarded_amount?: number;
  awarded_date?: string;
  documents?: ProcurementDocument[];
  metadata?: {
    ai_analyzed: boolean;
    ai_analysis_date?: string;
    risk_score: number;
    has_anomalies: boolean;
  };
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ProcurementDocument {
  file_id: string;
  file_name: string;
  file_type: string;
  uploaded_at: string;
}

// Vendor types
export interface Vendor {
  _id: string;
  name: string;
  registration_number: string;
  tax_compliance_status: 'compliant' | 'non-compliant' | 'pending' | 'exempt';
  contact: {
    email: string;
    phone: string;
    address: string;
    website?: string;
  };
  business_info?: {
    category: string;
    established_date?: string;
    num_employees: number;
  };
  contract_history: ContractHistory[];
  performance_metrics: {
    total_contracts: number;
    total_value: number;
    completion_rate: number;
    average_rating: number;
  };
  metadata: {
    verified: boolean;
    verification_date?: string;
    risk_score: number;
    blacklisted: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface ContractHistory {
  procurement_id: string;
  amount: number;
  date_awarded: string;
  status: string;
  completion_date?: string;
  rating?: number;
  notes?: string;
}

// Anomaly types
export interface Anomaly {
  _id: string;
  procurement_id: string;
  flag_type: 'price_anomaly' | 'vendor_pattern' | 'timeline_issue' | 'missing_info' | 'compliance_issue' | 'document_inconsistency' | 'frequency_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  description: string;
  ai_reasoning: string;
  details?: {
    detected_pattern: string;
    expected_value?: any;
    actual_value?: any;
    deviation_percentage: number;
    comparison_metrics?: any;
  };
  status: 'pending' | 'investigating' | 'resolved' | 'false_positive' | 'escalated';
  flagged_at: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  notifications_sent: any[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  results: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Statistics types
export interface ProcurementStatistics {
  by_status: Record<string, {
    count: number;
    total_value: number;
  }>;
  total_procurements: number;
  total_value: number;
}

export interface AnomalyStatistics {
  by_status: Record<string, {
    count: number;
    avg_risk_score: number;
  }>;
  by_severity: Record<string, number>;
  total_anomalies: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  full_name: string;
}

export interface ProcurementForm {
  title: string;
  description: string;
  category: string;
  estimated_value: number;
  currency?: string;
  tender_number?: string;
  published_date?: string;
  deadline?: string;
  status?: string;
}

export interface VendorForm {
  name: string;
  registration_number: string;
  email: string;
  phone: string;
  address: string;
  tax_compliance_status?: string;
}

// Chart data types
export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}
