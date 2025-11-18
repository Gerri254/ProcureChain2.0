'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';

export default function VendorProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    contact_person: '',
    contact_person_phone: '',
    website: '',
    description: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/vendor/profile');
      return;
    }

    if (user?.role !== 'vendor') {
      setError('Only vendors can access this page');
      setLoading(false);
      return;
    }

    fetchVendorProfile();
  }, [isAuthenticated, user]);

  const fetchVendorProfile = async () => {
    try {
      if (!user?.vendor_id) {
        setError('No vendor profile associated with this account');
        setLoading(false);
        return;
      }

      const response = await api.getVendor(user.vendor_id);

      if (response.success && response.data) {
        setVendor(response.data);
        setFormData({
          email: response.data.email || '',
          phone: response.data.phone || '',
          address: response.data.address || '',
          city: response.data.city || '',
          country: response.data.country || '',
          contact_person: response.data.contact_person || '',
          contact_person_phone: response.data.contact_person_phone || '',
          website: response.data.website || '',
          description: response.data.description || '',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load vendor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const response = await api.updateVendor(vendor._id, formData);

      if (response.success) {
        alert('Profile updated successfully!');
        setEditing(false);
        fetchVendorProfile();
      } else {
        setError(response.error || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (error && !vendor) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Vendor Profile</h1>
          {!editing && (
            <Button onClick={() => setEditing(true)}>Edit Profile</Button>
          )}
        </div>

        {/* Company Overview */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{vendor?.company_name}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Reg: {vendor?.registration_number}</p>
              </div>
              <Badge className={getStatusColor(vendor?.status)}>
                {vendor?.status?.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {vendor?.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
                Your vendor registration is pending approval. You will be notified once reviewed.
              </div>
            )}

            {vendor?.status === 'suspended' && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
                Your vendor account has been suspended. Please contact the procurement office for details.
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Business Categories:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(vendor?.business_category || vendor?.category || '')
                    .toString()
                    .split(',')
                    .map((cat: string) => cat.trim())
                    .filter(Boolean)
                    .map((cat: string, idx: number) => (
                      <Badge key={idx} >{cat}</Badge>
                    ))}
                </div>
              </div>
              <div>
                <span className="font-medium">Registration Date:</span>
                <div className="mt-1">{vendor?.created_at ? new Date(vendor.created_at).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        {vendor?.performance_metrics && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {vendor.performance_metrics.total_contracts || 0}
                  </div>
                  <div className="text-sm text-gray-500">Total Contracts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    KES {(vendor.performance_metrics.total_value || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Total Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {vendor.performance_metrics.completion_rate || 0}%
                  </div>
                  <div className="text-sm text-gray-500">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {(vendor.performance_metrics.average_rating || 0).toFixed(1)}/5
                  </div>
                  <div className="text-sm text-gray-500">Average Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1"
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
                    disabled={!editing}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!editing}
                  className="mt-1"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    type="text"
                    value={formData.country}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    name="contact_person"
                    type="text"
                    value={formData.contact_person}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_person_phone">Contact Person Phone</Label>
                  <Input
                    id="contact_person_phone"
                    name="contact_person_phone"
                    type="tel"
                    value={formData.contact_person_phone}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  disabled={!editing}
                  className="mt-1"
                  placeholder="https://www.example.com"
                />
              </div>

              <div>
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={!editing}
                  rows={4}
                  className="mt-1"
                />
              </div>

              {editing && (
                <div className="flex gap-4 pt-4">
                  <Button
                    
                    onClick={() => {
                      setEditing(false);
                      setError('');
                      fetchVendorProfile();
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving} className="flex-1">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button
                
                onClick={() => router.push('/procurement')}
                className="w-full"
              >
                Browse Procurements
              </Button>
              <Button
                
                onClick={() => router.push('/bids/my-bids')}
                className="w-full"
              >
                My Bids
              </Button>
              <Button
                
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
