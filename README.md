# Synthetica — AI Character Marketplace

The world's first **AI Character Marketplace**: discover, license, and trade fully synthetic
AI avatars / virtual influencers.

> **Status: Complete MVP.** Marketplace, buyer checkout, Creator Studio, moderation, certificate
> verification, and signed asset delivery — ready to run locally. See
> [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the full stack guide.

---

## Run locally (full stack)

```bash
pnpm install && pnpm build:shared

pnpm dev:api    # http://localhost:4000/api
pnpm dev:web    # http://localhost:3000
```

Copy `apps/web/.env.local.example` → `apps/web/.env.local` and set
`NEXT_PUBLIC_USE_MOCK_DATA=false` so creator listings and purchases use the live API.

### Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Buyer | buyer@synthetica.dev | demo1234 |
| Creator | creator@synthetica.dev | demo1234 |
| Admin | admin@synthetica.dev | demo1234 |

---

## Features

### Marketplace (buyers)
- Cinematic homepage bento grid with filters, video hover previews, infinite scroll
- Character detail + wallet checkout (top-up → escrow → auto-release, 30% platform take)
- Buyer dashboard — licenses, signed locked-asset downloads, certificate links
- Public certificate verification at `/verify/[serial]`

### Creator Studio (sellers)
- `/studio` — dashboard, earnings, listing management
- 5-step listing wizard: Identity → Assets → SynthID → Rights → Moderation
- File upload to API (`uploads/` locally; S3/R2 in production)
- Live listings merged into marketplace catalog

### Platform
- JWT auth + RBAC (buyer, creator, admin)
- Double-entry ledger + escrow (in-memory dev; Prisma-ready schema)
- Moderation queue at `/admin/moderation` (toggle via `MODERATION_AUTO_APPROVE`)
- HMAC signed expiring URLs for gated assets

---

## Monorepo

```
apps/web          Next.js 14 + Tailwind + Framer Motion
apps/api          NestJS REST API
packages/shared   DTOs, enums, money, ledger interfaces
packages/db       Prisma schema + seed (optional Docker infra)
```

---

## Optional Docker infra

```bash
pnpm infra:up
cp .env.example .env
pnpm db:generate && pnpm db:migrate && pnpm db:seed
```

Postgres seed loads 120 org-listed characters. The API defaults to in-memory mode so Docker is **not required** for local dev.

---

## Production hardening (next steps)

- Wire Prisma persistence (`USE_PRISMA` — schema complete)
- Real Stripe / Razorpay gateways
- S3 / Cloudflare R2 instead of local uploads
- Meilisearch indexing for search at scale

See [`docs/ASSUMPTIONS.md`](docs/ASSUMPTIONS.md) for confirmed product decisions.
