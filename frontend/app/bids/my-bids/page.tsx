'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function MyBidsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/bids/my-bids');
      return;
    }

    if (user?.role !== 'vendor') {
      setError('Only vendors can view this page');
      setLoading(false);
      return;
    }

    fetchMyBids();
  }, [isAuthenticated, user]);

  const fetchMyBids = async () => {
    try {
      const response = await api.getMyBids();
      if (response.success && response.data) {
        setBids(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'bg-blue-100 text-blue-800',
      under_evaluation: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      awarded: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
      disqualified: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      submitted: 'Submitted',
      under_evaluation: 'Under Evaluation',
      qualified: 'Qualified',
      awarded: 'Awarded',
      rejected: 'Rejected',
      disqualified: 'Disqualified',
    };
    return texts[status] || status;
  };

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading your bids...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Bids</h1>
        <Button onClick={() => router.push('/procurement')}>
          Browse Procurements
        </Button>
      </div>

      {bids.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500 mb-4">You haven't submitted any bids yet.</p>
            <Button onClick={() => router.push('/procurement')}>
              Browse Open Procurements
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <Card key={bid._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Left Column - Procurement Info */}
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {bid.procurement_title || 'Untitled Procurement'}
                    </h3>
                    {bid.procurement_ref && (
                      <p className="text-sm text-gray-500 mb-3">
                        Ref: {bid.procurement_ref}
                      </p>
                    )}

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Bid Amount:</span>{' '}
                        <span className="text-lg font-bold text-blue-600">
                          {formatCurrency(bid.bid_amount, bid.currency)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Delivery Timeline:</span>{' '}
                        {bid.delivery_timeline || 'Not specified'}
                      </div>
                      <div>
                        <span className="font-medium">Validity:</span> {bid.bid_validity_days || 90} days
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Status & Evaluation */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="mb-3">
                        <Badge className={getStatusColor(bid.status)}>
                          {getStatusText(bid.status)}
                        </Badge>
                      </div>

                      {bid.rank && (
                        <div className="mb-2">
                          <span className="font-medium">Ranking:</span>{' '}
                          <span className="text-lg font-bold">#{bid.rank}</span>
                        </div>
                      )}

                      {bid.total_score && (
                        <div className="mb-2">
                          <span className="font-medium">Total Score:</span>{' '}
                          <span className="text-lg font-bold">{bid.total_score.toFixed(2)}</span>
                        </div>
                      )}

                      {bid.status === 'awarded' && bid.awarded_amount && (
                        <div className="bg-green-50 border border-green-200 rounded p-3 mt-3">
                          <p className="text-sm font-semibold text-green-800">
                            Awarded Amount:
                          </p>
                          <p className="text-xl font-bold text-green-600">
                            {formatCurrency(bid.awarded_amount, bid.currency)}
                          </p>
                          {bid.awarded_at && (
                            <p className="text-xs text-green-700 mt-1">
                              Awarded on {new Date(bid.awarded_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}

                      {bid.status === 'disqualified' && bid.disqualification_reason && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 mt-3">
                          <p className="text-sm font-semibold text-red-800">
                            Disqualification Reason:
                          </p>
                          <p className="text-sm text-red-700 mt-1">
                            {bid.disqualification_reason}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 text-xs text-gray-500">
                      <div>Submitted: {new Date(bid.submitted_at).toLocaleString()}</div>
                      {bid.evaluated_at && (
                        <div>Evaluated: {new Date(bid.evaluated_at).toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Evaluations (if any) */}
                {bid.evaluations && bid.evaluations.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold mb-2">Evaluations ({bid.evaluations.length})</h4>
                    <div className="space-y-2">
                      {bid.evaluations.map((evaluation: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded p-3 text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{evaluation.evaluator_name || 'Evaluator'}</span>
                            <span className="font-bold">{evaluation.total_score.toFixed(2)}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div>Technical: {evaluation.technical_score}</div>
                            <div>Financial: {evaluation.financial_score}</div>
                          </div>
                          {evaluation.comments && (
                            <p className="text-xs text-gray-700 mt-2 italic">
                              "{evaluation.comments}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Remarks */}
                {bid.remarks && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold mb-2">Your Remarks</h4>
                    <p className="text-sm text-gray-700">{bid.remarks}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
