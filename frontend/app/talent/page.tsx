'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface TalentProfile {
  _id: string;
  user_id: string;
  full_name: string;
  bio?: string;
  location?: string;
  experience_level?: 'junior' | 'mid-level' | 'senior' | 'expert';
  looking_for_job: boolean;
  verified_skills: Array<{
    skill: string;
    score: number;
  }>;
  average_score: number;
  total_assessments: number;
}

export default function TalentBrowsePage() {
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(0);
  const [lookingForJobOnly, setLookingForJobOnly] = useState(false);

  const availableSkills = ['react', 'python', 'javascript', 'typescript', 'node.js', 'sql', 'java', 'go'];
  const experienceLevels = ['all', 'junior', 'mid-level', 'senior', 'expert'];

  useEffect(() => {
    // TODO: Fetch talent profiles from API
    // GET /api/profiles/search?skills=react,python&min_score=80&experience_level=mid-level&looking_for_job=true

    // Mock data for now
    const mockTalents: TalentProfile[] = [
      {
        _id: '1',
        user_id: '1',
        full_name: 'Sarah Chen',
        bio: 'Full-stack developer passionate about building scalable web applications',
        location: 'San Francisco, CA',
        experience_level: 'mid-level',
        looking_for_job: true,
        verified_skills: [
          { skill: 'python', score: 98 },
          { skill: 'react', score: 92 },
          { skill: 'typescript', score: 88 },
        ],
        average_score: 92.7,
        total_assessments: 12,
      },
      {
        _id: '2',
        user_id: '2',
        full_name: 'Michael Rodriguez',
        bio: 'Frontend specialist with expertise in React and modern JavaScript',
        location: 'Austin, TX',
        experience_level: 'senior',
        looking_for_job: false,
        verified_skills: [
          { skill: 'react', score: 96 },
          { skill: 'javascript', score: 94 },
          { skill: 'typescript', score: 91 },
        ],
        average_score: 93.7,
        total_assessments: 15,
      },
      {
        _id: '3',
        user_id: '3',
        full_name: 'Emily Johnson',
        bio: 'Backend engineer specializing in Python and cloud infrastructure',
        location: 'Seattle, WA',
        experience_level: 'mid-level',
        looking_for_job: true,
        verified_skills: [
          { skill: 'python', score: 95 },
          { skill: 'sql', score: 89 },
          { skill: 'node.js', score: 86 },
        ],
        average_score: 90.0,
        total_assessments: 10,
      },
      {
        _id: '4',
        user_id: '4',
        full_name: 'David Kim',
        bio: 'Full-stack developer with strong TypeScript and React skills',
        location: 'New York, NY',
        experience_level: 'junior',
        looking_for_job: true,
        verified_skills: [
          { skill: 'typescript', score: 93 },
          { skill: 'react', score: 87 },
          { skill: 'node.js', score: 84 },
        ],
        average_score: 88.0,
        total_assessments: 8,
      },
      {
        _id: '5',
        user_id: '5',
        full_name: 'Jessica Martinez',
        bio: 'Data engineer with expertise in Python and SQL',
        location: 'Boston, MA',
        experience_level: 'senior',
        looking_for_job: false,
        verified_skills: [
          { skill: 'python', score: 92 },
          { skill: 'sql', score: 94 },
        ],
        average_score: 93.0,
        total_assessments: 7,
      },
      {
        _id: '6',
        user_id: '6',
        full_name: 'James Wilson',
        bio: 'Node.js specialist building high-performance backend systems',
        location: 'Denver, CO',
        experience_level: 'mid-level',
        looking_for_job: true,
        verified_skills: [
          { skill: 'node.js', score: 91 },
          { skill: 'javascript', score: 89 },
          { skill: 'typescript', score: 85 },
        ],
        average_score: 88.3,
        total_assessments: 9,
      },
    ];

    setTalents(mockTalents);
    setLoading(false);
  }, [selectedSkills, experienceLevel, minScore, lookingForJobOnly, searchQuery]);

  const toggleSkillFilter = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-50';
    if (score >= 80) return 'bg-blue-50';
    if (score >= 70) return 'bg-yellow-50';
    return 'bg-gray-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading talent profiles...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Talent</h1>
          <p className="text-gray-600">
            Find verified developers with AI-assessed skills
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by name, bio, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Skills Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Skills
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkillFilter(skill)}
                    className={`px-3 py-2 rounded-md text-sm transition-colors capitalize ${
                      selectedSkills.includes(skill)
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <div className="flex flex-wrap gap-2">
                {experienceLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setExperienceLevel(level)}
                    className={`px-3 py-2 rounded-md text-sm transition-colors capitalize ${
                      experienceLevel === level
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level === 'all' ? 'All Levels' : level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {/* Minimum Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Average Score: {minScore}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Looking for Job Only */}
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={lookingForJobOnly}
                  onChange={(e) => setLookingForJobOnly(e.target.checked)}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Show only candidates open to work
                </span>
              </label>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(selectedSkills.length > 0 || experienceLevel !== 'all' || minScore > 0 || lookingForJobOnly) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {selectedSkills.length > 0 && (
                    <span>Skills: {selectedSkills.join(', ')} • </span>
                  )}
                  {experienceLevel !== 'all' && (
                    <span className="capitalize">{experienceLevel} • </span>
                  )}
                  {minScore > 0 && <span>Min Score: {minScore} • </span>}
                  {lookingForJobOnly && <span>Open to work only</span>}
                </div>
                <button
                  onClick={() => {
                    setSelectedSkills([]);
                    setExperienceLevel('all');
                    setMinScore(0);
                    setLookingForJobOnly(false);
                    setSearchQuery('');
                  }}
                  className="text-sm text-black hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Found <span className="font-semibold">{talents.length}</span> verified developers
          </p>
        </div>

        {/* Talent Grid */}
        {talents.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">No Talent Found</h2>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters to see more results
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedSkills([]);
                setExperienceLevel('all');
                setMinScore(0);
                setLookingForJobOnly(false);
                setSearchQuery('');
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {talents.map((talent) => (
              <div
                key={talent._id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
                    {talent.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">{talent.full_name}</h3>
                    {talent.location && (
                      <p className="text-sm text-gray-500">{talent.location}</p>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex gap-2 mb-3">
                  {talent.experience_level && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs capitalize">
                      {talent.experience_level}
                    </span>
                  )}
                  {talent.looking_for_job && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                      Open to Work
                    </span>
                  )}
                </div>

                {/* Bio */}
                {talent.bio && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {talent.bio}
                  </p>
                )}

                {/* Average Score */}
                <div className={`${getScoreBg(talent.average_score)} rounded-lg p-3 mb-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-2xl font-bold ${getScoreColor(talent.average_score)}`}>
                        {talent.average_score.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-600">Avg Score</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {talent.total_assessments} assessments
                    </div>
                  </div>
                </div>

                {/* Verified Skills */}
                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-500 mb-2">
                    VERIFIED SKILLS
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {talent.verified_skills.slice(0, 4).map((skillData) => (
                      <span
                        key={skillData.skill}
                        className="px-2 py-1 bg-black text-white rounded text-xs uppercase"
                      >
                        {skillData.skill}
                      </span>
                    ))}
                    {talent.verified_skills.length > 4 && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                        +{talent.verified_skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <Link href={`/profile/${talent.user_id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Full Profile
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
