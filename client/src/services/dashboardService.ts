import apiClient from './apiClient';
import type { DashboardSummary } from '../types';

export const dashboardService = {
  getSummary: async (month?: string): Promise<DashboardSummary> => {
    const res = await apiClient.get<DashboardSummary>('/dashboard', {
      params: month ? { month } : {},
    });
    return res.data;
  },
};
