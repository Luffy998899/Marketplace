import {
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { AssetKind, getMockCharacterBySlug, type SignedAssetUrlDTO } from '@acm/shared';
import type { Response } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { CurrentUser, JwtPayload } from '../auth/auth.decorators';
import { JwtAuthGuard } from '../auth/auth.guards';
import { OrdersService } from '../orders/orders.service';

const LOCKED_LABELS: Record<string, string> = {
  [AssetKind.CHARACTER_SHEET]: 'Character sheet / shot bible',
  [AssetKind.LORA]: 'LoRA model weights',
  [AssetKind.PROMPT_PACK]: 'Prompt pack',
};

@Controller('assets')
export class AssetsController {
  private readonly secret =
    process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret_change_me';
  private readonly ttlSeconds = Number(process.env.SIGNED_URL_TTL_SECONDS ?? 300);
  private readonly apiBase =
    process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.API_PORT ?? 4000}`;

  constructor(private readonly orders: OrdersService) {}

  /** List signed, expiring download URLs for locked assets (license required). */
  @Get(':characterSlug/downloads')
  @UseGuards(JwtAuthGuard)
  downloads(
    @CurrentUser() user: JwtPayload,
    @Param('characterSlug') characterSlug: string,
  ): SignedAssetUrlDTO[] {
    const license = this.orders.buyerOwnsCharacter(user.sub, characterSlug);
    if (!license) {
      throw new ForbiddenException('No valid license for this character');
    }

    const character = getMockCharacterBySlug(characterSlug);
    if (!character) throw new NotFoundException('Character not found');

    const expiresAt = new Date(Date.now() + this.ttlSeconds * 1000).toISOString();
    const expiresMs = new Date(expiresAt).getTime();

    return character.lockedAssets.map((asset) => {
      const storageKey = `locked/${characterSlug}/${asset.kind.toLowerCase()}.zip`;
      const sig = this.sign(storageKey, expiresMs);
      const url = `${this.apiBase}/api/assets/download?key=${encodeURIComponent(storageKey)}&expires=${expiresMs}&sig=${sig}`;
      return {
        url,
        expiresAt,
        assetKind: asset.kind,
        label: asset.label ?? LOCKED_LABELS[asset.kind] ?? asset.kind,
      };
    });
  }

  /** Verify HMAC signature + expiry, then serve the gated asset. */
  @Get('download')
  download(
    @Query('key') key: string,
    @Query('expires') expires: string,
    @Query('sig') sig: string,
    @Res() res: Response,
  ) {
    if (!key || !expires || !sig) throw new ForbiddenException('Invalid download link');

    const expiresMs = Number(expires);
    if (Number.isNaN(expiresMs) || Date.now() > expiresMs) {
      throw new ForbiddenException('Download link expired');
    }

    const expected = this.sign(key, expiresMs);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new ForbiddenException('Invalid download signature');
    }

    // Phase 1: return a placeholder payload. Production swaps to S3/R2 presigned redirect.
    const filename = key.split('/').pop() ?? 'asset.zip';
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store');
    res.send(
      Buffer.from(
        `Synthetica gated asset placeholder\nkey=${key}\nDelivered via signed expiring URL.\n`,
      ),
    );
  }

  private sign(storageKey: string, expiresMs: number): string {
    return createHmac('sha256', this.secret)
      .update(`${storageKey}:${expiresMs}`)
      .digest('hex');
  }
}
