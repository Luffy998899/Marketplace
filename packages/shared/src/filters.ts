import { z } from 'zod';
import { LicenseType } from './enums.js';

export const CharacterSortField = {
  TRENDING: 'trending',
  NEWEST: 'newest',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  RATING: 'rating',
} as const;
export type CharacterSortField = (typeof CharacterSortField)[keyof typeof CharacterSortField];

// Facet options surfaced in the homepage filter rail. Kept here so the mock
// data generator, the API, and the UI all agree on vocabulary.
export const GENDER_OPTIONS = ['female', 'male', 'non-binary', 'androgynous'] as const;
export const ETHNICITY_OPTIONS = [
  'asian',
  'black',
  'latino',
  'middle-eastern',
  'south-asian',
  'white',
  'mixed',
] as const;
export const NICHE_OPTIONS = [
  'fashion',
  'gaming',
  'fitness',
  'music',
  'beauty',
  'travel',
  'tech',
  'food',
  'luxury',
  'streetwear',
] as const;
export const STYLE_OPTIONS = ['photoreal', 'anime', '3d', 'stylised', 'cyberpunk', 'retro'] as const;

export const CharacterFilterSchema = z.object({
  q: z.string().trim().optional(),
  gender: z.array(z.string()).optional(),
  ethnicity: z.array(z.string()).optional(),
  niche: z.array(z.string()).optional(),
  style: z.array(z.string()).optional(),
  licenseType: z.array(z.nativeEnum(LicenseType)).optional(),
  minPriceMinor: z.number().int().nonnegative().optional(),
  maxPriceMinor: z.number().int().nonnegative().optional(),
  minRating: z.number().min(0).max(5).optional(),
  availableOnly: z.boolean().optional(),
  sort: z
    .enum(['trending', 'newest', 'price_asc', 'price_desc', 'rating'])
    .default('trending')
    .optional(),
  page: z.number().int().positive().default(1).optional(),
  pageSize: z.number().int().positive().max(100).default(24).optional(),
});

export type CharacterFilter = z.infer<typeof CharacterFilterSchema>;
