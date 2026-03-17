import { IsEnum, IsNumber, Min, IsString, Matches } from 'class-validator';
import { ExpenseCategory } from '../../../common/enums/expense-category.enum';

export class CreateBudgetDto {
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsNumber()
  @Min(0.01)
  monthlyLimit: number;

  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month must be in YYYY-MM format' })
  month: string;
}
