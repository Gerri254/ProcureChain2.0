# ProcureChain Frontend - Comprehensive Build Guide

## Overview

This guide will help you build the complete Next.js frontend for ProcureChain, integrated with the Flask backend API.

## What You Need to Build

### 1. Project Setup ✅

```bash
cd /home/lnx/Desktop/muchamos/dev/frontend
npm install
```

### 2. Directory Structure

```
frontend/
├── app/
│   ├── (public)/               # Public routes
│   │   ├── page.tsx           # Homepage
│   │   └── about/page.tsx
│   ├── (auth)/                # Authentication routes
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/             # Protected dashboard
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── [sections]/
│   ├── procurement/           # Procurement pages
│   │   ├── page.tsx           # List
│   │   ├── [id]/page.tsx      # Details
│   │   └── new/page.tsx       # Create
│   ├── vendors/               # Vendor pages
│   ├── analytics/             # Analytics pages
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles ✅
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   └── Modal.tsx
│   ├── procurement/
│   │   ├── ProcurementCard.tsx
│   │   ├── ProcurementList.tsx
│   │   └── ProcurementForm.tsx
│   └── charts/
│       └── StatsChart.tsx
├── lib/
│   ├── api.ts                 # API client
│   └── utils.ts               # Utilities
├── contexts/
│   └── AuthContext.tsx        # Auth state
├── types/
│   └── index.ts               # TypeScript types
└── package.json               # Dependencies ✅
```

## Step-by-Step Implementation

### Step 1: Install Dependencies

Already updated in `package.json`:
- axios (API calls)
- recharts (charts)
- lucide-react (icons)
- date-fns (date formatting)
- react-hot-toast (notifications)
- framer-motion (animations)

Run:
```bash
npm install
```

### Step 2: Create API Client (`lib/api.ts`)

```typescript
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
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      window.location.href = '/login';
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
};

// Procurement API
export const procurementAPI = {
  getPublic: (page = 1, limit = 20) =>
    api.get(`/procurement/public?page=${page}&limit=${limit}`),

  getAll: (params?: any) =>
    api.get('/procurement', { params }),

  getById: (id: string) =>
    api.get(`/procurement/${id}`),

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

  download: (id: string) =>
    api.get(`/documents/${id}/download`, { responseType: 'blob' }),

  delete: (id: string) =>
    api.delete(`/documents/${id}`),
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

  getHighRisk: (minRiskScore = 70) =>
    api.get(`/analysis/anomalies/high-risk?min_risk_score=${minRiskScore}`),
};

// Vendor API
export const vendorAPI = {
  getPublic: (page = 1) =>
    api.get(`/vendors/public?page=${page}`),

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
```

### Step 3: Create TypeScript Types (`types/index.ts`)

```typescript
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

export interface Procurement {
  _id: string;
  tender_number?: string;
  title: string;
  description: string;
  category: string;
  estimated_value: number;
  currency: string;
  status: 'draft' | 'published' | 'awarded' | 'cancelled' | 'completed';
  published_date?: string;
  deadline?: string;
  documents?: Document[];
  metadata?: {
    ai_analyzed: boolean;
    risk_score: number;
    has_anomalies: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  _id: string;
  name: string;
  registration_number: string;
  tax_compliance_status: string;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  performance_metrics: {
    total_contracts: number;
    total_value: number;
    completion_rate: number;
    average_rating: number;
  };
  created_at: string;
}

export interface Anomaly {
  _id: string;
  procurement_id: string;
  flag_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  description: string;
  ai_reasoning: string;
  status: 'pending' | 'investigating' | 'resolved' | 'false_positive';
  flagged_at: string;
  resolved_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
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
```

### Step 4: Create Auth Context (`contexts/AuthContext.tsx`)

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data.data);
    } catch (error) {
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    const { access_token, user } = response.data.data;

    localStorage.setItem('access_token', access_token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    window.location.href = '/';
  };

  const register = async (data: any) => {
    const response = await authAPI.register(data);
    const { access_token, user } = response.data.data;

    localStorage.setItem('access_token', access_token);
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Step 5: Update Root Layout (`app/layout.tsx`)

```typescript
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'ProcureChain - Procurement Transparency Platform',
  description: 'AI-powered procurement monitoring for Kenyan county governments',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Step 6: Create Homepage (`app/page.tsx`)

```typescript
import Link from 'next/link';
import { Shield, TrendingUp, FileSearch, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-[var(--primary)]" />
              <span className="text-xl font-bold">ProcureChain</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/procurement" className="hover:text-[var(--primary)]">
                Procurements
              </Link>
              <Link href="/vendors" className="hover:text-[var(--primary)]">
                Vendors
              </Link>
              <Link href="/analytics" className="hover:text-[var(--primary)]">
                Analytics
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login" className="btn btn-ghost">
                Login
              </Link>
              <Link href="/register" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section-spacing">
        <div className="container-custom text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 fade-in">
            Transparent Procurement
            <br />
            <span className="text-[var(--primary)]">Powered by AI</span>
          </h1>
          <p className="text-xl text-[var(--gray-600)] max-w-2xl mx-auto mb-8">
            Monitor county government procurement in real-time with AI-powered
            anomaly detection and comprehensive transparency tools.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/procurement" className="btn btn-primary">
              View Procurements
            </Link>
            <Link href="/analytics" className="btn btn-secondary">
              See Analytics
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileSearch className="w-12 h-12" />}
              title="AI Document Analysis"
              description="Automatically extract and analyze procurement documents using Gemini AI"
            />
            <FeatureCard
              icon={<TrendingUp className="w-12 h-12" />}
              title="Anomaly Detection"
              description="Detect suspicious patterns and flag potential issues in real-time"
            />
            <FeatureCard
              icon={<Users className="w-12 h-12" />}
              title="Vendor Tracking"
              description="Monitor vendor performance and contract history"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--gray-900)] text-white py-12">
        <div className="container-custom text-center">
          <p>&copy; 2025 ProcureChain. Built at Kabarak University.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="card text-center hover:shadow-xl">
      <div className="text-[var(--primary)] mb-4 flex justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-[var(--gray-600)]">{description}</p>
    </div>
  );
}
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Running the Frontend

```bash
npm run dev
```

Visit `http://localhost:3000`

## Next Steps

1. Install dependencies: `npm install`
2. Create all API client files
3. Build UI components
4. Create all pages
5. Test with backend API
6. Deploy to Vercel

## Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

## Complete File List to Create

See the directory structure above. The most critical files are:
1. ✅ `package.json` - Dependencies
2. ✅ `app/globals.css` - Styles
3. `lib/api.ts` - API client
4. `types/index.ts` - TypeScript types
5. `contexts/AuthContext.tsx` - Auth state
6. `app/layout.tsx` - Root layout
7. `app/page.tsx` - Homepage
8. All page components in `app/` directory
9. All UI components in `components/` directory

This provides a solid foundation. Build incrementally, testing each feature with the backend API.
