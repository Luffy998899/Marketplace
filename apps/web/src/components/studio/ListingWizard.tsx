'use client';

import {
  ETHNICITY_OPTIONS,
  GENDER_OPTIONS,
  LISTING_STEP_META,
  LISTING_STEPS,
  NICHE_OPTIONS,
  STYLE_OPTIONS,
  type CreatorListingDTO,
  type ListingStep,
} from '@acm/shared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { studioApi } from '@/lib/api';
import { ListingStatusBadge } from './ListingStatusBadge';

const SAMPLE_ASSETS = {
  PREVIEW_IMAGE: 'https://picsum.photos/seed/studio-cover/800/1000',
  VIDEO: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-in-neon-light-398-large.mp4',
  CHARACTER_SHEET: 'https://picsum.photos/seed/studio-sheet/800/1100',
  LORA: 'https://picsum.photos/seed/studio-lora/800/800',
  PROMPT_PACK: 'https://picsum.photos/seed/studio-prompt/800/900',
};

export function ListingWizard({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [listing, setListing] = useState<CreatorListingDTO | null>(null);
  const [step, setStep] = useState<ListingStep>('IDENTITY_OWNERSHIP');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    tagline: '',
    description: '',
    niche: NICHE_OPTIONS[0] as string,
    style: STYLE_OPTIONS[0] as string,
    gender: GENDER_OPTIONS[0] as string,
    ethnicity: ETHNICITY_OPTIONS[0] as string,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await studioApi.getListing(listingId);
      setListing(data);
      setStep(data.checklist.currentStep);
      setForm({
        name: data.name,
        tagline: data.tagline ?? '',
        description: data.description ?? '',
        niche: data.niche,
        style: data.style,
        gender: data.gender,
        ethnicity: data.ethnicity,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(action: () => Promise<CreatorListingDTO>) {
    setBusy(true);
    setError('');
    try {
      const data = await action();
      setListing(data);
      setStep(data.checklist.currentStep);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-ink-secondary">Loading listing…</p>;
  }

  if (!listing) {
    return (
      <div className="card-surface p-6 text-center">
        <p className="text-ink-secondary">{error || 'Listing not found'}</p>
        <Link href="/studio" className="btn-ghost mt-4 inline-flex">
          Back to studio
        </Link>
      </div>
    );
  }

  const stepIndex = LISTING_STEPS.indexOf(step);

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="card-surface h-fit p-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <p className="truncate font-display text-sm font-bold uppercase tracking-wide text-ink">
            {listing.name}
          </p>
          <ListingStatusBadge status={listing.status} />
        </div>
        <ol className="space-y-2">
          {LISTING_STEPS.map((s, i) => {
            const done = i < stepIndex || listing.checklist.moderationPassed;
            const current = s === step;
            return (
              <li
                key={s}
                className={`rounded-card border px-3 py-2 text-[11px] font-semibold uppercase tracking-label ${
                  current
                    ? 'border-lime/40 bg-lime/10 text-lime'
                    : done
                      ? 'border-border text-ink-dim'
                      : 'border-border-subtle text-ink-dim'
                }`}
              >
                {LISTING_STEP_META[s].order}. {LISTING_STEP_META[s].label}
              </li>
            );
          })}
        </ol>
      </aside>

      <div className="card-surface p-5 sm:p-6">
        <h2 className="heading-display text-xl font-bold">{LISTING_STEP_META[step].label}</h2>
        <p className="mt-1 text-sm text-ink-secondary">{LISTING_STEP_META[step].description}</p>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        {step === 'IDENTITY_OWNERSHIP' && (
          <div className="mt-6 space-y-4">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Character name"
              className="input-field"
            />
            <input
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              placeholder="Tagline"
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
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="input-field"
              >
                {GENDER_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <select
                value={form.ethnicity}
                onChange={(e) => setForm({ ...form, ethnicity: e.target.value })}
                className="input-field"
              >
                {ETHNICITY_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <button
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await studioApi.updateListing(listingId, form);
                  return studioApi.confirmIdentity(listingId);
                })
              }
              className="btn-lime disabled:opacity-50"
            >
              Confirm identity & continue
            </button>
          </div>
        )}

        {step === 'ASSET_UPLOAD' && (
          <div className="mt-6 space-y-4">
            <p className="text-xs text-ink-dim">
              Upload real files (saved locally on the API server) or use sample placeholder URLs.
            </p>
            <ul className="space-y-2">
              {listing.assets.map((asset) => (
                <li
                  key={asset.id}
                  className="flex flex-col gap-2 rounded-card border border-border-subtle p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{asset.label}</p>
                    <p className="text-[10px] uppercase tracking-label text-ink-dim">
                      {asset.kind}
                      {asset.isLocked ? ' · locked' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-label ${
                        asset.uploaded ? 'text-lime' : 'text-ink-dim'
                      }`}
                    >
                      {asset.uploaded ? 'Done' : 'Pending'}
                    </span>
                    <label className="btn-ghost cursor-pointer !px-2 !py-1 !text-[10px]">
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        accept={asset.kind === 'VIDEO' ? 'video/*' : 'image/*,.zip'}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          await run(() => studioApi.uploadFile(listingId, asset.kind, file));
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                </li>
              ))}
            </ul>
            <button
              disabled={busy}
              onClick={() =>
                run(async () => {
                  for (const [kind, url] of Object.entries(SAMPLE_ASSETS)) {
                    await studioApi.uploadAsset(listingId, { kind, url });
                  }
                  return studioApi.getListing(listingId);
                })
              }
              className="btn-ghost disabled:opacity-50"
            >
              Or use sample URLs
            </button>
          </div>
        )}

        {step === 'SYNTHID_WATERMARK' && (
          <div className="mt-6 space-y-4">
            {listing.synthIdHash ? (
              <div className="rounded-card border border-lime/20 bg-lime/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-label text-lime">SynthID hash</p>
                <p className="mt-2 break-all font-mono text-xs text-ink-secondary">
                  {listing.synthIdHash}
                </p>
                <p className="mt-2 text-[10px] text-ink-dim">
                  Watermark: {listing.watermarkFingerprint}
                </p>
              </div>
            ) : (
              <p className="text-sm text-ink-secondary">
                Stamp a provenance fingerprint on all preview assets. Locked deliverables stay
                gated until purchase.
              </p>
            )}
            {!listing.checklist.synthIdStamped && (
              <button
                disabled={busy}
                onClick={() => run(() => studioApi.stampSynthId(listingId))}
                className="btn-lime disabled:opacity-50"
              >
                Run SynthID stamp
              </button>
            )}
          </div>
        )}

        {step === 'RIGHTS_DECLARATION' && (
          <div className="mt-6 space-y-4">
            <div className="rounded-card border border-border bg-canvas-deep p-4 text-sm leading-relaxed text-ink-secondary">
              I declare this character is fully synthetic, contains no real-person likeness, and I
              hold the rights to license it on Synthetica.
            </div>
            {!listing.checklist.rightsDeclared && (
              <button
                disabled={busy}
                onClick={() => run(() => studioApi.signRights(listingId))}
                className="btn-lime disabled:opacity-50"
              >
                Sign declaration
              </button>
            )}
          </div>
        )}

        {step === 'MODERATION_REVIEW' && (
          <div className="mt-6 space-y-4">
            {listing.status === 'LIVE' ? (
              <>
                <p className="text-sm text-lime">Your character is live on the marketplace.</p>
                <div className="flex flex-wrap gap-3">
                  <Link href={`/character/${listing.slug}`} className="btn-lime">
                    View listing
                  </Link>
                  <Link href="/explore" className="btn-ghost">
                    Browse marketplace
                  </Link>
                </div>
              </>
            ) : listing.status === 'IN_REVIEW' ? (
              <>
                <p className="text-sm text-ink-secondary">
                  Submitted — waiting for moderation approval.
                </p>
                {listing.moderationNotes && (
                  <p className="text-xs text-ink-dim">{listing.moderationNotes}</p>
                )}
              </>
            ) : listing.status === 'CHANGES_REQUESTED' ? (
              <>
                <p className="text-sm text-red-400">Changes requested by moderation.</p>
                {listing.moderationNotes && (
                  <p className="rounded-card border border-border bg-canvas-deep p-3 text-sm text-ink-secondary">
                    {listing.moderationNotes}
                  </p>
                )}
                <p className="text-xs text-ink-dim">Update your listing and re-submit from step 4.</p>
              </>
            ) : (
              <>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description for moderators"
                  rows={4}
                  className="input-field"
                />
                <button
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      if (form.description) {
                        await studioApi.updateListing(listingId, { description: form.description });
                      }
                      return studioApi.submit(listingId);
                    })
                  }
                  className="btn-lime disabled:opacity-50"
                >
                  Submit for review
                </button>
                <p className="text-xs text-ink-dim">
                  With <code className="text-lime">MODERATION_AUTO_APPROVE=true</code> (default), listings
                  go live instantly. Set it to <code className="text-lime">false</code> to test the admin
                  queue at <Link href="/admin/moderation" className="text-lime hover:underline">/admin/moderation</Link>.
                </p>
              </>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => router.push('/studio')}
          className="mt-8 text-[10px] font-semibold uppercase tracking-label text-ink-dim hover:text-ink-secondary"
        >
          ← Back to studio
        </button>
      </div>
    </div>
  );
}
