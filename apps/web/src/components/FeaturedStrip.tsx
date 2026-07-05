'use client';

import { motion } from 'framer-motion';
import { formatMoney, MOCK_CHARACTERS } from '@acm/shared';
import Link from 'next/link';
import { HoverPreviewVideo } from './HoverPreviewVideo';

/** Horizontal spotlight row — Higgsfield-style full-bleed previews. */
export function FeaturedStrip() {
  const featured = MOCK_CHARACTERS.filter((c) => c.rating >= 4.5).slice(0, 8);
  if (featured.length === 0) return null;

  return (
    <section className="relative mb-6 sm:mb-8">
      <div className="mb-3 flex items-end justify-between px-0.5">
        <h2 className="font-display text-[11px] font-bold uppercase tracking-label text-ink-dim">
          Spotlight
        </h2>
        <span className="text-[10px] font-semibold uppercase tracking-label text-lime">
          Top rated
        </span>
      </div>
      <div className="thin-scroll -mx-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:gap-3 sm:px-6">
        {featured.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="shrink-0 snap-start"
          >
            <Link
              href={`/character/${c.slug}`}
              className="group relative block h-[200px] w-[145px] overflow-hidden rounded-card border border-border bg-surface sm:h-[280px] sm:w-[210px]"
            >
              <HoverPreviewVideo
                poster={c.cover.url}
                posterAlt={c.name}
                blurDataUrl={c.cover.blurDataUrl}
                videoUrl={c.previewVideo?.url}
                sizes="210px"
                imageClassName="transition-transform duration-700 group-hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
                  <p className="truncate font-display text-[11px] font-bold uppercase tracking-wide text-ink sm:text-xs">
                    {c.name}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-lime">★ {c.rating.toFixed(1)}</span>
                    <span className="font-display text-xs font-bold text-lime sm:text-sm">
                      {formatMoney(c.fromPriceMinor, c.currency)}
                    </span>
                  </div>
                </div>
                <div className="absolute left-2 top-2 h-1 w-8 rounded-full bg-lime opacity-0 transition-opacity group-hover:opacity-100" />
              </HoverPreviewVideo>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
