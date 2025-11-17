'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor, getCategoryLabel, getCategoryColor } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import type { Procurement } from '@/types';

export default function ProcurementsPage() {
  const [procurements, setProcurements] = useState<Procurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadProcurements();
  }, [page]);

  const loadProcurements = async () => {
    try {
      const response = await api.getPublicProcurements(page, 12);
      if (response.success && response.data) {
        setProcurements(response.data.items || []);
        setTotal(response.data.total || 0);
      } else {
        setProcurements([]);
      }
    } catch (error) {
      console.error('Failed to load procurements:', error);
      setProcurements([]);
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
          <h1 className="text-4xl font-bold mb-2">Public Procurements</h1>
          <p className="text-gray-600">
            Browse all public procurement opportunities and awarded contracts
          </p>
        </div>

        {procurements.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600">No procurements found</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {procurements.map((procurement) => (
                <ProcurementCard key={procurement._id} procurement={procurement} />
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

function ProcurementCard({ procurement }: { procurement: Procurement }) {
  return (
    <Link href={`/procurements/${procurement._id}`}>
      <Card hover className="h-full">
        <CardContent>
          <div className="flex items-start justify-between mb-3 gap-2">
            <Badge className={getCategoryColor(procurement.category)}>
              {getCategoryLabel(procurement.category)}
            </Badge>
            <Badge className={getStatusColor(procurement.status)}>
              {procurement.status}
            </Badge>
          </div>

          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {procurement.title}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {procurement.description}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tender Number:</span>
              <span className="font-medium">{procurement.tender_number}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Value:</span>
              <span className="font-semibold">
                {formatCurrency(procurement.estimated_value, procurement.currency)}
              </span>
            </div>

            {procurement.closing_date && (
              <div className="flex justify-between">
                <span className="text-gray-600">Closes:</span>
                <span className="font-medium">
                  {formatDate(procurement.closing_date)}
                </span>
              </div>
            )}

            <div className="pt-2 border-t">
              <span className="text-gray-600">Department:</span>
              <span className="ml-2 font-medium">{procurement.department}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
