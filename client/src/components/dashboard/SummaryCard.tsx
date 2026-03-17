interface SummaryCardProps {
  title: string;
  value: string;
  icon: string;
  change?: number; // MoM % change, undefined = no indicator
  changeLabel?: string;
}

export function SummaryCard({ title, value, icon, change, changeLabel }: SummaryCardProps) {
  const hasChange = change !== undefined;
  const isPositive = (change ?? 0) >= 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {hasChange && (
            <p className={`mt-1 text-xs font-medium ${isPositive ? 'text-red-500' : 'text-green-600'}`}>
              {isPositive ? '↑' : '↓'} {Math.abs(change!).toFixed(1)}%{' '}
              <span className="text-gray-400 font-normal">{changeLabel ?? 'vs last month'}</span>
            </p>
          )}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}
