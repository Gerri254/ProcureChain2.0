'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

type UserType = 'learner' | 'employer' | 'educator';

export default function RegisterPage() {
  const [userType, setUserType] = useState<UserType>('learner');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    company_name: '', // For employers
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const registerData: any = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        user_type: userType,
      };

      // Add employer-specific data
      if (userType === 'employer' && formData.company_name) {
        registerData.company_name = formData.company_name;
      }

      await register(registerData);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Join SkillChain</h1>
          <p className="text-gray-600">Verify your skills. Get hired.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am a...
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setUserType('learner')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  userType === 'learner'
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">👨‍💻</div>
                  <div className="text-xs font-medium">Developer</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setUserType('employer')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  userType === 'employer'
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🏢</div>
                  <div className="text-xs font-medium">Employer</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setUserType('educator')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  userType === 'educator'
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">👨‍🏫</div>
                  <div className="text-xs font-medium">Educator</div>
                </div>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <Input
            label={userType === 'employer' ? 'Contact Name' : 'Full Name'}
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
            placeholder={userType === 'employer' ? 'Jane Smith' : 'John Doe'}
          />

          {/* Company Name (Employers only) */}
          {userType === 'employer' && (
            <Input
              label="Company Name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              required
              placeholder="Acme Inc."
            />
          )}

          {/* Email */}
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="you@example.com"
          />

          {/* Password */}
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            placeholder="Min. 8 characters"
          />

          {/* Confirm Password */}
          <Input
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            placeholder="Repeat your password"
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        {/* Sign In Link */}
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Link href="/login" className="font-medium hover:underline text-black">
            Sign in
          </Link>
        </div>

        {/* User Type Descriptions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-xs text-gray-600 space-y-2">
            {userType === 'learner' && (
              <div className="bg-gray-50 p-3 rounded">
                <strong className="text-gray-900">Developer Account:</strong> Take skill assessments, earn verified badges, and get matched with jobs.
              </div>
            )}
            {userType === 'employer' && (
              <div className="bg-gray-50 p-3 rounded">
                <strong className="text-gray-900">Employer Account:</strong> Post jobs, browse verified talent, and find developers with proven skills.
              </div>
            )}
            {userType === 'educator' && (
              <div className="bg-gray-50 p-3 rounded">
                <strong className="text-gray-900">Educator Account:</strong> Create assessment challenges and help verify developer skills.
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
