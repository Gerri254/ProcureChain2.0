'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatCurrency, getStatusColor } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import type { Vendor } from '@/types';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadVendors();
  }, [page]);

  const loadVendors = async () => {
    try {
      const response = await api.getPublicVendors(page, 12);
      if (response.success && response.data) {
        setVendors(response.data.items || []);
        setTotal(response.data.total || 0);
      } else {
        setVendors([]);
      }
    } catch (error) {
      console.error('Failed to load vendors:', error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Registered Vendors</h1>
          <p className="text-gray-600">
            Browse all registered vendors and their performance metrics
          </p>
        </div>

        {vendors.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600">No vendors found</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <VendorCard key={vendor._id} vendor={vendor} />
              ))}
            </div>

            {total > 12 && (
              <div className="flex justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {page} of {Math.ceil(total / 12)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 12)}
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

function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <Card hover className="h-full">
      <CardContent>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{vendor.name}</h3>
            <p className="text-sm text-gray-600">{vendor.registration_number}</p>
          </div>
          <Badge className={getStatusColor(vendor.tax_compliance_status)}>
            {vendor.tax_compliance_status}
          </Badge>
        </div>

        <div className="space-y-2 text-sm mb-4">
          <div>
            <span className="text-gray-600">Location:</span>
            <span className="ml-2">{vendor.city}, {vendor.country}</span>
          </div>

          <div>
            <span className="text-gray-600">Categories:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {vendor.category.map((cat, idx) => (
                <Badge key={idx} variant="default" className="text-xs">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <div className="text-2xl font-bold">{vendor.total_contracts}</div>
            <div className="text-xs text-gray-600">Contracts</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {formatCurrency(vendor.total_value).split('.')[0]}
            </div>
            <div className="text-xs text-gray-600">Total Value</div>
          </div>
        </div>

        {vendor.performance_score !== undefined && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Performance Score:</span>
              <span className="font-semibold">{vendor.performance_score}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${vendor.performance_score}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
