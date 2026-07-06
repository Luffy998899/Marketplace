'use client';

import { useState } from 'react';
import { AmbientBackground } from '@/components/AmbientBackground';
import { CharacterGrid } from '@/components/CharacterGrid';
import { FeaturedStrip } from '@/components/FeaturedStrip';
import { FilterRail } from '@/components/FilterRail';
import { Header } from '@/components/Header';
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

      <section className="relative mx-auto max-w-[1600px] px-3 pb-4 pt-8 sm:px-6 sm:pt-12">
        <p className="badge-lime mb-3 w-fit">Marketplace</p>
        <h1 className="heading-display text-3xl font-bold sm:text-4xl">Explore characters</h1>
        <p className="mt-2 max-w-xl text-sm text-ink-secondary sm:text-base">
          Browse, filter, and license fully synthetic AI avatars. Watermarked previews — locked assets
          unlock after purchase.
        </p>
      </section>

      <div className="relative mx-auto flex max-w-[1600px] gap-6 px-3 pb-10 sm:px-6 sm:pb-12">
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
            <span className="hidden text-[10px] font-semibold uppercase tracking-label text-ink-dim sm:inline">
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
