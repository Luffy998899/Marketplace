import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, JwtPayload } from '../auth/auth.decorators';
import { JwtAuthGuard } from '../auth/auth.guards';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get('character/:slug')
  list(@Param('slug') slug: string) {
    return {
      reviews: this.reviews.listForCharacter(slug),
      aggregate: this.reviews.getAggregateRating(slug),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: JwtPayload, @Body() body: { characterSlug: string; rating: number; body?: string }) {
    return this.reviews.create(user.sub, body);
  }
}
