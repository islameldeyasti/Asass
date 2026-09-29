'use client';
import {adminText} from '@/lib/admin/translate';
import AdminLanguageSwitcher from '@/components/admin/ui/AdminLanguageSwitcher';
import {useState} from 'react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
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
        body: JSON.stringify({email, password}),
        credentials: 'same-origin',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Sign-in failed');
      }
      window.location.assign(data.redirectTo || '/admin/dashboard');
      return;
    } catch (err) {
      setError(err.message || 'Sign-in failed');
      setLoading(false);
    }
  }

  return (
    <div className="cms-login">
      <form className="cms-login-card" onSubmit={onSubmit}>
        <div className="cms-login-brand">
          <div className="cms-sidebar-logo" aria-hidden>{adminText("AS")}</div>
          <div>
            <strong>{adminText("ASAS")}</strong>
            <span>{adminText("Admin workspace")}</span>
          </div>
          <AdminLanguageSwitcher className="adm-lang-switch-login" />
        </div>

        <h1>{adminText("Sign in")}</h1>
        <p>{adminText("Use your admin account to continue.")}</p>

        {error ? <p className="cms-error">{adminText(error)}</p> : null}

        <div className="cms-field">
          <label htmlFor="email">{adminText("Email")}</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="cms-field">
          <label htmlFor="password">{adminText("Password")}</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <button className="cms-btn" type="submit" disabled={loading} style={{width: '100%'}}>
          {adminText(loading ? 'Signing in…' : 'Sign in')}
        </button>
      </form>
    </div>
  );
}
