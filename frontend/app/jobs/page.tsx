'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { api } from '@/lib/api';

const SKILLS = ['react', 'python', 'javascript', 'typescript', 'sql', 'node.js'];

interface JobPosting {
  _id: string;
  title: string;
  company_name: string;
  description: string;
  location: string;
  location_type: string;
  employment_type: string;
  experience_level: string;
  skills_required: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  salary_period: string;
  posted_at: string;
  days_until_expiry: number;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    skills: [] as string[],
    location: '',
    employment_type: '',
    experience_level: '',
    location_type: '',
    search: '',
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await api.getJobPostings({
        skills: filters.skills.length > 0 ? filters.skills : undefined,
        location: filters.location || undefined,
        employment_type: filters.employment_type || undefined,
        experience_level: filters.experience_level || undefined,
        location_type: filters.location_type || undefined,
        search: filters.search || undefined,
      });

      if (response.success && response.data) {
        setJobs(response.data.job_postings || []);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    loadJobs();
  };

  const clearFilters = () => {
    setFilters({
      skills: [],
      location: '',
      employment_type: '',
      experience_level: '',
      location_type: '',
      search: '',
    });
    setTimeout(() => loadJobs(), 100);
  };

  const formatSalary = (job: JobPosting) => {
    if (!job.salary_min && !job.salary_max) return null;

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: job.salary_currency,
      maximumFractionDigits: 0,
    });

    if (job.salary_min && job.salary_max) {
      return `${formatter.format(job.salary_min)} - ${formatter.format(job.salary_max)} / ${job.salary_period}`;
    } else if (job.salary_min) {
      return `From ${formatter.format(job.salary_min)} / ${job.salary_period}`;
    } else if (job.salary_max) {
      return `Up to ${formatter.format(job.salary_max)} / ${job.salary_period}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find Your Next Opportunity</h1>
          <p className="text-gray-600">
            Browse jobs from companies looking for verified SkillChain developers
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
              <h2 className="text-lg font-bold mb-4">Filters</h2>

              {/* Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Job title or keyword..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                />
              </div>

              {/* Skills */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
                <div className="space-y-2">
                  {SKILLS.map(skill => (
                    <label key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.skills.includes(skill)}
                        onChange={() => handleSkillToggle(skill)}
                        className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                      />
                      <span className="ml-2 text-sm capitalize">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="City or state..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                />
              </div>

              {/* Location Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location Type</label>
                <select
                  value={filters.location_type}
                  onChange={(e) => handleFilterChange('location_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                >
                  <option value="">All</option>
                  <option value="onsite">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {/* Employment Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
                <select
                  value={filters.employment_type}
                  onChange={(e) => handleFilterChange('employment_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                >
                  <option value="">All</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              {/* Experience Level */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                <select
                  value={filters.experience_level}
                  onChange={(e) => handleFilterChange('experience_level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                >
                  <option value="">All</option>
                  <option value="junior">Junior</option>
                  <option value="mid-level">Mid-level</option>
                  <option value="senior">Senior</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button onClick={applyFilters} className="w-full" size="sm">
                  Apply Filters
                </Button>
                <Button onClick={clearFilters} variant="outline" className="w-full" size="sm">
                  Clear All
                </Button>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold mb-2">No Jobs Found</h2>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters to see more opportunities
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Found {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
                </div>
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <Link key={job._id} href={`/jobs/${job._id}`}>
                      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-1 hover:text-blue-600 transition-colors">
                              {job.title}
                            </h3>
                            {job.company_name && (
                              <p className="text-gray-700 font-medium mb-2">{job.company_name}</p>
                            )}
                          </div>
                          {formatSalary(job) && (
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">{formatSalary(job)}</p>
                            </div>
                          )}
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                        {/* Skills */}
                        {job.skills_required && job.skills_required.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.skills_required.map((skill) => (
                              <span key={skill} className="px-3 py-1 bg-black text-white rounded-full text-sm">
                                {skill.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Job Details */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              {job.location}
                            </span>
                          )}
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs capitalize">
                            {job.location_type}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs capitalize">
                            {job.employment_type}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs capitalize">
                            {job.experience_level}
                          </span>
                          <span className="text-gray-500">
                            Posted {new Date(job.posted_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
