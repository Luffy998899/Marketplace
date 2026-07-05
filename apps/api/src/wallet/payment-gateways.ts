import { Injectable } from '@nestjs/common';
import {
  PaymentProvider,
  type CreateTopUpIntentInput,
  type PaymentGateway,
  type PaymentIntentResult,
} from '@acm/shared';
import { randomUUID } from 'node:crypto';

/** Dev stub — auto-succeeds top-ups. Swap for StripeGateway in production. */
@Injectable()
export class StubStripeGateway implements PaymentGateway {
  readonly provider = PaymentProvider.STRIPE;

  async createTopUpIntent(input: CreateTopUpIntentInput): Promise<PaymentIntentResult> {
    return {
      provider: this.provider,
      providerRef: `pi_stub_${randomUUID()}`,
      clientSecret: `stub_secret_${input.topUpId}`,
      status: 'SUCCEEDED',
    };
  }

  async verifyWebhook(): Promise<{
    providerRef: string;
    status: PaymentIntentResult['status'];
    topUpId?: string;
  }> {
    return { providerRef: 'stub', status: 'SUCCEEDED' };
  }

  async refund(): Promise<{ ok: boolean }> {
    return { ok: true };
  }
}

/** Dev stub — auto-succeeds top-ups. Swap for RazorpayGateway in production. */
@Injectable()
export class StubRazorpayGateway implements PaymentGateway {
  readonly provider = PaymentProvider.RAZORPAY;

  async createTopUpIntent(input: CreateTopUpIntentInput): Promise<PaymentIntentResult> {
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
    return { providerRef: 'stub', status: 'SUCCEEDED' };
  }

  async refund(): Promise<{ ok: boolean }> {
    return { ok: true };
  }
}
