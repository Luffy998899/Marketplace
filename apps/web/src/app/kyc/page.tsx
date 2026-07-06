'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { kycApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function KycPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [legalName, setLegalName] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<string>('NONE');
  const next = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('next') : null;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent('/kyc' + (next ? `?next=${next}` : ''))}`);
      return;
    }
    void kycApi.status().then((s) => {
      setStatus(s.status);
      if (s.status === 'APPROVED' && next) router.replace(next);
    });
  }, [user, loading, router, next]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await kycApi.submit({
        legalName,
        countryCode,
        agreedToTerms: agreed,
      });
      setStatus(res.status);
      if (res.status === 'APPROVED') {
        router.push(next ?? '/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
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

  if (status === 'APPROVED') {
    return (
      <>
        <SiteHeader />
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <span className="badge-lime mb-4">Verified</span>
          <h1 className="heading-display text-2xl font-bold">Identity confirmed</h1>
          <p className="mt-3 text-sm text-ink-secondary">You can now access creator and freelancer roles.</p>
          <Link href={next ?? '/dashboard'} className="btn-lime mt-8 inline-block">
            Continue
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-16">
        <span className="badge-lime mb-4">Identity verification</span>
        <h1 className="heading-display text-3xl font-bold">Verify your identity</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          Required before opening Creator Studio or joining the gig board. We verify that listings
          comply with our synthetic-only policy.
        </p>

        <form onSubmit={onSubmit} className="card-surface mt-8 space-y-4 p-6">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-label text-ink-dim">Legal name</label>
            <input
              required
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              className="input-field mt-1"
              placeholder="Full legal name"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-label text-ink-dim">Country</label>
            <input
              required
              maxLength={2}
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
              className="input-field mt-1 uppercase"
              placeholder="US"
            />
          </div>
          <label className="flex items-start gap-2 text-xs text-ink-secondary">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
            I confirm all work on Synthetica uses fully synthetic characters with no real-person likeness.
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {status === 'PENDING' && (
            <p className="text-sm text-ink-secondary">Verification submitted — awaiting review.</p>
          )}
          <button type="submit" disabled={busy || !agreed} className="btn-lime w-full disabled:opacity-50">
            {busy ? 'Submitting…' : 'Submit verification'}
          </button>
        </form>
      </div>
    </>
  );
}
