import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  readonly enabled = process.env.USE_PRISMA === 'true';

  async onModuleInit() {
    if (this.enabled) {
      await this.$connect();
    }
  }

  async onModuleDestroy() {
    if (this.enabled) {
      await this.$disconnect();
    }
  }
}
