import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@acm/shared';
import { CurrentUser, JwtPayload, Roles } from '../auth/auth.decorators';
import { JwtAuthGuard, RolesGuard } from '../auth/auth.guards';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('purchase')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER, UserRole.CREATOR, UserRole.ADMIN)
  purchase(
    @CurrentUser() user: JwtPayload,
    @Body() body: { characterSlug: string; licenseTierId: string },
  ) {
    return this.orders.purchase({
      buyerId: user.sub,
      characterSlug: body.characterSlug,
      licenseTierId: body.licenseTierId,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  myOrders(@CurrentUser() user: JwtPayload) {
    return this.orders.listByBuyer(user.sub);
  }

  @Get(':orderId')
  @UseGuards(JwtAuthGuard)
  get(@Param('orderId') orderId: string, @CurrentUser() user: JwtPayload) {
    const order = this.orders.getOrder(orderId);
    if (!order || order.buyerId !== user.sub) return { error: 'not_found' };
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
