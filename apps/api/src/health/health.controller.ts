import { Controller, Get } from '@nestjs/common';
import { allowDevStubs } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { StripeGateway } from '../wallet/payment-gateways';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly stripe: StripeGateway,
  ) {}

  @Get()
  check() {
    const base = {
      status: 'ok',
      service: 'synthetica-api',
      version: '1.0.0',
      phases: {
        phase1_marketplace: true,
        phase2_creatorStudio: true,
        phase3_commissions: true,
        phase4_socialFeed: true,
        reviews: true,
        moderation: true,
      },
    };

    if (allowDevStubs()) {
      return {
        ...base,
        infrastructure: {
          prisma: this.prisma.enabled,
          storage: this.storage.mode,
          stripe: this.stripe.isLive ? 'live' : 'stub',
          meilisearch: !!process.env.MEILI_HOST,
          moderationAutoApprove: process.env.MODERATION_AUTO_APPROVE !== 'false',
          devStubs: true,
        },
      };
    }

    return base;
  }
}
