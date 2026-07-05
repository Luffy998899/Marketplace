import { BadRequestException, Injectable } from '@nestjs/common';
import { prisma, WalletType } from '@acm/db';
import {
  type Ledger,
  type LedgerTransactionRecord,
  type Money,
  type PostTransactionInput,
  type WalletRef,
} from '@acm/shared';
import { createHash } from 'node:crypto';

// Postgres-backed append-only double-entry ledger. Wallet balances are a cached
// projection reconcilable from LedgerEntry rows. Swap in via LEDGER_DRIVER=prisma.
@Injectable()
export class PrismaLedgerService implements Ledger {
  async post(input: PostTransactionInput): Promise<LedgerTransactionRecord> {
    const existing = await prisma.ledgerEntry.findFirst({
      where: { transactionId: input.transactionId },
    });
    if (existing) {
      const legs = await this.legsForTxn(input.transactionId);
      return this.toRecord(input.transactionId, input.reason, legs);
    }

    const perCurrency = new Map<string, number>();
    for (const leg of input.legs) {
      const signed = leg.direction === 'CREDIT' ? leg.amount.amountMinor : -leg.amount.amountMinor;
      perCurrency.set(leg.amount.currency, (perCurrency.get(leg.amount.currency) ?? 0) + signed);
    }
    for (const [currency, net] of perCurrency) {
      if (net !== 0) {
        throw new BadRequestException(`Unbalanced ledger transaction in ${currency}: net ${net}`);
      }
    }

    const walletIds = await Promise.all(
      input.legs.map((leg) => this.ensureWallet(leg.wallet, leg.amount.currency)),
    );

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < input.legs.length; i++) {
        const leg = input.legs[i]!;
        const walletId = walletIds[i]!;
        const delta =
          leg.direction === 'CREDIT' ? leg.amount.amountMinor : -leg.amount.amountMinor;

        await tx.ledgerEntry.create({
          data: {
            transactionId: input.transactionId,
            walletId,
            direction: leg.direction,
            amountMinor: leg.amount.amountMinor,
            currency: leg.amount.currency,
            reason: input.reason,
            orderId: input.orderId,
            metadata: input.metadata ? (input.metadata as object) : undefined,
          },
        });

        await tx.wallet.update({
          where: { id: walletId },
          data: { balanceMinor: { increment: delta } },
        });
      }
    });

    return this.toRecord(input.transactionId, input.reason, input.legs);
  }

  async getBalance(wallet: WalletRef, currency: string): Promise<Money> {
    const id = await this.ensureWallet(wallet, currency);
    const w = await prisma.wallet.findUniqueOrThrow({ where: { id } });
    return { amountMinor: w.balanceMinor, currency };
  }

  async getTransaction(transactionId: string): Promise<LedgerTransactionRecord | null> {
    const first = await prisma.ledgerEntry.findFirst({ where: { transactionId } });
    if (!first) return null;
    const legs = await this.legsForTxn(transactionId);
    return this.toRecord(transactionId, first.reason, legs);
  }

  private async legsForTxn(transactionId: string) {
    const rows = await prisma.ledgerEntry.findMany({
      where: { transactionId },
      include: { wallet: true },
    });
    return rows.map((row) => ({
      wallet: this.refFromWallet(row.wallet),
      direction: row.direction as 'DEBIT' | 'CREDIT',
      amount: { amountMinor: row.amountMinor, currency: row.currency },
    }));
  }

  private refFromWallet(w: { type: WalletType; ownerUserId: string | null }): WalletRef {
    switch (w.type) {
      case WalletType.ESCROW:
        return { kind: 'escrow' };
      case WalletType.PLATFORM_REVENUE:
        return { kind: 'platform_revenue' };
      case WalletType.GATEWAY_CLEARING:
        return { kind: 'gateway_clearing' };
      case WalletType.PAYOUT_PENDING:
        return { kind: 'user', userId: w.ownerUserId!, walletType: 'PAYOUT_PENDING' };
      default:
        return { kind: 'user', userId: w.ownerUserId!, walletType: 'USER' };
    }
  }

  private async ensureWallet(ref: WalletRef, currency: string): Promise<string> {
    const { type, ownerUserId } = this.toWalletType(ref);
    const existing = await prisma.wallet.findFirst({
      where: { type, ownerUserId, currency },
    });
    if (existing) return existing.id;
    const created = await prisma.wallet.create({
      data: { type, ownerUserId, currency },
    });
    return created.id;
  }

  private toWalletType(ref: WalletRef): { type: WalletType; ownerUserId: string | null } {
    switch (ref.kind) {
      case 'escrow':
        return { type: WalletType.ESCROW, ownerUserId: null };
      case 'platform_revenue':
        return { type: WalletType.PLATFORM_REVENUE, ownerUserId: null };
      case 'gateway_clearing':
        return { type: WalletType.GATEWAY_CLEARING, ownerUserId: null };
      case 'user':
        return {
          type: ref.walletType === 'PAYOUT_PENDING' ? WalletType.PAYOUT_PENDING : WalletType.USER,
          ownerUserId: ref.userId,
        };
    }
  }

  private toRecord(
    transactionId: string,
    reason: string,
    legs: PostTransactionInput['legs'],
  ): LedgerTransactionRecord {
    return {
      transactionId,
      reason,
      legs,
      postedAt: new Date().toISOString(),
      hash: createHash('sha256')
        .update(JSON.stringify({ id: transactionId, legs, reason }))
        .digest('hex'),
    };
  }
}
