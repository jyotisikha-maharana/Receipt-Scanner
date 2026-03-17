import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Expense } from '../../modules/expense/expense.entity';
import { Budget } from '../../modules/budget/budget.entity';
import { ExpenseCategory } from '../../common/enums/expense-category.enum';
import { ExpenseStatus } from '../../common/enums/expense-status.enum';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env['DB_HOST'] ?? 'localhost',
  port: Number(process.env['DB_PORT'] ?? 5432),
  username: process.env['DB_USERNAME'] ?? 'smartreceipt',
  password: process.env['DB_PASSWORD'] ?? 'smartreceipt123',
  database: process.env['DB_NAME'] ?? 'smartreceipt',
  entities: [Expense, Budget],
  synchronize: true,
});

const MERCHANTS: Record<ExpenseCategory, string[]> = {
  [ExpenseCategory.FOOD]: ['Chipotle', 'Starbucks', 'Whole Foods', 'Pizza Hut', 'Subway', "McDonald's", "Trader Joe's"],
  [ExpenseCategory.TRANSPORT]: ['Uber', 'Lyft', 'Shell Gas', 'BP Gas', 'Metro Card', 'Delta Airlines'],
  [ExpenseCategory.OFFICE]: ['Staples', 'Office Depot', 'Amazon', 'Best Buy', 'Apple Store'],
  [ExpenseCategory.UTILITIES]: ['AT&T', 'Verizon', 'Comcast', 'Electric Bill', 'Water Bill'],
  [ExpenseCategory.ENTERTAINMENT]: ['Netflix', 'Spotify', 'AMC Theaters', 'Steam', 'PlayStation Store'],
  [ExpenseCategory.HEALTHCARE]: ['CVS Pharmacy', 'Walgreens', 'Dr. Smith Office', 'LabCorp'],
  [ExpenseCategory.OTHER]: ['USPS', 'FedEx', 'Home Depot', 'Costco'],
};

const AMOUNT_RANGES: Record<ExpenseCategory, [number, number]> = {
  [ExpenseCategory.FOOD]: [8, 80],
  [ExpenseCategory.TRANSPORT]: [15, 150],
  [ExpenseCategory.OFFICE]: [20, 300],
  [ExpenseCategory.UTILITIES]: [50, 200],
  [ExpenseCategory.ENTERTAINMENT]: [10, 60],
  [ExpenseCategory.HEALTHCARE]: [15, 200],
  [ExpenseCategory.OTHER]: [5, 100],
};

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomDate(year: number, month: number): string {
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = Math.floor(Math.random() * daysInMonth) + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  await dataSource.initialize();
  console.log('✅ Connected to database');

  await dataSource.getRepository(Expense).delete({});
  await dataSource.getRepository(Budget).delete({});
  console.log('🗑  Cleared existing data');

  const categories = Object.values(ExpenseCategory);
  const expenses: Expense[] = [];

  for (const { year, month } of [
    { year: 2026, month: 1 },
    { year: 2026, month: 2 },
    { year: 2026, month: 3 },
  ]) {
    for (let i = 0; i < 20; i++) {
      const category = randomItem(categories);
      const [min, max] = AMOUNT_RANGES[category];
      const expense = Object.assign(new Expense(), {
        id: uuidv4(),
        merchant: randomItem(MERCHANTS[category]),
        amount: randomBetween(min, max),
        currency: 'USD',
        category,
        date: randomDate(year, month),
        status: randomItem([
          ExpenseStatus.CONFIRMED,
          ExpenseStatus.CONFIRMED,
          ExpenseStatus.PENDING,
        ]),
        aiConfidence: randomBetween(0.7, 0.99),
        userCorrected: false,
      });
      expenses.push(expense);
    }
  }

  await dataSource.getRepository(Expense).save(expenses);
  console.log(`🌱 Seeded ${expenses.length} expenses`);

  const budgetData = [
    { category: ExpenseCategory.FOOD, monthlyLimit: 300, month: '2026-03' },
    { category: ExpenseCategory.TRANSPORT, monthlyLimit: 200, month: '2026-03' },
    { category: ExpenseCategory.OFFICE, monthlyLimit: 500, month: '2026-03' },
    { category: ExpenseCategory.ENTERTAINMENT, monthlyLimit: 100, month: '2026-03' },
    { category: ExpenseCategory.HEALTHCARE, monthlyLimit: 150, month: '2026-03' },
    { category: ExpenseCategory.FOOD, monthlyLimit: 300, month: '2026-02' },
    { category: ExpenseCategory.TRANSPORT, monthlyLimit: 200, month: '2026-02' },
    { category: ExpenseCategory.OFFICE, monthlyLimit: 400, month: '2026-02' },
  ];

  const budgets = budgetData.map((b) =>
    Object.assign(new Budget(), { ...b, id: uuidv4() }),
  );

  await dataSource.getRepository(Budget).save(budgets);
  console.log(`🌱 Seeded ${budgets.length} budgets`);

  await dataSource.destroy();
  console.log('✅ Seeding complete!');
}

seed().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
