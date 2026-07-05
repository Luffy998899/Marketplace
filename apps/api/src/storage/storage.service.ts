import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class StorageService {
  private readonly uploadRoot = join(process.cwd(), 'uploads');
  private readonly publicBase =
    process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.API_PORT ?? 4000}`;
  private readonly s3: S3Client | null;
  private readonly bucket = process.env.S3_BUCKET ?? 'acm-assets';

  constructor() {
    this.s3 = process.env.S3_ENDPOINT
      ? new S3Client({
          endpoint: process.env.S3_ENDPOINT,
          region: process.env.S3_REGION ?? 'auto',
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID ?? 'minioadmin',
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? 'minioadmin',
          },
          forcePathStyle: true,
        })
      : null;
  }

  get mode(): 's3' | 'local' {
    return this.s3 ? 's3' : 'local';
  }

  async saveListingAsset(listingId: string, kind: string, file: Express.Multer.File): Promise<string> {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `listings/${listingId}/${kind.toLowerCase()}-${Date.now()}-${safeName}`;

    if (this.s3) {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      return `${process.env.S3_PUBLIC_URL ?? `${process.env.S3_ENDPOINT}/${this.bucket}`}/${key}`;
    }

    const dir = join(this.uploadRoot, listingId);
    mkdirSync(dir, { recursive: true });
    const filename = key.split('/').pop()!;
    writeFileSync(join(dir, filename), file.buffer);
    return `${this.publicBase}/api/uploads/${listingId}/${filename}`;
  }
}
