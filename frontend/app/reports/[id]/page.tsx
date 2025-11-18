'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

interface Report {
  _id: string;
  procurement_id: string;
  reporter_id: string | null;
  report_type: string;
  category: string;
  title: string;
  description: string;
  evidence: string[];
  anonymous: boolean;
  status: string;
  severity: string;
  assigned_to: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Form states
  const [newStatus, setNewStatus] = useState('');
  const [newSeverity, setNewSeverity] = useState('');
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    // Check if user has access
    if (!isAuthenticated || !['admin', 'government_official', 'auditor'].includes(user?.role || '')) {
      router.push('/');
      return;
    }

    if (params.id) {
      loadReport();
    }
  }, [isAuthenticated, user, params.id]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await api.getReport(params.id as string);
      if (response.success && response.data) {
        setReport(response.data);
        setNewStatus(response.data.status);
        setNewSeverity(response.data.severity);
        setResolution(response.data.resolution || '');
      }
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!report) return;

    try {
      setUpdating(true);
      const updateData: any = {
        status: newStatus,
        severity: newSeverity
      };

      if (newStatus === 'resolved' && resolution.trim()) {
        updateData.resolution = resolution.trim();
      }

      const response = await api.updateReportStatus(report._id, updateData);
      if (response.success) {
        alert('Report updated successfully');
        loadReport();
      }
    } catch (error) {
      console.error('Failed to update report:', error);
      alert('Failed to update report. Please try again.');
    } finally {
      setUpdating(false);
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'whistleblow':
        return 'bg-purple-100 text-purple-800';
      case 'issue':
        return 'bg-blue-100 text-blue-800';
      case 'complaint':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-4">Report not found</p>
            <Link href="/reports">
              <Button>Back to Reports</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/reports">
          <Button variant="ghost" className="mb-6">
            ← Back to Reports
          </Button>
        </Link>

        {/* Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getTypeColor(report.report_type)}>
                    {report.report_type === 'whistleblow' ? 'Whistleblowing' : report.report_type}
                  </Badge>
                  <Badge className={getSeverityColor(report.severity)}>
                    {report.severity} severity
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

                <h1 className="text-3xl font-bold text-gray-900 mb-2">{report.title}</h1>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Category: <strong>{report.category}</strong></span>
                  <span>•</span>
                  <span>Submitted: {formatDate(report.created_at)}</span>
                  {report.resolved_at && (
                    <>
                      <span>•</span>
                      <span>Resolved: {formatDate(report.resolved_at)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {report.report_type === 'whistleblow' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Whistleblower Protection:</strong> This is a confidential report. Handle with care and maintain anonymity protection.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Report Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{report.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Evidence */}
            {report.evidence && report.evidence.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Evidence & Supporting Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {report.evidence.map((item, idx) => (
                      <li key={idx} className="text-gray-700">
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Resolution */}
            {report.resolution && (
              <Card>
                <CardHeader>
                  <CardTitle>Resolution</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{report.resolution}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Admin Actions */}
          <div className="space-y-6">
            {/* Update Status */}
            {(user?.role === 'admin' || user?.role === 'government_official') && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                  </div>

                  {/* Severity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Severity
                    </label>
                    <select
                      value={newSeverity}
                      onChange={(e) => setNewSeverity(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  {/* Resolution Notes */}
                  {newStatus === 'resolved' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resolution Notes
                      </label>
                      <Textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        placeholder="Describe how this issue was resolved..."
                        rows={4}
                        className="w-full"
                      />
                    </div>
                  )}

                  {/* Update Button */}
                  <Button
                    onClick={handleUpdateStatus}
                    disabled={updating}
                    className="w-full"
                  >
                    {updating ? 'Updating...' : 'Update Report'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Report Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Report Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Report ID</div>
                  <div className="text-sm font-mono text-gray-900">{report._id}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Procurement ID</div>
                  <div className="text-sm font-mono text-gray-900">
                    <Link href={`/procurements/${report.procurement_id}`} className="text-blue-600 hover:underline">
                      {report.procurement_id}
                    </Link>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Reporter</div>
                  <div className="text-sm text-gray-900">
                    {report.anonymous ? (
                      <span className="italic">Anonymous (Protected)</span>
                    ) : report.reporter_id ? (
                      <span className="font-mono">{report.reporter_id}</span>
                    ) : (
                      <span className="italic">Not Available</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Created</div>
                  <div className="text-sm text-gray-900">{formatDate(report.created_at)}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Last Updated</div>
                  <div className="text-sm text-gray-900">{formatDate(report.updated_at)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/procurements/${report.procurement_id}`}>
                  <Button variant="outline" className="w-full">
                    View Procurement
                  </Button>
                </Link>
                <Link href="/reports">
                  <Button variant="outline" className="w-full">
                    All Reports
                  </Button>
                </Link>
                {report.report_type === 'whistleblow' && (
                  <Link href="/reports/whistleblowing">
                    <Button variant="outline" className="w-full">
                      Whistleblowing Cases
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
