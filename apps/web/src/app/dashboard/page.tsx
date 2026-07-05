'use client';

import { formatMoney } from '@acm/shared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { assetsApi, ordersApi, walletApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface OrderRow {
  orderId: string;
  characterSlug: string;
  characterName: string;
  licenseType: string;
  amountMinor: number;
  currency: string;
  certificate: { serial: string; issuedAt: string; ledgerHash: string };
  purchasedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuthStore();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloads, setDownloads] = useState<Record<string, Array<{ url: string; label: string; expiresAt: string }>>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login?next=/dashboard');
      return;
    }
    void load();
  }, [user, authLoading, router]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [ords, bal] = await Promise.all([ordersApi.mine(), walletApi.balance()]);
      setOrders(ords);
      setBalance(bal.balance.amountMinor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function fetchDownloads(slug: string) {
    try {
      const links = await assetsApi.downloads(slug);
      setDownloads((d) => ({
        ...d,
        [slug]: links.map((l) => ({ url: l.url, label: l.label, expiresAt: l.expiresAt })),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not get download links');
    }
  }

  if (authLoading || (!user && loading)) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-white/50">Loading…</div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Buyer dashboard</h1>
          <p className="text-sm text-white/50">Welcome, {user?.displayName}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-neon-500/30 bg-neon-500/10 px-3 py-1 text-sm text-neon-200">
            Wallet: {formatMoney(balance ?? 0)}
          </span>
          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="text-sm text-white/50 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">
          Your licenses ({orders.length})
        </h2>

        {loading ? (
          <p className="mt-4 text-white/50">Loading licenses…</p>
        ) : orders.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-8 text-center">
            <p className="text-white/60">No licenses yet.</p>
            <Link href="/" className="mt-2 inline-block text-sm text-neon-300 hover:text-neon-200">
              Browse characters →
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {orders.map((o) => (
              <div key={o.orderId} className="rounded-2xl card-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/character/${o.characterSlug}`}
                      className="text-lg font-semibold text-white hover:text-neon-200"
                    >
                      {o.characterName}
                    </Link>
                    <p className="text-xs capitalize text-white/50">
                      {o.licenseType.replace('_', ' ').toLowerCase()} ·{' '}
                      {formatMoney(o.amountMinor, o.currency)} ·{' '}
                      {new Date(o.purchasedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs text-neon-300">{o.certificate.serial}</p>
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/certificates/verify/${o.certificate.serial}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-white/40 hover:text-white/60"
                    >
                      Verify certificate ↗
                    </a>
                  </div>
                </div>

                <div className="mt-4 border-t border-white/5 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                    Locked assets
                  </p>
                  {downloads[o.characterSlug] ? (
                    <ul className="mt-2 space-y-1">
                      {downloads[o.characterSlug]!.map((d) => (
                        <li key={d.url}>
                          <a
                            href={d.url}
                            className="text-sm text-accent hover:underline"
                            download
                          >
                            ↓ {d.label}
                          </a>
                          <span className="ml-2 text-[10px] text-white/30">
                            expires {new Date(d.expiresAt).toLocaleTimeString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <button
                      onClick={() => fetchDownloads(o.characterSlug)}
                      className="mt-2 rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 hover:border-neon-400"
                    >
                      Get signed download links
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
