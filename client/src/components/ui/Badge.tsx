import { ExpenseCategory, ExpenseStatus } from '../../types';

const CATEGORY_STYLES: Record<ExpenseCategory, string> = {
  [ExpenseCategory.FOOD]: 'bg-orange-100 text-orange-700',
  [ExpenseCategory.TRANSPORT]: 'bg-blue-100 text-blue-700',
  [ExpenseCategory.OFFICE]: 'bg-purple-100 text-purple-700',
  [ExpenseCategory.UTILITIES]: 'bg-yellow-100 text-yellow-700',
  [ExpenseCategory.ENTERTAINMENT]: 'bg-pink-100 text-pink-700',
  [ExpenseCategory.HEALTHCARE]: 'bg-red-100 text-red-700',
  [ExpenseCategory.OTHER]: 'bg-gray-100 text-gray-600',
};

const STATUS_STYLES: Record<ExpenseStatus, string> = {
  [ExpenseStatus.PENDING]: 'bg-yellow-100 text-yellow-700',
  [ExpenseStatus.CONFIRMED]: 'bg-green-100 text-green-700',
  [ExpenseStatus.REJECTED]: 'bg-red-100 text-red-600',
};

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.FOOD]: 'Food',
  [ExpenseCategory.TRANSPORT]: 'Transport',
  [ExpenseCategory.OFFICE]: 'Office',
  [ExpenseCategory.UTILITIES]: 'Utilities',
  [ExpenseCategory.ENTERTAINMENT]: 'Entertainment',
  [ExpenseCategory.HEALTHCARE]: 'Healthcare',
  [ExpenseCategory.OTHER]: 'Other',
};

interface BadgeProps {
  category?: ExpenseCategory;
  status?: ExpenseStatus;
  className?: string;
}

export function Badge({ category, status, className = '' }: BadgeProps) {
  const style = category
    ? CATEGORY_STYLES[category]
    : status
      ? STATUS_STYLES[status]
      : 'bg-gray-100 text-gray-600';

  const label = category
    ? CATEGORY_LABELS[category]
    : status
      ? status.charAt(0).toUpperCase() + status.slice(1)
      : '';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style} ${className}`}>
      {label}
    </span>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const style =
    confidence >= 0.8
      ? 'bg-green-100 text-green-700'
      : confidence >= 0.5
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-red-100 text-red-600';
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${style}`}>
      {pct}%
    </span>
  );
}
