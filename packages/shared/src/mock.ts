import type { CharacterCardDTO, CharacterDetailDTO, MediaAssetDTO } from './dto.js';
import { AssetKind, CharacterStatus, LicenseType } from './enums.js';
import {
  ETHNICITY_OPTIONS,
  GENDER_OPTIONS,
  NICHE_OPTIONS,
  STYLE_OPTIONS,
} from './filters.js';

// ============================================================================
// Deterministic mock dataset (Phase 1)
// ============================================================================
// Generates 100+ fully synthetic AI characters with stable ids/images so the
// homepage grid can be built and demoed before the API/DB are wired up. All
// imagery uses seeded placeholder photos; nothing here implies a real person.
// ============================================================================

// Small seeded PRNG (mulberry32) — deterministic across web + api.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = [
  'Aria', 'Nova', 'Kai', 'Zara', 'Luna', 'Ren', 'Mira', 'Iris', 'Neo', 'Vera',
  'Rin', 'Suki', 'Dax', 'Elowen', 'Juno', 'Kira', 'Milo', 'Sage', 'Talia', 'Vega',
  'Cleo', 'Onyx', 'Freya', 'Atlas', 'Yara', 'Enzo', 'Lyra', 'Rael', 'Nyx', ' Evi',
];
const LAST = [
  'Vale', 'Storm', 'Quinn', 'Frost', 'Rey', 'Sol', 'Blaze', 'Voss', 'Wilde', 'Cruz',
  'Sterling', 'Noir', 'Vega', 'Ashe', 'Rune', 'Sky', 'Onyx', 'Vex', 'Lux', 'Zen',
];
const TAGLINES = [
  'Synthetic muse for bold brands',
  'The face of tomorrow, today',
  'Always on, always iconic',
  'Your next campaign lead',
  'Born in latent space',
  'Pixel-perfect brand ambassador',
  'A vibe you can license',
  'Editorial-grade AI persona',
];
const ORGS = [
  { name: 'Synthetica Studios', verified: true },
  { name: 'Latent Faces Co.', verified: true },
  { name: 'NovaForge Labs', verified: false },
  { name: 'Prism AI House', verified: true },
  { name: 'Hyperreal Collective', verified: false },
];

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// A 1x1-ish shimmer blur placeholder encoded as a data URL. Cheap + inline,
// exercises next/image blur-up without shipping real LQIP bytes in mocks.
function blurDataUrl(hue: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="10"><rect width="8" height="10" fill="hsl(${hue} 40% 20%)"/></svg>`;
  const b64 = typeof btoa === 'function' ? btoa(svg) : Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${b64}`;
}

function media(seed: string, kind: MediaAssetDTO['kind'], w: number, h: number, hue: number): MediaAssetDTO {
  return {
    id: `${seed}-${kind}`,
    kind,
    // Seeded placeholder image. In production this is a watermarked CDN asset.
    url: `https://picsum.photos/seed/${seed}/${w}/${h}`,
    width: w,
    height: h,
    blurDataUrl: blurDataUrl(hue),
  };
}

const ASPECTS: Array<[number, number]> = [
  [800, 1000],
  [800, 1200],
  [800, 800],
  [800, 1100],
  [800, 900],
];

export function generateMockCharacters(count = 120): CharacterCardDTO[] {
  const list: CharacterCardDTO[] = [];
  for (let i = 0; i < count; i++) {
    const rng = mulberry32(i * 2654435761 + 12345);
    const first = pick(rng, FIRST).trim();
    const last = pick(rng, LAST).trim();
    const name = `${first} ${last}`;
    const slug = `${slugify(name)}-${i}`;
    const niche = pick(rng, NICHE_OPTIONS);
    const style = pick(rng, STYLE_OPTIONS);
    const gender = pick(rng, GENDER_OPTIONS);
    const ethnicity = pick(rng, ETHNICITY_OPTIONS);
    const org = pick(rng, ORGS);
    const [w, h] = pick(rng, ASPECTS);
    const hue = Math.floor(rng() * 360);
    const rating = Math.round((3.5 + rng() * 1.5) * 10) / 10;
    const ratingCount = Math.floor(rng() * 900) + 5;

    // Every live character offers the $1 one-time tier; some add full-rights.
    const hasFullRights = rng() > 0.4;
    const hasCampaign = rng() > 0.5;
    const fullRightsPrice = (Math.floor(rng() * 40) + 10) * 10000; // $100–$500
    const licenseTypes: LicenseType[] = [LicenseType.ONE_TIME];
    if (hasCampaign) licenseTypes.push(LicenseType.CAMPAIGN);
    if (hasFullRights) licenseTypes.push(LicenseType.FULL_RIGHTS);

    const available = rng() > 0.08; // a few are exclusively licensed already

    list.push({
      id: `chr_${i.toString().padStart(4, '0')}`,
      slug,
      name,
      tagline: pick(rng, TAGLINES),
      category: niche,
      niche,
      style,
      gender,
      ethnicity,
      tags: [style, niche, gender],
      rating,
      ratingCount,
      status: CharacterStatus.LIVE,
      ownerName: org.name,
      verified: org.verified,
      cover: media(slug, AssetKind.PREVIEW_IMAGE, w, h, hue),
      fromPriceMinor: 100, // $1 one-time
      currency: 'USD',
      licenseTypes,
      available,
    });
    // stash full-rights price on a parallel structure via detail generator
    void fullRightsPrice;
  }
  return list;
}

export const MOCK_CHARACTERS: CharacterCardDTO[] = generateMockCharacters(120);

export function getMockCharacterBySlug(slug: string): CharacterDetailDTO | null {
  const card = MOCK_CHARACTERS.find((c) => c.slug === slug);
  if (!card) return null;
  const rng = mulberry32(slug.length * 7919 + 17);
  const hue = Math.floor(rng() * 360);
  const gallery: MediaAssetDTO[] = Array.from({ length: 6 }, (_, g) => {
    const [w, h] = ASPECTS[g % ASPECTS.length]!;
    return media(`${slug}-g${g}`, AssetKind.GALLERY_IMAGE, w, h, (hue + g * 40) % 360);
  });

  const licenseTiers = [
    {
      id: `${card.id}-t1`,
      type: LicenseType.ONE_TIME,
      name: 'One-time use',
      description: 'Single-use license for one asset render.',
      priceMinor: 100,
      currency: 'USD',
      exclusive: false,
    },
    ...(card.licenseTypes.includes(LicenseType.CAMPAIGN)
      ? [
          {
            id: `${card.id}-t2`,
            type: LicenseType.CAMPAIGN,
            name: 'Campaign',
            description: 'Time + scope bound usage for a marketing campaign.',
            priceMinor: 4900,
            currency: 'USD',
            exclusive: false,
          },
        ]
      : []),
    ...(card.licenseTypes.includes(LicenseType.FULL_RIGHTS)
      ? [
          {
            id: `${card.id}-t3`,
            type: LicenseType.FULL_RIGHTS,
            name: 'Full rights (exclusive)',
            description: 'Exclusive transfer of all commercial rights.',
            priceMinor: (Math.floor(rng() * 40) + 10) * 10000,
            currency: 'USD',
            exclusive: true,
          },
        ]
      : []),
  ];

  return {
    ...card,
    description:
      'A fully synthetic AI character generated in latent space. No real-person likeness. ' +
      'Licensed assets are delivered as watermark-free renders plus the locked character sheet ' +
      'via a signed, expiring URL after purchase.',
    socials: { instagram: `@${card.slug}`, tiktok: `@${card.slug}` },
    gallery: [card.cover, ...gallery],
    licenseTiers,
    lockedAssets: [
      { kind: AssetKind.CHARACTER_SHEET, label: 'Character sheet / shot bible' },
      { kind: AssetKind.LORA, label: 'LoRA model weights' },
      { kind: AssetKind.PROMPT_PACK, label: 'Prompt pack' },
    ],
    synthIdVerified: true,
  };
}
