import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { CardTitle } from '../ui/Card';

const COLORS: Record<string, string> = {
  food: '#2CA01C',
  transport: '#3B82F6',
  office: '#8B5CF6',
  utilities: '#F59E0B',
  entertainment: '#EC4899',
  healthcare: '#14B8A6',
  other: '#6B7280',
};

interface Props {
  data: { category: string; amount: number }[];
}

export function SpendByCategoryChart({ data }: Props) {
  const navigate = useNavigate();

  const formatted = data.map((d) => ({
    ...d,
    name: d.category.charAt(0).toUpperCase() + d.category.slice(1),
    fill: COLORS[d.category] ?? COLORS.other,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <CardTitle>Spend by Category</CardTitle>
      {formatted.length === 0 ? (
        <p className="mt-8 text-center text-sm text-gray-400">No data for this month</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={formatted}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="amount"
              onClick={(entry: { category?: string }) => entry.category && navigate(`/expenses?category=${entry.category}`)}
              style={{ cursor: 'pointer' }}
            >
              {formatted.map((entry) => (
                <Cell key={entry.category} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Spent']} />
            <Legend iconType="circle" iconSize={8} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
