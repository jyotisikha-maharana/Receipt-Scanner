import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './expense.entity';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { ExpenseRepository } from './expense.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Expense])],
  controllers: [ExpenseController],
  providers: [ExpenseService, ExpenseRepository],
  exports: [ExpenseService, ExpenseRepository],
})
export class ExpenseModule {}
