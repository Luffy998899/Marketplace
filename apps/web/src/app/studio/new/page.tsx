'use client';

import {
  ETHNICITY_OPTIONS,
  GENDER_OPTIONS,
  NICHE_OPTIONS,
  STYLE_OPTIONS,
} from '@acm/shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StudioShell } from '@/components/studio/StudioShell';
import { studioApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function NewListingPage() {
  const router = useRouter();
  const { user, loading: authLoading, isCreator } = useAuthStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    tagline: '',
    niche: NICHE_OPTIONS[0] as string,
    style: STYLE_OPTIONS[0] as string,
    gender: GENDER_OPTIONS[0] as string,
    ethnicity: ETHNICITY_OPTIONS[0] as string,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) router.replace('/login?next=/studio/new');
    else if (!isCreator()) router.replace('/studio/become-creator');
  }, [user, authLoading, isCreator, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const listing = await studioApi.createListing(form);
      router.push(`/studio/listings/${listing.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create listing');
      setBusy(false);
    }
  }

  if (authLoading || !user || !isCreator()) {
    return (
      <StudioShell>
        <p className="text-sm text-ink-secondary">Loading…</p>
      </StudioShell>
    );
  }

  return (
    <StudioShell>
      <form onSubmit={onSubmit} className="card-surface mx-auto max-w-lg space-y-4 p-6">
        <h2 className="heading-display text-xl font-bold">New character</h2>
        <p className="text-sm text-ink-secondary">
          Start with basics — the 5-step wizard handles assets, SynthID, and rights.
        </p>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Character name"
          className="input-field"
        />
        <input
          value={form.tagline}
          onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          placeholder="Tagline (optional)"
          className="input-field"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={form.niche}
            onChange={(e) => setForm({ ...form, niche: e.target.value })}
            className="input-field"
          >
            {NICHE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <select
            value={form.style}
            onChange={(e) => setForm({ ...form, style: e.target.value })}
            className="input-field"
          >
            {STYLE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={busy} className="btn-lime w-full disabled:opacity-50">
          {busy ? 'Creating…' : 'Create & open wizard'}
        </button>
      </form>
    </StudioShell>
  );
}
