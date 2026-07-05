export type BentoSize = 'feature' | 'tall' | 'wide' | 'standard';

/** Deterministic bento sizing — repeats every 12 cards for visual rhythm. */
const PATTERN: BentoSize[] = [
  'feature',
  'standard',
  'tall',
  'standard',
  'wide',
  'standard',
  'tall',
  'standard',
  'standard',
  'wide',
  'standard',
  'tall',
];

export function getBentoSize(index: number): BentoSize {
  return PATTERN[index % PATTERN.length]!;
}

/** Tailwind classes for 2 / 4 / 6-column responsive bento grid. */
export const BENTO_SPAN: Record<BentoSize, string> = {
  feature: 'bento-feature',
  tall: 'bento-tall',
  wide: 'bento-wide',
  standard: 'bento-standard',
};
