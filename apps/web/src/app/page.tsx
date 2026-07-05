'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AmbientBackground } from '@/components/AmbientBackground';
import { CharacterGrid } from '@/components/CharacterGrid';
import { FeaturedStrip } from '@/components/FeaturedStrip';
import { FilterRail } from '@/components/FilterRail';
import { Header } from '@/components/Header';
import { useFilterStore } from '@/store/filters';

export default function HomePage() {
  const [total, setTotal] = useState<number>();
  const [mobileFilters, setMobileFilters] = useState(false);
  const activeCount = useFilterStore((s) => s.activeCount());

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <Header total={total} />

      <section className="relative mx-auto max-w-[1600px] overflow-hidden px-4 pb-8 pt-10 sm:px-6 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-5xl"
        >
          <span className="badge-lime mb-5">AI Character Marketplace</span>
          <h1 className="heading-display text-[clamp(2.5rem,8vw,5.5rem)] font-bold leading-[0.92]">
            License
            <br />
            <span className="text-lime">Synthetic</span>
            <br />
            Influencers
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-secondary sm:text-lg">
            Discover, license, and trade fully synthetic AI characters. Watermarked previews.
            Locked assets unlock after purchase.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#explore" className="btn-lime">
              Explore grid
            </a>
            <Link href="/login" className="btn-ghost">
              Start licensing
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border-subtle pt-6 text-[11px] font-semibold uppercase tracking-label text-ink-dim">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse-lime" />
              {total ?? '120'}+ characters
            </span>
            <span className="hidden h-3 w-px bg-border sm:block" />
            <span>From $1</span>
            <span className="hidden h-3 w-px bg-border sm:block" />
            <span>30% platform · escrow</span>
            <span className="hidden h-3 w-px bg-border sm:block" />
            <span>SynthID verified</span>
          </div>
        </motion.div>
      </section>

      <div
        id="explore"
        className="relative mx-auto flex max-w-[1600px] gap-6 px-4 pb-12 sm:px-6"
      >
        <aside className="hidden w-56 shrink-0 xl:block">
          <div className="sticky top-[4.5rem] max-h-[calc(100vh-5.5rem)]">
            <FilterRail />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <FeaturedStrip />

          <div className="mb-4 flex items-center justify-between xl:hidden">
            <button onClick={() => setMobileFilters((v) => !v)} className="chip">
              Filters{activeCount ? ` · ${activeCount}` : ''}
            </button>
            <span className="text-[10px] font-semibold uppercase tracking-label text-ink-dim">
              Bento grid
            </span>
          </div>

          {mobileFilters && (
            <div className="card-surface mb-4 p-4 xl:hidden">
              <FilterRail />
            </div>
          )}

          <CharacterGrid onTotal={setTotal} />
        </main>
      </div>
    </div>
  );
}
