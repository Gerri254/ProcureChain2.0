'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AnalyticsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Analytics data state
  const [spendingTrends, setSpendingTrends] = useState<any[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);
  const [vendorPerformance, setVendorPerformance] = useState<any[]>([]);
  const [anomalyBreakdown, setAnomalyBreakdown] = useState<any>(null);
  const [keyMetrics, setKeyMetrics] = useState<any>(null);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      fetchAnalyticsData();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all analytics data in parallel
      const [
        trendsRes,
        categoryRes,
        vendorsRes,
        anomalyRes,
        metricsRes,
        statusRes,
      ] = await Promise.all([
        api.getSpendingTrends(365),
        api.getCategoryDistribution(),
        api.getVendorPerformance(10),
        api.getAnomalyBreakdown(),
        api.getKeyMetrics(),
        api.getStatusDistribution(),
      ]);

      if (trendsRes.success && trendsRes.data) {
        setSpendingTrends(trendsRes.data);
      }

      if (categoryRes.success && categoryRes.data) {
        setCategoryDistribution(categoryRes.data);
      }

      if (vendorsRes.success && vendorsRes.data) {
        setVendorPerformance(vendorsRes.data);
      }

      if (anomalyRes.success && anomalyRes.data) {
        setAnomalyBreakdown(anomalyRes.data);
      }

      if (metricsRes.success && metricsRes.data) {
        setKeyMetrics(metricsRes.data);
      }

      if (statusRes.success && statusRes.data) {
        setStatusDistribution(statusRes.data);
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive procurement insights and trends</p>
      </div>

      {/* Key Metrics Cards */}
      {keyMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{formatCurrency(keyMetrics.total_value)}</div>
              <div className="text-sm text-gray-600">Total Procurement Value</div>
              <div className="text-xs text-gray-500 mt-1">
                Awarded: {formatCurrency(keyMetrics.awarded_value)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{formatCurrency(keyMetrics.month_value)}</div>
              <div className="text-sm text-gray-600">This Month</div>
              <div className="text-xs text-gray-500 mt-1">
                {keyMetrics.active_procurements} active procurements
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{keyMetrics.avg_processing_days} days</div>
              <div className="text-sm text-gray-600">Avg Processing Time</div>
              <div className="text-xs text-gray-500 mt-1">
                From publication to award
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{keyMetrics.high_risk_anomalies}</div>
              <div className="text-sm text-gray-600">High Risk Anomalies</div>
              <div className="text-xs text-gray-500 mt-1">
                {keyMetrics.total_vendors} total vendors
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Spending Trends Line Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Spending Trends Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={spendingTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total_value"
                stroke="#8884d8"
                name="Estimated Value"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="awarded_value"
                stroke="#82ca9d"
                name="Awarded Value"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Category Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry: any) => entry.category}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Procurement Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry: any) => `${entry.status} (${entry.count})`}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Performance Bar Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Top Vendor Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vendorPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Total Value" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Anomaly Breakdown */}
      {anomalyBreakdown && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Anomalies by Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={anomalyBreakdown.by_severity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="severity" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ff8042" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Anomalies by Type (Stacked)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={anomalyBreakdown.by_type}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="low" stackId="a" fill="#82ca9d" />
                  <Bar dataKey="medium" stackId="a" fill="#FFBB28" />
                  <Bar dataKey="high" stackId="a" fill="#FF8042" />
                  <Bar dataKey="critical" stackId="a" fill="#DC2626" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
