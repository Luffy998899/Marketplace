import { Injectable } from '@nestjs/common';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class StorageService {
  private readonly uploadRoot = join(process.cwd(), 'uploads');
  private readonly publicBase =
    process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.API_PORT ?? 4000}`;

  /** Persist an uploaded buffer and return a public URL served from /api/uploads. */
  saveListingAsset(listingId: string, kind: string, file: Express.Multer.File): string {
    const dir = join(this.uploadRoot, listingId);
    mkdirSync(dir, { recursive: true });
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${kind.toLowerCase()}-${Date.now()}-${safeName}`;
    writeFileSync(join(dir, filename), file.buffer);
    return `${this.publicBase}/api/uploads/${listingId}/${filename}`;
  }
}
