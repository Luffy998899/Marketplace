'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { useAuthStore } from '@/store/auth';

export default function BecomeCreatorPage() {
  const router = useRouter();
  const { user, loading, becomeCreator, isCreator } = useAuthStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login?next=/studio/become-creator');
    else if (isCreator()) router.replace('/studio');
  }, [user, loading, isCreator, router]);

  async function onActivate() {
    setBusy(true);
    setError('');
    try {
      await becomeCreator();
      router.push('/studio');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not activate creator account');
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
        <span className="badge-lime mb-4">Creator access</span>
        <h1 className="heading-display text-3xl font-bold">Open Creator Studio</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          List fully synthetic AI characters, run the 5-step compliance wizard (SynthID + IP
          declaration), and earn 70% on every license sold. Platform take is 30%.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-ink-secondary">
          <li>· 5-step listing wizard with moderation</li>
          <li>· Locked asset delivery after buyer purchase</li>
          <li>· Payout pending wallet (70% seller net)</li>
        </ul>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        <button
          onClick={onActivate}
          disabled={busy}
          className="btn-lime mt-8 w-full disabled:opacity-50"
        >
          {busy ? 'Activating…' : 'Become a creator'}
        </button>
        <p className="mt-4 text-center text-xs text-ink-dim">
          Demo creator: creator@synthetica.dev / demo1234
        </p>
        <p className="mt-6 text-center text-sm text-ink-dim">
          <Link href="/explore" className="text-lime hover:underline">
            Back to marketplace
          </Link>
        </p>
      </div>
    </>
  );
}
