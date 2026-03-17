import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// TODO: import { TypeOrmModule } from '@nestjs/typeorm';
// TODO: import { ServeStaticModule } from '@nestjs/serve-static';
// TODO: import { validateEnv } from './config/env.validation';
// TODO: import { databaseConfig } from './config/database.config';
// TODO: import { ExpenseModule } from './modules/expense/expense.module';
// TODO: import { ReceiptModule } from './modules/receipt/receipt.module';
// TODO: import { BudgetModule } from './modules/budget/budget.module';
// TODO: import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // TODO: TypeOrmModule.forRootAsync(databaseConfig),
    // TODO: ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'uploads'), serveRoot: '/uploads' }),
    // TODO: ExpenseModule, ReceiptModule, BudgetModule, DashboardModule,
  ],
})
export class AppModule {}
