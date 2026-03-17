# SmartReceipt — AI-Powered Receipt Scanner & Expense Tracker

## Project Overview

Build a production-grade, full-stack receipt scanning and expense tracking web application targeting Intuit's domain (personal finance, small business expense management). The app lets users upload receipt images, uses Google Gemini Flash API for AI-powered data extraction, and provides a rich dashboard for expense analytics.

**Target Interview**: Intuit SDE-1 — demonstrate clean architecture, AI integration, and domain understanding.

**Tech Stack**:
- **Frontend**: React 18 + TypeScript, Tailwind CSS, Recharts for charts, React Router
- **Backend**: NestJS + TypeScript (modular architecture with built-in DI, decorators, guards, pipes)
- **ORM**: TypeORM (works natively with NestJS, supports decorators, migrations, repository pattern)
- **Database**: PostgreSQL (run via Docker — production-grade, same as Intuit uses)
- **Validation**: class-validator + class-transformer (NestJS native validation pipes)
- **AI**: Google Gemini Flash API (free tier, native image support)
- **File Upload**: Multer via @nestjs/platform-express
- **Build**: Vite (frontend), NestJS CLI (backend)

**Architecture Principles** (follow strictly):
- **SOLID**: NestJS enforces this by design — Modules (single responsibility), Injectable services (DI), Interfaces for contracts
- **DRY**: Shared DTOs, custom decorators, reusable pipes & guards, generic base repository
- **POEAA**: TypeORM Repository pattern for data access, Service Layer for business logic, DTOs with class-validator for API boundaries
- **Production Standards**: Exception filters, validation pipes, interceptors for response transform, structured logging (NestJS Logger), ConfigModule for env

---

## Project Structure

```
smartreceipt/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # Reusable primitives (Button, Card, Modal, Input, Badge, Spinner)
│   │   │   ├── receipt/             # ReceiptUploader, ReceiptPreview, ReceiptCard
│   │   │   ├── expense/             # ExpenseTable, ExpenseRow, ExpenseForm, CategoryBadge
│   │   │   ├── dashboard/           # SpendByCategory, MonthlyTrend, TopMerchants, BudgetProgress
│   │   │   └── layout/              # AppShell, Sidebar, Header, PageContainer
│   │   ├── pages/                   # Dashboard, Expenses, Upload, Settings
│   │   ├── hooks/                   # useExpenses, useReceipt, useBudget, useDebounce
│   │   ├── services/                # apiClient (axios wrapper), expenseService, receiptService
│   │   ├── types/                   # Shared TypeScript interfaces and DTOs
│   │   ├── utils/                   # formatCurrency, formatDate, categoryHelpers
│   │   ├── context/                 # AppContext for global state (toast notifications, user prefs)
│   │   └── App.tsx
│   └── index.html
├── server/                          # NestJS backend
│   ├── src/
│   │   ├── common/                  # Shared across modules
│   │   │   ├── decorators/          # Custom decorators (e.g., @ApiPaginatedResponse)
│   │   │   ├── dto/                 # Base DTOs (PaginationDto, ApiResponseDto)
│   │   │   ├── enums/               # ExpenseCategory, ExpenseStatus enums
│   │   │   ├── filters/             # HttpExceptionFilter (global error handler)
│   │   │   ├── interceptors/        # TransformInterceptor (wraps all responses in ApiResponse)
│   │   │   └── pipes/               # Custom validation pipes if needed
│   │   ├── config/                  # ConfigModule setup, database config, env validation
│   │   │   ├── config.module.ts
│   │   │   ├── database.config.ts   # TypeORM config factory
│   │   │   └── env.validation.ts    # Validate .env with class-validator
│   │   ├── modules/
│   │   │   ├── expense/
│   │   │   │   ├── expense.module.ts
│   │   │   │   ├── expense.controller.ts
│   │   │   │   ├── expense.service.ts
│   │   │   │   ├── expense.repository.ts    # Custom repository extending TypeORM Repository
│   │   │   │   ├── expense.entity.ts        # TypeORM entity with decorators
│   │   │   │   └── dto/
│   │   │   │       ├── create-expense.dto.ts
│   │   │   │       ├── update-expense.dto.ts  # Uses PartialType(CreateExpenseDto)
│   │   │   │       ├── filter-expense.dto.ts
│   │   │   │       └── expense-response.dto.ts
│   │   │   ├── receipt/
│   │   │   │   ├── receipt.module.ts
│   │   │   │   ├── receipt.controller.ts
│   │   │   │   ├── receipt.service.ts       # Orchestrates AI + expense creation
│   │   │   │   ├── gemini.service.ts        # Wraps Gemini API (single responsibility)
│   │   │   │   └── dto/
│   │   │   │       ├── receipt-extraction.dto.ts
│   │   │   │       └── scan-receipt-response.dto.ts
│   │   │   ├── budget/
│   │   │   │   ├── budget.module.ts
│   │   │   │   ├── budget.controller.ts
│   │   │   │   ├── budget.service.ts
│   │   │   │   ├── budget.entity.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-budget.dto.ts
│   │   │   │       └── budget-status.dto.ts
│   │   │   └── dashboard/
│   │   │       ├── dashboard.module.ts
│   │   │       ├── dashboard.controller.ts
│   │   │       ├── dashboard.service.ts     # Aggregation queries, analytics
│   │   │       └── dto/
│   │   │           └── dashboard-summary.dto.ts
│   │   ├── database/
│   │   │   ├── migrations/              # TypeORM migrations
│   │   │   └── seeds/                   # Seed data runner
│   │   ├── app.module.ts               # Root module importing all feature modules
│   │   └── main.ts                     # Bootstrap with global pipes, filters, interceptors
│   ├── test/                           # e2e tests
│   ├── nest-cli.json
│   └── tsconfig.json
├── docker-compose.yml               # PostgreSQL + optional pgAdmin
├── .env.example
├── package.json
└── README.md
```

---

## PHASE 1: Foundation & Infrastructure (Day 1 — First 4 hours)

### Goal: NestJS app running with PostgreSQL, TypeORM configured, expense CRUD working.

### Step 1.1 — Project Scaffolding
- Use NestJS CLI: `nest new server` (select npm/yarn)
- Initialize Vite React app: `npm create vite@latest client -- --template react-ts`
- Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: smartreceipt
      POSTGRES_USER: smartreceipt
      POSTGRES_PASSWORD: smartreceipt123
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"

volumes:
  pgdata:
```

- Install server dependencies:
  - `@nestjs/typeorm typeorm pg`
  - `@nestjs/config class-validator class-transformer`
  - `@nestjs/platform-express multer @types/multer`
  - `@google/generative-ai`
  - `uuid`
- Install client dependencies:
  - `react-router-dom axios recharts tailwindcss lucide-react`
- Create `.env.example`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=smartreceipt
DB_PASSWORD=smartreceipt123
DB_NAME=smartreceipt
GEMINI_API_KEY=
PORT=3001
UPLOAD_DIR=./uploads
```

### Step 1.2 — NestJS Bootstrap & Global Setup
Configure `main.ts` with:
```typescript
// main.ts — set up these globals:
// 1. ValidationPipe globally (whitelist: true, transform: true, forbidNonWhitelisted: true)
// 2. HttpExceptionFilter globally
// 3. TransformInterceptor globally (wraps all responses in { success: true, data: ... })
// 4. CORS enabled for client origin
// 5. Static file serving for uploads directory
// 6. Prefix all routes with /api
```

### Step 1.3 — Common Module (DRY — shared across all features)

**Enums** (`common/enums/`):
```typescript
export enum ExpenseCategory {
  FOOD = 'food',
  TRANSPORT = 'transport',
  OFFICE = 'office',
  UTILITIES = 'utilities',
  ENTERTAINMENT = 'entertainment',
  HEALTHCARE = 'healthcare',
  OTHER = 'other',
}

export enum ExpenseStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
}
```

**Global Exception Filter** (`common/filters/http-exception.filter.ts`):
- Catches all exceptions
- Returns consistent format: `{ success: false, error: { code: string, message: string, statusCode: number } }`
- Logs error details with NestJS Logger

**Transform Interceptor** (`common/interceptors/transform.interceptor.ts`):
- Wraps all successful responses in: `{ success: true, data: <response> }`
- This ensures every API response has a consistent shape (DRY)

**Base DTOs** (`common/dto/`):
```typescript
// PaginationDto — reusable for any paginated endpoint
export class PaginationDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit?: number = 20;
}

// ApiResponseDto<T> — generic response wrapper type
export class ApiResponseDto<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}
```

### Step 1.4 — Config Module
- Use `@nestjs/config` with `ConfigModule.forRoot()` in AppModule
- Create `database.config.ts`:
```typescript
// TypeORM config factory using ConfigService
// Returns TypeOrmModuleAsyncOptions with:
// - type: 'postgres'
// - host, port, username, password, database from env
// - entities: auto-loaded
// - synchronize: true (for dev — mention in interview you'd use migrations in prod)
// - logging: true in dev
```
- Create `env.validation.ts` — validate all required env vars exist at startup using class-validator

### Step 1.5 — Expense Module (Full CRUD)

**Entity** (`expense.entity.ts`):
```typescript
@Entity('expenses')
export class Expense {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  merchant: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'enum', enum: ExpenseCategory })
  category: ExpenseCategory;

  @Column({ type: 'date' })
  date: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  receiptImagePath: string;

  @Column({ type: 'enum', enum: ExpenseStatus, default: ExpenseStatus.PENDING })
  status: ExpenseStatus;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  aiConfidence: number;

  @Column({ default: false })
  userCorrected: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**DTOs with class-validator** (`dto/create-expense.dto.ts`):
```typescript
export class CreateExpenseDto {
  @IsString() @IsNotEmpty()
  merchant: string;

  @IsNumber() @Min(0.01)
  amount: number;

  @IsOptional() @IsString()
  currency?: string = 'USD';

  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsDateString()
  date: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  receiptImagePath?: string;
}

// UpdateExpenseDto — use NestJS PartialType:
export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {
  @IsOptional() @IsEnum(ExpenseStatus)
  status?: ExpenseStatus;
}

// FilterExpenseDto — query params for list endpoint:
export class FilterExpenseDto extends PaginationDto {
  @IsOptional() @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @IsOptional() @IsDateString()
  startDate?: string;

  @IsOptional() @IsDateString()
  endDate?: string;

  @IsOptional() @IsEnum(ExpenseStatus)
  status?: ExpenseStatus;
}
```

**Repository** (`expense.repository.ts`):
- Extend TypeORM `Repository<Expense>` using `@Injectable()` and `@InjectRepository()`
- Custom methods:
  - `findWithFilters(filters: FilterExpenseDto): Promise<{ data: Expense[]; total: number }>`
  - `findDuplicates(merchant: string, amount: number, date: string): Promise<Expense[]>`
  - `getSpendByCategory(month: string): Promise<{ category: string; amount: number }[]>`
  - `getMonthlyTrend(months: number): Promise<{ month: string; amount: number }[]>`
  - `getTopMerchants(month: string, limit: number): Promise<{ merchant: string; amount: number; count: number }[]>`
- Use QueryBuilder for complex aggregation queries (not raw SQL)

**Service** (`expense.service.ts`):
- Inject `ExpenseRepository`
- Business logic: validate no negative amounts, generate UUID, format dates
- `createFromReceipt(extraction, imagePath)` — maps AI output to CreateExpenseDto and saves
- Duplicate check before creation

**Controller** (`expense.controller.ts`):
```typescript
@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  findAll(@Query() filters: FilterExpenseDto) { ... }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) { ... }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() dto: CreateExpenseDto) { ... }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateExpenseDto) { ... }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) { ... }

  @Get('check-duplicate')
  checkDuplicate(@Query() query: { merchant: string; amount: number; date: string }) { ... }

  @Get('export')
  exportCsv(@Query() filters: FilterExpenseDto, @Res() res: Response) { ... }
}
```

**Module** (`expense.module.ts`):
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Expense])],
  controllers: [ExpenseController],
  providers: [ExpenseService],
  exports: [ExpenseService],  // Export for Dashboard module to use
})
export class ExpenseModule {}
```

### Step 1.6 — Budget Module
- Same pattern: Entity, DTOs, Service, Controller, Module
- Budget entity: `id, category, monthlyLimit, month (YYYY-MM), createdAt, updatedAt`
- Endpoints: `GET /budgets/:month`, `PUT /budgets`, `DELETE /budgets/:id`
- Export `BudgetService` for Dashboard module

### Step 1.7 — Seed Data
- Create a seed script (`database/seeds/seed.ts`) runnable via `ts-node` or a NestJS command
- Insert 50+ realistic expenses across 3 months with variety of categories and merchants
- Insert budgets for a few categories
- Add a npm script: `"seed": "ts-node src/database/seeds/seed.ts"`

---

## PHASE 2: AI Receipt Scanning (Day 1 — Next 3 hours)

### Goal: Upload receipt image → Gemini extracts data → Creates pending expense.

### Step 2.1 — Gemini Service (Single Responsibility)
```typescript
@Injectable()
export class GeminiService {
  private model: GenerativeModel;

  constructor(private configService: ConfigService) {
    const genAI = new GoogleGenerativeAI(configService.get('GEMINI_API_KEY'));
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async extractReceiptData(imageBuffer: Buffer, mimeType: string): Promise<ReceiptExtractionDto> {
    // 1. Convert buffer to base64 for Gemini
    // 2. Send with structured extraction prompt (see below)
    // 3. Parse JSON response
    // 4. Validate with class-transformer + class-validator
    // 5. Return typed ReceiptExtractionDto
    // 6. Retry logic: 2 retries with exponential backoff
  }
}
```

**Prompt** (critical — use this exact structure):
```
You are a receipt data extraction system. Analyze this receipt image and extract:
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

If any field is unclear, use your best guess and lower the confidence score.
```

**ReceiptExtractionDto**:
```typescript
export class ReceiptExtractionDto {
  merchant: string;
  amount: number;
  currency: string;
  date: string;
  category: ExpenseCategory;
  lineItems: { name: string; amount: number }[];
  confidence: number;
}
```

### Step 2.2 — Receipt Module
```typescript
@Controller('receipts')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post('scan')
  @UseInterceptors(FileInterceptor('receipt', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => cb(null, `${uuid()}-${file.originalname}`),
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/^image\/(jpeg|png|webp|heic)$/)) {
        cb(new BadRequestException('Only image files allowed'), false);
      }
      cb(null, true);
    },
  }))
  async scanReceipt(@UploadedFile() file: Express.Multer.File) {
    return this.receiptService.processReceipt(file);
  }
}
```

**ReceiptService** (orchestrator):
```typescript
@Injectable()
export class ReceiptService {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly expenseService: ExpenseService,
  ) {}

  async processReceipt(file: Express.Multer.File) {
    // 1. Read file buffer
    // 2. Call geminiService.extractReceiptData()
    // 3. Check for duplicates via expenseService
    // 4. Create expense with status PENDING
    // 5. Return { expense, extraction, isDuplicate, duplicateMatch? }
  }
}
```

**Receipt Module** imports ExpenseModule to access ExpenseService (NestJS DI across modules).

### Step 2.3 — Static File Serving
- Configure in `main.ts`: `app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' })`
- Or use `ServeStaticModule` in AppModule
- Ensure uploaded receipt images are accessible via `GET /uploads/filename.jpg`

---

## PHASE 3: Frontend Core (Day 1 — Final 3 hours)

### Goal: Working UI with upload flow, expense list, and receipt review.

### Step 3.1 — App Shell & Routing
- Clean sidebar layout with navigation: Dashboard, Expenses, Upload, Settings
- Professional design — QuickBooks-inspired aesthetic:
  - Clean white background, Intuit green primary (#2CA01C), subtle grays
  - Professional sans-serif font (Geist or similar from Google Fonts)
  - Consistent 8px spacing grid, card-based layouts with subtle shadows
- React Router with 4 pages
- Active nav highlighting, page transition

### Step 3.2 — API Client (DRY)
Create `apiClient.ts` — axios instance with:
- Base URL from env (`VITE_API_URL`)
- Response interceptor that unwraps `ApiResponse.data` automatically
- Error interceptor that extracts error messages
- Generic typed methods: `get<T>`, `post<T>`, `put<T>`, `delete<T>`

Service files: `expenseService.ts`, `receiptService.ts`, `budgetService.ts`, `dashboardService.ts`

### Step 3.3 — Receipt Upload Page (HERO FEATURE)
Make this polished — it's the first thing you demo:
- **Drag-and-drop zone**: Dashed border, upload icon, "Drop receipt here or click to browse"
- Visual states: idle → hovering → uploading (spinner) → processing (AI animation) → complete
- After AI processing, show **Receipt Review Card**:
  - **Left side**: Receipt image preview (zoomable)
  - **Right side**: Extracted data in editable form fields
  - Each field shows AI confidence badge (green ≥0.8, yellow ≥0.5, red <0.5)
  - User can edit any field before confirming
  - "Confirm" button → saves with `status: confirmed`
  - "Reject" button → marks `status: rejected`
  - Track if user changed any AI field → sets `userCorrected: true`
- Duplicate warning modal if duplicate detected
- Toast notification on success/error

### Step 3.4 — Expenses Page
- Table view: Date, Merchant, Category (colored badge), Amount, Status, Actions
- Filter bar: category dropdown, date range picker, status toggle
- Sort by clicking column headers
- Click row → expand to show receipt image + line items
- Edit (opens modal with pre-filled form) and Delete (confirmation modal) actions
- Pagination
- Empty state with illustration when no expenses

### Step 3.5 — Reusable UI Components
Build as generic, reusable primitives (DRY):
- `Button` — variants: primary, secondary, danger, ghost; sizes: sm, md, lg; loading state
- `Card` — header, body, footer slots
- `Input`, `Select` — with label, error state, helper text
- `Badge` — color variants per category
- `Modal` — overlay, close on escape, body scroll lock
- `Spinner` + skeleton loaders
- `Toast` — context-based notification system (success, error, warning)
- `EmptyState` — icon + message + optional CTA

---

## PHASE 4: Dashboard & Analytics (Day 2 — First 4 hours)

### Goal: Rich, impressive analytics dashboard.

### Step 4.1 — Dashboard Module (Backend)
```typescript
@Controller('dashboard')
export class DashboardController {
  @Get()
  getSummary(@Query('month') month?: string): Promise<DashboardSummaryDto> { ... }
}
```

**DashboardService**:
- Injects `ExpenseService` and `BudgetService`
- Aggregates:
  - Total spent this month
  - Expense count
  - Top category
  - Month-over-month % change
  - Spend by category (for pie chart)
  - Monthly trend last 6 months (for area chart)
  - Top 5 merchants (for bar chart)
  - Budget vs actual per category (for progress bars)
- ALL aggregation done in PostgreSQL via TypeORM QueryBuilder (efficient, not in JS)

**DashboardSummaryDto**:
```typescript
export class DashboardSummaryDto {
  totalSpent: number;
  expenseCount: number;
  topCategory: string;
  monthOverMonthChange: number;
  spendByCategory: { category: string; amount: number }[];
  monthlyTrend: { month: string; amount: number }[];
  topMerchants: { merchant: string; amount: number; count: number }[];
  budgetStatus: { category: string; spent: number; limit: number }[];
}
```

### Step 4.2 — Dashboard Page Layout (Frontend)
Grid layout:
- **Top Row (4 summary cards)**: Total Spent, Expense Count, Top Category, MoM Change (green/red arrow)
- **Middle Row**: Spend by Category (Recharts DonutChart), Monthly Trend (Recharts AreaChart with gradient)
- **Bottom Row**: Top Merchants (horizontal BarChart), Budget vs Actual (progress bars per category)

### Step 4.3 — Chart Components (Recharts)
- `SpendByCategoryChart` — Donut chart, custom colors per category, center label showing total
- `MonthlyTrendChart` — Area chart with gradient fill, hover tooltip with exact amounts
- `TopMerchantsChart` — Horizontal bar chart, top 5
- `BudgetProgressCard` — For each category: progress bar, "spent / limit" text, yellow at >80%, red at >100%

### Step 4.4 — Dashboard Interactivity
- Month selector (← prev | March 2026 | next →)
- Click on pie chart slice → navigate to Expenses page filtered by that category
- All charts animate on mount

---

## PHASE 5: Advanced Features (Day 2 — Next 3 hours)

### Goal: Complexity layers that show depth.

### Step 5.1 — Duplicate Detection
- In `ReceiptService.processReceipt()`, before creating expense:
  - Query for existing expenses with same merchant (fuzzy match) + amount ± $0.50 + date ± 2 days
- Return `isDuplicate: true` + `duplicateMatch: Expense` in response
- Frontend shows warning modal:
  - Side-by-side comparison of new vs existing
  - Options: "Keep Both", "Skip This One", "Replace Existing"

### Step 5.2 — Budget Management (Settings Page)
- Form to set monthly budget per category
- Table showing current budgets with edit/delete
- Budget alerts in dashboard: yellow banner at 80%, red at 100%
- NestJS `BudgetGuard` (optional) that adds budget warning headers to expense creation responses

### Step 5.3 — Export to CSV
- `GET /api/expenses/export?format=csv&startDate=X&endDate=Y`
- Stream CSV response with proper headers (`Content-Type: text/csv`, `Content-Disposition: attachment`)
- Frontend: "Export" button on Expenses page triggers browser download

### Step 5.4 — Batch Upload
- Upload page supports selecting multiple images
- Frontend sends them sequentially with progress: "Processing 2 of 5..."
- After all processed, show summary: X succeeded, Y failed, Z duplicates
- Expandable list to review each extraction individually
- Bulk "Confirm All" or individual confirm/reject

---

## PHASE 6: Polish & Interview Prep (Day 2 — Final 3 hours)

### Goal: Demo-ready app with prepared narrative.

### Step 6.1 — UI Polish
- Loading skeletons on all data-fetching pages
- Error boundaries with friendly fallback UI
- Empty states with helpful illustrations and CTAs
- Responsive layout (should work on laptop screen for demo)
- Smooth page transitions
- Favicon, page titles, "SmartReceipt" branding in sidebar

### Step 6.2 — Error Handling
- NestJS HttpExceptionFilter catching all errors globally
- React ErrorBoundary at app and page level
- Toast notifications for all CRUD actions
- Graceful fallback when Gemini API fails — show manual entry form instead
- Form validation with inline error messages

### Step 6.3 — README.md
```markdown
# SmartReceipt

AI-powered receipt scanner and expense tracker for freelancers and small businesses.

## Features
- Upload receipt images → AI extracts merchant, amount, date, category
- Interactive expense dashboard with spending analytics
- Budget management with alerts
- Duplicate receipt detection
- CSV export

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Recharts
- **Backend**: NestJS, TypeORM, PostgreSQL
- **AI**: Google Gemini Flash API

## Architecture
- NestJS modular architecture with dependency injection
- Repository pattern via TypeORM for data access
- Service layer for business logic
- DTOs with class-validator for API boundary validation
- Global exception filter and response transform interceptor

## Setup
1. Clone repo
2. `docker-compose up -d` (starts PostgreSQL)
3. `cp .env.example .env` and add your Gemini API key
4. `cd server && npm install && npm run seed && npm run start:dev`
5. `cd client && npm install && npm run dev`

## AI Usage
- Google Gemini Flash: Receipt image → structured expense data extraction
- Claude (development): Project scaffolding, TypeORM query optimization, chart component debugging
```

### Step 6.4 — Seed Realistic Demo Data
- 50+ expenses across 3 months with realistic merchants
- Set budgets so some categories are near/over limit (makes dashboard interesting)
- Add npm script: `"seed": "ts-node src/database/seeds/seed.ts"`

---

## Interview Talking Points

**"Walk us through the project in simple terms":**
> "SmartReceipt helps freelancers track expenses. You photograph a receipt, AI reads it automatically, and you get a dashboard showing where your money goes — like a simplified QuickBooks."

**"Explain the architecture":**
> "I used NestJS which enforces a modular architecture — each feature like expenses, receipts, budgets is its own module with a controller, service, and repository. Dependencies are injected, not hard-coded. TypeORM handles database access through the repository pattern, and all input is validated through DTOs with class-validator. This is the same kind of layered architecture Intuit uses at scale."

**"Where did you use AI?":**
> "Two places — Google Gemini extracts structured data from receipt images, and I used Claude to help me build the project. For example, Claude suggested the NestJS module structure, but I modified the duplicate detection logic myself because the initial fuzzy matching had edge cases with similar merchant names. I also adjusted the Gemini prompt several times to improve extraction accuracy."

**"What would you change with more time?":**
> "Add authentication with Passport.js, use TypeORM migrations instead of synchronize for production, add unit and e2e tests, deploy with Docker to AWS/GCP, and build a feedback loop where user corrections improve AI categorization over time."

---

## Commands for Claude Code

Feed each phase with:

```
Implement Phase X of the SmartReceipt project following the plan in RECEIPT_SCANNER_PROJECT_PLAN.md.

Key requirements:
- NestJS with TypeORM and PostgreSQL
- Strict TypeScript, no `any` types
- class-validator for all DTOs
- Repository pattern for data access
- Global exception filter + transform interceptor for consistent API responses
- Handle all errors gracefully
- Follow the exact folder structure in the plan
```

Run `docker-compose up -d` before starting Phase 1 to ensure PostgreSQL is ready.
