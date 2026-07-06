import { BadRequestException } from '@nestjs/common';

const LISTING_ID = /^lst_[0-9a-f-]{36}$/i;
const COMMISSION_ID = /^comm_[0-9a-f-]{36}$/i;

export function assertSafeListingId(id: string): void {
  if (!LISTING_ID.test(id)) {
    throw new BadRequestException('Invalid listing id');
  }
}

export function assertSafeCommissionId(id: string): void {
  if (!LISTING_ID.test(id) && !COMMISSION_ID.test(id) && id !== 'comm_demo_001') {
    throw new BadRequestException('Invalid commission id');
  }
}

/** Prevent path traversal when joining upload paths. */
export function safePathSegment(segment: string): string {
  const cleaned = segment.replace(/[^a-zA-Z0-9._-]/g, '_');
  if (!cleaned || cleaned.includes('..')) {
    throw new BadRequestException('Invalid path segment');
  }
  return cleaned;
}
