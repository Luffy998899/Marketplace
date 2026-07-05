import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  DEFAULT_CURRENCY,
  LicenseType,
  PLATFORM_TAKE_RATE_BPS,
  getMockCharacterBySlug,
  splitByTakeRate,
  type CharacterDetailDTO,
  type OrderDTO,
} from '@acm/shared';
import { createHash, randomUUID } from 'node:crypto';
import { EscrowServiceImpl } from '../ledger/escrow.service';
import { InMemoryLedgerService } from '../ledger/ledger.service';

export interface PurchaseInput {
  buyerId: string;
  characterSlug: string;
  licenseTierId: string;
}

export interface PurchaseResult extends OrderDTO {}

@Injectable()
export class OrdersService {
  private readonly orders = new Map<string, PurchaseResult>();
  private readonly byBuyer = new Map<string, Set<string>>();

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

    await this.escrow.hold(orderId, amount, input.buyerId);

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
        buyerId: input.buyerId,
        characterSlug: input.characterSlug,
        characterName: character.name,
        licenseType: tier.type,
        amountMinor: amount.amountMinor,
        currency: amount.currency,
        commissionMinor,
        sellerNetMinor,
        escrowStatus: 'RELEASED',
        certificate,
        purchasedAt: new Date().toISOString(),
      };
      this.orders.set(orderId, result);
      if (!this.byBuyer.has(input.buyerId)) this.byBuyer.set(input.buyerId, new Set());
      this.byBuyer.get(input.buyerId)!.add(orderId);
      return result;
    }

    throw new BadRequestException(`License type ${tier.type} checkout not yet supported`);
  }

  getOrder(orderId: string): PurchaseResult | undefined {
    return this.orders.get(orderId);
  }

  listByBuyer(buyerId: string): PurchaseResult[] {
    const ids = this.byBuyer.get(buyerId);
    if (!ids) return [];
    return [...ids]
      .map((id) => this.orders.get(id)!)
      .filter(Boolean)
      .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt));
  }

  buyerOwnsCharacter(buyerId: string, characterSlug: string): PurchaseResult | undefined {
    return this.listByBuyer(buyerId).find((o) => o.characterSlug === characterSlug);
  }

  verifyCertificate(serial: string): {
    valid: boolean;
    orderId?: string;
    ledgerHash?: string;
    buyerId?: string;
    characterSlug?: string;
  } {
    for (const order of this.orders.values()) {
      if (order.certificate.serial === serial) {
        return {
          valid: true,
          orderId: order.orderId,
          ledgerHash: order.certificate.ledgerHash,
          buyerId: order.buyerId,
          characterSlug: order.characterSlug,
        };
      }
    }
    return { valid: false };
  }

  private resolvePayeeId(character: CharacterDetailDTO): string {
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
