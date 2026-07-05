import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  PaymentProvider,
  type CreateTopUpIntentInput,
  type PaymentGateway,
  type PaymentIntentResult,
} from '@acm/shared';
import Stripe from 'stripe';
import { randomUUID } from 'node:crypto';
import { allowDevStubs } from '../config/env';

/** Uses Stripe when STRIPE_SECRET_KEY is set; dev stubs only when ALLOW_DEV_STUBS is enabled. */
@Injectable()
export class StripeGateway implements PaymentGateway {
  readonly provider = PaymentProvider.STRIPE;
  private readonly log = new Logger(StripeGateway.name);
  private readonly stripe: Stripe | null;

  constructor() {
    this.stripe = process.env.STRIPE_SECRET_KEY
      ? new Stripe(process.env.STRIPE_SECRET_KEY)
      : null;
  }

  get isLive(): boolean {
    return !!this.stripe;
  }

  async createTopUpIntent(input: CreateTopUpIntentInput): Promise<PaymentIntentResult> {
    if (!this.stripe) {
      if (!allowDevStubs()) {
        throw new BadRequestException('Stripe is not configured');
      }
      this.log.warn('Using dev payment stub — wallet credited without real charge');
      return {
        provider: this.provider,
        providerRef: `pi_stub_${randomUUID()}`,
        clientSecret: `stub_secret_${input.topUpId}`,
        status: 'SUCCEEDED',
      };
    }

    const intent = await this.stripe.paymentIntents.create({
      amount: input.amount.amountMinor,
      currency: input.amount.currency.toLowerCase(),
      metadata: { topUpId: input.topUpId, userId: input.userId },
      automatic_payment_methods: { enabled: true },
    });

    return {
      provider: this.provider,
      providerRef: intent.id,
      clientSecret: intent.client_secret ?? undefined,
      status: intent.status === 'succeeded' ? 'SUCCEEDED' : 'PROCESSING',
    };
  }

  async verifyWebhook(
    rawBody: string | Buffer,
    signature: string,
  ): Promise<{ providerRef: string; status: PaymentIntentResult['status']; topUpId?: string }> {
    if (!this.stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      if (!allowDevStubs()) {
        return { providerRef: 'unconfigured', status: 'FAILED' };
      }
      return { providerRef: 'stub', status: 'SUCCEEDED' };
    }
    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent;
      return {
        providerRef: pi.id,
        status: 'SUCCEEDED',
        topUpId: pi.metadata.topUpId,
      };
    }
    return { providerRef: 'unknown', status: 'FAILED' };
  }

  async refund(providerRef: string): Promise<{ ok: boolean }> {
    if (!this.stripe) return { ok: true };
    await this.stripe.refunds.create({ payment_intent: providerRef });
    return { ok: true };
  }
}

/** Dev stub — auto-succeeds only when ALLOW_DEV_STUBS is enabled. */
@Injectable()
export class RazorpayGateway implements PaymentGateway {
  readonly provider = PaymentProvider.RAZORPAY;

  async createTopUpIntent(input: CreateTopUpIntentInput): Promise<PaymentIntentResult> {
    if (!allowDevStubs()) {
      throw new BadRequestException('Razorpay is not configured');
    }
    return {
      provider: this.provider,
      providerRef: `rzp_stub_${randomUUID()}`,
      checkoutOrderId: `order_stub_${input.topUpId}`,
      status: 'SUCCEEDED',
    };
  }

  async verifyWebhook(): Promise<{
    providerRef: string;
    status: PaymentIntentResult['status'];
    topUpId?: string;
  }> {
    if (!allowDevStubs()) {
      return { providerRef: 'unconfigured', status: 'FAILED' };
    }
    return { providerRef: 'stub', status: 'SUCCEEDED' };
  }

  async refund(): Promise<{ ok: boolean }> {
    return { ok: true };
  }
}
