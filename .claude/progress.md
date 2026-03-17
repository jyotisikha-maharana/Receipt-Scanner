# SmartReceipt — Build Progress

**Project**: AI-powered receipt scanner & expense tracker
**Target**: Intuit SDE-1 interview demo
**Stack**: NestJS + TypeORM + PostgreSQL | React 18 + TypeScript + Tailwind v4 | Gemini Flash AI

---

## PHASE STATUS

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Foundation & Infrastructure | ✅ Complete |
| 2 | AI Receipt Scanning (Gemini) | ✅ Complete |
| 3 | Frontend Core | ✅ Complete |
| 4 | Dashboard & Analytics | ✅ Complete |
| 5 | Advanced Features | ✅ Complete |
| 6 | Polish & Interview Prep | ✅ Complete |

---

## POST-PHASE 6 — Fixes & Additions (Complete)

**AI Provider switched from Gemini → Groq:**
- Gemini free tier was exhausted (limit: 0 per project/account)
- Switched to Groq (`console.groq.com`) — free, 14,400 req/day, no credit card
- Model: `meta-llama/llama-4-scout-17b-16e-instruct` (full vision support)
- `GROQ_API_KEY` added to `server/.env` and `env.validation.ts`
- `groq-sdk` installed with `--legacy-peer-deps`
- `GeminiService` now uses Groq internally (class name kept for minimal diff)

**Receipt image not showing in Expenses — fixed:**
- Root cause: Windows multer stores path with backslashes (`uploads\file.jpg`)
- Frontend `split('/')` returned the whole string instead of just the filename
- Fix 1: Backend normalizes path on save — `imagePath.replace(/\\/g, '/')`
- Fix 2: Frontend uses `split(/[\\/]/)` to handle both slash types (covers existing DB data)

**Admin Reset API:**
- `POST /api/admin/reset` — truncates `expenses` + `budgets` tables
- `AdminModule` registered in `AppModule`
- Bug fixed: budget table name is `budgets` not `budget`
- UI: "Danger Zone" section in Settings page — two-step confirm before clearing

---

## PHASE 6 — Polish & Interview Prep (Complete)

**ErrorBoundary** (`src/components/ErrorBoundary.tsx`):
- Class component wrapping entire app in `main.tsx`
- Friendly fallback: icon + message + "Refresh Page" button
- Logs errors to console for debugging

**usePageTitle hook** (`src/hooks/usePageTitle.ts`):
- Sets `document.title` to `"<Page> | SmartReceipt"` on mount, resets on unmount
- Added to Dashboard, Expenses, Upload, Settings pages

**Gemini Fallback** (Upload.tsx):
- New `'manual'` upload state — triggered when AI scan throws
- Shows receipt preview + empty form fields (merchant, amount, currency, category, date, description)
- Calls `expenseService.create(...)` directly, confirms expense, refreshes recent list
- No dead ends in demo — AI failure gracefully degrades to manual entry

**index.html**: title changed from `"client"` to `"SmartReceipt"`

**Seed script fixed** (`server/src/database/seeds/seed.ts`):
- Replaced `delete({})` with `repository.clear()` (TypeORM requires explicit criteria for delete)
- `npm run seed` → 60 expenses across Jan/Feb/Mar 2026 + 8 budgets (some near/over limit)
- Budgets set intentionally tight so dashboard shows yellow/red progress bars

**README.md** — full setup guide, feature list, architecture overview, API table, AI usage

---

## PHASE 5 — Advanced Features (Complete)

- **Settings.tsx** — budget management: month selector, add/delete budgets per category, inline form
- **Expenses.tsx** — `?category=X` URL deep-link + full-size receipt image viewer (zoom hover → Modal)
- **Upload.tsx** — idle state shows last 3 confirmed expenses; refreshes after new confirmation

---

## PHASE 4 — Dashboard & Analytics (Complete)

- `SummaryCard`, `SpendByCategoryChart` (donut → navigates to `/expenses?category=X`), `MonthlyTrendChart` (area + gradient), `TopMerchantsChart` (horizontal bar), `BudgetProgressCard` (yellow >80%, red >100%)
- Dashboard.tsx: month selector, 3-row layout, all charts animate on mount

---

## PHASE 3 — Frontend Core (Complete)

- Services: apiClient (axios), expenseService, receiptService, budgetService, dashboardService
- UI Primitives: Button, Card, Input, Select, Badge, ConfidenceBadge, Modal, Spinner, EmptyState, Toast
- Layout: AppShell, Sidebar (Intuit green `#2CA01C`), Header
- Pages: Upload (full AI flow), Expenses (filterable table + edit/delete), Dashboard (placeholder → Phase 4), Settings (placeholder → Phase 5)

---

## KEY DECISIONS & NOTES

- **Tailwind v4** — use arbitrary values `bg-[#2CA01C]` in components.
- **`isolatedModules`** — `import type { Response }` required in NestJS controller for express types.
- **Static uploads** — receipt image path stored as `./uploads/filename.jpg`; frontend accesses via `/uploads/filename.jpg` (proxied).
- **Duplicate detection** — fuzzy match: same merchant + amount ±$0.50 + date ±2 days.
- **`userCorrected`** flag — set to `true` on confirm if user changed any AI-extracted field.
- **TypeORM `synchronize: true`** in dev — mention migrations in prod.
- **Gemini model** — `gemini-2.0-flash`, 3-attempt exponential backoff.
- **server/.env** — NestJS reads `.env` from `server/` directory, not project root.
- **Docker** — use `docker compose` (space, not hyphen). postgres + pgadmin on ports 5432 + 5050.
- **react-is** — must be installed separately as peer dep of recharts (`npm install react-is`).
- **Vite cache** — if recharts import fails after install, delete `node_modules/.vite` and restart.
- **Seed clear** — use `repository.clear()` not `repository.delete({})` — TypeORM blocks empty criteria.
- **Groq API** — get free key at `console.groq.com`. Gemini free tier is account-level exhausted.
- **Windows paths** — multer saves with backslashes; normalize on save with `.replace(/\\/g, '/')`.
- **groq-sdk install** — requires `--legacy-peer-deps` due to peer dep conflicts.

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

## PROJECT COMPLETE — INTERVIEW TALKING POINTS

**"Walk me through the project":**
> "SmartReceipt helps freelancers track expenses. You photograph a receipt, Gemini AI reads it automatically, and you get a dashboard showing where your money goes — like a simplified QuickBooks."

**"Explain the architecture":**
> "NestJS enforces modular architecture — each feature (expenses, receipts, budgets) is its own module with a controller, service, and repository. Dependencies are injected, not hard-coded. TypeORM handles database access through the repository pattern, and all input is validated through DTOs with class-validator. Global exception filter normalizes all errors; a transform interceptor wraps every response in `{ success, data }`."

**"Where did you use AI?":**
> "Two places — Gemini Flash extracts structured data from receipt images, and I used Claude to help build the project. I modified the duplicate detection logic myself because the initial fuzzy matching had edge cases. I also adjusted the Gemini prompt to improve extraction accuracy and added a manual fallback when the AI fails."

**"What would you change with more time?":**
> "Add authentication with Passport.js, use TypeORM migrations instead of synchronize for production, add unit and e2e tests, deploy with Docker to AWS, and build a feedback loop where user corrections improve AI categorization."
