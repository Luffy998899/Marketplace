import type { PaymentProvider } from './enums.js';
import type { Money } from './money.js';

// ============================================================================
// Payment gateway abstraction (dual gateway: Stripe + Razorpay)
// ============================================================================
// Both providers implement this interface so checkout code is provider-neutral.
// Selection can be driven by buyer geography / currency at runtime.
// Phase 1 ships stub implementations; live keys wire in real gateways later.
// ============================================================================

export interface CreatePaymentIntentInput {
  orderId: string;
  amount: Money;
  buyerUserId: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  provider: PaymentProvider;
  providerRef: string;
  clientSecret?: string; // Stripe
  checkoutOrderId?: string; // Razorpay
  status: 'CREATED' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
}

export interface PaymentGateway {
  readonly provider: PaymentProvider;
  createIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult>;
  /** Verify + parse a provider webhook into a normalized status update. */
  verifyWebhook(
    rawBody: string | Buffer,
    signature: string,
  ): Promise<{ providerRef: string; status: PaymentIntentResult['status'] }>;
  refund(providerRef: string, amount?: Money): Promise<{ ok: boolean }>;
}
