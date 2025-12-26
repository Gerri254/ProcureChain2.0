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
            Verify Your Skills.
            <br />
            <span className="bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
              Get Hired.
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            AI-powered skill verification platform. Take assessments, earn verified credentials,
            and connect with employers looking for your skills.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/assessments">
              <Button size="lg">Take Assessment</Button>
            </Link>
            <Link href="/register">
              <Button size="lg" >
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          How SkillChain Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<SearchIcon size={32} />}
            title="Take Live Assessments"
            description="Prove your skills with AI-monitored coding challenges. Get instant verification with detailed feedback."
          />
          <FeatureCard
            icon={<ShieldIcon size={32} />}
            title="Earn Verified Badges"
            description="Receive cryptographically-secured credentials that employers can trust. No fake resumes."
          />
          <FeatureCard
            icon={<ChartIcon size={32} />}
            title="Get Matched to Jobs"
            description="Employers find you based on verified skills, not just keywords. Skills speak louder than degrees."
          />
          <FeatureCard
            icon={<FileIcon size={32} />}
            title="Portfolio Verification"
            description="Connect GitHub and showcase real projects. AI verifies you actually wrote the code."
          />
          <FeatureCard
            icon={<AlertIcon size={32} />}
            title="Fraud Detection"
            description="Advanced AI detects plagiarism and cheating. Only genuine skills get verified."
          />
          <FeatureCard
            icon={<LockIcon size={32} />}
            title="Career Growth Tracking"
            description="Track skill improvements over time. Get recommendations for high-demand skills to learn next."
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <StatCard number="100%" label="Verified" />
            <StatCard number="AI" label="Powered" />
            <StatCard number="Free" label="Assessments" />
            <StatCard number="Global" label="Opportunities" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready to prove what you can do?
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join SkillChain today and turn your skills into verified credentials that get you hired.
        </p>
        <Link href="/register">
          <Button size="lg">Start Verifying Skills - Free</Button>
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
