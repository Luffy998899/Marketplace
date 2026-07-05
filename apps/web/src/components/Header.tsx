'use client';

import Link from 'next/link';
import { useFilterStore } from '@/store/filters';
import { useAuthStore } from '@/store/auth';

const SORTS: { value: ReturnType<typeof useFilterStore.getState>['sort']; label: string }[] = [
  { value: 'trending', label: 'Trending' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
];

export function Header({ total }: { total?: number }) {
  const { q, setQuery, sort, setSort } = useFilterStore();
  const { user, loading } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-neon-500 to-accent font-bold text-white">
            S
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">Synthetica</p>
            <p className="hidden text-[10px] uppercase tracking-wider text-white/40 sm:block">
              AI Character Market
            </p>
          </div>
        </Link>

        <div className="relative mx-auto w-full max-w-xl">
          <input
            value={q}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search synthetic characters, niches, styles…"
            className="w-full rounded-full border border-white/10 bg-ink-800/60 px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-neon-400"
          />
          {typeof total === 'number' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-white/40">
              {total} results
            </span>
          )}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as never)}
          className="hidden rounded-full border border-white/10 bg-ink-800/60 px-3 py-2 text-sm text-white/80 outline-none focus:border-neon-400 sm:block"
        >
          {SORTS.map((o) => (
            <option key={o.value} value={o.value} className="bg-ink-800">
              {o.label}
            </option>
          ))}
        </select>

        {!loading &&
          (user ? (
            <Link
              href="/dashboard"
              className="shrink-0 rounded-full border border-neon-500/30 bg-neon-500/10 px-3 py-1.5 text-sm text-neon-200 hover:bg-neon-500/20"
            >
              {user.displayName}
            </Link>
          ) : (
            <Link
              href="/login"
              className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/80 hover:border-white/30"
            >
              Sign in
            </Link>
          ))}
      </div>
    </header>
  );
}
