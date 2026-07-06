'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { FeedPostDTO } from '@acm/shared';
import { SiteHeader } from '@/components/SiteHeader';
import { feedApi } from '@/lib/api';
import { useSafeAsyncEffect } from '@/lib/useSafeAsync';
import { useAuthStore } from '@/store/auth';

export default function FeedPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<FeedPostDTO[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  useSafeAsyncEffect((isActive) => {
    setLoading(true);
    return feedApi.list(page).then((res) => {
      if (!isActive()) return;
      setPosts((p) => (page === 1 ? res.items : [...p, ...res.items]));
      setHasMore(res.hasMore);
      setLoading(false);
    });
  }, [page]);

  async function toggleLike(id: string) {
    if (!user) return;
    const updated = await feedApi.like(id);
    setPosts((ps) => ps.map((p) => (p.id === id ? updated : p)));
  }

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <span className="badge-lime mb-3">Phase 4</span>
        <h1 className="heading-display text-3xl font-bold">AI Feed</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          Synthetic influencer reels and drops from the marketplace.
        </p>

        <div className="mt-8 space-y-6">
          {posts.map((post) => (
            <article key={post.id} className="card-surface overflow-hidden">
              <div className="relative aspect-[4/5] bg-canvas-deep">
                {post.isReel ? (
                  <video src={post.mediaUrl} className="h-full w-full object-cover" muted loop autoPlay playsInline />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.mediaUrl} alt={post.characterName} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="p-4">
                <Link href={`/character/${post.characterSlug}`} className="font-display text-sm font-bold uppercase tracking-wide text-ink hover:text-lime">
                  {post.characterName}
                </Link>
                {post.caption && <p className="mt-2 text-sm text-ink-secondary">{post.caption}</p>}
                <div className="mt-3 flex items-center gap-4 text-xs text-ink-dim">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={post.likedByMe ? 'text-lime' : 'hover:text-lime'}
                  >
                    ♥ {post.likeCount}
                  </button>
                  <span>{post.commentCount} comments</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {hasMore && !loading && (
          <button onClick={() => setPage((p) => p + 1)} className="btn-ghost mx-auto mt-8 block">
            Load more
          </button>
        )}
      </div>
    </>
  );
}
