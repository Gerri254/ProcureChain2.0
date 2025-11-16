'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { procurementAPI } from '@/lib/api';
import { Procurement } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate, getStatusColor, getSeverityColor } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign,
  Building,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProcurementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [procurement, setProcurement] = useState<Procurement | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProcurement();
    }
  }, [params.id]);

  const fetchProcurement = async () => {
    try {
      setLoading(true);
      const response = await procurementAPI.getById(params.id as string);
      setProcurement(response.data.data);
    } catch (error) {
      toast.error('Failed to load procurement details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this procurement record?')) return;

    try {
      setDeleting(true);
      await procurementAPI.delete(params.id as string);
      toast.success('Procurement deleted successfully');
      router.push('/procurement');
    } catch (error) {
      toast.error('Failed to delete procurement');
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const canEdit = user && (user.role === 'admin' || user.role === 'procurement_officer');
  const canDelete = user && user.role === 'admin';

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!procurement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Procurement Not Found</h2>
          <Link href="/procurement">
            <Button variant="primary">Back to Procurements</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/procurement">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Procurements
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              {procurement.tender_number && (
                <p className="text-sm text-gray-500 mb-2">{procurement.tender_number}</p>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{procurement.title}</h1>
              <div className="flex items-center gap-3">
                <Badge color={getStatusColor(procurement.status)}>{procurement.status}</Badge>
                {procurement.metadata?.ai_analyzed && (
                  <Badge color="blue">AI Analyzed</Badge>
                )}
                {procurement.metadata?.has_anomalies && (
                  <Badge color="yellow">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Anomalies Detected
                  </Badge>
                )}
              </div>
            </div>

            {canEdit && (
              <div className="flex gap-2">
                <Link href={`/procurement/${procurement._id}/edit`}>
                  <Button variant="secondary">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                {canDelete && (
                  <Button variant="danger" onClick={handleDelete} loading={deleting}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{procurement.description}</p>
            </Card>

            {/* Anomalies */}
            {procurement.anomalies && procurement.anomalies.length > 0 && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                  Detected Anomalies
                </h2>
                <div className="space-y-3">
                  {procurement.anomalies.map((anomaly, index) => (
                    <div
                      key={index}
                      className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{anomaly.type}</h3>
                        <Badge color={getSeverityColor(anomaly.severity)}>
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">{anomaly.description}</p>
                      {anomaly.recommendation && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Recommendation:</strong> {anomaly.recommendation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Documents */}
            {procurement.documents && procurement.documents.length > 0 && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents</h2>
                <div className="space-y-2">
                  {procurement.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.filename}</p>
                          <p className="text-xs text-gray-500">
                            Uploaded {formatDate(doc.uploaded_at)}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Details */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Details</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span>Estimated Value</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(procurement.estimated_value)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Building className="w-4 h-4" />
                    <span>Category</span>
                  </div>
                  <p className="font-medium text-gray-900">{procurement.category}</p>
                </div>

                {procurement.department && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Building className="w-4 h-4" />
                      <span>Department</span>
                    </div>
                    <p className="font-medium text-gray-900">{procurement.department}</p>
                  </div>
                )}

                {procurement.procurement_officer && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <User className="w-4 h-4" />
                      <span>Procurement Officer</span>
                    </div>
                    <p className="font-medium text-gray-900">{procurement.procurement_officer}</p>
                  </div>
                )}

                {procurement.created_at && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>Created</span>
                    </div>
                    <p className="font-medium text-gray-900">{formatDate(procurement.created_at)}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* AI Analysis */}
            {procurement.metadata?.ai_analyzed && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Risk Score</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            procurement.metadata.risk_score > 70 ? 'bg-red-500' :
                            procurement.metadata.risk_score > 40 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${procurement.metadata.risk_score}%` }}
                        />
                      </div>
                      <span className="font-bold text-gray-900">
                        {procurement.metadata.risk_score}/100
                      </span>
                    </div>
                  </div>

                  {procurement.metadata.has_anomalies ? (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">Anomalies Detected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">No Anomalies Detected</span>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
