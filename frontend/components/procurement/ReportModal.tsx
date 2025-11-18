'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';

interface ReportModalProps {
  procurementId: string;
  procurementTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReportModal({ procurementId, procurementTitle, onClose, onSuccess }: ReportModalProps) {
  const [formData, setFormData] = useState({
    report_type: 'issue',
    category: 'other',
    title: '',
    description: '',
    anonymous: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const reportTypes = [
    { value: 'whistleblow', label: 'Whistleblowing (Serious concerns)' },
    { value: 'issue', label: 'Issue / Problem' },
    { value: 'complaint', label: 'Formal Complaint' }
  ];

  const categories = [
    { value: 'corruption', label: 'Corruption' },
    { value: 'fraud', label: 'Fraud' },
    { value: 'irregularity', label: 'Procedural Irregularity' },
    { value: 'quality', label: 'Quality Concern' },
    { value: 'delay', label: 'Delays' },
    { value: 'discrimination', label: 'Discrimination' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await api.createReport({
        procurement_id: procurementId,
        ...formData
      });

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.error || 'Failed to submit report');
      }
    } catch (err) {
      setError('An error occurred while submitting the report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Report an Issue</h2>
              <p className="text-sm text-gray-600">Procurement: {procurementTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Report Type */}
            <div>
              <Label>Report Type</Label>
              <select
                value={formData.report_type}
                onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <Label>Category</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <Label>Title</Label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief description of the issue"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label>Detailed Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide as much detail as possible..."
                rows={5}
                required
              />
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={formData.anonymous}
                onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-700">
                Submit anonymously (your identity will be protected)
              </label>
            </div>

            {/* Notice */}
            {formData.report_type === 'whistleblow' && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Whistleblower Protection:</strong> Your report will be treated with the highest confidentiality.
                  If you choose to remain anonymous, no identifying information will be stored.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
