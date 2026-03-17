import { ExpenseCategory } from '../types';

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function formatMonth(month: string): string {
  const [year, m] = month.split('-');
  return new Date(Number(year), Number(m) - 1).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  });
}

export function prevMonth(month: string): string {
  const [year, m] = month.split('-').map(Number);
  const d = new Date(year, m - 2);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function nextMonth(month: string): string {
  const [year, m] = month.split('-').map(Number);
  const d = new Date(year, m);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export const CATEGORY_OPTIONS = Object.values(ExpenseCategory).map((c) => ({
  value: c,
  label: c.charAt(0).toUpperCase() + c.slice(1),
}));
