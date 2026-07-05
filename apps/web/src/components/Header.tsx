'use client';

import Link from 'next/link';
import { useFilterStore } from '@/store/filters';
import { useAuthStore } from '@/store/auth';

const SORTS: { value: ReturnType<typeof useFilterStore.getState>['sort']; label: string }[] = [
  { value: 'trending', label: 'Trending' },
  { value: 'newest', label: 'New' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
];

export function Header({ total }: { total?: number }) {
  const { q, setQuery, sort, setSort } = useFilterStore();
  const { user, loading } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-canvas/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-lime font-display text-sm font-bold text-[#14151a] transition group-hover:shadow-lime-sm">
            S
          </div>
          <span className="hidden font-display text-sm font-bold uppercase tracking-wide text-ink sm:block">
            Synthetica
          </span>
        </Link>

        <div className="relative mx-auto w-full max-w-md flex-1 sm:max-w-xl">
          <input
            value={q}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search characters, niches, styles…"
            className="input-field !rounded-pill !py-2 !pl-4 !pr-20"
          />
          {typeof total === 'number' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-label text-ink-dim">
              {total}
            </span>
          )}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as never)}
          className="hidden rounded-pill border border-border bg-surface px-3 py-2 text-xs font-medium uppercase tracking-label text-ink-secondary outline-none focus:border-lime/40 focus:shadow-[0_0_0_3px_rgba(209,254,23,0.12)] sm:block"
        >
          {SORTS.map((o) => (
            <option key={o.value} value={o.value} className="bg-surface">
              {o.label}
            </option>
          ))}
        </select>

        {!loading &&
          (user ? (
            <Link href="/dashboard" className="btn-lime !px-4 !py-2 !text-xs shrink-0">
              {user.displayName.split(' ')[0]}
            </Link>
          ) : (
            <Link href="/login" className="btn-ghost !px-4 !py-2 !text-xs shrink-0">
              Sign in
            </Link>
          ))}
      </div>
    </header>
  );
}
