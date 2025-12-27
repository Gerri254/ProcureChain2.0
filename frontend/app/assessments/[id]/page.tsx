'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

interface Challenge {
  _id: string;
  title: string;
  skill: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  prompt: string;
  time_limit_minutes: number;
  test_cases: Array<{
    input: string;
    expected_output: string;
    is_hidden: boolean;
  }>;
}

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // TODO: Fetch challenge from API
    // For now, using mock data
    const mockChallenge: Challenge = {
      _id: params.id as string,
      title: 'Build a Counter Component',
      skill: 'react',
      difficulty_level: 'beginner',
      description: 'Create a simple counter component with increment and decrement buttons.',
      prompt: `Create a React component called Counter that:

1. Displays a number starting at 0
2. Has an "Increment" button that increases the count by 1
3. Has a "Decrement" button that decreases the count by 1
4. The count should never go below 0

Requirements:
- Use React hooks (useState)
- Export the component as default
- Add appropriate button styling`,
      time_limit_minutes: 30,
      test_cases: [
        {
          input: 'Initial render',
          expected_output: 'Count displays 0',
          is_hidden: false,
        },
        {
          input: 'Click increment',
          expected_output: 'Count increases by 1',
          is_hidden: false,
        },
        {
          input: 'Click decrement at 0',
          expected_output: 'Count stays at 0',
          is_hidden: true,
        },
      ],
    };

    setChallenge(mockChallenge);
    setLoading(false);
  }, [params.id]);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/assessments/' + params.id);
      return;
    }

    if (!code.trim()) {
      alert('Please write some code before submitting');
      return;
    }

    setSubmitting(true);

    try {
      // TODO: Submit to API
      // const response = await api.submitAssessment({
      //   challenge_id: challenge._id,
      //   code_submitted: code,
      //   skill: challenge.skill,
      // });

      // Mock submission
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert('Assessment submitted! AI is analyzing your code...');
      router.push('/assessments/my-assessments');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading challenge...</p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Challenge not found</p>
          <Button onClick={() => router.push('/assessments')}>Browse Challenges</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/assessments')}
            className="text-gray-600 hover:text-black mb-4 flex items-center gap-2"
          >
            ← Back to Challenges
          </button>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-black text-white rounded-full">
                    {challenge.skill.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded ${getDifficultyColor(challenge.difficulty_level)}`}>
                    {challenge.difficulty_level}
                  </span>
                  <span className="text-gray-500">⏱️ {challenge.time_limit_minutes} minutes</span>
                </div>
                <h1 className="text-3xl font-bold">{challenge.title}</h1>
                <p className="text-gray-600 mt-2">{challenge.description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Instructions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Challenge Prompt</h2>
            <div className="prose max-w-none">
              <pre className="bg-gray-50 p-4 rounded border border-gray-200 whitespace-pre-wrap text-sm">
                {challenge.prompt}
              </pre>
            </div>

            {/* Test Cases */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Test Cases</h3>
              <div className="space-y-3">
                {challenge.test_cases
                  .filter((tc) => !tc.is_hidden)
                  .map((testCase, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded border border-gray-200">
                      <div className="text-sm">
                        <div className="font-medium text-gray-700 mb-1">Input:</div>
                        <div className="text-gray-600 mb-2">{testCase.input}</div>
                        <div className="font-medium text-gray-700 mb-1">Expected Output:</div>
                        <div className="text-gray-600">{testCase.expected_output}</div>
                      </div>
                    </div>
                  ))}
                <p className="text-sm text-gray-500 italic">
                  + {challenge.test_cases.filter((tc) => tc.is_hidden).length} hidden test cases
                </p>
              </div>
            </div>
          </div>

          {/* Right: Code Editor */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Solution</h2>
              {!isAuthenticated && (
                <span className="text-sm text-red-600">Login required to submit</span>
              )}
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your code here..."
              className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black resize-none"
              disabled={submitting}
            />

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {code.length} characters
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCode('')}
                  disabled={submitting || !code}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !code.trim()}
                >
                  {submitting ? 'Submitting...' : 'Submit for Evaluation'}
                </Button>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your code will be analyzed by AI for correctness and quality</li>
                <li>• Focus on clean, readable code with proper naming</li>
                <li>• Score ≥70 earns you a verified credential</li>
                <li>• You can retake assessments to improve your score</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
