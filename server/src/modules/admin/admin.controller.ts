import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('admin')
export class AdminController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async reset(): Promise<{ message: string }> {
    await this.dataSource.query('TRUNCATE TABLE "expenses" RESTART IDENTITY CASCADE');
    await this.dataSource.query('TRUNCATE TABLE "budgets" RESTART IDENTITY CASCADE');
    return { message: 'All data cleared' };
  }
}
