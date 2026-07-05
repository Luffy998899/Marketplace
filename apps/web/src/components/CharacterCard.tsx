'use client';

import { formatMoney, type CharacterCardDTO } from '@acm/shared';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BlurImage } from './BlurImage';

const LICENSE_LABEL: Record<string, string> = {
  ONE_TIME: '$1 use',
  CAMPAIGN: 'Campaign',
  FULL_RIGHTS: 'Full rights',
  COMMISSION: 'Commission',
};

export function CharacterCard({ character }: { character: CharacterCardDTO }) {
  const c = character;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="group relative"
    >
      <Link
        href={`/character/${c.slug}`}
        className="card-surface block overflow-hidden rounded-2xl focus:outline-none focus:ring-2 focus:ring-neon-400"
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <BlurImage
            src={c.cover.url}
            alt={c.name}
            blurDataUrl={c.cover.blurDataUrl}
            className="transition-transform duration-500 group-hover:scale-105"
          />

          {/* watermark hint — previews are always watermarked */}
          <span className="pointer-events-none absolute right-2 top-2 rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/70 backdrop-blur">
            preview
          </span>

          {!c.available && (
            <span className="absolute left-2 top-2 rounded-md bg-rose-500/80 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
              Licensed
            </span>
          )}

          {/* Always-visible bottom gradient with essentials */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{c.name}</p>
                <p className="truncate text-xs capitalize text-white/60">{c.niche}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/60">from</p>
                <p className="text-sm font-bold text-neon-300">
                  {formatMoney(c.fromPriceMinor, c.currency)}
                </p>
              </div>
            </div>
          </div>

          {/* Hover reveal — richer detail */}
          <div className="absolute inset-0 flex flex-col justify-between bg-ink-950/70 p-3 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] capitalize text-white/80">
                {c.style}
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-amber-300">
                ★ {c.rating.toFixed(1)}
                <span className="text-white/50">({c.ratingCount})</span>
              </span>
            </div>

            <div>
              <p className="text-base font-semibold text-white">{c.name}</p>
              {c.tagline && <p className="mt-0.5 text-xs text-white/70">{c.tagline}</p>}
              <div className="mt-2 flex flex-wrap gap-1">
                {c.licenseTypes.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-neon-500/40 bg-neon-500/10 px-1.5 py-0.5 text-[10px] font-medium text-neon-300"
                  >
                    {LICENSE_LABEL[t] ?? t}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-white/60">
                <span className="truncate">{c.ownerName}</span>
                {c.verified && <span className="text-accent">✓</span>}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
