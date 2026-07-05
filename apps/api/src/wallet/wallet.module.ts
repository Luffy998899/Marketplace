import { Module } from '@nestjs/common';
import { LedgerModule } from '../ledger/ledger.module';
import { StubRazorpayGateway, StubStripeGateway } from './payment-gateways';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [LedgerModule],
  controllers: [WalletController],
  providers: [WalletService, StubStripeGateway, StubRazorpayGateway],
  exports: [WalletService],
})
export class WalletModule {}
