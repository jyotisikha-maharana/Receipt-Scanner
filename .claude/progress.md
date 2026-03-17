# SmartReceipt — Build Progress

**Project**: AI-powered receipt scanner & expense tracker
**Target**: Intuit SDE-1 interview demo
**Stack**: NestJS + TypeORM + PostgreSQL | React 18 + TypeScript + Tailwind v4 | Gemini Flash AI

---

## PHASE STATUS

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Foundation & Infrastructure | 🟡 In Progress |
| 2 | AI Receipt Scanning (Gemini) | ⬜ Not Started |
| 3 | Frontend Core | ⬜ Not Started |
| 4 | Dashboard & Analytics | ⬜ Not Started |
| 5 | Advanced Features | ⬜ Not Started |
| 6 | Polish & Interview Prep | ⬜ Not Started |

---

## PHASE 1 — Foundation & Infrastructure

### ✅ Done
- NestJS server scaffolded at `server/` (`nest new server --strict`)
- React + Vite client scaffolded at `client/` (`create vite@latest --template react-ts`)
- `docker-compose.yml` — PostgreSQL 16 on port 5432, pgAdmin on port 5050
- `.env` / `.env.example` — DB creds, Gemini API key placeholder, PORT=3001
- Server deps installed: `@nestjs/typeorm typeorm pg @nestjs/config class-validator class-transformer @nestjs/platform-express multer @types/multer @google/generative-ai uuid @nestjs/serve-static @nestjs/mapped-types`
- Client deps installed: `react-router-dom axios recharts lucide-react tailwindcss @tailwindcss/postcss autoprefixer`
- `server/src/main.ts` — configured with ValidationPipe, CORS, static assets, TransformInterceptor, global prefix `/api`
- `server/src/common/interceptors/transform.interceptor.ts` — wraps all responses in `{ success: true, data }`
- `client/vite.config.ts` — proxy `/api` and `/uploads` to `localhost:3001`
- `client/postcss.config.js` — Tailwind v4 via `@tailwindcss/postcss`
- `client/src/index.css` — `@import "tailwindcss"` added
- `.vscode/launch.json` — debug configs for NestJS

### 🔲 Still TODO (Phase 1)
- `server/src/common/enums/` — ExpenseCategory, ExpenseStatus enums
- `server/src/common/filters/http-exception.filter.ts` — global error handler
- `server/src/common/dto/` — PaginationDto, ApiResponseDto
- `server/src/config/env.validation.ts` — class-validator env check at startup
- `server/src/config/database.config.ts` — TypeORM async config factory
- `server/src/app.module.ts` — uncomment TypeORM + feature module imports once those files exist
- `server/src/modules/expense/` — Entity, DTOs, Repository, Service, Controller, Module
- `server/src/modules/budget/` — Entity, DTOs, Service, Controller, Module
- `server/src/modules/receipt/` — GeminiService, ReceiptService, Controller, Module
- `server/src/modules/dashboard/` — Service, Controller, Module
- `server/src/database/seeds/seed.ts` — 50+ realistic expenses across 3 months
- `server/uploads/.gitkeep` — ensure uploads dir exists

---

## KEY DECISIONS & NOTES

- **Tailwind v4** installed (not v3) — uses `@import "tailwindcss"` in CSS + `@tailwindcss/postcss` postcss plugin. No `tailwind.config.js` needed. `@tailwindcss/vite` not compatible with Vite 8 yet.
- **uuid v13** installed — named import `import { v4 as uuidv4 } from 'uuid'` still works.
- **`app.module.ts`** currently has feature module imports commented out (TODO) — uncomment as each module is created.
- **`main.ts`** has `HttpExceptionFilter` commented out (TODO) — uncomment when `http-exception.filter.ts` is created.
- **Static file serving** — using `app.useStaticAssets()` in `main.ts`, NOT `ServeStaticModule`, to avoid double-serving conflict.
- **TypeORM synchronize: true** in dev — note in interview that migrations would be used in prod.
- **Gemini model**: `gemini-2.0-flash`
- **DB**: PostgreSQL via Docker. Credentials in `.env`.

---

## RUNNING LOCALLY

```bash
# 1. Start Postgres
docker-compose up -d

# 2. Start backend
cd server && npm run start:dev   # http://localhost:3001/api

# 3. Start frontend
cd client && npm run dev          # http://localhost:5173

# 4. Seed data (once Phase 1 complete)
cd server && npm run seed
```

**Debug**: Run `npm run start:debug` in server, then attach VS Code via "Attach to NestJS" in launch.json.

---

## NEXT SESSION — START HERE

Continue **Phase 1**: create all the TODO items listed above in order. Once `common/enums`, `common/filters`, `common/dto`, and `config/` exist, uncomment the TODO lines in `app.module.ts` and `main.ts`.
