'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate, getCategoryLabel } from '@/lib/utils';
import { SearchIcon } from '@/components/ui/Icons';

interface Procurement {
  _id: string;
  tender_number: string;
  title: string;
  category: string;
  estimated_value: number;
  status: string;
  published_date?: string;
  deadline?: string;
  awarded_amount?: number;
  awarded_date?: string;
  description?: string;
}

export default function ComparePage() {
  const [allProcurements, setAllProcurements] = useState<Procurement[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProcurements();
  }, []);

  const fetchProcurements = async () => {
    try {
      const response = await api.getPublicProcurements(1, 100);
      if (response.success && response.data?.items) {
        setAllProcurements(response.data.items);
      }
    } catch (err) {
      console.error('Failed to load procurements:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedProcurements = selectedIds
    .map(id => allProcurements.find(p => p._id === id))
    .filter(Boolean) as Procurement[];

  const filteredProcurements = allProcurements.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tender_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Compare Procurements</h1>
        <p className="text-gray-600">
          Select up to 3 procurements to compare side-by-side
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Selection Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Procurements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <SearchIcon
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                Selected: {selectedIds.length}/3
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredProcurements.slice(0, 20).map((proc) => (
                  <label
                    key={proc._id}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedIds.includes(proc._id)
                        ? 'bg-blue-50 border-blue-500'
                        : 'hover:bg-gray-50'
                    } ${
                      !selectedIds.includes(proc._id) && selectedIds.length >= 3
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(proc._id)}
                      onChange={() => toggleSelection(proc._id)}
                      disabled={!selectedIds.includes(proc._id) && selectedIds.length >= 3}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{proc.title}</p>
                      <p className="text-xs text-gray-600">{proc.tender_number}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatCurrency(proc.estimated_value)}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Panel */}
        <div className="lg:col-span-2">
          {selectedProcurements.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <SearchIcon size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Select procurements from the left panel to compare</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Tender Numbers */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-{selectedProcurements.length} gap-4">
                    {selectedProcurements.map((proc, idx) => (
                      <div key={proc._id} className={`${idx > 0 ? 'border-l pl-4' : ''}`}>
                        <div className="font-semibold text-sm text-gray-600 mb-1">
                          Tender #{idx + 1}
                        </div>
                        <div className="font-mono text-sm">{proc.tender_number}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Title */}
              <ComparisonRow
                label="Title"
                values={selectedProcurements.map(p => p.title)}
              />

              {/* Category */}
              <ComparisonRow
                label="Category"
                values={selectedProcurements.map(p => getCategoryLabel(p.category))}
              />

              {/* Status */}
              <ComparisonRow
                label="Status"
                values={selectedProcurements.map(p => (
                  <span className="capitalize">{p.status}</span>
                ))}
              />

              {/* Estimated Value */}
              <ComparisonRow
                label="Estimated Value"
                values={selectedProcurements.map(p => formatCurrency(p.estimated_value))}
                highlight="min"
              />

              {/* Awarded Amount */}
              <ComparisonRow
                label="Awarded Amount"
                values={selectedProcurements.map(p =>
                  p.awarded_amount ? formatCurrency(p.awarded_amount) : 'Not awarded'
                )}
                highlight="min"
              />

              {/* Published Date */}
              <ComparisonRow
                label="Published Date"
                values={selectedProcurements.map(p =>
                  p.published_date ? formatDate(p.published_date) : 'Not published'
                )}
              />

              {/* Deadline */}
              <ComparisonRow
                label="Deadline"
                values={selectedProcurements.map(p =>
                  p.deadline ? formatDate(p.deadline) : 'No deadline'
                )}
              />

              {/* Awarded Date */}
              <ComparisonRow
                label="Awarded Date"
                values={selectedProcurements.map(p =>
                  p.awarded_date ? formatDate(p.awarded_date) : 'Not awarded'
                )}
              />

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`grid grid-cols-${selectedProcurements.length} gap-4`}>
                    {selectedProcurements.map((proc, idx) => (
                      <div key={proc._id} className={`${idx > 0 ? 'border-l pl-4' : ''}`}>
                        <p className="text-sm text-gray-700">{proc.description || 'No description'}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Clear Selection */}
              <div className="flex justify-center pt-4">
                <Button
                  
                  onClick={() => setSelectedIds([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ComparisonRow({
  label,
  values,
  highlight,
}: {
  label: string;
  values: (string | number | React.ReactNode)[];
  highlight?: 'min' | 'max';
}) {
  const numericValues = values.map(v =>
    typeof v === 'string' && v.includes('KES')
      ? parseFloat(v.replace(/[^0-9.-]+/g, ''))
      : typeof v === 'number'
      ? v
      : null
  );

  const minValue = highlight === 'min' ? Math.min(...numericValues.filter(v => v !== null) as number[]) : null;
  const maxValue = highlight === 'max' ? Math.max(...numericValues.filter(v => v !== null) as number[]) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid grid-cols-${values.length} gap-4`}>
          {values.map((value, idx) => {
            const isHighlighted =
              (highlight === 'min' && numericValues[idx] === minValue) ||
              (highlight === 'max' && numericValues[idx] === maxValue);

            return (
              <div
                key={idx}
                className={`${idx > 0 ? 'border-l pl-4' : ''} ${
                  isHighlighted ? 'bg-green-50 -m-2 p-2 rounded' : ''
                }`}
              >
                <div className="font-medium">{value}</div>
                {isHighlighted && (
                  <span className="text-xs text-green-600">
                    {highlight === 'min' ? 'Lowest' : 'Highest'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
