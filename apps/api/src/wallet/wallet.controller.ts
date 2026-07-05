import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaymentProvider } from '@acm/shared';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get(':userId/balance')
  balance(@Param('userId') userId: string) {
    return this.wallet.getBalance(userId);
  }

  @Get(':userId/topups')
  topUps(@Param('userId') userId: string) {
    return this.wallet.listTopUps(userId);
  }

  @Post(':userId/topup')
  topUp(
    @Param('userId') userId: string,
    @Body() body: { amountMinor: number; currency?: string; provider?: PaymentProvider },
  ) {
    return this.wallet.topUp(
      userId,
      body.amountMinor,
      body.currency,
      body.provider ?? PaymentProvider.STRIPE,
    );
  }
}
