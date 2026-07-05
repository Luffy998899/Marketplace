import { BadRequestException, Injectable } from '@nestjs/common';
import {
  DEFAULT_CURRENCY,
  MIN_TOP_UP_MINOR,
  PaymentProvider,
  type Money,
} from '@acm/shared';
import { randomUUID } from 'node:crypto';
import { InMemoryLedgerService } from '../ledger/ledger.service';
import { StubRazorpayGateway, StubStripeGateway } from './payment-gateways';

export interface TopUpRecord {
  id: string;
  userId: string;
  amount: Money;
  provider: PaymentProvider;
  providerRef: string;
  status: 'SUCCEEDED' | 'FAILED';
  ledgerTxnId: string;
  createdAt: string;
}

export interface WalletBalanceDTO {
  userId: string;
  balance: Money;
  payoutPending: Money;
}

// Wallet-first payment flow: buyers top up via Stripe/Razorpay, funds credit the
// USER wallet through the ledger. Purchases debit the wallet (via escrow), never
// the gateway directly.
@Injectable()
export class WalletService {
  private readonly topUps = new Map<string, TopUpRecord>();

  constructor(
    private readonly ledger: InMemoryLedgerService,
    private readonly stripe: StubStripeGateway,
    private readonly razorpay: StubRazorpayGateway,
  ) {}

  async getBalance(userId: string, currency = DEFAULT_CURRENCY): Promise<WalletBalanceDTO> {
    const balance = await this.ledger.getBalance({ kind: 'user', userId }, currency);
    const payoutPending = await this.ledger.getBalance(
      { kind: 'user', userId, walletType: 'PAYOUT_PENDING' },
      currency,
    );
    return { userId, balance, payoutPending };
  }

  async topUp(
    userId: string,
    amountMinor: number,
    currency = DEFAULT_CURRENCY,
    provider: PaymentProvider = PaymentProvider.STRIPE,
  ): Promise<TopUpRecord> {
    if (amountMinor < MIN_TOP_UP_MINOR) {
      throw new BadRequestException(`Minimum top-up is ${MIN_TOP_UP_MINOR} minor units`);
    }

    const topUpId = `topup_${randomUUID()}`;
    const amount: Money = { amountMinor, currency };
    const gateway = provider === PaymentProvider.RAZORPAY ? this.razorpay : this.stripe;

    const intent = await gateway.createTopUpIntent({ topUpId, userId, amount });
    if (intent.status !== 'SUCCEEDED') {
      throw new BadRequestException('Top-up payment failed');
    }

    const txn = await this.ledger.post({
      transactionId: `wallet_topup_${topUpId}`,
      reason: 'wallet_topup',
      metadata: { userId, provider, providerRef: intent.providerRef },
      legs: [
        { wallet: { kind: 'user', userId }, direction: 'CREDIT', amount },
        { wallet: { kind: 'gateway_clearing' }, direction: 'DEBIT', amount },
      ],
    });

    const record: TopUpRecord = {
      id: topUpId,
      userId,
      amount,
      provider,
      providerRef: intent.providerRef,
      status: 'SUCCEEDED',
      ledgerTxnId: txn.transactionId,
      createdAt: new Date().toISOString(),
    };
    this.topUps.set(topUpId, record);
    return record;
  }

  listTopUps(userId: string): TopUpRecord[] {
    return [...this.topUps.values()].filter((t) => t.userId === userId);
  }
}
