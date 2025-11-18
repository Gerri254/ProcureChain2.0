'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Report {
  _id: string;
  procurement_id: string;
  report_type: string;
  category: string;
  title: string;
  description: string;
  anonymous: boolean;
  status: string;
  severity: string;
  created_at: string;
  updated_at: string;
}

export default function WhistleblowingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('');

  useEffect(() => {
    // Check if user has access
    if (!isAuthenticated || !['admin', 'government_official', 'auditor'].includes(user?.role || '')) {
      router.push('/');
      return;
    }
    loadReports();
  }, [isAuthenticated, user, page, filterStatus, filterSeverity]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const filters: any = {
        type: 'whistleblow' // Only whistleblowing reports
      };
      if (filterStatus) filters.status = filterStatus;

      const response = await api.getReports(page, 20, filters);
      if (response.success && response.data) {
        let filteredReports = response.data.items || [];

        // Client-side severity filter (if backend doesn't support it)
        if (filterSeverity) {
          filteredReports = filteredReports.filter((r: Report) => r.severity === filterSeverity);
        }

        setReports(filteredReports);
        setTotalPages(response.data.pages || 1);
      }
    } catch (error) {
      console.error('Failed to load whistleblowing reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'corruption':
        return '🚫';
      case 'fraud':
        return '⚠️';
      case 'irregularity':
        return '📋';
      default:
        return '📝';
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🔒</span>
            <h1 className="text-3xl font-bold text-gray-900">Whistleblowing Cases</h1>
          </div>
          <p className="mt-2 text-gray-600">
            Confidential reports requiring special attention and protection
          </p>
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Confidentiality Notice:</strong> All whistleblowing cases are treated with the highest level of confidentiality.
              Anonymous reports are protected and no identifying information is disclosed.
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity
                </label>
                <select
                  value={filterSeverity}
                  onChange={(e) => {
                    setFilterSeverity(e.target.value);
                    setPage(1);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setFilterSeverity('');
                    setFilterStatus('');
                    setPage(1);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-900">
                {reports.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {reports.filter(r => r.status === 'under_review').length}
              </div>
              <div className="text-sm text-gray-600">Under Investigation</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {reports.filter(r => r.severity === 'critical' || r.severity === 'high').length}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-600">
                {reports.filter(r => r.anonymous).length}
              </div>
              <div className="text-sm text-gray-600">Anonymous</div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-600">No whistleblowing cases found</p>
              </CardContent>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report._id} className="hover:shadow-md transition-shadow border-l-4 border-purple-500">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getCategoryIcon(report.category)}</span>
                        <Badge className="bg-purple-100 text-purple-800">
                          Whistleblowing
                        </Badge>
                        <Badge className={getSeverityColor(report.severity)}>
                          {report.severity} priority
                        </Badge>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status.replace('_', ' ')}
                        </Badge>
                        {report.anonymous && (
                          <Badge className="bg-gray-100 text-gray-600">
                            🔒 Protected Identity
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {report.title}
                      </h3>

                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {report.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="font-medium">Category: {report.category}</span>
                        <span>•</span>
                        <span>Reported: {formatDate(report.created_at)}</span>
                      </div>
                    </div>

                    <div className="ml-4">
                      <Link href={`/reports/${report._id}`}>
                        <Button size="sm" variant="danger">
                          Investigate
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
