import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { ReceiptExtractionDto } from './dto/receipt-extraction.dto';
import { ExpenseCategory } from '../../common/enums/expense-category.enum';

const EXTRACTION_PROMPT = `You are a receipt data extraction system. Analyze this receipt image and extract:
1. merchant/store name
2. total amount (numeric, no currency symbol)
3. currency (USD, EUR, INR, etc.)
4. date of purchase (ISO format YYYY-MM-DD)
5. category (one of: food, transport, office, utilities, entertainment, healthcare, other)
6. individual line items with name and amount

Respond ONLY in this exact JSON format, no other text, no markdown:
{
  "merchant": "string",
  "amount": number,
  "currency": "string",
  "date": "YYYY-MM-DD",
  "category": "string",
  "lineItems": [{"name": "string", "amount": number}],
  "confidence": number between 0 and 1
}

If any field is unclear, use your best guess and lower the confidence score.`;

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private groq: Groq | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = configService.get<string>('GROQ_API_KEY');
    if (apiKey) {
      this.groq = new Groq({ apiKey });
    } else {
      this.logger.warn('GROQ_API_KEY not set — AI extraction disabled');
    }
  }

  async extractReceiptData(
    imageBuffer: Buffer,
    mimeType: string,
  ): Promise<ReceiptExtractionDto> {
    if (!this.groq) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const base64Image = imageBuffer.toString('base64');
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000),
          );
        }

        const response = await this.groq.chat.completions.create({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: EXTRACTION_PROMPT },
                {
                  type: 'image_url',
                  image_url: { url: `data:${mimeType};base64,${base64Image}` },
                },
              ],
            },
          ],
          temperature: 0.1,
        });

        const text = (response.choices[0].message.content ?? '').trim();
        this.logger.debug(`Groq raw response: ${text}`);

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error(`No JSON in response: ${text.slice(0, 200)}`);
        const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;

        const validCategories = Object.values(ExpenseCategory) as string[];
        const category = validCategories.includes(parsed['category'] as string)
          ? (parsed['category'] as ExpenseCategory)
          : ExpenseCategory.OTHER;

        return {
          merchant: String(parsed['merchant'] ?? 'Unknown'),
          amount: Number(parsed['amount'] ?? 0),
          currency: String(parsed['currency'] ?? 'USD'),
          date: String(parsed['date'] ?? new Date().toISOString().split('T')[0]),
          category,
          lineItems: Array.isArray(parsed['lineItems'])
            ? (parsed['lineItems'] as Array<{ name: string; amount: number }>).map(
                (item) => ({ name: String(item.name), amount: Number(item.amount) }),
              )
            : [],
          confidence: Math.min(1, Math.max(0, Number(parsed['confidence'] ?? 0.5))),
        };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        this.logger.warn(`Groq attempt ${attempt + 1} failed: ${lastError.message}`);
      }
    }

    throw lastError ?? new Error('Failed to extract receipt data after 3 attempts');
  }
}
