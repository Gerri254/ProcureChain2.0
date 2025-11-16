'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { analyticsAPI, procurementAPI } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Building,
  AlertTriangle,
  DollarSign,
  Activity,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardStats {
  total_procurements: number;
  total_value: number;
  active_procurements: number;
  total_vendors: number;
  flagged_items: number;
  avg_risk_score: number;
}

interface RecentProcurement {
  _id: string;
  title: string;
  status: string;
  estimated_value: number;
  created_at: string;
  metadata?: {
    risk_score?: number;
    has_anomalies?: boolean;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProcurements, setRecentProcurements] = useState<RecentProcurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const statsResponse = await analyticsAPI.getStats();
      setStats(statsResponse.data.data);

      // Fetch recent procurements
      const procurementsResponse = await procurementAPI.getAll({
        page: 1,
        limit: 5,
        sort: '-created_at'
      });
      setRecentProcurements(procurementsResponse.data.data.procurements);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.full_name}
        </h1>
        <p className="text-gray-600">Here's what's happening with your procurement system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Procurements</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.total_procurements || 0}
          </p>
          <p className="text-sm text-green-600 mt-2">
            {stats?.active_procurements || 0} active
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Value</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats?.total_value || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-2">Across all contracts</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Building className="w-6 h-6 text-purple-600" />
            </div>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Registered Vendors</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.total_vendors || 0}
          </p>
          <Link href="/vendors" className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block">
            View all vendors
          </Link>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            {stats?.flagged_items ? (
              <TrendingUp className="w-5 h-5 text-yellow-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-green-500" />
            )}
          </div>
          <p className="text-gray-600 text-sm mb-1">Flagged Items</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.flagged_items || 0}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Avg risk: {stats?.avg_risk_score || 0}/100
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Procurements */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Procurements</h2>
                <Link href="/procurement">
                  <Button variant="ghost" size="sm">
                    View all
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {recentProcurements.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No procurements yet
                </div>
              ) : (
                recentProcurements.map((procurement) => (
                  <Link
                    key={procurement._id}
                    href={`/procurement/${procurement._id}`}
                    className="block p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                          {procurement.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(procurement.created_at)}
                        </p>
                      </div>
                      <Badge color={getStatusColor(procurement.status)}>
                        {procurement.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(procurement.estimated_value)}
                      </p>

                      {procurement.metadata?.has_anomalies && (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-yellow-600">Anomalies detected</span>
                        </div>
                      )}

                      {procurement.metadata?.risk_score !== undefined && (
                        <Badge color={
                          procurement.metadata.risk_score > 70 ? 'red' :
                          procurement.metadata.risk_score > 40 ? 'yellow' : 'green'
                        }>
                          Risk: {procurement.metadata.risk_score}/100
                        </Badge>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              {(user?.role === 'admin' || user?.role === 'procurement_officer') && (
                <Link href="/procurement/new">
                  <Button variant="primary" className="w-full justify-start">
                    <FileText className="w-5 h-5 mr-3" />
                    New Procurement
                  </Button>
                </Link>
              )}

              <Link href="/procurement">
                <Button variant="secondary" className="w-full justify-start">
                  <FileText className="w-5 h-5 mr-3" />
                  Browse Procurements
                </Button>
              </Link>

              <Link href="/vendors">
                <Button variant="secondary" className="w-full justify-start">
                  <Building className="w-5 h-5 mr-3" />
                  View Vendors
                </Button>
              </Link>

              <Link href="/analytics">
                <Button variant="secondary" className="w-full justify-start">
                  <Activity className="w-5 h-5 mr-3" />
                  Analytics
                </Button>
              </Link>
            </div>
          </Card>

          <Card>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <Badge color="green">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI Analysis</span>
                <Badge color="green">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <Badge color="green">Connected</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
