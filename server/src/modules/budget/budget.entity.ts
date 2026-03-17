import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ExpenseCategory } from '../../common/enums/expense-category.enum';

@Entity('budgets')
export class Budget {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ExpenseCategory })
  category: ExpenseCategory;

  @Column('decimal', { precision: 10, scale: 2 })
  monthlyLimit: number;

  @Column({ type: 'char', length: 7 })
  month: string; // YYYY-MM format

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
