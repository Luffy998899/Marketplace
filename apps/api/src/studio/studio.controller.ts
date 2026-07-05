import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole, type CreateListingInput, type UpdateListingInput, type UploadListingAssetInput } from '@acm/shared';
import { AuthService } from '../auth/auth.service';
import { CurrentUser, JwtPayload, Roles } from '../auth/auth.decorators';
import { JwtAuthGuard, RolesGuard } from '../auth/auth.guards';
import { StudioService } from './studio.service';

@Controller('studio')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CREATOR, UserRole.ADMIN)
export class StudioController {
  constructor(
    private readonly studio: StudioService,
    private readonly auth: AuthService,
  ) {}

  @Get('stats')
  stats(@CurrentUser() user: JwtPayload) {
    return this.studio.stats(user.sub);
  }

  @Get('listings')
  list(@CurrentUser() user: JwtPayload) {
    return this.studio.listByCreator(user.sub);
  }

  @Post('listings')
  create(@CurrentUser() user: JwtPayload, @Body() body: CreateListingInput) {
    const profile = this.auth.me(user.sub);
    return this.studio.create(user.sub, profile.displayName, body);
  }

  @Get('listings/:id')
  getOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.studio.getById(user.sub, id);
  }

  @Patch('listings/:id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: UpdateListingInput,
  ) {
    return this.studio.update(user.sub, id, body);
  }

  @Post('listings/:id/identity')
  confirmIdentity(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.studio.confirmIdentity(user.sub, id);
  }

  @Post('listings/:id/assets')
  uploadAsset(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: UploadListingAssetInput,
  ) {
    return this.studio.uploadAsset(user.sub, id, body);
  }

  @Post('listings/:id/synthid')
  stampSynthId(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.studio.stampSynthId(user.sub, id);
  }

  @Post('listings/:id/rights')
  signRights(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.studio.signRights(user.sub, id);
  }

  @Post('listings/:id/submit')
  submit(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.studio.submitForReview(user.sub, id);
  }
}
