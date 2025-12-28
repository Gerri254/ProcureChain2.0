'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { SkillBadgeGroup } from '@/components/ui/SkillBadge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Sparkles,
  Filter,
  Grid3x3,
  List,
  ChevronRight,
  Building2,
  Calendar,
} from 'lucide-react';

interface MatchedJob {
  _id: string;
  title: string;
  company_name: string;
  location: string;
  employment_type: string;
  salary_range?: {
    min: number;
    max: number;
    currency: string;
  };
  required_skills: string[];
  experience_level: string;
  description: string;
  posted_at: string;
  status: string;
  match_data: {
    match_score: number;
    matched_skills: string[];
    missing_skills: string[];
    breakdown: {
      skill_match: number;
      experience_match: number;
      freshness_score: number;
      performance_score: number;
    };
  };
}

type ViewMode = 'grid' | 'list';

export default function MatchedJobsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [jobs, setJobs] = useState<MatchedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [minScore, setMinScore] = useState(60);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.user_type !== 'learner') {
      router.push('/dashboard');
      return;
    }

    fetchMatchedJobs();
  }, [isAuthenticated, user, minScore]);

  const fetchMatchedJobs = async () => {
    try {
      setLoading(true);
      const response = await api.getMatchedJobs(minScore);

      if (response.success && response.data) {
        setJobs(response.data.jobs);
      }
    } catch (error) {
      console.error('Error fetching matched jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      setApplying(jobId);
      const response = await api.submitApplication({
        job_id: jobId,
        cover_letter: '',
      });

      if (response.success) {
        toast.success('Application Submitted!', 'Your application has been sent successfully');
        router.push('/jobs/my-applications');
      } else {
        toast.error('Application Failed', response.error || 'Failed to submit application');
      }
    } catch (error: any) {
      toast.error('Application Failed', error.message || 'Failed to submit application');
    } finally {
      setApplying(null);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getMatchBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const formatSalary = (salary?: { min: number; max: number; currency: string }) => {
    if (!salary) return 'Not specified';
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              AI-Matched Jobs
            </h1>
            <p className="text-gray-600 mt-1">Finding your perfect matches...</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-yellow-500" />
                AI-Matched Jobs
              </h1>
              <p className="text-gray-600 mt-1">
                Jobs tailored to your verified skills and experience
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Minimum Match:</span>
            </div>
            <input
              type="range"
              min="50"
              max="90"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <span className="text-sm font-semibold text-black">{minScore}%+</span>
            <div className="ml-auto text-sm text-gray-600">
              {jobs.length} {jobs.length === 1 ? 'match' : 'matches'} found
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No matches found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Complete more skill assessments to improve your match potential and unlock opportunities.
            </p>
            <Button onClick={() => router.push('/assessments')}>
              Browse Assessments
            </Button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
                : 'space-y-4'
            }
          >
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
              >
                {/* Job Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">
                          {job.company_name}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.employment_type}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(job.posted_at)}
                        </div>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div
                      className={`flex-shrink-0 ml-4 px-4 py-2 rounded-lg border ${getMatchColor(
                        job.match_data.match_score
                      )}`}
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        <div>
                          <div className="text-2xl font-bold">
                            {job.match_data.match_score}%
                          </div>
                          <div className="text-xs">Match</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Salary */}
                  {job.salary_range && (
                    <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg w-fit">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">{formatSalary(job.salary_range)}</span>
                    </div>
                  )}
                </div>

                {/* Match Breakdown */}
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Match Breakdown</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Skills Match</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getMatchBadgeColor(job.match_data.breakdown.skill_match)}`}
                            style={{ width: `${job.match_data.breakdown.skill_match}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-900 w-10">
                          {job.match_data.breakdown.skill_match}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Experience</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getMatchBadgeColor(job.match_data.breakdown.experience_match)}`}
                            style={{ width: `${job.match_data.breakdown.experience_match}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-900 w-10">
                          {job.match_data.breakdown.experience_match}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Skill Freshness</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getMatchBadgeColor(job.match_data.breakdown.freshness_score)}`}
                            style={{ width: `${job.match_data.breakdown.freshness_score}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-900 w-10">
                          {job.match_data.breakdown.freshness_score}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Performance</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getMatchBadgeColor(job.match_data.breakdown.performance_score)}`}
                            style={{ width: `${job.match_data.breakdown.performance_score}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-900 w-10">
                          {job.match_data.breakdown.performance_score}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Match */}
                <div className="p-6 border-b border-gray-100">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      You Have ({job.match_data.matched_skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {job.match_data.matched_skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {job.match_data.missing_skills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        Nice to Have ({job.match_data.missing_skills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {job.match_data.missing_skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-6 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/jobs/${job._id}`)}
                  >
                    View Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApply(job._id)}
                    disabled={applying === job._id}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    {applying === job._id ? 'Applying...' : 'Apply Now'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
