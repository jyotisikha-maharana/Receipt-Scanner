# SmartReceipt — Build Progress

**Project**: AI-powered receipt scanner & expense tracker
**Target**: Intuit SDE-1 interview demo
**Stack**: NestJS + TypeORM + PostgreSQL | React 18 + TypeScript + Tailwind v4 | Gemini Flash AI

---

## PHASE STATUS

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Foundation & Infrastructure | ✅ Complete |
| 2 | AI Receipt Scanning (Gemini) | ✅ Complete (backend) |
| 3 | Frontend Core | ⬜ Not Started |
| 4 | Dashboard & Analytics | ⬜ Not Started |
| 5 | Advanced Features | ⬜ Not Started |
| 6 | Polish & Interview Prep | ⬜ Not Started |

---

## PHASE 1 & 2 — COMPLETE (backend)

### All server files created and TypeScript compiles clean

**Common layer:**
- `common/enums/` — ExpenseCategory, ExpenseStatus enums
- `common/filters/http-exception.filter.ts` — global error handler, consistent `{ success, error }` shape
- `common/interceptors/transform.interceptor.ts` — wraps all responses in `{ success, data }`
- `common/dto/` — PaginationDto, ApiResponseDto

**Config:**
- `config/env.validation.ts` — validates required env vars at startup via class-validator
- `config/database.config.ts` — TypeORM async config factory from ConfigService

**Modules:**
- `modules/expense/` — Entity, 3 DTOs, Repository (QueryBuilder), Service, Controller, Module
- `modules/budget/` — Entity, DTO, Service, Controller, Module
- `modules/receipt/` — GeminiService (retry logic), ReceiptService, Controller, Module
- `modules/dashboard/` — Service (parallel Promise.all aggregation), Controller, Module

**Other:**
- `database/seeds/seed.ts` — 60 expenses across Jan/Feb/Mar 2026 + 8 budgets
- `uploads/.gitkeep` — uploads dir tracked in git
- `package.json` — `"seed"` script added

**API endpoints:**
- `GET/POST/PUT/DELETE /api/expenses` + export CSV + duplicate check
- `GET/PUT/DELETE /api/budgets`
- `POST /api/receipts/scan` — multipart upload → Gemini AI → expense
- `GET /api/dashboard?month=YYYY-MM`

---

## KEY DECISIONS & NOTES

- **Tailwind v4** — `@import "tailwindcss"` in CSS + `@tailwindcss/postcss`. No config file needed.
- **`isolatedModules` + `emitDecoratorMetadata`** — express `Response` must use `import type` in decorated methods.
- **Static file serving** — `app.useStaticAssets()` in `main.ts`. No `ServeStaticModule` (avoids conflict).
- **TypeORM `synchronize: true`** in dev — mention migrations in prod during interview.
- **Gemini model** — `gemini-2.0-flash` with 3-attempt exponential backoff retry.
- **uuid v13** — named import `import { v4 as uuidv4 } from 'uuid'` works fine.
- **Duplicate detection** — fuzzy: same merchant (case-insensitive) + amount ±$0.50 + date ±2 days.
- **`getMonthlyTrend`** — uses JS-computed `startDate` string instead of SQL INTERVAL (avoids parameterized INTERVAL issue).

---

## RUNNING LOCALLY

```bash
# 1. Start Postgres
docker-compose up -d

# 2. Seed demo data
cd server && npm run seed

# 3. Start backend (http://localhost:3001/api)
npm run start:dev

# 4. Start frontend (http://localhost:5173)
cd ../client && npm run dev
```

**Debug**: `npm run start:debug` in server → attach "Attach to NestJS" in VS Code.

---

## NEXT: PHASE 3 — Frontend Core

Branch: cut new feature branch from main after merging this one.

### Step 3.1 — App Shell & Routing
- 4 pages: Dashboard, Expenses, Upload, Settings
- Sidebar layout, React Router, active nav
- QuickBooks-inspired: Intuit green `#2CA01C`, clean whites/grays

### Step 3.2 — API Client
- `src/services/apiClient.ts` — axios with base URL, response unwrapping interceptor
- `expenseService.ts`, `receiptService.ts`, `budgetService.ts`, `dashboardService.ts`

### Step 3.3 — Reusable UI Components
- Button, Card, Input, Select, Badge, Modal, Spinner, Toast, EmptyState

### Step 3.4 — Receipt Upload Page (hero feature)
- Drag-and-drop zone with states: idle → hovering → uploading → processing → complete
- Receipt Review Card: image preview + editable extracted fields + confidence badges
- Duplicate warning modal

### Step 3.5 — Expenses Page
- Filterable table, sortable columns, expandable rows, edit/delete modals, pagination
