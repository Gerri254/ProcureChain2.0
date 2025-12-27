'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface VerifiedSkill {
  skill: string;
  score: number;
  verified_date: string;
  expires_at: string;
  is_expired: boolean;
  assessments_count: number;
}

interface UserProfile {
  _id: string;
  user_id: string;
  user_type: 'learner' | 'employer' | 'educator';
  full_name: string;
  bio?: string;
  location?: string;
  experience_level?: 'junior' | 'mid-level' | 'senior' | 'expert';
  looking_for_job: boolean;
  verified_skills: VerifiedSkill[];
  total_assessments: number;
  average_score: number;
  joined_date: string;
  portfolio_url?: string;
  github_url?: string;
  linkedin_url?: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'skills' | 'activity'>('skills');

  useEffect(() => {
    // TODO: Fetch user profile from API
    // GET /api/profiles/{userId}

    // Mock data for now
    const mockProfile: UserProfile = {
      _id: '1',
      user_id: userId,
      user_type: 'learner',
      full_name: 'Sarah Chen',
      bio: 'Full-stack developer passionate about building scalable web applications. Experienced in React, Python, and cloud technologies.',
      location: 'San Francisco, CA',
      experience_level: 'mid-level',
      looking_for_job: true,
      verified_skills: [
        {
          skill: 'react',
          score: 92,
          verified_date: '2025-01-20T10:30:00Z',
          expires_at: '2027-01-20T10:30:00Z',
          is_expired: false,
          assessments_count: 3,
        },
        {
          skill: 'python',
          score: 98,
          verified_date: '2025-01-18T14:15:00Z',
          expires_at: '2028-01-18T14:15:00Z',
          is_expired: false,
          assessments_count: 5,
        },
        {
          skill: 'typescript',
          score: 88,
          verified_date: '2025-01-15T09:00:00Z',
          expires_at: '2027-01-15T09:00:00Z',
          is_expired: false,
          assessments_count: 2,
        },
        {
          skill: 'node.js',
          score: 85,
          verified_date: '2025-01-12T16:20:00Z',
          expires_at: '2027-01-12T16:20:00Z',
          is_expired: false,
          assessments_count: 2,
        },
      ],
      total_assessments: 12,
      average_score: 90.75,
      joined_date: '2024-11-01T08:00:00Z',
      portfolio_url: 'https://sarachen.dev',
      github_url: 'https://github.com/sarachen',
      linkedin_url: 'https://linkedin.com/in/sarachen',
    };

    setProfile(mockProfile);
    setLoading(false);
  }, [userId]);

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 70) return { grade: 'B', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { grade: 'C', color: 'text-red-600', bg: 'bg-red-50' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">This user profile does not exist.</p>
          <Link href="/talent">
            <Button>Browse Talent</Button>
          </Link>
        </div>
      </div>
    );
  }

  const averageScoreGrade = getScoreGrade(profile.average_score);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center text-4xl font-bold">
              {profile.full_name.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{profile.full_name}</h1>
                  <div className="flex items-center gap-3 text-gray-600">
                    {profile.location && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {profile.location}
                      </span>
                    )}
                    {profile.experience_level && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm capitalize">
                        {profile.experience_level}
                      </span>
                    )}
                    {profile.looking_for_job && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Open to Work
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {profile.bio && (
                <p className="text-gray-700 mb-4">{profile.bio}</p>
              )}

              {/* Social Links */}
              <div className="flex gap-3">
                {profile.portfolio_url && (
                  <a
                    href={profile.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
                  >
                    Portfolio
                  </a>
                )}
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
                  >
                    GitHub
                  </a>
                )}
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </div>

            {/* Contact CTA (for employers) */}
            <div>
              <Button size="lg">Contact</Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-3xl font-bold text-black">{profile.verified_skills.length}</div>
            <div className="text-gray-600">Verified Skills</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className={`text-3xl font-bold ${averageScoreGrade.color}`}>
              {profile.average_score.toFixed(1)}
            </div>
            <div className="text-gray-600">Average Score</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-3xl font-bold text-blue-600">{profile.total_assessments}</div>
            <div className="text-gray-600">Total Assessments</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-3xl font-bold text-gray-600">
              {Math.floor((new Date().getTime() - new Date(profile.joined_date).getTime()) / (1000 * 60 * 60 * 24))} days
            </div>
            <div className="text-gray-600">Member Since</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('skills')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'skills'
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Verified Skills ({profile.verified_skills.length})
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'activity'
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Activity
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'skills' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.verified_skills.map((skill) => {
                  const scoreGrade = getScoreGrade(skill.score);
                  const daysUntilExpiry = Math.ceil(
                    (new Date(skill.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={skill.skill}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      {/* Skill Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {skill.skill.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold capitalize">{skill.skill}</h3>
                          <div className="text-sm text-gray-500">
                            {skill.assessments_count} assessment{skill.assessments_count !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      {/* Score Display */}
                      <div className={`${scoreGrade.bg} rounded-lg p-4 mb-3`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className={`text-3xl font-bold ${scoreGrade.color}`}>
                              {skill.score}
                            </div>
                            <div className="text-sm text-gray-600">Score</div>
                          </div>
                          <div className={`text-4xl font-bold ${scoreGrade.color}`}>
                            {scoreGrade.grade}
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Verified:</span>
                          <span className="font-medium">
                            {new Date(skill.verified_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expires:</span>
                          <span className="font-medium">
                            {daysUntilExpiry > 365
                              ? `${Math.floor(daysUntilExpiry / 365)} years`
                              : `${Math.floor(daysUntilExpiry / 30)} months`}
                          </span>
                        </div>
                      </div>

                      {/* Verified Badge */}
                      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-2 text-green-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-medium">Verified</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium">Verified Python Skill</div>
                    <div className="text-sm text-gray-500">Score: 98 - {new Date('2025-01-18').toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium">Verified React Skill</div>
                    <div className="text-sm text-gray-500">Score: 92 - {new Date('2025-01-20').toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium">Verified TypeScript Skill</div>
                    <div className="text-sm text-gray-500">Score: 88 - {new Date('2025-01-15').toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium">Verified Node.js Skill</div>
                    <div className="text-sm text-gray-500">Score: 85 - {new Date('2025-01-12').toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
