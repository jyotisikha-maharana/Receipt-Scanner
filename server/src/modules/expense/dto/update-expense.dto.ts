import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { CreateExpenseDto } from './create-expense.dto';
import { ExpenseStatus } from '../../../common/enums/expense-status.enum';

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {
  @IsOptional()
  @IsEnum(ExpenseStatus)
  status?: ExpenseStatus;

  @IsOptional()
  @IsBoolean()
  userCorrected?: boolean;
}
