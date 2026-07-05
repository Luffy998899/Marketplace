'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatMoney } from '@acm/shared';
import { StudioShell } from '@/components/studio/StudioShell';
import { ListingStatusBadge } from '@/components/studio/ListingStatusBadge';
import { studioApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function StudioDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, isCreator } = useAuthStore();
  const [stats, setStats] = useState<{
    totalListings: number;
    liveListings: number;
    draftListings: number;
    payoutPendingMinor: number;
    currency: string;
  } | null>(null);
  const [listings, setListings] = useState<
    Array<{ id: string; slug: string; name: string; status: string; niche: string; updatedAt: string }>
  >([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login?next=/studio');
      return;
    }
    if (!isCreator()) {
      router.replace('/studio/become-creator');
      return;
    }
    Promise.all([studioApi.stats(), studioApi.listings()])
      .then(([s, l]) => {
        setStats(s);
        setListings(l);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load studio'));
  }, [user, authLoading, isCreator, router]);

  if (authLoading || !user || !isCreator()) {
    return (
      <StudioShell>
        <p className="text-sm text-ink-secondary">Loading studio…</p>
      </StudioShell>
    );
  }

  return (
    <StudioShell>
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      {stats && (
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <div className="card-surface p-4">
            <p className="text-[10px] font-bold uppercase tracking-label text-ink-dim">Listings</p>
            <p className="mt-1 font-display text-3xl font-bold text-ink">{stats.totalListings}</p>
            <p className="mt-1 text-xs text-ink-secondary">{stats.liveListings} live</p>
          </div>
          <div className="card-surface p-4">
            <p className="text-[10px] font-bold uppercase tracking-label text-ink-dim">Drafts</p>
            <p className="mt-1 font-display text-3xl font-bold text-ink">{stats.draftListings}</p>
          </div>
          <div className="card-surface p-4">
            <p className="text-[10px] font-bold uppercase tracking-label text-ink-dim">Payout pending</p>
            <p className="mt-1 font-display text-3xl font-bold text-lime">
              {formatMoney(stats.payoutPendingMinor, stats.currency)}
            </p>
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-sm font-bold uppercase tracking-label text-ink-dim">
          Your listings
        </h2>
      </div>

      {listings.length === 0 ? (
        <div className="card-surface grid place-items-center py-16 text-center">
          <p className="font-display text-lg uppercase tracking-wide text-ink-secondary">
            No listings yet
          </p>
          <p className="mt-2 text-sm text-ink-dim">Create your first synthetic character.</p>
          <Link href="/studio/new" className="btn-lime mt-6">
            Start listing wizard
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <Link
              key={l.id}
              href={`/studio/listings/${l.id}`}
              className="card-surface card-interactive flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-display text-sm font-bold uppercase tracking-wide text-ink">
                    {l.name}
                  </p>
                  <ListingStatusBadge status={l.status} />
                </div>
                <p className="mt-1 text-xs capitalize text-ink-dim">{l.niche}</p>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-label text-ink-dim">
                {l.status === 'LIVE' ? 'View / edit' : 'Continue wizard →'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </StudioShell>
  );
}
