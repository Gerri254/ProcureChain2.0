'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function StartAssessmentPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [loading, setLoading] = useState(false);

  const skills = [
    { value: 'react', label: 'React', icon: '⚛️' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'javascript', label: 'JavaScript', icon: '📜' },
    { value: 'typescript', label: 'TypeScript', icon: '📘' },
    { value: 'nodejs', label: 'Node.js', icon: '🟢' },
    { value: 'sql', label: 'SQL', icon: '🗄️' }
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner', description: 'Perfect for starting out', color: 'bg-green-100 text-green-800 border-green-300' },
    { value: 'intermediate', label: 'Intermediate', description: 'For those with experience', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { value: 'advanced', label: 'Advanced', description: 'Challenging problems', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    { value: 'expert', label: 'Expert', description: 'For the pros', color: 'bg-red-100 text-red-800 border-red-300' }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/assessments/start');
    }
  }, [isAuthenticated, router]);

  const handleStartAssessment = async () => {
    if (!selectedSkill || !selectedDifficulty) {
      alert('Please select both skill and difficulty level');
      return;
    }

    setLoading(true);

    try {
      // TODO: Call API to create assessment and get random challenge
      // POST /api/assessments with { skill, difficulty_level }
      // Response will include challenge_id and assessment_id

      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock response
      const mockAssessmentId = 'assessment_' + Date.now();
      const mockChallengeId = 'challenge_' + Date.now();

      // Navigate to the take assessment page
      router.push(`/assessments/take/${mockAssessmentId}?challenge=${mockChallengeId}`);

    } catch (error) {
      console.error('Error starting assessment:', error);
      alert('Failed to start assessment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Start a Skill Assessment</h1>
          <p className="text-xl text-gray-600">
            Test your coding skills and earn verified credentials
          </p>
        </div>

        {/* Step 1: Select Skill */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Step 1: Choose Your Skill</h2>
            <p className="text-gray-600">Select the programming language or technology to assess</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {skills.map((skill) => (
              <button
                key={skill.value}
                onClick={() => setSelectedSkill(skill.value)}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedSkill === skill.value
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="text-4xl mb-2">{skill.icon}</div>
                <div className="font-semibold text-lg">{skill.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Difficulty */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Step 2: Choose Difficulty Level</h2>
            <p className="text-gray-600">Pick a level that matches your experience</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {difficulties.map((difficulty) => (
              <button
                key={difficulty.value}
                onClick={() => setSelectedDifficulty(difficulty.value)}
                className={`p-6 rounded-lg border-2 text-left transition-all ${
                  selectedDifficulty === difficulty.value
                    ? 'border-black bg-black text-white'
                    : `border-gray-200 hover:border-gray-300 ${difficulty.color}`
                }`}
              >
                <div className="font-semibold text-lg mb-1">{difficulty.label}</div>
                <div className={`text-sm ${selectedDifficulty === difficulty.value ? 'text-gray-300' : 'text-gray-600'}`}>
                  {difficulty.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* What to Expect */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-8 mb-6">
          <h3 className="text-xl font-bold mb-4">What to Expect</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⏱️</div>
              <div>
                <div className="font-medium">Time Limit</div>
                <div className="text-sm text-gray-600">
                  You'll have 20-45 minutes depending on the challenge complexity
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">💻</div>
              <div>
                <div className="font-medium">Code Editor</div>
                <div className="text-sm text-gray-600">
                  Write your solution in our browser-based code editor with syntax highlighting
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🤖</div>
              <div>
                <div className="font-medium">AI Analysis</div>
                <div className="text-sm text-gray-600">
                  Your code will be analyzed by AI for correctness, quality, and best practices
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">✅</div>
              <div>
                <div className="font-medium">Verified Credential</div>
                <div className="text-sm text-gray-600">
                  Score 70+ to earn a verified skill credential that never expires
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={handleStartAssessment}
            disabled={!selectedSkill || !selectedDifficulty || loading}
            className="px-12 py-4 text-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Starting Assessment...
              </span>
            ) : (
              'Start Assessment'
            )}
          </Button>

          {(!selectedSkill || !selectedDifficulty) && (
            <p className="text-sm text-gray-500 mt-3">
              Please select both skill and difficulty level to continue
            </p>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/assessments')}
            className="text-gray-600 hover:text-black underline"
          >
            ← Back to Assessments
          </button>
        </div>
      </div>
    </div>
  );
}
