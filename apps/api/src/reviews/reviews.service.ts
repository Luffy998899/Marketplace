import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MOCK_CHARACTERS,
  type CreateReviewInput,
  type ReviewDTO,
} from '@acm/shared';
import { randomUUID } from 'node:crypto';
import { AuthService } from '../auth/auth.service';
import { OrdersService } from '../orders/orders.service';
import { StudioService } from '../studio/studio.service';

@Injectable()
export class ReviewsService {
  private readonly reviews = new Map<string, ReviewDTO[]>();

  constructor(
    private readonly auth: AuthService,
    private readonly orders: OrdersService,
    private readonly studio: StudioService,
  ) {}

  listForCharacter(slug: string): ReviewDTO[] {
    return [...(this.reviews.get(slug) ?? [])].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }

  create(authorId: string, input: CreateReviewInput): ReviewDTO {
    const author = this.auth.findById(authorId);
    if (!author) throw new ForbiddenException();

    const license = this.orders.buyerOwnsCharacter(authorId, input.characterSlug);
    if (!license) {
      throw new ForbiddenException('You must own a license to review this character');
    }

    if (input.rating < 1 || input.rating > 5) {
      throw new BadRequestException('Rating must be 1–5');
    }

    const character =
      this.studio.getDetailBySlug(input.characterSlug) ??
      MOCK_CHARACTERS.find((c) => c.slug === input.characterSlug);
    if (!character) throw new NotFoundException('Character not found');

    const existing = this.reviews.get(input.characterSlug) ?? [];
    if (existing.some((r) => r.authorId === authorId)) {
      throw new BadRequestException('You already reviewed this character');
    }

    const review: ReviewDTO = {
      id: `rev_${randomUUID()}`,
      characterId: character.id,
      characterSlug: input.characterSlug,
      authorId,
      authorName: author.displayName,
      rating: input.rating,
      body: input.body?.trim(),
      createdAt: new Date().toISOString(),
    };

    existing.push(review);
    this.reviews.set(input.characterSlug, existing);
    return review;
  }

  getAggregateRating(slug: string): { rating: number; count: number } {
    const list = this.reviews.get(slug) ?? [];
    if (list.length === 0) return { rating: 0, count: 0 };
    const sum = list.reduce((a, r) => a + r.rating, 0);
    return { rating: Math.round((sum / list.length) * 10) / 10, count: list.length };
  }
}
