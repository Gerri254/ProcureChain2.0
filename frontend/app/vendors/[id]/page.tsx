'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { vendorAPI } from '@/lib/api';
import { Vendor } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  Award,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function VendorDetailPage() {
  const params = useParams();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchVendor();
    }
  }, [params.id]);

  const fetchVendor = async () => {
    try {
      setLoading(true);
      const response = await vendorAPI.getById(params.id as string);
      setVendor(response.data.data);
    } catch (error) {
      toast.error('Failed to load vendor details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor Not Found</h2>
          <Link href="/vendors">
            <Button variant="primary">Back to Vendors</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/vendors">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Vendors
            </Button>
          </Link>

          <div className="flex items-start gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <Building className="w-12 h-12 text-blue-600" />
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{vendor.name}</h1>
                  {vendor.registration_number && (
                    <p className="text-gray-600 mb-3">Reg. No: {vendor.registration_number}</p>
                  )}
                  <div className="flex items-center gap-3">
                    {vendor.blacklisted && (
                      <Badge color="red">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Blacklisted
                      </Badge>
                    )}
                    {vendor.performance_score !== undefined && (
                      <Badge color={
                        vendor.performance_score >= 70 ? 'green' :
                        vendor.performance_score >= 40 ? 'yellow' : 'red'
                      }>
                        Performance: {vendor.performance_score}/100
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                {vendor.contact_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a href={`mailto:${vendor.contact_email}`} className="text-blue-600 hover:text-blue-700">
                      {vendor.contact_email}
                    </a>
                  </div>
                )}

                {vendor.contact_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <a href={`tel:${vendor.contact_phone}`} className="text-gray-900">
                      {vendor.contact_phone}
                    </a>
                  </div>
                )}

                {vendor.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <p className="text-gray-900">{vendor.address}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Contract History */}
            {vendor.contract_history && vendor.contract_history.length > 0 && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Contract History
                </h2>
                <div className="space-y-3">
                  {vendor.contract_history.map((contract, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{contract.procurement_title}</h3>
                          {contract.procurement_id && (
                            <Link
                              href={`/procurement/${contract.procurement_id}`}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            >
                              View Procurement
                            </Link>
                          )}
                        </div>
                        {contract.value && (
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(contract.value)}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {contract.awarded_date && (
                          <div>
                            <span className="text-gray-500">Awarded:</span>
                            <span className="ml-2 text-gray-900">{formatDate(contract.awarded_date)}</span>
                          </div>
                        )}
                        {contract.status && (
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <Badge color={
                              contract.status === 'completed' ? 'green' :
                              contract.status === 'active' ? 'blue' : 'gray'
                            } className="ml-2">
                              {contract.status}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Documents */}
            {vendor.documents && vendor.documents.length > 0 && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents</h2>
                <div className="space-y-2">
                  {vendor.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.type || 'Document'}</p>
                          {doc.uploaded_at && (
                            <p className="text-xs text-gray-500">
                              Uploaded {formatDate(doc.uploaded_at)}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Stats */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance</h2>
              <div className="space-y-4">
                {vendor.performance_score !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 text-sm">Overall Score</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {vendor.performance_score}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          vendor.performance_score >= 70 ? 'bg-green-500' :
                          vendor.performance_score >= 40 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${vendor.performance_score}%` }}
                      />
                    </div>
                  </div>
                )}

                {vendor.contracts_count !== undefined && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Award className="w-4 h-4" />
                      <span>Total Contracts</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{vendor.contracts_count}</p>
                  </div>
                )}

                {vendor.total_contract_value !== undefined && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>Total Contract Value</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(vendor.total_contract_value)}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Additional Info */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Information</h2>
              <div className="space-y-3 text-sm">
                {vendor.created_at && (
                  <div>
                    <span className="text-gray-500">Registered:</span>
                    <p className="text-gray-900 font-medium">{formatDate(vendor.created_at)}</p>
                  </div>
                )}

                {vendor.last_updated && (
                  <div>
                    <span className="text-gray-500">Last Updated:</span>
                    <p className="text-gray-900 font-medium">{formatDate(vendor.last_updated)}</p>
                  </div>
                )}

                {vendor.blacklisted && vendor.blacklist_reason && (
                  <div className="pt-3 border-t border-red-200">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">Blacklist Reason</span>
                    </div>
                    <p className="text-gray-700">{vendor.blacklist_reason}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
