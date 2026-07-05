import type { LicenseType, UserRole } from './enums.js';

export interface AuthUserDTO {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
}

export interface AuthTokensDTO {
  accessToken: string;
  expiresIn: string;
  user: AuthUserDTO;
}

export interface CertificateDTO {
  serial: string;
  issuedAt: string;
  signature: string;
  ledgerHash: string;
}

export interface OrderDTO {
  orderId: string;
  buyerId: string;
  characterSlug: string;
  characterName: string;
  licenseType: LicenseType;
  amountMinor: number;
  currency: string;
  commissionMinor: number;
  sellerNetMinor: number;
  escrowStatus: string;
  certificate: CertificateDTO;
  purchasedAt: string;
}

export interface WalletBalanceDTO {
  balance: { amountMinor: number; currency: string };
  payoutPending: { amountMinor: number; currency: string };
}

export interface SignedAssetUrlDTO {
  url: string;
  expiresAt: string;
  assetKind: string;
  label: string;
}
