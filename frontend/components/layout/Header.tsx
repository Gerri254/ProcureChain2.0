'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="text-xl font-bold">SkillChain</span>
            </Link>

            <nav className="hidden md:flex space-x-1" ref={dropdownRef}>
              {/* Assessments Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('assessments')}
                  className="px-3 py-2 text-gray-600 hover:text-black transition-colors flex items-center gap-1"
                >
                  Assessments
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openDropdown === 'assessments' && (
                  <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <Link
                      href="/assessments"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setOpenDropdown(null)}
                    >
                      Browse Challenges
                    </Link>
                    {isAuthenticated && (
                      <>
                        <Link
                          href="/assessments/my-assessments"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setOpenDropdown(null)}
                        >
                          My Assessments
                        </Link>
                        <Link
                          href="/assessments/my-skills"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setOpenDropdown(null)}
                        >
                          My Skills
                        </Link>
                      </>
                    )}
                    <Link
                      href="/assessments/leaderboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setOpenDropdown(null)}
                    >
                      Leaderboard
                    </Link>
                  </div>
                )}
              </div>

              {/* Talent Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('talent')}
                  className="px-3 py-2 text-gray-600 hover:text-black transition-colors flex items-center gap-1"
                >
                  Talent
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openDropdown === 'talent' && (
                  <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <Link
                      href="/profiles"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setOpenDropdown(null)}
                    >
                      Browse Talent
                    </Link>
                    {isAuthenticated && user?.user_type === 'learner' && (
                      <>
                        <Link
                          href="/profile/me"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setOpenDropdown(null)}
                        >
                          My Profile
                        </Link>
                        <Link
                          href="/jobs"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setOpenDropdown(null)}
                        >
                          Find Jobs
                        </Link>
                      </>
                    )}
                    {isAuthenticated && user?.user_type === 'employer' && (
                      <Link
                        href="/talent/search"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setOpenDropdown(null)}
                      >
                        Search Candidates
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Jobs Dropdown (Employer only) */}
              {isAuthenticated && user?.user_type === 'employer' && (
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('jobs')}
                    className="px-3 py-2 text-gray-600 hover:text-black transition-colors flex items-center gap-1"
                  >
                    Jobs
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === 'jobs' && (
                    <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <Link
                        href="/jobs/my-postings"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setOpenDropdown(null)}
                      >
                        My Job Postings
                      </Link>
                      <Link
                        href="/jobs/create"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setOpenDropdown(null)}
                      >
                        Post New Job
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Analytics Dropdown (Admin/Employer) */}
              {isAuthenticated && (user?.role === 'admin' || user?.user_type === 'employer') && (
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('analytics')}
                    className="px-3 py-2 text-gray-600 hover:text-black transition-colors flex items-center gap-1"
                  >
                    Analytics
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === 'analytics' && (
                    <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <Link
                        href="/analytics"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setOpenDropdown(null)}
                      >
                        Platform Stats
                      </Link>
                      <Link
                        href="/analytics/skills"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setOpenDropdown(null)}
                      >
                        Skill Trends
                      </Link>
                      <Link
                        href="/analytics/hiring"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setOpenDropdown(null)}
                      >
                        Hiring Insights
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Admin Dropdown (Admin only) */}
              {isAuthenticated && user?.role === 'admin' && (
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('admin')}
                    className="px-3 py-2 text-gray-600 hover:text-black transition-colors flex items-center gap-1"
                  >
                    Admin
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === 'admin' && (
                    <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <Link
                        href="/admin/users"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setOpenDropdown(null)}
                      >
                        Manage Users
                      </Link>
                      <Link
                        href="/admin/challenges"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setOpenDropdown(null)}
                      >
                        Manage Challenges
                      </Link>
                      <Link
                        href="/admin/fraud-reports"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setOpenDropdown(null)}
                      >
                        Fraud Reports
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 hidden md:inline">
                  {user?.full_name}
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-black"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-1">
              {/* Assessments Section */}
              <div className="px-2 py-1">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Assessments
                </div>
                <Link
                  href="/assessments"
                  className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Challenges
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      href="/assessments/my-assessments"
                      className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Assessments
                    </Link>
                    <Link
                      href="/assessments/my-skills"
                      className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Skills
                    </Link>
                  </>
                )}
                <Link
                  href="/assessments/leaderboard"
                  className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Leaderboard
                </Link>
              </div>

              {/* Talent Section */}
              <div className="px-2 py-1 mt-2">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Talent
                </div>
                <Link
                  href="/profiles"
                  className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Talent
                </Link>
                {isAuthenticated && user?.user_type === 'learner' && (
                  <>
                    <Link
                      href="/profile/me"
                      className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/jobs"
                      className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Find Jobs
                    </Link>
                  </>
                )}
                {isAuthenticated && user?.user_type === 'employer' && (
                  <Link
                    href="/talent/search"
                    className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Search Candidates
                  </Link>
                )}
              </div>

              {/* Jobs Section (Employer only) */}
              {isAuthenticated && user?.user_type === 'employer' && (
                <div className="px-2 py-1 mt-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Jobs
                  </div>
                  <Link
                    href="/jobs/my-postings"
                    className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Job Postings
                  </Link>
                  <Link
                    href="/jobs/create"
                    className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Post New Job
                  </Link>
                </div>
              )}

              {/* Analytics Section (Admin/Employer) */}
              {isAuthenticated && (user?.role === 'admin' || user?.user_type === 'employer') && (
                <div className="px-2 py-1 mt-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Analytics
                  </div>
                  <Link
                    href="/analytics"
                    className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Platform Stats
                  </Link>
                  <Link
                    href="/analytics/skills"
                    className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Skill Trends
                  </Link>
                  <Link
                    href="/analytics/hiring"
                    className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Hiring Insights
                  </Link>
                </div>
              )}

              {/* Admin Section */}
              {isAuthenticated && user?.role === 'admin' && (
                <div className="px-2 py-1 mt-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Admin
                  </div>
                  <Link
                    href="/admin/users"
                    className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Manage Users
                  </Link>
                  <Link
                    href="/admin/challenges"
                    className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Manage Challenges
                  </Link>
                  <Link
                    href="/admin/fraud-reports"
                    className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Fraud Reports
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
