# Synthetica — AI Character Marketplace

The world's first **AI Character Marketplace**: a platform where fully synthetic
AI avatars / virtual influencers are discovered, licensed, and traded. Humans
only **list** and **buy** — the platform automates discovery, licensing, payment
custody (escrow), and delivery.

> **Status: Phase 1 (MVP) scaffold.** This session delivers the monorepo
> structure, the full Prisma data model, and a working, virtualised homepage
> grid + character detail pages backed by a 120-character mock dataset. Payment
> capture, escrow release logic, and the on-chain ledger are intentionally left
> as documented interfaces pending product confirmation — see
> [`docs/ASSUMPTIONS.md`](docs/ASSUMPTIONS.md).

---

## Monorepo structure

```
.
├── apps/
│   ├── web/                 # Next.js 14 (App Router) + Tailwind + Framer Motion
│   │   └── src/
│   │       ├── app/         # routes: / (grid), /character/[slug] (detail)
│   │       ├── components/  # CharacterGrid (virtualised), CharacterCard, FilterRail, …
│   │       ├── lib/data.ts  # data source abstraction (mock ⇄ live API)
│   │       └── store/       # Zustand filter state
│   └── api/                 # NestJS (REST). characters + ledger/escrow modules
│       └── src/
│           ├── characters/  # list + detail (mock-backed, DTO-identical to web)
│           └── ledger/      # in-memory double-entry ledger + escrow scaffold
├── packages/
│   ├── shared/              # framework-agnostic types, enums, DTOs, money helpers,
│   │   └── src/             # and the Ledger / Escrow / PaymentGateway interfaces
│   └── db/                  # Prisma schema (source of truth) + client + seed
│       └── prisma/schema.prisma
├── docker-compose.yml       # postgres + redis + meilisearch + minio (S3/R2 stand-in)
├── docs/ASSUMPTIONS.md      # open product decisions flagged for confirmation
├── pnpm-workspace.yaml
└── .env.example
```

### Package graph

- `@acm/shared` — zero-dependency (except zod) domain layer. Both the web app and
  the API import DTOs, enums, money math, and the ledger/escrow/payment
  **interfaces** from here so contracts never drift.
- `@acm/db` — Prisma schema + generated client + seed. The single source of truth
  for the data model.
- `@acm/web` / `@acm/api` — apps.

---

## Tech stack

| Concern      | Choice |
|--------------|--------|
| Frontend     | Next.js 14 (App Router), React 18, TypeScript, Tailwind, Framer Motion |
| Grid/Media   | `react-virtuoso` (`VirtuosoGrid`, window-scroll) + `next/image` blur-up |
| State/Data   | React Query (server state) + Zustand (filter state) |
| Backend      | NestJS (REST; WebSocket + Socket.io planned for realtime) |
| DB / Cache   | PostgreSQL (Prisma) + Redis |
| Search       | Meilisearch |
| Storage      | S3 / Cloudflare R2 with **signed, expiring URLs** for gated assets |
| Payments     | Stripe + Razorpay (dual gateway) behind a `PaymentGateway` interface |
| Ledger       | In-DB double-entry for MVP, abstracted behind a `Ledger` interface |
| Auth         | JWT + Google OAuth + RBAC (models in place; endpoints Phase 1.x) |

---

## Getting started

```bash
# 1. install
pnpm install

# 2. build the shared domain package (web/api consume its compiled output)
pnpm build:shared

# 3a. run the web app with the local mock dataset (no backend/DB needed)
pnpm dev:web            # http://localhost:3000

# 3b. (optional) run the API too — identical DTO contract
pnpm dev:api            # http://localhost:4000/api

# 4. (optional) real infra + seeded DB of 120 live characters
pnpm infra:up           # postgres, redis, meilisearch, minio
cp .env.example .env
pnpm db:generate && pnpm db:migrate && pnpm db:seed
```

The web app defaults to `NEXT_PUBLIC_USE_MOCK_DATA=true`, so the homepage grid
works immediately with zero backend. Set it to `false` to hit the NestJS API.

---

## Phase 1 scope (this session)

Delivered:

- ✅ Monorepo scaffold (web + api + shared + db)
- ✅ Full Prisma data model for **all** core entities (Users/RBAC, Characters,
  assets, LicenseTiers, Orders, RightsCertificates, Wallet/Ledger, Payments,
  Commission engine, Reviews, Listing checklist, Moderation, and the AI-feed
  social layer) — see [`packages/db/prisma/schema.prisma`](packages/db/prisma/schema.prisma).
- ✅ Homepage grid: virtualised (smooth at 1000+), skeleton + blur-up, hover
  reveal, and filters (gender, ethnicity, niche, style, license type, rating,
  availability) + search + sort.
- ✅ Character detail page: gallery, license tiers, gated/locked sheet section,
  Buy / Make Offer / Commission CTAs, SynthID badge.
- ✅ 120-character deterministic mock dataset + DB seed.
- ✅ Ledger + escrow + payment **interfaces** with an in-memory double-entry
  ledger reference implementation.

Deferred pending confirmation (see `docs/ASSUMPTIONS.md`): ~~live payment capture,
escrow **release trigger**, dispute split rules, and the take-rate schedule.~~

**Confirmed & wired (2026-07-05):**
- Wallet top-up payment flow (Stripe/Razorpay → USER wallet)
- Escrow hold → auto-release for digital goods
- Flat **30%** platform take-rate
- Append-only double-entry ledger (`InMemoryLedgerService` + `PrismaLedgerService`)

### Key rules honoured in the model/UI

- **Locked sheets** are referenced by storage key only and never appear in DTOs
  or the DOM before purchase (`AssetKind` locked kinds + gated detail section).
- **Previews** are watermarked/downsampled; the card + detail UI label them.
- **Rights certificate** + **ledger** models are append-only and verifiable.
- **SynthID / watermark** fingerprint fields on every character.
- **Fully synthetic only**: signed IP declaration fields on `ListingChecklist`.
```
