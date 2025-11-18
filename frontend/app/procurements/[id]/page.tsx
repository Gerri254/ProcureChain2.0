'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor, getCategoryLabel, getCategoryColor } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { ReportModal } from '@/components/procurement/ReportModal';
import { CommentsSection } from '@/components/procurement/CommentsSection';
import { EventTimeline } from '@/components/procurement/EventTimeline';
import type { Procurement } from '@/types';

export default function ProcurementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [procurement, setProcurement] = useState<Procurement | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [awardedVendorId, setAwardedVendorId] = useState('');
  const [awardedAmount, setAwardedAmount] = useState('');

  useEffect(() => {
    if (params.id) {
      loadProcurement();
    }
  }, [params.id]);

  useEffect(() => {
    if (procurement) {
      setNewStatus(procurement.status);
      setAwardedVendorId(procurement.awarded_vendor_id || '');
      setAwardedAmount(procurement.awarded_value?.toString() || '');
    }
  }, [procurement]);

  const loadProcurement = async () => {
    try {
      const response = await api.getProcurementById(params.id as string, false);
      if (response.success && response.data) {
        setProcurement(response.data);
      }
    } catch (error) {
      console.error('Failed to load procurement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!procurement) return;

    try {
      setUpdating(true);

      const updateData: any = {
        status: newStatus
      };

      // If awarding, include vendor and amount
      if (newStatus === 'awarded' && awardedVendorId && awardedAmount) {
        updateData.awarded_vendor_id = awardedVendorId;
        updateData.awarded_amount = parseFloat(awardedAmount);
        updateData.awarded_date = new Date().toISOString();
      }

      // If publishing, set published_date
      if (newStatus === 'published' && procurement.status !== 'published') {
        updateData.published_date = new Date().toISOString();
      }

      const response = await api.updateProcurement(procurement._id, updateData);

      if (response.success) {
        alert('Procurement updated successfully');
        loadProcurement();
        setShowManagement(false);
      } else {
        alert('Failed to update procurement: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to update procurement:', error);
      alert('Failed to update procurement. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!procurement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-4">Procurement not found</p>
            <Link href="/procurements">
              <Button>Back to Procurements</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/procurements">
          <Button variant="ghost" className="mb-6">
            ← Back to Procurements
          </Button>
        </Link>

        <div className="grid gap-6">
          {/* Header Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getCategoryColor(procurement.category)}>
                      {getCategoryLabel(procurement.category)}
                    </Badge>
                    <Badge className={getStatusColor(procurement.status)}>
                      {procurement.status}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold">{procurement.title}</h1>
                  <p className="text-gray-600 mt-1">{procurement.tender_number}</p>
                </div>
              </div>

              {/* Action Buttons */}
              {isAuthenticated && (
                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
                  {/* Vendor Actions */}
                  {user?.role === 'vendor' && procurement.status === 'published' && (
                    <>
                      <Link href={`/bids/submit/${procurement._id}`}>
                        <Button>
                          Submit Bid
                        </Button>
                      </Link>
                      <Button variant="secondary" onClick={() => router.push(`/bids/my-bids`)}>
                        View My Bids
                      </Button>
                    </>
                  )}

                  {/* Admin/Official Actions */}
                  {(user?.role === 'admin' || user?.role === 'government_official') && (
                    <>
                      <Button
                        variant="primary"
                        onClick={() => setShowManagement(!showManagement)}
                      >
                        {showManagement ? 'Hide' : 'Manage'} Procurement
                      </Button>
                      {procurement.status === 'evaluation' && (
                        <Link href={`/bids/evaluate/${procurement._id}`}>
                          <Button>
                            Evaluate Bids
                          </Button>
                        </Link>
                      )}
                      <Link href={`/compare?procurement=${procurement._id}`}>
                        <Button variant="secondary">
                          Compare Bids
                        </Button>
                      </Link>
                    </>
                  )}

                  {/* Report - Available to all authenticated users */}
                  <Button
                    variant="danger"
                    onClick={() => setShowReportModal(true)}
                  >
                    🚨 Report Issue / Whistleblow
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Procurement Management Panel */}
          {showManagement && (user?.role === 'admin' || user?.role === 'government_official') && (
            <Card className="border-blue-500">
              <CardHeader>
                <CardTitle>Procurement Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="evaluation">Evaluation</option>
                      <option value="awarded">Awarded</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {newStatus === 'awarded' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Awarded Vendor ID
                        </label>
                        <input
                          type="text"
                          value={awardedVendorId}
                          onChange={(e) => setAwardedVendorId(e.target.value)}
                          placeholder="Enter vendor ID"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Awarded Amount
                        </label>
                        <input
                          type="number"
                          value={awardedAmount}
                          onChange={(e) => setAwardedAmount(e.target.value)}
                          placeholder="Enter awarded amount"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleStatusUpdate}
                      disabled={updating || !newStatus}
                    >
                      {updating ? 'Updating...' : 'Update Procurement'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowManagement(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Procurement Event Timeline */}
          <EventTimeline procurementId={procurement._id} />

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Category" value={procurement.category} />
                <InfoRow label="Department" value={procurement.department} />
                <InfoRow
                  label="Estimated Value"
                  value={formatCurrency(procurement.estimated_value, procurement.currency)}
                />
                {procurement.awarded_value && (
                  <InfoRow
                    label="Awarded Value"
                    value={formatCurrency(procurement.awarded_value, procurement.currency)}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{procurement.description}</p>
            </CardContent>
          </Card>

          {/* AI Metadata */}
          {procurement.ai_metadata && (
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {procurement.ai_metadata.summary && (
                  <div>
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p className="text-gray-700">{procurement.ai_metadata.summary}</p>
                  </div>
                )}

                {procurement.ai_metadata.key_requirements && (
                  <div>
                    <h4 className="font-medium mb-2">Key Requirements</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {procurement.ai_metadata.key_requirements.map((req, idx) => (
                        <li key={idx} className="text-gray-700">
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {procurement.ai_metadata.risk_level && (
                  <div>
                    <h4 className="font-medium mb-2">Risk Assessment</h4>
                    <Badge className={getStatusColor(procurement.ai_metadata.risk_level)}>
                      {procurement.ai_metadata.risk_level} risk
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle>Discussion & Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <CommentsSection procurementId={procurement._id} />
            </CardContent>
          </Card>
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <ReportModal
            procurementId={procurement._id}
            procurementTitle={procurement.title}
            onClose={() => setShowReportModal(false)}
            onSuccess={() => {
              alert('Report submitted successfully. Thank you for helping maintain transparency.');
            }}
          />
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
