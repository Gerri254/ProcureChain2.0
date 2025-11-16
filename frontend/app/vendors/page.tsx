'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { vendorAPI } from '@/lib/api';
import { Vendor } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Search, Building, Award, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchVendors();
  }, [currentPage, searchTerm]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 12,
      };

      if (searchTerm) params.search = searchTerm;

      const response = await vendorAPI.getAll(params);
      setVendors(response.data.data.vendors);
      setTotalPages(response.data.data.pagination.pages);
    } catch (error) {
      toast.error('Failed to load vendors');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Registered Vendors</h1>
          <p className="text-gray-600">Browse all vendors participating in procurement</p>
        </div>

        {/* Search */}
        <div className="card p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by vendor name, registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
        </div>

        {/* Vendors Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : vendors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No vendors found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {vendors.map((vendor) => (
                <Link key={vendor._id} href={`/vendors/${vendor._id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <Building className="w-6 h-6 text-blue-600" />
                      </div>
                      {vendor.blacklisted && (
                        <Badge color="red">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Blacklisted
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {vendor.name}
                    </h3>

                    {vendor.registration_number && (
                      <p className="text-sm text-gray-500 mb-3">
                        Reg. No: {vendor.registration_number}
                      </p>
                    )}

                    <div className="space-y-2">
                      {vendor.contact_email && (
                        <p className="text-sm text-gray-600 truncate">
                          {vendor.contact_email}
                        </p>
                      )}

                      {vendor.contact_phone && (
                        <p className="text-sm text-gray-600">
                          {vendor.contact_phone}
                        </p>
                      )}

                      {vendor.address && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {vendor.address}
                        </p>
                      )}
                    </div>

                    {vendor.performance_score !== undefined && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Performance Score</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  vendor.performance_score >= 70 ? 'bg-green-500' :
                                  vendor.performance_score >= 40 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${vendor.performance_score}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              {vendor.performance_score}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {vendor.contracts_count !== undefined && vendor.contracts_count > 0 && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                        <Award className="w-4 h-4" />
                        <span>{vendor.contracts_count} contract(s)</span>
                      </div>
                    )}
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <span className="text-gray-600 px-4">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="secondary"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
