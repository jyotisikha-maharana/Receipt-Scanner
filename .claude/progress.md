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
| 4 | Dashboard & Analytics | ⬜ Not Started |
| 5 | Advanced Features | ⬜ Not Started |
| 6 | Polish & Interview Prep | ⬜ Not Started |

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
- `Dashboard.tsx` — placeholder (Phase 4)
- `Settings.tsx` — placeholder (Phase 5)
- `Upload.tsx` — **full hero feature**: drag-drop zone → AI scan → review card (editable fields + confidence badges) → confirm/reject → duplicate warning modal
- `Expenses.tsx` — filterable/searchable table, expandable rows (receipt image + AI confidence), edit modal, delete confirmation, CSV export, pagination

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

---

## RUNNING LOCALLY

```bash
# 1. Start Postgres
docker-compose up -d

# 2. Seed demo data (run once)
cd server && npm run seed

# 3. Start backend  http://localhost:3001/api
npm run start:dev

# 4. Start frontend  http://localhost:5173
cd ../client && npm run dev
```

---

## NEXT: PHASE 4 — Dashboard & Analytics

Branch: cut new feature branch after merging current one.

### Backend (already done in Phase 1)
- `GET /api/dashboard?month=YYYY-MM` returns full `DashboardSummaryDto`

### Frontend — `src/pages/Dashboard.tsx` (replace placeholder)
- Month selector `← March 2026 →`
- **Top row (4 summary cards)**: Total Spent, Expense Count, Top Category, MoM % Change (↑↓ colored arrow)
- **Middle row**: Spend by Category (Recharts DonutChart) + Monthly Trend (AreaChart with gradient)
- **Bottom row**: Top Merchants (horizontal BarChart) + Budget vs Actual (progress bars, yellow >80%, red >100%)
- Click pie slice → navigate to `/expenses?category=X`
- All charts animate on mount

### New components needed
- `src/components/dashboard/SpendByCategoryChart.tsx` — Recharts PieChart/Cell, custom legend
- `src/components/dashboard/MonthlyTrendChart.tsx` — Recharts AreaChart, gradient fill, tooltip
- `src/components/dashboard/TopMerchantsChart.tsx` — Recharts horizontal BarChart
- `src/components/dashboard/BudgetProgressCard.tsx` — progress bars per category
- `src/components/dashboard/SummaryCard.tsx` — stat card with icon + MoM change indicator
