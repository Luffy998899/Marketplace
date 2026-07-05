'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { useAuthStore } from '@/store/auth';

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, displayName);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
        <span className="badge-lime mb-4 w-fit">Join</span>
        <h1 className="heading-display text-3xl font-bold">Create account</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          License fully synthetic AI characters.
        </p>

        <form onSubmit={onSubmit} className="card-surface mt-8 space-y-4 p-6">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display name"
            required
            className="input-field"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="input-field"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 8 chars)"
            minLength={8}
            required
            className="input-field"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn-lime w-full disabled:opacity-50">
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-ink-dim">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-lime hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
