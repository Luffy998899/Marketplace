'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold text-white">Create account</h1>
      <p className="mt-1 text-sm text-white/50">Join as a buyer to license AI characters.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display name"
          required
          className="w-full rounded-xl border border-white/10 bg-ink-800/60 px-4 py-2.5 text-sm text-white outline-none focus:border-neon-400"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full rounded-xl border border-white/10 bg-ink-800/60 px-4 py-2.5 text-sm text-white outline-none focus:border-neon-400"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 8 chars)"
          minLength={8}
          required
          className="w-full rounded-xl border border-white/10 bg-ink-800/60 px-4 py-2.5 text-sm text-white outline-none focus:border-neon-400"
        />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-neon-500 py-2.5 text-sm font-semibold text-white hover:bg-neon-400 disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/50">
        Already have an account?{' '}
        <Link href="/login" className="text-neon-300 hover:text-neon-200">
          Sign in
        </Link>
      </p>
    </div>
  );
}
