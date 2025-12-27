'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Assessment {
  _id: string;
  skill: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  status: 'pending' | 'processing' | 'verified' | 'failed';
  code_submitted: string;
  ai_analysis?: {
    overall_score: number;
    sub_scores: {
      correctness: number;
      code_quality: number;
      best_practices: number;
      efficiency: number;
    };
    strengths: string[];
    weaknesses: string[];
  };
  submitted_at: string;
  challenge_title?: string;
}

export default function MyAssessmentsPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/assessments/my-assessments');
      return;
    }

    loadAssessments();
  }, [isAuthenticated, router]);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const response = await api.getMyAssessments();

      if (response.success && response.data) {
        setAssessments(response.data.assessments || []);
      }
    } catch (error) {
      console.error('Error loading assessments:', error);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssessments = assessments.filter((assessment) => {
    if (filter === 'all') return true;
    return assessment.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">✓ Verified</span>;
      case 'failed':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">✗ Failed</span>;
      case 'processing':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">⏳ Processing</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">⏸ Pending</span>;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading your assessments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Assessments</h1>
          <p className="text-gray-600">
            Track your skill assessment progress and results
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({assessments.length})
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'verified'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Verified ({assessments.filter((a) => a.status === 'verified').length})
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'failed'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Failed ({assessments.filter((a) => a.status === 'failed').length})
            </button>
            <button
              onClick={() => setFilter('processing')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'processing'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Processing ({assessments.filter((a) => a.status === 'processing').length})
            </button>
          </div>
        </div>

        {/* Assessments List */}
        {filteredAssessments.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">No assessments found</p>
            <Link href="/assessments">
              <Button>Browse Challenges</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssessments.map((assessment) => (
              <AssessmentCard key={assessment._id} assessment={assessment} getStatusBadge={getStatusBadge} getScoreColor={getScoreColor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AssessmentCard({
  assessment,
  getStatusBadge,
  getScoreColor,
}: {
  assessment: Assessment;
  getStatusBadge: (status: string) => JSX.Element | null;
  getScoreColor: (score: number) => string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-black text-white rounded-full text-sm font-medium">
              {assessment.skill.toUpperCase()}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
              {assessment.difficulty_level}
            </span>
            {getStatusBadge(assessment.status)}
          </div>
          <h3 className="text-xl font-semibold">
            {assessment.challenge_title || 'Untitled Challenge'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Submitted {new Date(assessment.submitted_at).toLocaleDateString()}
          </p>
        </div>

        {assessment.ai_analysis && (
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(assessment.ai_analysis.overall_score)}`}>
              {assessment.ai_analysis.overall_score}
            </div>
            <div className="text-sm text-gray-500">Score</div>
          </div>
        )}
      </div>

      {assessment.ai_analysis && (
        <>
          {/* Sub-scores */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {Object.entries(assessment.ai_analysis.sub_scores).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className={`text-lg font-semibold ${getScoreColor(value)}`}>{value}</div>
                <div className="text-xs text-gray-500 capitalize">{key.replace('_', ' ')}</div>
              </div>
            ))}
          </div>

          {/* Expand/Collapse Details */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-black hover:underline mb-2"
          >
            {expanded ? '▼ Hide Details' : '▶ Show Details'}
          </button>

          {expanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">✓ Strengths</h4>
                  <ul className="space-y-1">
                    {assessment.ai_analysis.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        • {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">✗ Areas to Improve</h4>
                  <ul className="space-y-1">
                    {assessment.ai_analysis.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        • {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {assessment.status === 'processing' && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            🤖 AI is analyzing your code. This usually takes 2-3 minutes. Refresh to check status.
          </p>
        </div>
      )}

      {assessment.status === 'failed' && (
        <div className="mt-4 flex gap-3">
          <Link href="/assessments">
            <Button variant="outline" size="sm">
              Try Different Challenge
            </Button>
          </Link>
          <Button size="sm">Retake Assessment</Button>
        </div>
      )}
    </div>
  );
}
