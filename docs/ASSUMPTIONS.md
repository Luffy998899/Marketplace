# Confirmed product decisions

These were confirmed by the product owner on 2026-07-05. The codebase now
implements them; remaining open items are noted at the bottom.

---

## 1. Payment flow — **wallet top-up based** ✅

Buyers **top up a prepaid wallet** via Stripe or Razorpay, then spend wallet
balance on purchases. Micro-transactions ($1 one-time licenses) debit the wallet
instead of hitting the gateway per charge.

**Implementation:**
- `WalletTopUp` Prisma model + `POST /api/wallet/:userId/topup`
- `WalletService.topUp()` → gateway intent (stub auto-succeeds in dev) → ledger
  credit to `USER` wallet, balanced against `GATEWAY_CLEARING`
- `GET /api/wallet/:userId/balance` returns spendable + `PAYOUT_PENDING` balances
- Checkout (`OrdersService.purchase`) debits wallet via escrow hold — never the
  gateway directly

**Still open (low priority):**
- Currency support at launch (USD-only assumed for MVP)
- Gateway routing rule (Razorpay for INR, Stripe otherwise)

---

## 2. Escrow — **confirmed** ✅

Buyer funds are **locked in escrow custody** on purchase. Platform commission is
auto-deducted at release.

**Release policy (implemented):**
| License type | Release trigger |
|---|---|
| ONE_TIME | Auto-release immediately (instant digital delivery) |
| FULL_RIGHTS | Auto-release immediately |
| CAMPAIGN | Auto-release immediately (Phase 1; can add inspection window later) |
| COMMISSION (Phase 3) | Release on buyer-approved delivery only |

**Escrow operations (`EscrowServiceImpl`):**
- `hold` — debit buyer `USER` wallet → credit platform `ESCROW`
- `release` — debit `ESCROW` → credit `PLATFORM_REVENUE` (30%) + seller `PAYOUT_PENDING` (70%)
- `refund` — debit `ESCROW` → credit buyer `USER` wallet (full refund)
- `resolveDispute` — moderator splits per `refundToBuyerBps`; commission deducted from seller portion only

**Still open:**
- Refund window & chargeback handling with Stripe/Razorpay
- Inspection window for CAMPAIGN tier (if desired)

---

## 3. Take-rate — **flat 30%** ✅

`PLATFORM_TAKE_RATE_BPS = 3000` (30%) on **every** transaction type. Applied via
`splitByTakeRate()` at escrow release. Stored on `LicenseTier.takeRateBps` with
default `3000`.

---

## 4. Ledger — **append-only double-entry in Postgres** ✅

Confirmed model:
- `LedgerEntry` rows are append-only; legs per `transactionId` net to zero per currency
- `Wallet.balanceMinor` is a cached projection, reconcilable from entries
- `Ledger` interface in `@acm/shared` is the seam for on-chain (Polygon/Base) later
- `InMemoryLedgerService` — default for zero-infra dev
- `PrismaLedgerService` — Postgres-backed implementation (set `LEDGER_DRIVER=prisma` when DB is up)
- Rights certificates anchor `ledgerHash` for public verification (`GET /api/certificates/verify/:serial`)

**Still open:**
- Which movements are individually on-chain vs. batched/anchored (future)

---

## Checkout flow (end-to-end)

```
1. POST /wallet/:userId/topup        → gateway capture → credit USER wallet
2. POST /orders/purchase             → escrow.hold (debit USER → credit ESCROW)
3. escrow.release (auto)             → 30% PLATFORM_REVENUE + 70% seller PAYOUT_PENDING
4. Rights certificate issued         → serial + signature + ledgerHash
5. GET /certificates/verify/:serial  → public verification
```

Locked character sheets are still served only via signed expiring URLs after a
valid license — not part of this flow yet (Phase 1.x asset delivery endpoint).
