import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@acm/shared';
import { CurrentUser, JwtPayload, Roles } from '../auth/auth.decorators';
import { JwtAuthGuard, RolesGuard } from '../auth/auth.guards';
import { CreateCommentDto, CreateFeedPostDto } from '../dto/feed.dto';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly feed: FeedService) {}

  @Get()
  list(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.feed.list(Number(page) || 1, Number(pageSize) || 20);
  }

  @Get('character/:slug')
  byCharacter(@Param('slug') slug: string) {
    return this.feed.listByCharacter(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR, UserRole.ADMIN)
  create(@CurrentUser() user: JwtPayload, @Body() body: CreateFeedPostDto) {
    return this.feed.create(user.sub, body);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  like(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.feed.toggleLike(user.sub, id);
  }

  @Get(':id/comments')
  comments(@Param('id') id: string) {
    return this.feed.getComments(id);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  comment(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() body: CreateCommentDto) {
    return this.feed.addComment(user.sub, id, body.body);
  }
}
