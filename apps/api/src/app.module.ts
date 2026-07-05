import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CharactersModule } from './characters/characters.module';
import { HealthController } from './health/health.controller';
import { LedgerModule } from './ledger/ledger.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CharactersModule,
    LedgerModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
