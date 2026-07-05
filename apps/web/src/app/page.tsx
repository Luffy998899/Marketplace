'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CharacterGrid } from '@/components/CharacterGrid';
import { FilterRail } from '@/components/FilterRail';
import { Header } from '@/components/Header';
import { useFilterStore } from '@/store/filters';

export default function HomePage() {
  const [total, setTotal] = useState<number>();
  const [mobileFilters, setMobileFilters] = useState(false);
  const activeCount = useFilterStore((s) => s.activeCount());

  return (
    <div className="min-h-screen">
      <Header total={total} />

      {/* Cinematic hero — Higgsfield: uppercase display, one lime focal */}
      <section className="relative mx-auto max-w-[1600px] overflow-hidden px-4 pb-6 pt-10 sm:px-6 sm:pt-14">
        <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-lime/5 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-4xl"
        >
          <span className="badge-lime mb-4">AI Character Marketplace</span>
          <h1 className="heading-display text-4xl font-bold leading-[0.95] sm:text-5xl md:text-6xl lg:text-7xl">
            License
            <br />
            <span className="text-lime">Synthetic</span>
            <br />
            Influencers
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-secondary sm:text-lg">
            Discover, license, and trade fully synthetic AI characters. Watermarked previews.
            Locked assets unlock after purchase.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-label text-ink-dim">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse-lime" />
              120+ live characters
            </span>
            <span>·</span>
            <span>From $1 license</span>
            <span>·</span>
            <span>Escrow protected</span>
          </div>
        </motion.div>
      </section>

      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 pb-8 sm:px-6">
        <aside className="hidden w-56 shrink-0 xl:block">
          <div className="sticky top-[4.5rem] max-h-[calc(100vh-5.5rem)]">
            <FilterRail />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <button
              onClick={() => setMobileFilters((v) => !v)}
              className="chip"
            >
              Filters{activeCount ? ` · ${activeCount}` : ''}
            </button>
          </div>

          {mobileFilters && (
            <div className="card-surface mb-4 p-4 lg:hidden">
              <FilterRail />
            </div>
          )}

          <CharacterGrid onTotal={setTotal} />
        </main>
      </div>
    </div>
  );
}
