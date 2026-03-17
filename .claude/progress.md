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
| 3 | Frontend Core | ✅ Complete |
| 4 | Dashboard & Analytics | ✅ Complete |
| 5 | Advanced Features | ⬜ Not Started |
| 6 | Polish & Interview Prep | ⬜ Not Started |

---

## PHASE 4 — Dashboard & Analytics (Complete)

### All components created, TypeScript compiles clean (0 errors)

**Dashboard components (`src/components/dashboard/`):**
- `SummaryCard.tsx` — stat card with icon + MoM ↑↓ colored indicator (red = increase, green = decrease in spend)
- `SpendByCategoryChart.tsx` — Recharts donut (PieChart + Cell), custom colors per category, click slice → `/expenses?category=X`
- `MonthlyTrendChart.tsx` — Recharts AreaChart with green gradient fill, animated
- `TopMerchantsChart.tsx` — Recharts horizontal BarChart, top 5 merchants
- `BudgetProgressCard.tsx` — progress bars per category; yellow >80%, red >100%, "Over budget" label

**Page: `src/pages/Dashboard.tsx`** (replaced placeholder):
- Month selector `← March 2026 →` (blocks future months)
- Row 1: 4 SummaryCards (Total Spent, Expense Count, Top Category, MoM Change)
- Row 2: SpendByCategoryChart + MonthlyTrendChart
- Row 3: TopMerchantsChart + BudgetProgressCard
- Loading state (PageSpinner), error state, all charts animate on mount

---

## PHASE 3 — Frontend Core (Complete)

### All client files created, TypeScript compiles clean (0 errors)

**Types:** `src/types/index.ts` — Expense, Budget, DashboardSummary, enums, PaginatedResponse, ExpenseFilters

**Services:**
- `apiClient.ts` — axios, base URL `/api`, unwraps `{ success, data }` envelope, normalizes errors
- `expenseService.ts` — getAll (with filters), getOne, create, update, remove, checkDuplicate, exportCsv
- `receiptService.ts` — scan (multipart POST)
- `budgetService.ts` — getAll, upsert, remove
- `dashboardService.ts` — getSummary

**Context:** `ToastContext.tsx` — global toast state, 4-second auto-dismiss, `useToast()` hook

**UI Primitives (`components/ui/`):**
- `Button` — primary/secondary/danger/ghost variants, sm/md/lg sizes, loading spinner
- `Card`, `CardHeader`, `CardTitle`
- `Input` — label, error, helperText
- `Select` — label, error, options array
- `Badge` — category (colored) + status variants; `ConfidenceBadge` (green/yellow/red %)
- `Modal` — Escape key, scroll-lock, size variants
- `Spinner`, `PageSpinner`, `SkeletonRow`
- `ToastContainer` — renders active toasts bottom-right
- `EmptyState` — icon + title + optional CTA

**Layout (`components/layout/`):**
- `Sidebar` — NavLink active states, Intuit green `#2CA01C`, SmartReceipt logo
- `Header` — title, subtitle, actions slot
- `AppShell` — Sidebar + Outlet + ToastContainer

**Utils:** `formatters.ts` — formatCurrency, formatDate, formatMonth, prevMonth, nextMonth, currentMonth, CATEGORY_OPTIONS

**Pages:**
- `Upload.tsx` — **hero feature**: drag-drop zone → AI scan → review card (editable fields + confidence badges) → confirm/reject → duplicate warning modal
- `Expenses.tsx` — filterable/searchable table, expandable rows (receipt image + AI confidence), edit modal, delete confirmation, CSV export, pagination
- `Settings.tsx` — placeholder (Phase 5)

**App.tsx** — BrowserRouter + ToastProvider + 4 routes under AppShell

---

## KEY DECISIONS & NOTES

- **Tailwind v4** — `@import "tailwindcss"` + `@theme { --color-green-brand: #2CA01C; ... }` in index.css. Use arbitrary values `bg-[#2CA01C]` in components (Tailwind v4 custom tokens work differently from v3).
- **`isolatedModules`** — `import type { Response }` required in NestJS controller for express types.
- **Static uploads** — receipt image path stored as full `./uploads/filename.jpg`; frontend accesses via `/uploads/filename.jpg` (proxied to backend).
- **Duplicate detection** — fuzzy match: same merchant + amount ±$0.50 + date ±2 days.
- **`userCorrected`** flag — set to `true` on confirm if user changed any AI-extracted field.
- **TypeORM `synchronize: true`** in dev — mention migrations in prod.
- **Gemini model** — `gemini-2.0-flash`, 3-attempt exponential backoff.
- **server/.env** — NestJS reads `.env` from `server/` directory, not project root.
- **Docker** — use `docker compose` (space), not `docker-compose`. postgres + pgadmin on ports 5432 + 5050.

---

## RUNNING LOCALLY

```bash
# 1. Start Postgres
docker compose up -d

# 2. Seed demo data (run once)
cd server && npm run seed

# 3. Start backend  http://localhost:3001/api
npm run start:dev

# 4. Start frontend  http://localhost:5173
cd ../client && npm run dev
```

---

## NEXT: PHASE 5 — Advanced Features

Branch: `feature/advanced-features` (cut after merging `feature/dashboard-analytics`)

### 5.1 — Budget Management Page (`src/pages/Settings.tsx` → replace placeholder)
- List all budgets grouped by month
- Add/edit/delete budget per category per month
- Inline form: category dropdown + monthly limit input
- Call `budgetService.upsert` / `budgetService.remove`

### 5.2 — Expense Filters Deep-link
- `Expenses.tsx` reads `?category=X` from URL on mount → pre-fills category filter
- Enables the dashboard donut click-through to work correctly

### 5.3 — Receipt Image Viewer
- In expanded expense row, clicking the receipt thumbnail opens it full-size in the Modal
- Backend already serves `/uploads/:filename` as static files

### 5.4 — Empty / Error States Polish
- Upload page: show last 3 confirmed expenses below the upload zone
- Expenses page: EmptyState with CTA to Upload when no results
- Dashboard: "No expenses this month" zero-state with CTA

### 5.5 — Seed Script Verification
- Run `npm run seed` and confirm 50+ expenses load correctly across 3 months
- Verify dashboard charts render with real data
