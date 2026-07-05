'use client';

import { useEffect, useState } from 'react';
import type { ReviewDTO } from '@acm/shared';
import { reviewsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export function CharacterReviews({ slug }: { slug: string }) {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [aggregate, setAggregate] = useState({ rating: 0, count: 0 });
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    reviewsApi.list(slug).then((r) => {
      setReviews(r.reviews);
      setAggregate(r.aggregate);
    });
  }, [slug]);

  async function submit() {
    if (!user) return;
    setBusy(true);
    setError('');
    try {
      const review = await reviewsApi.create({ characterSlug: slug, rating, body });
      setReviews((r) => [review, ...r]);
      setAggregate((a) => ({
        count: a.count + 1,
        rating: Math.round(((a.rating * a.count + rating) / (a.count + 1)) * 10) / 10,
      }));
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit review');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-12">
      <h2 className="font-display text-sm font-bold uppercase tracking-label text-ink-dim">
        Reviews · {aggregate.count || '0'}
      </h2>
      {aggregate.count > 0 && (
        <p className="mt-1 text-sm text-lime">★ {aggregate.rating.toFixed(1)} average</p>
      )}

      {user && (
        <div className="card-surface mt-4 space-y-3 p-4">
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="input-field !w-auto"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} stars
              </option>
            ))}
          </select>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your experience (license holders only)"
            className="input-field"
            rows={3}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button onClick={submit} disabled={busy} className="btn-lime !text-xs disabled:opacity-50">
            Post review
          </button>
        </div>
      )}

      <ul className="mt-4 space-y-3">
        {reviews.map((r) => (
          <li key={r.id} className="card-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink">{r.authorName}</span>
              <span className="text-sm text-lime">★ {r.rating}</span>
            </div>
            {r.body && <p className="mt-2 text-sm text-ink-secondary">{r.body}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
