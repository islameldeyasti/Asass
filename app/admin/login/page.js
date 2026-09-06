'use client';

import {useRouter} from 'next/navigation';
import {useState} from 'react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({password}),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Sign-in failed');
      }
      router.replace('/admin/team');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="adm-login">
      <form className="adm-card" onSubmit={onSubmit}>
        <h1>ASAS Admin</h1>
        <p>Sign in to manage Team content. Default local password is set via ADMIN_PASSWORD.</p>
        {error && <p className="adm-error">{error}</p>}
        <div className="adm-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <button className="adm-btn" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
