'use client';

import Link from 'next/link';
import { formatMoney } from '@acm/shared';
import { useEffect, useState } from 'react';
import type { CommissionDTO } from '@acm/shared';
import { SiteHeader } from '@/components/SiteHeader';
import { commissionsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function GigDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuthStore();
  const [gig, setGig] = useState<CommissionDTO | null>(null);
  const [bidAmount, setBidAmount] = useState(100);
  const [bidMsg, setBidMsg] = useState('');
  const [deliverUrl, setDeliverUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    commissionsApi.get(params.id).then(setGig);
  }, [params.id]);

  if (!gig) {
    return (
      <>
        <SiteHeader />
        <p className="p-10 text-center text-ink-dim">Loading…</p>
      </>
    );
  }

  const isBuyer = user?.id === gig.buyerId;
  const isFreelancer = user?.id === gig.assignedFreelancerId;

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link href="/gigs" className="text-xs text-ink-dim hover:text-lime">← Gigs</Link>
        <h1 className="heading-display mt-4 text-2xl font-bold">{gig.title}</h1>
        <p className="mt-2 text-sm capitalize text-ink-dim">{gig.status.toLowerCase()}</p>
        <p className="mt-4 text-sm leading-relaxed text-ink-secondary">{gig.brief}</p>
        <p className="mt-4 font-display text-xl font-bold text-lime">
          {formatMoney(gig.budgetMinor, gig.currency)}
        </p>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        {gig.status === 'OPEN' && user?.role === 'FREELANCER' && (
          <div className="card-surface mt-6 space-y-3 p-4">
            <h2 className="text-xs font-bold uppercase tracking-label text-ink-dim">Place bid</h2>
            <input type="number" value={bidAmount} onChange={(e) => setBidAmount(Number(e.target.value))} className="input-field" />
            <textarea value={bidMsg} onChange={(e) => setBidMsg(e.target.value)} placeholder="Message" className="input-field" />
            <button
              onClick={async () => {
                try {
                  setGig(await commissionsApi.bid(gig.id, { amountMinor: bidAmount * 100, message: bidMsg }));
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Bid failed');
                }
              }}
              className="btn-lime !text-xs"
            >
              Submit bid
            </button>
          </div>
        )}

        {gig.bids.length > 0 && isBuyer && gig.status === 'OPEN' && (
          <ul className="mt-6 space-y-3">
            {gig.bids.map((b) => (
              <li key={b.id} className="card-surface flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-ink">{b.freelancerName}</p>
                  <p className="text-sm text-lime">{formatMoney(b.amountMinor, b.currency)}</p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      setGig(await commissionsApi.assign(gig.id, b.id));
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Assign failed');
                    }
                  }}
                  className="btn-lime !text-xs"
                >
                  Assign
                </button>
              </li>
            ))}
          </ul>
        )}

        {isFreelancer && (gig.status === 'IN_PROGRESS' || gig.status === 'REVISION_REQUESTED') && (
          <div className="card-surface mt-6 space-y-3 p-4">
            <input value={deliverUrl} onChange={(e) => setDeliverUrl(e.target.value)} placeholder="Deliverable URL" className="input-field" />
            <button
              onClick={async () => {
                try {
                  setGig(await commissionsApi.deliver(gig.id, deliverUrl));
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Delivery failed');
                }
              }}
              className="btn-lime !text-xs"
            >
              Submit delivery
            </button>
          </div>
        )}

        {isBuyer && gig.status === 'DELIVERED' && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={async () => setGig(await commissionsApi.approve(gig.id))}
              className="btn-lime !text-xs"
            >
              Approve & release escrow
            </button>
            {gig.deliverableUrl && (
              <a href={gig.deliverableUrl} target="_blank" rel="noreferrer" className="btn-ghost !text-xs">
                View delivery
              </a>
            )}
          </div>
        )}
      </div>
    </>
  );
}
