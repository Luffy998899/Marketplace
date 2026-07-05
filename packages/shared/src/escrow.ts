import type { Money } from './money.js';

// ============================================================================
// Escrow abstraction
// ============================================================================
// Buyer funds are LOCKED in the company/escrow wallet and released to the
// payee (creator/freelancer) ONLY on approved delivery. Platform commission is
// auto-deducted at release.
//
// ⚠️ OPEN PRODUCT DECISIONS (flagged for confirmation before we hardcode them):
//   - Exact release trigger for one-time / full-rights orders: instant on
//     capture, or held until buyer "accepts"? (Digital goods are typically
//     delivered instantly.)
//   - Dispute resolution split rules (partial refund %, arbitration authority).
//   - Take-rate schedule per tier (basis points).
// This interface is intentionally decision-agnostic; concrete policy lives in
// the escrow service implementation once the above are confirmed.
// ============================================================================

export interface EscrowHoldResult {
  escrowTxnId: string;
  held: Money;
}

export interface EscrowReleaseInput {
  orderId: string;
  /** Basis points taken by the platform at release (1% = 100 bps). */
  takeRateBps: number;
}

export interface EscrowReleaseResult {
  escrowTxnId: string;
  releasedToPayee: Money;
  platformCommission: Money;
}

export interface DisputeResolution {
  orderId: string;
  /** Portion (bps of held amount) refunded to buyer; remainder released. */
  refundToBuyerBps: number;
  resolvedBy: string; // moderator/arbiter user id
  notes?: string;
}

export interface EscrowService {
  /** Move captured funds from buyer wallet into escrow custody. */
  hold(orderId: string, amount: Money, payerUserId: string): Promise<EscrowHoldResult>;
  /** Release escrowed funds to the payee, deducting platform commission. */
  release(input: EscrowReleaseInput): Promise<EscrowReleaseResult>;
  /** Full refund of escrowed funds back to the buyer. */
  refund(orderId: string): Promise<EscrowHoldResult>;
  /** Split escrow per an arbitration decision. */
  resolveDispute(resolution: DisputeResolution): Promise<EscrowReleaseResult>;
}
