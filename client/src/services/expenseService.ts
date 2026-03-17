import apiClient from './apiClient';
import type { Expense, PaginatedResponse, ExpenseFilters } from '../types';

export const expenseService = {
  getAll: async (filters: ExpenseFilters = {}): Promise<PaginatedResponse<Expense>> => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
    );
    const res = await apiClient.get<PaginatedResponse<Expense>>('/expenses', { params });
    return res.data;
  },

  getOne: async (id: string): Promise<Expense> => {
    const res = await apiClient.get<Expense>(`/expenses/${id}`);
    return res.data;
  },

  create: async (data: Partial<Expense>): Promise<Expense> => {
    const res = await apiClient.post<Expense>('/expenses', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Expense>): Promise<Expense> => {
    const res = await apiClient.put<Expense>(`/expenses/${id}`, data);
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/expenses/${id}`);
  },

  checkDuplicate: async (merchant: string, amount: number, date: string) => {
    const res = await apiClient.get<{ isDuplicate: boolean; match: Expense | null }>(
      '/expenses/check-duplicate',
      { params: { merchant, amount, date } },
    );
    return res.data;
  },

  exportCsv: (filters: ExpenseFilters = {}): void => {
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(filters)
          .filter(([, v]) => v !== undefined && v !== '')
          .map(([k, v]) => [k, String(v)]),
      ),
    );
    window.open(`/api/expenses/export?${params.toString()}`, '_blank');
  },
};
