import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  DEFAULT_CURRENCY,
  MAX_TOP_UP_MINOR,
  MIN_TOP_UP_MINOR,
  PaymentProvider,
  type Money,
} from '@acm/shared';
import { randomUUID } from 'node:crypto';
import { allowDevStubs } from '../config/env';
import { InMemoryLedgerService } from '../ledger/ledger.service';
import { RazorpayGateway, StripeGateway } from './payment-gateways';

export interface TopUpRecord {
  id: string;
  userId: string;
  amount: Money;
  provider: PaymentProvider;
  providerRef: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
  ledgerTxnId?: string;
  clientSecret?: string;
  createdAt: string;
}

export interface WalletBalanceDTO {
  userId: string;
  balance: Money;
  payoutPending: Money;
}

@Injectable()
export class WalletService {
  private readonly topUps = new Map<string, TopUpRecord>();
  private readonly byProviderRef = new Map<string, string>();

  constructor(
    private readonly ledger: InMemoryLedgerService,
    private readonly stripe: StripeGateway,
    private readonly razorpay: RazorpayGateway,
  ) {}

  async getBalance(userId: string, currency = DEFAULT_CURRENCY): Promise<WalletBalanceDTO> {
    const balance = await this.ledger.getBalance({ kind: 'user', userId }, currency);
    const payoutPending = await this.ledger.getBalance(
      { kind: 'user', userId, walletType: 'PAYOUT_PENDING' },
      currency,
    );
    return { userId, balance, payoutPending };
  }

  async initiateTopUp(
    userId: string,
    amountMinor: number,
    currency = DEFAULT_CURRENCY,
    provider: PaymentProvider = PaymentProvider.STRIPE,
  ): Promise<TopUpRecord> {
    if (amountMinor < MIN_TOP_UP_MINOR) {
      throw new BadRequestException(`Minimum top-up is ${MIN_TOP_UP_MINOR} minor units`);
    }
    if (amountMinor > MAX_TOP_UP_MINOR) {
      throw new BadRequestException(`Maximum top-up is ${MAX_TOP_UP_MINOR} minor units`);
    }

    const topUpId = `topup_${randomUUID()}`;
    const amount: Money = { amountMinor, currency };
    const gateway = provider === PaymentProvider.RAZORPAY ? this.razorpay : this.stripe;

    const pending: TopUpRecord = {
      id: topUpId,
      userId,
      amount,
      provider,
      providerRef: '',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.topUps.set(topUpId, pending);

    const intent = await gateway.createTopUpIntent({ topUpId, userId, amount });

    if (intent.status === 'SUCCEEDED' && allowDevStubs()) {
      return this.completeTopUpFromWebhook(topUpId, intent.providerRef);
    }

    pending.providerRef = intent.providerRef;
    pending.clientSecret = intent.clientSecret;
    this.byProviderRef.set(intent.providerRef, topUpId);

    if (intent.status !== 'SUCCEEDED' && !intent.clientSecret && !allowDevStubs()) {
      pending.status = 'FAILED';
      throw new BadRequestException('Payment provider unavailable');
    }

    return pending;
  }

  /** Idempotent — credits wallet once per topUpId / providerRef. */
  async completeTopUpFromWebhook(topUpId: string, providerRef: string): Promise<TopUpRecord> {
    let record = this.topUps.get(topUpId);
    if (!record && providerRef) {
      const id = this.byProviderRef.get(providerRef);
      if (id) record = this.topUps.get(id);
    }
    if (!record) throw new NotFoundException('Top-up not found');

    if (record.status === 'SUCCEEDED') return record;

    const txn = await this.ledger.post({
      transactionId: `wallet_topup_${record.id}`,
      reason: 'wallet_topup',
      metadata: { userId: record.userId, provider: record.provider, providerRef },
      legs: [
        { wallet: { kind: 'user', userId: record.userId }, direction: 'CREDIT', amount: record.amount },
        { wallet: { kind: 'gateway_clearing' }, direction: 'DEBIT', amount: record.amount },
      ],
    });

    record.status = 'SUCCEEDED';
    record.providerRef = providerRef;
    record.ledgerTxnId = txn.transactionId;
    return record;
  }

  listTopUps(userId: string): TopUpRecord[] {
    return [...this.topUps.values()].filter((t) => t.userId === userId);
  }

  getTopUp(id: string): TopUpRecord | undefined {
    return this.topUps.get(id);
  }
}
