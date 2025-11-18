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

export default function SubmitBidPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const procurementId = params.id as string;

  const [procurement, setProcurement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    bid_amount: '',
    currency: 'KES',
    delivery_timeline: '',
    bid_validity_days: '90',
    remarks: '',
    bid_bond_amount: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/bids/submit/' + procurementId);
      return;
    }

    if (user?.role !== 'vendor') {
      setError('Only vendors can submit bids');
      setLoading(false);
      return;
    }

    fetchProcurement();
  }, [isAuthenticated, user, procurementId]);

  const fetchProcurement = async () => {
    try {
      const response = await api.getProcurementById(procurementId);
      if (response.success && response.data) {
        setProcurement(response.data);

        // Check if procurement is open for bidding
        if (!['published', 'open'].includes(response.data.status)) {
          setError('This procurement is not open for bidding');
        }

        // Check if deadline has passed
        if (response.data.submission_deadline) {
          const deadline = new Date(response.data.submission_deadline);
          if (deadline < new Date()) {
            setError('The bid submission deadline has passed');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load procurement details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const bidData = {
        bid_amount: parseFloat(formData.bid_amount),
        currency: formData.currency,
        delivery_timeline: formData.delivery_timeline,
        bid_validity_days: parseInt(formData.bid_validity_days),
        remarks: formData.remarks,
        bid_bond_amount: formData.bid_bond_amount ? parseFloat(formData.bid_bond_amount) : undefined,
      };

      const response = await api.submitBid(procurementId, bidData);

      if (response.success) {
        alert('Bid submitted successfully!');
        router.push('/bids/my-bids');
      } else {
        setError(response.error || 'Failed to submit bid');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit bid');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading procurement details...</div>
      </div>
    );
  }

  if (error && !procurement) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
            <Button onClick={() => router.push('/procurement')} className="mt-4">
              Back to Procurements
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Submit Bid</h1>

        {/* Procurement Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Procurement Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Title:</span> {procurement?.title}
              </div>
              <div>
                <span className="font-semibold">Reference:</span> {procurement?.reference_number}
              </div>
              <div>
                <span className="font-semibold">Category:</span> {procurement?.category}
              </div>
              <div>
                <span className="font-semibold">Estimated Value:</span> {procurement?.currency} {procurement?.estimated_value?.toLocaleString()}
              </div>
              {procurement?.submission_deadline && (
                <div>
                  <span className="font-semibold">Deadline:</span>{' '}
                  {new Date(procurement.submission_deadline).toLocaleString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bid Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle>Bid Information</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bid Amount */}
              <div>
                <Label htmlFor="bid_amount">
                  Bid Amount <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 mt-1">
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="border rounded px-3 py-2 w-24"
                  >
                    <option value="KES">KES</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                  <Input
                    id="bid_amount"
                    name="bid_amount"
                    type="number"
                    step="0.01"
                    value={formData.bid_amount}
                    onChange={handleChange}
                    required
                    placeholder="Enter your bid amount"
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Estimated value: {procurement?.currency} {procurement?.estimated_value?.toLocaleString()}
                </p>
              </div>

              {/* Delivery Timeline */}
              <div>
                <Label htmlFor="delivery_timeline">
                  Delivery Timeline <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="delivery_timeline"
                  name="delivery_timeline"
                  type="text"
                  value={formData.delivery_timeline}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 60 days, 3 months"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Specify how long it will take to deliver the goods/services
                </p>
              </div>

              {/* Bid Validity */}
              <div>
                <Label htmlFor="bid_validity_days">
                  Bid Validity (Days) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bid_validity_days"
                  name="bid_validity_days"
                  type="number"
                  value={formData.bid_validity_days}
                  onChange={handleChange}
                  required
                  placeholder="90"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Number of days your bid remains valid (typically 90 days)
                </p>
              </div>

              {/* Bid Bond Amount */}
              <div>
                <Label htmlFor="bid_bond_amount">Bid Bond Amount (Optional)</Label>
                <Input
                  id="bid_bond_amount"
                  name="bid_bond_amount"
                  type="number"
                  step="0.01"
                  value={formData.bid_bond_amount}
                  onChange={handleChange}
                  placeholder="Enter bid bond amount if applicable"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Typically 1-2% of bid amount
                </p>
              </div>

              {/* Remarks */}
              <div>
                <Label htmlFor="remarks">Additional Remarks</Label>
                <Textarea
                  id="remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Any additional information about your bid..."
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.remarks.length} characters
                </p>
              </div>

              {/* Important Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Important Notice</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Ensure all information provided is accurate</li>
                  <li>Your bid cannot be modified after submission</li>
                  <li>Supporting documents should be uploaded separately</li>
                  <li>Bid bond (if required) must be submitted before deadline</li>
                </ul>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? 'Submitting...' : 'Submit Bid'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
