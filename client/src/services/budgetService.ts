import apiClient from './apiClient';
import type { Budget, ExpenseCategory } from '../types';

export const budgetService = {
  getAll: async (month?: string): Promise<Budget[]> => {
    const res = await apiClient.get<Budget[]>('/budgets', {
      params: month ? { month } : {},
    });
    return res.data;
  },

  upsert: async (data: { category: ExpenseCategory; monthlyLimit: number; month: string }): Promise<Budget> => {
    const res = await apiClient.put<Budget>('/budgets', data);
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/budgets/${id}`);
  },
};
