'use client';

import { formatMoney, MIN_TOP_UP_MINOR, type CharacterDetailDTO, type LicenseTierDTO } from '@acm/shared';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ordersApi, walletApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

type Step = 'idle' | 'auth' | 'topup' | 'confirm' | 'success' | 'error';

export function CheckoutPanel({
  character,
}: {
  character: CharacterDetailDTO;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState<Step>('idle');
  const [tier, setTier] = useState<LicenseTierDTO | null>(null);
  const [balanceMinor, setBalanceMinor] = useState<number | null>(null);
  const [topUpAmount, setTopUpAmount] = useState(500);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ serial: string; orderId: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function startBuy(t: LicenseTierDTO) {
    setTier(t);
    setError('');
    if (!user) {
      setStep('auth');
      return;
    }
    await proceedCheckout(t);
  }

  async function proceedCheckout(t: LicenseTierDTO) {
    setLoading(true);
    try {
      const bal = await walletApi.balance();
      setBalanceMinor(bal.balance.amountMinor);
      if (bal.balance.amountMinor < t.priceMinor) {
        setTopUpAmount(Math.max(MIN_TOP_UP_MINOR, t.priceMinor));
        setStep('topup');
        return;
      }
      setStep('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not check balance');
      setStep('error');
    } finally {
      setLoading(false);
    }
  }

  async function handleTopUp() {
    if (!tier) return;
    setLoading(true);
    setError('');
    try {
      await walletApi.topUp(topUpAmount);
      const bal = await walletApi.balance();
      setBalanceMinor(bal.balance.amountMinor);
      if (bal.balance.amountMinor < tier.priceMinor) {
        setError('Top-up succeeded but balance is still insufficient.');
        return;
      }
      setStep('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Top-up failed');
    } finally {
      setLoading(false);
    }
  }

  async function confirmPurchase() {
    if (!tier) return;
    setLoading(true);
    setError('');
    try {
      const order = await ordersApi.purchase(character.slug, tier.id);
      setResult({ serial: order.certificate.serial, orderId: order.orderId });
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed');
      setStep('error');
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setStep('idle');
    setTier(null);
    setError('');
    setResult(null);
  }

  return (
    <>
      <div className="mt-6 space-y-3">
        <h2 className="font-display text-[10px] font-bold uppercase tracking-label text-ink-dim">
          License tiers
        </h2>
        {character.licenseTiers.map((t) => (
          <div
            key={t.id}
            className="card-surface flex items-center justify-between p-4"
          >
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-wide text-ink">
                {t.name}
                {t.exclusive && (
                  <span className="ml-2 badge-lime !bg-surface !text-ink-dim !text-[9px]">
                    Exclusive
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-ink-secondary">{t.description}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-xl font-bold text-lime">
                {formatMoney(t.priceMinor, t.currency)}
              </p>
              <button
                onClick={() => startBuy(t)}
                disabled={loading}
                className="btn-lime mt-2 !px-4 !py-1.5 !text-[10px] disabled:opacity-50"
              >
                Buy
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {step !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            onClick={close}
          >
            <motion.div
              initial={{ scale: 0.95, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="card-surface w-full max-w-md border-border p-6 shadow-lime"
            >
              {step === 'auth' && (
                <>
                  <h3 className="heading-display text-lg font-bold">Sign in to purchase</h3>
                  <p className="mt-2 text-sm text-ink-secondary">
                    You need an account to license {character.name}.
                  </p>
                  <div className="mt-5 flex gap-3">
                    <Link
                      href={`/login?next=/character/${character.slug}`}
                      className="btn-lime flex-1 !text-xs"
                    >
                      Sign in
                    </Link>
                    <Link
                      href={`/register?next=/character/${character.slug}`}
                      className="btn-ghost flex-1 !text-xs"
                    >
                      Register
                    </Link>
                  </div>
                </>
              )}

              {step === 'topup' && tier && (
                <>
                  <h3 className="heading-display text-lg font-bold">Top up wallet</h3>
                  <p className="mt-2 text-sm text-ink-secondary">
                    Balance: {formatMoney(balanceMinor ?? 0)} — need{' '}
                    {formatMoney(tier.priceMinor, tier.currency)} for {tier.name}.
                  </p>
                  <label className="mt-4 block text-[10px] font-bold uppercase tracking-label text-ink-dim">
                    Top-up amount (USD)
                  </label>
                  <input
                    type="number"
                    min={MIN_TOP_UP_MINOR / 100}
                    step={1}
                    value={topUpAmount / 100}
                    onChange={(e) => setTopUpAmount(Math.round(Number(e.target.value) * 100))}
                    className="input-field mt-1"
                  />
                  {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
                  <button
                    onClick={handleTopUp}
                    disabled={loading || topUpAmount < MIN_TOP_UP_MINOR}
                    className="btn-lime mt-4 w-full disabled:opacity-50"
                  >
                    {loading ? 'Processing…' : `Top up ${formatMoney(topUpAmount)}`}
                  </button>
                </>
              )}

              {step === 'confirm' && tier && (
                <>
                  <h3 className="heading-display text-lg font-bold">Confirm purchase</h3>
                  <p className="mt-2 text-sm text-ink-secondary">
                    {character.name} — {tier.name}
                  </p>
                  <p className="mt-2 font-display text-3xl font-bold text-lime">
                    {formatMoney(tier.priceMinor, tier.currency)}
                  </p>
                  <p className="text-xs text-ink-dim">
                    Wallet balance: {formatMoney(balanceMinor ?? 0)}
                  </p>
                  {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
                  <button
                    onClick={confirmPurchase}
                    disabled={loading}
                    className="btn-lime mt-5 w-full disabled:opacity-50"
                  >
                    {loading ? 'Processing…' : 'Confirm & pay from wallet'}
                  </button>
                </>
              )}

              {step === 'success' && result && (
                <>
                  <h3 className="heading-display text-lg font-bold text-lime">License purchased</h3>
                  <p className="mt-3 text-sm text-ink-secondary">
                    Certificate:{' '}
                    <span className="font-mono font-semibold text-lime">{result.serial}</span>
                  </p>
                  <p className="mt-1 text-xs text-ink-dim">
                    Download locked assets from your dashboard.
                  </p>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="btn-lime mt-5 w-full"
                  >
                    Go to dashboard
                  </button>
                </>
              )}

              {step === 'error' && (
                <>
                  <h3 className="heading-display text-lg font-bold text-red-400">Error</h3>
                  <p className="mt-2 text-sm text-ink-secondary">{error}</p>
                  <button onClick={close} className="btn-ghost mt-5 w-full">
                    Close
                  </button>
                </>
              )}

              {step !== 'success' && step !== 'error' && (
                <button
                  onClick={close}
                  className="mt-3 w-full text-center text-[10px] font-semibold uppercase tracking-label text-ink-dim hover:text-ink-secondary"
                >
                  Cancel
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
