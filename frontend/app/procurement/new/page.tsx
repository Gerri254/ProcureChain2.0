'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { procurementAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewProcurementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    tender_number: '',
    title: '',
    description: '',
    category: 'IT & Technology',
    estimated_value: '',
    department: '',
    procurement_officer: user?.full_name || '',
    status: 'draft',
  });

  // Redirect if not authorized
  if (!user || (user.role !== 'admin' && user.role !== 'procurement_officer')) {
    router.push('/procurement');
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });

      // Add files
      files.forEach(file => {
        submitData.append('documents', file);
      });

      const response = await procurementAPI.create(submitData);
      toast.success('Procurement created successfully!');
      router.push(`/procurement/${response.data.data._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create procurement');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const categories = [
    'IT & Technology',
    'Construction',
    'Healthcare',
    'Education',
    'Transportation',
    'Consulting',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/procurement">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Procurements
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Procurement</h1>
          <p className="text-gray-600">Add a new procurement record to the system</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Tender Number (Optional)"
                  type="text"
                  name="tender_number"
                  value={formData.tender_number}
                  onChange={handleChange}
                  placeholder="TND-2024-001"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input-field w-full"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                label="Title *"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Supply of Office Equipment"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className="input-field w-full"
                  placeholder="Provide a detailed description of the procurement..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Estimated Value (USD) *"
                  type="number"
                  name="estimated_value"
                  value={formData.estimated_value}
                  onChange={handleChange}
                  placeholder="50000"
                  min="0"
                  step="0.01"
                  required
                />

                <Input
                  label="Department"
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g., IT Department"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Procurement Officer"
                  type="text"
                  name="procurement_officer"
                  value={formData.procurement_officer}
                  onChange={handleChange}
                  placeholder="Officer name"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="input-field w-full"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="awarded">Awarded</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Documents</h2>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">
                    Click to upload
                  </span>
                  <span className="text-gray-600"> or drag and drop</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  PDF, DOC, DOCX, XLS, XLSX up to 10MB each
                </p>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">{files.length} file(s) selected:</p>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Upload className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <div className="flex items-center gap-4">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="flex-1 md:flex-initial"
            >
              Create Procurement
            </Button>
            <Link href="/procurement">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
