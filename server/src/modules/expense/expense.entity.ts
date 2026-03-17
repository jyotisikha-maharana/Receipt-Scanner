import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ExpenseCategory } from '../../common/enums/expense-category.enum';
import { ExpenseStatus } from '../../common/enums/expense-status.enum';

@Entity('expenses')
export class Expense {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  merchant: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'enum', enum: ExpenseCategory })
  category: ExpenseCategory;

  @Column({ type: 'date' })
  date: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  receiptImagePath: string;

  @Column({ type: 'enum', enum: ExpenseStatus, default: ExpenseStatus.PENDING })
  status: ExpenseStatus;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  aiConfidence: number;

  @Column({ default: false })
  userCorrected: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
