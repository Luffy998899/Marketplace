# Synthetica — Deployment & local complete stack

This guide runs the **full marketplace** on your PC: buyer checkout, creator studio, commission gigs,
social feed, reviews, moderation, and certificate verification.

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
| Freelancer | freelancer@synthetica.dev | demo1234 |

## Full user journeys

### Buyer
1. Browse grid → open character → **Buy** license
2. Top up wallet if needed → confirm purchase
3. Dashboard → download locked assets (signed URLs)
4. Click **Verify certificate** on any license
5. Post a review on the character detail page (license holders only)

### Creator
1. Sign in → **Studio** → **New character**
2. Complete 5-step wizard (upload files or use sample URLs)
3. Submit → goes live (auto-approve on by default)
4. Earnings accumulate in **Payout pending** on studio dashboard

### Freelancer (Phase 3)
1. Sign in → **Gigs** → **Become a freelancer** (or use demo freelancer account)
2. Browse open briefs → place a bid
3. Buyer assigns you → deliver work URL → buyer approves → escrow releases

### Buyer posting a gig
1. Sign in → **Gigs** → **Post a brief**
2. Freelancers bid → assign a bid → review delivery → approve or request revision

### Social feed (Phase 4)
1. Open **Feed** from header or dashboard
2. Scroll synthetic influencer reels and image posts
3. Like posts when signed in

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

The API uses an **in-memory store** by default (zero Docker required). Set `USE_PRISMA=true` to
persist via Postgres. Set `S3_ENDPOINT` for MinIO uploads, `MEILI_HOST` for search indexing, and
`STRIPE_SECRET_KEY` for live Stripe top-ups.

## Environment reference

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_USE_MOCK_DATA` | `true` | Web grid from local mock vs API |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | API base URL |
| `USE_PRISMA` | `false` | In-memory vs Postgres persistence |
| `MODERATION_AUTO_APPROVE` | `true` | Instant live on submit vs admin queue |
| `API_PUBLIC_URL` | `http://localhost:4000` | Upload + download URL base |
| `SIGNED_URL_TTL_SECONDS` | `300` | Locked asset link expiry |
| `S3_ENDPOINT` | — | MinIO/S3 for uploads (local `uploads/` if unset) |
| `MEILI_HOST` | — | Meilisearch character search |
| `STRIPE_SECRET_KEY` | — | Live Stripe gateway (stub if unset) |

## Security (production)

Set these before any public deployment:

| Variable | Production value |
|----------|------------------|
| `ALLOW_DEV_STUBS` | `false` — disables demo users, free wallet top-ups, Google auth stub |
| `JWT_ACCESS_SECRET` | Strong random secret (required) |
| `ASSET_SIGNING_SECRET` | Separate random secret for download URL HMAC |
| `CORS_ORIGINS` | Your web origin(s) only, e.g. `https://app.example.com` |
| `MODERATION_AUTO_APPROVE` | `false` |

Locked creator uploads are stored under `uploads/private/` and are **not** served statically. Only public preview assets under `uploads/public/` are exposed at `/api/uploads/`.

## Production checklist

- [ ] Set strong `JWT_ACCESS_SECRET`
- [ ] `MODERATION_AUTO_APPROVE=false`
- [ ] `USE_PRISMA=true` + run migrations
- [ ] `S3_ENDPOINT` + bucket for object storage
- [ ] `STRIPE_SECRET_KEY` for live payments
- [ ] `MEILI_HOST` for search at scale
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
| Commissions | `/api/commissions/*` |
| Feed | `/api/feed/*` |
| Reviews | `/api/reviews/*` |
| Health | `/api/health` |

## Health check

```bash
curl http://localhost:4000/api/health | jq
```

Returns all phase flags and infrastructure mode.
