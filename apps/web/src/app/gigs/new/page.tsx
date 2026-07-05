'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { commissionsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function NewGigPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [budget, setBudget] = useState(50);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    router.replace('/login?next=/gigs/new');
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const g = await commissionsApi.create({ title, brief, budgetMinor: budget * 100 });
      router.push(`/gigs/${g.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gig');
      setBusy(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <form onSubmit={onSubmit} className="card-surface mx-auto mt-10 max-w-lg space-y-4 p-6 px-4 sm:px-6">
        <h1 className="heading-display text-xl font-bold">Post commission brief</h1>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="input-field" />
        <textarea required value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Brief" rows={5} className="input-field" />
        <label className="block text-xs text-ink-dim">Budget (USD)</label>
        <input type="number" min={5} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="input-field" />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={busy} className="btn-lime w-full disabled:opacity-50">
          {busy ? 'Posting…' : 'Post brief'}
        </button>
      </form>
    </>
  );
}
