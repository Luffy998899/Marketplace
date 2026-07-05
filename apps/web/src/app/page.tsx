'use client';

import { useState } from 'react';
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

      {/* Hero */}
      <section className="mx-auto max-w-[1600px] px-4 pb-2 pt-8 sm:px-6">
        <div className="max-w-3xl">
          <p className="mb-2 inline-block rounded-full border border-neon-500/30 bg-neon-500/10 px-3 py-1 text-xs font-medium text-neon-200">
            The world’s first AI Character Marketplace
          </p>
          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
            Discover, license & trade{' '}
            <span className="bg-gradient-to-r from-neon-300 to-accent bg-clip-text text-transparent">
              fully synthetic
            </span>{' '}
            AI characters.
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Every character is 100% synthetic — no real-person likeness. Previews are watermarked;
            locked character sheets unlock via signed links after purchase.
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 pb-16 pt-4 sm:px-6">
        {/* Desktop filter rail */}
        <div className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)]">
            <FilterRail />
          </div>
        </div>

        {/* Grid column */}
        <main className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <button
              onClick={() => setMobileFilters((v) => !v)}
              className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-white/80"
            >
              Filters{activeCount ? ` (${activeCount})` : ''}
            </button>
          </div>

          {mobileFilters && (
            <div className="mb-4 rounded-2xl border border-white/10 bg-ink-900/60 p-4 lg:hidden">
              <FilterRail />
            </div>
          )}

          <CharacterGrid onTotal={setTotal} />
        </main>
      </div>
    </div>
  );
}
