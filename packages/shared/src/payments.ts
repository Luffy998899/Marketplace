import type { PaymentProvider } from './enums.js';
import type { Money } from './money.js';

// ============================================================================
// Payment gateway abstraction (dual gateway: Stripe + Razorpay)
// ============================================================================
// Confirmed policy: **wallet top-up based**. Buyers fund their USER wallet via
// Stripe or Razorpay, then spend wallet balance on purchases. Micro-transactions
// ($1 one-time licenses) debit the wallet instead of hitting the gateway per
// charge.
// ============================================================================

/** Gateway intent for crediting a buyer's wallet (not tied to an order). */
export interface CreateTopUpIntentInput {
  topUpId: string;
  userId: string;
  amount: Money;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  provider: PaymentProvider;
  providerRef: string;
  clientSecret?: string;
  checkoutOrderId?: string;
  status: 'CREATED' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
}

export interface PaymentGateway {
  readonly provider: PaymentProvider;
  createTopUpIntent(input: CreateTopUpIntentInput): Promise<PaymentIntentResult>;
  verifyWebhook(
    rawBody: string | Buffer,
    signature: string,
  ): Promise<{ providerRef: string; status: PaymentIntentResult['status']; topUpId?: string }>;
  refund(providerRef: string, amount?: Money): Promise<{ ok: boolean }>;
}
