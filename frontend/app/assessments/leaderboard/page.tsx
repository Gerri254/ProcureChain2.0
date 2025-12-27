'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  user_name: string;
  skill: string;
  score: number;
  verified_date: string;
  assessments_count: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState<string>('all-time');

  const skills = ['all', 'react', 'python', 'javascript', 'typescript', 'node.js', 'sql'];

  useEffect(() => {
    // TODO: Fetch leaderboard data from API
    // GET /api/assessments/leaderboard?skill={skill}&period={period}

    // Mock data for now
    const mockLeaderboard: LeaderboardEntry[] = [
      {
        rank: 1,
        user_id: '1',
        user_name: 'Sarah Chen',
        skill: 'python',
        score: 98,
        verified_date: '2025-01-20T10:30:00Z',
        assessments_count: 5,
      },
      {
        rank: 2,
        user_id: '2',
        user_name: 'Michael Rodriguez',
        skill: 'react',
        score: 96,
        verified_date: '2025-01-22T14:15:00Z',
        assessments_count: 4,
      },
      {
        rank: 3,
        user_id: '3',
        user_name: 'Emily Johnson',
        skill: 'javascript',
        score: 94,
        verified_date: '2025-01-18T09:45:00Z',
        assessments_count: 6,
      },
      {
        rank: 4,
        user_id: '4',
        user_name: 'David Kim',
        skill: 'typescript',
        score: 93,
        verified_date: '2025-01-25T16:20:00Z',
        assessments_count: 3,
      },
      {
        rank: 5,
        user_id: '5',
        user_name: 'Jessica Martinez',
        skill: 'python',
        score: 92,
        verified_date: '2025-01-19T11:00:00Z',
        assessments_count: 4,
      },
      {
        rank: 6,
        user_id: '6',
        user_name: 'James Wilson',
        skill: 'node.js',
        score: 91,
        verified_date: '2025-01-21T13:30:00Z',
        assessments_count: 3,
      },
      {
        rank: 7,
        user_id: '7',
        user_name: 'Lisa Anderson',
        skill: 'react',
        score: 90,
        verified_date: '2025-01-23T15:45:00Z',
        assessments_count: 5,
      },
      {
        rank: 8,
        user_id: '8',
        user_name: 'Robert Taylor',
        skill: 'sql',
        score: 89,
        verified_date: '2025-01-17T10:15:00Z',
        assessments_count: 2,
      },
      {
        rank: 9,
        user_id: '9',
        user_name: 'Amanda White',
        skill: 'python',
        score: 88,
        verified_date: '2025-01-24T12:00:00Z',
        assessments_count: 4,
      },
      {
        rank: 10,
        user_id: '10',
        user_name: 'Christopher Lee',
        skill: 'javascript',
        score: 87,
        verified_date: '2025-01-16T14:30:00Z',
        assessments_count: 3,
      },
    ];

    setLeaderboard(mockLeaderboard);
    setLoading(false);
  }, [selectedSkill, timePeriod]);

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-purple-600';
    if (score >= 90) return 'text-green-600';
    if (score >= 85) return 'text-blue-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 95) return 'bg-purple-50';
    if (score >= 90) return 'bg-green-50';
    if (score >= 85) return 'bg-blue-50';
    if (score >= 80) return 'bg-yellow-50';
    return 'bg-gray-50';
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Global Leaderboard</h1>
          <p className="text-gray-600">
            Top performers verified by AI-powered skill assessments
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Skill Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Skill
              </label>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => setSelectedSkill(skill)}
                    className={`px-4 py-2 rounded-md transition-colors capitalize ${
                      selectedSkill === skill
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {skill === 'all' ? 'All Skills' : skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Period Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <div className="flex flex-wrap gap-2">
                {['all-time', 'monthly', 'weekly'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimePeriod(period)}
                    className={`px-4 py-2 rounded-md transition-colors capitalize ${
                      timePeriod === period
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {period.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Second Place */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-6 text-center order-2 md:order-1">
              <div className="text-5xl mb-3">🥈</div>
              <div className="text-2xl font-bold mb-1">{leaderboard[1].user_name}</div>
              <div className="text-sm text-gray-600 mb-3 capitalize">
                {leaderboard[1].skill}
              </div>
              <div className="text-3xl font-bold text-gray-700">{leaderboard[1].score}</div>
              <div className="text-sm text-gray-500 mt-2">
                {leaderboard[1].assessments_count} assessments
              </div>
            </div>

            {/* First Place */}
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg p-8 text-center order-1 md:order-2 md:scale-105 shadow-lg">
              <div className="text-6xl mb-3">🥇</div>
              <div className="text-3xl font-bold mb-1">{leaderboard[0].user_name}</div>
              <div className="text-sm text-gray-600 mb-3 capitalize">
                {leaderboard[0].skill}
              </div>
              <div className="text-4xl font-bold text-yellow-700">{leaderboard[0].score}</div>
              <div className="text-sm text-gray-600 mt-2">
                {leaderboard[0].assessments_count} assessments
              </div>
            </div>

            {/* Third Place */}
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-6 text-center order-3">
              <div className="text-5xl mb-3">🥉</div>
              <div className="text-2xl font-bold mb-1">{leaderboard[2].user_name}</div>
              <div className="text-sm text-gray-600 mb-3 capitalize">
                {leaderboard[2].skill}
              </div>
              <div className="text-3xl font-bold text-orange-700">{leaderboard[2].score}</div>
              <div className="text-sm text-gray-500 mt-2">
                {leaderboard[2].assessments_count} assessments
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skill
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assessments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verified Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.user_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xl font-bold">
                        {getMedalEmoji(entry.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold mr-3">
                          {entry.user_name.charAt(0)}
                        </div>
                        <div className="font-medium text-gray-900">
                          {entry.user_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-black text-white rounded-full text-sm font-medium uppercase">
                        {entry.skill}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-4 py-2 rounded-lg ${getScoreBg(entry.score)}`}>
                        <span className={`text-2xl font-bold ${getScoreColor(entry.score)}`}>
                          {entry.score}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.assessments_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(entry.verified_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-8 bg-gradient-to-r from-black to-gray-800 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Join the Competition</h2>
          <p className="text-gray-300 mb-4">
            Take skill assessments and climb the leaderboard
          </p>
          <Button variant="outline" size="lg" className="bg-white text-black hover:bg-gray-100">
            Start Your First Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}
