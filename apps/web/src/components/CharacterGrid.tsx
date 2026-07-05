'use client';

import type { CharacterCardDTO } from '@acm/shared';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { fetchCharacters } from '@/lib/data';
import { useFilterStore } from '@/store/filters';
import { getBentoSize } from '@/lib/bento';
import { CharacterCard } from './CharacterCard';
import { GridSkeleton } from './GridSkeleton';

const PAGE_SIZE = 24;

export function CharacterGrid({ onTotal }: { onTotal?: (n: number) => void }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const toFilter = useFilterStore((s) => s.toFilter);
  const deps = useFilterStore((s) => [
    s.q,
    s.gender,
    s.ethnicity,
    s.niche,
    s.style,
    s.licenseType,
    s.maxPriceMinor,
    s.minRating,
    s.availableOnly,
    s.sort,
  ]);

  const query = useInfiniteQuery({
    queryKey: ['characters', deps],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchCharacters(toFilter(pageParam, PAGE_SIZE)),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  });

  const items = useMemo<CharacterCardDTO[]>(
    () => query.data?.pages.flatMap((p) => p.items) ?? [],
    [query.data],
  );

  const total = query.data?.pages[0]?.total ?? 0;
  if (onTotal && total) onTotal(total);

  // Infinite scroll via intersection observer (bento grid replaces uniform virtuoso).
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && query.hasNextPage && !query.isFetchingNextPage) {
          query.fetchNextPage();
        }
      },
      { rootMargin: '400px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [query]);

  if (query.isLoading) return <GridSkeleton count={12} />;

  if (query.isError) {
    return (
      <div className="grid place-items-center py-24 text-center">
        <p className="text-ink-secondary">Couldn&apos;t load characters.</p>
        <button onClick={() => query.refetch()} className="btn-ghost mt-4 !text-xs">
          Retry
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="grid place-items-center py-24 text-center">
        <p className="font-display text-lg uppercase tracking-wide text-ink-secondary">
          No matches
        </p>
        <p className="mt-1 text-sm text-ink-dim">Try clearing filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bento-grid">
        {items.map((character, index) => (
          <CharacterCard
            key={character.id}
            character={character}
            index={index}
            bentoSize={getBentoSize(index)}
          />
        ))}
      </div>

      <div ref={sentinelRef} className="h-4" aria-hidden />

      {query.isFetchingNextPage && (
        <div className="mt-6 flex justify-center">
          <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-label text-ink-dim">
            <span className="h-1.5 w-1.5 animate-pulse-lime rounded-full bg-lime" />
            Loading more
          </span>
        </div>
      )}
    </>
  );
}
