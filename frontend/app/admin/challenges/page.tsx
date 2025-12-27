'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Challenge {
  _id: string;
  title: string;
  description: string;
  skill: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  challenge_type: 'coding' | 'multiple_choice' | 'project' | 'debugging';
  time_limit_minutes: number;
  is_active: boolean;
  metadata: {
    times_used: number;
    average_score: number;
    pass_rate: number;
  };
  created_at: string;
}

export default function AdminChallengesPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ skill: 'all', difficulty: 'all' });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin/challenges');
      return;
    }

    // Check if user is admin
    if (user?.user_type !== 'educator' && user?.user_type !== 'employer') {
      router.push('/');
      return;
    }

    // TODO: Fetch challenges from API
    // GET /api/challenges

    // Mock data for now
    const mockChallenges: Challenge[] = [
      {
        _id: '1',
        title: 'Build a Counter Component',
        description: 'Create a simple React counter with increment/decrement',
        skill: 'react',
        difficulty_level: 'beginner',
        challenge_type: 'coding',
        time_limit_minutes: 20,
        is_active: true,
        metadata: {
          times_used: 45,
          average_score: 82.5,
          pass_rate: 78.5
        },
        created_at: '2025-01-01T10:00:00Z'
      },
      {
        _id: '2',
        title: 'Todo List with State Management',
        description: 'Build a todo list with add/remove/complete functionality',
        skill: 'react',
        difficulty_level: 'intermediate',
        challenge_type: 'coding',
        time_limit_minutes: 45,
        is_active: true,
        metadata: {
          times_used: 32,
          average_score: 75.3,
          pass_rate: 65.2
        },
        created_at: '2025-01-02T10:00:00Z'
      },
      {
        _id: '3',
        title: 'List Comprehension Basics',
        description: 'Use Python list comprehensions to transform data',
        skill: 'python',
        difficulty_level: 'beginner',
        challenge_type: 'coding',
        time_limit_minutes: 25,
        is_active: true,
        metadata: {
          times_used: 58,
          average_score: 88.1,
          pass_rate: 85.0
        },
        created_at: '2025-01-03T10:00:00Z'
      },
      {
        _id: '4',
        title: 'Dictionary Data Processing',
        description: 'Process and analyze data in Python dictionaries',
        skill: 'python',
        difficulty_level: 'intermediate',
        challenge_type: 'coding',
        time_limit_minutes: 40,
        is_active: true,
        metadata: {
          times_used: 27,
          average_score: 79.6,
          pass_rate: 71.3
        },
        created_at: '2025-01-04T10:00:00Z'
      },
      {
        _id: '5',
        title: 'Array Manipulation Basics',
        description: 'Practice JavaScript array methods',
        skill: 'javascript',
        difficulty_level: 'beginner',
        challenge_type: 'coding',
        time_limit_minutes: 25,
        is_active: true,
        metadata: {
          times_used: 51,
          average_score: 84.2,
          pass_rate: 80.1
        },
        created_at: '2025-01-05T10:00:00Z'
      }
    ];

    setChallenges(mockChallenges);
    setLoading(false);
  }, [isAuthenticated, user, router]);

  const filteredChallenges = challenges.filter((challenge) => {
    if (filter.skill !== 'all' && challenge.skill !== filter.skill) return false;
    if (filter.difficulty !== 'all' && challenge.difficulty_level !== filter.difficulty) return false;
    return true;
  });

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPassRateColor = (rate: number) => {
    if (rate >= 75) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading challenges...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Challenge Management</h1>
            <p className="text-gray-600">
              Manage coding challenges for skill assessments
            </p>
          </div>
          <Link href="/admin/challenges/new">
            <Button size="lg">+ Create Challenge</Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-3xl font-bold text-black">{challenges.length}</div>
            <div className="text-gray-600">Total Challenges</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-3xl font-bold text-blue-600">
              {challenges.filter(c => c.is_active).length}
            </div>
            <div className="text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-3xl font-bold text-green-600">
              {challenges.reduce((sum, c) => sum + c.metadata.times_used, 0)}
            </div>
            <div className="text-gray-600">Total Uses</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-3xl font-bold text-purple-600">
              {(challenges.reduce((sum, c) => sum + c.metadata.average_score, 0) / challenges.length).toFixed(1)}
            </div>
            <div className="text-gray-600">Avg Score</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Skill Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Skill
              </label>
              <select
                value={filter.skill}
                onChange={(e) => setFilter({ ...filter, skill: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Skills</option>
                <option value="react">React</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="nodejs">Node.js</option>
                <option value="sql">SQL</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Difficulty
              </label>
              <select
                value={filter.difficulty}
                onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>
        </div>

        {/* Challenges Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Challenge
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skill
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Limit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pass Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredChallenges.map((challenge) => (
                  <tr key={challenge._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{challenge.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {challenge.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-black text-white rounded text-xs uppercase">
                        {challenge.skill}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs capitalize ${getDifficultyColor(challenge.difficulty_level)}`}>
                        {challenge.difficulty_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {challenge.time_limit_minutes} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium">{challenge.metadata.times_used} uses</div>
                        <div className="text-gray-500">Avg: {challenge.metadata.average_score.toFixed(1)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getPassRateColor(challenge.metadata.pass_rate)}`}>
                        {challenge.metadata.pass_rate.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {challenge.is_active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Link href={`/admin/challenges/${challenge._id}`}>
                          <button className="text-black hover:underline">Edit</button>
                        </Link>
                        <button className="text-red-600 hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredChallenges.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center mt-6">
            <p className="text-gray-500 mb-4">No challenges found matching your filters</p>
            <Button
              variant="outline"
              onClick={() => setFilter({ skill: 'all', difficulty: 'all' })}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
