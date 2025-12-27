'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { api } from '@/lib/api';

interface JobPosting {
  _id: string;
  title: string;
  company_name: string;
  location: string;
  location_type: string;
  employment_type: string;
  status: 'draft' | 'active' | 'closed' | 'expired';
  skills_required: string[];
  views_count: number;
  applications_count: number;
  posted_at: string;
  expires_at: string;
  is_expired: boolean;
  days_until_expiry: number;
}

export default function MyJobPostingsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!isAuthenticated || user?.user_type !== 'employer') {
      router.push('/');
      return;
    }

    loadJobs();
    loadStats();
  }, [isAuthenticated, user]);

  const loadJobs = async (status?: string) => {
    try {
      setLoading(true);
      const response = await api.getMyJobPostings({ status: status === 'all' ? undefined : status });

      if (response.success && response.data) {
        setJobs(response.data.job_postings || []);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.getJobPostingStats();
      if (response.success && response.data) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    loadJobs(newFilter);
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to close this job posting?')) {
      return;
    }

    try {
      await api.deleteJobPosting(jobId);
      loadJobs(filter);
      loadStats();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to close job posting');
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      await api.updateJobPosting(jobId, { status: newStatus });
      loadJobs(filter);
      loadStats();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update job status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Active</span>;
      case 'draft':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">Draft</span>;
      case 'closed':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Closed</span>;
      case 'expired':
        return <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">Expired</span>;
      default:
        return null;
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading your job postings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Job Postings</h1>
            <p className="text-gray-600">Manage your job listings and track applications</p>
          </div>
          <Link href="/jobs/create">
            <Button size="lg">+ Post New Job</Button>
          </Link>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-3xl font-bold text-black">{stats.total_jobs}</div>
              <div className="text-gray-600">Total Jobs</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-3xl font-bold text-green-600">{stats.active_jobs}</div>
              <div className="text-gray-600">Active</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-3xl font-bold text-blue-600">{stats.total_views}</div>
              <div className="text-gray-600">Total Views</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-3xl font-bold text-purple-600">{stats.total_applications}</div>
              <div className="text-gray-600">Applications</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({stats?.total_jobs || 0})
            </button>
            <button
              onClick={() => handleFilterChange('active')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'active' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({stats?.active_jobs || 0})
            </button>
            <button
              onClick={() => handleFilterChange('draft')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'draft' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Drafts ({stats?.draft_jobs || 0})
            </button>
            <button
              onClick={() => handleFilterChange('closed')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'closed' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Closed ({stats?.closed_jobs || 0})
            </button>
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold mb-2">No Job Postings Yet</h2>
            <p className="text-gray-600 mb-6">
              Start hiring verified talent by posting your first job
            </p>
            <Link href="/jobs/create">
              <Button size="lg">Post Your First Job</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{job.title}</h3>
                      {getStatusBadge(job.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {job.company_name && <span>{job.company_name}</span>}
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {job.location}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs capitalize">
                        {job.location_type}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs capitalize">
                        {job.employment_type}
                      </span>
                    </div>
                  </div>

                  {/* Actions Dropdown */}
                  <div className="flex gap-2">
                    <Link href={`/jobs/${job._id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                    {job.status === 'draft' && (
                      <Button size="sm" onClick={() => handleStatusChange(job._id, 'active')}>
                        Publish
                      </Button>
                    )}
                    {job.status === 'active' && (
                      <Button variant="outline" size="sm" onClick={() => handleDelete(job._id)}>
                        Close
                      </Button>
                    )}
                    {job.status === 'closed' && (
                      <Button size="sm" onClick={() => handleStatusChange(job._id, 'active')}>
                        Reopen
                      </Button>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {job.skills_required && job.skills_required.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {job.skills_required.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-black text-white rounded-full text-sm">
                        {skill.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{job.views_count}</div>
                    <div className="text-sm text-gray-600">Views</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{job.applications_count}</div>
                    <div className="text-sm text-gray-600">Applications</div>
                  </div>
                  <div>
                    {job.is_expired ? (
                      <>
                        <div className="text-sm font-medium text-red-600">Expired</div>
                        <div className="text-xs text-gray-500">
                          {new Date(job.expires_at).toLocaleDateString()}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm font-medium text-green-600">
                          {job.days_until_expiry} days left
                        </div>
                        <div className="text-xs text-gray-500">
                          Expires {new Date(job.expires_at).toLocaleDateString()}
                        </div>
                      </>
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
