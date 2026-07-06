import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { assertSafeAssetUrl } from '../common/safe-url';
import {
  AssetKind,
  CharacterStatus,
  DEFAULT_CURRENCY,
  LicenseType,
  LISTING_STEPS,
  LOCKED_ASSET_KINDS,
  OwnerType,
  ModerationDecision,
  type CharacterCardDTO,
  type CharacterDetailDTO,
  type CreateListingInput,
  type CreatorListingDTO,
  type CreatorStatsDTO,
  type LicenseTierDTO,
  type ListingAssetDTO,
  type ListingChecklistDTO,
  type ListingStep,
  type MediaAssetDTO,
  type UpdateListingInput,
  type UploadListingAssetInput,
} from '@acm/shared';
import { createHash, randomUUID } from 'node:crypto';
import { InMemoryLedgerService } from '../ledger/ledger.service';

interface ListingRecord extends CreatorListingDTO {
  creatorDisplayName: string;
}

const REQUIRED_PUBLIC_ASSETS: AssetKind[] = [AssetKind.PREVIEW_IMAGE];
const REQUIRED_LOCKED_ASSETS: AssetKind[] = [
  AssetKind.CHARACTER_SHEET,
  AssetKind.LORA,
  AssetKind.PROMPT_PACK,
];

@Injectable()
export class StudioService {
  private readonly listings = new Map<string, ListingRecord>();
  private readonly byCreator = new Map<string, Set<string>>();
  private readonly bySlug = new Map<string, string>();

  constructor(private readonly ledger: InMemoryLedgerService) {}

  listByCreator(creatorId: string): CreatorListingDTO[] {
    const ids = this.byCreator.get(creatorId);
    if (!ids) return [];
    return [...ids]
      .map((id) => this.listings.get(id)!)
      .filter(Boolean)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((r) => this.toDto(r));
  }

  getById(creatorId: string, listingId: string): CreatorListingDTO {
    const record = this.requireOwned(creatorId, listingId);
    return this.toDto(record);
  }

  stats(creatorId: string): Promise<CreatorStatsDTO> {
    const items = this.listByCreator(creatorId);
    return this.ledger
      .getBalance(
        { kind: 'user', userId: creatorId, walletType: 'PAYOUT_PENDING' },
        DEFAULT_CURRENCY,
      )
      .then((payout) => ({
        totalListings: items.length,
        liveListings: items.filter((l) => l.status === CharacterStatus.LIVE).length,
        draftListings: items.filter((l) => l.status === CharacterStatus.DRAFT).length,
        inReviewListings: items.filter((l) => l.status === CharacterStatus.IN_REVIEW).length,
        payoutPendingMinor: payout.amountMinor,
        currency: payout.currency,
      }));
  }

  create(creatorId: string, creatorDisplayName: string, input: CreateListingInput): CreatorListingDTO {
    const id = `lst_${randomUUID()}`;
    const slug = `${slugify(input.name)}-${id.slice(-6)}`;
    const now = new Date().toISOString();

    const licenseTiers: LicenseTierDTO[] = [
      {
        id: `${id}-t1`,
        type: LicenseType.ONE_TIME,
        name: 'One-time use',
        description: 'Single-use license for one asset render.',
        priceMinor: 100,
        currency: DEFAULT_CURRENCY,
        exclusive: false,
      },
      {
        id: `${id}-t2`,
        type: LicenseType.FULL_RIGHTS,
        name: 'Full rights (exclusive)',
        description: 'Exclusive transfer of all commercial rights.',
        priceMinor: 25000,
        currency: DEFAULT_CURRENCY,
        exclusive: true,
      },
    ];

    const assets: ListingAssetDTO[] = [
      ...REQUIRED_PUBLIC_ASSETS.map((kind) => ({
        id: `${id}-${kind}`,
        kind,
        label: kind === AssetKind.PREVIEW_IMAGE ? 'Cover preview' : kind,
        isLocked: false,
        uploaded: false,
      })),
      {
        id: `${id}-video`,
        kind: AssetKind.VIDEO,
        label: 'Preview loop (optional)',
        isLocked: false,
        uploaded: false,
      },
      ...REQUIRED_LOCKED_ASSETS.map((kind) => ({
        id: `${id}-${kind}`,
        kind,
        label: assetLabel(kind),
        isLocked: true,
        uploaded: false,
      })),
    ];

    const record: ListingRecord = {
      id,
      creatorId,
      creatorDisplayName,
      slug,
      name: input.name.trim(),
      tagline: input.tagline?.trim(),
      niche: input.niche,
      style: input.style,
      gender: input.gender,
      ethnicity: input.ethnicity,
      tags: [input.style, input.niche, input.gender],
      status: CharacterStatus.DRAFT,
      ownerType: OwnerType.CREATOR,
      checklist: emptyChecklist(),
      gallery: [],
      assets,
      licenseTiers,
      fromPriceMinor: 100,
      currency: DEFAULT_CURRENCY,
      licenseTypes: [LicenseType.ONE_TIME, LicenseType.FULL_RIGHTS],
      available: true,
      createdAt: now,
      updatedAt: now,
    };

    this.listings.set(id, record);
    this.bySlug.set(slug, id);
    if (!this.byCreator.has(creatorId)) this.byCreator.set(creatorId, new Set());
    this.byCreator.get(creatorId)!.add(id);
    return this.toDto(record);
  }

  update(creatorId: string, listingId: string, input: UpdateListingInput): CreatorListingDTO {
    const record = this.requireOwned(creatorId, listingId);
    this.assertEditable(record);
    if (input.name) record.name = input.name.trim();
    if (input.tagline !== undefined) record.tagline = input.tagline.trim() || undefined;
    if (input.description !== undefined) record.description = input.description.trim() || undefined;
    if (input.niche) record.niche = input.niche;
    if (input.style) record.style = input.style;
    if (input.gender) record.gender = input.gender;
    if (input.ethnicity) record.ethnicity = input.ethnicity;
    record.tags = [record.style, record.niche, record.gender];
    record.updatedAt = new Date().toISOString();
    return this.toDto(record);
  }

  confirmIdentity(creatorId: string, listingId: string): CreatorListingDTO {
    const record = this.requireOwned(creatorId, listingId);
    this.assertEditable(record);
    if (!record.name || !record.niche || !record.style) {
      throw new BadRequestException('Complete character name, niche, and style first.');
    }
    record.checklist.identityConfirmed = true;
    record.checklist.currentStep = nextStep(record.checklist);
    record.updatedAt = new Date().toISOString();
    return this.toDto(record);
  }

  uploadAsset(
    creatorId: string,
    listingId: string,
    input: UploadListingAssetInput,
  ): CreatorListingDTO {
    const record = this.requireOwned(creatorId, listingId);
    this.assertEditable(record);
    if (!input.url?.trim()) throw new BadRequestException('Asset URL is required');
    const safeUrl = assertSafeAssetUrl(input.url, 'asset URL');

    const asset = record.assets.find((a) => a.kind === input.kind);
    if (!asset) throw new BadRequestException(`Asset kind ${input.kind} not expected for this listing`);

    asset.url = safeUrl;
    asset.uploaded = true;
    if (input.label) asset.label = input.label;

    const media: MediaAssetDTO = {
      id: asset.id,
      kind: input.kind as MediaAssetDTO['kind'],
      url: asset.url,
      width: 800,
      height: 1000,
    };

    if (input.kind === AssetKind.PREVIEW_IMAGE) {
      record.cover = media;
    } else if (input.kind === AssetKind.VIDEO) {
      record.previewVideo = media;
    } else if (
      input.kind === AssetKind.GALLERY_IMAGE ||
      (!LOCKED_ASSET_KINDS.includes(input.kind) && !record.gallery.some((g) => g.id === media.id))
    ) {
      if (input.kind === AssetKind.GALLERY_IMAGE) record.gallery.push(media);
    }

    const publicOk = REQUIRED_PUBLIC_ASSETS.every((k) =>
      record.assets.find((a) => a.kind === k)?.uploaded,
    );
    const lockedOk = REQUIRED_LOCKED_ASSETS.every((k) =>
      record.assets.find((a) => a.kind === k)?.uploaded,
    );
    record.checklist.assetsUploaded = publicOk && lockedOk;
    if (record.checklist.assetsUploaded) {
      record.checklist.currentStep = advancePast(record.checklist, 'ASSET_UPLOAD');
    }
    record.updatedAt = new Date().toISOString();
    return this.toDto(record);
  }

  stampSynthId(creatorId: string, listingId: string): CreatorListingDTO {
    const record = this.requireOwned(creatorId, listingId);
    this.assertEditable(record);
    if (!record.checklist.assetsUploaded) {
      throw new BadRequestException('Upload required assets before SynthID stamping.');
    }
    const payload = `${record.id}:${record.creatorId}:${record.slug}:${Date.now()}`;
    record.synthIdHash = createHash('sha256').update(payload).digest('hex');
    record.watermarkFingerprint = createHash('sha256')
      .update(`wm:${record.synthIdHash}`)
      .digest('hex')
      .slice(0, 16);
    record.checklist.synthIdStamped = true;
    record.checklist.currentStep = advancePast(record.checklist, 'SYNTHID_WATERMARK');
    record.updatedAt = new Date().toISOString();
    return this.toDto(record);
  }

  signRights(creatorId: string, listingId: string): CreatorListingDTO {
    const record = this.requireOwned(creatorId, listingId);
    this.assertEditable(record);
    if (!record.checklist.synthIdStamped) {
      throw new BadRequestException('Complete SynthID stamping first.');
    }
    const declaration =
      'I declare this character is fully synthetic, contains no real-person likeness, ' +
      'and I hold the rights to license it on Synthetica.';
    const hash = createHash('sha256').update(`${record.id}:${declaration}`).digest('hex');
    record.checklist.rightsDeclared = true;
    record.checklist.ipDeclarationSigned = true;
    record.checklist.ipDeclarationHash = hash;
    record.checklist.signedAt = new Date().toISOString();
    record.checklist.currentStep = advancePast(record.checklist, 'RIGHTS_DECLARATION');
    record.updatedAt = new Date().toISOString();
    return this.toDto(record);
  }

  submitForReview(creatorId: string, listingId: string): CreatorListingDTO {
    const record = this.requireOwned(creatorId, listingId);
    this.assertEditable(record);
    if (!record.checklist.rightsDeclared) {
      throw new BadRequestException('Complete all prior steps before submitting.');
    }
    record.status = CharacterStatus.IN_REVIEW;
    record.checklist.currentStep = 'MODERATION_REVIEW';
    record.moderationDecision = ModerationDecision.PENDING;
    record.updatedAt = new Date().toISOString();

    const autoApprove = process.env.MODERATION_AUTO_APPROVE !== 'false';
    if (autoApprove) {
      return this.approveListing(record.id, 'Auto-approved (MODERATION_AUTO_APPROVE=true).');
    }
    return this.toDto(record);
  }

  listPendingReview(): CreatorListingDTO[] {
    return [...this.listings.values()]
      .filter((r) => r.status === CharacterStatus.IN_REVIEW)
      .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
      .map((r) => this.toDto(r));
  }

  approveListing(listingId: string, notes?: string): CreatorListingDTO {
    const record = this.listings.get(listingId);
    if (!record) throw new NotFoundException('Listing not found');
    record.status = CharacterStatus.LIVE;
    record.checklist.moderationPassed = true;
    record.checklist.currentStep = 'MODERATION_REVIEW';
    record.moderationDecision = ModerationDecision.APPROVED;
    record.moderationNotes = notes;
    record.updatedAt = new Date().toISOString();
    return this.toDto(record);
  }

  rejectListing(listingId: string, notes: string): CreatorListingDTO {
    const record = this.listings.get(listingId);
    if (!record) throw new NotFoundException('Listing not found');
    record.status = CharacterStatus.CHANGES_REQUESTED;
    record.checklist.moderationPassed = false;
    record.moderationDecision = ModerationDecision.REJECTED;
    record.moderationNotes = notes;
    record.checklist.currentStep = 'RIGHTS_DECLARATION';
    record.updatedAt = new Date().toISOString();
    return this.toDto(record);
  }

  getLiveCards(): CharacterCardDTO[] {
    return [...this.listings.values()]
      .filter((r) => r.status === CharacterStatus.LIVE)
      .map((r) => this.toCardDto(r));
  }

  getDetailBySlug(slug: string): CharacterDetailDTO | null {
    const id = this.bySlug.get(slug);
    if (!id) return null;
    const record = this.listings.get(id);
    if (!record || record.status !== CharacterStatus.LIVE) return null;
    return this.toDetailDto(record);
  }

  getCreatorIdForSlug(slug: string): string | undefined {
    const id = this.bySlug.get(slug);
    return id ? this.listings.get(id)?.creatorId : undefined;
  }

  markExclusiveSold(slug: string): void {
    const id = this.bySlug.get(slug);
    if (!id) return;
    const record = this.listings.get(id);
    if (!record) return;
    record.available = false;
    record.updatedAt = new Date().toISOString();
  }

  private requireOwned(creatorId: string, listingId: string): ListingRecord {
    const record = this.listings.get(listingId);
    if (!record) throw new NotFoundException('Listing not found');
    if (record.creatorId !== creatorId) throw new ForbiddenException('Not your listing');
    return record;
  }

  private assertEditable(record: ListingRecord) {
    if (
      record.status !== CharacterStatus.DRAFT &&
      record.status !== CharacterStatus.CHANGES_REQUESTED
    ) {
      throw new BadRequestException('Listing cannot be edited in its current status');
    }
  }

  private toDto(record: ListingRecord): CreatorListingDTO {
    const { creatorDisplayName: _, ...dto } = record;
    return dto;
  }

  private toCardDto(record: ListingRecord): CharacterCardDTO {
    return {
      id: record.id,
      slug: record.slug,
      name: record.name,
      tagline: record.tagline,
      category: record.niche,
      niche: record.niche,
      style: record.style,
      gender: record.gender,
      ethnicity: record.ethnicity,
      tags: record.tags,
      rating: 0,
      ratingCount: 0,
      status: record.status,
      ownerName: record.creatorDisplayName,
      verified: false,
      cover: record.cover ?? placeholderCover(record.slug),
      previewVideo: record.previewVideo,
      fromPriceMinor: record.fromPriceMinor,
      currency: record.currency,
      licenseTypes: record.licenseTypes,
      available: record.available,
    };
  }

  private toDetailDto(record: ListingRecord): CharacterDetailDTO {
    const card = this.toCardDto(record);
    return {
      ...card,
      description:
        record.description ??
        'A fully synthetic AI character listed by an independent creator on Synthetica.',
      socials: { instagram: `@${record.slug}` },
      gallery: record.cover ? [record.cover, ...record.gallery] : record.gallery,
      licenseTiers: record.licenseTiers,
      lockedAssets: record.assets
        .filter((a) => a.isLocked)
        .map((a) => ({ kind: a.kind, label: a.label })),
      synthIdVerified: !!record.synthIdHash,
    };
  }
}

function emptyChecklist(): ListingChecklistDTO {
  return {
    identityConfirmed: false,
    assetsUploaded: false,
    synthIdStamped: false,
    rightsDeclared: false,
    moderationPassed: false,
    currentStep: 'IDENTITY_OWNERSHIP',
    ipDeclarationSigned: false,
  };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function assetLabel(kind: AssetKind): string {
  switch (kind) {
    case AssetKind.CHARACTER_SHEET:
      return 'Character sheet / shot bible';
    case AssetKind.LORA:
      return 'LoRA model weights';
    case AssetKind.PROMPT_PACK:
      return 'Prompt pack';
    default:
      return kind;
  }
}

function nextStep(checklist: ListingChecklistDTO): ListingStep {
  const idx = LISTING_STEPS.indexOf(checklist.currentStep);
  return LISTING_STEPS[Math.min(idx + 1, LISTING_STEPS.length - 1)]!;
}

function advancePast(checklist: ListingChecklistDTO, completed: ListingStep): ListingStep {
  const idx = LISTING_STEPS.indexOf(completed);
  return LISTING_STEPS[Math.min(idx + 1, LISTING_STEPS.length - 1)]!;
}

function placeholderCover(slug: string): MediaAssetDTO {
  return {
    id: `${slug}-placeholder`,
    kind: AssetKind.PREVIEW_IMAGE,
    url: `https://picsum.photos/seed/${slug}/800/1000`,
    width: 800,
    height: 1000,
  };
}
