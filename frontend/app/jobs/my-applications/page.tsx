'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  Briefcase,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Building2,
  Calendar,
} from 'lucide-react';

interface Application {
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
  job_details?: {
    title: string;
    company_name: string;
    location: string;
    employment_type: string;
    status: string;
  };
}

export default function MyApplicationsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'reviewed' | 'shortlisted'>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.user_type !== 'learner') {
      router.push('/dashboard');
      return;
    }

    fetchApplications();
  }, [isAuthenticated, user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.getMyApplications();

      if (response.success && response.data) {
        setApplications(response.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'shortlisted':
      case 'accepted':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'reviewed':
        return <Eye className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredApplications = applications.filter((app) => {
    if (activeFilter === 'all') return true;
    return app.status === activeFilter;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    reviewed: applications.filter((a) => a.status === 'reviewed').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your applications...</p>
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
                <FileText className="w-8 h-8" />
                My Applications
              </h1>
              <p className="text-gray-600 mt-1">
                Track the status of your job applications
              </p>
            </div>
            <Button onClick={() => router.push('/jobs/matched')}>
              Browse Matched Jobs
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Applications</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="text-sm text-yellow-700 mb-1">Pending</div>
              <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-blue-700 mb-1">Reviewed</div>
              <div className="text-2xl font-bold text-blue-900">{stats.reviewed}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-sm text-green-700 mb-1">Shortlisted</div>
              <div className="text-2xl font-bold text-green-900">{stats.shortlisted}</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-6">
            {(['all', 'pending', 'reviewed', 'shortlisted'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeFilter === 'all' ? 'No applications yet' : `No ${activeFilter} applications`}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeFilter === 'all'
                ? 'Start applying to jobs that match your verified skills'
                : `You don't have any ${activeFilter} applications at the moment`}
            </p>
            {activeFilter === 'all' && (
              <Button onClick={() => router.push('/jobs/matched')}>
                Browse Matched Jobs
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">
                          {app.job_details?.company_name || 'Company'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {app.job_details?.title || 'Job Title'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {app.job_details?.location || 'Location not specified'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {app.job_details?.employment_type || 'Employment type not specified'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Applied {formatDate(app.applied_at)}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`flex-shrink-0 ml-4 px-4 py-2 rounded-lg border ${getStatusColor(
                        app.status
                      )}`}
                    >
                      <div className="flex items-center gap-2">
                        {getStatusIcon(app.status)}
                        <span className="font-medium capitalize">{app.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="text-sm text-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium">Applied:</span>
                        <span>{formatDate(app.applied_at)}</span>
                      </div>
                      {app.reviewed_at && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-medium">Reviewed:</span>
                          <span>{formatDate(app.reviewed_at)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="font-medium">Last Updated:</span>
                        <span>{formatDate(app.updated_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter Preview */}
                  {app.cover_letter && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Cover Letter</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{app.cover_letter}</p>
                    </div>
                  )}

                  {/* Employer Notes */}
                  {app.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">
                        Employer Feedback
                      </h4>
                      <p className="text-sm text-blue-800">{app.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/jobs/${app.job_id}`)}
                    >
                      View Job Details
                    </Button>
                    {app.job_details?.status === 'active' && app.status === 'pending' && (
                      <span className="text-xs text-green-600 font-medium">
                        ✓ Job is still accepting applications
                      </span>
                    )}
                    {app.job_details?.status === 'closed' && (
                      <span className="text-xs text-gray-500 font-medium">
                        Job posting closed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
