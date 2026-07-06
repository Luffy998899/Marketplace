import {
  Controller,
  Headers,
  HttpCode,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request } from 'express';
import { StripeGateway } from './payment-gateways';
import { WalletService } from './wallet.service';

@SkipThrottle()
@Controller('webhooks')
export class StripeWebhookController {
  constructor(
    private readonly stripe: StripeGateway,
    private readonly wallet: WalletService,
  ) {}

  @Post('stripe')
  @HttpCode(200)
  async handleStripe(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody ?? req.body;
    const result = await this.stripe.verifyWebhook(
      typeof rawBody === 'string' ? rawBody : Buffer.from(rawBody),
      signature ?? '',
    );

    if (result.status === 'SUCCEEDED' && result.topUpId) {
      await this.wallet.completeTopUpFromWebhook(result.topUpId, result.providerRef);
    }

    return { received: true };
  }
}
