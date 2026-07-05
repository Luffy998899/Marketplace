import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('purchase')
  purchase(@Body() body: { buyerId: string; characterSlug: string; licenseTierId: string }) {
    return this.orders.purchase(body);
  }

  @Get(':orderId')
  get(@Param('orderId') orderId: string) {
    const order = this.orders.getOrder(orderId);
    if (!order) return { error: 'not_found' };
    return order;
  }
}

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly orders: OrdersService) {}

  @Get('verify/:serial')
  verify(@Param('serial') serial: string) {
    return this.orders.verifyCertificate(serial);
  }
}
