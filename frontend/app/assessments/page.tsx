'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { SearchIcon } from '@/components/ui/Icons';

interface Challenge {
  _id: string;
  title: string;
  skill: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  time_limit_minutes: number;
  metadata: {
    times_used: number;
    pass_rate: number;
  };
}

const SKILLS = ['react', 'python', 'javascript', 'typescript', 'nodejs', 'sql', 'java', 'golang'];
const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

export default function AssessmentsPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // TODO: Fetch challenges from API
    // For now, using mock data
    const mockChallenges: Challenge[] = [
      {
        _id: '1',
        title: 'Build a Counter Component',
        skill: 'react',
        difficulty_level: 'beginner',
        description: 'Create a simple counter component with increment and decrement buttons.',
        time_limit_minutes: 30,
        metadata: {
          times_used: 245,
          pass_rate: 78,
        },
      },
      {
        _id: '2',
        title: 'Todo List with State Management',
        skill: 'react',
        difficulty_level: 'intermediate',
        description: 'Build a todo list app with add, delete, and mark complete functionality.',
        time_limit_minutes: 45,
        metadata: {
          times_used: 189,
          pass_rate: 65,
        },
      },
      {
        _id: '3',
        title: 'List Comprehension Challenge',
        skill: 'python',
        difficulty_level: 'beginner',
        description: 'Solve problems using Python list comprehensions and lambda functions.',
        time_limit_minutes: 30,
        metadata: {
          times_used: 312,
          pass_rate: 82,
        },
      },
      {
        _id: '4',
        title: 'API Development with Flask',
        skill: 'python',
        difficulty_level: 'advanced',
        description: 'Create a RESTful API with authentication and database integration.',
        time_limit_minutes: 90,
        metadata: {
          times_used: 156,
          pass_rate: 52,
        },
      },
      {
        _id: '5',
        title: 'Database Query Optimization',
        skill: 'sql',
        difficulty_level: 'intermediate',
        description: 'Optimize slow SQL queries and write efficient JOIN operations.',
        time_limit_minutes: 45,
        metadata: {
          times_used: 201,
          pass_rate: 71,
        },
      },
    ];

    setChallenges(mockChallenges);
    setLoading(false);
  }, []);

  const filteredChallenges = challenges.filter((challenge) => {
    const matchesSkill = !selectedSkill || challenge.skill === selectedSkill;
    const matchesDifficulty = !selectedDifficulty || challenge.difficulty_level === selectedDifficulty;
    const matchesSearch = !searchQuery ||
      challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSkill && matchesDifficulty && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Skill Assessments</h1>
          <p className="text-gray-600">
            Take AI-monitored coding challenges to earn verified credentials
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Skill Filter */}
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">All Skills</option>
              {SKILLS.map((skill) => (
                <option key={skill} value={skill}>
                  {skill.charAt(0).toUpperCase() + skill.slice(1)}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">All Levels</option>
              {DIFFICULTY_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          {filteredChallenges.length} {filteredChallenges.length === 1 ? 'challenge' : 'challenges'} found
        </div>

        {/* Challenges Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading challenges...</p>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No challenges found matching your criteria</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge) => (
              <ChallengeCard key={challenge._id} challenge={challenge} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="inline-block px-3 py-1 text-sm font-medium bg-black text-white rounded-full mb-2">
            {challenge.skill.toUpperCase()}
          </span>
          <h3 className="text-xl font-semibold">{challenge.title}</h3>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{challenge.description}</p>

      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
        <span className={`px-2 py-1 rounded ${getDifficultyColor(challenge.difficulty_level)}`}>
          {challenge.difficulty_level}
        </span>
        <span>⏱️ {challenge.time_limit_minutes} min</span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          <div>{challenge.metadata.times_used} attempts</div>
          <div className="text-green-600">{challenge.metadata.pass_rate}% pass rate</div>
        </div>
        <Link href={`/assessments/${challenge._id}`}>
          <Button size="sm">Start Challenge</Button>
        </Link>
      </div>
    </div>
  );
}
