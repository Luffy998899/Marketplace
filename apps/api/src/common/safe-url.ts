import { BadRequestException } from '@nestjs/common';

const HTTPS = /^https:\/\//i;
const PRIVATE_REF = /^private:\/\//i;
const LOCAL_UPLOAD = /^\/api\/uploads\//i;

/** Allow https URLs, local public upload paths, and private storage refs — block javascript/data/file. */
export function assertSafeAssetUrl(url: string, field = 'url'): string {
  const trimmed = url.trim();
  if (!trimmed) throw new BadRequestException(`${field} is required`);
  if (trimmed.length > 2048) throw new BadRequestException(`${field} is too long`);

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('file:') ||
    lower.startsWith('vbscript:')
  ) {
    throw new BadRequestException(`Invalid ${field}`);
  }

  if (HTTPS.test(trimmed) || PRIVATE_REF.test(trimmed) || LOCAL_UPLOAD.test(trimmed)) {
    return trimmed;
  }

  throw new BadRequestException(`${field} must be https:// or an approved upload path`);
}

/** Deliverable links shown to buyers must be https only. */
export function assertHttpsUrl(url: string, field = 'url'): string {
  const trimmed = url.trim();
  if (!HTTPS.test(trimmed)) {
    throw new BadRequestException(`${field} must be an https:// URL`);
  }
  if (trimmed.length > 2048) throw new BadRequestException(`${field} is too long`);
  return trimmed;
}
