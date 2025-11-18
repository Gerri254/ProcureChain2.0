'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { ClipboardIcon, DollarIcon, MegaphoneIcon, CheckCircleIcon } from '@/components/ui/Icons';
import type { Statistics, Anomaly, Procurement } from '@/types';

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [recentProcurements, setRecentProcurements] = useState<Procurement[]>([]);
  const [highRiskAnomalies, setHighRiskAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadDashboardData = async () => {
    try {
      const [statsRes, procurementsRes, anomaliesRes] = await Promise.all([
        api.getProcurementStatistics(),
        api.getProcurements(1, 5),
        api.getHighRiskAnomalies(),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }

      if (procurementsRes.success && procurementsRes.data) {
        setRecentProcurements(procurementsRes.data.items || []);
      }

      if (anomaliesRes.success && anomaliesRes.data) {
        setHighRiskAnomalies(Array.isArray(anomaliesRes.data) ? anomaliesRes.data : []);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setRecentProcurements([]);
      setHighRiskAnomalies([]);
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
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.full_name}</p>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/procurements">
                <Button className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <ClipboardIcon size={24} />
                  <span className="text-sm">View Procurements</span>
                </Button>
              </Link>
              <Link href="/vendors">
                <Button className="w-full h-20 flex flex-col items-center justify-center gap-2" variant="secondary">
                  <DollarIcon size={24} />
                  <span className="text-sm">Browse Vendors</span>
                </Button>
              </Link>
              {(user?.role === 'admin' || user?.role === 'government_official' || user?.role === 'auditor') && (
                <>
                  <Link href="/analytics">
                    <Button className="w-full h-20 flex flex-col items-center justify-center gap-2" variant="secondary">
                      <MegaphoneIcon size={24} />
                      <span className="text-sm">Analytics</span>
                    </Button>
                  </Link>
                  <Link href="/compare">
                    <Button className="w-full h-20 flex flex-col items-center justify-center gap-2" variant="secondary">
                      <CheckCircleIcon size={24} />
                      <span className="text-sm">Compare Bids</span>
                    </Button>
                  </Link>
                </>
              )}
              {user?.role === 'vendor' && (
                <>
                  <Link href="/bids/my-bids">
                    <Button className="w-full h-20 flex flex-col items-center justify-center gap-2" variant="secondary">
                      <MegaphoneIcon size={24} />
                      <span className="text-sm">My Bids</span>
                    </Button>
                  </Link>
                  <Link href="/vendor/profile">
                    <Button className="w-full h-20 flex flex-col items-center justify-center gap-2" variant="secondary">
                      <CheckCircleIcon size={24} />
                      <span className="text-sm">My Profile</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Procurements"
              value={stats.total_procurements.toString()}
              icon={<ClipboardIcon size={28} />}
            />
            <StatCard
              title="Total Value"
              value={formatCurrency(stats.total_value)}
              icon={<DollarIcon size={28} />}
            />
            <StatCard
              title="Published"
              value={stats.by_status.published?.toString() || '0'}
              icon={<MegaphoneIcon size={28} />}
            />
            <StatCard
              title="Completed"
              value={stats.by_status.completed?.toString() || '0'}
              icon={<CheckCircleIcon size={28} />}
            />
          </div>
        )}

        {/* Categories Breakdown */}
        {stats && stats.by_category && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>By Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(stats.by_category).map(([category, count]) => (
                  <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{category}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Procurements */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Procurements</CardTitle>
                <Link href="/procurements">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentProcurements.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No procurements yet</p>
              ) : (
                <div className="space-y-4">
                  {recentProcurements.map((procurement) => (
                    <Link
                      key={procurement._id}
                      href={`/procurements/${procurement._id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium mb-1">{procurement.title}</div>
                      <div className="text-sm text-gray-600">
                        {procurement.tender_number} • {formatCurrency(procurement.estimated_value)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* High Risk Anomalies */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>High Risk Anomalies</CardTitle>
                <Link href="/anomalies">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {!Array.isArray(highRiskAnomalies) || highRiskAnomalies.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No high-risk anomalies</p>
              ) : (
                <div className="space-y-4">
                  {highRiskAnomalies.slice(0, 5).map((anomaly) => (
                    <div
                      key={anomaly._id}
                      className="p-3 rounded-lg bg-red-50 border border-red-100"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-red-900">
                          {anomaly.anomaly_type}
                        </span>
                        <span className="text-sm text-red-700">
                          Risk: {anomaly.risk_score}
                        </span>
                      </div>
                      <div className="text-sm text-red-700">{anomaly.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="text-gray-700">{icon}</div>
        </div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-sm text-gray-600">{title}</div>
      </CardContent>
    </Card>
  );
}
