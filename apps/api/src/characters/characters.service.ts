import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  MOCK_CHARACTERS,
  getMockCharacterBySlug,
  type CharacterCardDTO,
  type CharacterDetailDTO,
  type CharacterFilter,
  type Paginated,
} from '@acm/shared';
import { PrismaService } from '../prisma/prisma.service';
import { SearchService } from '../search/search.service';
import { StudioService } from '../studio/studio.service';

@Injectable()
export class CharactersService implements OnModuleInit {
  private readonly mockLive = MOCK_CHARACTERS.filter((c) => c.status === 'LIVE');

  constructor(
    private readonly studio: StudioService,
    private readonly prisma: PrismaService,
    private readonly search: SearchService,
  ) {}

  async onModuleInit() {
    if (this.search.enabled) {
      await this.search.indexCharacters(this.mockLive);
    }
  }

  private async allLiveCards(): Promise<CharacterCardDTO[]> {
    const studioCards = this.studio.getLiveCards();
    if (this.prisma.enabled) {
      const rows = await this.prisma.character.findMany({
        where: { status: 'LIVE' },
        include: { licenseTiers: true, assets: true, org: true, creator: true },
      });
      const dbCards: CharacterCardDTO[] = rows.map((c) => {
        const cover = c.assets.find((a) => a.kind === 'PREVIEW_IMAGE');
        const tiers = c.licenseTiers.filter((t) => t.isActive);
        return {
          id: c.id,
          slug: c.slug,
          name: c.name,
          tagline: c.tagline ?? undefined,
          category: c.category,
          niche: c.niche ?? undefined,
          style: c.style ?? undefined,
          gender: c.gender ?? undefined,
          ethnicity: c.ethnicity ?? undefined,
          tags: c.tags,
          rating: c.rating,
          ratingCount: c.ratingCount,
          status: c.status as CharacterCardDTO['status'],
          ownerName: c.creator?.displayName ?? c.org?.name ?? 'Unknown',
          verified: c.org?.verified ?? false,
          cover: {
            id: cover?.id ?? c.id,
            kind: 'PREVIEW_IMAGE',
            url: cover?.publicUrl ?? `https://picsum.photos/seed/${c.slug}/800/1000`,
            width: cover?.width ?? 800,
            height: cover?.height ?? 1000,
            blurDataUrl: cover?.blurDataUrl ?? undefined,
          },
          fromPriceMinor: tiers[0]?.priceMinor ?? 100,
          currency: tiers[0]?.currency ?? 'USD',
          licenseTypes: tiers.map((t) => t.type as CharacterCardDTO['licenseTypes'][0]),
          available: true,
        };
      });
      return [...dbCards, ...studioCards];
    }
    return [...this.mockLive, ...studioCards];
  }

  async list(filter: CharacterFilter): Promise<Paginated<CharacterCardDTO>> {
    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 24;
    let items = await this.allLiveCards();

    if (filter.q && this.search.enabled) {
      const slugs = await this.search.search(filter.q, 100);
      if (slugs.length) {
        const slugSet = new Set(slugs);
        items = items.filter((c) => slugSet.has(c.slug));
      }
    }

    if (filter.q && !this.search.enabled) {
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
    return this.studio.getDetailBySlug(slug) ?? getMockCharacterBySlug(slug);
  }
}
