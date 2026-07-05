'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { certificatesApi } from '@/lib/api';

export default function VerifyCertificatePage({ params }: { params: { serial: string } }) {
  const [result, setResult] = useState<Awaited<ReturnType<typeof certificatesApi.verify>> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certificatesApi
      .verify(params.serial)
      .then(setResult)
      .catch(() => setResult({ valid: false, serial: params.serial, message: 'Verification failed' }))
      .finally(() => setLoading(false));
  }, [params.serial]);

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-lg px-4 py-16">
        <span className="badge-lime mb-4">Public verify</span>
        <h1 className="heading-display text-3xl font-bold">Certificate</h1>
        <p className="mt-2 font-mono text-sm text-ink-secondary">{params.serial}</p>

        {loading ? (
          <p className="mt-8 text-sm text-ink-dim">Verifying…</p>
        ) : result?.valid ? (
          <div className="card-surface mt-8 space-y-3 border-lime/30 p-6">
            <p className="font-display text-lg font-bold uppercase text-lime">Valid license</p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-dim">Character</dt>
                <dd className="text-right font-medium text-ink">{result.characterName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-dim">License</dt>
                <dd className="text-right capitalize text-ink">{result.licenseType?.toLowerCase()}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-dim">Purchased</dt>
                <dd className="text-right text-ink-secondary">
                  {result.purchasedAt ? new Date(result.purchasedAt).toLocaleString() : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-ink-dim">Ledger anchor</dt>
                <dd className="mt-1 break-all font-mono text-xs text-ink-secondary">
                  {result.ledgerHash}
                </dd>
              </div>
            </dl>
            {result.characterSlug && (
              <Link href={`/character/${result.characterSlug}`} className="btn-ghost mt-4 inline-flex !text-xs">
                View character
              </Link>
            )}
          </div>
        ) : (
          <div className="card-surface mt-8 p-6 text-center">
            <p className="font-display text-lg uppercase text-red-400">Not found</p>
            <p className="mt-2 text-sm text-ink-secondary">
              {result?.message ?? 'This certificate serial is not in our registry.'}
            </p>
          </div>
        )}

        <p className="mt-8 text-center">
          <Link href="/" className="text-sm text-lime hover:underline">
            ← Marketplace
          </Link>
        </p>
      </div>
    </>
  );
}
