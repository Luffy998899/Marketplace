import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@acm/shared';
import { CurrentUser, JwtPayload, Roles } from '../auth/auth.decorators';
import { JwtAuthGuard, RolesGuard } from '../auth/auth.guards';
import { ModerationService } from './moderation.service';

@Controller('moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MODERATOR, UserRole.ADMIN)
export class ModerationController {
  constructor(private readonly moderation: ModerationService) {}

  @Get('queue')
  queue() {
    return this.moderation.listPending();
  }

  @Post(':listingId/approve')
  approve(
    @CurrentUser() user: JwtPayload,
    @Param('listingId') listingId: string,
    @Body() body: { notes?: string },
  ) {
    return this.moderation.approve(listingId, user.sub, body.notes);
  }

  @Post(':listingId/reject')
  reject(
    @CurrentUser() user: JwtPayload,
    @Param('listingId') listingId: string,
    @Body() body: { notes: string },
  ) {
    return this.moderation.reject(listingId, user.sub, body.notes);
  }
}
