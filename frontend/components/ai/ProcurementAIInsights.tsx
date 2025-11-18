'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ProcurementAIInsightsProps {
  procurementId: string;
  title: string;
}

export function ProcurementAIInsights({ procurementId, title }: ProcurementAIInsightsProps) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.explainProcurement(procurementId);
      if (response.success && response.data) {
        setInsights(response.data.explanation);
        setExpanded(true);
      } else {
        setError(response.error || 'Failed to load AI insights');
      }
    } catch (err) {
      console.error('Failed to load AI insights:', err);
      setError('Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  if (!expanded && !insights) {
    return (
      <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
              <span>🤖</span>
              <span>AI-Powered Insights</span>
            </h3>
            <p className="text-sm text-blue-700">
              Get a simple explanation of this procurement and understand what it means for the public.
            </p>
          </div>
          <Button
            onClick={loadInsights}
            disabled={loading}
            variant="outline"
            size="sm"
            className="ml-4"
          >
            {loading ? 'Analyzing...' : 'Explain This'}
          </Button>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 mb-4 bg-red-50 border-red-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-red-900 mb-1">AI Insights Unavailable</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <Button
            onClick={() => {
              setError(null);
              setExpanded(false);
            }}
            variant="ghost"
            size="sm"
          >
            Close
          </Button>
        </div>
      </Card>
    );
  }

  if (!insights) return null;

  return (
    <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-bold text-xl text-blue-900 flex items-center gap-2">
          <span>🤖</span>
          <span>AI Insights: {title}</span>
        </h3>
        <Button
          onClick={() => setExpanded(false)}
          variant="ghost"
          size="sm"
        >
          Hide
        </Button>
      </div>

      {/* Simple Explanation */}
      {insights.simple_explanation && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-2">📝 In Simple Terms</h4>
          <p className="text-gray-700 leading-relaxed">{insights.simple_explanation}</p>
        </div>
      )}

      {/* What Is Being Bought */}
      {insights.what_is_being_bought && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-2">🛒 What's Being Purchased</h4>
          <p className="text-gray-700">{insights.what_is_being_bought}</p>
        </div>
      )}

      {/* Why It Matters */}
      {insights.why_it_matters && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-2">💡 Why This Matters</h4>
          <p className="text-gray-700">{insights.why_it_matters}</p>
        </div>
      )}

      {/* Key Points */}
      {insights.key_points && insights.key_points.length > 0 && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3">🔑 Key Points</h4>
          <ul className="space-y-2">
            {insights.key_points.map((point: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-gray-700 flex-1">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Transparency Score */}
      {insights.transparency_score !== undefined && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3">📊 Transparency Score</h4>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    insights.transparency_score >= 80
                      ? 'bg-green-500'
                      : insights.transparency_score >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${insights.transparency_score}%` }}
                />
              </div>
            </div>
            <span className="font-bold text-2xl text-gray-800">
              {insights.transparency_score}/100
            </span>
          </div>
          {insights.transparency_explanation && (
            <p className="text-sm text-gray-600 mt-2">{insights.transparency_explanation}</p>
          )}
        </div>
      )}

      {/* Potential Red Flags */}
      {insights.potential_red_flags && insights.potential_red_flags.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <span>⚠️</span>
            <span>Points to Consider</span>
          </h4>
          <ul className="space-y-2">
            {insights.potential_red_flags.map((flag: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">▸</span>
                <span className="text-amber-900 flex-1">{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-blue-200">
        <p className="text-xs text-gray-500">
          <span className="font-semibold">Note:</span> This explanation was generated by AI to help
          you understand the procurement. Always review the official procurement documents for complete
          information.
        </p>
      </div>
    </Card>
  );
}
