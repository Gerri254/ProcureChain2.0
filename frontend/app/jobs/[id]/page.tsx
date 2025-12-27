'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { api } from '@/lib/api';

interface JobPosting {
  _id: string;
  employer_id: string;
  title: string;
  description: string;
  company_name: string;
  location: string;
  location_type: string;
  employment_type: string;
  experience_level: string;
  skills_required: string[];
  minimum_score: number;
  responsibilities: string[];
  qualifications: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  salary_period: string;
  benefits: string[];
  how_to_apply: string;
  application_url?: string;
  status: string;
  posted_at: string;
  expires_at: string;
  views_count: number;
  applications_count: number;
  is_expired: boolean;
  days_until_expiry: number;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const response = await api.getJobPosting(jobId);

      if (response.success && response.data) {
        setJob(response.data.job_posting);
      }
    } catch (error) {
      console.error('Error loading job:', error);
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = () => {
    if (!job) return null;
    if (!job.salary_min && !job.salary_max) return null;

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: job.salary_currency,
      maximumFractionDigits: 0,
    });

    if (job.salary_min && job.salary_max) {
      return `${formatter.format(job.salary_min)} - ${formatter.format(job.salary_max)}`;
    } else if (job.salary_min) {
      return `From ${formatter.format(job.salary_min)}`;
    } else if (job.salary_max) {
      return `Up to ${formatter.format(job.salary_max)}`;
    }
  };

  const isOwner = isAuthenticated && user?._id === job?.employer_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">This job posting does not exist or has been removed.</p>
          <Link href="/jobs">
            <Button>Browse All Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
              {job.company_name && (
                <p className="text-xl text-gray-700 mb-3">{job.company_name}</p>
              )}
            </div>
            {isOwner && (
              <Link href="/jobs/my-postings">
                <Button variant="outline">Manage Posting</Button>
              </Link>
            )}
          </div>

          {/* Job Meta */}
          <div className="flex flex-wrap items-center gap-3 text-gray-600 mb-6">
            {job.location && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {job.location}
              </span>
            )}
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm capitalize">
              {job.location_type}
            </span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm capitalize">
              {job.employment_type}
            </span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm capitalize">
              {job.experience_level}
            </span>
          </div>

          {/* Salary */}
          {formatSalary() && (
            <div className="mb-6">
              <div className="text-2xl font-bold text-green-600">{formatSalary()}</div>
              <div className="text-sm text-gray-600 capitalize">Per {job.salary_period}</div>
            </div>
          )}

          {/* Skills Required */}
          {job.skills_required && job.skills_required.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Required Verified Skills:</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills_required.map((skill) => (
                  <span key={skill} className="px-4 py-2 bg-black text-white rounded-lg font-medium">
                    {skill.toUpperCase()}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Minimum skill score: <span className="font-semibold">{job.minimum_score}</span>/100
              </p>
            </div>
          )}

          {/* Apply Button */}
          {!isOwner && (
            <div className="flex gap-3">
              {job.application_url ? (
                <a href={job.application_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button size="lg" className="w-full">Apply Now</Button>
                </a>
              ) : (
                <Button size="lg" className="flex-1">Apply on SkillChain</Button>
              )}
              <Button variant="outline" size="lg">Save Job</Button>
            </div>
          )}

          {/* Posted/Expiry Info */}
          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between text-sm text-gray-600">
            <span>Posted {new Date(job.posted_at).toLocaleDateString()}</span>
            {job.is_expired ? (
              <span className="text-red-600 font-medium">Expired</span>
            ) : (
              <span>{job.days_until_expiry} days remaining</span>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Job Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
        </div>

        {/* Responsibilities */}
        {job.responsibilities && job.responsibilities.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
            <h2 className="text-2xl font-bold mb-4">Responsibilities</h2>
            <ul className="space-y-2">
              {job.responsibilities.map((resp, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-black font-bold mt-1">•</span>
                  <span className="text-gray-700">{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Qualifications */}
        {job.qualifications && job.qualifications.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
            <h2 className="text-2xl font-bold mb-4">Qualifications</h2>
            <ul className="space-y-2">
              {job.qualifications.map((qual, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-black font-bold mt-1">•</span>
                  <span className="text-gray-700">{qual}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Benefits */}
        {job.benefits && job.benefits.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
            <h2 className="text-2xl font-bold mb-4">Benefits & Perks</h2>
            <ul className="space-y-2">
              {job.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* How to Apply */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold mb-4">How to Apply</h2>
          <p className="text-gray-700 mb-6">{job.how_to_apply}</p>

          {!isOwner && (
            <div className="flex gap-3">
              {job.application_url ? (
                <a href={job.application_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button size="lg" className="w-full">Apply Now</Button>
                </a>
              ) : (
                <Button size="lg" className="flex-1">Apply on SkillChain</Button>
              )}
            </div>
          )}
        </div>

        {/* Stats (if owner) */}
        {isOwner && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Your Posting Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">{job.views_count}</div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{job.applications_count}</div>
                <div className="text-sm text-gray-600">Applications</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
