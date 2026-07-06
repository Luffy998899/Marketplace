import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PaymentProvider, UserRole } from '@acm/shared';
import { CurrentUser, JwtPayload, Roles } from '../auth/auth.decorators';
import { JwtAuthGuard, RolesGuard } from '../auth/auth.guards';
import { TopUpDto } from '../dto/wallet.dto';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get('me/balance')
  @UseGuards(JwtAuthGuard)
  balance(@CurrentUser() user: JwtPayload) {
    return this.wallet.getBalance(user.sub);
  }

  @Get('me/topups')
  @UseGuards(JwtAuthGuard)
  topUps(@CurrentUser() user: JwtPayload) {
    return this.wallet.listTopUps(user.sub);
  }

  @Post('me/topup')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER, UserRole.CREATOR, UserRole.ADMIN)
  topUp(@CurrentUser() user: JwtPayload, @Body() body: TopUpDto) {
    return this.wallet.initiateTopUp(
      user.sub,
      body.amountMinor,
      body.currency,
      body.provider ?? PaymentProvider.STRIPE,
    );
  }
}
