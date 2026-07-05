import type { AssetKind, CharacterStatus, LicenseType } from './enums.js';

// Public-facing DTOs. These are the ONLY shapes sent to the browser. Locked
// asset storage keys / signed URLs are never part of these types unless the
// caller holds a valid license (resolved separately via the assets service).

export interface MediaAssetDTO {
  id: string;
  kind: Extract<AssetKind, 'PREVIEW_IMAGE' | 'GALLERY_IMAGE' | 'VIDEO'>;
  url: string; // watermarked / downsampled derivative only
  width: number;
  height: number;
  blurDataUrl?: string;
}

export interface LicenseTierDTO {
  id: string;
  type: LicenseType;
  name: string;
  description?: string;
  priceMinor: number;
  currency: string;
  exclusive: boolean;
}

/** Compact shape used by the homepage grid. Optimised for list payloads. */
export interface CharacterCardDTO {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  category: string;
  niche?: string;
  style?: string;
  gender?: string;
  ethnicity?: string;
  tags: string[];
  rating: number;
  ratingCount: number;
  status: CharacterStatus;
  ownerName: string;
  verified: boolean;
  // Primary preview (watermarked). Aspect ratio drives masonry layout.
  cover: MediaAssetDTO;
  /** Short loop clip for desktop hover preview (watermarked derivative). */
  previewVideo?: MediaAssetDTO;
  fromPriceMinor: number; // cheapest active tier
  currency: string;
  licenseTypes: LicenseType[];
  available: boolean; // false if exclusively licensed / delisted
}

export interface CharacterDetailDTO extends CharacterCardDTO {
  description?: string;
  socials?: Record<string, string>;
  gallery: MediaAssetDTO[];
  licenseTiers: LicenseTierDTO[];
  // Locked assets are advertised by metadata only — no URL until licensed.
  lockedAssets: { kind: AssetKind; label: string }[];
  synthIdVerified: boolean;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
