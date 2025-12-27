'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';

interface Assessment {
  _id: string;
  skill: string;
  score: number;
  assessment_date: string;
  status: string;
}

interface Skill {
  skill: string;
  score: number;
  verified_date: string;
  expires_at: string;
  is_expired: boolean;
}

interface JobPosting {
  _id: string;
  title: string;
  company_name: string;
  location: string;
  skills_required: string[];
  posted_at: string;
}

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Learner state
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<JobPosting[]>([]);

  // Employer state
  const [jobStats, setJobStats] = useState<any>(null);
  const [myJobs, setMyJobs] = useState<JobPosting[]>([]);

  // Educator state
  const [challengeStats, setChallengeStats] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('[Dashboard] Loading data for user:', user);
      console.log('[Dashboard] User type:', user?.user_type);

      if (user?.user_type === 'learner') {
        console.log('[Dashboard] Loading learner data...');
        // Load learner dashboard data
        const [assessmentsRes, skillsRes, jobsRes] = await Promise.all([
          api.getMyAssessments(),
          api.getMySkills(),
          api.getJobPostings({ page: 1, per_page: 3 }),
        ]);

        console.log('[Dashboard] Assessments response:', assessmentsRes);
        console.log('[Dashboard] Skills response:', skillsRes);
        console.log('[Dashboard] Jobs response:', jobsRes);

        if (assessmentsRes.success && assessmentsRes.data) {
          setAssessments(assessmentsRes.data.assessments || []);
        }

        if (skillsRes.success && skillsRes.data) {
          setSkills(skillsRes.data.verified_skills || []);
        }

        if (jobsRes.success && jobsRes.data) {
          setRecommendedJobs(jobsRes.data.job_postings || []);
        }
      } else if (user?.user_type === 'employer') {
        console.log('[Dashboard] Loading employer data...');
        // Load employer dashboard data
        const [statsRes, jobsRes] = await Promise.all([
          api.getJobPostingStats(),
          api.getMyJobPostings({ page: 1, per_page: 5 }),
        ]);

        if (statsRes.success && statsRes.data) {
          setJobStats(statsRes.data.stats);
        }

        if (jobsRes.success && jobsRes.data) {
          setMyJobs(jobsRes.data.job_postings || []);
        }
      } else if (user?.user_type === 'educator') {
        // Load educator dashboard data
        const challengesRes = await api.getChallenges();

        if (challengesRes.success && challengesRes.data) {
          const challenges = challengesRes.data.challenges || [];
          setChallengeStats({
            total_challenges: challenges.length,
            by_difficulty: challenges.reduce((acc: any, c: any) => {
              acc[c.difficulty] = (acc[c.difficulty] || 0) + 1;
              return acc;
            }, {}),
          });
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.full_name}</p>
        </div>

        {/* Learner Dashboard */}
        {user?.user_type === 'learner' && (
          <>
            {/* Profile Completion Alert */}
            {(() => {
              const requiredFields = ['full_name', 'email', 'bio', 'github_url', 'linkedin_url'];
              const filledFields = requiredFields.filter(field => user?.[field as keyof typeof user]);
              const completionPercentage = Math.round((filledFields.length / requiredFields.length) * 100);

              if (completionPercentage < 100) {
                return (
                  <Card className="mb-6 bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-blue-900 mb-1">Complete Your Profile</h3>
                          <p className="text-sm text-blue-700 mb-3">
                            Your profile is {completionPercentage}% complete. Complete it to get better job matches.
                          </p>
                          <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                          </div>
                          <Link href="/profile/me">
                            <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                              Complete Profile
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              return null;
            })()}

            {/* Skills Expiring Soon Alert */}
            {(() => {
              const now = new Date();
              const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
              const expiringSoon = skills.filter(skill => {
                const expiryDate = new Date(skill.expires_at);
                return !skill.is_expired && expiryDate <= thirtyDaysFromNow;
              });

              if (expiringSoon.length > 0) {
                return (
                  <Card className="mb-6 bg-orange-50 border-orange-200">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-orange-900 mb-1">Skills Expiring Soon</h3>
                          <p className="text-sm text-orange-700 mb-3">
                            {expiringSoon.length} {expiringSoon.length === 1 ? 'skill expires' : 'skills expire'} in the next 30 days. Retake assessments to keep your credentials valid.
                          </p>
                          <div className="space-y-2 mb-3">
                            {expiringSoon.map(skill => {
                              const daysUntilExpiry = Math.ceil((new Date(skill.expires_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                              return (
                                <div key={skill.skill} className="flex justify-between items-center text-sm">
                                  <span className="font-medium capitalize text-orange-900">{skill.skill}</span>
                                  <span className="text-orange-700">{daysUntilExpiry} days left</span>
                                </div>
                              );
                            })}
                          </div>
                          <Link href="/assessments">
                            <Button size="sm" variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white">
                              Renew Skills
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              return null;
            })()}

            {/* Quick Actions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/assessments">
                    <Button className="w-full h-20 flex flex-col items-center justify-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="text-sm">Take Assessment</span>
                    </Button>
                  </Link>
                  <Link href="/assessments/my-skills">
                    <Button className="w-full h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <span className="text-sm">My Skills</span>
                    </Button>
                  </Link>
                  <Link href="/jobs">
                    <Button className="w-full h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">Find Jobs</span>
                    </Button>
                  </Link>
                  <Link href="/profile/me">
                    <Button className="w-full h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm">My Profile</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-gray-700">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1">{assessments.length}</div>
                  <div className="text-sm text-gray-600">Assessments Taken</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-green-600">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1 text-green-600">{skills.filter(s => !s.is_expired).length}</div>
                  <div className="text-sm text-gray-600">Active Skills</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-blue-600">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1 text-blue-600">
                    {skills.length > 0
                      ? Math.round(skills.reduce((sum, s) => sum + s.score, 0) / skills.length)
                      : 0}
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-purple-600">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1 text-purple-600">{recommendedJobs.length}</div>
                  <div className="text-sm text-gray-600">Available Jobs</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Recent Assessments */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Recent Assessments</CardTitle>
                    <Link href="/assessments/my-assessments">
                      <Button variant="ghost" size="sm">View All</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {assessments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📝</div>
                      <h3 className="text-lg font-semibold mb-2">No Assessments Yet</h3>
                      <p className="text-gray-600 mb-6 text-sm">
                        Start verifying your skills to stand out to employers
                      </p>
                      <Link href="/assessments">
                        <Button size="sm">Take Your First Assessment</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assessments.slice(0, 5).map((assessment) => (
                        <div key={assessment._id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                          <div className="flex-1">
                            <div className="font-medium capitalize mb-1">{assessment.skill}</div>
                            <div className="text-xs text-gray-600 flex items-center gap-2">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(assessment.assessment_date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="text-2xl font-bold text-blue-600">{assessment.score}</div>
                            <div className="text-xs text-gray-500">/ 100</div>
                          </div>
                        </div>
                      ))}
                      {assessments.length > 5 && (
                        <Link href="/assessments/my-assessments">
                          <div className="text-center py-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                            View {assessments.length - 5} more assessments →
                          </div>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Skills */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Your Top Skills</CardTitle>
                    <Link href="/assessments/my-skills">
                      <Button variant="ghost" size="sm">View All</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {skills.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🏆</div>
                      <h3 className="text-lg font-semibold mb-2">No Verified Skills</h3>
                      <p className="text-gray-600 mb-6 text-sm">
                        Complete assessments to earn verified skill badges
                      </p>
                      <Link href="/assessments">
                        <Button size="sm">Start Verifying Skills</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {skills
                        .filter(s => !s.is_expired)
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 5)
                        .map((skill) => {
                          const daysUntilExpiry = Math.ceil((new Date(skill.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          const isExpiringSoon = daysUntilExpiry <= 30;

                          return (
                            <div key={skill.skill} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium capitalize">{skill.skill}</span>
                                  {skill.score >= 90 && (
                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded font-medium">Expert</span>
                                  )}
                                  {skill.score >= 70 && skill.score < 90 && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded font-medium">Advanced</span>
                                  )}
                                </div>
                                <div className={`text-xs ${isExpiringSoon ? 'text-orange-600' : 'text-gray-600'} flex items-center gap-1`}>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {isExpiringSoon ? `Expires in ${daysUntilExpiry} days` : `Valid for ${daysUntilExpiry} days`}
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <div className="text-2xl font-bold text-green-600">{skill.score}</div>
                                <div className="text-xs text-gray-500">score</div>
                              </div>
                            </div>
                          );
                        })}
                      {skills.filter(s => !s.is_expired).length > 5 && (
                        <Link href="/assessments/my-skills">
                          <div className="text-center py-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                            View {skills.filter(s => !s.is_expired).length - 5} more skills →
                          </div>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Jobs Section */}
            <Card className="mt-8">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Jobs Matching Your Skills</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {skills.length > 0
                        ? `Based on your verified ${skills.filter(s => !s.is_expired).length} skill${skills.filter(s => !s.is_expired).length !== 1 ? 's' : ''}`
                        : 'Complete assessments to see personalized job matches'
                      }
                    </p>
                  </div>
                  <Link href="/jobs">
                    <Button variant="ghost" size="sm">Browse All Jobs</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recommendedJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💼</div>
                    <h3 className="text-lg font-semibold mb-2">No Jobs Available</h3>
                    <p className="text-gray-600 mb-6 text-sm">
                      {skills.length === 0
                        ? 'Verify your skills to get matched with relevant job opportunities'
                        : 'Check back soon for new opportunities matching your skills'
                      }
                    </p>
                    {skills.length === 0 && (
                      <Link href="/assessments">
                        <Button size="sm">Verify Your Skills</Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendedJobs.map((job) => (
                      <Link
                        key={job._id}
                        href={`/jobs/${job._id}`}
                        className="block p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      >
                        <h4 className="font-semibold mb-2 line-clamp-2">{job.title}</h4>
                        <div className="text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1 mb-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                            </svg>
                            {job.company_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {job.location}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {job.skills_required.slice(0, 2).map((skill) => (
                            <span key={skill} className="px-2 py-1 bg-black text-white rounded text-xs uppercase font-medium">
                              {skill}
                            </span>
                          ))}
                          {job.skills_required.length > 2 && (
                            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                              +{job.skills_required.length - 2}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Employer Dashboard */}
        {user?.user_type === 'employer' && (
          <>
            {/* Quick Actions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/jobs/create">
                    <Button className="w-full h-20 flex flex-col items-center justify-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-sm">Post New Job</span>
                    </Button>
                  </Link>
                  <Link href="/jobs/my-postings">
                    <Button className="w-full h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">My Postings</span>
                    </Button>
                  </Link>
                  <Link href="/talent">
                    <Button className="w-full h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm">Browse Talent</span>
                    </Button>
                  </Link>
                  <Link href="/profile/me">
                    <Button className="w-full h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-sm">Company Profile</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            {jobStats && (
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold mb-1">{jobStats.total_jobs || 0}</div>
                    <div className="text-sm text-gray-600">Total Jobs</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold mb-1 text-green-600">{jobStats.active_jobs || 0}</div>
                    <div className="text-sm text-gray-600">Active Jobs</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold mb-1 text-blue-600">{jobStats.total_views || 0}</div>
                    <div className="text-sm text-gray-600">Total Views</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold mb-1 text-purple-600">{jobStats.total_applications || 0}</div>
                    <div className="text-sm text-gray-600">Applications</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Job Postings */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Job Postings</CardTitle>
                  <Link href="/jobs/my-postings">
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {myJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No job postings yet</p>
                    <Link href="/jobs/create">
                      <Button size="sm">Post Your First Job</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myJobs.map((job) => (
                      <Link
                        key={job._id}
                        href={`/jobs/${job._id}`}
                        className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                      >
                        <div className="font-medium mb-1">{job.title}</div>
                        <div className="text-sm text-gray-600 mb-2">
                          {job.location} • Posted {new Date(job.posted_at).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          {job.skills_required.slice(0, 3).map((skill) => (
                            <span key={skill} className="px-2 py-1 bg-black text-white rounded text-xs">
                              {skill.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Educator Dashboard */}
        {user?.user_type === 'educator' && (
          <>
            {/* Quick Actions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/admin/challenges">
                    <Button className="w-full h-20 flex flex-col items-center justify-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-sm">Create Challenge</span>
                    </Button>
                  </Link>
                  <Link href="/admin/challenges">
                    <Button className="w-full h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="text-sm">Manage Challenges</span>
                    </Button>
                  </Link>
                  <Link href="/assessments/leaderboard">
                    <Button className="w-full h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="text-sm">Leaderboard</span>
                    </Button>
                  </Link>
                  <Link href="/profile/me">
                    <Button className="w-full h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm">My Profile</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            {challengeStats && (
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold mb-1">{challengeStats.total_challenges || 0}</div>
                    <div className="text-sm text-gray-600">Total Challenges</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold mb-1 text-green-600">
                      {challengeStats.by_difficulty?.beginner || 0}
                    </div>
                    <div className="text-sm text-gray-600">Beginner</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold mb-1 text-yellow-600">
                      {challengeStats.by_difficulty?.intermediate || 0}
                    </div>
                    <div className="text-sm text-gray-600">Intermediate</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold mb-1 text-red-600">
                      {challengeStats.by_difficulty?.advanced || 0}
                    </div>
                    <div className="text-sm text-gray-600">Advanced</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Challenge Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  As an educator, you can create and manage skill assessment challenges for learners.
                  Your challenges help verify skills across various technologies and difficulty levels.
                </p>
                <Link href="/admin/challenges">
                  <Button>Manage Challenges</Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
