import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ExpenseModule } from '../expense/expense.module';
import { BudgetModule } from '../budget/budget.module';

@Module({
  imports: [ExpenseModule, BudgetModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
