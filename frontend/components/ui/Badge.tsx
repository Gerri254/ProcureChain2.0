import React from 'react';
import { getStatusColor, getSeverityColor } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'gray';
  status?: string;
  severity?: string;
  className?: string;
}

export function Badge({
  children,
  variant,
  status,
  severity,
  className = '',
}: BadgeProps) {
  let badgeClass = 'badge';

  if (status) {
    badgeClass += ` ${getStatusColor(status)}`;
  } else if (severity) {
    badgeClass += ` ${getSeverityColor(severity)}`;
  } else if (variant) {
    badgeClass += ` badge-${variant}`;
  } else {
    badgeClass += ' badge-gray';
  }

  return (
    <span className={`${badgeClass} ${className}`}>
      {children}
    </span>
  );
}
