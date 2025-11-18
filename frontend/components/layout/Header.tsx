'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

            <nav className="hidden md:flex space-x-6">
              <Link
                href="/procurements"
                className="text-gray-600 hover:text-black transition-colors"
              >
                Procurements
              </Link>
              <Link
                href="/vendors"
                className="text-gray-600 hover:text-black transition-colors"
              >
                Vendors
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-600 hover:text-black transition-colors"
                  >
                    Dashboard
                  </Link>

                  {/* Vendor-specific navigation */}
                  {user?.role === 'vendor' && (
                    <>
                      <Link
                        href="/bids/my-bids"
                        className="text-gray-600 hover:text-black transition-colors"
                      >
                        My Bids
                      </Link>
                      <Link
                        href="/vendor/profile"
                        className="text-gray-600 hover:text-black transition-colors"
                      >
                        Profile
                      </Link>
                    </>
                  )}

                  {/* Admin/Government/Auditor navigation */}
                  {(user?.role === 'admin' || user?.role === 'government_official' || user?.role === 'auditor') && (
                    <>
                      <Link
                        href="/analytics"
                        className="text-gray-600 hover:text-black transition-colors"
                      >
                        Analytics
                      </Link>
                      <Link
                        href="/compare"
                        className="text-gray-600 hover:text-black transition-colors"
                      >
                        Compare
                      </Link>
                      <Link
                        href="/anomalies"
                        className="text-gray-600 hover:text-black transition-colors"
                      >
                        Anomalies
                      </Link>
                    </>
                  )}

                  {/* Admin-only navigation */}
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin/vendors"
                      className="text-gray-600 hover:text-black transition-colors"
                    >
                      Manage Vendors
                    </Link>
                  )}
                </>
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
            <nav className="flex flex-col space-y-3">
              <Link
                href="/procurements"
                className="text-gray-600 hover:text-black transition-colors px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Procurements
              </Link>
              <Link
                href="/vendors"
                className="text-gray-600 hover:text-black transition-colors px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Vendors
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-600 hover:text-black transition-colors px-2 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>

                  {/* Vendor-specific mobile navigation */}
                  {user?.role === 'vendor' && (
                    <>
                      <Link
                        href="/bids/my-bids"
                        className="text-gray-600 hover:text-black transition-colors px-2 py-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Bids
                      </Link>
                      <Link
                        href="/vendor/profile"
                        className="text-gray-600 hover:text-black transition-colors px-2 py-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                    </>
                  )}

                  {/* Admin/Government/Auditor mobile navigation */}
                  {(user?.role === 'admin' || user?.role === 'government_official' || user?.role === 'auditor') && (
                    <>
                      <Link
                        href="/analytics"
                        className="text-gray-600 hover:text-black transition-colors px-2 py-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Analytics
                      </Link>
                      <Link
                        href="/compare"
                        className="text-gray-600 hover:text-black transition-colors px-2 py-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Compare
                      </Link>
                      <Link
                        href="/anomalies"
                        className="text-gray-600 hover:text-black transition-colors px-2 py-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Anomalies
                      </Link>
                    </>
                  )}

                  {/* Admin-only mobile navigation */}
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin/vendors"
                      className="text-gray-600 hover:text-black transition-colors px-2 py-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Manage Vendors
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
