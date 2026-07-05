import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  DEFAULT_CURRENCY,
  LicenseType,
  PLATFORM_TAKE_RATE_BPS,
  getMockCharacterBySlug,
  splitByTakeRate,
  type CharacterDetailDTO,
} from '@acm/shared';
import { createHash, randomUUID } from 'node:crypto';
import { EscrowServiceImpl } from '../ledger/escrow.service';
import { InMemoryLedgerService } from '../ledger/ledger.service';

export interface PurchaseInput {
  buyerId: string;
  characterSlug: string;
  licenseTierId: string;
}

export interface PurchaseResult {
  orderId: string;
  characterSlug: string;
  licenseType: LicenseType;
  amountMinor: number;
  currency: string;
  commissionMinor: number;
  sellerNetMinor: number;
  escrowStatus: 'RELEASED';
  certificate: {
    serial: string;
    issuedAt: string;
    signature: string;
    ledgerHash: string;
  };
}

// Wallet-based checkout: debit buyer wallet → escrow hold → auto-release for
// instant digital goods (ONE_TIME / FULL_RIGHTS) with 30% platform commission.
@Injectable()
export class OrdersService {
  private readonly orders = new Map<string, PurchaseResult>();

  constructor(
    private readonly escrow: EscrowServiceImpl,
    private readonly ledger: InMemoryLedgerService,
  ) {}

  async purchase(input: PurchaseInput): Promise<PurchaseResult> {
    const character = getMockCharacterBySlug(input.characterSlug);
    if (!character) throw new NotFoundException('Character not found');

    const tier = character.licenseTiers.find((t) => t.id === input.licenseTierId);
    if (!tier) throw new NotFoundException('License tier not found');
    if (!character.available && tier.exclusive) {
      throw new BadRequestException('Character is no longer available for exclusive license');
    }

    const orderId = `ord_${randomUUID()}`;
    const amount = { amountMinor: tier.priceMinor, currency: tier.currency ?? DEFAULT_CURRENCY };
    const { commissionMinor, sellerNetMinor } = splitByTakeRate(
      amount.amountMinor,
      PLATFORM_TAKE_RATE_BPS,
    );

    // 1. Hold buyer funds in escrow custody.
    await this.escrow.hold(orderId, amount, input.buyerId);

    // 2. Auto-release for instant digital delivery (ONE_TIME / FULL_RIGHTS).
    if (
      tier.type === LicenseType.ONE_TIME ||
      tier.type === LicenseType.FULL_RIGHTS ||
      tier.type === LicenseType.CAMPAIGN
    ) {
      const payeeUserId = this.resolvePayeeId(character);
      const release = await this.escrow.release({ orderId, payeeUserId });

      const certificate = this.issueCertificate(
        orderId,
        input.buyerId,
        character,
        tier.type,
        release.ledgerHash,
      );

      const result: PurchaseResult = {
        orderId,
        characterSlug: input.characterSlug,
        licenseType: tier.type,
        amountMinor: amount.amountMinor,
        currency: amount.currency,
        commissionMinor,
        sellerNetMinor,
        escrowStatus: 'RELEASED',
        certificate,
      };
      this.orders.set(orderId, result);
      return result;
    }

    throw new BadRequestException(`License type ${tier.type} checkout not yet supported`);
  }

  getOrder(orderId: string): PurchaseResult | undefined {
    return this.orders.get(orderId);
  }

  verifyCertificate(serial: string): { valid: boolean; orderId?: string; ledgerHash?: string } {
    for (const order of this.orders.values()) {
      if (order.certificate.serial === serial) {
        return { valid: true, orderId: order.orderId, ledgerHash: order.certificate.ledgerHash };
      }
    }
    return { valid: false };
  }

  private resolvePayeeId(character: CharacterDetailDTO): string {
    // Phase 1 org-listed characters: route payout to a synthetic org-creator id.
    return `org_payee_${character.ownerName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
  }

  private issueCertificate(
    orderId: string,
    buyerId: string,
    character: CharacterDetailDTO,
    licenseType: LicenseType,
    ledgerHash: string,
  ) {
    const serial = `ACM-${orderId.slice(-8).toUpperCase()}`;
    const payload = { orderId, buyerId, characterId: character.id, licenseType, ledgerHash };
    const signature = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    return {
      serial,
      issuedAt: new Date().toISOString(),
      signature,
      ledgerHash,
    };
  }
}
