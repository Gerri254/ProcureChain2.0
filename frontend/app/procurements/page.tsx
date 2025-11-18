'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor, getCategoryLabel, getCategoryColor } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Procurement } from '@/types';

export default function ProcurementsPage() {
  const { user, isAuthenticated } = useAuth();
  const [procurements, setProcurements] = useState<Procurement[]>([]);
  const [filteredProcurements, setFilteredProcurements] = useState<Procurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const categories = [
    'Construction',
    'IT & Software',
    'Consulting',
    'Medical Supplies',
    'Office Equipment',
    'Transportation',
    'Security Services',
    'Maintenance',
    'Professional Services',
    'Other'
  ];

  const statuses = ['draft', 'published', 'open', 'evaluation', 'awarded', 'completed', 'cancelled'];

  useEffect(() => {
    loadProcurements();
  }, []);

  useEffect(() => {
    filterAndSortProcurements();
  }, [procurements, searchTerm, statusFilter, categoryFilter, sortBy, page, itemsPerPage]);

  const loadProcurements = async () => {
    try {
      const response = await api.getPublicProcurements(1, 1000); // Load all procurements for client-side filtering
      if (response.success && response.data) {
        const items = response.data.items || [];
        setProcurements(items);
        setTotal(items.length);
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

  const filterAndSortProcurements = () => {
    let filtered = [...procurements];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.tender_number?.toLowerCase().includes(term) ||
        p.department?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
        break;
      case 'value-high':
        filtered.sort((a, b) => (b.estimated_value || 0) - (a.estimated_value || 0));
        break;
      case 'value-low':
        filtered.sort((a, b) => (a.estimated_value || 0) - (b.estimated_value || 0));
        break;
      case 'deadline':
        filtered.sort((a, b) => {
          const dateA = a.closing_date ? new Date(a.closing_date).getTime() : Infinity;
          const dateB = b.closing_date ? new Date(b.closing_date).getTime() : Infinity;
          return dateA - dateB;
        });
        break;
    }

    // Update total count
    setTotal(filtered.length);

    // Apply pagination
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);

    setFilteredProcurements(paginated);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSortBy('recent');
    setPage(1);
  };

  const totalPages = Math.ceil(total / itemsPerPage);

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold">Public Procurements</h1>
            {isAuthenticated && (user?.role === 'admin' || user?.role === 'government_official') && (
              <Link href="/procurements/create">
                <Button>+ Create Procurement</Button>
              </Link>
            )}
          </div>
          <p className="text-gray-600">
            Browse all public procurement opportunities and awarded contracts
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            {/* Search Bar */}
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Search by title, description, tender number, department..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1); // Reset to first page on search
                }}
                className="w-full"
              />
            </div>

            {/* Filters Grid */}
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="value-high">Highest Value</option>
                  <option value="value-low">Lowest Value</option>
                  <option value="deadline">Closest Deadline</option>
                </select>
              </div>

              {/* Items Per Page */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Per Page
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="6">6</option>
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="48">48</option>
                </select>
              </div>
            </div>

            {/* Active Filters Summary and Reset */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {filteredProcurements.length} of {total} procurement{total !== 1 ? 's' : ''}
                {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
                  <span className="ml-2 font-medium text-blue-600">
                    (filtered)
                  </span>
                )}
              </div>
              {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || sortBy !== 'recent') && (
                <Button
                  
                  size="sm"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {filteredProcurements.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-2">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'No procurements match your filters'
                  : 'No procurements found'}
              </p>
              {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
                <Button onClick={handleResetFilters} className="mt-4">
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProcurements.map((procurement) => (
                <ProcurementCard key={procurement._id} procurement={procurement} />
              ))}
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  {/* Page Info */}
                  <div className="text-sm text-gray-600">
                    Page {page} of {totalPages} • Showing {((page - 1) * itemsPerPage) + 1}-
                    {Math.min(page * itemsPerPage, total)} of {total}
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      size="sm"
                    >
                      First
                    </Button>
                    <Button
                      
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>

                    {/* Page Numbers */}
                    <div className="hidden sm:flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? 'primary' : 'outline'}
                            onClick={() => setPage(pageNum)}
                            size="sm"
                            className="min-w-[40px]"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      
                      onClick={() => setPage(page + 1)}
                      disabled={page >= totalPages}
                    >
                      Next
                    </Button>
                    <Button
                      
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                      size="sm"
                    >
                      Last
                    </Button>
                  </div>

                  {/* Quick Jump */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Go to:</label>
                    <Input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={page}
                      onChange={(e) => {
                        const newPage = parseInt(e.target.value);
                        if (newPage >= 1 && newPage <= totalPages) {
                          setPage(newPage);
                        }
                      }}
                      className="w-20 text-center"
                    />
                  </div>
                </div>
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
