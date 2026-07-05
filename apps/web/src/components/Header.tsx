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
      <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
        <Link href="/" className="group flex shrink-0 items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-lime font-display text-sm font-bold text-[#14151a] transition group-hover:shadow-lime-sm sm:h-9 sm:w-9">
            S
          </div>
          <span className="hidden font-display text-sm font-bold uppercase tracking-wide text-ink sm:block">
            Synthetica
          </span>
        </Link>

        <div className="relative mx-auto min-w-0 flex-1 sm:max-w-xl">
          <input
            value={q}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="input-field !rounded-pill !py-2 !pl-3 !pr-12 text-sm sm:!pl-4 sm:!pr-20"
          />
          {typeof total === 'number' && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-semibold uppercase tracking-label text-ink-dim sm:right-3 sm:text-[10px]">
              {total}
            </span>
          )}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as never)}
          className="hidden max-w-[7rem] shrink-0 truncate rounded-pill border border-border bg-surface px-2 py-2 text-[10px] font-medium uppercase tracking-label text-ink-secondary outline-none focus:border-lime/40 focus:shadow-[0_0_0_3px_rgba(209,254,23,0.12)] sm:block sm:max-w-none sm:px-3 sm:text-xs"
        >
          {SORTS.map((o) => (
            <option key={o.value} value={o.value} className="bg-surface">
              {o.label}
            </option>
          ))}
        </select>

        {!loading &&
          (user ? (
            <Link href="/dashboard" className="btn-lime !px-3 !py-1.5 !text-[10px] shrink-0 sm:!px-4 sm:!py-2 sm:!text-xs">
              <span className="hidden sm:inline">{user.displayName.split(' ')[0]}</span>
              <span className="sm:hidden">Dash</span>
            </Link>
          ) : (
            <Link href="/login" className="btn-ghost !px-3 !py-1.5 !text-[10px] shrink-0 sm:!px-4 sm:!py-2 sm:!text-xs">
              Sign in
            </Link>
          ))}
      </div>
    </header>
  );
}
