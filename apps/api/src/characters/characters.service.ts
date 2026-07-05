import { Injectable } from '@nestjs/common';
import {
  MOCK_CHARACTERS,
  getMockCharacterBySlug,
  type CharacterCardDTO,
  type CharacterDetailDTO,
  type CharacterFilter,
  type Paginated,
} from '@acm/shared';

// Phase 1: serves the deterministic mock dataset. Swap the source for Prisma
// (@acm/db) + Meilisearch once the DB is provisioned — the DTO contract and
// filtering semantics stay identical, so the web app needs no changes.
@Injectable()
export class CharactersService {
  private readonly all: CharacterCardDTO[] = MOCK_CHARACTERS;

  list(filter: CharacterFilter): Paginated<CharacterCardDTO> {
    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 24;
    let items = this.all.filter((c) => c.status === 'LIVE');

    if (filter.q) {
      const q = filter.q.toLowerCase();
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)) ||
          (c.tagline?.toLowerCase().includes(q) ?? false),
      );
    }
    if (filter.gender?.length) items = items.filter((c) => filter.gender!.includes(c.gender ?? ''));
    if (filter.ethnicity?.length)
      items = items.filter((c) => filter.ethnicity!.includes(c.ethnicity ?? ''));
    if (filter.niche?.length) items = items.filter((c) => filter.niche!.includes(c.niche ?? ''));
    if (filter.style?.length) items = items.filter((c) => filter.style!.includes(c.style ?? ''));
    if (filter.licenseType?.length)
      items = items.filter((c) => c.licenseTypes.some((t) => filter.licenseType!.includes(t)));
    if (typeof filter.minPriceMinor === 'number')
      items = items.filter((c) => c.fromPriceMinor >= filter.minPriceMinor!);
    if (typeof filter.maxPriceMinor === 'number')
      items = items.filter((c) => c.fromPriceMinor <= filter.maxPriceMinor!);
    if (typeof filter.minRating === 'number')
      items = items.filter((c) => c.rating >= filter.minRating!);
    if (filter.availableOnly) items = items.filter((c) => c.available);

    switch (filter.sort) {
      case 'newest':
        items = [...items].reverse();
        break;
      case 'price_asc':
        items = [...items].sort((a, b) => a.fromPriceMinor - b.fromPriceMinor);
        break;
      case 'price_desc':
        items = [...items].sort((a, b) => b.fromPriceMinor - a.fromPriceMinor);
        break;
      case 'rating':
        items = [...items].sort((a, b) => b.rating - a.rating);
        break;
      default:
        items = [...items].sort((a, b) => b.rating * b.ratingCount - a.rating * a.ratingCount);
    }

    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return { items: paged, total, page, pageSize, hasMore: start + pageSize < total };
  }

  getBySlug(slug: string): CharacterDetailDTO | null {
    return getMockCharacterBySlug(slug);
  }
}
