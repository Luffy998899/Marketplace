'use client';

import { useState } from 'react';
import { AmbientBackground } from '@/components/AmbientBackground';
import { CharacterGrid } from '@/components/CharacterGrid';
import { ExploreHero } from '@/components/explore/ExploreHero';
import { FeaturedStrip } from '@/components/FeaturedStrip';
import { FilterRail } from '@/components/FilterRail';
import { Header } from '@/components/Header';
import { NicheMarquee } from '@/components/NicheMarquee';
import { useFilterStore } from '@/store/filters';

export default function ExplorePage() {
  const [total, setTotal] = useState<number>();
  const [mobileFilters, setMobileFilters] = useState(false);
  const activeCount = useFilterStore((s) => s.activeCount());
  const { sort, setSort } = useFilterStore();

  const SORTS = [
    { value: 'trending' as const, label: 'Trending' },
    { value: 'newest' as const, label: 'New' },
    { value: 'rating' as const, label: 'Top rated' },
    { value: 'price_asc' as const, label: 'Price ↑' },
    { value: 'price_desc' as const, label: 'Price ↓' },
  ];

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <AmbientBackground />
      <Header total={total} />
      <ExploreHero total={total} />

      <section className="border-y border-border-subtle py-6">
        <NicheMarquee />
      </section>

      <div
        id="marketplace-grid"
        className="relative mx-auto flex max-w-[1600px] gap-6 px-3 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10"
      >
        <aside className="hidden w-56 shrink-0 xl:block">
          <div className="sticky top-[4.5rem] max-h-[calc(100vh-5.5rem)]">
            <FilterRail />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <FeaturedStrip />

          <div className="mb-4 flex items-center justify-between gap-2 xl:hidden">
            <button onClick={() => setMobileFilters((v) => !v)} className="chip shrink-0">
              Filters{activeCount ? ` · ${activeCount}` : ''}
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as never)}
              className="min-w-0 flex-1 truncate rounded-pill border border-border bg-surface px-2 py-1.5 text-[10px] font-medium uppercase tracking-label text-ink-secondary outline-none focus:border-lime/40 sm:hidden"
            >
              {SORTS.map((o) => (
                <option key={o.value} value={o.value} className="bg-surface">
                  {o.label}
                </option>
              ))}
            </select>
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
