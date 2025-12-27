'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { api } from '@/lib/api';

interface VerifiedSkill {
  skill: string;
  score: number;
  verified_date: string;
  expires_at: string;
  is_expired: boolean;
  assessments_count: number;
}

export default function MySkillsPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [skills, setSkills] = useState<VerifiedSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/assessments/my-skills');
      return;
    }

    loadSkills();
  }, [isAuthenticated, router]);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const response = await api.getMySkills();

      if (response.success && response.data) {
        setSkills(response.data || []);
      }
    } catch (error) {
      console.error('Error loading skills:', error);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 70) return { grade: 'B', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { grade: 'C', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (daysUntilExpiry: number) => {
    if (daysUntilExpiry < 0) {
      return { text: 'Expired', color: 'text-red-600' };
    } else if (daysUntilExpiry < 90) {
      return { text: `Expires in ${daysUntilExpiry} days`, color: 'text-orange-600' };
    } else if (daysUntilExpiry < 365) {
      return { text: `${Math.floor(daysUntilExpiry / 30)} months left`, color: 'text-yellow-600' };
    } else {
      return { text: `${Math.floor(daysUntilExpiry / 365)} years left`, color: 'text-green-600' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading your verified skills...</p>
      </div>
    );
  }

  const averageScore = skills.length > 0
    ? Math.round(skills.reduce((sum, skill) => sum + skill.score, 0) / skills.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Verified Skills</h1>
          <p className="text-gray-600">
            Your cryptographically-secured skill credentials
          </p>
        </div>

        {skills.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold mb-2">No Verified Skills Yet</h2>
            <p className="text-gray-600 mb-6">
              Take skill assessments to earn verified credentials that employers trust
            </p>
            <Link href="/assessments">
              <Button size="lg">Browse Challenges</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl font-bold text-black">{skills.length}</div>
                <div className="text-gray-600">Verified Skills</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl font-bold text-green-600">{averageScore}</div>
                <div className="text-gray-600">Average Score</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-3xl font-bold text-blue-600">
                  {skills.reduce((sum, skill) => sum + skill.assessments_count, 0)}
                </div>
                <div className="text-gray-600">Total Assessments</div>
              </div>
            </div>

            {/* Skills Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map((skill) => {
                const scoreGrade = getScoreGrade(skill.score);
                const daysUntilExpiry = getDaysUntilExpiry(skill.expires_at);
                const expiryStatus = getExpiryStatus(daysUntilExpiry);

                return (
                  <div
                    key={skill.skill}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                  >
                    {/* Skill Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {skill.skill.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold capitalize">{skill.skill}</h3>
                          <div className={`text-sm ${expiryStatus.color}`}>
                            {expiryStatus.text}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className={`${scoreGrade.bg} rounded-lg p-4 mb-4`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`text-3xl font-bold ${scoreGrade.color}`}>
                            {skill.score}
                          </div>
                          <div className="text-sm text-gray-600">Skill Score</div>
                        </div>
                        <div className={`text-4xl font-bold ${scoreGrade.color}`}>
                          {scoreGrade.grade}
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>Verified:</span>
                        <span className="font-medium">
                          {new Date(skill.verified_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Assessments:</span>
                        <span className="font-medium">{skill.assessments_count}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {daysUntilExpiry < 180 && (
                        <Link href="/assessments" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Renew
                          </Button>
                        </Link>
                      )}
                      <Button variant="outline" size="sm" className="flex-1">
                        Share
                      </Button>
                    </div>

                    {/* Verified Badge */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-2 text-green-600">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-medium">Verified Credential</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add More Skills CTA */}
            <div className="mt-8 bg-gradient-to-r from-black to-gray-800 rounded-lg p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Keep Growing Your Skills</h2>
              <p className="text-gray-300 mb-4">
                Take more assessments to build a comprehensive skill portfolio
              </p>
              <Link href="/assessments">
                <Button variant="outline" size="lg" className="bg-white text-black hover:bg-gray-100">
                  Browse More Challenges
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
