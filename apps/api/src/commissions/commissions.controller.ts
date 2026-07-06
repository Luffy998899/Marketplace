import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@acm/shared';
import { CurrentUser, JwtPayload, Roles } from '../auth/auth.decorators';
import { JwtAuthGuard, RolesGuard } from '../auth/auth.guards';
import {
  CreateBidDto,
  CreateCommissionDto,
  DeliverCommissionDto,
  RevisionDto,
} from '../dto/commissions.dto';
import { CommissionsService } from './commissions.service';

@Controller('commissions')
export class CommissionsController {
  constructor(private readonly commissions: CommissionsService) {}

  @Get('open')
  listOpen() {
    return this.commissions.listOpenPublic();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  mine(@CurrentUser() user: JwtPayload) {
    if (user.role === UserRole.FREELANCER) return this.commissions.listForFreelancer(user.sub);
    return this.commissions.listForBuyer(user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  get(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.commissions.getForViewer(id, user.sub, user.role as UserRole);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER, UserRole.CREATOR, UserRole.ADMIN)
  create(@CurrentUser() user: JwtPayload, @Body() body: CreateCommissionDto) {
    return this.commissions.create(user.sub, body);
  }

  @Post(':id/bids')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FREELANCER, UserRole.ADMIN)
  bid(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: CreateBidDto,
  ) {
    return this.commissions.placeBid(user.sub, id, body);
  }

  @Post(':id/assign/:bidId')
  @UseGuards(JwtAuthGuard)
  assign(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('bidId') bidId: string,
  ) {
    return this.commissions.assignBid(user.sub, id, bidId);
  }

  @Post(':id/deliver')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FREELANCER, UserRole.ADMIN)
  deliver(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: DeliverCommissionDto,
  ) {
    return this.commissions.submitDelivery(user.sub, id, body.deliverableUrl);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard)
  approve(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.commissions.approveDelivery(user.sub, id);
  }

  @Post(':id/revision')
  @UseGuards(JwtAuthGuard)
  revision(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: RevisionDto,
  ) {
    return this.commissions.requestRevision(user.sub, id, body.notes);
  }
}
