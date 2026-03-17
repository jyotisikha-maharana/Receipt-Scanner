import { useState, useEffect, useCallback } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { PageSpinner } from '../components/ui/Spinner';
import { useToast } from '../context/ToastContext';
import { budgetService } from '../services/budgetService';
import type { Budget } from '../types';
import { ExpenseCategory } from '../types';
import {
  formatCurrency,
  formatMonth,
  prevMonth,
  nextMonth,
  currentMonth,
  CATEGORY_OPTIONS,
} from '../utils/formatters';
import { usePageTitle } from '../hooks/usePageTitle';

export function SettingsPage() {
  usePageTitle('Settings');
  const { toast } = useToast();
  const [month, setMonth] = useState(currentMonth());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New budget form
  const [form, setForm] = useState({ category: ExpenseCategory.FOOD, limit: '' });
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async (m: string) => {
    setLoading(true);
    try {
      const data = await budgetService.getAll(m);
      setBudgets(data);
    } catch {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(month); }, [month, load]);

  const usedCategories = new Set(budgets.map((b) => b.category));
  const availableCategories = CATEGORY_OPTIONS.filter((o) => !usedCategories.has(o.value as ExpenseCategory));

  const handleAdd = async () => {
    const limit = parseFloat(form.limit);
    if (!form.limit || isNaN(limit) || limit <= 0) {
      toast.error('Enter a valid monthly limit');
      return;
    }
    setSaving(true);
    try {
      await budgetService.upsert({ category: form.category, monthlyLimit: limit, month });
      toast.success('Budget saved');
      setShowForm(false);
      setForm({ category: ExpenseCategory.FOOD, limit: '' });
      load(month);
    } catch {
      toast.error('Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, category: string) => {
    try {
      await budgetService.remove(id);
      toast.success(`Budget for ${category} removed`);
      load(month);
    } catch {
      toast.error('Failed to delete budget');
    }
  };

  const isFutureMonth = month >= nextMonth(currentMonth());

  return (
    <div>
      <Header
        title="Settings"
        subtitle="Manage monthly budgets per category"
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

      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Budgets — {formatMonth(month)}</CardTitle>
          {!showForm && availableCategories.length > 0 && (
            <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowForm(true)}>
              Add Budget
            </Button>
          )}
        </div>

        {/* Add form */}
        {showForm && (
          <div className="mb-5 p-4 rounded-lg border border-gray-200 bg-gray-50 flex flex-wrap gap-3 items-end">
            <Select
              label="Category"
              value={form.category}
              options={availableCategories}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))}
              className="w-44"
            />
            <Input
              label="Monthly Limit ($)"
              type="number"
              min="1"
              step="0.01"
              placeholder="e.g. 500"
              value={form.limit}
              onChange={(e) => setForm((f) => ({ ...f, limit: e.target.value }))}
              className="w-40"
            />
            <div className="flex gap-2">
              <Button onClick={handleAdd} loading={saving} size="sm">Save</Button>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setForm({ category: ExpenseCategory.FOOD, limit: '' }); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <PageSpinner />
        ) : budgets.length === 0 ? (
          <EmptyState
            icon={<span className="text-4xl">💰</span>}
            title="No budgets set"
            description="Add a budget to track your spending limits per category."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Header */}
            <div className="grid grid-cols-[2fr_1fr_80px] gap-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <span>Category</span>
              <span>Monthly Limit</span>
              <span />
            </div>
            {budgets.map((budget) => (
              <div key={budget.id} className="grid grid-cols-[2fr_1fr_80px] gap-4 py-3.5 items-center">
                <span className="text-sm font-medium text-gray-900 capitalize">{budget.category}</span>
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(budget.monthlyLimit)}</span>
                <button
                  onClick={() => handleDelete(budget.id, budget.category)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors justify-self-end"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
