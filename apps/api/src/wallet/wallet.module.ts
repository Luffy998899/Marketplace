import { Module } from '@nestjs/common';
import { LedgerModule } from '../ledger/ledger.module';
import { RazorpayGateway, StripeGateway } from './payment-gateways';
import { StripeWebhookController } from './stripe-webhook.controller';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [LedgerModule],
  controllers: [WalletController, StripeWebhookController],
  providers: [WalletService, StripeGateway, RazorpayGateway],
  exports: [WalletService, StripeGateway],
})
export class WalletModule {}
