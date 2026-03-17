import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validateEnv } from './config/env.validation';
import { databaseConfig } from './config/database.config';
import { ExpenseModule } from './modules/expense/expense.module';
import { ReceiptModule } from './modules/receipt/receipt.module';
import { BudgetModule } from './modules/budget/budget.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync(databaseConfig),
    ExpenseModule,
    ReceiptModule,
    BudgetModule,
    DashboardModule,
    AdminModule,
  ],
})
export class AppModule {}
