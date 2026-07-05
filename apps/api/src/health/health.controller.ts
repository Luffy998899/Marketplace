import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'synthetica-api',
      version: '1.0.0',
      features: {
        marketplace: true,
        creatorStudio: true,
        moderation: true,
        walletCheckout: true,
        signedDownloads: true,
      },
      moderationAutoApprove: process.env.MODERATION_AUTO_APPROVE !== 'false',
    };
  }
}
