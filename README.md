# AI-Powered Indian Fashion Discovery & Price-Comparison Platform

A modern, responsive platform enabling natural-language fashion discovery across Indian homegrown brands, brand-owned stores, independent boutiques, and authorised resellers. The platform enables exact-product price comparison and budget-aware similar-style alternative discovery.

---

## Current Status: Phase 0 (Greenfield Bootstrap)

This repository currently implements **Phase 0** as specified in [`docs/MASTER_TECHNICAL_SPEC.md`](./docs/MASTER_TECHNICAL_SPEC.md).

### Completed in Phase 0:
- **npm workspaces Monorepo**: Configured with `apps/*` and `packages/*`.
- **`apps/web`**: Next.js 16 (App Router) + TypeScript + Tailwind CSS with a Phase 0 health connectivity check page.
- **`apps/api`**: Express + TypeScript with Helmet security headers, CORS, request ID tracing, standardized error handling, and `/health` & `/api/v1/health` endpoints.
- **`packages/contracts`**: Shared Zod schemas for API validation (`HealthResponseSchema`, `ErrorResponseSchema`, `PaginationQuerySchema`).
- **`packages/domain`**: Shared domain models, constants, integer minor-unit money calculations (`paise`), and price freshness determination logic.
- **Development & Release Tooling**: Standard root scripts for `build`, `lint`, `typecheck`, `test`, `dev`, `dev:web`, `dev:api`.
- **Automated Testing**: Vitest unit & integration test suites for domain logic, contract validation, and API endpoints.
- **CI / CD Pipeline**: GitHub Actions workflow (`.github/workflows/ci.yml`) enforcing lint, typecheck, tests, and build.
- **Configuration & Environment**: `.env.example`, `.gitignore`, and shared base TypeScript configuration (`tsconfig.base.json`).

> **Note**: In accordance with the Phase 0 scope, database integrations, authentication, AI adapters, web scraping, and product feature workflows are deferred to subsequent phases (Phases 1–8).

---

## Repository Structure

```text
startup/
├── apps/
│   ├── web/                         # Next.js 16 + TypeScript + Tailwind CSS
│   │   ├── src/
│   │   │   └── app/
│   │   │       ├── layout.tsx       # Root layout
│   │   │       ├── page.tsx         # Phase 0 Health check & package verification page
│   │   │       └── globals.css      # Tailwind styling
│   │   └── package.json
│   └── api/                         # Express + TypeScript API server
│       ├── src/
│       │   ├── app.ts               # Express application factory & middleware
│       │   ├── server.ts            # Server listener (Port 4000)
│       │   ├── config/              # Environment config
│       │   ├── middleware/          # Request ID & centralized error handling
│       │   └── routes/              # Health & v1 routes
│       ├── tests/                   # Integration tests with Supertest
│       └── package.json
├── packages/
│   ├── contracts/                   # Shared Zod schemas & API types
│   │   ├── src/
│   │   │   ├── health.ts
│   │   │   ├── error.ts
│   │   │   └── pagination.ts
│   │   └── package.json
│   └── domain/                      # Shared domain types, constants, money & freshness logic
│       ├── src/
│       │   ├── constants/
│       │   ├── types/
│       │   ├── money/
│       │   └── freshness/
│       └── package.json
├── docs/
│   └── MASTER_TECHNICAL_SPEC.md     # Master specification & architectural source-of-truth
├── .github/
│   └── workflows/
│       └── ci.yml                   # CI pipeline for lint, typecheck, test, build
├── .env.example                     # Environment variables template
├── .gitignore                       # Standard Git exclusions
├── tsconfig.base.json               # Shared base TypeScript configuration
├── vitest.config.ts                 # Test runner configuration
├── package.json                     # Root monorepo workspace configuration
└── README.md                        # Project documentation
```

---

## Prerequisites

- **Node.js**: `v20.x` or higher (`v24.x` tested)
- **npm**: `v10.x` or higher (`v11.x` tested)

---

## Getting Started

### 1. Clone & Install Dependencies

From the workspace root:

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to create local environment variables (if needed for custom ports/hosts):

```bash
cp .env.example .env.local
```

Default configuration:
- Frontend: `http://localhost:3000`
- API Base URL: `http://localhost:4000/api/v1`

### 3. Build Shared Packages

Compile the shared TypeScript packages (`@fashion-aggregator/domain` and `@fashion-aggregator/contracts`):

```bash
npm run build:packages
```

### 4. Running the Applications

#### Option A: Run Both Web & API Concurrently

```bash
npm run dev
```

#### Option B: Run Services Independently

In Terminal 1 (Express API):
```bash
npm run dev:api
```
API runs at [http://localhost:4000](http://localhost:4000).

In Terminal 2 (Next.js Web):
```bash
npm run dev:web
```
Web app runs at [http://localhost:3000](http://localhost:3000).

---

## Verification & Available Checks

Run all verification checks across all packages and apps from the root:

| Command | Description |
|---|---|
| `npm run typecheck` | Typechecks all packages (`packages/*`, `apps/*`) |
| `npm run lint` | Runs ESLint across workspaces |
| `npm run test` | Runs all Vitest unit and integration test suites |
| `npm run build` | Builds all packages, API, and Next.js production bundle |

---

## Health Check Endpoint Specification

- **Endpoint**: `GET /health` or `GET /api/v1/health`
- **Port**: `4000` (configurable via `API_PORT`)
- **Headers**: Includes `X-Request-Id`

### Example Response:

```json
{
  "status": "ok",
  "version": "0.1.0",
  "service": "fashion-aggregator-api",
  "environment": "development",
  "timestamp": "2026-10-16T17:00:00.000Z",
  "uptime": 14.2
}
```

---

## Next Steps

Following review of Phase 0, subsequent implementation proceeds per [`docs/MASTER_TECHNICAL_SPEC.md`](./docs/MASTER_TECHNICAL_SPEC.md):
- **Phase 1**: UX shell and demo catalogue (responsive search UI, product/offer cards, navigation).
- **Phase 2**: Database migrations and catalogue CRUD APIs.
