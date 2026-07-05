'use client';

import Link from 'next/link';
import { formatMoney } from '@acm/shared';
import { useEffect, useState } from 'react';
import type { CommissionDTO } from '@acm/shared';
import { SiteHeader } from '@/components/SiteHeader';
import { commissionsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function GigsPage() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState<CommissionDTO[]>([]);
  const [mine, setMine] = useState<CommissionDTO[]>([]);

  useEffect(() => {
    commissionsApi.open().then(setOpen);
    if (user) commissionsApi.mine().then(setMine);
  }, [user]);

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="badge-lime mb-3">Phase 3</span>
            <h1 className="heading-display text-3xl font-bold">Commission gigs</h1>
            <p className="mt-2 text-sm text-ink-secondary">
              Post briefs, bid on work, escrow-protected delivery.
            </p>
          </div>
          {user && (
            <div className="flex flex-wrap gap-2">
              <Link href="/gigs/new" className="btn-lime">
                Post a brief
              </Link>
              {user.role !== 'FREELANCER' && user.role !== 'ADMIN' && (
                <Link href="/gigs/become-freelancer" className="btn-ghost">
                  Become a freelancer
                </Link>
              )}
            </div>
          )}
        </div>

        {mine.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-xs font-bold uppercase tracking-label text-ink-dim">Your gigs</h2>
            <div className="mt-3 space-y-3">
              {mine.map((g) => (
                <Link key={g.id} href={`/gigs/${g.id}`} className="card-surface card-interactive block p-4">
                  <p className="font-display font-bold uppercase tracking-wide text-ink">{g.title}</p>
                  <p className="mt-1 text-xs capitalize text-ink-dim">{g.status.toLowerCase()}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="font-display text-xs font-bold uppercase tracking-label text-ink-dim">Open briefs</h2>
          <div className="mt-3 space-y-3">
            {open.map((g) => (
              <Link key={g.id} href={`/gigs/${g.id}`} className="card-surface card-interactive block p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display font-bold uppercase tracking-wide text-ink">{g.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-ink-secondary">{g.brief}</p>
                  </div>
                  <p className="font-display text-lg font-bold text-lime">
                    {formatMoney(g.budgetMinor, g.currency)}
                  </p>
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-label text-ink-dim">
                  {g.bids.length} bids · {g.buyerName}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
