# Synthetica — AI Character Marketplace

The world's first **AI Character Marketplace**: discover, license, and trade fully synthetic
AI avatars / virtual influencers.

> **Status: All phases complete.** Marketplace, Creator Studio, commission gigs, social feed,
> licensed-buyer reviews, moderation, certificate verification, and production-ready infra hooks
> (Prisma, MinIO/S3, Stripe, Meilisearch) — ready to run locally. See
> [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the full stack guide.

---

## Run locally (full stack)

```bash
pnpm install && pnpm build:shared

pnpm dev:api    # http://localhost:4000/api
pnpm dev:web    # http://localhost:3000
```

Copy `apps/web/.env.local.example` → `apps/web/.env.local` and set
`NEXT_PUBLIC_USE_MOCK_DATA=false` so creator listings, purchases, gigs, and feed use the live API.

### Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Buyer | buyer@synthetica.dev | demo1234 |
| Creator | creator@synthetica.dev | demo1234 |
| Admin | admin@synthetica.dev | demo1234 |
| Freelancer | freelancer@synthetica.dev | demo1234 |

---

## Phases (all implemented)

### Phase 1 — Marketplace (buyers)
- Cinematic homepage bento grid with filters, video hover previews, infinite scroll
- Character detail + wallet checkout (top-up → escrow → auto-release, 30% platform take)
- Buyer dashboard — licenses, signed locked-asset downloads, certificate links
- Public certificate verification at `/verify/[serial]`
- Licensed-buyer reviews on character detail pages

### Phase 2 — Creator Studio (sellers)
- `/studio` — dashboard, earnings, listing management
- 5-step listing wizard: Identity → Assets → SynthID → Rights → Moderation
- File upload to API (local `uploads/` or MinIO/S3 when `S3_ENDPOINT` is set)
- Live listings merged into marketplace catalog
- Moderation queue at `/admin/moderation` (toggle via `MODERATION_AUTO_APPROVE`)

### Phase 3 — Commission gigs
- `/gigs` — open brief board, post briefs, bid, assign freelancer
- Escrow-protected delivery flow: assign → deliver → approve / revision
- Freelancer onboarding at `/gigs/become-freelancer`
- Demo freelancer account for end-to-end testing

### Phase 4 — Social feed
- `/feed` — synthetic influencer reels and image posts
- Like posts (authenticated), paginated infinite scroll
- Posts seeded from marketplace characters

### Platform & infrastructure
- JWT auth + RBAC (buyer, creator, freelancer, admin)
- Double-entry ledger + escrow (in-memory by default; Prisma-ready)
- HMAC signed expiring URLs for gated assets
- Optional **Postgres** persistence (`USE_PRISMA=true`)
- Optional **MinIO/S3** object storage (`S3_ENDPOINT`)
- Optional **Stripe** live gateway (`STRIPE_SECRET_KEY`)
- Optional **Meilisearch** character indexing (`MEILI_HOST`)

---

## Monorepo

```
apps/web          Next.js 14 + Tailwind + Framer Motion
apps/api          NestJS REST API (all phase modules)
packages/shared   DTOs, enums, money, ledger interfaces
packages/db       Prisma schema + seed + migrations
```

---

## Optional Docker infra

```bash
pnpm infra:up
cp .env.example .env
pnpm db:generate && pnpm db:migrate && pnpm db:seed
```

Postgres seed loads 120 org-listed characters. The API defaults to **in-memory mode** so Docker is
**not required** for local dev. Set `USE_PRISMA=true` to persist users, orders, and listings.

---

## Health check

```bash
curl http://localhost:4000/api/health
```

Returns phase flags and infrastructure mode (prisma, storage, stripe, meilisearch).

See [`docs/ASSUMPTIONS.md`](docs/ASSUMPTIONS.md) for confirmed product decisions.
