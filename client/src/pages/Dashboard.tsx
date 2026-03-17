import { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { PageSpinner } from '../components/ui/Spinner';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { SpendByCategoryChart } from '../components/dashboard/SpendByCategoryChart';
import { MonthlyTrendChart } from '../components/dashboard/MonthlyTrendChart';
import { TopMerchantsChart } from '../components/dashboard/TopMerchantsChart';
import { BudgetProgressCard } from '../components/dashboard/BudgetProgressCard';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency, formatMonth, prevMonth, nextMonth, currentMonth } from '../utils/formatters';
import type { DashboardSummary } from '../types';
import { usePageTitle } from '../hooks/usePageTitle';

export function DashboardPage() {
  usePageTitle('Dashboard');
  const [month, setMonth] = useState(currentMonth());
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    dashboardService
      .getSummary(month)
      .then(setSummary)
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, [month]);

  const isFutureMonth = month >= nextMonth(currentMonth());

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Your expense overview"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonth(prevMonth(month))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              ←
            </button>
            <span className="text-sm font-medium text-gray-700 w-32 text-center">
              {formatMonth(month)}
            </span>
            <button
              onClick={() => !isFutureMonth && setMonth(nextMonth(month))}
              disabled={isFutureMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
        }
      />

      {loading && <PageSpinner />}

      {!loading && error && (
        <p className="mt-8 text-center text-sm text-red-500">{error}</p>
      )}

      {!loading && !error && summary && (
        <div className="space-y-6">
          {/* Row 1 — Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title="Total Spent"
              value={formatCurrency(summary.totalSpent)}
              icon="💰"
              change={summary.monthOverMonthChange}
            />
            <SummaryCard
              title="Expenses"
              value={String(summary.expenseCount)}
              icon="🧾"
            />
            <SummaryCard
              title="Top Category"
              value={
                summary.topCategory
                  ? summary.topCategory.charAt(0).toUpperCase() + summary.topCategory.slice(1)
                  : '—'
              }
              icon="🏆"
            />
            <SummaryCard
              title="MoM Change"
              value={
                summary.monthOverMonthChange === 0
                  ? '—'
                  : `${summary.monthOverMonthChange > 0 ? '+' : ''}${summary.monthOverMonthChange.toFixed(1)}%`
              }
              icon={summary.monthOverMonthChange >= 0 ? '📈' : '📉'}
            />
          </div>

          {/* Row 2 — Donut + Area Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SpendByCategoryChart data={summary.spendByCategory} />
            <MonthlyTrendChart data={summary.monthlyTrend} />
          </div>

          {/* Row 3 — Top Merchants + Budget */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopMerchantsChart data={summary.topMerchants} />
            <BudgetProgressCard data={summary.budgetStatus} />
          </div>
        </div>
      )}
    </div>
  );
}
