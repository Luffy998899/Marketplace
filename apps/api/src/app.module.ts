import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssetsModule } from './assets/assets.module';
import { AuthModule } from './auth/auth.module';
import { CharactersModule } from './characters/characters.module';
import { HealthController } from './health/health.controller';
import { LedgerModule } from './ledger/ledger.module';
import { CommissionsModule } from './commissions/commissions.module';
import { PrismaModule } from './prisma/prisma.module';
import { SearchModule } from './search/search.module';
import { FeedModule } from './feed/feed.module';
import { ModerationModule } from './moderation/moderation.module';
import { StorageModule } from './storage/storage.module';
import { ReviewsModule } from './reviews/reviews.module';
import { OrdersModule } from './orders/orders.module';
import { StudioModule } from './studio/studio.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    AuthModule,
    CharactersModule,
    LedgerModule,
    WalletModule,
    OrdersModule,
    AssetsModule,
    StudioModule,
    ModerationModule,
    CommissionsModule,
    FeedModule,
    ReviewsModule,
    SearchModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
