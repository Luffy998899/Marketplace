import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LedgerModule } from '../ledger/ledger.module';
import { StorageModule } from '../storage/storage.module';
import { StudioController } from './studio.controller';
import { StudioService } from './studio.service';

@Module({
  imports: [LedgerModule, AuthModule, StorageModule],
  controllers: [StudioController],
  providers: [StudioService],
  exports: [StudioService],
})
export class StudioModule {}
