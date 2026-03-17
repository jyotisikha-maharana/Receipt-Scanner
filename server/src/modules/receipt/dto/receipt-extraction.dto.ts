import { ExpenseCategory } from '../../../common/enums/expense-category.enum';

export class LineItemDto {
  name: string;
  amount: number;
}

export class ReceiptExtractionDto {
  merchant: string;
  amount: number;
  currency: string;
  date: string;
  category: ExpenseCategory;
  lineItems: LineItemDto[];
  confidence: number;
}
