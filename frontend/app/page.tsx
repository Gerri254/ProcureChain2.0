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
