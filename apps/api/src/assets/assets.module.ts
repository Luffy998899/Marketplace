import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { StudioModule } from '../studio/studio.module';
import { AssetsController } from './assets.controller';

@Module({
  imports: [OrdersModule, StudioModule],
  controllers: [AssetsController],
})
export class AssetsModule {}
