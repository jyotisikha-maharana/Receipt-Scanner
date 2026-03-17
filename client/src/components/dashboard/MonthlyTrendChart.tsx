import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { CardTitle } from '../ui/Card';
import { formatMonth } from '../../utils/formatters';

interface Props {
  data: { month: string; amount: number }[];
}

export function MonthlyTrendChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    label: formatMonth(d.month).replace(' 2026', '').replace(' 2025', ''),
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <CardTitle>Monthly Trend</CardTitle>
      {formatted.length === 0 ? (
        <p className="mt-8 text-center text-sm text-gray-400">No trend data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={formatted} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2CA01C" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2CA01C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} width={55} />
            <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Total Spent']} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#2CA01C"
              strokeWidth={2}
              fill="url(#trendGradient)"
              dot={{ r: 3, fill: '#2CA01C' }}
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
