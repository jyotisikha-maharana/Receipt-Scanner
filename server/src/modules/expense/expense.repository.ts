import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './expense.entity';
import { FilterExpenseDto } from './dto/filter-expense.dto';

@Injectable()
export class ExpenseRepository {
  constructor(
    @InjectRepository(Expense)
    private readonly repo: Repository<Expense>,
  ) {}

  async save(expense: Expense): Promise<Expense> {
    return this.repo.save(expense);
  }

  async findById(id: string): Promise<Expense | null> {
    return this.repo.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async findWithFilters(
    filters: FilterExpenseDto,
  ): Promise<{ data: Expense[]; total: number }> {
    const { page = 1, limit = 20, category, startDate, endDate, status, search } = filters;

    const qb = this.repo.createQueryBuilder('expense');

    if (category) qb.andWhere('expense.category = :category', { category });
    if (status) qb.andWhere('expense.status = :status', { status });
    if (startDate) qb.andWhere('expense.date >= :startDate', { startDate });
    if (endDate) qb.andWhere('expense.date <= :endDate', { endDate });
    if (search) {
      qb.andWhere('LOWER(expense.merchant) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    qb.orderBy('expense.date', 'DESC').addOrderBy('expense.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findDuplicates(
    merchant: string,
    amount: number,
    date: string,
  ): Promise<Expense[]> {
    const dateObj = new Date(date);
    const dateMinus2 = new Date(dateObj);
    dateMinus2.setDate(dateMinus2.getDate() - 2);
    const datePlus2 = new Date(dateObj);
    datePlus2.setDate(datePlus2.getDate() + 2);

    return this.repo
      .createQueryBuilder('expense')
      .where('LOWER(expense.merchant) = LOWER(:merchant)', { merchant })
      .andWhere('ABS(CAST(expense.amount AS FLOAT) - :amount) <= 0.50', { amount })
      .andWhere('expense.date >= :dateMinus2', {
        dateMinus2: dateMinus2.toISOString().split('T')[0],
      })
      .andWhere('expense.date <= :datePlus2', {
        datePlus2: datePlus2.toISOString().split('T')[0],
      })
      .getMany();
  }

  async getSpendByCategory(
    month: string,
  ): Promise<{ category: string; amount: number }[]> {
    return this.repo
      .createQueryBuilder('expense')
      .select('expense.category', 'category')
      .addSelect('SUM(CAST(expense.amount AS FLOAT))', 'amount')
      .where("TO_CHAR(expense.date, 'YYYY-MM') = :month", { month })
      .andWhere("expense.status != 'rejected'")
      .groupBy('expense.category')
      .orderBy('amount', 'DESC')
      .getRawMany();
  }

  async getMonthlyTrend(
    months: number,
  ): Promise<{ month: string; amount: number }[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    const startDateStr = startDate.toISOString().split('T')[0];

    return this.repo
      .createQueryBuilder('expense')
      .select("TO_CHAR(expense.date, 'YYYY-MM')", 'month')
      .addSelect('SUM(CAST(expense.amount AS FLOAT))', 'amount')
      .where('expense.date >= :startDate', { startDate: startDateStr })
      .andWhere("expense.status != 'rejected'")
      .groupBy("TO_CHAR(expense.date, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany();
  }

  async getTopMerchants(
    month: string,
    limit: number,
  ): Promise<{ merchant: string; amount: number; count: number }[]> {
    return this.repo
      .createQueryBuilder('expense')
      .select('expense.merchant', 'merchant')
      .addSelect('SUM(CAST(expense.amount AS FLOAT))', 'amount')
      .addSelect('COUNT(*)', 'count')
      .where("TO_CHAR(expense.date, 'YYYY-MM') = :month", { month })
      .andWhere("expense.status != 'rejected'")
      .groupBy('expense.merchant')
      .orderBy('amount', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getTotalSpentInMonth(month: string): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('expense')
      .select('SUM(CAST(expense.amount AS FLOAT))', 'total')
      .where("TO_CHAR(expense.date, 'YYYY-MM') = :month", { month })
      .andWhere("expense.status != 'rejected'")
      .getRawOne<{ total: string }>();
    return parseFloat(result?.total ?? '0');
  }

  async getExpenseCountInMonth(month: string): Promise<number> {
    return this.repo
      .createQueryBuilder('expense')
      .where("TO_CHAR(expense.date, 'YYYY-MM') = :month", { month })
      .andWhere("expense.status != 'rejected'")
      .getCount();
  }
}
