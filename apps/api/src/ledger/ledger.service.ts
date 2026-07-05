import { BadRequestException, Injectable } from '@nestjs/common';
import {
  type Ledger,
  type LedgerTransactionRecord,
  type Money,
  type PostTransactionInput,
  type WalletRef,
} from '@acm/shared';
import { createHash } from 'node:crypto';

// ============================================================================
// In-memory reference implementation of the Ledger interface.
// ============================================================================
// Decision-agnostic double-entry bookkeeping only: it enforces the balanced /
// append-only / idempotent invariants. Persistence swaps to the LedgerEntry
// Prisma model; the on-chain variant swaps to Polygon/Base. Callers are
// unaffected because they depend on the `Ledger` interface, not this class.
// ============================================================================

function walletKey(w: WalletRef): string {
  switch (w.kind) {
    case 'user':
      return `user:${w.userId}:${w.walletType ?? 'USER'}`;
    case 'escrow':
      return 'platform:escrow';
    case 'platform_revenue':
      return 'platform:revenue';
    case 'gateway_clearing':
      return 'platform:gateway_clearing';
  }
}

@Injectable()
export class InMemoryLedgerService implements Ledger {
  private readonly txns = new Map<string, LedgerTransactionRecord>();
  private readonly balances = new Map<string, number>(); // `${walletKey}:${currency}`

  async post(input: PostTransactionInput): Promise<LedgerTransactionRecord> {
    const existing = this.txns.get(input.transactionId);
    if (existing) return existing; // idempotent

    // Invariant: legs net to zero per currency.
    const perCurrency = new Map<string, number>();
    for (const leg of input.legs) {
      const signed = leg.direction === 'CREDIT' ? leg.amount.amountMinor : -leg.amount.amountMinor;
      perCurrency.set(leg.amount.currency, (perCurrency.get(leg.amount.currency) ?? 0) + signed);
    }
    for (const [currency, net] of perCurrency) {
      if (net !== 0) {
        throw new BadRequestException(
          `Unbalanced ledger transaction in ${currency}: net ${net}`,
        );
      }
    }

    for (const leg of input.legs) {
      const key = `${walletKey(leg.wallet)}:${leg.amount.currency}`;
      const delta = leg.direction === 'CREDIT' ? leg.amount.amountMinor : -leg.amount.amountMinor;
      const next = (this.balances.get(key) ?? 0) + delta;

      if (leg.wallet.kind === 'user' && leg.direction === 'DEBIT' && next < 0) {
        throw new BadRequestException('Insufficient wallet balance');
      }

      this.balances.set(key, next);
    }

    const record: LedgerTransactionRecord = {
      transactionId: input.transactionId,
      reason: input.reason,
      legs: input.legs,
      postedAt: new Date().toISOString(),
      hash: createHash('sha256')
        .update(JSON.stringify({ id: input.transactionId, legs: input.legs, reason: input.reason }))
        .digest('hex'),
    };
    this.txns.set(input.transactionId, record);
    return record;
  }

  async getBalance(wallet: WalletRef, currency: string): Promise<Money> {
    return {
      amountMinor: this.balances.get(`${walletKey(wallet)}:${currency}`) ?? 0,
      currency,
    };
  }

  async getTransaction(transactionId: string): Promise<LedgerTransactionRecord | null> {
    return this.txns.get(transactionId) ?? null;
  }
}
