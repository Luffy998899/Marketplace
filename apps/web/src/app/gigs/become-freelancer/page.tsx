'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { useAuthStore } from '@/store/auth';

export default function BecomeFreelancerPage() {
  const router = useRouter();
  const { user, loading, becomeFreelancer, isFreelancer } = useAuthStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login?next=/gigs/become-freelancer');
    else if (isFreelancer()) router.replace('/gigs');
  }, [user, loading, isFreelancer, router]);

  async function onActivate() {
    setBusy(true);
    setError('');
    try {
      await becomeFreelancer();
      router.push('/gigs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not activate freelancer account');
      setBusy(false);
    }
  }

  if (loading || !user) {
    return (
      <>
        <SiteHeader />
        <p className="px-4 py-16 text-center text-sm text-ink-secondary">Loading…</p>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-lg px-4 py-16">
        <span className="badge-lime mb-4">Freelancer access</span>
        <h1 className="heading-display text-3xl font-bold">Join the gig board</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          Bid on commission briefs from buyers, deliver synthetic character work, and get paid
          through escrow-protected releases.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-ink-secondary">
          <li>· Browse open briefs and submit competitive bids</li>
          <li>· Escrow holds buyer funds until delivery is approved</li>
          <li>· Revision requests before final payout release</li>
        </ul>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        <button
          onClick={onActivate}
          disabled={busy}
          className="btn-lime mt-8 w-full disabled:opacity-50"
        >
          {busy ? 'Activating…' : 'Become a freelancer'}
        </button>
        <p className="mt-4 text-center text-xs text-ink-dim">
          Demo freelancer: freelancer@synthetica.dev / demo1234
        </p>
        <p className="mt-6 text-center text-sm text-ink-dim">
          <Link href="/gigs" className="text-lime hover:underline">
            Back to gigs
          </Link>
        </p>
      </div>
    </>
  );
}
