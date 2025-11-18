'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { formatDateTime, getRiskBadge, getStatusColor } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import type { Anomaly } from '@/types';

export default function AnomaliesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      loadAnomalies();
    }
  }, [isAuthenticated, authLoading, page, router]);

  const loadAnomalies = async () => {
    try {
      const response = await api.getAnomalies(page, 20);
      if (response.success && response.data) {
        setAnomalies(response.data.items || []);
        setTotal(response.data.total || 0);
      } else {
        setAnomalies([]);
      }
    } catch (error) {
      console.error('Failed to load anomalies:', error);
      setAnomalies([]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
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
          <h1 className="text-4xl font-bold mb-2">Anomalies & Alerts</h1>
          <p className="text-gray-600">
            AI-detected anomalies and potential issues in procurement processes
          </p>
        </div>

        {anomalies.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-4xl mb-4">✅</div>
              <p className="text-gray-600 font-medium">No anomalies detected</p>
              <p className="text-sm text-gray-500 mt-2">
                All procurements are operating normally
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4">
              {anomalies.map((anomaly) => (
                <AnomalyCard key={anomaly._id} anomaly={anomaly} />
              ))}
            </div>

            {total > 20 && (
              <div className="flex justify-center gap-4 mt-8">
                <Button
                  
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {page} of {Math.ceil(total / 20)}
                </span>
                <Button
                  
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 20)}
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

function AnomalyCard({ anomaly }: { anomaly: Anomaly }) {
  const risk = getRiskBadge(anomaly.risk_score);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg capitalize">
                  {anomaly.anomaly_type} Anomaly
                </h3>
                <Badge className={getStatusColor(anomaly.severity)}>
                  {anomaly.severity}
                </Badge>
                <Badge className={risk.color}>{risk.label}</Badge>
              </div>
              <p className="text-gray-700 mb-3">{anomaly.description}</p>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>Risk Score: {anomaly.risk_score}/100</span>
                <span>•</span>
                <span>Flagged: {formatDateTime(anomaly.flagged_at)}</span>
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(anomaly.status)}>{anomaly.status}</Badge>
        </div>

        {anomaly.status === 'resolved' && anomaly.resolved_at && (
          <div className="mt-4 pt-4 border-t bg-green-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
            <div className="text-sm">
              <span className="font-medium text-green-800">Resolved: </span>
              <span className="text-green-700">{formatDateTime(anomaly.resolved_at)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
