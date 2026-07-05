import type { AssetKind, CharacterStatus, LicenseType, ListingStep, UserRole } from './enums.js';
import type { LicenseTierDTO, MediaAssetDTO } from './dto.js';

export const OwnerType = {
  ORG: 'ORG',
  CREATOR: 'CREATOR',
} as const;
export type OwnerType = (typeof OwnerType)[keyof typeof OwnerType];

export const ModerationDecision = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  CHANGES_REQUESTED: 'CHANGES_REQUESTED',
  REJECTED: 'REJECTED',
} as const;
export type ModerationDecision = (typeof ModerationDecision)[keyof typeof ModerationDecision];

export const LISTING_STEP_META: Record<
  ListingStep,
  { label: string; description: string; order: number }
> = {
  IDENTITY_OWNERSHIP: {
    order: 1,
    label: 'Identity',
    description: 'Confirm your character is fully synthetic and you own the rights.',
  },
  ASSET_UPLOAD: {
    order: 2,
    label: 'Assets',
    description: 'Upload preview media and locked deliverables.',
  },
  SYNTHID_WATERMARK: {
    order: 3,
    label: 'SynthID',
    description: 'Stamp provenance fingerprint and watermark previews.',
  },
  RIGHTS_DECLARATION: {
    order: 4,
    label: 'Rights',
    description: 'Sign the IP declaration — no real-person likeness.',
  },
  MODERATION_REVIEW: {
    order: 5,
    label: 'Review',
    description: 'Submit for moderation before going live.',
  },
};

export interface ListingChecklistDTO {
  identityConfirmed: boolean;
  assetsUploaded: boolean;
  synthIdStamped: boolean;
  rightsDeclared: boolean;
  moderationPassed: boolean;
  currentStep: ListingStep;
  ipDeclarationSigned: boolean;
  ipDeclarationHash?: string;
  signedAt?: string;
}

export interface ListingAssetDTO {
  id: string;
  kind: AssetKind;
  label: string;
  url?: string;
  isLocked: boolean;
  uploaded: boolean;
}

export interface CreatorListingDTO {
  id: string;
  creatorId: string;
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  niche: string;
  style: string;
  gender: string;
  ethnicity: string;
  tags: string[];
  status: CharacterStatus;
  ownerType: OwnerType;
  checklist: ListingChecklistDTO;
  cover?: MediaAssetDTO;
  previewVideo?: MediaAssetDTO;
  gallery: MediaAssetDTO[];
  assets: ListingAssetDTO[];
  licenseTiers: LicenseTierDTO[];
  synthIdHash?: string;
  watermarkFingerprint?: string;
  fromPriceMinor: number;
  currency: string;
  licenseTypes: LicenseType[];
  available: boolean;
  createdAt: string;
  updatedAt: string;
  moderationDecision?: ModerationDecision;
  moderationNotes?: string;
}

export interface CreateListingInput {
  name: string;
  tagline?: string;
  niche: string;
  style: string;
  gender: string;
  ethnicity: string;
}

export interface UpdateListingInput {
  name?: string;
  tagline?: string;
  description?: string;
  niche?: string;
  style?: string;
  gender?: string;
  ethnicity?: string;
}

export interface UploadListingAssetInput {
  kind: AssetKind;
  label?: string;
  /** Mock upload — public URL or data URL. Production swaps for presigned S3 upload. */
  url: string;
}

export interface CreatorStatsDTO {
  totalListings: number;
  liveListings: number;
  draftListings: number;
  inReviewListings: number;
  payoutPendingMinor: number;
  currency: string;
}

export interface BecomeCreatorResult {
  role: UserRole;
  message: string;
}
