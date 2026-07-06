import { BadRequestException, Body, Controller, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AssetKind, UserRole, type CreateListingInput, type UpdateListingInput, type UploadListingAssetInput } from '@acm/shared';
import { AuthService } from '../auth/auth.service';
import { CurrentUser, JwtPayload, Roles } from '../auth/auth.decorators';
import { JwtAuthGuard, RolesGuard } from '../auth/auth.guards';
import { StorageService } from '../storage/storage.service';
import { StudioService } from './studio.service';

@Controller('studio')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CREATOR, UserRole.ADMIN)
export class StudioController {
  constructor(
    private readonly studio: StudioService,
    private readonly auth: AuthService,
    private readonly storage: StorageService,
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

  @Post('listings/:id/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async uploadFile(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('kind') kind: string,
  ) {
    if (!file) throw new BadRequestException('File is required');
    if (!kind) throw new BadRequestException('Asset kind is required');

    const allowedMime =
      /^(image\/(jpeg|png|webp|gif)|video\/(mp4|webm)|application\/(zip|x-zip-compressed))$/;
    if (!allowedMime.test(file.mimetype)) {
      throw new BadRequestException('Unsupported file type');
    }

    const assetKind = kind as AssetKind;
    this.studio.getById(user.sub, id);
    const url = await this.storage.saveListingAsset(id, assetKind, file);
    return this.studio.uploadAsset(user.sub, id, { kind: assetKind, url });
  }

  @Post('listings/:id/submit')
  submit(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.studio.submitForReview(user.sub, id);
  }
}
