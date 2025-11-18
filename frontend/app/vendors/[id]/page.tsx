'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVendor();
  }, [params.id]);

  const loadVendor = async () => {
    try {
      const response = await api.getVendor(params.id as string);
      if (response.success && response.data) {
        // Map API fields to expected format
        const v = response.data;
        const mappedVendor = {
          ...v,
          company_name: v.name || v.company_name,
          email: v.contact?.email || v.email,
          phone: v.contact?.phone || v.phone,
          address: v.contact?.address || v.address,
          city: v.business_info?.city || v.city || 'N/A',
          country: v.business_info?.country || v.country || 'Kenya',
          business_category: v.business_info?.category || v.business_category || v.category,
          website: v.contact?.website || v.website,
        };
        setVendor(mappedVendor);
      } else {
        setError('Vendor not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!vendor) return;

    try {
      const response = await api.updateVendor(vendor._id, { status: newStatus });
      if (response.success) {
        alert(`Vendor ${newStatus} successfully!`);
        loadVendor(); // Reload to get updated data
      } else {
        alert(response.error || 'Failed to update vendor status');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update vendor status');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      blacklisted: 'bg-gray-900 text-white',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error || 'Vendor not found'}</p>
              <Button onClick={() => router.back()} className="mt-4">
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isAdmin = isAuthenticated && (user?.role === 'admin' || user?.role === 'government_official');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/vendors" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Back to Vendors
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{vendor.company_name}</h1>
              <p className="text-gray-600 mt-1">Registration: {vendor.registration_number}</p>
            </div>
            <Badge className={getStatusColor(vendor.status || 'pending')}>
              {(vendor.status || 'pending').toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Admin Actions</h3>
              <div className="flex gap-2 flex-wrap">
                {vendor.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange('active')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve Vendor
                  </Button>
                )}
                {vendor.status === 'active' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange('suspended')}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Suspend Vendor
                  </Button>
                )}
                {vendor.status === 'suspended' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange('active')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Activate Vendor
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/admin/vendors/${vendor._id}/edit`)}
                >
                  Edit Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-gray-900">{vendor.email || 'Not provided'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <p className="text-gray-900">{vendor.phone || 'Not provided'}</p>
                </div>
                {vendor.contact_person && (
                  <div>
                    <span className="font-medium text-gray-700">Contact Person:</span>
                    <p className="text-gray-900">{vendor.contact_person}</p>
                  </div>
                )}
                {vendor.contact_person_phone && (
                  <div>
                    <span className="font-medium text-gray-700">Contact Phone:</span>
                    <p className="text-gray-900">{vendor.contact_person_phone}</p>
                  </div>
                )}
                {vendor.website && (
                  <div>
                    <span className="font-medium text-gray-700">Website:</span>
                    <p>
                      <a
                        href={vendor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {vendor.website}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Address:</span>
                  <p className="text-gray-900">{vendor.address || 'Not provided'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">City:</span>
                  <p className="text-gray-900">{vendor.city}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Country:</span>
                  <p className="text-gray-900">{vendor.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Registration Number:</span>
                  <p className="text-gray-900">{vendor.registration_number}</p>
                </div>
                {vendor.tax_id && (
                  <div>
                    <span className="font-medium text-gray-700">Tax ID:</span>
                    <p className="text-gray-900">{vendor.tax_id}</p>
                  </div>
                )}
                {vendor.tax_compliance_status && (
                  <div>
                    <span className="font-medium text-gray-700">Tax Compliance:</span>
                    <Badge className={vendor.tax_compliance_status === 'compliant' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {vendor.tax_compliance_status.toUpperCase()}
                    </Badge>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">Categories:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(vendor.business_category || vendor.category || '')
                      .toString()
                      .split(',')
                      .map((cat: string) => cat.trim())
                      .filter(Boolean)
                      .map((cat: string, idx: number) => (
                        <Badge key={idx}>{cat}</Badge>
                      ))}
                  </div>
                </div>
                {vendor.created_at && (
                  <div>
                    <span className="font-medium text-gray-700">Registered:</span>
                    <p className="text-gray-900">{new Date(vendor.created_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          {vendor.performance_metrics && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Total Contracts:</span>
                    <p className="text-2xl font-bold text-blue-600">
                      {vendor.performance_metrics.total_contracts || 0}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Total Value:</span>
                    <p className="text-2xl font-bold text-green-600">
                      KES {(vendor.performance_metrics.total_value || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Completion Rate:</span>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full"
                          style={{ width: `${vendor.performance_metrics.completion_rate || 0}%` }}
                        />
                      </div>
                      <span className="font-bold">{vendor.performance_metrics.completion_rate || 0}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Average Rating:</span>
                    <p className="text-2xl font-bold text-yellow-600">
                      {(vendor.performance_metrics.average_rating || 0).toFixed(1)}/5.0
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Description */}
        {vendor.description && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{vendor.description}</p>
            </CardContent>
          </Card>
        )}

        {/* AI Verification (if available) */}
        {vendor.ai_verification && isAdmin && (
          <Card className="mt-6 bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🤖</span>
                <span>AI Verification</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <span className="font-medium text-gray-700">Risk Level:</span>
                  <Badge className={
                    vendor.ai_verification.risk_level === 'low' ? 'bg-green-100 text-green-800 ml-2' :
                    vendor.ai_verification.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800 ml-2' :
                    'bg-red-100 text-red-800 ml-2'
                  }>
                    {vendor.ai_verification.risk_level?.toUpperCase()}
                  </Badge>
                  <span className="ml-3 text-gray-600">
                    Score: {vendor.ai_verification.risk_score}/100
                  </span>
                </div>
                {vendor.ai_verification.overall_assessment && (
                  <div>
                    <span className="font-medium text-gray-700">Assessment:</span>
                    <p className="text-gray-900 mt-1">{vendor.ai_verification.overall_assessment}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
