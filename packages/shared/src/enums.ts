// Framework-agnostic domain enums. These mirror the Prisma enums but let the
// frontend (and non-Prisma code) share a single source of truth.

export const UserRole = {
  BUYER: 'BUYER',
  CREATOR: 'CREATOR',
  FREELANCER: 'FREELANCER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const CharacterStatus = {
  DRAFT: 'DRAFT',
  IN_REVIEW: 'IN_REVIEW',
  CHANGES_REQUESTED: 'CHANGES_REQUESTED',
  LIVE: 'LIVE',
  SUSPENDED: 'SUSPENDED',
  DELISTED: 'DELISTED',
} as const;
export type CharacterStatus = (typeof CharacterStatus)[keyof typeof CharacterStatus];

export const LicenseType = {
  ONE_TIME: 'ONE_TIME',
  CAMPAIGN: 'CAMPAIGN',
  FULL_RIGHTS: 'FULL_RIGHTS',
  COMMISSION: 'COMMISSION',
} as const;
export type LicenseType = (typeof LicenseType)[keyof typeof LicenseType];

export const OrderStatus = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID: 'PAID',
  IN_ESCROW: 'IN_ESCROW',
  RELEASED: 'RELEASED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  DISPUTED: 'DISPUTED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const EscrowStatus = {
  NONE: 'NONE',
  HELD: 'HELD',
  RELEASED: 'RELEASED',
  REFUNDED: 'REFUNDED',
  PARTIAL: 'PARTIAL',
  DISPUTED: 'DISPUTED',
} as const;
export type EscrowStatus = (typeof EscrowStatus)[keyof typeof EscrowStatus];

export const PaymentProvider = {
  STRIPE: 'STRIPE',
  RAZORPAY: 'RAZORPAY',
  WALLET: 'WALLET',
} as const;
export type PaymentProvider = (typeof PaymentProvider)[keyof typeof PaymentProvider];

export const AssetKind = {
  PREVIEW_IMAGE: 'PREVIEW_IMAGE',
  GALLERY_IMAGE: 'GALLERY_IMAGE',
  VIDEO: 'VIDEO',
  CHARACTER_SHEET: 'CHARACTER_SHEET',
  LORA: 'LORA',
  PROMPT_PACK: 'PROMPT_PACK',
  SOURCE_ORIGINAL: 'SOURCE_ORIGINAL',
} as const;
export type AssetKind = (typeof AssetKind)[keyof typeof AssetKind];

/** Asset kinds that must NEVER be exposed without a valid license. */
export const LOCKED_ASSET_KINDS: AssetKind[] = [
  AssetKind.CHARACTER_SHEET,
  AssetKind.LORA,
  AssetKind.PROMPT_PACK,
  AssetKind.SOURCE_ORIGINAL,
];

export const LISTING_STEPS = [
  'IDENTITY_OWNERSHIP',
  'ASSET_UPLOAD',
  'SYNTHID_WATERMARK',
  'RIGHTS_DECLARATION',
  'MODERATION_REVIEW',
] as const;
export type ListingStep = (typeof LISTING_STEPS)[number];
