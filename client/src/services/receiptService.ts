import apiClient from './apiClient';
import type { ScanReceiptResponse } from '../types';

export const receiptService = {
  scan: async (file: File): Promise<ScanReceiptResponse> => {
    const formData = new FormData();
    formData.append('receipt', file);
    const res = await apiClient.post<ScanReceiptResponse>('/receipts/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
