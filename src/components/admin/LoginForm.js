'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm({ needsSetup }) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = needsSetup ? '/api/admin/auth/setup' : '/api/admin/auth/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      if (needsSetup) {
        // Account created — now log in automatically
        const loginRes = await fetch('/api/admin/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        if (!loginRes.ok) {
          setError('Account created. Please sign in.');
          setLoading(false);
          return;
        }
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 shadow-xl space-y-4">
      {needsSetup && (
        <div className="bg-lime-900/40 border border-lime-600 text-lime-300 text-sm px-3 py-2 rounded">
          First-time setup — create your admin account.
        </div>
      )}

      {error && (
        <div className="bg-red-900/40 border border-red-600 text-red-300 text-sm px-3 py-2 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm text-gray-300 mb-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoComplete="username"
          required
          className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-lime-500"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete={needsSetup ? 'new-password' : 'current-password'}
          required
          className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-lime-500"
        />
        {needsSetup && (
          <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-lime-600 hover:bg-lime-700 text-white font-medium py-2 rounded text-sm transition-colors disabled:opacity-50"
      >
        {loading ? 'Please wait…' : needsSetup ? 'Create Account & Sign In' : 'Sign In'}
      </button>
    </form>
  );
}
