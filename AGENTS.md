# AGENTS.md

## Cursor Cloud specific instructions

Standard commands live in `README.md` (Getting started) and root `package.json` scripts. Notes below are non-obvious caveats for running/developing this pnpm monorepo (`@acm/web`, `@acm/api`, `@acm/shared`, `@acm/db`).

### Running the app
- `@acm/shared` is consumed as **compiled output** (`packages/shared/dist`, via its `main`/`exports`) — there is no source path alias. You MUST run `pnpm build:shared` before `pnpm dev:web` / `pnpm dev:api`, and re-run it after editing anything in `packages/shared`, otherwise web/api resolve stale or missing types. The startup update script already runs it once.
- `pnpm dev:web` → http://localhost:3000. `pnpm dev:api` → http://localhost:4000/api (global prefix `/api`, health at `/api/health`).
- Phase 1 needs **no infrastructure**: `@acm/api` boots with an in-memory ledger, mock-backed characters, and stubbed (auto-succeed) Stripe/Razorpay gateways. Postgres/Redis/Meilisearch/MinIO in `docker-compose.yml` (`pnpm infra:up`) and Prisma (`packages/db`) are optional, only for the persistent "real infra" path (`LEDGER_DRIVER=prisma`). No real secrets are required for local dev — all have code fallbacks.
- The web app defaults to `NEXT_PUBLIC_USE_MOCK_DATA=true` (grid renders with zero backend). Auth, wallet, orders, and certificates always call the API, so run `pnpm dev:api` to exercise the full purchase flow. Set `NEXT_PUBLIC_USE_MOCK_DATA=false` (e.g. in `apps/web/.env.local`) to also source the character grid/detail from the live API.

### Testing / demo
- Demo buyer account: `buyer@synthetica.dev` / `demo1234`.
- API purchase endpoint expects `{ characterSlug, licenseTierId }` — use the tier id (e.g. `chr_0033-t1`), NOT the license type string. Tier ids come from `GET /api/characters/:slug` (`licenseTiers[].id`).
- End-to-end flow: login → `POST /api/wallet/me/topup` → `POST /api/orders/purchase` → escrow auto-releases (30% platform commission) → certificate serial is publicly verifiable at `GET /api/certificates/verify/:serial`.

### Known pre-existing issues (not environment problems)
- `pnpm lint` fails in `apps/api` (no ESLint config file present); `apps/web` lint passes.
- `pnpm typecheck` fails in `packages/db` (`prisma/seed.ts` strict-null error). Web/API/shared typecheck pass.
