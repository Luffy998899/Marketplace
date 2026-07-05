import { BadRequestException, Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { AssetKind, LOCKED_ASSET_KINDS } from '@acm/shared';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { assertSafeListingId, safePathSegment } from '../common/safe-id';
import { isProduction } from '../config/env';

@Injectable()
export class StorageService {
  private readonly publicRoot = join(process.cwd(), 'uploads', 'public');
  private readonly privateRoot = join(process.cwd(), 'uploads', 'private');
  private readonly publicBase =
    process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.API_PORT ?? 4000}`;
  private readonly s3: S3Client | null;
  private readonly bucket = process.env.S3_BUCKET ?? 'acm-assets';

  constructor() {
    if (process.env.S3_ENDPOINT) {
      const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
      const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
      if (!accessKeyId || !secretAccessKey) {
        if (isProduction()) {
          throw new Error('[security] S3_ENDPOINT set but S3 credentials are missing.');
        }
      }
      this.s3 = new S3Client({
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION ?? 'auto',
        credentials: {
          accessKeyId: accessKeyId ?? 'minioadmin',
          secretAccessKey: secretAccessKey ?? 'minioadmin',
        },
        forcePathStyle: true,
      });
    } else {
      this.s3 = null;
    }
  }

  get mode(): 's3' | 'local' {
    return this.s3 ? 's3' : 'local';
  }

  async saveListingAsset(listingId: string, kind: string, file: Express.Multer.File): Promise<string> {
    assertSafeListingId(listingId);

    const safeName = safePathSegment(file.originalname.replace(/\.[^.]+$/, '')) + this.extFromMime(file.mimetype);
    const assetKind = kind as AssetKind;
    const isLocked = LOCKED_ASSET_KINDS.includes(assetKind);
    const key = `listings/${listingId}/${kind.toLowerCase()}-${Date.now()}-${safeName}`;

    if (this.s3) {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ...(isLocked ? { ACL: 'private' as const } : {}),
        }),
      );
      if (isLocked) {
        return `private://s3/${this.bucket}/${key}`;
      }
      return `${process.env.S3_PUBLIC_URL ?? `${process.env.S3_ENDPOINT}/${this.bucket}`}/${key}`;
    }

    const root = isLocked ? this.privateRoot : this.publicRoot;
    const dir = join(root, 'listings', listingId);
    this.assertInsideRoot(root, dir);
    mkdirSync(dir, { recursive: true });
    const filename = key.split('/').pop()!;
    const target = join(dir, filename);
    this.assertInsideRoot(root, target);
    writeFileSync(target, file.buffer);

    if (isLocked) {
      return `private://listings/${listingId}/${filename}`;
    }
    return `${this.publicBase}/api/uploads/listings/${listingId}/${filename}`;
  }

  private extFromMime(mime: string): string {
    if (mime.includes('jpeg') || mime.includes('jpg')) return '.jpg';
    if (mime.includes('png')) return '.png';
    if (mime.includes('webp')) return '.webp';
    if (mime.includes('gif')) return '.gif';
    if (mime.includes('mp4')) return '.mp4';
    if (mime.includes('webm')) return '.webm';
    if (mime.includes('zip')) return '.zip';
    return '.bin';
  }

  private assertInsideRoot(root: string, target: string): void {
    const resolvedRoot = resolve(root);
    const resolvedTarget = resolve(target);
    if (!resolvedTarget.startsWith(resolvedRoot + '/') && resolvedTarget !== resolvedRoot) {
      throw new BadRequestException('Invalid upload path');
    }
  }
}
