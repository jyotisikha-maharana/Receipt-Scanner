import { Injectable, BadRequestException } from '@nestjs/common';
import { readFileSync } from 'fs';
import { GeminiService } from './gemini.service';
import { ExpenseService } from '../expense/expense.service';
import { Expense } from '../expense/expense.entity';
import { ReceiptExtractionDto } from './dto/receipt-extraction.dto';

@Injectable()
export class ReceiptService {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly expenseService: ExpenseService,
  ) {}

  async processReceipt(file: Express.Multer.File): Promise<{
    expense: Expense;
    extraction: ReceiptExtractionDto;
    isDuplicate: boolean;
    duplicateMatch: Expense | null;
  }> {
    if (!file) throw new BadRequestException('No file uploaded');

    const imageBuffer = readFileSync(file.path);
    const extraction = await this.geminiService.extractReceiptData(
      imageBuffer,
      file.mimetype,
    );

    const { isDuplicate, match: duplicateMatch } =
      await this.expenseService.checkDuplicate(
        extraction.merchant,
        extraction.amount,
        extraction.date,
      );

    const expense = await this.expenseService.createFromReceipt(
      extraction,
      file.path,
    );

    return { expense, extraction, isDuplicate, duplicateMatch };
  }
}
