import apiClient from './apiClient';

export const adminService = {
  resetData: async (): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>('/admin/reset');
    return res.data;
  },
};
