'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface ProcurementEvent {
  _id: string;
  procurement_id: string;
  event_type: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date?: string;
  actual_date?: string;
  created_by?: string;
  files: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  findings?: string;
  notes: Array<{
    text: string;
    added_by?: string;
    added_at?: string;
  }>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  cancelled_at?: string;
}

interface EventTimelineProps {
  procurementId: string;
}

export function EventTimeline({ procurementId }: EventTimelineProps) {
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<ProcurementEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ProcurementEvent | null>(null);

  useEffect(() => {
    loadEvents();
  }, [procurementId]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await api.getProcurementEvents(procurementId);
      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'in_progress':
        return 'bg-blue-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'published':
        return '📢';
      case 'evaluation':
        return '📊';
      case 'award':
        return '🏆';
      case 'delivery':
        return '🚚';
      case 'inspection':
        return '🔍';
      case 'completion':
        return '✅';
      case 'milestone':
        return '🎯';
      default:
        return '📝';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Event Timeline</CardTitle>
          {isAuthenticated && (user?.role === 'admin' || user?.role === 'government_official') && (
            <Button
              size="sm"
              onClick={() => setShowAddEvent(true)}
            >
              + Add Event
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No events recorded yet. Add your first event to track procurement progress.
          </p>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-200" />

            {/* Events */}
            <div className="space-y-6">
              {events.map((event, index) => (
                <div key={event._id} className="relative flex gap-4">
                  {/* Icon circle */}
                  <div className={`
                    relative z-10 flex items-center justify-center w-10 h-10 rounded-full text-xl
                    ${getStatusColor(event.status)} ring-4 ring-white
                  `}>
                    {getEventIcon(event.event_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {event.title}
                          </h4>
                          <Badge className={`text-xs ${
                            event.status === 'completed' ? 'bg-green-100 text-green-800' :
                            event.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {event.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {event.description}
                        </p>

                        <div className="text-xs text-gray-500 space-y-1">
                          {event.scheduled_date && (
                            <div>Scheduled: {formatDate(event.scheduled_date)}</div>
                          )}
                          {event.actual_date && (
                            <div>Completed: {formatDate(event.actual_date)}</div>
                          )}
                        </div>

                        {/* Files */}
                        {event.files.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs font-medium text-gray-700 mb-1">
                              Attachments:
                            </div>
                            <div className="space-y-1">
                              {event.files.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                  <span>📎</span>
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    {file.name}
                                  </a>
                                  <span className="text-gray-400">
                                    ({Math.round(file.size / 1024)}KB)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Findings */}
                        {event.findings && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                            <div className="font-medium text-yellow-900 mb-1">Findings:</div>
                            <div className="text-yellow-800">{event.findings}</div>
                          </div>
                        )}

                        {/* Notes */}
                        {event.notes.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs font-medium text-gray-700 mb-1">Notes:</div>
                            <div className="space-y-1">
                              {event.notes.map((note, idx) => (
                                <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                                  <div className="text-gray-700">{note.text}</div>
                                  {note.added_at && (
                                    <div className="text-gray-400 mt-1">
                                      {formatDate(note.added_at)}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action button */}
                      {isAuthenticated && (user?.role === 'admin' || user?.role === 'government_official') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedEvent(event)}
                        >
                          Manage
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Event Modal */}
        {showAddEvent && (
          <AddEventModal
            procurementId={procurementId}
            onClose={() => setShowAddEvent(false)}
            onSuccess={() => {
              loadEvents();
              setShowAddEvent(false);
            }}
          />
        )}

        {/* Manage Event Modal */}
        {selectedEvent && (
          <ManageEventModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onSuccess={() => {
              loadEvents();
              setSelectedEvent(null);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

// Add Event Modal Component
function AddEventModal({ procurementId, onClose, onSuccess }: {
  procurementId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    event_type: 'milestone',
    title: '',
    description: '',
    scheduled_date: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.createProcurementEvent(procurementId, formData);
      if (response.success) {
        onSuccess();
      } else {
        alert('Failed to create event: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Add New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type
              </label>
              <select
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="published">Published</option>
                <option value="evaluation">Evaluation</option>
                <option value="award">Award</option>
                <option value="delivery">Delivery</option>
                <option value="inspection">Inspection</option>
                <option value="completion">Completion</option>
                <option value="milestone">Milestone</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Date
              </label>
              <input
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Event'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Manage Event Modal Component
function ManageEventModal({ event, onClose, onSuccess }: {
  event: ProcurementEvent;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [status, setStatus] = useState(event.status);
  const [findings, setFindings] = useState(event.findings || '');
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    setUpdating(true);

    try {
      const response = await api.updateEventStatus(event._id, {
        status,
        findings: findings.trim() || undefined
      });

      if (response.success) {
        onSuccess();
      } else {
        alert('Failed to update event: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to update event:', error);
      alert('Failed to update event. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Manage Event: {event.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Findings / Notes
              </label>
              <textarea
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                rows={4}
                placeholder="Add any findings, observations, or notes about this event..."
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleUpdate} disabled={updating}>
                {updating ? 'Updating...' : 'Update Event'}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
