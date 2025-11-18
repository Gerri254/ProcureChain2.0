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
                <span className="text-white font-bold">P</span>
              </div>
              <span className="text-xl font-bold">ProcureChain</span>
            </Link>

            <nav className="hidden md:flex space-x-1" ref={dropdownRef}>
              {/* Procurement Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('procurement')}
                  className="px-3 py-2 text-gray-600 hover:text-black transition-colors flex items-center gap-1"
                >
                  Procurement
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openDropdown === 'procurement' && (
                  <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <Link
                      href="/procurements"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setOpenDropdown(null)}
                    >
                      Browse Procurements
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setOpenDropdown(null)}
                    >
                      Dashboard
                    </Link>
                    {isAuthenticated && (user?.role === 'admin' || user?.role === 'government_official') && (
                      <Link
                        href="/compare"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setOpenDropdown(null)}
                      >
                        Compare Bids
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Vendors Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('vendors')}
                  className="px-3 py-2 text-gray-600 hover:text-black transition-colors flex items-center gap-1"
                >
                  Vendors
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openDropdown === 'vendors' && (
                  <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <Link
                      href="/vendors"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setOpenDropdown(null)}
                    >
                      Browse Vendors
                    </Link>
                    {isAuthenticated && user?.role === 'vendor' && (
                      <>
                        <Link
                          href="/vendor/profile"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setOpenDropdown(null)}
                        >
                          My Profile
                        </Link>
                        <Link
                          href="/vendor/register"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setOpenDropdown(null)}
                        >
                          Register Vendor
                        </Link>
                      </>
                    )}
                    {isAuthenticated && user?.role === 'admin' && (
                      <Link
                        href="/admin/vendors"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setOpenDropdown(null)}
                      >
                        Manage Vendors
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Bids Dropdown (Vendor only) */}
              {isAuthenticated && user?.role === 'vendor' && (
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('bids')}
                    className="px-3 py-2 text-gray-600 hover:text-black transition-colors flex items-center gap-1"
                  >
                    Bids
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === 'bids' && (
                    <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <Link
                        href="/bids/my-bids"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setOpenDropdown(null)}
                      >
                        My Bids
                      </Link>
                      <Link
                        href="/procurements"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setOpenDropdown(null)}
                      >
                        Submit New Bid
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Analytics Dropdown (Admin/Official/Auditor) */}
              {isAuthenticated && (user?.role === 'admin' || user?.role === 'government_official' || user?.role === 'auditor') && (
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
                        Overview
                      </Link>
                      <Link
                        href="/anomalies"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setOpenDropdown(null)}
                      >
                        Anomalies
                      </Link>
                      <Link
                        href="/compare"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setOpenDropdown(null)}
                      >
                        Compare Bids
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Reports Dropdown (Admin/Official/Auditor for viewing) */}
              {isAuthenticated && (user?.role === 'admin' || user?.role === 'government_official' || user?.role === 'auditor') && (
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('reports')}
                    className="px-3 py-2 text-gray-600 hover:text-black transition-colors flex items-center gap-1"
                  >
                    Reports
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === 'reports' && (
                    <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <Link
                        href="/reports"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setOpenDropdown(null)}
                      >
                        View All Reports
                      </Link>
                      <Link
                        href="/reports/whistleblowing"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setOpenDropdown(null)}
                      >
                        Whistleblowing Cases
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
              {/* Procurement Section */}
              <div className="px-2 py-1">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Procurement
                </div>
                <Link
                  href="/procurements"
                  className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Procurements
                </Link>
                <Link
                  href="/dashboard"
                  className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {isAuthenticated && (user?.role === 'admin' || user?.role === 'government_official') && (
                  <Link
                    href="/compare"
                    className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Compare Bids
                  </Link>
                )}
              </div>

              {/* Vendors Section */}
              <div className="px-2 py-1 mt-2">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Vendors
                </div>
                <Link
                  href="/vendors"
                  className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Vendors
                </Link>
                {isAuthenticated && user?.role === 'vendor' && (
                  <>
                    <Link
                      href="/vendor/profile"
                      className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/vendor/register"
                      className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Register Vendor
                    </Link>
                  </>
                )}
                {isAuthenticated && user?.role === 'admin' && (
                  <Link
                    href="/admin/vendors"
                    className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Manage Vendors
                  </Link>
                )}
              </div>

              {/* Bids Section (Vendor only) */}
              {isAuthenticated && user?.role === 'vendor' && (
                <div className="px-2 py-1 mt-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Bids
                  </div>
                  <Link
                    href="/bids/my-bids"
                    className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Bids
                  </Link>
                  <Link
                    href="/procurements"
                    className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Submit New Bid
                  </Link>
                </div>
              )}

              {/* Analytics Section (Admin/Official/Auditor) */}
              {isAuthenticated && (user?.role === 'admin' || user?.role === 'government_official' || user?.role === 'auditor') && (
                <div className="px-2 py-1 mt-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Analytics
                  </div>
                  <Link
                    href="/analytics"
                    className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Overview
                  </Link>
                  <Link
                    href="/anomalies"
                    className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Anomalies
                  </Link>
                  <Link
                    href="/compare"
                    className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Compare Bids
                  </Link>
                </div>
              )}

              {/* Reports Section (Admin/Official/Auditor) */}
              {isAuthenticated && (user?.role === 'admin' || user?.role === 'government_official' || user?.role === 'auditor') && (
                <div className="px-2 py-1 mt-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Reports & Whistleblowing
                  </div>
                  <Link
                    href="/reports"
                    className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    View All Reports
                  </Link>
                  <Link
                    href="/reports/whistleblowing"
                    className="block text-gray-600 hover:text-black transition-colors py-2 pl-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Whistleblowing Cases
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
