'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CheckCircleIcon } from '@/components/ui/Icons';
import { formatDate } from '@/lib/utils';

interface TimelineEvent {
  stage: string;
  label: string;
  date: string;
  status: 'completed' | 'upcoming' | 'current';
  vendor_id?: string;
}

interface TimelineData {
  procurement_id: string;
  tender_number: string;
  title: string;
  current_status: string;
  timeline: TimelineEvent[];
}

export function ProcurementTimeline({ procurementId }: { procurementId: string }) {
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTimeline();
  }, [procurementId]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const response = await api.getProcurementTimeline(procurementId);

      if (response.success && response.data) {
        setTimeline(response.data);
      } else {
        setError('Failed to load timeline');
      }
    } catch (err) {
      console.error('Timeline error:', err);
      setError('Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !timeline) {
    return (
      <div className="text-red-600 text-center py-4">
        {error || 'Timeline not available'}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-6">Procurement Timeline</h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Timeline events */}
        <div className="space-y-8">
          {timeline.timeline.map((event, index) => {
            const isCompleted = event.status === 'completed';
            const isUpcoming = event.status === 'upcoming';
            const isCurrent = event.status === 'current';

            return (
              <div key={index} className="relative flex items-start">
                {/* Icon */}
                <div
                  className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 ${
                    isCompleted
                      ? 'bg-green-500 border-green-200'
                      : isUpcoming
                      ? 'bg-gray-200 border-gray-300'
                      : 'bg-blue-500 border-blue-200'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircleIcon size={24} className="text-white" />
                  ) : (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>

                {/* Content */}
                <div className="ml-6 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4
                        className={`font-semibold ${
                          isCompleted
                            ? 'text-green-700'
                            : isUpcoming
                            ? 'text-gray-500'
                            : 'text-blue-700'
                        }`}
                      >
                        {event.label}
                      </h4>
                      <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
                    </div>

                    {event.status && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isCompleted
                            ? 'bg-green-100 text-green-800'
                            : isUpcoming
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {event.status === 'completed'
                          ? 'Completed'
                          : event.status === 'upcoming'
                          ? 'Upcoming'
                          : 'In Progress'}
                      </span>
                    )}
                  </div>

                  {event.vendor_id && (
                    <div className="mt-2 text-sm text-gray-600">
                      Vendor ID: {event.vendor_id}
                    </div>
                  )}

                  {/* Progress bar */}
                  {index < timeline.timeline.length - 1 && (
                    <div className="mt-4 h-1 bg-gray-200 rounded-full">
                      <div
                        className={`h-1 rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-green-500 w-full' : 'bg-gray-300 w-0'
                        }`}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-8 pt-6 border-t">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Tender Number:</span>
            <span className="ml-2 font-medium">{timeline.tender_number}</span>
          </div>
          <div>
            <span className="text-gray-600">Current Status:</span>
            <span className="ml-2 font-medium capitalize">{timeline.current_status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
