'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { CreatorListingDTO } from '@acm/shared';
import { SiteHeader } from '@/components/SiteHeader';
import { ListingStatusBadge } from '@/components/studio/ListingStatusBadge';
import { moderationApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function ModerationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const [queue, setQueue] = useState<CreatorListingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const canModerate = user?.role === 'ADMIN' || user?.role === 'MODERATOR';

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login?next=/admin/moderation');
      return;
    }
    if (!canModerate) {
      router.replace('/');
      return;
    }
    load();
  }, [user, authLoading, canModerate, router]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setQueue(await moderationApi.queue());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  }

  async function approve(id: string) {
    setBusyId(id);
    try {
      await moderationApi.approve(id, 'Approved via moderation console');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approve failed');
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string) {
    const notes = window.prompt('Rejection reason for creator:');
    if (!notes?.trim()) return;
    setBusyId(id);
    try {
      await moderationApi.reject(id, notes.trim());
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reject failed');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <span className="badge-lime mb-3">Admin</span>
        <h1 className="heading-display text-3xl font-bold">Moderation queue</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          Review creator submissions before they go live. Set{' '}
          <code className="text-lime">MODERATION_AUTO_APPROVE=false</code> on the API to enqueue
          listings here.
        </p>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        {loading ? (
          <p className="mt-8 text-sm text-ink-dim">Loading queue…</p>
        ) : queue.length === 0 ? (
          <div className="card-surface mt-8 p-8 text-center">
            <p className="text-ink-secondary">No listings awaiting review.</p>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {queue.map((item) => (
              <li key={item.id} className="card-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display font-bold uppercase tracking-wide text-ink">
                        {item.name}
                      </p>
                      <ListingStatusBadge status={item.status} />
                    </div>
                    <p className="mt-1 text-xs capitalize text-ink-dim">{item.niche} · {item.style}</p>
                    {item.synthIdHash && (
                      <p className="mt-2 break-all font-mono text-[10px] text-ink-dim">
                        SynthID: {item.synthIdHash.slice(0, 24)}…
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={busyId === item.id}
                      onClick={() => approve(item.id)}
                      className="btn-lime !px-3 !py-1.5 !text-[10px] disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      disabled={busyId === item.id}
                      onClick={() => reject(item.id)}
                      className="btn-ghost !px-3 !py-1.5 !text-[10px] disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 text-center text-sm text-ink-dim">
          <Link href="/studio" className="text-lime hover:underline">
            Creator studio
          </Link>
        </p>
      </div>
    </>
  );
}
