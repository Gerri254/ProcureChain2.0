export function formatCurrency(amount: number, currency = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    published: 'bg-blue-100 text-blue-700',
    evaluation: 'bg-yellow-100 text-yellow-700',
    awarded: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-700',
    compliant: 'bg-green-100 text-green-700',
    non_compliant: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
    flagged: 'bg-red-100 text-red-700',
    under_review: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
    false_positive: 'bg-gray-100 text-gray-600',
  };

  return colors[status] || 'bg-gray-100 text-gray-700';
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    goods: 'Goods',
    services: 'Services',
    works: 'Works',
    consultancy: 'Consultancy',
    supplies: 'Supplies',
  };

  return labels[category] || category;
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    goods: 'bg-blue-100 text-blue-700',
    services: 'bg-purple-100 text-purple-700',
    works: 'bg-orange-100 text-orange-700',
    consultancy: 'bg-green-100 text-green-700',
    supplies: 'bg-gray-100 text-gray-700',
  };

  return colors[category] || 'bg-gray-100 text-gray-700';
}

export function getRiskBadge(score: number): { label: string; color: string } {
  if (score >= 75) return { label: 'Critical', color: 'bg-red-100 text-red-700' };
  if (score >= 50) return { label: 'High', color: 'bg-orange-100 text-orange-700' };
  if (score >= 25) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' };
  return { label: 'Low', color: 'bg-blue-100 text-blue-700' };
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
