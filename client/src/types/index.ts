export enum ExpenseCategory {
  FOOD = 'food',
  TRANSPORT = 'transport',
  OFFICE = 'office',
  UTILITIES = 'utilities',
  ENTERTAINMENT = 'entertainment',
  HEALTHCARE = 'healthcare',
  OTHER = 'other',
}

export enum ExpenseStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
}

export interface Expense {
  id: string;
  merchant: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string;
  description?: string;
  receiptImagePath?: string;
  status: ExpenseStatus;
  aiConfidence?: number;
  userCorrected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  category: ExpenseCategory;
  monthlyLimit: number;
  month: string;
}

export interface LineItem {
  name: string;
  amount: number;
}

export interface ReceiptExtraction {
  merchant: string;
  amount: number;
  currency: string;
  date: string;
  category: ExpenseCategory;
  lineItems: LineItem[];
  confidence: number;
}

export interface ScanReceiptResponse {
  expense: Expense;
  extraction: ReceiptExtraction;
  isDuplicate: boolean;
  duplicateMatch: Expense | null;
}

export interface DashboardSummary {
  totalSpent: number;
  expenseCount: number;
  topCategory: string;
  monthOverMonthChange: number;
  spendByCategory: { category: string; amount: number }[];
  monthlyTrend: { month: string; amount: number }[];
  topMerchants: { merchant: string; amount: number; count: number }[];
  budgetStatus: { category: string; spent: number; limit: number }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ExpenseFilters {
  page?: number;
  limit?: number;
  category?: ExpenseCategory;
  status?: ExpenseStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}
