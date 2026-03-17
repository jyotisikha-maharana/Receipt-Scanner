import { IsOptional, IsEnum, IsDateString, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ExpenseCategory } from '../../../common/enums/expense-category.enum';
import { ExpenseStatus } from '../../../common/enums/expense-status.enum';

export class FilterExpenseDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(ExpenseStatus)
  status?: ExpenseStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
