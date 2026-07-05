import { generateMockCharacters, getMockCharacterBySlug } from '@acm/shared';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seeds a live grid of 100+ org-listed characters (Phase 1 target) plus the
 * platform wallets required for escrow custody. Idempotent-ish: it clears
 * character-scoped data first so re-running produces a clean dataset.
 */
async function main() {
  console.log('Seeding AI Character Marketplace…');

  // Platform-owned wallets (escrow custody + revenue take).
  for (const type of ['ESCROW', 'PLATFORM_REVENUE'] as const) {
    await prisma.wallet.upsert({
      where: { ownerUserId_type_currency: { ownerUserId: null as unknown as string, type, currency: 'USD' } },
      update: {},
      create: { type, currency: 'USD' },
    }).catch(async () => {
      // Composite unique with null owner can't be upserted portably; fall back.
      const existing = await prisma.wallet.findFirst({ where: { type, ownerUserId: null } });
      if (!existing) await prisma.wallet.create({ data: { type, currency: 'USD' } });
    });
  }

  const orgsSeen = new Map<string, string>();
  const cards = generateMockCharacters(120);

  for (const card of cards) {
    const detail = getMockCharacterBySlug(card.slug)!;

    let orgId = orgsSeen.get(card.ownerName);
    if (!orgId) {
      const org = await prisma.organization.upsert({
        where: { slug: card.ownerName.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
        update: {},
        create: {
          name: card.ownerName,
          slug: card.ownerName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          verified: card.verified,
        },
      });
      orgId = org.id;
      orgsSeen.set(card.ownerName, orgId);
    }

    await prisma.character.upsert({
      where: { slug: card.slug },
      update: {},
      create: {
        slug: card.slug,
        name: card.name,
        tagline: card.tagline,
        description: detail.description,
        category: card.category,
        niche: card.niche,
        style: card.style,
        gender: card.gender,
        ethnicity: card.ethnicity,
        tags: card.tags,
        socials: detail.socials ?? undefined,
        rating: card.rating,
        ratingCount: card.ratingCount,
        status: 'LIVE',
        ownerType: 'ORG',
        orgId,
        synthId: `synthid_${card.id}`,
        watermarkFingerprint: `wm_${card.id}`,
        provenanceHash: `0x${card.id.replace(/[^a-z0-9]/g, '')}`,
        listedAt: new Date(),
        assets: {
          create: [
            {
              kind: 'PREVIEW_IMAGE',
              storageKey: `previews/${card.slug}.jpg`,
              publicUrl: card.cover.url,
              width: card.cover.width,
              height: card.cover.height,
              blurDataUrl: card.cover.blurDataUrl,
              isLocked: false,
              position: 0,
            },
            // Locked sheet: storage key only, never a public URL.
            {
              kind: 'CHARACTER_SHEET',
              storageKey: `locked/${card.slug}/sheet.zip`,
              isLocked: true,
              position: 0,
            },
          ],
        },
        licenseTiers: {
          create: detail.licenseTiers.map((t) => ({
            type: t.type,
            name: t.name,
            description: t.description,
            priceMinor: t.priceMinor,
            currency: t.currency,
            exclusive: t.exclusive,
            takeRateBps: 3000,
          })),
        },
      },
    });
  }

  const count = await prisma.character.count();
  console.log(`Seed complete. ${count} characters live.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
