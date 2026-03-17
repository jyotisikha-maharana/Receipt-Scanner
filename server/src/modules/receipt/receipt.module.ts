import { Module } from '@nestjs/common';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './receipt.service';
import { GeminiService } from './gemini.service';
import { ExpenseModule } from '../expense/expense.module';

@Module({
  imports: [ExpenseModule],
  controllers: [ReceiptController],
  providers: [ReceiptService, GeminiService],
})
export class ReceiptModule {}
