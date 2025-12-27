'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Code, Briefcase, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

type UserType = 'learner' | 'employer' | 'educator';

// SkillChain Logo
const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    fill="currentColor"
    height="48"
    viewBox="0 0 40 48"
    width="40"
    {...props}
  >
    <clipPath id="a">
      <path d="m0 0h40v48h-40z" />
    </clipPath>
    <g clipPath="url(#a)">
      <path d="m25.0887 5.05386-3.933-1.05386-3.3145 12.3696-2.9923-11.16736-3.9331 1.05386 3.233 12.0655-8.05262-8.0526-2.87919 2.8792 8.83271 8.8328-10.99975-2.9474-1.05385625 3.933 12.01860625 3.2204c-.1376-.5935-.2104-1.2119-.2104-1.8473 0-4.4976 3.646-8.1436 8.1437-8.1436 4.4976 0 8.1436 3.646 8.1436 8.1436 0 .6313-.0719 1.2459-.2078 1.8359l10.9227 2.9267 1.0538-3.933-12.0664-3.2332 11.0005-2.9476-1.0539-3.933-12.0659 3.233 8.0526-8.0526-2.8792-2.87916-8.7102 8.71026z" />
      <path d="m27.8723 26.2214c-.3372 1.4256-1.0491 2.7063-2.0259 3.7324l7.913 7.9131 2.8792-2.8792z" />
      <path d="m25.7665 30.0366c-.9886 1.0097-2.2379 1.7632-3.6389 2.1515l2.8794 10.746 3.933-1.0539z" />
      <path d="m21.9807 32.2274c-.65.1671-1.3313.2559-2.0334.2559-.7522 0-1.4806-.102-2.1721-.2929l-2.882 10.7558 3.933 1.0538z" />
      <path d="m17.6361 32.1507c-1.3796-.4076-2.6067-1.1707-3.5751-2.1833l-7.9325 7.9325 2.87919 2.8792z" />
      <path d="m13.9956 29.8973c-.9518-1.019-1.6451-2.2826-1.9751-3.6862l-10.95836 2.9363 1.05385 3.933z" />
    </g>
  </svg>
);

export default function RegisterPage() {
  const [userType, setUserType] = useState<UserType>('learner');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    company_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!acceptedTerms) {
      setError('You must accept the terms and conditions');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white border-none shadow-lg rounded-xl pb-0">
          {/* Header */}
          <div className="flex flex-col items-center space-y-1.5 pb-4 pt-6 px-6">
            <Logo className="w-12 h-12" />
            <div className="space-y-0.5 flex flex-col items-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                Create an account
              </h2>
              <p className="text-gray-600">
                Welcome! Create an account to get started.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6">
            {/* User Type Select */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={userType}
                onValueChange={(value: UserType) => setUserType(value)}
              >
                <SelectTrigger
                  id="role"
                  className="[&>span]:flex [&>span]:items-center [&>span]:gap-2"
                >
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8">
                  <SelectItem value="learner">
                    <div className="flex items-center gap-2">
                      <Code size={16} />
                      <span>Developer/Learner</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="employer">
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} />
                      <span>Employer</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="educator">
                    <div className="flex items-center gap-2">
                      <GraduationCap size={16} />
                      <span>Educator</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">
                {userType === 'employer' ? 'Contact Name' : 'Full Name'}
              </Label>
              <Input
                id="fullName"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
                placeholder={userType === 'employer' ? 'Jane Smith' : 'John Doe'}
              />
            </div>

            {/* Company Name (Employers only) */}
            {userType === 'employer' && (
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  required
                  placeholder="Acme Inc."
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  placeholder="Min. 8 characters"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                  placeholder="Repeat your password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) =>
                  setAcceptedTerms(checked as boolean)
                }
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-600 cursor-pointer"
              >
                I agree to the{' '}
                <Link href="/terms" className="text-black hover:underline font-medium">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-black hover:underline font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-800"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create free account'}
            </Button>
          </form>

          {/* Footer */}
          <div className="flex justify-center border-t py-4 px-6">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-black hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* User Type Description */}
        <div className="mt-6">
          <div className="text-xs text-gray-600">
            {userType === 'learner' && (
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <strong className="text-gray-900">Developer Account:</strong> Take
                skill assessments, earn verified badges, and get matched with jobs
                based on your proven skills.
              </div>
            )}
            {userType === 'employer' && (
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <strong className="text-gray-900">Employer Account:</strong> Post
                jobs, browse verified talent, and find developers with proven skills
                through AI-verified assessments.
              </div>
            )}
            {userType === 'educator' && (
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <strong className="text-gray-900">Educator Account:</strong> Create
                assessment challenges and help verify developer skills to build
                trusted credentials.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
