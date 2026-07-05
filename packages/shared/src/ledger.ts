import type { Money } from './money.js';

// ============================================================================
// Ledger abstraction
// ============================================================================
// The MVP ledger is an append-only, double-entry table in Postgres (see the
// LedgerEntry model). This interface hides that implementation so an on-chain
// ledger (Polygon / Base) can be swapped in later without touching callers.
//
// INVARIANTS (must hold for every implementation):
//   1. Append-only: entries are never mutated or deleted.
//   2. Balanced: the legs of a single transaction net to zero per currency.
//   3. Reconcilable: wallet balances are a pure projection of the entries.
// ============================================================================

export type WalletRef =
  | { kind: 'user'; userId: string; walletType?: 'USER' | 'PAYOUT_PENDING' }
  | { kind: 'escrow' }
  | { kind: 'platform_revenue' };

export interface LedgerLeg {
  wallet: WalletRef;
  direction: 'DEBIT' | 'CREDIT';
  amount: Money;
}

export interface PostTransactionInput {
  /** Idempotency key. Re-posting the same key must be a no-op. */
  transactionId: string;
  reason: string; // "order_capture" | "escrow_hold" | "release" | "refund" | ...
  legs: LedgerLeg[];
  orderId?: string;
  metadata?: Record<string, unknown>;
}

export interface LedgerTransactionRecord {
  transactionId: string;
  reason: string;
  legs: LedgerLeg[];
  postedAt: string;
  /** Content hash of the transaction; anchored for public verification. */
  hash: string;
}

export interface Ledger {
  /** Atomically post a balanced set of legs. Idempotent on transactionId. */
  post(input: PostTransactionInput): Promise<LedgerTransactionRecord>;
  /** Current projected balance for a wallet. */
  getBalance(wallet: WalletRef, currency: string): Promise<Money>;
  /** Fetch a posted transaction (for audit / certificate anchoring). */
  getTransaction(transactionId: string): Promise<LedgerTransactionRecord | null>;
}
