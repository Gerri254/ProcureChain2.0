'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';

export default function CreateVendorPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    registration_number: '',
    tax_id: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    business_type: '',
    industry: '',
    website: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear verification when data changes
    if (verification) setVerification(null);
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const response = await api.verifyVendor(formData);
      if (response.success && response.data) {
        setVerification(response.data.verification);
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Failed to verify vendor. You can still proceed with manual review.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Add verification data if available
      const vendorData = {
        ...formData,
        ai_verification: verification || undefined,
      };

      const response = await api.createVendor(vendorData);

      if (response.success && response.data) {
        alert('Vendor created successfully!');
        const vendorId = response.data.vendor_id || response.data._id;
        router.push(`/vendors/${vendorId}`);
      } else {
        alert('Failed to create vendor: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to create vendor:', error);
      alert('Failed to create vendor. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-700 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create New Vendor</h1>
          <p className="text-gray-600 mt-2">
            Add a new vendor to the system. AI verification will help identify potential issues.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="ABC Corporation Ltd"
                />
              </div>

              <div>
                <Label htmlFor="registration_number">Registration Number *</Label>
                <Input
                  id="registration_number"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleChange}
                  required
                  placeholder="REG-123456"
                />
              </div>

              <div>
                <Label htmlFor="tax_id">Tax ID</Label>
                <Input
                  id="tax_id"
                  name="tax_id"
                  value={formData.tax_id}
                  onChange={handleChange}
                  placeholder="TAX-123456"
                />
              </div>

              <div>
                <Label htmlFor="business_type">Business Type</Label>
                <select
                  id="business_type"
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select type</option>
                  <option value="sole_proprietorship">Sole Proprietorship</option>
                  <option value="partnership">Partnership</option>
                  <option value="limited_company">Limited Company</option>
                  <option value="corporation">Corporation</option>
                  <option value="cooperative">Cooperative</option>
                </select>
              </div>

              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="Construction, IT, Healthcare, etc."
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://www.example.com"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description of the vendor's business..."
              />
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@company.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1234567890"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Nairobi"
                />
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Kenya"
                />
              </div>
            </div>
          </Card>

          {/* AI Verification Section */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
                  <span>🤖</span>
                  <span>AI Verification</span>
                </h2>
                <p className="text-sm text-blue-700 mt-1">
                  Get AI-powered analysis of vendor information for potential issues
                </p>
              </div>
              <Button
                type="button"
                onClick={handleVerify}
                disabled={verifying || !formData.name || !formData.registration_number}
                variant="outline"
              >
                {verifying ? 'Verifying...' : 'Verify Vendor'}
              </Button>
            </div>

            {verification && (
              <div className="space-y-4 mt-4">
                {/* Risk Assessment */}
                <div className={`p-4 rounded-lg border ${getRiskColor(verification.risk_level)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Risk Level: {verification.risk_level?.toUpperCase()}</h3>
                    <span className="font-bold text-lg">{verification.risk_score}/100</span>
                  </div>
                  <p className="text-sm">{verification.overall_assessment}</p>
                </div>

                {/* Verification Items */}
                {verification.verification_items && verification.verification_items.length > 0 && (
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Verification Details</h4>
                    <div className="space-y-2">
                      {verification.verification_items.map((item: any, index: number) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.status === 'valid' ? 'bg-green-100 text-green-800' :
                            item.status === 'suspicious' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status}
                          </span>
                          <div>
                            <strong>{item.item}:</strong> {item.notes}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Red Flags */}
                {verification.red_flags && verification.red_flags.length > 0 && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>Red Flags</span>
                    </h4>
                    <ul className="space-y-1">
                      {verification.red_flags.map((flag: string, index: number) => (
                        <li key={index} className="text-sm text-red-800">• {flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {verification.recommendations && verification.recommendations.length > 0 && (
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Recommended Actions</h4>
                    <ul className="space-y-1">
                      {verification.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-sm text-gray-700">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? 'Creating...' : 'Create Vendor'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
