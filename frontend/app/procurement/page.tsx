'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { procurementAPI } from '@/lib/api';
import { Procurement } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Filter, Plus, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProcurementListPage() {
  const { user } = useAuth();
  const [procurements, setProcurements] = useState<Procurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProcurements();
  }, [currentPage, statusFilter, categoryFilter, searchTerm]);

  const fetchProcurements = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 12,
      };

      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;

      const response = await procurementAPI.getAll(params);
      setProcurements(response.data.data.procurements);
      setTotalPages(response.data.data.pagination.pages);
    } catch (error) {
      toast.error('Failed to load procurements');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'all',
    'IT & Technology',
    'Construction',
    'Healthcare',
    'Education',
    'Transportation',
    'Consulting',
    'Other'
  ];

  const statuses = ['all', 'draft', 'published', 'awarded', 'cancelled', 'completed'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Procurement Records</h1>
            <p className="text-gray-600">Browse and search all procurement activities</p>
          </div>
          {user && (user.role === 'admin' || user.role === 'procurement_officer') && (
            <Link href="/procurement/new">
              <Button variant="primary" className="mt-4 md:mt-0">
                <Plus className="w-5 h-5 mr-2" />
                New Procurement
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, tender number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Procurement Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : procurements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No procurement records found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {procurements.map((procurement) => (
                <Link key={procurement._id} href={`/procurement/${procurement._id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <Badge color={getStatusColor(procurement.status)}>
                        {procurement.status}
                      </Badge>
                      {procurement.metadata?.has_anomalies && (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>

                    {procurement.tender_number && (
                      <p className="text-sm text-gray-500 mb-2">
                        {procurement.tender_number}
                      </p>
                    )}

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {procurement.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {procurement.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-medium text-gray-900">{procurement.category}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Estimated Value:</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(procurement.estimated_value)}
                        </span>
                      </div>

                      {procurement.metadata?.ai_analyzed && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Risk Score:</span>
                          <Badge color={
                            procurement.metadata.risk_score > 70 ? 'red' :
                            procurement.metadata.risk_score > 40 ? 'yellow' : 'green'
                          }>
                            {procurement.metadata.risk_score}/100
                          </Badge>
                        </div>
                      )}
                    </div>

                    {procurement.created_at && (
                      <p className="text-xs text-gray-400 mt-4">
                        Created {formatDate(procurement.created_at)}
                      </p>
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
