import { format, formatDistance, parseISO } from 'date-fns';

/**
 * Format currency values
 */
export function formatCurrency(value: number, currency: string = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatNumber(value: number): string {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Format date strings
 */
export function formatDate(dateString: string | undefined, formatStr: string = 'MMM dd, yyyy'): string {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), formatStr);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  try {
    return formatDistance(parseISO(dateString), new Date(), { addSuffix: true });
  } catch {
    return 'Invalid date';
  }
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'badge-gray',
    published: 'badge-info',
    awarded: 'badge-success',
    cancelled: 'badge-error',
    completed: 'badge-success',
    pending: 'badge-warning',
    investigating: 'badge-info',
    resolved: 'badge-success',
    false_positive: 'badge-gray',
    escalated: 'badge-error',
    active: 'badge-success',
    inactive: 'badge-gray',
    suspended: 'badge-error',
  };
  return colors[status.toLowerCase()] || 'badge-gray';
}

/**
 * Get severity badge color
 */
export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    low: 'badge-info',
    medium: 'badge-warning',
    high: 'badge-error',
    critical: 'badge-error',
  };
  return colors[severity.toLowerCase()] || 'badge-gray';
}

/**
 * Get risk score color
 */
export function getRiskScoreColor(score: number): string {
  if (score >= 80) return 'text-red-600';
  if (score >= 60) return 'text-orange-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-green-600';
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert snake_case to Title Case
 */
export function snakeToTitle(str: string): string {
  return str
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Download file from blob
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Check if user has permission
 */
export function hasPermission(user: any, permission: string): boolean {
  if (!user) return false;
  return user.permissions?.includes(permission) || false;
}

/**
 * Check if user has role
 */
export function hasRole(user: any, roles: string | string[]): boolean {
  if (!user) return false;
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(user.role);
}

/**
 * Get category display name
 */
export function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    infrastructure: 'Infrastructure',
    supplies: 'Supplies',
    services: 'Services',
    consultancy: 'Consultancy',
    works: 'Works',
    goods: 'Goods',
    equipment: 'Equipment',
    other: 'Other',
  };
  return names[category] || category;
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Generate random color for charts
 */
export function generateColor(index: number): string {
  const colors = [
    'hsl(210, 70%, 55%)',
    'hsl(142, 70%, 45%)',
    'hsl(38, 92%, 50%)',
    'hsl(0, 84%, 60%)',
    'hsl(199, 89%, 48%)',
    'hsl(280, 70%, 55%)',
    'hsl(45, 100%, 51%)',
    'hsl(160, 70%, 45%)',
  ];
  return colors[index % colors.length];
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Handle API error
 */
export function getErrorMessage(error: any): string {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
