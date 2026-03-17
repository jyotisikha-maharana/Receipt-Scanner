import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getSummary(@Query('month') month?: string) {
    const currentMonth = month ?? new Date().toISOString().slice(0, 7);
    return this.dashboardService.getSummary(currentMonth);
  }
}
