'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';

export default function EvaluateBidsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const procurementId = params.id as string;

  const [procurement, setProcurement] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Evaluation modal state
  const [evaluatingBid, setEvaluatingBid] = useState<any>(null);
  const [evaluationData, setEvaluationData] = useState({
    technical_score: '',
    financial_score: '',
    comments: '',
  });

  // Award modal state
  const [awardingBid, setAwardingBid] = useState<any>(null);
  const [awardData, setAwardData] = useState({
    awarded_amount: '',
    notes: '',
  });

  // Disqualify modal state
  const [disqualifyingBid, setDisqualifyingBid] = useState<any>(null);
  const [disqualifyReason, setDisqualifyReason] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/bids/evaluate/' + procurementId);
      return;
    }

    if (!['admin', 'procurement_officer'].includes(user?.role || '')) {
      setError('Only procurement officers can evaluate bids');
      setLoading(false);
      return;
    }

    fetchData();
  }, [isAuthenticated, user, procurementId]);

  const fetchData = async () => {
    try {
      const [procResponse, bidsResponse, statsResponse] = await Promise.all([
        api.getProcurementById(procurementId),
        api.getProcurementBids(procurementId, false),
        api.getBidStatistics(procurementId),
      ]);

      if (procResponse.success && procResponse.data) {
        setProcurement(procResponse.data);
      }

      if (bidsResponse.success && bidsResponse.data) {
        setBids(bidsResponse.data);
      }

      if (statsResponse.success && statsResponse.data) {
        setStatistics(statsResponse.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!evaluatingBid) return;

    try {
      const evaluation = {
        technical_score: parseFloat(evaluationData.technical_score),
        financial_score: parseFloat(evaluationData.financial_score),
        comments: evaluationData.comments,
      };

      const response = await api.evaluateBid(evaluatingBid._id, evaluation);

      if (response.success) {
        alert('Bid evaluated successfully!');
        setEvaluatingBid(null);
        setEvaluationData({ technical_score: '', financial_score: '', comments: '' });
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to evaluate bid');
    }
  };

  const handleCalculateScores = async () => {
    try {
      const response = await api.calculateBidScores(procurementId);

      if (response.success) {
        alert('Scores calculated and rankings updated successfully!');
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to calculate scores');
    }
  };

  const handleAward = async () => {
    if (!awardingBid) return;

    try {
      const award = {
        awarded_amount: awardData.awarded_amount ? parseFloat(awardData.awarded_amount) : undefined,
        notes: awardData.notes,
      };

      const response = await api.awardBid(awardingBid._id, award);

      if (response.success) {
        alert('Bid awarded successfully!');
        setAwardingBid(null);
        setAwardData({ awarded_amount: '', notes: '' });
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to award bid');
    }
  };

  const handleDisqualify = async () => {
    if (!disqualifyingBid) return;

    try {
      const response = await api.disqualifyBid(disqualifyingBid._id, disqualifyReason);

      if (response.success) {
        alert('Bid disqualified successfully!');
        setDisqualifyingBid(null);
        setDisqualifyReason('');
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to disqualify bid');
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

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading bids...</div>
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Bid Evaluation</h1>
        <p className="text-gray-600">{procurement?.title}</p>
        <p className="text-sm text-gray-500">Ref: {procurement?.reference_number}</p>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{statistics.total_bids}</div>
              <div className="text-sm text-gray-500">Total Bids</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{statistics.qualified_bids}</div>
              <div className="text-sm text-gray-500">Qualified</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {formatCurrency(statistics.lowest_bid || 0, procurement?.currency)}
              </div>
              <div className="text-sm text-gray-500">Lowest Bid</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {formatCurrency(statistics.average_bid_amount || 0, procurement?.currency)}
              </div>
              <div className="text-sm text-gray-500">Average Bid</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="mb-6">
        <Button onClick={handleCalculateScores} className="bg-green-600 hover:bg-green-700">
          Calculate Final Scores & Rankings
        </Button>
      </div>

      {/* Bids List */}
      <div className="space-y-4">
        {bids.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              No bids submitted yet for this procurement.
            </CardContent>
          </Card>
        ) : (
          bids.map((bid) => (
            <Card key={bid._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{bid.vendor_name || 'Unknown Vendor'}</h3>
                    {bid.vendor_email && (
                      <p className="text-sm text-gray-500">{bid.vendor_email}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(bid.status)}>
                      {bid.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    {bid.rank && (
                      <div className="mt-2 text-2xl font-bold text-blue-600">
                        Rank #{bid.rank}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-500">Bid Amount</span>
                    <div className="text-xl font-bold text-blue-600">
                      {formatCurrency(bid.bid_amount, bid.currency)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Delivery Timeline</span>
                    <div className="font-medium">{bid.delivery_timeline || 'Not specified'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Submitted</span>
                    <div className="font-medium">
                      {new Date(bid.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {bid.total_score && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                    <div className="text-lg font-bold">Total Score: {bid.total_score.toFixed(2)}</div>
                  </div>
                )}

                {/* Evaluations */}
                {bid.evaluations && bid.evaluations.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Evaluations ({bid.evaluations.length})</h4>
                    <div className="space-y-2">
                      {bid.evaluations.map((evaluation: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded p-3 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{evaluation.evaluator_name}</span>
                            <span className="font-bold">{evaluation.total_score.toFixed(2)}</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            Technical: {evaluation.technical_score} | Financial: {evaluation.financial_score}
                          </div>
                          {evaluation.comments && (
                            <p className="text-xs mt-1 italic">"{evaluation.comments}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {['submitted', 'under_evaluation'].includes(bid.status) && (
                    <Button
                      size="sm"
                      onClick={() => setEvaluatingBid(bid)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Evaluate
                    </Button>
                  )}

                  {bid.status === 'qualified' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setAwardingBid(bid);
                        setAwardData({ awarded_amount: bid.bid_amount.toString(), notes: '' });
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Award Bid
                    </Button>
                  )}

                  {!['awarded', 'rejected', 'disqualified'].includes(bid.status) && (
                    <Button
                      size="sm"
                      
                      onClick={() => setDisqualifyingBid(bid)}
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      Disqualify
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Evaluation Modal */}
      {evaluatingBid && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Evaluate Bid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">{evaluatingBid.vendor_name}</p>
                  <p className="text-sm text-gray-500">
                    Bid Amount: {formatCurrency(evaluatingBid.bid_amount, evaluatingBid.currency)}
                  </p>
                </div>

                <div>
                  <Label htmlFor="technical_score">Technical Score (0-100)</Label>
                  <Input
                    id="technical_score"
                    type="number"
                    min="0"
                    max="100"
                    value={evaluationData.technical_score}
                    onChange={(e) =>
                      setEvaluationData((prev) => ({ ...prev, technical_score: e.target.value }))
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="financial_score">Financial Score (0-100)</Label>
                  <Input
                    id="financial_score"
                    type="number"
                    min="0"
                    max="100"
                    value={evaluationData.financial_score}
                    onChange={(e) =>
                      setEvaluationData((prev) => ({ ...prev, financial_score: e.target.value }))
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="comments">Comments</Label>
                  <Textarea
                    id="comments"
                    value={evaluationData.comments}
                    onChange={(e) =>
                      setEvaluationData((prev) => ({ ...prev, comments: e.target.value }))
                    }
                    rows={3}
                    placeholder="Your evaluation comments..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button  onClick={() => setEvaluatingBid(null)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleEvaluate} className="flex-1">
                    Submit Evaluation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Award Modal */}
      {awardingBid && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Award Bid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="font-semibold text-green-800">{awardingBid.vendor_name}</p>
                  <p className="text-sm text-green-700">
                    Bid Amount: {formatCurrency(awardingBid.bid_amount, awardingBid.currency)}
                  </p>
                  {awardingBid.rank && (
                    <p className="text-sm text-green-700">Rank: #{awardingBid.rank}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="awarded_amount">
                    Final Awarded Amount (optional - defaults to bid amount)
                  </Label>
                  <Input
                    id="awarded_amount"
                    type="number"
                    step="0.01"
                    value={awardData.awarded_amount}
                    onChange={(e) =>
                      setAwardData((prev) => ({ ...prev, awarded_amount: e.target.value }))
                    }
                    placeholder={awardingBid.bid_amount.toString()}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Award Notes</Label>
                  <Textarea
                    id="notes"
                    value={awardData.notes}
                    onChange={(e) => setAwardData((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    placeholder="Any notes about the award decision..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button  onClick={() => setAwardingBid(null)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleAward} className="flex-1 bg-green-600 hover:bg-green-700">
                    Confirm Award
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Disqualify Modal */}
      {disqualifyingBid && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Disqualify Bid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="font-semibold text-red-800">{disqualifyingBid.vendor_name}</p>
                  <p className="text-sm text-red-700">
                    Bid Amount: {formatCurrency(disqualifyingBid.bid_amount, disqualifyingBid.currency)}
                  </p>
                </div>

                <div>
                  <Label htmlFor="disqualify_reason">
                    Disqualification Reason <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="disqualify_reason"
                    value={disqualifyReason}
                    onChange={(e) => setDisqualifyReason(e.target.value)}
                    rows={4}
                    placeholder="Provide a detailed reason for disqualification (minimum 10 characters)..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{disqualifyReason.length} characters</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    
                    onClick={() => {
                      setDisqualifyingBid(null);
                      setDisqualifyReason('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDisqualify}
                    disabled={disqualifyReason.length < 10}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Disqualify
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
