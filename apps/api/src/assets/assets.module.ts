import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { AssetsController } from './assets.controller';

@Module({
  imports: [OrdersModule],
  controllers: [AssetsController],
})
export class AssetsModule {}
