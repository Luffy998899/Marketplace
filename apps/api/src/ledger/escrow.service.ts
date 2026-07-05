import { Injectable, NotImplementedException } from '@nestjs/common';
import { splitByTakeRate, type EscrowHoldResult, type EscrowReleaseInput, type EscrowReleaseResult, type EscrowService, type Money } from '@acm/shared';
import { InMemoryLedgerService } from './ledger.service';

// ============================================================================
// Escrow service scaffold.
// ============================================================================
// `hold`/`refund` are decision-agnostic and implemented against the ledger.
// `release` and `resolveDispute` depend on OPEN PRODUCT DECISIONS and are left
// as guarded stubs so we don't silently hardcode policy:
//
//   • Release trigger for ONE_TIME / FULL_RIGHTS (instant vs. buyer-accept)
//   • Dispute split rules and arbitration authority
//   • Take-rate schedule per license tier
//
// Once confirmed, fill in `release`/`resolveDispute`. The commission math helper
// (`splitByTakeRate`) is already available and unit-testable.
// ============================================================================

@Injectable()
export class EscrowServiceImpl implements EscrowService {
  constructor(private readonly ledger: InMemoryLedgerService) {}

  async hold(orderId: string, amount: Money, payerUserId: string) {
    const txn = await this.ledger.post({
      transactionId: `escrow_hold_${orderId}`,
      reason: 'escrow_hold',
      orderId,
      legs: [
        { wallet: { kind: 'user', userId: payerUserId }, direction: 'DEBIT', amount },
        { wallet: { kind: 'escrow' }, direction: 'CREDIT', amount },
      ],
    });
    return { escrowTxnId: txn.transactionId, held: amount };
  }

  async release(_input: EscrowReleaseInput): Promise<EscrowReleaseResult> {
    // Commission math is ready via splitByTakeRate(); the *trigger* and payout
    // wallet routing await product confirmation. Guarded to avoid assumptions.
    void splitByTakeRate;
    throw new NotImplementedException(
      'Escrow release policy pending product confirmation (release trigger + take-rate schedule).',
    );
  }

  async refund(orderId: string): Promise<EscrowHoldResult> {
    // Reverse of hold: escrow -> buyer. Buyer identity resolved from the order
    // once the orders module is wired to persistence.
    throw new NotImplementedException(`refund(${orderId}) pending orders module wiring.`);
  }

  async resolveDispute(): Promise<EscrowReleaseResult> {
    throw new NotImplementedException('Dispute resolution rules pending product confirmation.');
  }
}
