# Synthetica — Deployment & local complete stack

This guide runs the **full marketplace** on your PC: buyer checkout, creator studio, moderation, and certificate verification.

## Quick start (recommended)

```bash
pnpm install
pnpm build:shared

# Terminal 1 — API
pnpm dev:api

# Terminal 2 — Web (live API, not mock grid)
cp apps/web/.env.local.example apps/web/.env.local
pnpm dev:web
```

Open http://localhost:3000

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Buyer | buyer@synthetica.dev | demo1234 |
| Creator | creator@synthetica.dev | demo1234 |
| Admin | admin@synthetica.dev | demo1234 |

## Full user journeys

### Buyer
1. Browse grid → open character → **Buy** license
2. Top up wallet if needed → confirm purchase
3. Dashboard → download locked assets (signed URLs)
4. Click **Verify certificate** on any license

### Creator
1. Sign in → **Studio** → **New character**
2. Complete 5-step wizard (upload files or use sample URLs)
3. Submit → goes live (auto-approve on by default)
4. Earnings accumulate in **Payout pending** on studio dashboard

### Admin / moderation
1. Set `MODERATION_AUTO_APPROVE=false` in API `.env`
2. Restart API — creator submissions stay **In review**
3. Sign in as admin → **Moderation** → approve or reject

## Optional: Docker infra (Postgres, Redis, Meilisearch, MinIO)

```bash
pnpm infra:up
cp .env.example .env
pnpm db:generate && pnpm db:migrate && pnpm db:seed
```

The API currently uses an **in-memory store** by default (zero Docker required). The Prisma schema + seed are ready when you wire `USE_PRISMA=true` for production persistence.

## Environment reference

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_USE_MOCK_DATA` | `true` | Web grid from local mock vs API |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | API base URL |
| `MODERATION_AUTO_APPROVE` | `true` | Instant live on submit vs admin queue |
| `API_PUBLIC_URL` | `http://localhost:4000` | Upload + download URL base |
| `SIGNED_URL_TTL_SECONDS` | `300` | Locked asset link expiry |

## Production checklist

- [ ] Set strong `JWT_ACCESS_SECRET`
- [ ] `MODERATION_AUTO_APPROVE=false`
- [ ] Wire Stripe/Razorpay (replace stubs in `payment-gateways.ts`)
- [ ] Persist to Postgres via Prisma
- [ ] Object storage on S3/R2 (replace local `uploads/` folder)
- [ ] Enable HTTPS + CORS allowlist

## API routes

| Area | Prefix |
|------|--------|
| Auth | `/api/auth/*` |
| Characters | `/api/characters/*` |
| Wallet | `/api/wallet/me/*` |
| Orders | `/api/orders/*` |
| Certificates | `/api/certificates/verify/:serial` |
| Creator Studio | `/api/studio/*` |
| Moderation | `/api/moderation/*` |
| Health | `/api/health` |
