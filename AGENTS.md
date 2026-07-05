# AGENTS.md

## Cursor Cloud specific instructions

This is a **pnpm monorepo** (Synthetica — AI Character Marketplace). Node 20+ and pnpm 9 are available. Standard scripts live in the root `package.json` and `README.md`; only the non-obvious caveats are captured here.

### Services

| Service | Dir | Start | Port | Notes |
|---------|-----|-------|------|-------|
| Web (`@acm/web`, Next.js 14) | `apps/web` | `pnpm dev:web` | 3000 | Buyer-facing UI. Defaults to `NEXT_PUBLIC_USE_MOCK_DATA=true`, so the character grid works with no backend. |
| API (`@acm/api`, NestJS) | `apps/api` | `pnpm dev:api` | 4000 | REST API under `/api`. Health: `GET http://localhost:4000/api/health`. |

Run both together with `pnpm dev` (parallel). Commerce flows (login, wallet, purchase, dashboard, downloads) **always** call the API regardless of the mock-data toggle, so the API must be running to test the full buyer journey.

### Non-obvious caveats

- **`pnpm build:shared` is a prerequisite for running either app.** `@acm/shared` resolves to its compiled `dist/` output (not committed), so both web and API fail to resolve it until it is built. The update script runs this on startup; re-run `pnpm build:shared` manually if you edit `packages/shared`.
- **No Docker/DB needed for the current app.** `docker-compose.yml` (Postgres/Redis/Meilisearch/MinIO) and `packages/db` (Prisma) are scaffolded but **not wired into the running API** — it uses in-memory stores. Skip infra unless specifically working on the Prisma/DB path.
- **Demo account:** `buyer@synthetica.dev` / `demo1234`. Purchases require a `licenseTierId` (fetch from `GET /api/characters/:slug`, e.g. tier `chr_0108-t2`). Payment gateways are auto-succeeding stubs.

### Known pre-existing issues (not environment problems)

- `pnpm lint` fails for `@acm/api`: it has no ESLint config file (`eslint "src/**/*.ts"` errors). Web lint (`pnpm --filter @acm/web lint`) passes.
- `pnpm typecheck` fails only in `packages/db` (`prisma/seed.ts` type error). `shared`, `api`, and `web` typecheck cleanly.
