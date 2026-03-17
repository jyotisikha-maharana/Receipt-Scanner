# SmartReceipt

AI-powered receipt scanner and expense tracker for freelancers and small businesses.

Upload a receipt image → Gemini Flash AI extracts merchant, amount, date, and category → expenses land in an analytics dashboard automatically.

---

## Features

- **AI Receipt Scanning** — upload JPEG/PNG/WEBP/HEIC; Gemini Flash extracts structured data in seconds
- **Manual Fallback** — if AI fails, a manual entry form appears immediately (no dead ends)
- **Duplicate Detection** — fuzzy match (same merchant + amount ±$0.50 + date ±2 days) warns before confirming
- **Expense Dashboard** — spend by category (donut), monthly trend (area chart), top merchants (bar chart)
- **Budget Management** — set monthly limits per category; progress bars turn yellow >80%, red >100%
- **Expense Table** — search, filter by category/status/date, expandable rows with receipt image viewer, CSV export
- **Confidence Badges** — every AI-extracted expense shows confidence %; user corrections are tracked

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS v4, Recharts, React Router v6 |
| Backend | NestJS, TypeORM, PostgreSQL |
| AI | Google Gemini Flash 2.0 API |
| File Upload | Multer via @nestjs/platform-express |
| Validation | class-validator + class-transformer |
| Infrastructure | Docker (PostgreSQL + pgAdmin) |

---

## Architecture

```
client/src/
├── components/
│   ├── ui/          # Button, Card, Input, Select, Badge, Modal, Spinner, EmptyState
│   ├── layout/      # AppShell, Sidebar, Header
│   └── dashboard/   # SummaryCard, SpendByCategoryChart, MonthlyTrendChart, TopMerchantsChart, BudgetProgressCard
├── pages/           # Dashboard, Expenses, Upload, Settings
├── services/        # apiClient (axios), expenseService, receiptService, budgetService, dashboardService
├── hooks/           # usePageTitle
├── context/         # ToastContext
└── types/           # Shared TypeScript interfaces

server/src/
├── modules/
│   ├── expense/     # Controller → Service → Repository → Entity
│   ├── receipt/     # ReceiptService (orchestrates) + GeminiService (single responsibility)
│   ├── budget/      # Controller → Service → Entity
│   └── dashboard/   # Aggregation queries & analytics
├── common/
│   ├── filters/     # HttpExceptionFilter — global error handler
│   ├── interceptors/# TransformInterceptor — wraps all responses in { success, data }
│   ├── dto/         # PaginationDto, ApiResponseDto
│   └── enums/       # ExpenseCategory, ExpenseStatus
└── config/          # ConfigModule, TypeORM factory, env validation (class-validator)
```

**Design patterns used:**
- NestJS Modules — single responsibility per feature
- Repository pattern via TypeORM for data access
- Service layer for business logic
- DTOs with class-validator at all API boundaries
- Dependency injection throughout (no `new` in business logic)
- Global exception filter + response transform interceptor

---

## Local Setup

**Prerequisites:** Node 18+, Docker Desktop

```bash
# 1. Clone and install dependencies
git clone <repo-url> && cd smartreceipt
cd server && npm install
cd ../client && npm install

# 2. Environment
cp .env.example server/.env
# Add your GEMINI_API_KEY to server/.env

# 3. Start PostgreSQL
docker compose up -d

# 4. Seed demo data (60 expenses across Jan–Mar 2026 + budgets)
cd server && npm run seed

# 5. Start backend  →  http://localhost:3001/api
npm run start:dev

# 6. Start frontend  →  http://localhost:5173
cd ../client && npm run dev
```

**Get a free Gemini API key:** aistudio.google.com → Create API key

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/receipts/scan` | Upload image → AI extraction + expense creation |
| GET | `/api/expenses` | List with filters (category, status, date range, search, pagination) |
| POST | `/api/expenses` | Create expense manually |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/expenses/export` | Download filtered expenses as CSV |
| GET | `/api/dashboard` | Aggregated analytics for a given month |
| GET | `/api/budgets` | List budgets (optionally filtered by month) |
| PUT | `/api/budgets` | Create or update a budget |
| DELETE | `/api/budgets/:id` | Delete a budget |

---

## AI Usage

- **Google Gemini Flash 2.0** — Receipt image → structured JSON (merchant, amount, currency, date, category, line items, confidence score). 3-attempt exponential backoff on transient failures.
- **Claude (development)** — Project scaffolding, TypeORM query patterns, chart component implementation. All business logic (duplicate detection fuzzy matching, confidence thresholds, seed data) written and reviewed manually.
