import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  SearchIcon,
  ChartIcon,
  ShieldIcon,
  FileIcon,
  AlertIcon,
  LockIcon,
} from '@/components/ui/Icons';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Transparency in
            <br />
            <span className="bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
              Public Procurement
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            AI-powered platform for detecting anomalies and ensuring accountability
            in government procurement processes
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/procurements">
              <Button size="lg">Explore Procurements</Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Built for Accountability
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<SearchIcon size={32} />}
            title="AI-Powered Analysis"
            description="Gemini AI automatically analyzes procurement documents and detects potential anomalies"
          />
          <FeatureCard
            icon={<ChartIcon size={32} />}
            title="Real-Time Monitoring"
            description="Track all procurement activities with comprehensive dashboards and analytics"
          />
          <FeatureCard
            icon={<ShieldIcon size={32} />}
            title="Vendor Verification"
            description="Comprehensive vendor management with performance tracking and risk scoring"
          />
          <FeatureCard
            icon={<FileIcon size={32} />}
            title="Document Management"
            description="Secure document storage with AI-powered parsing and metadata extraction"
          />
          <FeatureCard
            icon={<AlertIcon size={32} />}
            title="Anomaly Detection"
            description="Automatically flag suspicious patterns in pricing, timelines, and vendor behavior"
          />
          <FeatureCard
            icon={<LockIcon size={32} />}
            title="Role-Based Access"
            description="Secure authentication with granular permissions for different user roles"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <StatCard number="100%" label="Transparent" />
            <StatCard number="AI" label="Powered" />
            <StatCard number="24/7" label="Monitoring" />
            <StatCard number="Real-time" label="Updates" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready to enhance procurement transparency?
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join ProcureChain today and leverage AI to ensure accountability in public spending
        </p>
        <Link href="/register">
          <Button size="lg">Start Free Trial</Button>
        </Link>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="text-gray-900 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold mb-2">{number}</div>
      <div className="text-gray-400">{label}</div>
    </div>
  );
}
