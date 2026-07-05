import {
  MOCK_CHARACTERS,
  getMockCharacterBySlug,
  type CharacterCardDTO,
  type CharacterDetailDTO,
  type CharacterFilter,
  type Paginated,
} from '@acm/shared';

// ─────────────────────────────────────────────────────────────
// Data source abstraction
// ─────────────────────────────────────────────────────────────
// Phase 1 defaults to the local deterministic mock dataset so the grid works
// with zero backend. Flip NEXT_PUBLIC_USE_MOCK_DATA=false to hit the NestJS API
// (identical DTO contract). This is the ONLY place the toggle is read.

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function applyFilter(all: CharacterCardDTO[], filter: CharacterFilter): Paginated<CharacterCardDTO> {
  const page = filter.page ?? 1;
  const pageSize = filter.pageSize ?? 24;
  let items = all.filter((c) => c.status === 'LIVE');

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
  if (typeof filter.minRating === 'number') items = items.filter((c) => c.rating >= filter.minRating!);
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
  return {
    items: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    hasMore: start + pageSize < total,
  };
}

function toQueryString(filter: CharacterFilter): string {
  const p = new URLSearchParams();
  if (filter.q) p.set('q', filter.q);
  for (const key of ['gender', 'ethnicity', 'niche', 'style', 'licenseType'] as const) {
    const v = filter[key];
    if (Array.isArray(v) && v.length) p.set(key, v.join(','));
  }
  for (const key of ['minPriceMinor', 'maxPriceMinor', 'minRating', 'page', 'pageSize'] as const) {
    const v = filter[key];
    if (typeof v === 'number') p.set(key, String(v));
  }
  if (filter.availableOnly) p.set('availableOnly', 'true');
  if (filter.sort) p.set('sort', filter.sort);
  return p.toString();
}

// Simulate realistic network latency for skeleton/blur-up UX in mock mode.
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchCharacters(
  filter: CharacterFilter,
): Promise<Paginated<CharacterCardDTO>> {
  if (USE_MOCK) {
    await delay(350);
    return applyFilter(MOCK_CHARACTERS, filter);
  }
  const res = await fetch(`${API_URL}/api/characters?${toQueryString(filter)}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to load characters (${res.status})`);
  return res.json();
}

export async function fetchCharacter(slug: string): Promise<CharacterDetailDTO | null> {
  if (USE_MOCK) {
    await delay(200);
    return getMockCharacterBySlug(slug);
  }
  const res = await fetch(`${API_URL}/api/characters/${slug}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load character (${res.status})`);
  return res.json();
}
