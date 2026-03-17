import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ExpenseCategory } from '../../../common/enums/expense-category.enum';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  merchant: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  receiptImagePath?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  aiConfidence?: number;
}
