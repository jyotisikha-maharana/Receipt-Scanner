import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { CardTitle } from '../ui/Card';

interface Props {
  data: { merchant: string; amount: number; count: number }[];
}

export function TopMerchantsChart({ data }: Props) {
  const top5 = data.slice(0, 5).map((d) => ({
    ...d,
    label: d.merchant.length > 14 ? d.merchant.slice(0, 13) + '…' : d.merchant,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <CardTitle>Top Merchants</CardTitle>
      {top5.length === 0 ? (
        <p className="mt-8 text-center text-sm text-gray-400">No data for this month</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={top5}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
            <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 12 }} width={90} />
            <Tooltip
              formatter={(v, _n, props) => [
                `$${Number(v).toFixed(2)} (${(props.payload as { count?: number })?.count ?? 0} receipts)`,
                'Total',
              ]}
            />
            <Bar dataKey="amount" fill="#2CA01C" radius={[0, 4, 4, 0]} animationDuration={600} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
