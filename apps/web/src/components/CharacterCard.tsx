'use client';

import { formatMoney, type CharacterCardDTO } from '@acm/shared';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BENTO_SPAN, type BentoSize } from '@/lib/bento';
import { BlurImage } from './BlurImage';

const LICENSE_LABEL: Record<string, string> = {
  ONE_TIME: '$1',
  CAMPAIGN: 'Campaign',
  FULL_RIGHTS: 'Full rights',
  COMMISSION: 'Gig',
};

export function CharacterCard({
  character,
  index = 0,
  bentoSize = 'standard',
}: {
  character: CharacterCardDTO;
  index?: number;
  bentoSize?: BentoSize;
}) {
  const c = character;
  const isFeature = bentoSize === 'feature';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.025, 0.35), ease: [0.22, 1, 0.36, 1] }}
      className={`group relative h-full min-h-0 ${BENTO_SPAN[bentoSize]}`}
    >
      <Link
        href={`/character/${c.slug}`}
        className="card-surface card-interactive relative block h-full overflow-hidden rounded-card focus:outline-none focus-visible:shadow-lime"
      >
        {/* Lime accent bar — reveals on hover */}
        <div className="absolute left-0 top-0 z-10 h-0.5 w-0 bg-lime transition-all duration-500 group-hover:w-full" />

        <div className="relative h-full min-h-[140px] overflow-hidden bg-canvas-deep">
          <BlurImage
            src={c.cover.url}
            alt={c.name}
            blurDataUrl={c.cover.blurDataUrl}
            className="transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/30 to-transparent" />

          <span className="pointer-events-none absolute right-2.5 top-2.5 rounded-md bg-black/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-label text-ink-secondary backdrop-blur-sm">
            Preview
          </span>

          {!c.available && (
            <span className="absolute left-2.5 top-2.5 rounded-pill bg-surface/90 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-label text-ink-secondary backdrop-blur-sm">
              Licensed
            </span>
          )}

          <div className={`absolute inset-x-0 bottom-0 p-3.5 ${isFeature ? 'sm:p-5' : ''}`}>
            <p
              className={`truncate font-display font-bold uppercase tracking-wide text-ink ${
                isFeature ? 'text-base sm:text-xl' : 'text-sm'
              }`}
            >
              {c.name}
            </p>
            <div className="mt-1 flex items-end justify-between gap-2">
              <span className="text-[11px] font-medium uppercase tracking-label text-ink-dim capitalize">
                {c.niche}
              </span>
              <div className="text-right">
                <p className="text-[9px] font-semibold uppercase tracking-label text-ink-dim">from</p>
                <p className={`font-display font-bold text-lime ${isFeature ? 'text-xl' : 'text-base'}`}>
                  {formatMoney(c.fromPriceMinor, c.currency)}
                </p>
              </div>
            </div>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 flex flex-col justify-between bg-canvas/90 p-3.5 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100">
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
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
