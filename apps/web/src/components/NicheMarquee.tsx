'use client';

import { NICHE_OPTIONS } from '@acm/shared';

const ITEMS = [...NICHE_OPTIONS, ...NICHE_OPTIONS];

/** Infinite scroll marquee — ambient motion under hero. */
export function NicheMarquee() {
  return (
    <div className="relative mt-10 overflow-hidden border-y border-border-subtle py-3">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-canvas to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-canvas to-transparent" />
      <div className="marquee-track flex w-max gap-8">
        {ITEMS.map((niche, i) => (
          <span
            key={`${niche}-${i}`}
            className="whitespace-nowrap font-display text-xs font-bold uppercase tracking-[0.2em] text-ink-dim"
          >
            {niche}
          </span>
        ))}
      </div>
    </div>
  );
}
