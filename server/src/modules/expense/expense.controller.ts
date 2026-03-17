import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { FilterExpenseDto } from './dto/filter-expense.dto';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  findAll(@Query() filters: FilterExpenseDto) {
    return this.expenseService.findAll(filters);
  }

  @Get('export')
  async exportCsv(
    @Query() filters: FilterExpenseDto,
    @Res() res: Response,
  ): Promise<void> {
    const { data } = await this.expenseService.findAll({ ...filters, limit: 1000 });

    const headers = ['Date', 'Merchant', 'Category', 'Amount', 'Currency', 'Status', 'Description'];
    const rows = data.map((e) => [
      e.date,
      e.merchant,
      e.category,
      e.amount,
      e.currency,
      e.status,
      e.description ?? '',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
    res.send(csv);
  }

  @Get('check-duplicate')
  checkDuplicate(
    @Query('merchant') merchant: string,
    @Query('amount') amount: string,
    @Query('date') date: string,
  ) {
    return this.expenseService.checkDuplicate(merchant, parseFloat(amount), date);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.expenseService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateExpenseDto) {
    return this.expenseService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expenseService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.expenseService.remove(id);
  }
}
