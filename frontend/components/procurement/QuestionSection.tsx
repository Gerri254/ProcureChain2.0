'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';

interface Question {
  _id: string;
  question: string;
  asked_by: string;
  created_at: string;
  answer?: string;
  answered_by?: string;
  answered_at?: string;
  status: string;
  upvotes: number;
  downvotes: number;
}

export function QuestionSection({ procurementId }: { procurementId: string }) {
  const { user, isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [askedBy, setAskedBy] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, [procurementId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.getProcurementQuestions(procurementId);
      if (response.success && response.data) {
        setQuestions(response.data);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    if (!isAuthenticated && !askedBy.trim()) {
      setError('Please enter your name');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const data: any = {
        question: newQuestion,
      };

      if (!isAuthenticated && askedBy) {
        data.asked_by = askedBy;
      }

      const response = await api.createQuestion(procurementId, data);
      if (response.success) {
        setNewQuestion('');
        setAskedBy('');
        fetchQuestions();
      } else {
        setError(response.error || 'Failed to submit question');
      }
    } catch (err: any) {
      console.error('Failed to submit question:', err);
      setError(err.message || 'Failed to submit question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (questionId: string) => {
    try {
      await api.upvoteQuestion(questionId);
      fetchQuestions();
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  const handleDownvote = async (questionId: string) => {
    try {
      await api.downvoteQuestion(questionId);
      fetchQuestions();
    } catch (err) {
      console.error('Failed to downvote:', err);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="p-6 flex justify-center">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Questions & Answers</h3>
        <p className="text-sm text-gray-600 mb-6">
          Ask questions about this procurement and get official answers from procurement officers.
        </p>

        {/* Ask Question Form */}
        <form onSubmit={handleSubmit} className="mb-6 pb-6 border-b">
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">Your Question</label>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask a question about this procurement..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
              minLength={10}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {newQuestion.length}/1000 characters
            </p>
          </div>

          {!isAuthenticated && (
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Your Name</label>
              <Input
                value={askedBy}
                onChange={(e) => setAskedBy(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
          )}

          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" disabled={submitting || !newQuestion.trim()}>
            {submitting ? 'Submitting...' : 'Submit Question'}
          </Button>
        </form>

        {/* Questions List */}
        <div className="space-y-6">
          {questions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No questions yet. Be the first to ask!</p>
            </div>
          ) : (
            questions.map((q) => (
              <div key={q._id} className="border-b pb-6 last:border-b-0">
                <div className="flex items-start gap-4">
                  {/* Vote buttons */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleUpvote(q._id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      aria-label="Upvote"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <span className="text-sm font-medium">{q.upvotes - q.downvotes}</span>
                    <button
                      onClick={() => handleDownvote(q._id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      aria-label="Downvote"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Question content */}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">{q.question}</p>
                    <p className="text-sm text-gray-600">
                      Asked by <span className="font-medium">{q.asked_by}</span> · {formatDate(q.created_at)}
                    </p>

                    {/* Answer */}
                    {q.answer ? (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                          <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-green-800">Official Answer</p>
                            <p className="mt-1 text-gray-900">{q.answer}</p>
                            <p className="text-xs text-gray-600 mt-2">
                              Answered by <span className="font-medium">{q.answered_by}</span> · {formatDate(q.answered_at!)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          Awaiting official response
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
