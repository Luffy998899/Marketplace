# Open decisions & provisional assumptions

The build prompt says: **"Ask me before making any assumption about payment
flow, escrow release logic, or the ledger interface."** As an autonomous agent I
can't block on a reply, so I have **not hardcoded** these business rules.
Instead I built decision-agnostic interfaces and flagged every open question
here. The guarded stubs throw `NotImplementedException` rather than guess.

Please confirm / correct the items below and I'll wire in the concrete logic.

---

## 1. Payment flow

**Interface:** `PaymentGateway` in `packages/shared/src/payments.ts` (Stripe +
Razorpay both implement it; selection can be driven by buyer currency/geo).

Open questions:

- **Wallet vs. direct charge:** the prompt describes a "wallet/credits model for
  micro-transactions." For the $1 one-time tier, do buyers **top up a wallet**
  and spend credits, or is every purchase a **direct gateway charge**? (Direct
  charges on $1 are fee-inefficient; a prepaid wallet is the usual pattern.)
  → *Provisional assumption baked into the model, not logic:* wallet-first, with
  `WalletType.USER` balances and `Payment` rows for top-ups.
- **Currency support:** USD-only for MVP, or multi-currency at launch? (Model
  already stores `currency` per amount.)
- **Gateway routing rule:** Razorpay for INR / India, Stripe otherwise?

## 2. Escrow release logic

**Interface:** `EscrowService` in `packages/shared/src/escrow.ts`. `hold` is
implemented; `release` / `resolveDispute` are guarded stubs.

Open questions:

- **Release trigger for instant digital goods (ONE_TIME / FULL_RIGHTS):** since
  the deliverable (signed asset URL) is available immediately, do we
  **auto-release** to the seller on capture, or hold until the buyer clicks
  "accept" / after an inspection window? Commissions clearly release on
  **approved delivery** — but one-time/full-rights are ambiguous.
- **Dispute splits:** what are the allowed outcomes and who arbitrates? The
  model supports `hold / partial refund / arbitration`
  (`EscrowStatus.PARTIAL`, `DisputeResolution.refundToBuyerBps`), but the
  concrete percentages / authority are unspecified.
- **Refund window & chargeback handling.**

## 3. Take-rate (platform commission) schedule

The prompt says "higher tiers = higher take-rate" but gives no numbers. I stored
`takeRateBps` on `LicenseTier` and used these **placeholders in the seed only**
(not in any release logic):

| Tier         | Placeholder take-rate |
|--------------|-----------------------|
| ONE_TIME     | 10% (1000 bps)        |
| CAMPAIGN     | 15% (1500 bps)        |
| FULL_RIGHTS  | 25% (2500 bps)        |
| COMMISSION   | TBD                   |

→ **Please confirm the real schedule.** `splitByTakeRate()` in
`packages/shared/src/money.ts` already does the (rounding-safe) math.

## 4. Ledger interface

**Interface:** `Ledger` in `packages/shared/src/ledger.ts`.

Assumptions I made (please confirm):

- **Append-only, double-entry** in Postgres for MVP (`LedgerEntry` model): every
  transaction's legs net to zero per currency; wallet balances are a
  **projection** of the ledger, never mutated directly.
- **On-chain later:** the interface is the seam. A `PolygonLedger` / `BaseLedger`
  can implement the same `post` / `getBalance` / `getTransaction` contract with
  no caller changes. Rights certificates anchor a `ledgerHash` for public
  verification.
- Open: which fund movements must be individually on-chain vs. batched/anchored?

---

## Other provisional choices (low-risk, easy to change)

- **Package manager:** pnpm workspaces (pnpm was available in the environment).
- **Mock imagery:** seeded `picsum.photos` placeholders — clearly synthetic
  stand-ins, replaced by the watermarked CDN in production.
- **Grid layout:** responsive virtualised grid via `VirtuosoGrid` (bento feel,
  fixed 3:4 cards) for guaranteed smoothness at 1000+ items. True variable-height
  masonry can be layered in if desired.
- **Money representation:** integer **minor units** (cents) everywhere.
