import { Module } from '@nestjs/common';
import { LedgerModule } from '../ledger/ledger.module';
import { CertificatesController, OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [LedgerModule],
  controllers: [OrdersController, CertificatesController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
