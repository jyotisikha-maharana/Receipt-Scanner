import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Expense } from './expense.entity';
import { ExpenseRepository } from './expense.repository';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { FilterExpenseDto } from './dto/filter-expense.dto';
import { ExpenseStatus } from '../../common/enums/expense-status.enum';
import { ExpenseCategory } from '../../common/enums/expense-category.enum';

@Injectable()
export class ExpenseService {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async findAll(
    filters: FilterExpenseDto,
  ): Promise<{ data: Expense[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20 } = filters;
    const { data, total } = await this.expenseRepository.findWithFilters(filters);
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.expenseRepository.findById(id);
    if (!expense) throw new NotFoundException(`Expense ${id} not found`);
    return expense;
  }

  async create(dto: CreateExpenseDto): Promise<Expense> {
    if (dto.amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }
    const expense = Object.assign(new Expense(), {
      ...dto,
      id: uuidv4(),
      currency: dto.currency ?? 'USD',
      status: ExpenseStatus.PENDING,
    });
    return this.expenseRepository.save(expense);
  }

  async update(id: string, dto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findOne(id);
    Object.assign(expense, dto);
    return this.expenseRepository.save(expense);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.expenseRepository.delete(id);
  }

  async checkDuplicate(
    merchant: string,
    amount: number,
    date: string,
  ): Promise<{ isDuplicate: boolean; match: Expense | null }> {
    const duplicates = await this.expenseRepository.findDuplicates(merchant, amount, date);
    return { isDuplicate: duplicates.length > 0, match: duplicates[0] ?? null };
  }

  async createFromReceipt(
    extraction: {
      merchant: string;
      amount: number;
      currency: string;
      date: string;
      category: ExpenseCategory;
      confidence: number;
    },
    imagePath: string,
  ): Promise<Expense> {
    return this.create({
      merchant: extraction.merchant,
      amount: extraction.amount,
      currency: extraction.currency,
      category: extraction.category,
      date: extraction.date,
      receiptImagePath: imagePath,
      aiConfidence: extraction.confidence,
    });
  }

  async getSpendByCategory(month: string) {
    return this.expenseRepository.getSpendByCategory(month);
  }

  async getMonthlyTrend(months: number) {
    return this.expenseRepository.getMonthlyTrend(months);
  }

  async getTopMerchants(month: string, limit: number) {
    return this.expenseRepository.getTopMerchants(month, limit);
  }

  async getTotalSpentInMonth(month: string): Promise<number> {
    return this.expenseRepository.getTotalSpentInMonth(month);
  }

  async getExpenseCountInMonth(month: string): Promise<number> {
    return this.expenseRepository.getExpenseCountInMonth(month);
  }
}
