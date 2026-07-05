import type { Money } from './money.js';

// ============================================================================
// Escrow
// ============================================================================
// Confirmed policy:
//   • Buyer funds are LOCKED in the company escrow wallet on purchase.
//   • Platform takes a flat 30% commission at release (PLATFORM_TAKE_RATE_BPS).
//   • Digital goods (ONE_TIME / FULL_RIGHTS): auto-release immediately after hold
//     because the deliverable (signed asset URL) is available instantly.
//   • Commissions (Phase 3): release only on buyer-approved delivery.
//   • Disputes: moderator splits held funds per refundToBuyerBps; commission is
//     deducted from the seller's released portion only.
// ============================================================================

export interface EscrowHoldResult {
  escrowTxnId: string;
  held: Money;
}

export interface EscrowReleaseInput {
  orderId: string;
  /** Seller / creator user id receiving the net payout. */
  payeeUserId: string;
  /** Defaults to PLATFORM_TAKE_RATE_BPS (30%) when omitted. */
  takeRateBps?: number;
}

export interface EscrowReleaseResult {
  escrowTxnId: string;
  releasedToPayee: Money;
  platformCommission: Money;
  ledgerHash: string;
}

export interface EscrowRefundInput {
  orderId: string;
}

export interface EscrowRefundResult {
  escrowTxnId: string;
  refunded: Money;
  ledgerHash: string;
}

export interface DisputeResolution {
  orderId: string;
  /** Portion (bps of held amount) refunded to buyer; remainder released to payee. */
  refundToBuyerBps: number;
  payeeUserId: string;
  resolvedBy: string;
  notes?: string;
}

export interface EscrowService {
  /** Debit buyer wallet → credit escrow custody. */
  hold(orderId: string, amount: Money, payerUserId: string): Promise<EscrowHoldResult>;
  /** Release escrow → platform revenue (30%) + seller payout_pending (70%). */
  release(input: EscrowReleaseInput): Promise<EscrowReleaseResult>;
  /** Full refund: escrow → buyer wallet. */
  refund(input: EscrowRefundInput): Promise<EscrowRefundResult>;
  /** Split escrow per moderator arbitration. */
  resolveDispute(resolution: DisputeResolution): Promise<EscrowReleaseResult>;
}
