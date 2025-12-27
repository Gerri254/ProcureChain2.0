'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface Challenge {
  challenge_id: string;
  title: string;
  description: string;
  skill: string;
  difficulty_level: string;
  prompt: string;
  starter_code: string;
  time_limit_minutes: number;
  estimated_time_minutes: number;
}

export default function TakeAssessmentPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const assessmentId = params.assessmentId as string;
  const challengeId = searchParams.get('challenge');

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/assessments/start');
      return;
    }

    // TODO: Fetch challenge from API
    // GET /api/challenges/{challengeId}

    // Mock challenge data
    const mockChallenge: Challenge = {
      challenge_id: challengeId || 'mock',
      title: 'Build a Counter Component',
      description: 'Create a simple React counter component with increment and decrement functionality',
      skill: 'react',
      difficulty_level: 'beginner',
      prompt: `Create a React component called Counter that displays a number and has two buttons:
- One button to increment the counter
- One button to decrement the counter

The counter should start at 0.

Requirements:
1. Use React hooks (useState)
2. Display the current count
3. Add increment (+1) and decrement (-1) buttons
4. The counter can go negative`,
      starter_code: `import React, { useState } from 'react';

function Counter() {
  // Your code here

  return (
    <div>
      {/* Display counter and buttons here */}
    </div>
  );
}

export default Counter;`,
      time_limit_minutes: 20,
      estimated_time_minutes: 15
    };

    setChallenge(mockChallenge);
    setCode(mockChallenge.starter_code);
    setTimeRemaining(mockChallenge.time_limit_minutes * 60); // Convert to seconds
    setIsRunning(true);
    setLoading(false);
    startTimeRef.current = Date.now();
  }, [isAuthenticated, challengeId, router]);

  // Timer countdown
  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);

      // Auto-submit when time runs out
      if (timeRemaining <= 0 && !submitting) {
        handleSubmit(true);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeRemaining, submitting]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeRemaining < 60) return 'text-red-600';
    if (timeRemaining < 300) return 'text-orange-600';
    return 'text-green-600';
  };

  const calculateTimeTaken = () => {
    const endTime = Date.now();
    const timeTakenMs = endTime - startTimeRef.current;
    return Math.floor(timeTakenMs / 1000); // Return in seconds
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (submitting) return;

    if (!autoSubmit && !showSubmitConfirm) {
      setShowSubmitConfirm(true);
      return;
    }

    setSubmitting(true);
    setIsRunning(false);

    try {
      const timeTakenSeconds = calculateTimeTaken();

      // TODO: Submit code to API
      // POST /api/assessments/{assessmentId}/submit
      // Body: { code_submitted, time_taken_seconds, challenge_data }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Navigate to results page
      router.push(`/assessments/my-assessments`);

    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment. Please try again.');
      setSubmitting(false);
      setIsRunning(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Challenge Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load the challenge</p>
          <Button onClick={() => router.push('/assessments/start')}>
            Start New Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar with Timer */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{challenge.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                <span className="px-2 py-1 bg-black text-white rounded text-xs uppercase">
                  {challenge.skill}
                </span>
                <span className="capitalize">{challenge.difficulty_level}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className={`text-3xl font-bold ${getTimerColor()}`}>
                {formatTime(timeRemaining)}
              </div>

              {/* Submit Button */}
              <Button
                onClick={() => handleSubmit()}
                disabled={submitting || timeRemaining === 0}
              >
                {submitting ? 'Submitting...' : 'Submit Code'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Challenge Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit">
            <h2 className="text-2xl font-bold mb-4">Challenge</h2>

            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 mb-4">{challenge.description}</p>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2">Instructions:</h3>
                <pre className="whitespace-pre-wrap text-sm text-gray-700">
                  {challenge.prompt}
                </pre>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Time Limit:</span> {challenge.time_limit_minutes} minutes
                </div>
                <div>
                  <span className="font-medium">Estimated:</span> {challenge.estimated_time_minutes} minutes
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Read the requirements carefully before coding</li>
                <li>• Test your code with different scenarios</li>
                <li>• Write clean, readable code with good variable names</li>
                <li>• Add comments for complex logic</li>
              </ul>
            </div>
          </div>

          {/* Right: Code Editor */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Your Solution</h2>
              <div className="text-sm text-gray-500">
                {code.split('\n').length} lines
              </div>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={timeRemaining === 0 || submitting}
              className="w-full h-[600px] p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              placeholder="Write your code here..."
              spellCheck={false}
            />

            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div>
                {timeRemaining === 0 ? (
                  <span className="text-red-600 font-medium">⏰ Time's up! Your code will be submitted automatically.</span>
                ) : (
                  <span>Your code is auto-saved as you type</span>
                )}
              </div>
              <div>
                {code.length} characters
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4">
            <h3 className="text-2xl font-bold mb-4">Submit Assessment?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your code? You won't be able to make changes after submission.
            </p>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
              <div>
                <span className="font-medium">Time Remaining:</span> {formatTime(timeRemaining)}
              </div>
              <div>
                <span className="font-medium">Code Lines:</span> {code.split('\n').length}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1"
              >
                Keep Editing
              </Button>
              <Button
                onClick={() => handleSubmit(false)}
                className="flex-1"
              >
                Yes, Submit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Warning when time is low */}
      {timeRemaining > 0 && timeRemaining <= 60 && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          <div className="font-bold">⚠️ Less than 1 minute remaining!</div>
        </div>
      )}
    </div>
  );
}
