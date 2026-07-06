import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@acm/shared';
import { CurrentUser, JwtPayload, Roles } from '../auth/auth.decorators';
import { JwtAuthGuard, RolesGuard } from '../auth/auth.guards';
import { SubmitKycDto } from '../dto/kyc.dto';
import { KycService } from './kyc.service';

@Controller('kyc')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kyc: KycService) {}

  @Get('status')
  status(@CurrentUser() user: JwtPayload) {
    return this.kyc.getStatus(user.sub);
  }

  @Post('submit')
  submit(@CurrentUser() user: JwtPayload, @Body() body: SubmitKycDto) {
    return this.kyc.submit(user.sub, body);
  }

  @Post('approve/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  approve(@Param('userId') userId: string) {
    return this.kyc.approve(userId);
  }
}
