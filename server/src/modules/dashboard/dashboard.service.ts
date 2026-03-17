import { Injectable } from '@nestjs/common';
import { ExpenseService } from '../expense/expense.service';
import { BudgetService } from '../budget/budget.service';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly expenseService: ExpenseService,
    private readonly budgetService: BudgetService,
  ) {}

  async getSummary(month: string): Promise<DashboardSummaryDto> {
    const [year, monthNum] = month.split('-').map(Number);
    const prevMonth =
      monthNum === 1
        ? `${year - 1}-12`
        : `${year}-${String(monthNum - 1).padStart(2, '0')}`;

    const [
      totalSpent,
      expenseCount,
      spendByCategory,
      monthlyTrend,
      topMerchants,
      prevMonthTotal,
      budgets,
    ] = await Promise.all([
      this.expenseService.getTotalSpentInMonth(month),
      this.expenseService.getExpenseCountInMonth(month),
      this.expenseService.getSpendByCategory(month),
      this.expenseService.getMonthlyTrend(6),
      this.expenseService.getTopMerchants(month, 5),
      this.expenseService.getTotalSpentInMonth(prevMonth),
      this.budgetService.findByMonth(month),
    ]);

    const topCategory = spendByCategory.length > 0 ? spendByCategory[0].category : 'N/A';

    const monthOverMonthChange =
      prevMonthTotal > 0
        ? ((totalSpent - prevMonthTotal) / prevMonthTotal) * 100
        : 0;

    const budgetStatus = budgets.map((b) => {
      const categorySpend = spendByCategory.find((s) => s.category === b.category);
      return {
        category: b.category,
        spent: categorySpend ? Number(categorySpend.amount) : 0,
        limit: Number(b.monthlyLimit),
      };
    });

    return {
      totalSpent,
      expenseCount,
      topCategory,
      monthOverMonthChange,
      spendByCategory,
      monthlyTrend,
      topMerchants,
      budgetStatus,
    };
  }
}
