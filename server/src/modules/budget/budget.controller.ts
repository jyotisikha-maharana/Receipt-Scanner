import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Controller('budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get()
  findAll(@Query('month') month?: string) {
    if (month) return this.budgetService.findByMonth(month);
    return this.budgetService.findAll();
  }

  @Put()
  upsert(@Body() dto: CreateBudgetDto) {
    return this.budgetService.upsert(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.budgetService.remove(id);
  }
}
