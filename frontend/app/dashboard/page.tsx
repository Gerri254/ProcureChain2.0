'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  UserCircle,
  TrendingUp,
  Award,
  Briefcase,
  Search,
  Bell,
  Settings,
  Grid3x3,
  List,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen,
  BarChart3,
  Moon,
  Sun,
} from 'lucide-react';

interface Assessment {
  _id: string;
  challenge_id: string;
  challenge_title?: string;
  skill_assessed?: string;
  score?: number;
  status: string;
  submitted_at?: string;
  created_at?: string;
}

interface Skill {
  _id: string;
  skill_name: string;
  proficiency_level: string;
  score: number;
  earned_at: string;
  expires_at?: string;
  status: string;
}

interface JobPosting {
  _id: string;
  title: string;
  company_name: string;
  location: string;
  employment_type: string;
  required_skills: string[];
  status: string;
  created_at: string;
}

type ViewMode = 'grid' | 'list';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [darkMode, setDarkMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'skills' | 'assessments' | 'jobs'>('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch assessments
        const assessmentsRes = await api.getMyAssessments();
        if (assessmentsRes.success && assessmentsRes.data) {
          setAssessments(assessmentsRes.data.slice(0, 10));
        }

        // Fetch skills
        const skillsRes = await api.getMySkills();
        if (skillsRes.success && skillsRes.data) {
          setSkills(skillsRes.data.verified_skills || []);
        }

        // Fetch job postings
        const jobsRes = await api.getJobPostings();
        if (jobsRes.success && jobsRes.data) {
          setJobs(jobsRes.data.slice(0, 10));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user type
  if (user.user_type === 'employer') {
    return <EmployerDashboard user={user} />;
  }

  if (user.user_type === 'educator') {
    return <EducatorDashboard user={user} />;
  }

  // Only show learner UI for learners
  if (user.user_type !== 'learner') {
    return <OtherUserDashboard user={user} />;
  }

  // Calculate stats
  const totalAssessments = assessments.length;
  const activeSkills = skills.filter((s) => s.status === 'active').length;
  const averageScore = skills.length > 0
    ? Math.round(skills.reduce((sum, s) => sum + s.score, 0) / skills.length)
    : 0;
  const matchingJobs = jobs.filter((job) =>
    job.required_skills.some((reqSkill) =>
      skills.some((s) => s.skill_name.toLowerCase().includes(reqSkill.toLowerCase()))
    )
  ).length;

  // Profile completion
  const requiredFields = ['full_name', 'email', 'bio', 'github_url', 'linkedin_url'];
  const filledFields = requiredFields.filter((field) => user?.[field as keyof typeof user]);
  const completionPercentage = Math.round((filledFields.length / requiredFields.length) * 100);

  // Skills expiring soon (30 days)
  const expiringSkills = skills.filter((skill) => {
    if (!skill.expires_at || skill.status !== 'active') return false;
    const daysUntilExpiry = Math.floor(
      (new Date(skill.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  });

  // Mixed content cards
  const mixedCards = [
    ...skills.slice(0, 4).map((skill) => ({ type: 'skill', data: skill })),
    ...assessments.slice(0, 3).map((assessment) => ({ type: 'assessment', data: assessment })),
    ...jobs.slice(0, 3).map((job) => ({ type: 'job', data: job })),
  ];

  // Filter cards
  const filteredCards = mixedCards.filter((card) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'skills') return card.type === 'skill';
    if (activeFilter === 'assessments') return card.type === 'assessment';
    if (activeFilter === 'jobs') return card.type === 'job';
    return true;
  });

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">SkillChain</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search skills, assessments, jobs..."
                  className={`pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-black w-80`}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} relative`}>
                <Bell className="w-5 h-5" />
                {expiringSkills.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                )}
              </button>
              <button
                onClick={() => router.push('/settings')}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/profile/me')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black text-white"
              >
                <UserCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{user.full_name}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar Navigation */}
          <aside className={`w-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 flex flex-col items-center gap-6 h-fit sticky top-24`}>
            <button
              onClick={() => router.push('/dashboard')}
              className="p-3 rounded-xl bg-black text-white"
            >
              <BarChart3 className="w-6 h-6" />
            </button>
            <button
              onClick={() => router.push('/assessments')}
              className={`p-3 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <BookOpen className="w-6 h-6" />
            </button>
            <button
              onClick={() => router.push('/assessments/my-skills')}
              className={`p-3 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <Award className="w-6 h-6" />
            </button>
            <button
              onClick={() => router.push('/talent/jobs')}
              className={`p-3 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <Briefcase className="w-6 h-6" />
            </button>
            <button
              onClick={() => router.push('/profile/me')}
              className={`p-3 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <UserCircle className="w-6 h-6" />
            </button>
          </aside>

          {/* Main Section */}
          <main className="flex-1">
            {/* Alerts */}
            {completionPercentage < 100 && (
              <Card className={`mb-6 ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                      Complete Your Profile
                    </h3>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Your profile is {completionPercentage}% complete. A complete profile increases your visibility to employers.
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all"
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                      <Button size="sm" onClick={() => router.push('/profile/me')}>
                        Complete Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {expiringSkills.length > 0 && (
              <Card className={`mb-6 ${darkMode ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      Skills Expiring Soon
                    </h3>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {expiringSkills.length} skill credential{expiringSkills.length > 1 ? 's' : ''} will expire in the next 30 days.
                      Renew them to maintain your verified status.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {expiringSkills.slice(0, 3).map((skill) => (
                        <span
                          key={skill._id}
                          className={`text-xs px-3 py-1 rounded-full ${
                            darkMode ? 'bg-orange-800 text-orange-100' : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {skill.skill_name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Stats Section */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Assessments</p>
                    <p className="text-2xl font-bold mt-1">{totalAssessments}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Skills</p>
                    <p className="text-2xl font-bold mt-1">{activeSkills}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Score</p>
                    <p className="text-2xl font-bold mt-1">{averageScore}%</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </Card>

              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Matching Jobs</p>
                    <p className="text-2xl font-bold mt-1">{matchingJobs}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
                    <Briefcase className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Filter and View Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === 'all'
                      ? 'bg-black text-white'
                      : darkMode
                      ? 'bg-gray-800 hover:bg-gray-700'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('skills')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === 'skills'
                      ? 'bg-black text-white'
                      : darkMode
                      ? 'bg-gray-800 hover:bg-gray-700'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Skills ({skills.length})
                </button>
                <button
                  onClick={() => setActiveFilter('assessments')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === 'assessments'
                      ? 'bg-black text-white'
                      : darkMode
                      ? 'bg-gray-800 hover:bg-gray-700'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Assessments ({totalAssessments})
                </button>
                <button
                  onClick={() => setActiveFilter('jobs')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === 'jobs'
                      ? 'bg-black text-white'
                      : darkMode
                      ? 'bg-gray-800 hover:bg-gray-700'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Jobs ({jobs.length})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'grid'
                      ? 'bg-black text-white'
                      : darkMode
                      ? 'bg-gray-800 hover:bg-gray-700'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'list'
                      ? 'bg-black text-white'
                      : darkMode
                      ? 'bg-gray-800 hover:bg-gray-700'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cards Grid/List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading your content...</p>
              </div>
            ) : filteredCards.length === 0 ? (
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <div className="text-center py-12">
                  <p className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    No {activeFilter === 'all' ? 'content' : activeFilter} yet
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    {activeFilter === 'skills' && 'Take an assessment to earn your first skill credential.'}
                    {activeFilter === 'assessments' && 'Start your first assessment to verify your skills.'}
                    {activeFilter === 'jobs' && 'No job postings available at the moment.'}
                    {activeFilter === 'all' && 'Get started by taking an assessment or browsing jobs.'}
                  </p>
                  {activeFilter !== 'jobs' && (
                    <Button onClick={() => router.push('/assessments')}>
                      Browse Assessments
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredCards.map((card, index) => {
                  if (card.type === 'skill') {
                    const skill = card.data as Skill;
                    const daysUntilExpiry = skill.expires_at
                      ? Math.floor(
                          (new Date(skill.expires_at).getTime() - new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : null;

                    return (
                      <Card
                        key={`skill-${skill._id}`}
                        className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white hover:shadow-lg'} transition-all cursor-pointer`}
                        onClick={() => router.push('/assessments/my-skills')}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                            <Award className="w-5 h-5 text-green-600" />
                          </div>
                          {skill.score >= 90 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                              Expert
                            </span>
                          )}
                          {skill.score >= 70 && skill.score < 90 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                              Advanced
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold mb-2">{skill.skill_name}</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                          Proficiency: {skill.proficiency_level}
                        </p>
                        <div className="flex items-center justify-between text-sm mb-3">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Score</span>
                          <span className="font-semibold">{skill.score}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                          <div
                            className="h-full bg-green-600 transition-all"
                            style={{ width: `${skill.score}%` }}
                          ></div>
                        </div>
                        {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                          <div className="flex items-center gap-2 text-xs text-orange-600">
                            <Clock className="w-3 h-3" />
                            <span>Expires in {daysUntilExpiry} days</span>
                          </div>
                        )}
                      </Card>
                    );
                  }

                  if (card.type === 'assessment') {
                    const assessment = card.data as Assessment;
                    return (
                      <Card
                        key={`assessment-${assessment._id}`}
                        className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white hover:shadow-lg'} transition-all cursor-pointer`}
                        onClick={() => router.push('/assessments')}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                            <BookOpen className="w-5 h-5 text-blue-600" />
                          </div>
                          {assessment.status === 'completed' && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                            } font-medium flex items-center gap-1`}>
                              <CheckCircle2 className="w-3 h-3" />
                              Completed
                            </span>
                          )}
                          {assessment.status === 'in_progress' && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                            } font-medium`}>
                              In Progress
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold mb-2">
                          {assessment.challenge_title || `Assessment #${assessment._id.slice(-6)}`}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                          {assessment.skill_assessed || 'Skill assessment'}
                        </p>
                        {assessment.score !== undefined && (
                          <div className="flex items-center justify-between text-sm mb-3">
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Score</span>
                            <span className="font-semibold">{assessment.score}%</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(assessment.submitted_at || assessment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </Card>
                    );
                  }

                  if (card.type === 'job') {
                    const job = card.data as JobPosting;
                    const matchingSkillsCount = job.required_skills.filter((reqSkill) =>
                      skills.some((s) => s.skill_name.toLowerCase().includes(reqSkill.toLowerCase()))
                    ).length;

                    return (
                      <Card
                        key={`job-${job._id}`}
                        className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white hover:shadow-lg'} transition-all cursor-pointer`}
                        onClick={() => router.push(`/talent/jobs/${job._id}`)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                            <Briefcase className="w-5 h-5 text-purple-600" />
                          </div>
                          {matchingSkillsCount > 0 && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                            } font-medium`}>
                              {matchingSkillsCount} Match{matchingSkillsCount > 1 ? 'es' : ''}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold mb-2">{job.title}</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                          {job.company_name}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-3`}>
                          {job.location} • {job.employment_type}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {job.required_skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className={`text-xs px-2 py-1 rounded ${
                                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                          {job.required_skills.length > 3 && (
                            <span
                              className={`text-xs px-2 py-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              +{job.required_skills.length - 3} more
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            Posted {new Date(job.created_at).toLocaleDateString()}
                          </span>
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </div>
                      </Card>
                    );
                  }

                  return null;
                })}
              </div>
            )}
          </main>

          {/* Right Sidebar - Quick Actions */}
          <aside className={`w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 h-fit sticky top-24`}>
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/assessments')}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Take Assessment
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/talent/jobs')}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Browse Jobs
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/profile/me')}
              >
                <UserCircle className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            <div className="mt-8">
              <h3 className="font-semibold mb-4">Recent Activity</h3>
              {assessments.length === 0 ? (
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No recent activity
                </p>
              ) : (
                <div className="space-y-3">
                  {assessments.slice(0, 5).map((assessment) => (
                    <div
                      key={assessment._id}
                      className={`text-sm p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <p className="font-medium mb-1">
                        {assessment.challenge_title || 'Assessment'}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {assessment.score !== undefined && `Score: ${assessment.score}% • `}
                        {new Date(assessment.submitted_at || assessment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// Employer Dashboard
function EmployerDashboard({ user }: { user: any }) {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'closed'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const jobsRes = await api.getJobPostings();
        if (jobsRes.success && jobsRes.data) {
          setJobs(jobsRes.data.slice(0, 20));
        }
      } catch (error) {
        console.error('Error fetching employer data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeJobs = jobs.filter((j) => j.status === 'active').length;
  const closedJobs = jobs.filter((j) => j.status === 'closed').length;
  const totalApplications = 0; // TODO: Get from API when available

  const filteredJobs = jobs.filter((job) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return job.status === 'active';
    if (activeFilter === 'closed') return job.status === 'closed';
    return true;
  });

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">SkillChain</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs, candidates..."
                  className={`pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-black w-80`}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Bell className="w-5 h-5" />
              </button>
              <button onClick={() => router.push('/settings')} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Settings className="w-5 h-5" />
              </button>
              <button onClick={() => router.push('/profile/me')} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black text-white">
                <UserCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{user.full_name}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar Navigation */}
          <aside className={`w-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 flex flex-col items-center gap-6 h-fit sticky top-24`}>
            <button onClick={() => router.push('/dashboard')} className="p-3 rounded-xl bg-black text-white">
              <BarChart3 className="w-6 h-6" />
            </button>
            <button onClick={() => router.push('/admin/job-postings')} className={`p-3 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <Briefcase className="w-6 h-6" />
            </button>
            <button onClick={() => router.push('/talent')} className={`p-3 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <UserCircle className="w-6 h-6" />
            </button>
            <button onClick={() => router.push('/profile/me')} className={`p-3 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <Settings className="w-6 h-6" />
            </button>
          </aside>

          {/* Main Section */}
          <main className="flex-1">
            {/* Stats Section */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Jobs</p>
                    <p className="text-2xl font-bold mt-1">{jobs.length}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                    <Briefcase className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </Card>

              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Jobs</p>
                    <p className="text-2xl font-bold mt-1">{activeJobs}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Applications</p>
                    <p className="text-2xl font-bold mt-1">{totalApplications}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                    <UserCircle className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Closed Jobs</p>
                    <p className="text-2xl font-bold mt-1">{closedJobs}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <Clock className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Filter and View Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === 'all' ? 'bg-black text-white' : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  All Jobs
                </button>
                <button
                  onClick={() => setActiveFilter('active')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === 'active' ? 'bg-black text-white' : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Active ({activeJobs})
                </button>
                <button
                  onClick={() => setActiveFilter('closed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === 'closed' ? 'bg-black text-white' : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Closed ({closedJobs})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={() => router.push('/admin/job-postings/create')}>
                  Post New Job
                </Button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-black text-white' : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-black text-white' : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Job Cards */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading jobs...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>No jobs posted yet</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Start hiring by posting your first job</p>
                  <Button onClick={() => router.push('/admin/job-postings/create')}>Post Your First Job</Button>
                </div>
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredJobs.map((job) => (
                  <Card
                    key={job._id}
                    className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white hover:shadow-lg'} transition-all cursor-pointer`}
                    onClick={() => router.push(`/admin/job-postings/${job._id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                        <Briefcase className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        job.status === 'active'
                          ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                          : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-800'
                      } font-medium`}>
                        {job.status}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-2">{job.title}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>{job.company_name}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-3`}>{job.location} • {job.employment_type}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {job.required_skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                          {skill}
                        </span>
                      ))}
                      {job.required_skills.length > 3 && (
                        <span className={`text-xs px-2 py-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          +{job.required_skills.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Posted {new Date(job.created_at).toLocaleDateString()}
                      </span>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className={`w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 h-fit sticky top-24`}>
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/job-postings/create')}>
                <Briefcase className="w-4 h-4 mr-2" />
                Post New Job
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/talent')}>
                <UserCircle className="w-4 h-4 mr-2" />
                Browse Talent
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/profile/me')}>
                <Settings className="w-4 h-4 mr-2" />
                Company Profile
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// Educator Dashboard
function EducatorDashboard({ user }: { user: any }) {
  const router = useRouter();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeFilter, setActiveFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const challengesRes = await api.getChallenges();
        if (challengesRes.success && challengesRes.data) {
          setChallenges(challengesRes.data.challenges || []);
        }
      } catch (error) {
        console.error('Error fetching educator data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const beginnerCount = challenges.filter((c) => c.difficulty === 'beginner').length;
  const intermediateCount = challenges.filter((c) => c.difficulty === 'intermediate').length;
  const advancedCount = challenges.filter((c) => c.difficulty === 'advanced').length;

  const filteredChallenges = challenges.filter((challenge) => {
    if (activeFilter === 'all') return true;
    return challenge.difficulty === activeFilter;
  });

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">SkillChain</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search challenges, learners..."
                  className={`pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-black w-80`}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Bell className="w-5 h-5" />
              </button>
              <button onClick={() => router.push('/settings')} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Settings className="w-5 h-5" />
              </button>
              <button onClick={() => router.push('/profile/me')} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black text-white">
                <UserCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{user.full_name}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar Navigation */}
          <aside className={`w-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 flex flex-col items-center gap-6 h-fit sticky top-24`}>
            <button onClick={() => router.push('/dashboard')} className="p-3 rounded-xl bg-black text-white">
              <BarChart3 className="w-6 h-6" />
            </button>
            <button onClick={() => router.push('/admin/challenges')} className={`p-3 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <BookOpen className="w-6 h-6" />
            </button>
            <button onClick={() => router.push('/assessments')} className={`p-3 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <Award className="w-6 h-6" />
            </button>
            <button onClick={() => router.push('/profile/me')} className={`p-3 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <UserCircle className="w-6 h-6" />
            </button>
          </aside>

          {/* Main Section */}
          <main className="flex-1">
            {/* Stats Section */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Challenges</p>
                    <p className="text-2xl font-bold mt-1">{challenges.length}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Beginner</p>
                    <p className="text-2xl font-bold mt-1">{beginnerCount}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Intermediate</p>
                    <p className="text-2xl font-bold mt-1">{intermediateCount}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </Card>

              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Advanced</p>
                    <p className="text-2xl font-bold mt-1">{advancedCount}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Filter and View Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === 'all' ? 'bg-black text-white' : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('beginner')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === 'beginner' ? 'bg-black text-white' : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Beginner ({beginnerCount})
                </button>
                <button
                  onClick={() => setActiveFilter('intermediate')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === 'intermediate' ? 'bg-black text-white' : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Intermediate ({intermediateCount})
                </button>
                <button
                  onClick={() => setActiveFilter('advanced')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === 'advanced' ? 'bg-black text-white' : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Advanced ({advancedCount})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={() => router.push('/admin/challenges/create')}>
                  Create Challenge
                </Button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-black text-white' : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-black text-white' : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Challenge Cards */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading challenges...</p>
              </div>
            ) : filteredChallenges.length === 0 ? (
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>No challenges yet</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Create your first challenge to help learners verify their skills</p>
                  <Button onClick={() => router.push('/admin/challenges/create')}>Create Challenge</Button>
                </div>
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredChallenges.map((challenge) => (
                  <Card
                    key={challenge._id}
                    className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white hover:shadow-lg'} transition-all cursor-pointer`}
                    onClick={() => router.push(`/admin/challenges/${challenge._id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${
                        challenge.difficulty === 'beginner'
                          ? darkMode ? 'bg-green-900/30' : 'bg-green-100'
                          : challenge.difficulty === 'intermediate'
                          ? darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'
                          : darkMode ? 'bg-red-900/30' : 'bg-red-100'
                      }`}>
                        <BookOpen className={`w-5 h-5 ${
                          challenge.difficulty === 'beginner'
                            ? 'text-green-600'
                            : challenge.difficulty === 'intermediate'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`} />
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        challenge.difficulty === 'beginner'
                          ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                          : challenge.difficulty === 'intermediate'
                          ? darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                          : darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                      } font-medium capitalize`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-2">{challenge.title}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3 line-clamp-2`}>
                      {challenge.description}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                        {challenge.skill_category || 'General'}
                      </span>
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {challenge.time_limit || 60} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Created {new Date(challenge.created_at || Date.now()).toLocaleDateString()}
                      </span>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className={`w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 h-fit sticky top-24`}>
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/challenges/create')}>
                <BookOpen className="w-4 h-4 mr-2" />
                Create Challenge
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/challenges')}>
                <Award className="w-4 h-4 mr-2" />
                Manage Challenges
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/assessments')}>
                <BarChart3 className="w-4 h-4 mr-2" />
                View Leaderboard
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// Fallback for public/unknown user types
function OtherUserDashboard({ user }: { user: any }) {
  const router = useRouter();
  const userType = user.user_type || 'public';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.full_name}</h1>
      <Card>
        <p className="text-gray-600 mb-4">Dashboard for {userType} users coming soon.</p>
        <Button onClick={() => router.push('/profile/me')}>View Profile</Button>
      </Card>
    </div>
  );
}
