import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  PLATFORM_TAKE_RATE_BPS,
  splitByTakeRate,
  type DisputeResolution,
  type EscrowHoldResult,
  type EscrowRefundInput,
  type EscrowRefundResult,
  type EscrowReleaseInput,
  type EscrowReleaseResult,
  type EscrowService,
  type Money,
} from '@acm/shared';
import { InMemoryLedgerService } from './ledger.service';

interface HeldEscrow {
  amount: Money;
  payerUserId: string;
  status: 'HELD' | 'RELEASED' | 'REFUNDED';
}

// Escrow custody backed by the append-only double-entry ledger. Holds are tracked
// in-memory for Phase 1; persistence moves to the Order row once Prisma orders
// are wired end-to-end.
@Injectable()
export class EscrowServiceImpl implements EscrowService {
  private readonly holds = new Map<string, HeldEscrow>();

  constructor(private readonly ledger: InMemoryLedgerService) {}

  async hold(orderId: string, amount: Money, payerUserId: string): Promise<EscrowHoldResult> {
    const existing = this.holds.get(orderId);
    if (existing?.status === 'HELD') {
      return { escrowTxnId: `escrow_hold_${orderId}`, held: existing.amount };
    }

    const balance = await this.ledger.getBalance(
      { kind: 'user', userId: payerUserId },
      amount.currency,
    );
    if (balance.amountMinor < amount.amountMinor) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    const txn = await this.ledger.post({
      transactionId: `escrow_hold_${orderId}`,
      reason: 'escrow_hold',
      orderId,
      legs: [
        { wallet: { kind: 'user', userId: payerUserId }, direction: 'DEBIT', amount },
        { wallet: { kind: 'escrow' }, direction: 'CREDIT', amount },
      ],
    });

    this.holds.set(orderId, { amount, payerUserId, status: 'HELD' });
    return { escrowTxnId: txn.transactionId, held: amount };
  }

  async release(input: EscrowReleaseInput): Promise<EscrowReleaseResult> {
    const hold = this.requireHeld(input.orderId);
    const takeRateBps = input.takeRateBps ?? PLATFORM_TAKE_RATE_BPS;
    const { commissionMinor, sellerNetMinor } = splitByTakeRate(
      hold.amount.amountMinor,
      takeRateBps,
    );
    const currency = hold.amount.currency;
    const commission: Money = { amountMinor: commissionMinor, currency };
    const sellerNet: Money = { amountMinor: sellerNetMinor, currency };

    const txn = await this.ledger.post({
      transactionId: `escrow_release_${input.orderId}`,
      reason: 'escrow_release',
      orderId: input.orderId,
      metadata: { takeRateBps, payeeUserId: input.payeeUserId },
      legs: [
        { wallet: { kind: 'escrow' }, direction: 'DEBIT', amount: hold.amount },
        { wallet: { kind: 'platform_revenue' }, direction: 'CREDIT', amount: commission },
        {
          wallet: { kind: 'user', userId: input.payeeUserId, walletType: 'PAYOUT_PENDING' },
          direction: 'CREDIT',
          amount: sellerNet,
        },
      ],
    });

    hold.status = 'RELEASED';
    return {
      escrowTxnId: txn.transactionId,
      releasedToPayee: sellerNet,
      platformCommission: commission,
      ledgerHash: txn.hash,
    };
  }

  async refund(input: EscrowRefundInput): Promise<EscrowRefundResult> {
    const hold = this.requireHeld(input.orderId);

    const txn = await this.ledger.post({
      transactionId: `escrow_refund_${input.orderId}`,
      reason: 'escrow_refund',
      orderId: input.orderId,
      legs: [
        { wallet: { kind: 'escrow' }, direction: 'DEBIT', amount: hold.amount },
        {
          wallet: { kind: 'user', userId: hold.payerUserId },
          direction: 'CREDIT',
          amount: hold.amount,
        },
      ],
    });

    hold.status = 'REFUNDED';
    return { escrowTxnId: txn.transactionId, refunded: hold.amount, ledgerHash: txn.hash };
  }

  async resolveDispute(resolution: DisputeResolution): Promise<EscrowReleaseResult> {
    const hold = this.requireHeld(resolution.orderId);
    if (resolution.refundToBuyerBps < 0 || resolution.refundToBuyerBps > 10_000) {
      throw new BadRequestException('refundToBuyerBps must be 0..10000');
    }

    const refundMinor = Math.round(
      (hold.amount.amountMinor * resolution.refundToBuyerBps) / 10_000,
    );
    const releaseMinor = hold.amount.amountMinor - refundMinor;
    const currency = hold.amount.currency;

    const legs: Parameters<InMemoryLedgerService['post']>[0]['legs'] = [
      { wallet: { kind: 'escrow' }, direction: 'DEBIT', amount: hold.amount },
    ];

    if (refundMinor > 0) {
      legs.push({
        wallet: { kind: 'user', userId: hold.payerUserId },
        direction: 'CREDIT',
        amount: { amountMinor: refundMinor, currency },
      });
    }

    let releasedToPayee: Money = { amountMinor: 0, currency };
    let platformCommission: Money = { amountMinor: 0, currency };

    if (releaseMinor > 0) {
      const { commissionMinor, sellerNetMinor } = splitByTakeRate(
        releaseMinor,
        PLATFORM_TAKE_RATE_BPS,
      );
      platformCommission = { amountMinor: commissionMinor, currency };
      releasedToPayee = { amountMinor: sellerNetMinor, currency };
      legs.push(
        { wallet: { kind: 'platform_revenue' }, direction: 'CREDIT', amount: platformCommission },
        {
          wallet: {
            kind: 'user',
            userId: resolution.payeeUserId,
            walletType: 'PAYOUT_PENDING',
          },
          direction: 'CREDIT',
          amount: releasedToPayee,
        },
      );
    }

    const txn = await this.ledger.post({
      transactionId: `escrow_dispute_${resolution.orderId}`,
      reason: 'escrow_dispute',
      orderId: resolution.orderId,
      metadata: {
        refundToBuyerBps: resolution.refundToBuyerBps,
        resolvedBy: resolution.resolvedBy,
        notes: resolution.notes,
      },
      legs,
    });

    hold.status = 'RELEASED';
    return {
      escrowTxnId: txn.transactionId,
      releasedToPayee,
      platformCommission,
      ledgerHash: txn.hash,
    };
  }

  getHold(orderId: string): HeldEscrow | undefined {
    return this.holds.get(orderId);
  }

  private requireHeld(orderId: string): HeldEscrow {
    const hold = this.holds.get(orderId);
    if (!hold || hold.status !== 'HELD') {
      throw new NotFoundException(`No active escrow hold for order ${orderId}`);
    }
    return hold;
  }
}
