'use client';

import { formatMoney, type CharacterCardDTO } from '@acm/shared';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BlurImage } from './BlurImage';

const LICENSE_LABEL: Record<string, string> = {
  ONE_TIME: '$1',
  CAMPAIGN: 'Campaign',
  FULL_RIGHTS: 'Full rights',
  COMMISSION: 'Gig',
};

export function CharacterCard({ character, index = 0 }: { character: CharacterCardDTO; index?: number }) {
  const c = character;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.03, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <Link
        href={`/character/${c.slug}`}
        className="card-surface card-interactive block overflow-hidden rounded-card focus:outline-none focus-visible:shadow-lime"
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-canvas-deep">
          <BlurImage
            src={c.cover.url}
            alt={c.name}
            blurDataUrl={c.cover.blurDataUrl}
            className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />

          {/* Bottom scrim — always on */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1113] via-transparent to-transparent opacity-90" />

          <span className="pointer-events-none absolute right-2.5 top-2.5 rounded-md bg-black/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-label text-ink-secondary backdrop-blur-sm">
            Preview
          </span>

          {!c.available && (
            <span className="absolute left-2.5 top-2.5 rounded-pill bg-surface/90 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-label text-ink-secondary backdrop-blur-sm">
              Licensed
            </span>
          )}

          {/* Default info strip */}
          <div className="absolute inset-x-0 bottom-0 p-3.5">
            <p className="truncate font-display text-sm font-bold uppercase tracking-wide text-ink">
              {c.name}
            </p>
            <div className="mt-1 flex items-end justify-between gap-2">
              <span className="text-[11px] font-medium uppercase tracking-label text-ink-dim capitalize">
                {c.niche}
              </span>
              <div className="text-right">
                <p className="text-[9px] font-semibold uppercase tracking-label text-ink-dim">from</p>
                <p className="font-display text-base font-bold text-lime">
                  {formatMoney(c.fromPriceMinor, c.currency)}
                </p>
              </div>
            </div>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 flex flex-col justify-between bg-canvas/85 p-3.5 opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex items-start justify-between gap-2">
              <span className="chip chip-active !text-[10px] capitalize">{c.style}</span>
              <span className="text-xs font-semibold text-lime">★ {c.rating.toFixed(1)}</span>
            </div>

            <div>
              <p className="font-display text-lg font-bold uppercase tracking-wide text-ink">{c.name}</p>
              {c.tagline && (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-secondary">{c.tagline}</p>
              )}
              <div className="mt-2.5 flex flex-wrap gap-1">
                {c.licenseTypes.map((t) => (
                  <span key={t} className="badge-lime !px-2 !py-0.5 !text-[9px]">
                    {LICENSE_LABEL[t] ?? t}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[10px] font-medium uppercase tracking-label text-ink-dim">
                {c.ownerName}
                {c.verified && <span className="ml-1 text-lime">✓</span>}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
