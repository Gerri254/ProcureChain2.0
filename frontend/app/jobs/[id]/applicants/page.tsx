'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { SkillBadgeGroup } from '@/components/ui/SkillBadge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Award,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  Clock,
} from 'lucide-react';

interface Applicant {
  _id: string;
  job_id: string;
  user_id: string;
  applicant_name: string;
  applicant_email: string;
  cover_letter: string;
  status: string;
  applied_at: string;
  updated_at: string;
  reviewed_at?: string;
  notes?: string;
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
  applicant_profile?: {
    bio?: string;
    location?: string;
    experience_level?: string;
    portfolio_url?: string;
    github_url?: string;
    linkedin_url?: string;
  };
}

interface JobDetails {
  _id: string;
  title: string;
  company_name: string;
  required_skills: string[];
  status: string;
}

export default function ApplicantsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobDetails | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedApplicant, setExpandedApplicant] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.user_type !== 'employer') {
      router.push('/dashboard');
      return;
    }

    fetchApplicants();
  }, [isAuthenticated, user, jobId]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const response = await api.getJobApplications(jobId);

      if (response.success && response.data) {
        setJob(response.data.job);
        setApplicants(response.data.applicants);
      }
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string, notes?: string) => {
    try {
      setUpdatingStatus(applicationId);
      const response = await api.updateApplicationStatus(applicationId, {
        status: newStatus,
        notes,
      });

      if (response.success) {
        await fetchApplicants();
        toast.success('Status Updated!', `Application marked as ${newStatus}`);
      } else {
        toast.error('Update Failed', response.error || 'Failed to update status');
      }
    } catch (error: any) {
      toast.error('Update Failed', error.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
      shortlisted: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const stats = {
    total: applicants.length,
    pending: applicants.filter((a) => a.status === 'pending').length,
    reviewed: applicants.filter((a) => a.status === 'reviewed').length,
    shortlisted: applicants.filter((a) => a.status === 'shortlisted').length,
    highMatch: applicants.filter((a) => a.match_data.match_score >= 80).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applicants...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job not found</h2>
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-yellow-500" />
                Applicant Rankings
              </h1>
              <p className="text-gray-600 mt-1">
                {job.title} at {job.company_name}
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push('/admin/job-postings')}>
              Back to Job Postings
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Applicants</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-sm text-green-700 mb-1">High Match (80%+)</div>
              <div className="text-2xl font-bold text-green-900">{stats.highMatch}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="text-sm text-yellow-700 mb-1">Pending</div>
              <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-blue-700 mb-1">Reviewed</div>
              <div className="text-2xl font-bold text-blue-900">{stats.reviewed}</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <div className="text-sm text-emerald-700 mb-1">Shortlisted</div>
              <div className="text-2xl font-bold text-emerald-900">{stats.shortlisted}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {applicants.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No applicants yet</h3>
            <p className="text-gray-600">
              Applications will appear here when learners apply to this job posting.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.map((applicant, index) => (
              <div
                key={applicant._id}
                className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
              >
                {/* Applicant Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Rank Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          <span className="text-lg font-bold text-gray-700">#{index + 1}</span>
                        </div>
                      </div>

                      {/* Applicant Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {applicant.applicant_name}
                          </h3>
                          <div
                            className={`px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(
                              applicant.status
                            )}`}
                          >
                            {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {applicant.applicant_email}
                          </div>
                          {applicant.applicant_profile?.experience_level && (
                            <div className="flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              {applicant.applicant_profile.experience_level}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Applied {formatDate(applicant.applied_at)}
                          </div>
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <div
                        className={`flex-shrink-0 px-4 py-2 rounded-lg border ${getMatchColor(
                          applicant.match_data.match_score
                        )}`}
                      >
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          <div>
                            <div className="text-2xl font-bold">
                              {applicant.match_data.match_score}%
                            </div>
                            <div className="text-xs">Match</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expand Button */}
                    <button
                      onClick={() =>
                        setExpandedApplicant(
                          expandedApplicant === applicant._id ? null : applicant._id
                        )
                      }
                      className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {expandedApplicant === applicant._id ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Match Breakdown - Always Visible */}
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Match Breakdown</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Skills Match</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getMatchBadgeColor(
                              applicant.match_data.breakdown.skill_match
                            )}`}
                            style={{ width: `${applicant.match_data.breakdown.skill_match}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-900 w-10">
                          {applicant.match_data.breakdown.skill_match}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Experience</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getMatchBadgeColor(
                              applicant.match_data.breakdown.experience_match
                            )}`}
                            style={{ width: `${applicant.match_data.breakdown.experience_match}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-900 w-10">
                          {applicant.match_data.breakdown.experience_match}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Skill Freshness</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getMatchBadgeColor(
                              applicant.match_data.breakdown.freshness_score
                            )}`}
                            style={{ width: `${applicant.match_data.breakdown.freshness_score}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-900 w-10">
                          {applicant.match_data.breakdown.freshness_score}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Performance</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getMatchBadgeColor(
                              applicant.match_data.breakdown.performance_score
                            )}`}
                            style={{
                              width: `${applicant.match_data.breakdown.performance_score}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-900 w-10">
                          {applicant.match_data.breakdown.performance_score}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Match Preview */}
                <div className="p-6 border-b border-gray-100">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Has Skills ({applicant.match_data.matched_skills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {applicant.match_data.matched_skills.slice(0, 5).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200"
                          >
                            {skill}
                          </span>
                        ))}
                        {applicant.match_data.matched_skills.length > 5 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            +{applicant.match_data.matched_skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>

                    {applicant.match_data.missing_skills.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          Missing Skills ({applicant.match_data.missing_skills.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {applicant.match_data.missing_skills.slice(0, 5).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-200"
                            >
                              {skill}
                            </span>
                          ))}
                          {applicant.match_data.missing_skills.length > 5 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                              +{applicant.match_data.missing_skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedApplicant === applicant._id && (
                  <>
                    {/* Bio and Profile */}
                    {applicant.applicant_profile && (
                      <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                          Applicant Profile
                        </h4>
                        {applicant.applicant_profile.bio && (
                          <p className="text-sm text-gray-700 mb-4">
                            {applicant.applicant_profile.bio}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3">
                          {applicant.applicant_profile.portfolio_url && (
                            <a
                              href={applicant.applicant_profile.portfolio_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Portfolio
                            </a>
                          )}
                          {applicant.applicant_profile.github_url && (
                            <a
                              href={applicant.applicant_profile.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              GitHub
                            </a>
                          )}
                          {applicant.applicant_profile.linkedin_url && (
                            <a
                              href={applicant.applicant_profile.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              LinkedIn
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cover Letter */}
                    {applicant.cover_letter && (
                      <div className="p-6 border-b border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Cover Letter
                        </h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {applicant.cover_letter}
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    {applicant.notes && (
                      <div className="p-6 border-b border-gray-100 bg-blue-50">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">Your Notes</h4>
                        <p className="text-sm text-blue-800">{applicant.notes}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Actions */}
                <div className="p-6 flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/talent/${applicant.user_id}`)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Full Profile
                  </Button>

                  {applicant.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(applicant._id, 'reviewed')}
                        disabled={updatingStatus === applicant._id}
                      >
                        Mark as Reviewed
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(applicant._id, 'shortlisted')}
                        disabled={updatingStatus === applicant._id}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        Shortlist
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(applicant._id, 'rejected')}
                        disabled={updatingStatus === applicant._id}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {applicant.status === 'reviewed' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(applicant._id, 'shortlisted')}
                        disabled={updatingStatus === applicant._id}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        Shortlist
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(applicant._id, 'rejected')}
                        disabled={updatingStatus === applicant._id}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {applicant.status === 'shortlisted' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(applicant._id, 'accepted')}
                      disabled={updatingStatus === applicant._id}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Accept
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
