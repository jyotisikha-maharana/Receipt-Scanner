import { CardTitle } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  data: { category: string; spent: number; limit: number }[];
}

function bar(spent: number, limit: number) {
  if (limit === 0) return { pct: 0, color: 'bg-gray-200' };
  const pct = Math.min((spent / limit) * 100, 100);
  const color = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-400' : 'bg-[#2CA01C]';
  return { pct, color };
}

export function BudgetProgressCard({ data }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <CardTitle>Budget vs Actual</CardTitle>
      {data.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">No budgets set. Add budgets to track limits.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {data.map(({ category, spent, limit }) => {
            const { pct, color } = bar(spent, limit);
            const label = category.charAt(0).toUpperCase() + category.slice(1);
            return (
              <li key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{label}</span>
                  <span className="text-gray-500">
                    {formatCurrency(spent)} / {formatCurrency(limit)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {pct >= 100 && (
                  <p className="mt-0.5 text-xs text-red-500 font-medium">Over budget</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
