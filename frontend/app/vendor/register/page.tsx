'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';

export default function VendorRegistrationPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    company_name: '',
    registration_number: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Kenya',
    business_category: [] as string[],
    contact_person: '',
    contact_person_phone: '',
    website: '',
    description: '',
  });

  const categories = [
    'Construction',
    'IT & Software',
    'Consulting',
    'Medical Supplies',
    'Office Equipment',
    'Transportation',
    'Security Services',
    'Maintenance',
    'Food & Catering',
    'Printing & Publishing',
    'Professional Services',
    'Other',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      business_category: prev.business_category.includes(category)
        ? prev.business_category.filter(c => c !== category)
        : [...prev.business_category, category]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const vendorData = {
        ...formData,
        business_category: formData.business_category.join(', '),
        status: 'pending' as const,
      };

      const response = await api.createVendor(vendorData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login?message=Registration successful. Please wait for admin approval.');
        }, 2000);
      } else {
        setError(response.error || 'Failed to register vendor');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register vendor');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Registration Successful!</h2>
            <p className="text-green-700 mb-4">
              Your vendor registration has been submitted successfully. Our team will review your application
              and contact you via email once approved.
            </p>
            <p className="text-sm text-green-600">Redirecting to login page...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Vendor Registration</h1>
        <p className="text-gray-600 mb-6">
          Register your company to participate in procurement opportunities
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Name */}
              <div>
                <Label htmlFor="company_name">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company_name"
                  name="company_name"
                  type="text"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your company name"
                  className="mt-1"
                />
              </div>

              {/* Registration Number */}
              <div>
                <Label htmlFor="registration_number">
                  Business Registration Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="registration_number"
                  name="registration_number"
                  type="text"
                  value={formData.registration_number}
                  onChange={handleChange}
                  required
                  placeholder="e.g., BN/2024/12345"
                  className="mt-1"
                />
              </div>

              {/* Email and Phone */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">
                    Company Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="company@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+254 700 000000"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address">
                  Physical Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Street address, building, floor"
                  className="mt-1"
                />
              </div>

              {/* City and Country */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Nairobi"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="country">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="country"
                    name="country"
                    type="text"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Business Categories */}
              <div>
                <Label>
                  Business Categories <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-500 mb-2">Select all that apply</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className={`flex items-center p-2 border rounded cursor-pointer transition-colors ${
                        formData.business_category.includes(category)
                          ? 'bg-blue-50 border-blue-500'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.business_category.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="mr-2"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
                {formData.business_category.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Please select at least one category</p>
                )}
              </div>

              {/* Contact Person */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_person">
                    Contact Person Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contact_person"
                    name="contact_person"
                    type="text"
                    value={formData.contact_person}
                    onChange={handleChange}
                    required
                    placeholder="Full name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_person_phone">
                    Contact Person Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contact_person_phone"
                    name="contact_person_phone"
                    type="tel"
                    value={formData.contact_person_phone}
                    onChange={handleChange}
                    required
                    placeholder="+254 700 000000"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://www.example.com"
                  className="mt-1"
                />
              </div>

              {/* Company Description */}
              <div>
                <Label htmlFor="description">
                  Company Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Brief description of your company, services, and experience..."
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.description.length} characters (minimum 50)
                </p>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-gray-50 border border-gray-200 rounded p-4">
                <h4 className="font-semibold mb-2">Terms and Conditions</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>All information provided must be accurate and verifiable</li>
                  <li>Your application will be reviewed by our procurement team</li>
                  <li>You will be notified via email once your application is processed</li>
                  <li>Registration does not guarantee contract awards</li>
                  <li>You agree to comply with all procurement regulations and policies</li>
                </ul>
                <label className="flex items-center mt-3">
                  <input type="checkbox" required className="mr-2" />
                  <span className="text-sm">
                    I agree to the terms and conditions <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  
                  onClick={() => router.push('/')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || formData.business_category.length === 0 || formData.description.length < 50}
                  className="flex-1"
                >
                  {submitting ? 'Submitting...' : 'Register Company'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already registered?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Login here
          </a>
        </div>
      </div>
    </div>
  );
}
