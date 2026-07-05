import { Module } from '@nestjs/common';
import { LedgerModule } from '../ledger/ledger.module';
import { StudioModule } from '../studio/studio.module';
import { CertificatesController, OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [LedgerModule, StudioModule],
  controllers: [OrdersController, CertificatesController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
