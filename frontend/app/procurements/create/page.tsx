'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function CreateProcurementPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: 'goods' | 'services' | 'works' | 'consultancy' | 'supplies';
    department: string;
    estimated_value: string;
    currency: string;
    closing_date: string;
    submission_deadline: string;
  }>({
    title: '',
    description: '',
    category: 'goods',
    department: '',
    estimated_value: '',
    currency: 'USD',
    closing_date: '',
    submission_deadline: ''
  });

  // Check if user has permission to create procurements
  if (isAuthenticated && user?.role !== 'admin' && user?.role !== 'government_official') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-4">
              You don't have permission to create procurements
            </p>
            <Link href="/procurements">
              <Button>Back to Procurements</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const procurementData = {
        ...formData,
        estimated_value: parseFloat(formData.estimated_value),
        status: 'draft' as const,
        documents: []
      };

      const response = await api.createProcurement(procurementData);

      if (response.success && response.data) {
        alert('Procurement created successfully!');
        // Backend returns procurement_id, not _id
        const procurementId = (response.data as any).procurement_id || response.data._id;
        router.push(`/procurements/${procurementId}`);
      } else {
        alert('Failed to create procurement: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to create procurement:', error);
      alert('Failed to create procurement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/procurements">
          <Button variant="ghost" className="mb-6">
            ← Back to Procurements
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Create New Procurement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="e.g., Construction of New School Building"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Provide detailed description of the procurement requirements..."
                />
              </div>

              {/* Category and Department */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="goods">Goods</option>
                    <option value="services">Services</option>
                    <option value="works">Works</option>
                    <option value="consultancy">Consultancy</option>
                    <option value="supplies">Supplies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="e.g., Education"
                  />
                </div>
              </div>

              {/* Estimated Value and Currency */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.estimated_value}
                    onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="KES">KES</option>
                    <option value="UGX">UGX</option>
                    <option value="TZS">TZS</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Closing Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.closing_date}
                    onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    When bidding closes
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Submission Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.submission_deadline}
                    onChange={(e) => setFormData({ ...formData, submission_deadline: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Final submission deadline
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Procurement'}
                </Button>
                <Link href="/procurements">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                Note: The procurement will be created in <strong>draft</strong> status.
                You can publish it later from the procurement detail page.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
