'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import type { Vendor } from '@/types';

export default function AdminVendorManagementPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Wait for auth to initialize
    if (isAuthenticated === undefined) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login?redirect=/admin/vendors');
      return;
    }

    if (!user) {
      return; // Still loading user data
    }

    if (user.role !== 'admin' && user.role !== 'government_official') {
      setError('Only administrators and government officials can access this page');
      setLoading(false);
      return;
    }

    fetchVendors();
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    filterVendors();
  }, [vendors, searchTerm, statusFilter]);

  const fetchVendors = async () => {
    try {
      const response = await api.getVendors(1, 1000); // Get all vendors
      if (response.success && response.data) {
        const vendorList = response.data.results || response.data.items || [];
        // Map API fields to expected frontend fields
        const mappedVendors = vendorList.map((v: any) => ({
          ...v,
          company_name: v.name || v.company_name,
          email: v.contact?.email || v.email,
          phone: v.contact?.phone || v.phone,
          address: v.contact?.address || v.address,
          city: v.business_info?.city || v.city || 'N/A',
          country: v.business_info?.country || v.country || 'Kenya',
          business_category: v.business_info?.category || v.business_category || v.category,
        }));
        setVendors(mappedVendors);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const filterVendors = () => {
    let filtered = vendors;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(v => v.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(v =>
        v.company_name?.toLowerCase().includes(term) ||
        v.email?.toLowerCase().includes(term) ||
        v.registration_number?.toLowerCase().includes(term)
      );
    }

    setFilteredVendors(filtered);
  };

  const handleAction = async (action: 'approve' | 'suspend' | 'activate' | 'delete', vendor: Vendor) => {
    try {
      let response;
      let updateData: any = {};

      switch (action) {
        case 'approve':
          updateData = { status: 'active' };
          break;
        case 'suspend':
          updateData = { status: 'suspended' };
          break;
        case 'activate':
          updateData = { status: 'active' };
          break;
        case 'delete':
          // Delete functionality temporarily disabled
          alert('Delete functionality is not yet implemented');
          return;
        default:
          return;
      }

      response = await api.updateVendor(vendor._id, updateData);

      if (response?.success) {
        alert(`Vendor ${action}d successfully!`);
        fetchVendors();
      } else {
        alert(response?.error || `Failed to ${action} vendor`);
      }
    } catch (err: any) {
      alert(err.message || `Failed to ${action} vendor`);
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

  const getStatusCounts = () => {
    return {
      total: vendors.length,
      pending: vendors.filter(v => v.status === 'pending').length,
      active: vendors.filter(v => v.status === 'active').length,
      suspended: vendors.filter(v => v.status === 'suspended').length,
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading vendors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Vendor Management</h1>
        <Button
          onClick={() => router.push('/admin/vendors/create')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Add Vendor
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{statusCounts.total}</div>
            <div className="text-sm text-gray-500">Total Vendors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
            <div className="text-sm text-gray-500">Pending Approval</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{statusCounts.active}</div>
            <div className="text-sm text-gray-500">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{statusCounts.suspended}</div>
            <div className="text-sm text-gray-500">Suspended</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Input
                type="text"
                placeholder="Search vendors by name, email, or registration number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded px-3 py-2 flex-1"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendors List */}
      <div className="space-y-4">
        {filteredVendors.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              No vendors found matching your criteria.
            </CardContent>
          </Card>
        ) : (
          filteredVendors.map((vendor) => (
            <Card key={vendor._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{vendor.company_name}</h3>
                      <Badge className={getStatusColor(vendor.status || 'pending')}>
                        {(vendor.status || 'pending').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      Reg: {vendor.registration_number} | {vendor.email}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(vendor.business_category || vendor.category || '')
                        .toString()
                        .split(',')
                        .map((cat: string) => cat.trim())
                        .filter(Boolean)
                        .map((cat: string, idx: number) => (
                          <Badge key={idx}  className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  {vendor.performance_metrics && (
                    <div className="text-right text-sm">
                      <div className="font-semibold text-blue-600">
                        {vendor.performance_metrics.total_contracts || 0} Contracts
                      </div>
                      <div className="text-gray-500">
                        {vendor.performance_metrics.completion_rate || 0}% Completion
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="font-medium">Contact:</span> {vendor.contact_person || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {vendor.phone || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">City:</span> {vendor.city || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Registered:</span>{' '}
                    {vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap border-t pt-4">
                  <Button
                    size="sm"
                    onClick={() => router.push(`/vendors/${vendor._id}`)}
                  >
                    View Details
                  </Button>

                  {vendor.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleAction('approve', vendor)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                  )}

                  {vendor.status === 'active' && (
                    <Button
                      size="sm"
                      onClick={() => handleAction('suspend', vendor)}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Suspend
                    </Button>
                  )}

                  {vendor.status === 'suspended' && (
                    <Button
                      size="sm"
                      onClick={() => handleAction('activate', vendor)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Activate
                    </Button>
                  )}

                  <Button
                    size="sm"
                    
                    onClick={() => handleAction('delete', vendor)}
                    className="border-red-600 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
