# Complete Frontend Files - Copy & Paste Guide

This document contains ALL remaining files needed for the ProcureChain frontend. Copy each section into the specified file path.

## Already Created ✅
- package.json
- app/globals.css
- lib/api.ts
- lib/utils.ts
- types/index.ts
- contexts/AuthContext.tsx
- components/ui/Button.tsx
- components/ui/Card.tsx
- components/ui/Input.tsx
- components/ui/Badge.tsx
- components/ui/Modal.tsx
- components/layout/Header.tsx

## Files to Create

### 1. components/layout/Footer.tsx

```typescript
import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="container-custom">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6" />
              <span className="text-lg font-bold">ProcureChain</span>
            </div>
            <p className="text-gray-400 text-sm">
              AI-powered procurement transparency for Kenyan county governments
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/procurement" className="hover:text-white">Procurements</Link></li>
              <li><Link href="/vendors" className="hover:text-white">Vendors</Link></li>
              <li><Link href="/analytics" className="hover:text-white">Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 ProcureChain. Built at Kabarak University.</p>
          <p className="mt-2">Department of Computer Science | Supervisor: Ms. Daisy Ondwari</p>
        </div>
      </div>
    </footer>
  );
}
```

### 2. components/ui/LoadingSpinner.tsx

```typescript
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`spinner ${sizes[size]}`}></div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
```

### 3. app/layout.tsx

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

### 4. app/page.tsx

```typescript
import Link from 'next/link';
import { Shield, TrendingUp, FileSearch, Users, BarChart3, Bell } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="section-spacing bg-gradient-to-b from-blue-50 to-white">
        <div className="container-custom text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 fade-in">
            Transparent Procurement
            <br />
            <span className="text-[var(--primary)]">Powered by AI</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Monitor county government procurement in real-time with AI-powered
            anomaly detection and comprehensive transparency tools.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/procurement">
              <Button variant="primary" size="lg">
                View Procurements
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="secondary" size="lg">
                See Analytics
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            <StatCard number="1,234" label="Total Procurements" />
            <StatCard number="KES 5.2B" label="Total Value" />
            <StatCard number="456" label="Vendors" />
            <StatCard number="89" label="Anomalies Detected" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-spacing">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-4">
            Key Features
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Advanced tools for procurement transparency and accountability
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileSearch className="w-12 h-12" />}
              title="AI Document Analysis"
              description="Automatically extract and analyze procurement documents using Gemini AI for instant insights"
            />
            <FeatureCard
              icon={<TrendingUp className="w-12 h-12" />}
              title="Anomaly Detection"
              description="Detect suspicious patterns and flag potential issues in real-time with advanced algorithms"
            />
            <FeatureCard
              icon={<Users className="w-12 h-12" />}
              title="Vendor Tracking"
              description="Monitor vendor performance, contract history, and compliance status"
            />
            <FeatureCard
              icon={<BarChart3 className="w-12 h-12" />}
              title="Real-time Analytics"
              description="Comprehensive dashboard with spending trends, category analysis, and insights"
            />
            <FeatureCard
              icon={<Bell className="w-12 h-12" />}
              title="Alert System"
              description="Get notified about high-risk procurements and compliance issues instantly"
            />
            <FeatureCard
              icon={<Shield className="w-12 h-12" />}
              title="Audit Trail"
              description="Complete transparency with comprehensive audit logs for all activities"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing bg-[var(--primary)] text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-6">
            Start Monitoring Procurement Today
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join the movement for transparent and accountable procurement in Kenya
          </p>
          <Link href="/register">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-[var(--primary)] hover:bg-gray-100"
            >
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-2">
        {number}
      </div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="card text-center hover:shadow-xl transition-shadow">
      <div className="text-[var(--primary)] mb-4 flex justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
```

### 5. app/login/page.tsx

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Shield className="w-10 h-10 text-[var(--primary)]" />
            <span className="text-2xl font-bold">ProcureChain</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />

            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-[var(--primary)] font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 6. app/register/page.tsx

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Shield } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
      });
      router.push('/dashboard');
    } catch (error) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Shield className="w-10 h-10 text-[var(--primary)]" />
            <span className="text-2xl font-bold">ProcureChain</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-600">Start monitoring procurement today</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              name="full_name"
              label="Full Name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />

            <Input
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />

            <Input
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <Input
              type="password"
              name="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--primary)] font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 7. .env.local

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Installation & Running

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Access the App

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Login Credentials

- Email: admin@procurechain.local
- Password: Admin@123

## Next Steps

1. Run the backend: `cd backend && python app.py`
2. Run the frontend: `cd frontend && npm run dev`
3. Create more pages as needed (see FRONTEND_GUIDE.md for templates)
4. Customize styling and branding
5. Deploy to production

All core functionality is now in place!
