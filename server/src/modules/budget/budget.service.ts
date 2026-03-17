import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Budget } from './budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepo: Repository<Budget>,
  ) {}

  async findAll(): Promise<Budget[]> {
    return this.budgetRepo.find({ order: { month: 'DESC', category: 'ASC' } });
  }

  async findByMonth(month: string): Promise<Budget[]> {
    return this.budgetRepo.find({ where: { month } });
  }

  async upsert(dto: CreateBudgetDto): Promise<Budget> {
    const existing = await this.budgetRepo.findOne({
      where: { category: dto.category, month: dto.month },
    });
    if (existing) {
      existing.monthlyLimit = dto.monthlyLimit;
      return this.budgetRepo.save(existing);
    }
    const budget = Object.assign(new Budget(), { ...dto, id: uuidv4() });
    return this.budgetRepo.save(budget);
  }

  async remove(id: string): Promise<void> {
    const budget = await this.budgetRepo.findOne({ where: { id } });
    if (!budget) throw new NotFoundException(`Budget ${id} not found`);
    await this.budgetRepo.delete(id);
  }
}
