import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 20, className = '' }: SpinnerProps) {
  return <Loader2 size={size} className={`animate-spin text-[#2CA01C] ${className}`} />;
}

export function PageSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-64">
      <Spinner size={32} />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex gap-4 py-3 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24" />
      <div className="h-4 bg-gray-200 rounded flex-1" />
      <div className="h-4 bg-gray-200 rounded w-16" />
      <div className="h-4 bg-gray-200 rounded w-20" />
    </div>
  );
}
