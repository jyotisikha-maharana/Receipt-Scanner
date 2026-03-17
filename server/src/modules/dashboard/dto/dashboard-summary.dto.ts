export class DashboardSummaryDto {
  totalSpent: number;
  expenseCount: number;
  topCategory: string;
  monthOverMonthChange: number;
  spendByCategory: { category: string; amount: number }[];
  monthlyTrend: { month: string; amount: number }[];
  topMerchants: { merchant: string; amount: number; count: number }[];
  budgetStatus: { category: string; spent: number; limit: number }[];
}
