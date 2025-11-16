'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { Shield, FileSearch, TrendingUp, Users, Eye, Lock } from 'lucide-react';

export default function HomePage() {
  const [currentCard, setCurrentCard] = useState(0);

  const features = [
    {
      title: "AI DOCUMENT",
      subtitle: "ANALYSIS",
      description: "Automatically extract and analyze procurement documents using Gemini AI for instant insights",
      category: "TECHNOLOGY",
      gradient1: "#3B82F6",
      gradient2: "#06B6D4",
      waveGradient1: "#5D9EF7",
      waveGradient2: "#8CBEF9",
      waveGradient3: "#BAE6FD"
    },
    {
      title: "ANOMALY",
      subtitle: "DETECTION",
      description: "Detect suspicious patterns and flag potential issues in real-time with advanced algorithms",
      category: "SECURITY",
      gradient1: "#A855F7",
      gradient2: "#EC4899",
      waveGradient1: "#B875F8",
      waveGradient2: "#D89CFA",
      waveGradient3: "#FBCFE8"
    },
    {
      title: "VENDOR",
      subtitle: "TRACKING",
      description: "Monitor vendor performance, contract history, and compliance status across all procurements",
      category: "MANAGEMENT",
      gradient1: "#22C55E",
      gradient2: "#10B981",
      waveGradient1: "#3DD972",
      waveGradient2: "#6EE89A",
      waveGradient3: "#D1FAE5"
    },
    {
      title: "REAL-TIME",
      subtitle: "ANALYTICS",
      description: "Comprehensive dashboard with spending trends, category analysis, and actionable insights",
      category: "INSIGHTS",
      gradient1: "#F97316",
      gradient2: "#EF4444",
      waveGradient1: "#FA8F43",
      waveGradient2: "#FBB178",
      waveGradient3: "#FED7AA"
    },
    {
      title: "SMART",
      subtitle: "ALERTS",
      description: "Get instant notifications about high-risk procurements and compliance issues",
      category: "MONITORING",
      gradient1: "#EAB308",
      gradient2: "#F59E0B",
      waveGradient1: "#ECC544",
      waveGradient2: "#F0D77F",
      waveGradient3: "#FEF3C7"
    },
    {
      title: "AUDIT",
      subtitle: "TRAIL",
      description: "Complete transparency with comprehensive logs tracking every action in the system",
      category: "COMPLIANCE",
      gradient1: "#6366F1",
      gradient2: "#3B82F6",
      waveGradient1: "#7C7EF3",
      waveGradient2: "#A3A6F6",
      waveGradient3: "#DBEAFE"
    }
  ];

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % features.length);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + features.length) % features.length);
  };

  return (
    <div className="min-h-screen bg-[#f1f1f1]">
      <Header />

      {/* Hero Section */}
      <section className="relative section-hero overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 grid-pattern"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-glass rounded-full mb-12 border border-gray-300 badge-elevated">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700 tracking-wide">BUILT FOR TRANSPARENCY</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-black mb-8 text-[#080808] leading-[0.9] text-shadow-sm">
              PROCURECHAIN
            </h1>

            {/* Subheading */}
            <p className="text-2xl md:text-3xl lg:text-4xl text-gray-700 mb-10 font-light leading-tight">
              AI-Powered Procurement Transparency Platform
            </p>

            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-16 font-light leading-relaxed px-4">
              Monitor county government procurement in real-time with advanced
              anomaly detection and comprehensive transparency tools.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-24">
              <Link href="/procurement">
                <button className="w-full sm:w-auto px-10 py-4 bg-[#080808] text-white font-bold uppercase tracking-wide button-lift rounded-lg shadow-lg focus-ring-dark">
                  Explore Procurements
                </button>
              </Link>
              <Link href="/register">
                <button className="w-full sm:w-auto px-10 py-4 bg-white text-[#080808] font-bold uppercase tracking-wide border-2 border-[#080808] button-lift rounded-lg focus-ring">
                  Get Started Free
                </button>
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              <FeaturePill icon={<FileSearch className="w-4 h-4" />} text="Document Analysis" />
              <FeaturePill icon={<Shield className="w-4 h-4" />} text="Anomaly Detection" />
              <FeaturePill icon={<Users className="w-4 h-4" />} text="Vendor Tracking" />
              <FeaturePill icon={<TrendingUp className="w-4 h-4" />} text="Real-time Analytics" />
              <FeaturePill icon={<Eye className="w-4 h-4" />} text="Full Transparency" />
              <FeaturePill icon={<Lock className="w-4 h-4" />} text="Audit Trail" />
            </div>
          </div>
        </div>
      </section>

      {/* Deconstructed Card Carousel Section */}
      <section className="section-standard bg-white">
        <div className="container-custom">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-[#080808] text-shadow-sm">
              POWERFUL FEATURES
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              Everything you need to monitor and analyze procurement activities
            </p>
          </div>

          {/* Deconstructed Card Carousel */}
          <div className="relative max-w-5xl mx-auto">
            <div className="flex justify-center items-center min-h-[500px]">
              <div className="relative w-full h-[450px]">
                {features.map((feature, index) => {
                  const offset = index - currentCard;
                  const isActive = index === currentCard;

                  return (
                    <DeconstructedCard
                      key={index}
                      feature={feature}
                      isActive={isActive}
                      offset={offset}
                    />
                  );
                })}
              </div>
            </div>

            {/* Carousel Controls */}
            <div className="flex justify-center gap-6 mt-16">
              <button
                onClick={prevCard}
                className="w-14 h-14 rounded-full bg-[#080808] text-white flex items-center justify-center interactive-scale shadow-lg focus-ring-dark"
                aria-label="Previous card"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button
                onClick={nextCard}
                className="w-14 h-14 rounded-full bg-[#080808] text-white flex items-center justify-center interactive-scale shadow-lg focus-ring-dark"
                aria-label="Next card"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2.5 mt-8">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCard(index)}
                  className={`h-2 rounded-full transition-smooth focus-ring ${
                    index === currentCard ? 'bg-[#080808] w-10' : 'bg-gray-400 w-2 hover:bg-gray-500'
                  }`}
                  aria-label={`Go to card ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-standard bg-[#f1f1f1] border-y border-gray-200">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 max-w-6xl mx-auto">
            <StatCard number="1,234" label="TOTAL PROCUREMENTS" />
            <StatCard number="KES 5.2B" label="TOTAL VALUE" />
            <StatCard number="456" label="ACTIVE VENDORS" />
            <StatCard number="89" label="ANOMALIES DETECTED" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-standard bg-white">
        <div className="container-custom">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-[#080808] text-shadow-sm">
              HOW IT WORKS
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              Simple, powerful, transparent
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16 max-w-5xl mx-auto">
            <ProcessStep
              number="01"
              title="UPLOAD DOCUMENTS"
              description="Upload procurement documents and let our AI analyze them automatically"
            />
            <ProcessStep
              number="02"
              title="AI ANALYSIS"
              description="Gemini AI extracts key information and detects potential anomalies"
            />
            <ProcessStep
              number="03"
              title="MONITOR & ACT"
              description="Track procurements in real-time and take action when needed"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-hero bg-[#080808] text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 grid-pattern-light"></div>
        </div>

        <div className="container-custom text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-black mb-8 text-shadow-md">
            START MONITORING
            <span className="block mt-3">TODAY</span>
          </h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto font-light opacity-90 leading-relaxed">
            Join the movement for transparent and accountable
            procurement in Kenya
          </p>
          <Link href="/register">
            <button className="px-12 py-5 bg-white text-[#080808] font-bold uppercase tracking-wide button-lift rounded-lg text-lg shadow-xl focus-ring">
              Create Free Account
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function DeconstructedCard({ feature, isActive, offset }: any) {
  const translateX = offset * 60;
  const scale = isActive ? 1 : 0.85;
  const opacity = Math.abs(offset) > 1 ? 0 : 1 - Math.abs(offset) * 0.5;
  const zIndex = isActive ? 20 : 10 - Math.abs(offset);

  return (
    <div
      className="absolute left-1/2 top-1/2 w-[300px] h-[400px] transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{
        transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`,
        opacity,
        zIndex,
        pointerEvents: isActive ? 'auto' : 'none'
      }}
    >
      {/* Card Layers */}
      <div className="relative w-full h-full cursor-pointer">
        {/* Wave Background Layer */}
        <div
          className={`absolute inset-0 overflow-hidden transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isActive ? 'translate-x-0 translate-y-0' : 'translate-x-2 translate-y-2'
          }`}
        >
          <svg className="w-full h-full" viewBox="0 0 300 400" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`gradient-${offset}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={feature.gradient1} />
                <stop offset="100%" stopColor={feature.gradient2} />
              </linearGradient>
              <linearGradient id={`wave1-${offset}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={feature.waveGradient1} />
                <stop offset="50%" stopColor={feature.waveGradient2} />
                <stop offset="100%" stopColor={feature.waveGradient1} />
              </linearGradient>
              <linearGradient id={`wave2-${offset}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={feature.waveGradient2} />
                <stop offset="50%" stopColor={feature.waveGradient3} />
                <stop offset="100%" stopColor={feature.waveGradient2} />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill={`url(#gradient-${offset})`} />
            <path
              d="M0,230 C30,220 60,240 90,230 C120,220 150,240 180,230 C210,220 240,240 270,230 C290,225 295,230 300,225 L300,400 L0,400 Z"
              fill={`url(#wave1-${offset})`}
              opacity="0.8"
            />
            <path
              d="M0,260 C40,250 80,270 120,260 C160,250 200,270 240,260 C280,250 290,260 300,255 L300,400 L0,400 Z"
              fill={`url(#wave2-${offset})`}
              opacity="0.9"
            />
            <path
              d="M0,290 C50,280 100,300 150,290 C200,280 250,300 300,290 L300,400 L0,400 Z"
              fill={feature.waveGradient3}
              opacity="0.9"
            />
          </svg>
        </div>

        {/* Frame Border Layer */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <svg viewBox="0 0 300 400" className="w-full h-full" preserveAspectRatio="none">
            <path
              d="M 20,20 H 280 V 380 H 20 Z"
              fill="none"
              stroke="rgba(8, 8, 8, 0.8)"
              strokeWidth="1"
              className="transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                strokeDasharray: '1520',
                strokeDashoffset: isActive ? '0' : '1520'
              }}
            />
          </svg>
        </div>

        {/* Content Layer */}
        <div
          className={`absolute inset-0 p-8 flex flex-col justify-between z-5 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isActive ? 'translate-x-0 translate-y-0' : '-translate-x-2 -translate-y-2'
          }`}
        >
          <div>
            {/* Category Meta */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className={`h-px bg-white/60 flex-shrink-0 transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive ? 'w-10 scale-x-100' : 'w-5 scale-x-50'
                }`}
              ></div>
              <span
                className={`text-xs font-medium text-white/80 tracking-[0.05em] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-60'
                }`}
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {feature.category}
              </span>
            </div>
          </div>

          <div>
            {/* Title */}
            <div className="mb-6">
              <h2
                className={`text-[2rem] font-black text-white leading-[1.2] tracking-[-0.02em] mb-4 transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-70'
                }`}
              >
                {feature.title}
              </h2>
              <h3
                className={`text-sm font-medium text-white/80 tracking-[0.05em] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-50'
                }`}
              >
                {feature.subtitle}
              </h3>
            </div>

            {/* Description */}
            <p
              className={`text-sm text-white/90 leading-relaxed mb-6 font-light max-w-[85%] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isActive ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-70'
              }`}
            >
              {feature.description}
            </p>

            {/* CTA */}
            <a
              href="#"
              className="inline-flex items-center gap-2 group/link"
            >
              <div className="w-8 h-8 border-2 border-white/60 group-hover/link:border-white transition-colors duration-300"></div>
              <span className="text-sm font-bold text-white tracking-wider group-hover/link:translate-x-1 transition-transform duration-300">
                LEARN MORE
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturePill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-glass rounded-full border border-gray-200 hover:border-gray-400 transition-smooth badge-elevated stagger-item">
      {icon}
      <span className="text-sm font-semibold text-gray-700">{text}</span>
    </div>
  );
}

function ProcessStep({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center card-elevated bg-white p-8 rounded-xl">
      <div className="inline-flex items-center justify-center w-20 h-20 mb-8 border-3 border-[#080808] bg-white rounded-lg shadow-md interactive-scale">
        <span className="text-3xl font-black text-[#080808]">{number}</span>
      </div>
      <h3 className="text-xl font-black mb-5 text-[#080808]">{title}</h3>
      <p className="text-gray-600 font-light leading-relaxed text-balance">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center group card-elevated bg-white p-8 rounded-xl">
      <div className="text-4xl md:text-5xl font-black text-[#080808] mb-4 transition-bounce group-hover:scale-110 text-shadow-sm">
        {number}
      </div>
      <div className="text-xs text-gray-600 font-bold tracking-widest uppercase">
        {label}
      </div>
    </div>
  );
}
