'use client';

import type { CharacterCardDTO } from '@acm/shared';
import { useInfiniteQuery } from '@tanstack/react-query';
import { forwardRef, useMemo } from 'react';
import { VirtuosoGrid, type GridComponents } from 'react-virtuoso';
import { fetchCharacters } from '@/lib/data';
import { useFilterStore } from '@/store/filters';
import { CharacterCard } from './CharacterCard';
import { CardSkeleton, GridSkeleton } from './GridSkeleton';

const PAGE_SIZE = 24;

// Virtualised, responsive grid container. Only visible rows are mounted, so it
// stays smooth at 1000+ items.
const gridComponents: GridComponents = {
  List: forwardRef<HTMLDivElement, { style?: React.CSSProperties; children?: React.ReactNode }>(
    function List({ style, children, ...props }, ref) {
      return (
        <div
          ref={ref}
          {...props}
          style={style}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {children}
        </div>
      );
    },
  ),
  Item: ({ children, ...props }) => (
    <div {...props} className="min-w-0">
      {children}
    </div>
  ),
};

export function CharacterGrid({ onTotal }: { onTotal?: (n: number) => void }) {
  const toFilter = useFilterStore((s) => s.toFilter);
  // Recompute the query key from every filter-affecting field.
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

  if (query.isLoading) return <GridSkeleton count={15} />;

  if (query.isError) {
    return (
      <div className="grid place-items-center py-24 text-center text-white/60">
        <p>Couldn’t load characters.</p>
        <button
          onClick={() => query.refetch()}
          className="mt-3 rounded-full border border-neon-400 px-4 py-1.5 text-sm text-neon-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="grid place-items-center py-24 text-center text-white/50">
        <p className="text-lg">No characters match your filters.</p>
        <p className="text-sm">Try clearing a few filters.</p>
      </div>
    );
  }

  return (
    <VirtuosoGrid
      useWindowScroll
      data={items}
      components={gridComponents}
      endReached={() => {
        if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
      }}
      overscan={800}
      itemContent={(_, character) => <CharacterCard character={character} />}
      style={{ minHeight: '60vh' }}
    />
  );
}
