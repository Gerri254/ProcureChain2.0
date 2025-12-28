'use client';

import { CheckCircle2, Award, Star, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type VerificationStatus = 'verified' | 'expired' | 'pending';

interface SkillBadgeProps {
  name: string;
  level?: SkillLevel;
  score?: number;
  verificationStatus?: VerificationStatus;
  verifiedAt?: string;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  showIcon?: boolean;
  className?: string;
  onClick?: () => void;
}

export function SkillBadge({
  name,
  level = 'intermediate',
  score,
  verificationStatus = 'verified',
  verifiedAt,
  size = 'md',
  showScore = false,
  showIcon = true,
  className,
  onClick,
}: SkillBadgeProps) {
  const getLevelColor = () => {
    if (verificationStatus === 'expired') {
      return 'bg-gray-100 text-gray-600 border-gray-300';
    }
    if (verificationStatus === 'pending') {
      return 'bg-yellow-50 text-yellow-700 border-yellow-300';
    }

    switch (level) {
      case 'beginner':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'intermediate':
        return 'bg-purple-50 text-purple-700 border-purple-300';
      case 'advanced':
        return 'bg-orange-50 text-orange-700 border-orange-300';
      case 'expert':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-300';
    }
  };

  const getIcon = () => {
    if (verificationStatus === 'verified') {
      switch (level) {
        case 'expert':
          return <Star className="w-3.5 h-3.5 fill-current" />;
        case 'advanced':
          return <Award className="w-3.5 h-3.5" />;
        case 'intermediate':
          return <TrendingUp className="w-3.5 h-3.5" />;
        case 'beginner':
          return <CheckCircle2 className="w-3.5 h-3.5" />;
      }
    }
    return <CheckCircle2 className="w-3.5 h-3.5" />;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs gap-1';
      case 'md':
        return 'px-3 py-1 text-sm gap-1.5';
      case 'lg':
        return 'px-4 py-1.5 text-base gap-2';
      default:
        return 'px-3 py-1 text-sm gap-1.5';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  return (
    <div
      className={cn(
        'inline-flex items-center border rounded-full font-medium transition-all',
        getLevelColor(),
        getSizeClasses(),
        onClick && 'cursor-pointer hover:shadow-md hover:scale-105',
        verificationStatus === 'expired' && 'opacity-60',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {showIcon && <span className="flex-shrink-0">{getIcon()}</span>}

      <span className="truncate">{name}</span>

      {showScore && score !== undefined && (
        <span className={cn('font-semibold ml-1', getScoreColor(score))}>
          {score}%
        </span>
      )}

      {verifiedAt && (
        <span className="text-xs opacity-70 ml-1">
          • {formatDate(verifiedAt)}
        </span>
      )}
    </div>
  );
}

// Preset variants for common use cases
export function VerifiedSkillBadge({ name, score, verifiedAt, ...props }: Omit<SkillBadgeProps, 'verificationStatus'>) {
  const getLevel = (score?: number): SkillLevel => {
    if (!score) return 'intermediate';
    if (score >= 90) return 'expert';
    if (score >= 75) return 'advanced';
    if (score >= 60) return 'intermediate';
    return 'beginner';
  };

  return (
    <SkillBadge
      name={name}
      score={score}
      verifiedAt={verifiedAt}
      level={getLevel(score)}
      verificationStatus="verified"
      showScore={true}
      showIcon={true}
      {...props}
    />
  );
}

export function ExpiredSkillBadge({ name, ...props }: Omit<SkillBadgeProps, 'verificationStatus'>) {
  return (
    <SkillBadge
      name={name}
      verificationStatus="expired"
      showIcon={true}
      {...props}
    />
  );
}

export function PendingSkillBadge({ name, ...props }: Omit<SkillBadgeProps, 'verificationStatus'>) {
  return (
    <SkillBadge
      name={name}
      verificationStatus="pending"
      showIcon={true}
      {...props}
    />
  );
}

// Skill Badge Group Component
interface SkillBadgeGroupProps {
  skills: Array<{
    name: string;
    level?: SkillLevel;
    score?: number;
    verifiedAt?: string;
    status?: VerificationStatus;
  }>;
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  showScores?: boolean;
  className?: string;
}

export function SkillBadgeGroup({
  skills,
  maxDisplay = 10,
  size = 'md',
  showScores = false,
  className,
}: SkillBadgeGroupProps) {
  const displaySkills = skills.slice(0, maxDisplay);
  const remainingCount = skills.length - maxDisplay;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {displaySkills.map((skill, index) => (
        <SkillBadge
          key={`${skill.name}-${index}`}
          name={skill.name}
          level={skill.level}
          score={skill.score}
          verifiedAt={skill.verifiedAt}
          verificationStatus={skill.status}
          size={size}
          showScore={showScores}
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'inline-flex items-center border rounded-full font-medium bg-gray-100 text-gray-600 border-gray-300',
            size === 'sm' && 'px-2 py-0.5 text-xs',
            size === 'md' && 'px-3 py-1 text-sm',
            size === 'lg' && 'px-4 py-1.5 text-base'
          )}
        >
          +{remainingCount} more
        </div>
      )}
    </div>
  );
}
